import type { Font } from '@pdf-lib/fontkit';
import {
  type PDFDocument,
  type PDFPage,
  type PDFRef,
  type PDFOperator,
  type RGB,
  PDFName,
  PDFHexString,
  PDFNumber,
  PDFOperatorNames,
  beginText,
  endText,
  setFontAndSize,
  setTextMatrix,
  setFillingRgbColor,
  showText,
  moveTo,
  lineTo,
  appendBezierCurve,
  closePath,
  fill,
  pushGraphicsState,
  popGraphicsState,
  concatTransformationMatrix,
  drawObject,
} from 'pdf-lib';
import { PDFOperator as Operator } from 'pdf-lib';
import { InvoicePdfInputError } from './export-error';

export type CompositeGlyph = {
  id: number;
  unicode: string;
  x: number;
  y: number;
  advance: number;
};
type Bounds = [number, number, number, number];
type Entry = { unicode: string; width: number; bounds: Bounds; procedure: PDFRef };
type Bucket = { ref: PDFRef; entries: Entry[]; resources: WeakMap<PDFPage, PDFName> };
class UnsupportedOutline extends Error {}

// PDF 32000-1 9.10.3 limits a bfchar destination to 512 UTF-16BE bytes.
const MAX_UNICODE_UNITS = 256;
const MAX_CODES = 255;
const MAX_OUTLINE_OPERATORS = 2048;
const MAX_OUTLINE_BYTES = 64 * 1024;
const MAX_DOCUMENT_OUTLINE_BYTES = 8 * 1024 * 1024;
const MAX_DOCUMENT_RAW_BYTES = 64 * 1024 * 1024;
const MAX_DOCUMENT_GLYPHS = 4096;
const documentBudgets = new WeakMap<
  PDFDocument,
  { bytes: number; rawBytes: number; glyphs: number }
>();

