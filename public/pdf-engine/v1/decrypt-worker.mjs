import { decrypt, inspect } from './runtime/index.js';

self.onmessage = async ({ data: { buffer, password } }) => {
  try {
    const input = new Uint8Array(buffer);
    const info = await inspect(input, password);
    if (!info.encrypted) {
      self.postMessage({ error: 'NOT_ENCRYPTED' });
      return;
    }
    if (info.needsPassword) {
      self.postMessage({ error: 'WRONG_PASSWORD' });
      return;
    }

    const result = await decrypt(input, password);
    if (result.warnings.length > 0) {
      self.postMessage({ error: 'PROCESSING' });
      return;
    }
    self.postMessage({ buffer: result.bytes.buffer }, [result.bytes.buffer]);
  } catch (error) {
    self.postMessage({ error: error?.code === 'WRONG_PASSWORD' ? 'WRONG_PASSWORD' : 'PROCESSING' });
  }
};
