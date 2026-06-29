module.exports = {
  apps: [
    {
      name: 'persiantoolbox-telegram-bot',
      script: 'bot.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env: {
        TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ?? '',
        SITE_URL: 'https://persiantoolbox.ir',
      },
      error_file: '/home/ubuntu/.pm2/logs/telegram-bot-error.log',
      out_file: '/home/ubuntu/.pm2/logs/telegram-bot-out.log',
      merge_logs: true,
      max_restarts: 10,
      restart_delay: 5000,
    },
  ],
};
