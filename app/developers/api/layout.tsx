import Link from 'next/link';
import type { ReactNode } from 'react';
import { developerApiProducts } from '@/lib/developer-api-catalog';

type Props = {
  children: ReactNode;
};

export default function DeveloperApiLayout({ children }: Props) {
  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <nav
          aria-label="مستندات API"
          className="flex flex-wrap gap-2 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3"
        >
          <Link
            href="/developers/api"
            className="rounded-full px-3 py-2 text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--surface-2)]"
          >
            مرجع API
          </Link>
          {developerApiProducts.map((product) => (
            <Link
              key={product.id}
              href={product.docsPath}
              className="rounded-full px-3 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--color-primary)]"
            >
              {product.shortTitle}
            </Link>
          ))}
          <a
            href="/openapi.json"
            className="rounded-full px-3 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--color-primary)]"
          >
            OpenAPI JSON
          </a>
        </nav>
      </div>
      {children}
    </>
  );
}