/** Real vector ligatures: the one visible glyph and its Unicode describe the same run. */
export function createCompositeInvoiceFont(doc: PDFDocument, font: Font) {
  // A separate instance per embedded regular/bold font keeps font identity in the cache.
  const cache = new Map<string, { bucket: Bucket; code: number }>();
  const buckets: Bucket[] = [];
  const vectors = new Map<number, { name?: PDFName; bounds?: Bounds }>();
  const vectorResources = doc.context.obj({});
  let budget = documentBudgets.get(doc);
  if (!budget) {
    budget = { bytes: 0, rawBytes: 0, glyphs: 0 };
    documentBudgets.set(doc, budget);
  }
  const documentBudget = budget;
  const normalize = 1000 / font.unitsPerEm;
  const finite = (value: number) => {
    if (!Number.isFinite(value)) {
      throw new UnsupportedOutline();
    }
    return value;
  };
  // At 14 pt this changes a coordinate by at most 0.000007 pt, while
  // avoiding large decimal operands repeated in every cached outline.
  const coordinate = (value: number) => Math.round(finite(value) * 1000) / 1000;

  function outlinePaths(glyphs: readonly CompositeGlyph[]) {
    const first = glyphs[0];
    const last = glyphs.at(-1);
    if (!first || !last) {
      return;
    }
    const width = coordinate((last.x + last.advance - first.x) * normalize);
    if (width <= 0) {
      return;
    }
    const bounds: Bounds = [Infinity, Infinity, -Infinity, -Infinity];
    const operators: PDFOperator[] = [];
    const append = (operator: PDFOperator) => {
      if (operators.length >= MAX_OUTLINE_OPERATORS) {
        throw new UnsupportedOutline();
      }
      operators.push(operator);
    };
    for (const positioned of glyphs) {
      const glyph = font.getGlyph(positioned.id);
      const dx = positioned.x - first.x;
      const dy = positioned.y - first.y;
      const point = (x: number, y: number): [number, number] => [
        coordinate((x + dx) * normalize),
        coordinate((y + dy) * normalize),
      ];
      if (Number.isFinite(glyph.cbox.minX)) {
        // Round the control box outward so quantization cannot clip a contour.
        const x0 = Math.floor(finite((glyph.cbox.minX + dx) * normalize) * 1000) / 1000;
        const y0 = Math.floor(finite((glyph.cbox.minY + dy) * normalize) * 1000) / 1000;
        const x1 = Math.ceil(finite((glyph.cbox.maxX + dx) * normalize) * 1000) / 1000;
        const y1 = Math.ceil(finite((glyph.cbox.maxY + dy) * normalize) * 1000) / 1000;
        bounds[0] = Math.min(bounds[0], x0);
        bounds[1] = Math.min(bounds[1], y0);
        bounds[2] = Math.max(bounds[2], x1);
        bounds[3] = Math.max(bounds[3], y1);
      }
      let x = 0,
        y = 0,
        startX = 0,
        startY = 0;
      // Public fontkit API; the installed implementation uses a closure, not eval.
      glyph.path.toFunction()({
        moveTo(px: number, py: number) {
          x = px;
          y = py;
          startX = px;
          startY = py;
          append(moveTo(...point(px, py)));
        },
        lineTo(px: number, py: number) {
          x = px;
          y = py;
          append(lineTo(...point(px, py)));
        },
        quadraticCurveTo(qx: number, qy: number, ex: number, ey: number) {
          append(
            appendBezierCurve(
              ...point(x + (2 * (qx - x)) / 3, y + (2 * (qy - y)) / 3),
              ...point(ex + (2 * (qx - ex)) / 3, ey + (2 * (qy - ey)) / 3),
              ...point(ex, ey),
            ),
          );
          x = ex;
          y = ey;
        },
        bezierCurveTo(x1: number, y1: number, x2: number, y2: number, ex: number, ey: number) {
          append(appendBezierCurve(...point(x1, y1), ...point(x2, y2), ...point(ex, ey)));
          x = ex;
          y = ey;
        },
        closePath() {
          append(closePath());
          x = startX;
          y = startY;
        },
      });
      append(fill());
    }
    if (!bounds.every(Number.isFinite)) {
      return;
    }
    return { width, bounds, operators };
  }

  function accountStream(stream: ReturnType<typeof doc.context.contentStream>) {
    const rawBytes = stream.getUnencodedContentsSize();
    const bytes = stream.getContentsSize();
    if (
      documentBudget.bytes + bytes > MAX_DOCUMENT_OUTLINE_BYTES ||
      documentBudget.rawBytes + rawBytes > MAX_DOCUMENT_RAW_BYTES
    ) {
      throw new InvoicePdfInputError();
    }
    documentBudget.bytes += bytes;
    documentBudget.rawBytes += rawBytes;
  }

  function outline(glyphs: readonly CompositeGlyph[]) {
    const first = glyphs[0];
    const last = glyphs.at(-1);
    if (!first || !last) {
      return;
    }
    const width = coordinate((last.x + last.advance - first.x) * normalize);
    if (width <= 0) {
      return;
    }
    const bounds: Bounds = [Infinity, Infinity, -Infinity, -Infinity];
    const operators: PDFOperator[] = [];
    for (const glyph of glyphs) {
      let vector = vectors.get(glyph.id);
      if (!vector) {
        const paths = outlinePaths([{ ...glyph, x: 0, y: 0 }]);
        if (!paths) {
          return;
        }
        if (paths.operators.length === 1) {
          // An empty outline (for example a space) contributes advance only.
          vectors.set(glyph.id, {});
          continue;
        }
        const stream = doc.context.contentStream(paths.operators, {
          Type: 'XObject',
          Subtype: 'Form',
          FormType: 1,
          Matrix: [1, 0, 0, 1, 0, 0],
          BBox: paths.bounds,
          Resources: {},
        });
        if (stream.getUnencodedContentsSize() > MAX_OUTLINE_BYTES) {
          return;
        }
        accountStream(stream);
        const name = PDFName.of(`v${glyph.id}`);
        vectorResources.set(name, doc.context.register(stream));
        vector = { name, bounds: paths.bounds };
        vectors.set(glyph.id, vector);
      }
      if (!vector.name || !vector.bounds) {
        continue;
      }
      // Cached paths are charged once; this stream contains four operators per placement.
      if (operators.length + 4 > MAX_OUTLINE_OPERATORS) {
        return;
      }
      const dx = coordinate((glyph.x - first.x) * normalize);
      const dy = coordinate((glyph.y - first.y) * normalize);
      bounds[0] = Math.min(bounds[0], vector.bounds[0] + dx);
      bounds[1] = Math.min(bounds[1], vector.bounds[1] + dy);
      bounds[2] = Math.max(bounds[2], vector.bounds[2] + dx);
      bounds[3] = Math.max(bounds[3], vector.bounds[3] + dy);
      operators.push(
        pushGraphicsState(),
        concatTransformationMatrix(1, 0, 0, 1, dx, dy),
        drawObject(vector.name),
        popGraphicsState(),
      );
    }
    if (!bounds.every(Number.isFinite)) {
      return;
    }
    return { width, bounds, operators };
  }

  return {
    draw(
      page: PDFPage,
      glyphs: readonly CompositeGlyph[],
      options: {
        left: number;
        y: number;
        size: number;
        color: Pick<RGB, 'red' | 'green' | 'blue'>;
      },
    ) {
      const unicode = glyphs.map((glyph) => glyph.unicode).join('');
      const first = glyphs[0];
      if (
        !first ||
        unicode.length < 2 ||
        unicode.length > MAX_UNICODE_UNITS ||
        /[\p{Mark}\u200c\u200d]/u.test(unicode) ||
        !glyphs.every((glyph) => glyph.y === first.y) ||
        Array.from(unicode).some(
          (character) => font.glyphForCodePoint(character.codePointAt(0) ?? 0).id === 0,
        )
      ) {
        return false;
      }
      const key = JSON.stringify([
        unicode,
        glyphs.map((glyph) => [glyph.id, glyph.x - first.x, glyph.y - first.y, glyph.advance]),
      ]);
      let cached = cache.get(key);
      if (!cached) {
        if (
          documentBudget.bytes >= MAX_DOCUMENT_OUTLINE_BYTES ||
          documentBudget.rawBytes >= MAX_DOCUMENT_RAW_BYTES ||
          documentBudget.glyphs >= MAX_DOCUMENT_GLYPHS
        ) {
          throw new InvoicePdfInputError();
        }
        let drawn: ReturnType<typeof outline>;
        try {
          drawn = outline(glyphs);
        } catch (error) {
          if (error instanceof UnsupportedOutline || error instanceof TypeError) {
            return false;
          }
          throw error;
        }
        if (!drawn) {
          return false;
        }
        const stream = doc.context.contentStream([
          Operator.of(
            PDFOperatorNames.Type3D1,
            [drawn.width, 0, ...drawn.bounds].map(PDFNumber.of),
          ),
          ...drawn.operators,
        ]);
        const rawSize = stream.getUnencodedContentsSize();
        if (rawSize > MAX_OUTLINE_BYTES) {
          return false;
        }
        accountStream(stream);
        let bucket = buckets.at(-1);
        if (!bucket || bucket.entries.length === MAX_CODES) {
          bucket = { ref: doc.context.nextRef(), entries: [], resources: new WeakMap() };
          buckets.push(bucket);
        }
        const procedure = doc.context.register(stream);
        documentBudget.glyphs++;
        bucket.entries.push({ unicode, width: drawn.width, bounds: drawn.bounds, procedure });
        cached = { bucket, code: bucket.entries.length };
        cache.set(key, cached);
      }
      let resource = cached.bucket.resources.get(page);
      if (!resource) {
        resource = page.node.newFontDictionary('InvoiceRun', cached.bucket.ref);
        cached.bucket.resources.set(page, resource);
      }
      const scale = options.size / font.unitsPerEm;
      page.pushOperators(
        beginText(),
        setFillingRgbColor(options.color.red, options.color.green, options.color.blue),
        setFontAndSize(resource, options.size),
        setTextMatrix(1, 0, 0, 1, options.left + first.x * scale, options.y + first.y * scale),
        showText(PDFHexString.of(cached.code.toString(16).padStart(2, '0'))),
        endText(),
      );
      return true;
    },
    finish() {
      for (const bucket of buckets) {
        const procedures = doc.context.obj({});
        const widths: number[] = [];
        const differences = doc.context.obj([1]);
        const bounds: Bounds = [Infinity, Infinity, -Infinity, -Infinity];
        const mappings: string[] = [];
        for (const [i, entry] of bucket.entries.entries()) {
          const name = PDFName.of(`g${i + 1}`);
          procedures.set(name, entry.procedure);
          differences.push(name);
          widths.push(entry.width);
          bounds[0] = Math.min(bounds[0], entry.bounds[0]);
          bounds[1] = Math.min(bounds[1], entry.bounds[1]);
          bounds[2] = Math.max(bounds[2], entry.bounds[2]);
          bounds[3] = Math.max(bounds[3], entry.bounds[3]);
          mappings.push(
            `<${(i + 1).toString(16).padStart(2, '0')}> <${PDFHexString.fromText(entry.unicode).asString().slice(4)}>`,
          );
        }
        const blocks: string[] = [];
        for (let i = 0; i < mappings.length; i += 100) {
          const block = mappings.slice(i, i + 100);
          blocks.push(`${block.length} beginbfchar\n${block.join('\n')}\nendbfchar`);
        }
        const cmap = `/CIDInit /ProcSet findresource begin\n12 dict begin\nbegincmap\n/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def\n/CMapName /InvoiceRunUnicode def\n/CMapType 2 def\n1 begincodespacerange\n<00> <ff>\nendcodespacerange\n${blocks.join('\n')}\nendcmap\nCMapName currentdict /CMap defineresource pop\nend\nend`;
        doc.context.assign(
          bucket.ref,
          doc.context.obj({
            Type: 'Font',
            Subtype: 'Type3',
            FontBBox: bounds,
            FontMatrix: [0.001, 0, 0, 0.001, 0, 0],
            CharProcs: procedures,
            Encoding: { Type: 'Encoding', Differences: differences },
            FirstChar: 1,
            LastChar: bucket.entries.length,
            Widths: widths,
            Resources: { XObject: vectorResources },
            ToUnicode: doc.context.register(doc.context.flateStream(cmap)),
          }),
        );
      }
    },
  };
}
