const fs = require('fs');
const path = require('path');

function loadEnv(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const env = {};
    content.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) return;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      env[key] = val;
    });
    return env;
  } catch {
    return {};
  }
}

const env = {
  ...loadEnv(path.join(__dirname, '.env')),
  ...loadEnv(path.join(__dirname, '.env.release')),
};
env.PORT = '3000';

module.exports = {
  apps: [
    {
      name: 'persiantoolbox',
      script: '.next/standalone/server.js',
      cwd: '/home/ubuntu/persiantoolbox',
      env: env,
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 20,
      restart_delay: 2000,
      kill_timeout: 5000,
      listen_timeout: 30000,
      error_file: '/home/ubuntu/.pm2/logs/persiantoolbox-error.log',
      out_file: '/home/ubuntu/.pm2/logs/persiantoolbox-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      watch: false,
    },
  ],
};
