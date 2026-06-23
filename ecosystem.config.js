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

const env = loadEnv(path.join(__dirname, '.env'));
env.PORT = '3000';

module.exports = {
  apps: [
    {
      name: 'persiantoolbox',
      script: '.next/standalone/server.js',
      cwd: '/home/ubuntu/persiantoolbox',
      env: env,
      max_memory_restart: '314572800',
      node_args: '--max-old-space-size=300',
    },
  ],
};
