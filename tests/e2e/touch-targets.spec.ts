import { expect, test } from '@playwright/test';
import { expectMinimumTouchTargetSize, getVisibleTouchTargets } from './helpers/touch-targets';

test('touch-target sampling covers all supported controls and excludes hidden controls', async ({
  page,
}) => {
  await page.setContent(`
    <style>button, a, input { display: inline-block; width: 24px; height: 24px; padding: 0; border: 0; }</style>
    <button>button</button>
    <a role="button">link</a>
    <input type="button" value="input button">
    <input type="submit" value="submit">
    <button style="display: none">hidden</button>
  `);
  const targets = await getVisibleTouchTargets(page);
  expect(targets).toHaveLength(4);
  expect(targets.map((target) => target.tag)).toEqual(['button', 'a', 'input', 'input']);
  expectMinimumTouchTargetSize(targets);
});

test('touch-target sampling preserves undersized controls and their diagnostics', async ({
  page,
}) => {
  await page.setContent(`
    <button style="width: 24px; height: 24px; padding: 0; border: 0">valid</button>
    <button aria-label="small control" style="width: 23px; height: 30px; padding: 0; border: 0">small</button>
    <button id="transient" style="width: 24px; height: 24px; padding: 0; border: 0">transient</button>
  `);
  const targets = await getVisibleTouchTargets(page);
  expect(() => expectMinimumTouchTargetSize(targets)).toThrow(/small control/);
  await page.locator('#transient').evaluate((element) => element.remove());
  const freshTargets = await getVisibleTouchTargets(page);
  expect(freshTargets.map((target) => target.text)).toEqual(['valid', 'small']);
  // Removing a live control must not change the geometry/identity already read.
  const undersized = targets.filter((target) => Math.min(target.width, target.height) < 24);
  expect(targets).toHaveLength(3);
  expect(undersized).toEqual([
    { width: 23, height: 30, tag: 'button', text: 'small', ariaLabel: 'small control' },
  ]);
  expect(() => expectMinimumTouchTargetSize(freshTargets)).toThrow(/small control/);
  expect(() => expectMinimumTouchTargetSize([])).toThrow();
});

test('touch-target sampling survives a control disappearing between target diagnostics', async ({
  page,
}) => {
  await page.setContent(`
    <style>button { width: 24px; height: 24px; padding: 0; border: 0; }</style>
    <button>first</button><button>second</button><button id="transient">transient</button>
  `);
  await page.evaluate(() => {
    const first = document.querySelector('button');
    const transient = document.querySelector('#transient');
    if (!first || !transient) {
      throw new Error('Missing fixture controls');
    }
    const rect = transient.getBoundingClientRect();
    transient.getBoundingClientRect = () => rect;
    // Fixture-only interleaving: reading the first descriptor removes a later
    // control. A snapshot keeps the selected nodes and their geometry; a live
    // count/nth loop subsequently waits for an index that no longer exists.
    Object.defineProperty(first, 'textContent', {
      get: () => {
        transient.remove();
        return 'first';
      },
    });
  });

  const targets = await getVisibleTouchTargets(page);
  expect(targets.map((target) => target.text)).toEqual(['first', 'second', 'transient']);
  expectMinimumTouchTargetSize(targets);
  const freshTargets = await getVisibleTouchTargets(page);
  expect(freshTargets.map((target) => target.text)).toEqual(['first', 'second']);
  expectMinimumTouchTargetSize(freshTargets);
});
