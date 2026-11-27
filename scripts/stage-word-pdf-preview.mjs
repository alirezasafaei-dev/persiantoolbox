import { createHash } from 'node:crypto';
import { lstat, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

const target = resolve('public/word-pdf/v1/runtime');
const argument = process.argv[2];
const check = argument === '--check';
if (!argument) throw new Error('Supply the verified, patched OpenDoc viewer directory.');
if (check && process.env.NEXT_PUBLIC_WORD_PDF_PREVIEW !== '1') {
  const stagedRuntime = await lstat(target).catch((error) => {
    if (error.code !== 'ENOENT') throw error;
  });
  if (stagedRuntime) {
    console.error(
      'An OpenDoc runtime is staged in public/word-pdf/v1/runtime. Move it outside public before building with the preview disabled.',
    );
    process.exit(1);
  }
  process.exit(0);
}
const source = check ? target : argument;

function verifyHash(file, bytes, expected) {
  if (createHash('sha256').update(bytes).digest('hex') !== expected) {
    throw new Error(`OpenDoc preview asset ${file} failed verification`);
  }
}

if (check) {
  // These tracked assets are served outside the generated runtime directory.
  const fallbackAssets = {
    'public/fonts/Vazirmatn-Regular.ttf':
      'b69fd4c680b8f3f225feabcc655a2c585d97627b8f5f5c0f9985e894069f3a56',
    'public/fonts/OFL-Vazirmatn.txt':
      'e6f4ce7b6c830d5a25a4f8ac777c267cd7d3c180bc2a7150ca57cbb9b280c4b7',
  };
  for (const [file, expected] of Object.entries(fallbackAssets)) {
    verifyHash(file, await readFile(file), expected);
  }
}

// OpenDoc 91775489, Rust 1.96.0, wasm-bindgen 0.2.129, bounded RTL build.
const assets = {
  'src/index.js': '8c5af9ad8138648daaf914f91ea72eb2ff5dcaac7ca15c0ffda37b0e66f1af18',
  'pkg/opendoc_viewer.js': '0370cc66d10dcabb7fa458f2ea997124d7a8b3ef323cf80e13f7d737b989197a',
  'pkg/opendoc_viewer_bg.wasm': '043c545c1ffa6e1f5d772e3588ab54b6d107554700a3762f6ddc128b95e4960f',
  LICENSE: 'c71d239df91726fc519c6eb72d318ec65820627232b2f796219e87dcf35d0ab4',
  NOTICE: '7885e537500ca31a3abdead472d2c061367cf981d47950751fd8ec8269286484',
  'THIRD_PARTY_LICENSES.txt': 'c03fca2ddb73799db6ab059991416bf524b98bf45a04d12c1e9141db9c2f5a10',
  'RUST_STD_COPYRIGHT.html': '78c163fcec50e64bfd85fedb850c273595602fafa2b41f30f75d4e410b80ee83',
};
const verified = await Promise.all(
  Object.entries(assets).map(async ([file, expected]) => {
    const bytes = await readFile(join(source, file)).catch((error) => {
      if (check && error.code === 'ENOENT') {
        throw new Error(
          `Missing OpenDoc preview asset: ${file}. Run scripts/stage-word-pdf-preview.mjs first.`,
        );
      }
      throw error;
    });
    verifyHash(file, bytes, expected);
    return { file, bytes };
  }),
);
if (!check) {
  for (const { file, bytes } of verified) {
    const output = join(target, file);
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, bytes);
  }
}
console.log(
  `${check ? 'Verified' : 'Verified and staged'} ${verified.length} OpenDoc preview assets.`,
);
