import { expect, test } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';

for (const route of [
  'edit/rotate-pages',
  'edit/delete-pages',
  'extract/extract-pages',
  'watermark/add-watermark',
]) {
  test(`${route} rejects empty and oversized selections and accepts a valid retry`, async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const size = Object.getOwnPropertyDescriptor(Blob.prototype, 'size');
      const getSize = size?.get;
      if (!getSize) throw new Error('Blob size getter is unavailable');
      Object.defineProperty(Blob.prototype, 'size', {
        ...size,
        get(this: Blob) {
          // Exercise the picker boundary without transferring a 50 MiB fixture.
          if (this instanceof File && this.name === 'over-limit.pdf') return 50 * 1024 * 1024 + 1;
          if (this instanceof File && this.name === 'at-limit.pdf') return 50 * 1024 * 1024;
          return getSize.call(this);
        },
      });
    });
    const source = await PDFDocument.create();
    source.addPage();
    source.addPage();
    const bytes = Buffer.from(await source.save());
    await page.goto(`/pdf-tools/${route}`, { waitUntil: 'domcontentloaded' });
    const main = page.getByRole('main');
    const input = main.locator('input[type="file"]');
    const alert = main.getByRole('alert').filter({ hasText: /خالی است|۵۰/ });
    const select = (name: string, buffer = bytes) =>
      input.setInputFiles({ name, mimeType: 'application/pdf', buffer });

    await expect(async () => {
      await input.setInputFiles([]);
      await select('first.pdf');
      await expect(main.getByText('first.pdf', { exact: false })).toBeVisible({ timeout: 1000 });
    }).toPass({ timeout: 10_000 });
    await select('empty.pdf', Buffer.alloc(0));
    await expect(alert).toContainText('خالی است');
    await expect(main.getByText('first.pdf', { exact: false })).toHaveCount(0);
    await select('over-limit.pdf');
    await expect(alert).toContainText('۵۰');
    await expect(main.getByText('over-limit.pdf', { exact: false })).toHaveCount(0);
    await select('at-limit.pdf');
    await expect(main.getByText('at-limit.pdf', { exact: false })).toBeVisible();
    await expect(alert).toHaveCount(0);
  });
}
