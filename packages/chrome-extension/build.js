const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ICONS_DIR = path.join(__dirname, 'icons');
const SVG_PATH = path.join(ICONS_DIR, 'icon.svg');
const SIZES = [16, 48, 128];
const ZIP_NAME = 'persiantoolbox-extension.zip';

async function generateIcons() {
  const svg = fs.readFileSync(SVG_PATH, 'utf-8');
  for (const size of SIZES) {
    const out = path.join(ICONS_DIR, `icon-${size}.png`);
    await sharp(Buffer.from(svg)).resize(size, size).png().toFile(out);
    console.log(`  ✓ icon-${size}.png`);
  }
}

async function build() {
  console.log('Building PersianToolbox Chrome Extension...\n');

  console.log('1. Generating PNG icons...');
  await generateIcons();

  console.log('2. Creating zip...');
  const zipPath = path.join(__dirname, ZIP_NAME);
  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
  execSync(
    `zip -j "${zipPath}" "${path.join(__dirname, 'manifest.json')}" "${path.join(__dirname, 'popup.html')}" "${path.join(__dirname, 'popup.js')}" "${path.join(__dirname, 'popup.css')}" "${path.join(__dirname, 'content.js')}" "${path.join(__dirname, 'content.css')}" ${SIZES.map((s) => `"${path.join(ICONS_DIR, `icon-${s}.png`)}"`).join(' ')}`,
    { stdio: 'inherit' },
  );

  const stats = fs.statSync(zipPath);
  console.log(`\nDone! ${ZIP_NAME} (${(stats.size / 1024).toFixed(1)} KB)`);
}

build().catch(console.error);
