import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const workerPackage = require.resolve('tesseract.js/package.json');
const workerRoot = path.dirname(workerPackage);
const coreRoot = path.dirname(
  createRequire(workerPackage).resolve('tesseract.js-core/package.json'),
);
const publicRoot = path.resolve(process.argv[2] ?? 'public');
const target = path.join(publicRoot, 'ocr/v7');
fs.mkdirSync(path.join(target, 'core'), { recursive: true });
fs.mkdirSync(path.join(target, 'lang'), { recursive: true });
fs.copyFileSync(path.join(workerRoot, 'dist/worker.min.js'), path.join(target, 'worker.min.js'));
fs.copyFileSync(path.join(workerRoot, 'LICENSE.md'), path.join(target, 'LICENSE-tesseract.txt'));
fs.copyFileSync(path.join(coreRoot, 'LICENSE'), path.join(target, 'LICENSE-core-and-tessdata.txt'));
for (const file of fs.readdirSync(coreRoot)) {
  if (/^tesseract-core.*\.wasm(?:\.js)?$/.test(file)) {
    fs.copyFileSync(path.join(coreRoot, file), path.join(target, 'core', file));
  }
}
const packages = [JSON.parse(fs.readFileSync(workerPackage, 'utf8'))];
for (const lang of ['fas', 'eng']) {
  const manifest = require.resolve(`@tesseract.js-data/${lang}/package.json`);
  packages.push(JSON.parse(fs.readFileSync(manifest, 'utf8')));
  fs.copyFileSync(
    path.join(path.dirname(manifest), '4.0.0_best_int', `${lang}.traineddata.gz`),
    path.join(target, 'lang', `${lang}.traineddata.gz`),
  );
}
fs.writeFileSync(
  path.join(target, 'NOTICE.txt'),
  [
    'Unmodified OCR runtime and language data for local browser processing.',
    'Tesseract.js and Tesseract.js-core: Apache-2.0; license copies are included.',
    'Language data upstream: https://github.com/naptha/tessdata (Apache-2.0).',
    ...packages.map(
      ({ name, version, license, author }) =>
        `${name}@${version}; npm package license=${license}; author=${typeof author === 'string' ? author : (author?.name ?? '')}`,
    ),
  ].join('\n') + '\n',
);
console.log('[ocr-assets] assembled same-origin worker, core variants and fas/eng data');
