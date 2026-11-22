import { run } from './runtime/index.js';

// Retained pages can still point to page objects that QPDF left outside the page tree.
export async function removeDiscardedPageDestinations(bytes) {
  const input = { 'subset.pdf': bytes };
  const inspection = await run(
    ['--json=2', '--json-stream-data=none', '--json-key=qpdf', '--json-key=pages', 'subset.pdf'],
    input,
  );
  if (inspection.exitCode !== 0) {
    throw new Error('بررسی پیوندهای داخلی فایل خروجی ناموفق بود.');
  }

  const { pages, qpdf } = JSON.parse(inspection.stdout);
  const objects = qpdf[1];
  const retained = new Set(pages.map((page) => page.object));
  const patch = {};
  const resolve = (value) => {
    if (typeof value === 'string' && /^\d+ \d+ R$/.test(value)) {
      return objects[`obj:${value}`]?.value;
    }
    return value;
  };
  const update = (ref, value) => {
    patch[`obj:${ref}`] = { value };
  };

  function removedDestination(target) {
    const action = resolve(target['/A']);
    const destination = resolve(
      target['/Dest'] ?? (action?.['/S'] === '/GoTo' ? action['/D'] : null),
    );
    return Array.isArray(destination) && !retained.has(destination[0]);
  }

  for (const { object: ref } of pages) {
    const page = resolve(ref);
    const annotations = resolve(page['/Annots']);
    if (!Array.isArray(annotations)) {
      continue;
    }
    const kept = annotations.filter((entry) => {
      const annotation = resolve(entry);
      return annotation?.['/Subtype'] !== '/Link' || !removedDestination(annotation);
    });
    if (kept.length !== annotations.length) {
      update(ref, { ...page, '/Annots': kept });
    }
  }

  const catalog = resolve(objects.trailer.value['/Root']);
  const outlines = resolve(catalog?.['/Outlines']);
  const bookmarks = [outlines?.['/First']];
  const visited = new Set();
  while (bookmarks.length > 0) {
    const ref = bookmarks.pop();
    if (typeof ref !== 'string' || visited.has(ref)) {
      continue;
    }
    visited.add(ref);
    const bookmark = resolve(ref);
    if (!bookmark) {
      continue;
    }
    bookmarks.push(bookmark['/Next'], bookmark['/First']);
    if (removedDestination(bookmark)) {
      const heading = { ...bookmark };
      delete heading['/Dest'];
      delete heading['/A'];
      update(ref, heading);
    }
  }

  if (Object.keys(patch).length === 0) {
    return bytes;
  }
  const repair = await run(['subset.pdf', 'repaired.pdf', '--update-from-json=destinations.json'], {
    ...input,
    'destinations.json': new TextEncoder().encode(
      JSON.stringify({ qpdf: [{ jsonversion: 2 }, patch] }),
    ),
  });
  if (repair.exitCode !== 0 || !repair.files['repaired.pdf']) {
    throw new Error('اصلاح پیوندهای داخلی فایل خروجی ناموفق بود.');
  }
  return repair.files['repaired.pdf'];
}
