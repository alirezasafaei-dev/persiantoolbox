import { run } from './runtime/index.js';
import { inspectPageGraph } from './document-inspection.mjs';

function collectNamedDestinations(catalog, resolve) {
  const legacy = resolve(catalog?.['/Dests']) ?? {};
  const nameDictionary = resolve(catalog?.['/Names']);
  const pending = [nameDictionary?.['/Dests']];
  const seen = new Set();
  const names = new Map();
  while (pending.length > 0) {
    const entry = pending.pop();
    if (!entry || seen.has(entry)) {
      continue;
    }
    seen.add(entry);
    const node = resolve(entry);
    const pairs = resolve(node?.['/Names']);
    if (Array.isArray(pairs)) {
      for (let index = 0; index + 1 < pairs.length; index += 2) {
        names.set(resolve(pairs[index]), pairs[index + 1]);
      }
    }
    const children = resolve(node?.['/Kids']);
    if (Array.isArray(children)) {
      // Visit leaves in the existing key order so a rebuilt root stays sorted.
      for (let index = children.length - 1; index >= 0; index -= 1) {
        pending.push(children[index]);
      }
    }
  }
  return { legacy, names, nameDictionary };
}

// Retained pages can still point to page objects that QPDF left outside the page tree.
async function rewritePageDestinations(bytes, normalizeNames) {
  const input = { 'subset.pdf': bytes };
  const { objects, pages } = await inspectPageGraph(bytes, {
    rejectSignatureMarkers: normalizeNames,
    changesPageSet: normalizeNames,
  });
  const retained = new Set(pages.map((page) => page.object));
  const patch = {};
  let hasPageDestinations = false;
  const isReference = (value) => typeof value === 'string' && /^\d+ \d+ R$/.test(value);
  const resolve = (value) => {
    if (isReference(value)) {
      return objects[`obj:${value}`]?.value;
    }
    return value;
  };
  const update = (ref, value) => {
    patch[`obj:${ref}`] = { value };
  };
  const catalogRef = objects.trailer.value['/Root'];
  const catalog = resolve(catalogRef);
  const { legacy, names, nameDictionary } = collectNamedDestinations(catalog, resolve);
  const destinationArray = (entry) => {
    const definition = resolve(entry);
    return resolve(Array.isArray(definition) ? definition : definition?.['/D']);
  };

  function rewriteNavigation(target) {
    const action = resolve(target['/A']);
    const direct = target['/Dest'];
    const destination = resolve(direct ?? (action?.['/S'] === '/GoTo' ? action['/D'] : null));
    hasPageDestinations ||= Array.isArray(destination);
    if (normalizeNames && typeof destination === 'string') {
      const definition = destination.startsWith('/') ? legacy[destination] : names.get(destination);
      const explicit = destinationArray(definition);
      if (Array.isArray(explicit) && retained.has(explicit[0])) {
        hasPageDestinations = true;
        return direct != null
          ? { ...target, '/Dest': explicit }
          : { ...target, '/A': { ...action, '/D': explicit } };
      }
    }
    if (!normalizeNames && Array.isArray(destination) && !retained.has(destination[0])) {
      return null;
    }
    return target;
  }

  const updatedCatalog = { ...catalog };
  let catalogChanged = false;
  const openAction = resolve(catalog?.['/OpenAction']);
  if (Array.isArray(openAction) || openAction?.['/S'] === '/GoTo') {
    const key = Array.isArray(openAction) ? '/Dest' : '/A';
    const original = { [key]: catalog['/OpenAction'] };
    const replacement = rewriteNavigation(original);
    if (replacement !== original) {
      catalogChanged = true;
      if (replacement) {
        updatedCatalog['/OpenAction'] = replacement[key];
      } else {
        delete updatedCatalog['/OpenAction'];
      }
    }
  }

  const legacyEntries = Object.entries(legacy);
  const survivesSelection = ([, definition]) => {
    const destination = destinationArray(definition);
    if (!Array.isArray(destination) || !isReference(destination[0])) {
      return true;
    }
    hasPageDestinations = true;
    return normalizeNames || retained.has(destination[0]);
  };
  const retainedLegacy = legacyEntries.filter(survivesSelection);
  const retainedNames = [...names].filter(survivesSelection);
  if (retainedLegacy.length !== legacyEntries.length) {
    catalogChanged = true;
    if (retainedLegacy.length > 0) {
      updatedCatalog['/Dests'] = Object.fromEntries(retainedLegacy);
    } else {
      delete updatedCatalog['/Dests'];
    }
  }
  if (retainedNames.length !== names.size) {
    catalogChanged = true;
    const updatedNames = { ...nameDictionary };
    if (retainedNames.length > 0) {
      updatedNames['/Dests'] = { '/Names': retainedNames.flat() };
    } else {
      delete updatedNames['/Dests'];
    }
    updatedCatalog['/Names'] = updatedNames;
  }
  if (catalogChanged) {
    update(catalogRef, updatedCatalog);
  }

  for (const { object: ref } of pages) {
    const page = resolve(ref);
    const annotations = resolve(page['/Annots']);
    if (!Array.isArray(annotations)) {
      continue;
    }
    let changed = false;
    const kept = annotations.flatMap((entry) => {
      const annotation = resolve(entry);
      if (annotation?.['/Subtype'] !== '/Link') {
        return [entry];
      }
      const replacement = rewriteNavigation(annotation);
      if (!replacement) {
        changed = true;
        return [];
      }
      if (replacement !== annotation) {
        if (isReference(entry)) {
          update(entry, replacement);
        } else {
          changed = true;
          return [replacement];
        }
      }
      return [entry];
    });
    if (changed) {
      update(ref, { ...page, '/Annots': kept });
    }
  }

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
    const replacement = rewriteNavigation(bookmark);
    if (!replacement) {
      const heading = { ...bookmark };
      delete heading['/Dest'];
      delete heading['/A'];
      update(ref, heading);
    } else if (replacement !== bookmark) {
      update(ref, replacement);
    }
  }

  if (Object.keys(patch).length === 0) {
    return { bytes, hasPageDestinations };
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
  return { bytes: repair.files['repaired.pdf'], hasPageDestinations };
}

export const preparePageDestinations = (bytes) => rewritePageDestinations(bytes, true);

export async function removeDiscardedPageDestinations(bytes) {
  return (await rewritePageDestinations(bytes, false)).bytes;
}
