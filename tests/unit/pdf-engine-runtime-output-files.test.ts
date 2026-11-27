import { expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { run } from '../../public/pdf-engine/v1/runtime/index.js';

it('collects only requested QPDF outputs without changing the produced PDF bytes', async () => {
  const source = await PDFDocument.create();
  source.addPage([180, 120]).drawText('split runtime output fixture', { x: 20, y: 70 });
  const input = await source.save();
  const args = ['--static-id', 'input.pdf', 'output.pdf'];

  const full = await run(args, { 'input.pdf': input });
  const selected = await run(args, { 'input.pdf': input }, undefined, {
    outputFiles: ['output.pdf'],
  });

  expect(full.exitCode).toBe(0);
  expect(full.files['input.pdf']).toBeInstanceOf(Uint8Array);
  expect(full.files['output.pdf']).toBeInstanceOf(Uint8Array);
  expect(selected.exitCode).toBe(0);
  expect(selected.files).toEqual({ 'output.pdf': full.files['output.pdf'] });
});

it('preserves a QPDF nonzero result when a requested output was not created', async () => {
  const result = await run(
    ['input.pdf', 'output.pdf'],
    { 'input.pdf': new Uint8Array([0, 1, 2, 3]) },
    undefined,
    { outputFiles: ['output.pdf'] },
  );

  expect(result.exitCode).not.toBe(0);
  expect(result.files).toEqual({});
});
