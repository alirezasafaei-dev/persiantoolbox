import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

const source = process.argv[2];
if (!source) throw new Error('Supply the verified, patched OpenDoc viewer directory.');

// OpenDoc 91775489, Rust 1.96.0, wasm-bindgen 0.2.129, guarded RTL build.
const assets = {
  'src/index.js': '8c5af9ad8138648daaf914f91ea72eb2ff5dcaac7ca15c0ffda37b0e66f1af18',
  'pkg/opendoc_viewer.js': '0370cc66d10dcabb7fa458f2ea997124d7a8b3ef323cf80e13f7d737b989197a',
  'pkg/opendoc_viewer_bg.wasm': 'b05f93f327fe7709258c4cf4bd02356e830c9beb36037829b4114c9b67ae35a5',
  LICENSE: 'c71d239df91726fc519c6eb72d318ec65820627232b2f796219e87dcf35d0ab4',
  NOTICE: '7885e537500ca31a3abdead472d2c061367cf981d47950751fd8ec8269286484',
};
const verified = await Promise.all(
  Object.entries(assets).map(async ([file, expected]) => {
    const bytes = await readFile(join(source, file));
    if (createHash('sha256').update(bytes).digest('hex') !== expected) {
      throw new Error(`OpenDoc preview asset failed verification: ${file}`);
    }
    return { file, bytes };
  }),
);
const target = resolve('public/word-pdf/v1/runtime');
for (const { file, bytes } of verified) {
  const output = join(target, file);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, bytes);
}
console.log(`Verified and staged ${verified.length} OpenDoc preview assets.`);
