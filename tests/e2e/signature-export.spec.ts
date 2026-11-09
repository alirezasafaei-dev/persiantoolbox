import { expect, test } from '@playwright/test';

test('signature downloads retain ink and separate transparent and white backgrounds', async ({
  page,
}) => {
  await page.goto('/text-tools/signature');
  const canvas = page.locator('canvas');
  await canvas.waitFor();
  const draw = async () => {
    await canvas.scrollIntoViewIfNeeded();
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Signature canvas missing');
    await page.mouse.move(box.x + 50, box.y + 50);
    await page.mouse.down();
    await page.mouse.move(box.x + 150, box.y + 50, { steps: 15 });
    await page.mouse.up();
  };
  const decode = async (name: string) => {
    const pending = page.waitForEvent('download');
    await page.getByRole('button', { name, exact: true }).click();
    const download = await pending;
    const stream = await download.createReadStream();
    if (!stream) throw new Error('PNG download missing');
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    return page.evaluate(async (data) => {
      const image = new Image();
      image.src = `data:image/png;base64,${data}`;
      await image.decode();
      const output = document.createElement('canvas');
      output.width = image.width;
      output.height = image.height;
      const ctx = output.getContext('2d');
      if (!ctx) throw new Error('PNG canvas context unavailable');
      ctx.drawImage(image, 0, 0);
      const pixels = ctx.getImageData(0, 0, output.width, output.height).data;
      let darkInk = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        if (
          (pixels[i] ?? 255) < 50 &&
          (pixels[i + 1] ?? 255) < 50 &&
          (pixels[i + 2] ?? 255) < 50 &&
          (pixels[i + 3] ?? 0) > 200
        )
          darkInk++;
      }
      return { alpha: pixels[3], darkInk, width: output.width, height: output.height };
    }, Buffer.concat(chunks).toString('base64'));
  };
  for (let cycle = 0; cycle < 2; cycle++) {
    await draw();
    const transparent = await decode('دانلود PNG (شفاف)');
    const white = await decode('دانلود PNG (سفید)');
    expect(transparent.alpha).toBe(0);
    expect(white.alpha).toBe(255);
    expect(transparent.darkInk).toBeGreaterThan(50);
    expect(white.darkInk).toBe(transparent.darkInk);
    expect([white.width, white.height]).toEqual([transparent.width, transparent.height]);
    await page.getByRole('button', { name: 'پاک کردن', exact: true }).click();
    await expect(
      page.getByRole('button', { name: 'دانلود PNG (شفاف)', exact: true }),
    ).toBeDisabled();
  }
});
