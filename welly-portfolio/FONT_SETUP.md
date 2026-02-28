# Install Gibed Font

Font utama telah diubah menjadi "Gibed". File font telah diupload ke folder `frontend/public/fonts/`.

## Setup Selesai

1. **File font:**
   - `gibed.otf` - sudah tersimpan di folder `frontend/public/fonts/`

2. **Struktur folder:**
```
welly-portfolio/
└── frontend/
    └── public/
        └── fonts/
            └── gibed.otf
```

3. **Jalankan development server:**
```bash
cd frontend
npm install  # jika belum
npm run dev
```

Font Gibed akan otomatis dimuat dan digunakan di seluruh website: navbar, headings, body text, input fields, buttons, dan semua elemen UI.

## Catatan:
- Jika ingin menambahkan font weight atau style lainnya, upload file font tambahan ke `frontend/public/fonts/` dan update `fonts.css`
- Font Gibed saat ini dikonfigurasi dengan font-weight 400 (regular)
- Font akan digunakan di seluruh website sebagai font utama
