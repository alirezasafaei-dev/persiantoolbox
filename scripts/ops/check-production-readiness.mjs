#!/usr/bin/env node
const BASE = process.argv.includes('--base-url')
  ? process.argv[process.argv.indexOf('--base-url') + 1]
  : 'https://persiantoolbox.ir';

const checks = [
  { name: 'Homepage', path: '/' },
  { name: 'Health', path: '/api/health' },
  { name: 'Ready', path: '/api/ready' },
  { name: 'Version', path: '/api/version' },
  { name: 'robots.txt', path: '/robots.txt' },
  { name: 'sitemap.xml', path: '/sitemap.xml' },
  { name: 'Blog', path: '/blog' },
  { name: 'Account', path: '/account' },
  { name: 'Finance Hub', path: '/tools' },
  { name: 'RSS Feed', path: '/feed.xml' },
];

let pass = 0, fail = 0;
for (const check of checks) {
  try {
    const res = await fetch(`${BASE}${check.path}`, { signal: AbortSignal.timeout(15000) });
    if (res.ok) { console.log(`  ✅ ${check.name} (${res.status})`); pass++; }
    else { console.log(`  ❌ ${check.name} (${res.status})`); fail++; }
  } catch (e) { console.log(`  ❌ ${check.name} (${e.message})`); fail++; }
}
console.log(`\nResults: ${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
