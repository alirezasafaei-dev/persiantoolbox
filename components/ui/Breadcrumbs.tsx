'use client';

import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string | undefined;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex" aria-label="مسیر ناوبری">
      <ol className="inline-flex items-center space-x-1 md:space-x-3 space-x-reverse">
        <li className="inline-flex items-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors"
          >
            <svg
              className="w-4 h-4 me-2"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            خانه
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index}>
            <div className="flex items-center">
              <svg
                className="w-4 h-4 text-[var(--text-muted)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              {item.href && !item.current ? (
                <Link
                  href={item.href}
                  className="me-1 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors md:me-2"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className="me-1 text-sm font-medium text-[var(--text-primary)] md:me-2"
                  aria-current="page"
                >
                  {item.label}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
