'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui';
import { getFavorites, clearFavorites } from '@/shared/analytics/favorites';
import { getIndexableTools } from '@/lib/tools-registry';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [allTools] = useState(() => getIndexableTools());

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  const favoriteTools = allTools.filter((tool) => favorites.includes(tool.path));

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden section-surface p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgb(var(--color-primary-rgb)/0.15),_transparent_55%)]" />
        <div className="relative space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            ابزارهای مورد علاقه
          </h1>
          <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
            {favoriteTools.length > 0
              ? `${favoriteTools.length} ابزار در لیست علاقه‌مندی‌های شما`
              : 'هنوز ابزاری به علاقه‌مندی‌ها اضافه نکرده‌اید'}
          </p>
        </div>
      </section>

      {favoriteTools.length > 0 ? (
        <>
          <div className="flex justify-end">
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
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {favoriteTools.map((tool) => (
              <Link key={tool.path} href={tool.path}>
                <Card className="p-4 space-y-2 hover:shadow-[var(--shadow-medium)] hover:-translate-y-1 transition-all">
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    {tool.title.replace(' - جعبه ابزار فارسی', '')}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] line-clamp-2">
                    {tool.description}
                  </p>
                  <div className="text-xs text-[var(--color-primary)]">باز کردن →</div>
                </Card>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <Card className="p-8 text-center space-y-4">
          <div className="text-4xl">⭐</div>
          <p className="text-sm text-[var(--text-muted)]">
            روی آیکون ستاره در هر ابزار کلیک کنید تا به علاقه‌مندی‌ها اضافه شود
          </p>
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-primary)] hover:underline"
          >
            مشاهده همه ابزارها →
          </Link>
        </Card>
      )}
    </div>
  );
}
