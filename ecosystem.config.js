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

const appDir = process.env.PERSIANTOOLBOX_APP_DIR || __dirname;
const port = process.env.PORT || '3000';
const processName = process.env.PM2_PROCESS_NAME || 'persiantoolbox';

const env = {
  ...loadEnv(path.join(appDir, '.env')),
  ...loadEnv(path.join(appDir, '.env.release')),
};
env.PORT = port;
// Production must never inherit Node inspector (Debugger listening → hung process / 502).
if (env.NODE_OPTIONS) {
  env.NODE_OPTIONS = String(env.NODE_OPTIONS)
    .replace(/(^|\s)--inspect(-brk|-port)?(=\S*)?/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!env.NODE_OPTIONS) delete env.NODE_OPTIONS;
}
if (process.env.NODE_OPTIONS) {
  const scrubbed = String(process.env.NODE_OPTIONS)
    .replace(/(^|\s)--inspect(-brk|-port)?(=\S*)?/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (scrubbed) env.NODE_OPTIONS = scrubbed;
  else delete env.NODE_OPTIONS;
}
if (process.env.HOSTNAME) env.HOSTNAME = process.env.HOSTNAME;
if (process.env.PORT) env.PORT = process.env.PORT;

module.exports = {
  apps: [
    {
      name: processName,
      script: '.next/standalone/server.js',
      cwd: appDir,
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
