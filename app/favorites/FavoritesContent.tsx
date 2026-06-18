'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui';
import { getFavorites, clearFavorites } from '@/shared/analytics/favorites';
import { getIndexableTools } from '@/lib/tools-registry';

export default function FavoritesContent() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [allTools] = useState(() => getIndexableTools());

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  const favTools = allTools.filter((tool) => favorites.includes(tool.id));

  return (
    <div className="space-y-8 py-8">
      <section className="section-surface rounded-[var(--radius-lg)] border border-[var(--border-light)] p-6 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">ابزارهای مورد علاقه</h1>
          {favTools.length > 0 && (
            <button
              type="button"
              onClick={() => {
                clearFavorites();
                setFavorites([]);
              }}
              className="text-sm text-[var(--color-danger)] hover:underline"
            >
              پاک کردن همه
            </button>
          )}
        </div>
      </section>

      {favTools.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-muted)]">
          هنوز ابزاری به علاقه‌مندی‌ها اضافه نشده است.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {favTools.map((tool) => (
            <Link key={tool.id} href={tool.path}>
              <Card className="p-4 hover:border-[var(--color-primary)] transition-colors">
                <h3 className="font-bold text-[var(--text-primary)]">
                  {tool.title.replace(' - جعبه ابزار فارسی', '')}
                </h3>
                <p className="text-sm text-[var(--text-muted)] mt-1">{tool.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
