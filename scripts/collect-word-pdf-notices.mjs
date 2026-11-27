import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const [source, registry, tree, output] = process.argv.slice(2);
const notices = [
  'OpenDoc preview, based on CasualOffice OpenDoc revision 9177548903e1546f64061b914598a840e1cfa042.',
  'PersianToolbox modifies field layout, bidirectional width measurement, Arabic fallback spacing and ZIP admission limits.',
  'See LICENSE and NOTICE for upstream terms and attribution.',
];

async function append(label, path) {
  const body = (await readFile(path, 'utf8')).replaceAll('\r\n', '\n').trimEnd();
  if (!body) throw new Error(`Empty license notice: ${label}`);
  notices.push(`--- ${label} ---\n${body}`);
}

await append(
  'ECMA-376 preset shape data',
  join(source, 'crates/casual-doc-model/data/LICENSE-ECMA-376.txt'),
);
const fontNotices = join(source, 'crates/casual-doc-layout/fonts/LICENSES');
for (const file of (await readdir(fontNotices)).sort()) {
  await append(`OpenDoc fonts: ${file}`, join(fontNotices, file));
}

const crates = new Map();
for (const line of (await readFile(tree, 'utf8')).trim().split(/\r?\n/)) {
  const match =
    /^([\w-]+) v([^\s|]+)(?: \(proc-macro\))?(?: \(([^)]+)\))?\|(.+?)(?: \(\*\))?$/.exec(line);
  if (!match) throw new Error(`Unexpected Cargo tree row: ${line}`);
  const [, name, version, local, license] = match;
  if (!local) crates.set(`${name}-${version}`, license.trim());
}
if (crates.size === 0) throw new Error('Cargo dependency inventory is empty');

const registries = await readdir(registry, { withFileTypes: true });
for (const [crate, license] of [...crates].sort(([a], [b]) => (a < b ? -1 : a === b ? 0 : 1))) {
  const candidates = registries.filter((entry) => entry.isDirectory());
  const matches = await Promise.all(
    candidates.map(async ({ name }) => {
      const directory = join(registry, name, crate);
      try {
        return { directory, files: await readdir(directory, { withFileTypes: true }) };
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
        return null;
      }
    }),
  );
  const found = matches.filter(Boolean);
  if (found.length !== 1) throw new Error(`Expected one Cargo source directory for ${crate}`);
  const [{ directory, files }] = found;
  const licenseFiles = files
    .filter(
      (entry) =>
        entry.isFile() &&
        /^(license|copying|copyright|notice|unlicense)(?:$|[-_.])/i.test(entry.name),
    )
    .map((entry) => entry.name)
    .sort();
  if (!licenseFiles.length) throw new Error(`Missing license files for ${crate}`);
  for (const file of licenseFiles) {
    await append(`${crate} (${license}): ${file}`, join(directory, file));
  }
}

await writeFile(output, notices.join('\n\n') + '\n');
console.log(`Collected license texts for ${crates.size} locked Cargo dependencies.`);
