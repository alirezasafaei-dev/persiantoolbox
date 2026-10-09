import { afterEach, describe, expect, it, vi } from 'vitest';
import { Children, isValidElement, type ReactNode } from 'react';
import { buildCsp } from '@/proxy';

vi.mock('@/lib/csp', () => ({ getCspNonce: async () => 'policy-test' }));

function collect(root: ReactNode): { type?: unknown; src?: string; href?: string; id?: string }[] {
  const result: { type?: unknown; src?: string; href?: string; id?: string }[] = [];
  Children.forEach(root, (child) => {
    if (isValidElement<{ children?: ReactNode; src?: string; href?: string; id?: string }>(child)) {
      result.push({ ...child.props, type: child.type });
      result.push(...collect(child.props.children));
    }
  });
  return result;
}

describe('root analytics policy', () => {
  afterEach(() => vi.unstubAllEnvs());

  it.each([true, false])(
    'does not attempt unsupported tracking under the enforced CSP (pilot %s)',
    async (enabled) => {
      vi.stubEnv('NEXT_PUBLIC_PLAUSIBLE_ENABLED', enabled ? '1' : '0');
      vi.stubEnv('NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL', 'https://plausible.io/js/pa-example.js');
      vi.stubEnv('NEXT_PUBLIC_GOOGLE_ANALYTICS_ID', 'G-TESTONLY');
      vi.stubEnv('NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID', 'GTM-TESTONLY');
      vi.resetModules();
      const RootLayout = (await import('@/app/layout')).default;
      const ClientRuntimeBoot = (await import('@/components/ui/ClientRuntimeBoot')).default;
      const csp = buildCsp('policy-test');
      expect(csp).not.toContain('googletagmanager.com');
      const nodes = collect(await RootLayout({ children: <main>Public content</main> }));
      const externalGoogleNodes = nodes.filter((node) =>
        /googletagmanager\.com/.test(node.src ?? node.href ?? ''),
      );
      expect(externalGoogleNodes).toEqual([]);
      // Both structured data and the consent-aware client runtime must survive cleanup.
      expect(nodes.some((node) => node.id === 'root-structured-data')).toBe(true);
      expect(nodes.some((node) => node.type === ClientRuntimeBoot)).toBe(true);
    },
  );
});
