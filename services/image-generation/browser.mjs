import { createRequire } from 'node:module';
import { readFile, stat } from 'node:fs/promises';
import { ImageError, identifyImage } from './core.mjs';

const target = 'https://flatai.org/ai-image-generator-free-no-signup/';
export async function configurePromptOptimizer(page, prompt) {
  if (!/[\u0600-\u06ff]/u.test(prompt)) return false;
  const toggle = page.getByRole('button', { name: 'Prompt optimizer', exact: true });
  const title = await toggle.getAttribute('title');
  if (title === 'Prompt optimizer: Off') await toggle.click();
  if ((await toggle.getAttribute('title')) !== 'Prompt optimizer: On')
    throw new ImageError('provider_error');
  return true;
}
export function detectProviderBlock(text) {
  if (
    /create a free account to use this tool|sign in to (?:use|continue|generate)|sign up to (?:use|continue|generate)/i.test(
      text,
    )
  )
    return 'signup_required';
  if (
    /verify (?:that )?you are human|complete the captcha|confirm you are human|verification required/i.test(
      text,
    )
  )
    return 'captcha_required';
  if (
    /(?:you(?:'ve| have) reached|you have hit|reached your).{0,35}(?:usage limit|daily.{0,10}limit)|too many requests/i.test(
      text,
    )
  )
    return 'quota_reached';
  return null;
}

export function validateGeneratedDownload(bytes, dimensions) {
  if (
    ![dimensions?.width, dimensions?.height].every(
      (value) => Number.isInteger(value) && value > 0 && value <= 2048,
    )
  ) {
    throw new ImageError('invalid_image');
  }
  return identifyImage(bytes);
}

export function detectProviderFailure(text) {
  for (const [reason, pattern] of [
    ['queue_expired', /your waiting request expired/i],
    ['generic_error', /sorry, something went wrong/i],
    ['missing_image', /image data not found/i],
    ['content_guard', /could not process this request|blocked this image because it violates/i],
    ['queue_conflict', /another request is already waiting/i],
    ['generation_timeout', /generation timeout/i],
    [
      'prompt_validation',
      /your prompt is too vague|requests that test the generator's restrictions/i,
    ],
  ]) {
    if (pattern.test(text)) return reason;
  }
  return null;
}

// Observe only response metadata from the normal first-party browser flow.
// Never retain URLs, response bodies, request headers, cookies, or prompt content.
export function classifyProviderPostResponse(response) {
  try {
    const url = new URL(response.url());
    if (
      url.protocol !== 'https:' ||
      !['flatai.org', 'www.flatai.org'].includes(url.hostname) ||
      response.request().method() !== 'POST'
    )
      return null;
    const status = response.status();
    if (status === 403) return 'http_403';
    if (status === 429) return 'http_429';
    if (Number.isInteger(status) && status >= 500 && status <= 599) return 'http_5xx';
  } catch {
    // Ignore malformed or unrelated browser events.
  }
  return null;
}

export function selectProviderFailureReason(pageReason, postReason) {
  if (pageReason && pageReason !== 'generic_error') return pageReason;
  return postReason || pageReason || null;
}

export async function generateWithBrowser(prompt, { signal, onStage, onMetrics }) {
  if (
    process.env['NODE_ENV'] === 'production' &&
    process.env['IMAGE_BROWSER_PROXY'] !== 'http://image-egress:3128'
  ) {
    throw new ImageError('not_configured');
  }
  const started = Date.now();
  let browser,
    page,
    stage = 'opening',
    promptOptimizer = false,
    failureReason,
    providerHttpReason;
  const milestonesMs = {};
  const mark = (name) => {
    milestonesMs[name] = Date.now() - started;
  };
  const setStage = (value) => {
    stage = value;
    onStage(value);
  };
  const metric = async (fields) => {
    onMetrics({
      durationSeconds: Math.round((Date.now() - started) / 1000),
      milestonesMs,
      promptOptimizer,
      ...fields,
    });
  };
  const abort = () => {
    void browser?.close().catch(() => {});
  };
  signal.addEventListener('abort', abort, { once: true });
  try {
    let chromium;
    try {
      ({ chromium } = createRequire(import.meta.url)('playwright'));
    } catch {
      throw new ImageError('browser_unavailable');
    }
    try {
      const browserEnv = Object.fromEntries(
        ['PATH', 'HOME', 'TMPDIR', 'TEMP', 'TMP', 'SystemRoot', 'WINDIR', 'LANG']
          .filter((name) => process.env[name] !== undefined)
          .map((name) => [name, process.env[name]]),
      );
      browser = await chromium.launch({
        headless: true,
        chromiumSandbox: process.env['NODE_ENV'] === 'production',
        env: browserEnv,
        ...(process.env['IMAGE_BROWSER_PROXY']
          ? {
              proxy: { server: process.env['IMAGE_BROWSER_PROXY'], bypass: '<-loopback>' },
              args: ['--disable-quic', '--force-webrtc-ip-handling-policy=disable_non_proxied_udp'],
            }
          : {}),
        ...(process.env['IMAGE_BROWSER_CHANNEL'] === 'msedge' ? { channel: 'msedge' } : {}),
      });
    } catch {
      throw new ImageError('browser_unavailable');
    }
    mark('browserLaunched');
    if (signal.aborted) throw new ImageError('provider_timeout');
    const context = await browser.newContext({ acceptDownloads: true });
    page = await context.newPage();
    page.on('response', (response) => {
      if (stage !== 'submitting' && stage !== 'waiting') return;
      providerHttpReason ??= classifyProviderPostResponse(response);
    });
    page.setDefaultTimeout(10000);
    await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 45000 });
    mark('pageLoaded');
    const promptBox = page.getByRole('textbox', { name: 'Image prompt', exact: true });
    const readyDeadline = Date.now() + 60000;
    while (!(await promptBox.isVisible())) {
      const block = detectProviderBlock(await page.locator('body').innerText());
      if (block) throw new ImageError(block);
      if (Date.now() > readyDeadline) throw new ImageError('provider_timeout');
      await page.waitForTimeout(1000);
    }
    const blockBefore = detectProviderBlock(await page.locator('body').innerText());
    if (blockBefore) throw new ImageError(blockBefore);
    mark('formReady');
    setStage('submitting');
    await promptBox.fill(prompt);
    promptOptimizer = await configurePromptOptimizer(page, prompt);
    await page.getByRole('button', { name: 'Generate', exact: true }).click();
    mark('submitted');
    setStage('waiting');
    const image = page.getByRole('img', { name: 'Generated Image', exact: true });
    const deadline = Date.now() + 9 * 60 * 1000;
    let imageReady = false;
    while (Date.now() <= deadline) {
      if (signal.aborted) throw new ImageError('provider_timeout');
      const text = await page.locator('body').innerText();
      const block = detectProviderBlock(text);
      if (block) throw new ImageError(block);
      if (
        (await image.isVisible()) &&
        (await image.evaluate((element) => element.complete && element.naturalWidth > 0))
      ) {
        imageReady = true;
        break;
      }
      failureReason = selectProviderFailureReason(detectProviderFailure(text), providerHttpReason);
      if (failureReason)
        throw new ImageError(failureReason === 'http_429' ? 'quota_reached' : 'provider_error');
      if (Date.now() > deadline) throw new ImageError('provider_timeout');
      await page.waitForTimeout(2500);
    }
    if (!imageReady) throw new ImageError('provider_timeout');
    setStage('downloading');
    mark('imageVisible');
    const dimensions = await image.evaluate((element) => ({
      width: element.naturalWidth,
      height: element.naturalHeight,
    }));
    const downloadPromise = page.waitForEvent('download', { timeout: 20000 });
    await page.getByRole('button', { name: 'Download', exact: true }).click();
    const download = await downloadPromise;
    const file = await download.path();
    if (
      !file ||
      (await stat(file)).size > 5 * 1024 * 1024 ||
      dimensions.width > 2048 ||
      dimensions.height > 2048
    )
      throw new ImageError('invalid_image');
    const bytes = await readFile(file);
    const mime = validateGeneratedDownload(bytes, dimensions);
    mark('downloaded');
    await metric({ status: 'ready', bytes: bytes.length, mime, ...dimensions });
    return { bytes };
  } catch (error) {
    const code = error instanceof ImageError ? error.code : 'provider_error';
    await metric({ status: signal.aborted ? 'aborted' : 'blocked', code, stage, failureReason });
    throw new ImageError(code);
  } finally {
    signal.removeEventListener('abort', abort);
    await browser?.close().catch(() => {});
  }
}
