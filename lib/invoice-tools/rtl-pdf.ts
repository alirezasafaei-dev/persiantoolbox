import fontkit, { type Font, type GlyphRun } from '@pdf-lib/fontkit';
import bidiFactory from 'bidi-js';
import type { PDFDocument } from 'pdf-lib';
import {
  PDFArray,
  PDFDict,
  PDFHexString,
  PDFName,
  type PDFPage,
  beginText,
  endText,
  setFontAndSize,
  setTextMatrix,
  showText,
  setFillingRgbColor,
  type RGB,
} from 'pdf-lib';

const bidi = bidiFactory();
const graphemes = new Intl.Segmenter('fa', { granularity: 'grapheme' });
const variationSelector = (point: number) =>
  (point >= 0xfe00 && point <= 0xfe0f) || (point >= 0xe0100 && point <= 0xe01ef);
// Ignore user bidi formatting overrides. Keep joining controls, marks and ordinary Unicode.
export const invoiceText = (text: string) =>
  text.replace(/[\u061c\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, '');
const hexId = (id: number) => id.toString(16).padStart(4, '0');
type PositionedGlyph = {
  id: number;
  unicode: string;
  x: number;
  y: number;
  advance: number;
  width: number;
  run: number;
};
type Line = { glyphs: PositionedGlyph[]; width: number };

function shape(font: Font, input: string, onMissingGlyph?: (text: string) => void): Line {
  const text = invoiceText(input);
  if (!text) {
    return { glyphs: [], width: 0 };
  }
  const embedding = bidi.getEmbeddingLevels(text, 'rtl');
  const visualOrder = bidi.getReorderedIndices(text, embedding);
  const visualPositions = new Map(visualOrder.map((logical, visual) => [logical, visual]));
  const runs: { text: string; start: number; level: number; visual: number }[] = [];
  let index = 0;
  // Iterate code points, keeping UTF-16 offsets only for the bidi engine's indexing API.
  for (const character of text) {
    const level = embedding.levels[index] ?? 1;
    let run = runs.at(-1);
    if (!run || run.level !== level) {
      run = { text: '', start: index, level, visual: Infinity };
      runs.push(run);
    }
    run.text += character;
    run.visual = Math.min(run.visual, visualPositions.get(index) ?? index);
    index += character.length;
  }
  const glyphs: PositionedGlyph[] = [];
  let x = 0;
  for (const run of runs.sort((a, b) => a.visual - b.visual)) {
    const characters: string[] = [];
    const shapingCharacters: string[] = [];
    for (const { segment } of graphemes.segment(run.text)) {
      const points = Array.from(segment);
      const unsupported =
        variationSelector(points[0]?.codePointAt(0) ?? 0) ||
        points.some((character) => {
          const point = character.codePointAt(0) ?? 0;
          // Joining/variation controls affect the preceding grapheme without needing their own outline.
          if (point === 0x200c || point === 0x200d || variationSelector(point)) {
            return false;
          }
          return font.glyphForCodePoint(point).id === 0;
        });
      if (unsupported) {
        onMissingGlyph?.(segment);
        shapingCharacters.push('\ufffd');
        characters.push(segment);
      } else {
        for (const character of points) {
          if (variationSelector(character.codePointAt(0) ?? 0)) {
            const previous = characters.length - 1;
            characters[previous] = (characters[previous] ?? '') + character;
            continue;
          }
          shapingCharacters.push(
            run.level % 2 ? (bidi.getMirroredCharacter(character) ?? character) : character,
          );
          characters.push(character);
        }
      }
    }
    // This installed fontkit version supports direction, though its bundled TS declaration omits it.
    const layout = font.layout.bind(font) as (
      text: string,
      features: string[],
      script: undefined,
      language: undefined,
      direction: 'rtl' | 'ltr',
    ) => GlyphRun;
    const shaped = layout(
      shapingCharacters.join(''),
      [],
      undefined,
      undefined,
      run.level % 2 ? 'rtl' : 'ltr',
    );
    const logicalGlyphs = shaped.glyphs.map((glyph, i) => ({ glyph, index: i }));
    if (run.level % 2) {
      logicalGlyphs.reverse();
    }
    let cursor = 0;
    const unicode = new Map<number, string>();
    for (const entry of logicalGlyphs) {
      const length = entry.glyph.codePoints.length;
      const cluster = characters.slice(cursor, cursor + length);
      unicode.set(entry.index, (run.level % 2 ? cluster.reverse() : cluster).join(''));
      cursor += length;
    }
    if (cursor !== characters.length) {
      throw new Error('Unsupported invoice font cluster mapping');
    }
    for (const [i, glyph] of shaped.glyphs.entries()) {
      const position = shaped.positions[i];
      if (!position) {
        throw new Error('Missing invoice glyph position');
      }
      const glyphUnicode = unicode.get(i) ?? '';
      const visibleGlyph = glyph.id === 0 ? font.glyphForCodePoint(0xfffd) : glyph;
      if (glyph.id === 0) {
        onMissingGlyph?.(unicode.get(i) ?? '');
      }
      const advance = glyph.id === 0 ? visibleGlyph.advanceWidth : position.xAdvance;
      glyphs.push({
        id: visibleGlyph.id,
        unicode: glyphUnicode,
        x: x + position.xOffset,
        y: position.yOffset,
        advance,
        width: visibleGlyph.advanceWidth,
        run: run.start,
      });
      x += advance;
    }
  }
  return { glyphs, width: x };
}

export async function createInvoiceFont(
  doc: PDFDocument,
  bytes: Uint8Array,
  onMissingGlyph?: (text: string) => void,
) {
  doc.registerFontkit(fontkit);
  // Full embedding is required: the custom CID map below points at original glyph IDs.
  const embedded = await doc.embedFont(bytes, { subset: false });
  const font = fontkit.create(bytes);
  const reference = doc.context.nextRef();
  const resources = new WeakMap<PDFPage, PDFName>();
  const entries: { glyph: number; unicode: string; width: number }[] = [];
  const cids = new Map<string, number>();
  const cidFor = (glyph: PositionedGlyph) => {
    const key = `${glyph.id}:${glyph.unicode}`;
    let cid = cids.get(key);
    if (cid === undefined) {
      cid = entries.length + 1;
      if (cid > 65535) {
        throw new Error('Invoice font character limit exceeded');
      }
      entries.push({ glyph: glyph.id, unicode: glyph.unicode, width: glyph.width });
      cids.set(key, cid);
    }
    return cid;
  };
  const measure = (text: string, size: number) =>
    (shape(font, text, onMissingGlyph).width * size) / font.unitsPerEm;
  return {
    measure,
    wrap(text: string, width: number, size: number): string[] {
      const lines: string[] = [];
      for (const paragraph of invoiceText(text).split(/\r\n|[\r\n\u2028\u2029]/)) {
        let line = '';
        for (const word of paragraph.split(/(\s+)/)) {
          if (measure(line + word, size) <= width) {
            line += word;
            continue;
          }
          if (line.trim()) {
            lines.push(line.trim());
          }
          line = '';
          for (const { segment } of graphemes.segment(word.trimStart())) {
            if (line && measure(line + segment, size) > width) {
              lines.push(line);
              line = '';
            }
            line += segment;
          }
        }
        lines.push(line.trim());
      }
      return lines;
    },
    draw(
      page: PDFPage,
      input: string,
      options: { right: number; y: number; size: number; color?: RGB },
    ) {
      const text = invoiceText(input);
      const line = shape(font, text, onMissingGlyph);
      const scale = options.size / font.unitsPerEm;
      const left = options.right - line.width * scale;
      let resource = resources.get(page);
      if (!resource) {
        resource = page.node.newFontDictionary('InvoiceRTL', reference);
        resources.set(page, resource);
      }
      const color = options.color ?? { red: 0, green: 0, blue: 0 };
      const runs = new Map<number, PositionedGlyph[]>();
      for (const glyph of line.glyphs) {
        const run = runs.get(glyph.run) ?? [];
        run.push(glyph);
        runs.set(glyph.run, run);
      }
      for (const glyphs of runs.values()) {
        page.pushOperators(
          beginText(),
          setFillingRgbColor(color.red, color.green, color.blue),
          setFontAndSize(resource, options.size),
        );
        for (const glyph of glyphs) {
          page.pushOperators(
            setTextMatrix(1, 0, 0, 1, left + glyph.x * scale, options.y + glyph.y * scale),
            showText(PDFHexString.of(hexId(cidFor(glyph)))),
          );
        }
        page.pushOperators(endText());
      }
    },
    finish() {
      const original = doc.context.lookup(embedded.ref, PDFDict);
      const descendants = original.lookup(PDFName.of('DescendantFonts'), PDFArray);
      const descendant = descendants.lookup(0, PDFDict).clone(doc.context);
      const gidMap = new Uint8Array((entries.length + 1) * 2);
      entries.forEach((entry, i) => {
        gidMap[(i + 1) * 2] = entry.glyph >> 8;
        gidMap[(i + 1) * 2 + 1] = entry.glyph & 255;
      });
      descendant.set(
        PDFName.of('CIDToGIDMap'),
        doc.context.register(doc.context.flateStream(gidMap)),
      );
      descendant.set(
        PDFName.of('W'),
        doc.context.obj([1, entries.map((entry) => (entry.width * 1000) / font.unitsPerEm)]),
      );
      const mappings = entries.map(
        (entry, i) =>
          `<${hexId(i + 1)}> <${PDFHexString.fromText(entry.unicode).asString().slice(4)}>`,
      );
      const blocks: string[] = [];
      for (let i = 0; i < mappings.length; i += 100) {
        const block = mappings.slice(i, i + 100);
        blocks.push(`${block.length} beginbfchar\n${block.join('\n')}\nendbfchar`);
      }
      const cmap = `/CIDInit /ProcSet findresource begin\n12 dict begin\nbegincmap\n/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def\n/CMapName /InvoiceUnicode def\n/CMapType 2 def\n1 begincodespacerange\n<0000> <ffff>\nendcodespacerange\n${blocks.join('\n')}\nendcmap\nCMapName currentdict /CMap defineresource pop\nend\nend`;
      const type0 = original.clone(doc.context);
      type0.set(PDFName.of('DescendantFonts'), doc.context.obj([doc.context.register(descendant)]));
      type0.set(PDFName.of('ToUnicode'), doc.context.register(doc.context.flateStream(cmap)));
      doc.context.assign(reference, type0);
    },
  };
}

export async function finishInvoiceFonts(
  doc: PDFDocument,
  fonts: Awaited<ReturnType<typeof createInvoiceFont>>[],
) {
  await doc.flush();
  fonts.forEach((font) => font.finish());
}
