import { execSync } from 'node:child_process';

execSync('node scripts/monetization/run-monthly-close.mjs', {
  cwd: process.cwd(),
  stdio: 'inherit',
});

execSync('node scripts/monetization/run-quarterly-close.mjs', {
  cwd: process.cwd(),
  stdio: 'inherit',
});

console.log('[monetization] close pipeline completed for monthly and quarterly scopes');
