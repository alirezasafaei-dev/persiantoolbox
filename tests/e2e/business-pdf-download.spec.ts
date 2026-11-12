import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { PDFDocument } from 'pdf-lib';
test.use({ serviceWorkers: 'block' });

for (const failFont of [false, true]) {
  test(`business PDF ${failFont ? 'font failure cancels reservation' : 'downloads a real file and confirms once'}`, async ({
    page,
  }, testInfo) => {
    const actions: string[] = [];
    let blockedFonts = 0;
    await page.route('**/api/subscription/status', (r) =>
      r.fulfill({ json: { subscription: { active: true, planId: 'pack-3' } } }),
    );
    await page.route('**/api/export/token', async (r) => {
      if (r.request().method() === 'POST') {
        actions.push('reserve');
        await r.fulfill({
          json: { ok: true, token: 'synthetic-token', reservationId: 'synthetic-reservation' },
        });
      } else {
        actions.push(r.request().postDataJSON().action);
        await r.fulfill({ json: { ok: true } });
      }
    });
    if (failFont)
      await page.route(/\/fonts\/Vazirmatn-[^/]+\.ttf/, (r) => {
        blockedFonts++;
        return r.fulfill({ status: 404, body: '' });
      });
    await page.addInitScript(() =>
      localStorage.setItem(
        'persian-tools.business-drafts.v1',
        JSON.stringify([
          {
            id: 'synthetic',
            documentType: 'invoice',
            templateId: 'invoice',
            createdAt: '2026-11-12',
            updatedAt: '2026-11-12',
            documentDate: '2026-11-12',
            documentNumber: 'SYNTHETIC-1',
            seller: { name: 'فروشنده آزمایشی' },
            buyer: { name: 'خریدار آزمایشی' },
            items: [{ id: '1', description: 'آزمون React 19', quantity: 1, unitPrice: 100000 }],
          },
        ]),
      ),
    );
    await page.goto('/business-tools/document-studio?type=invoice');
    await expect(page.locator('input').first()).not.toHaveValue('');
    for (let i = 0; i < 5; i++) await page.getByRole('main').getByRole('button').last().click();
    await page.getByRole('checkbox').check();
    const button = page.getByRole('button', { name: 'دانلود PDF', exact: true });
    await expect(button).toBeVisible();
    if (failFont) {
      let downloads = 0;
      page.on('download', () => downloads++);
      await button.click();
      await expect.poll(() => actions).toEqual(['reserve', 'cancel']);
      expect(blockedFonts).toBeGreaterThan(0);
      expect(downloads).toBe(0);
      await expect(button).toBeEnabled();
    } else {
      const waiting = page.waitForEvent('download');
      await button.click();
      const download = await waiting;
      expect(download.suggestedFilename()).toBe('SYNTHETIC-1.pdf');
      const path = testInfo.outputPath('synthetic-business.pdf');
      await download.saveAs(path);
      const bytes = await readFile(path);
      expect(bytes.subarray(0, 5).toString()).toBe('%PDF-');
      expect((await PDFDocument.load(bytes)).getPageCount()).toBe(1);
      await expect.poll(() => actions).toEqual(['reserve', 'confirm']);
      expect(page.context().pages()).toHaveLength(1);
    }
  });
}
