import { copyFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const dist = path.dirname(require.resolve('@arshad-shah/qpdf-wasm'));
const target = path.resolve('public/pdf-engine/v1/runtime');
mkdirSync(target, { recursive: true });

for (const file of ['index.js', 'qpdf.js', 'qpdf.wasm']) {
  copyFileSync(path.join(dist, file), path.join(target, file));
}
for (const file of ['LICENSE', 'THIRD_PARTY_LICENSES']) {
  copyFileSync(path.join(dist, '..', file), path.join(target, file + '.txt'));
}
