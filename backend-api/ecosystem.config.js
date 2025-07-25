module.exports = {
  apps: [{
    name: 'muzikmusicplayer',
    script: 'server.js',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      FRONTEND_URL: 'https://muzik.development.id.vn'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2.error.log',
    out_file: './logs/pm2.out.log',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm Z'
  }],

  
};