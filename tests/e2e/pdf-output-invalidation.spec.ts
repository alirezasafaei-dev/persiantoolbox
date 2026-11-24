import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';

const cases = [
  {
    route: 'edit/rotate-pages',
    input: 'rotate-pages-input',
    action: 'چرخش صفحات',
    filename: 'rotated.pdf',
    next: '2',
  },
  {
    route: 'edit/delete-pages',
    input: 'delete-pages-input',
    action: 'حذف صفحات',
    filename: 'cleaned.pdf',
    next: '2',
  },
  {
    route: 'extract/extract-pages',
    input: 'extract-pages-input',
    action: 'استخراج صفحات',
    filename: 'extracted.pdf',
    next: '2',
  },
  {
    route: 'split/split-pdf',
    input: 'split-pdf-pages',
    action: 'تقسیم صفحات',
    filename: 'split.zip',
    next: '2',
  },
] as const;

test('split can cancel a pending file read and retry with a different part size', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const read = File.prototype.arrayBuffer;
    let reads = 0;
    File.prototype.arrayBuffer = async function (this: File) {
      if (this.name === 'split-retry.pdf' && ++reads === 2) {
        await new Promise<void>((resolve) => {
          window.addEventListener('release-split-read', () => resolve(), { once: true });
          document.documentElement.setAttribute('data-split-read-pending', 'true');
        });
        throw new Error('Late failure from canceled split');
      }
      return read.call(this);
    };
  });
  const source = await PDFDocument.create();
  for (const width of [101, 202, 303]) source.addPage([width, 160]);
  await page.goto('/pdf-tools/split/split-pdf', { waitUntil: 'domcontentloaded' });
  const consent = page.getByRole('dialog', { name: 'cookie consent' });
  await consent.getByRole('button', { name: 'رد همه کوکی‌ها', exact: true }).click();
  await expect(consent).toBeHidden();
  const main = page.getByRole('main');
  await main.getByLabel('انتخاب فایل PDF').setInputFiles({
    name: 'split-retry.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from(await source.save()),
  });
  await expect(main.getByText('split-retry.pdf', { exact: false })).toBeVisible();
  const process = main.getByRole('button', { name: 'تقسیم صفحات', exact: true });
  await process.click();
  await expect(page.locator('html')).toHaveAttribute('data-split-read-pending', 'true');
  await main.getByRole('button', { name: 'لغو تقسیم', exact: true }).click();
  const link = main.locator('a[download="split.zip"]');
  await expect(link).toHaveCount(0);
  await main.locator('#split-pdf-pages').fill('2');
  await process.click();
  await expect(link).toBeVisible();
  const [download] = await Promise.all([page.waitForEvent('download'), link.click()]);
  const zip = await JSZip.loadAsync(await readFile(await download.path()));
  expect(Object.keys(zip.files)).toEqual(['part-1.pdf', 'part-2.pdf']);
  const firstPart = await zip.file('part-1.pdf')?.async('uint8array');
  expect((await PDFDocument.load(firstPart ?? new Uint8Array())).getPageCount()).toBe(2);
  const retryUrl = await link.getAttribute('href');
  await page.evaluate(async () => {
    window.dispatchEvent(new Event('release-split-read'));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  });
  await expect(link).toHaveAttribute('href', retryUrl ?? '');
  await expect(main.getByText('Late failure from canceled split')).toHaveCount(0);
});

for (const fixture of cases) {
  test(`${fixture.route} removes stale downloads and applies the next page selection`, async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const revoke = URL.revokeObjectURL;
      const observed = new Set<string>();
      Object.assign(window, { observedPdfRevocations: observed });
      URL.revokeObjectURL = (url) => {
        observed.add(url);
        revoke(url);
      };
    });
    const pdf = await PDFDocument.create();
    for (const width of [100, 200, 300]) pdf.addPage([width, 150]);
    await page.goto(`/pdf-tools/${fixture.route}`, { waitUntil: 'domcontentloaded' });
    const consent = page.getByRole('dialog', { name: 'cookie consent' });
    await consent.getByRole('button', { name: 'رد همه کوکی‌ها', exact: true }).click();
    await expect(consent).toBeHidden();
    const main = page.getByRole('main');
    const input = main.getByLabel('انتخاب فایل PDF');
    await input.setInputFiles({
      name: 'stale-output.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from(await pdf.save()),
    });
    await expect(main.getByText('stale-output.pdf', { exact: false })).toBeVisible();
    const settings = main.locator(`#${fixture.input}`);
    const process = main.getByRole('button', { name: fixture.action, exact: true });
    const link = main.locator(`a[download="${fixture.filename}"]`);
    const readResultUrl = async () => {
      await expect(link).toHaveAttribute('href', /^blob:/);
      return (await link.getAttribute('href')) ?? '';
    };
    const wasRevoked = (url: string) =>
      page.evaluate((target) => {
        const state = window as Window & { observedPdfRevocations?: Set<string> };
        return state.observedPdfRevocations?.has(target);
      }, url);

    await settings.fill('1');
    await process.click();
    let previousUrl = await readResultUrl();
    if (fixture.filename === 'rotated.pdf') {
      await main.getByRole('button', { name: '180°', exact: true }).click();
      await expect(link).toHaveCount(0);
      await expect.poll(() => wasRevoked(previousUrl)).toBe(true);
      await process.click();
      previousUrl = await readResultUrl();
    }
    await settings.fill(fixture.next);
    await expect(link).toHaveCount(0);
    await expect.poll(() => wasRevoked(previousUrl)).toBe(true);

    await process.click();
    const currentUrl = await readResultUrl();
    await link.evaluate((element) =>
      element.scrollIntoView({ block: 'center', behavior: 'instant' }),
    );
    const [download] = await Promise.all([page.waitForEvent('download'), link.click()]);
    const path = await download.path();
    if (!path) throw new Error('The downloaded document has no local path');
    const result = await readFile(path);
    if (fixture.filename === 'split.zip') {
      const zip = await JSZip.loadAsync(result);
      const parts = await Promise.all([
        zip.file('part-1.pdf')?.async('uint8array'),
        zip.file('part-2.pdf')?.async('uint8array'),
      ]);
      expect(Object.keys(zip.files)).toHaveLength(2);
      const widths = await Promise.all(
        parts.map(async (part) =>
          (await PDFDocument.load(part ?? new Uint8Array()))
            .getPages()
            .map((item) => item.getWidth()),
        ),
      );
      expect(widths).toEqual([[100, 200], [300]]);
    } else {
      const pages = (await PDFDocument.load(result)).getPages();
      if (fixture.filename === 'rotated.pdf') {
        expect(pages.map((item) => item.getRotation().angle)).toEqual([0, 180, 0]);
      } else {
        expect(pages.map((item) => item.getWidth())).toEqual(
          fixture.filename === 'cleaned.pdf' ? [100, 300] : [200],
        );
      }
    }
    await main.getByRole('button', { name: 'تغییر فایل', exact: true }).click();
    await expect(link).toHaveCount(0);
    await expect.poll(() => wasRevoked(currentUrl)).toBe(true);
  });
}
