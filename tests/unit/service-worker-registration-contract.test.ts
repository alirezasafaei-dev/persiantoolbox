import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('service worker registration contract', () => {
  it('mounts the application service-worker registration exactly once', () => {
    const layout = readSource('app/layout.tsx');
    const clientBoot = readSource('components/ui/ClientRuntimeBoot.tsx');
    const combined = `${layout}\n${clientBoot}`;
    const mounts = combined.match(/<ServiceWorkerRegistration\s*\/>/g) ?? [];

    expect(layout).toContain('<ClientRuntimeBoot />');
    expect(mounts).toHaveLength(1);
    expect(layout).not.toContain(
      "import ServiceWorkerRegistration from '@/components/ui/ServiceWorkerRegistration'",
    );
    expect(clientBoot).toContain('<ServiceWorkerRegistration />');
  });
});
