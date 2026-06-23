'use client';

import { useState } from 'react';
import Link from 'next/link';

export type SidebarItem = {
  label: string;
  href: string;
  icon?: string;
};

type Props = {
  items: SidebarItem[];
  activeHref?: string;
  collapsed?: boolean;
  onToggle?: () => void;
};

export default function Sidebar({ items, activeHref, collapsed = false, onToggle }: Props) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
    onToggle?.();
  };

  return (
    <nav
      className={`flex flex-col border-e border-[var(--border-light)] bg-[var(--surface-1)] transition-all duration-200 ${
        isCollapsed ? 'w-16' : 'w-56'
      }`}
      aria-label="ناوبری"
    >
      <button
        onClick={handleToggle}
        className="flex h-10 items-center justify-center border-b border-[var(--border-light)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        aria-label={isCollapsed ? 'باز کردن سایدبار' : 'بستن سایدبار'}
      >
        <span aria-hidden="true">{isCollapsed ? '←' : '→'}</span>
      </button>
      <ul className="flex-1 space-y-0.5 p-2">
        {items.map((item) => {
          const isActive = activeHref === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-[var(--color-primary)]/10 font-semibold text-[var(--color-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                {item.icon && <span aria-hidden="true">{item.icon}</span>}
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
