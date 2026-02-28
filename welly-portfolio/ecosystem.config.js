module.exports = {
  apps: [
    {
      name: "welly-backend",
      script: "./backend/server.js",
      cwd: "/www/wwwroot/cwell.my.id/myproject/welly-portfolio",
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
      instances: 1,
      autorestart: true,
      watch: false,
    },
  ],
};
