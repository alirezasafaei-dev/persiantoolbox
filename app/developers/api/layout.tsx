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
          className="flex flex-wrap gap-2 rounded-lg border border-(--border-light) bg-(--surface-1) p-3"
        >
          <Link
            href="/developers/api"
            className="rounded-full px-3 py-2 text-sm font-semibold text-primary hover:bg-(--surface-2)"
          >
            مرجع API
          </Link>
          {developerApiProducts.map((product) => (
            <Link
              key={product.id}
              href={product.docsPath}
              className="rounded-full px-3 py-2 text-sm font-semibold text-(--text-secondary) hover:bg-(--surface-2) hover:text-primary"
            >
              {product.shortTitle}
            </Link>
          ))}
          <a
            href="/openapi.json"
            className="rounded-full px-3 py-2 text-sm font-semibold text-(--text-secondary) hover:bg-(--surface-2) hover:text-primary"
          >
            OpenAPI JSON
          </a>
        </nav>
      </div>
      {children}
    </>
  );
}
