#!/usr/bin/env node
/**
 * Read-only staging verification script.
 * Never touches production. Safe to run from anywhere.
 * Usage: node scripts/verify-staging.mjs
 */

import https from 'https';
import tls from 'tls';
import dns from 'dns/promises';
import { URL } from 'url';

const STAGING_HOST = 'staging.persiantoolbox.ir';
const PRODUCTION_HOST = 'persiantoolbox.ir';
const TIMEOUT = 10000;

function logOk(msg) { console.log(`✅ ${msg}`); }
function logFail(msg) { console.error(`❌ ${msg}`); }
function logWarn(msg) { console.warn(`⚠️  ${msg}`); }

async function checkDns() {
  console.log('\n=== DNS Resolution ===');
  try {
    const addresses = await dns.resolve4(STAGING_HOST);
    logOk(`DNS: ${STAGING_HOST} resolves to ${addresses.join(', ')}`);
    return true;
  } catch (e) {
    logFail(`DNS resolution failed for ${STAGING_HOST}: ${e.message}`);
    return false;
  }
}

async function checkTls() {
  console.log('\n=== TLS Certificate ===');
  return new Promise((resolve) => {
    const options = {
      host: STAGING_HOST,
      port: 443,
      servername: STAGING_HOST,
      timeout: TIMEOUT,
    };
    const socket = tls.connect(options, () => {
      const cert = socket.getPeerCertificate();
      const subject = cert.subject?.CN || 'unknown';
      const san = cert.subjectaltname || 'none';
      const issuer = cert.issuer?.CN || 'unknown';
      console.log(`Subject: ${subject}`);
      console.log(`SAN: ${san}`);
      console.log(`Issuer: ${issuer}`);
      if (subject.includes('staging') || san.includes(STAGING_HOST)) {
        logOk('TLS: Certificate subject/SAN matches staging host');
      } else {
        logFail(`TLS: Certificate mismatch! Subject=${subject} SAN=${san} (expected ${STAGING_HOST})`);
        logWarn('Likely cause: wrong cert or staging subdomain not properly configured in certbot/nginx.');
      }
      socket.end();
      resolve(true);
    });
    socket.on('error', (e) => {
      logFail(`TLS connection failed: ${e.message}`);
      resolve(false);
    });
    socket.setTimeout(TIMEOUT, () => {
      logFail('TLS timeout');
      socket.destroy();
      resolve(false);
    });
  });
}

function httpGet(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { timeout: TIMEOUT }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', (e) => resolve({ error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ error: 'timeout' }); });
  });
}

async function checkHttp() {
  console.log('\n=== HTTP Checks ===');
  const base = `https://${STAGING_HOST}`;
  const checks = [
    { url: `${base}/`, name: 'Homepage' },
    { url: `${base}/api/health`, name: 'Health' },
    { url: `${base}/api/version`, name: 'Version' },
    { url: `${base}/loan`, name: 'Loan page' },
  ];
  let allOk = true;
  for (const c of checks) {
    const res = await httpGet(c.url);
    if (res.error) {
      logFail(`${c.name}: ${res.error}`);
      allOk = false;
    } else if (res.status === 200) {
      logOk(`${c.name}: HTTP ${res.status}`);
    } else {
      logFail(`${c.name}: HTTP ${res.status}`);
      allOk = false;
    }
  }
  return allOk;
}

async function checkAssets() {
  console.log('\n=== Asset Checks ===');
  const base = `https://${STAGING_HOST}`;
  // Check CSS from homepage
  const home = await httpGet(`${base}/`);
  let cssOk = false;
  if (home.body) {
    const cssMatch = home.body.match(/href="([^"]+\.css)"/);
    if (cssMatch) {
      const cssUrl = new URL(cssMatch[1], base).toString();
      const cssRes = await httpGet(cssUrl);
      if (cssRes.status === 200) {
        logOk(`CSS: ${cssUrl} -> ${cssRes.status}`);
        cssOk = true;
      } else {
        logFail(`CSS: ${cssUrl} -> ${cssRes.status || cssRes.error}`);
      }
    }
  }
  if (!cssOk) logWarn('Could not verify CSS from homepage');

  // Font
  const fontUrl = `${base}/fonts/Vazirmatn-Bold.woff2`;
  const fontRes = await httpGet(fontUrl);
  if (fontRes.status === 200) logOk(`Font: ${fontUrl} -> 200`);
  else logFail(`Font: ${fontUrl} -> ${fontRes.status || fontRes.error}`);

  // PDF worker
  const workerUrl = `${base}/pdf.worker.min.mjs`;
  const workerRes = await httpGet(workerUrl);
  if (workerRes.status === 200) logOk(`PDF worker: ${workerUrl} -> 200`);
  else logFail(`PDF worker: ${workerUrl} -> ${workerRes.status || workerRes.error}`);

  return true;
}

async function main() {
  console.log('=== PersianToolbox Staging Verification (READ-ONLY) ===');
  console.log(`Target: https://${STAGING_HOST}`);
  console.log('This script performs only safe read-only checks.\n');

  await checkDns();
  await checkTls();
  await checkHttp();
  await checkAssets();

  console.log('\n=== Summary ===');
  console.log('If any TLS/SSL errors, staging subdomain likely lacks proper cert.');
  console.log('Use the staging restore runbook for remediation steps.');
  console.log('Do not use this script against production.');
}

main().catch(e => { console.error(e); process.exit(1); });
