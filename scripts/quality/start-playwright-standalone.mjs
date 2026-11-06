import { pathToFileURL } from 'node:url';
import { prepareStandaloneRuntime, resolveReleaseSha } from './run-local-smoke.mjs';

// Match the existing Playwright endpoint while reusing canonical asset setup.
process.env.HOSTNAME = 'localhost';
process.env.PORT = '3100';
const releaseSha = resolveReleaseSha();
process.env.NEXT_PUBLIC_GIT_SHA = releaseSha;
process.env.RELEASE_GIT_SHA = releaseSha;
const { serverPath } = prepareStandaloneRuntime();
await import(pathToFileURL(serverPath).href);
