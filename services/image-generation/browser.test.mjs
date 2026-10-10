import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  configurePromptOptimizer,
  detectProviderBlock,
  validateGeneratedDownload,
  detectProviderFailure,
} from './browser.mjs';

test('provider errors become fixed diagnostic reasons without retaining prompt text', () => {
  assert.equal(
    detectProviderFailure('Flat AI Guard could not process this request. Private prompt text'),
    'content_guard',
  );
  assert.equal(detectProviderFailure('Another request is already waiting'), 'queue_conflict');
  assert.equal(detectProviderFailure('Your prompt is too vague'), 'prompt_validation');
  assert.equal(
    detectProviderFailure(
      'Flat AI Guard blocked this image because it violates our child-safety policy.',
    ),
    'content_guard',
  );
  assert.equal(detectProviderFailure('Generating your image'), null);
});

function optimizerButton(initialTitle) {
  let title = initialTitle;
  let clicks = 0;
  return {
    getAttribute: async (name) => (name === 'title' ? title : null),
    click: async () => {
      clicks++;
      if (title === 'Prompt optimizer: Off') title = 'Prompt optimizer: On';
    },
    get clicks() {
      return clicks;
    },
  };
}

function pageWithOptimizer(button) {
  return {
    getByRole: (role, options) => {
      assert.equal(role, 'button');
      assert.deepEqual(options, { name: 'Prompt optimizer', exact: true });
      return button;
    },
  };
}

test('Persian prompts enable an available optimizer', async () => {
  const button = optimizerButton('Prompt optimizer: Off');
  assert.equal(
    await configurePromptOptimizer(pageWithOptimizer(button), 'یک منظره آرام ایرانی'),
    true,
  );
  assert.equal(button.clicks, 1);
});

test('English prompts leave the optimizer untouched', async () => {
  const button = optimizerButton('Prompt optimizer: Off');
  assert.equal(
    await configurePromptOptimizer(pageWithOptimizer(button), 'a calm landscape'),
    false,
  );
  assert.equal(button.clicks, 0);
});

test('unknown optimizer state fails closed', async () => {
  const button = optimizerButton('Prompt optimizer: Loading');
  await assert.rejects(configurePromptOptimizer(pageWithOptimizer(button), 'تصویر آزمایشی'), {
    code: 'provider_error',
  });
});

test('provider gate detection maps signup, CAPTCHA, quota, and safe text deterministically', () => {
  assert.equal(detectProviderBlock('Create a free account to use this tool'), 'signup_required');
  assert.equal(detectProviderBlock('Please verify that you are human'), 'captcha_required');
  assert.equal(detectProviderBlock("You've reached your daily usage limit"), 'quota_reached');
  assert.equal(detectProviderBlock('The generator is ready for your prompt.'), null);
});

test('download validation rejects malformed, oversized, and non-image fixture data', () => {
  const validJpeg = Buffer.alloc(32);
  validJpeg.set([0xff, 0xd8, 0xff]);
  assert.doesNotThrow(() => validateGeneratedDownload(validJpeg, { width: 1, height: 1 }));
  for (const [bytes, dimensions] of [
    [validJpeg, { width: 0, height: 1 }],
    [validJpeg, { width: Number.NaN, height: 1 }],
    [validJpeg, { width: 2049, height: 1 }],
    [Buffer.alloc(5 * 1024 * 1024 + 1), { width: 1, height: 1 }],
    [Buffer.from('<html>not an image</html>'), { width: 1, height: 1 }],
  ]) {
    assert.throws(() => validateGeneratedDownload(bytes, dimensions), { code: 'invalid_image' });
  }
});
