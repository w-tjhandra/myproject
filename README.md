# 🚀 Welly Portfolio — Deploy Guide (Ubuntu VPS)

## Struktur Project
```
welly-portfolio/
├── backend/          ← Node.js + Express + PostgreSQL
│   ├── server.js
│   ├── db.js
│   ├── middleware.js
│   └── .env
├── frontend/         ← React + Vite
│   ├── src/
│   └── dist/         ← hasil build (generated)
├── nginx/
│   └── welly.conf
└── ecosystem.config.js
```

---

## LANGKAH 1 — Siapkan VPS

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx & PM2
sudo apt install -y nginx
sudo npm install -g pm2

# Install build tools (untuk node-postgres / native addons jika perlu)
sudo apt install -y build-essential python3

# Install & Setup PostgreSQL (karena kita sudah tidak memakai SQLite)
sudo apt install -y postgresql postgresql-contrib
sudo -u postgres psql -c "CREATE DATABASE myporto;"
sudo -u postgres psql -c "CREATE USER chandra WITH PASSWORD 'ch4ndr4';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE myporto TO chandra;"
sudo -u postgres psql -d myporto -c "GRANT ALL ON SCHEMA public TO chandra;"
```

---

## LANGKAH 2 — Upload Project ke VPS

```bash
# Di lokal, zip project
zip -r welly-portfolio.zip welly-portfolio/

# Upload ke VPS (ganti user@IP dengan VPS kamu)
scp welly-portfolio.zip user@123.456.789.0:/var/www/

# Di VPS, extract
cd /var/www
sudo unzip welly-portfolio.zip
sudo chown -R $USER:$USER welly-portfolio
```

---

## LANGKAH 3 — Setup Backend

```bash
cd /var/www/welly-portfolio/backend

# Install dependencies
npm install

# Buat file .env dari template
cp .env.example .env
nano .env
# Sesuaikan isi .env kamu:
# PORT=4000
# JWT_SECRET=super-secret-key-12345
# FRONTEND_URL=https://yourdomain.com
# DB_USER=chandra
# DB_PASSWORD=ch4ndr4
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=myporto
```

---

## LANGKAH 4 — Build Frontend

```bash
cd /var/www/welly-portfolio/frontend

# Install dependencies
npm install

# Buat .env.production (opsional, jika domain berbeda)
echo "VITE_API_URL=" > .env.production

# Build
npm run build
# Hasil build ada di ./dist/
```

---

## LANGKAH 5 — Setup Nginx

```bash
# Copy config
sudo cp /var/www/welly-portfolio/nginx/welly.conf /etc/nginx/sites-available/welly

# Edit domain di config
sudo nano /etc/nginx/sites-available/welly
# Ganti: server_name yourdomain.com www.yourdomain.com;

# Aktifkan
sudo ln -s /etc/nginx/sites-available/welly /etc/nginx/sites-enabled/
sudo nginx -t        # test config
sudo systemctl reload nginx
```

---

## LANGKAH 6 — Jalankan Backend dengan PM2

```bash
cd /var/www/welly-portfolio

# Start backend
pm2 start ecosystem.config.js

# Auto-start saat reboot
pm2 startup
pm2 save
```

---

## LANGKAH 7 — Buat Akun Admin

Buka terminal dan jalankan:
```bash
curl -X POST http://localhost:4000/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"username":"welly","password":"passwordkamu123"}'
```

Atau dari browser setelah deploy:
```
POST https://yourdomain.com/api/auth/setup
Body: {"username":"welly","password":"passwordkamu123"}
```

⚠️ **Endpoint ini hanya bisa dipanggil SEKALI.** Setelah admin dibuat, tidak bisa lagi.

---

## LANGKAH 8 — Akses Admin Dashboard

Buka browser:
```
https://yourdomain.com/admin
```
Login dengan username & password yang dibuat di langkah 7.

---

## SSL (HTTPS) — Pakai Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo systemctl reload nginx
```

---

## Update Website

```bash
# Upload file baru, lalu:
cd /var/www/welly-portfolio/frontend
npm run build

# Backend (jika ada perubahan):
pm2 restart welly-backend
```

---

## Backup Database

```bash
# Backup PostgreSQL database
pg_dump -U postgres myporto > ~/backup-$(date +%Y%m%d).sql
```

---

## Troubleshooting

```bash
# Lihat log backend
pm2 logs welly-backend

# Status PM2
pm2 status

# Test backend langsung
curl http://localhost:4000/api/profile

# Reload nginx
sudo systemctl reload nginx

# Cek nginx error
sudo tail -f /var/log/nginx/error.log
```
