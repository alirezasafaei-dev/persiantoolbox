/**
 * Manual, strictly single-inference acceptance check for a DEDICATED Workers
 * Free image account. No .env loader, key output, prompt output or file output.
 *
 * Executing without ALL explicit confirmations fails before any API call.
 *
 * Invoke only after the account operator has injected protected environment
 * variables via an approved secret manager; never put tokens on a command line
 * or commit a local .env file.
 */
import { runOneShotImage } from '../../lib/ai/image-one-shot';

void runOneShotImage(process.env)
  .then((metadata) => {
    process.stdout.write(`${JSON.stringify(metadata)}\n`);
  })
  .catch(() => {
    process.stderr.write('IMAGE_ONE_SHOT=NO_GO_OR_FAILED\n');
    process.exitCode = 1;
  });
