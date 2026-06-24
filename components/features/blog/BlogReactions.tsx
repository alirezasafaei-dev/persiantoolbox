'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'pt-blog-reactions';

type ReactionType = 'useful' | 'interesting' | 'awesome';

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'useful', emoji: '👏', label: 'مفید' },
  { type: 'interesting', emoji: '💡', label: 'جالب' },
  { type: 'awesome', emoji: '❤️', label: 'عالی' },
];

type ReactionCounts = Record<ReactionType, number>;
type UserReactions = Record<string, ReactionType[]>;

function getReactionCounts(): Record<string, ReactionCounts> {
  if (typeof window === 'undefined') {
    return {};
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function getUserReactions(): UserReactions {
  if (typeof window === 'undefined') {
    return {};
  }
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}-user`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveReactionCounts(data: Record<string, ReactionCounts>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function saveUserReactions(data: UserReactions) {
  try {
    localStorage.setItem(`${STORAGE_KEY}-user`, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function getReactionCount(slug: string, type: ReactionType): number {
  const counts = getReactionCounts();
  return counts[slug]?.[type] ?? 0;
}

export function getTotalReactionCount(slug: string): number {
  const counts = getReactionCounts();
  const article = counts[slug];
  if (!article) {
    return 0;
  }
  return Object.values(article).reduce((sum, n) => sum + n, 0);
}

export default function BlogReactions({ slug }: { slug: string }) {
  const [counts, setCounts] = useState<ReactionCounts>({
    useful: 0,
    interesting: 0,
    awesome: 0,
  });
  const [userReactions, setUserReactions] = useState<ReactionType[]>([]);

  useEffect(() => {
    const allCounts = getReactionCounts();
    setCounts(allCounts[slug] ?? { useful: 0, interesting: 0, awesome: 0 });
    setUserReactions(getUserReactions()[slug] ?? []);
  }, [slug]);

  const handleReact = useCallback(
    (type: ReactionType) => {
      const allCounts = getReactionCounts();
      const allUser = getUserReactions();
      const currentCounts = allCounts[slug] ?? { useful: 0, interesting: 0, awesome: 0 };
      const currentUser = allUser[slug] ?? [];

      const alreadyReacted = currentUser.includes(type);

      let nextCounts: ReactionCounts;
      let nextUser: ReactionType[];

      if (alreadyReacted) {
        nextCounts = { ...currentCounts, [type]: Math.max(0, currentCounts[type] - 1) };
        nextUser = currentUser.filter((r) => r !== type);
      } else {
        nextCounts = { ...currentCounts, [type]: currentCounts[type] + 1 };
        nextUser = [...currentUser, type];
      }

      allCounts[slug] = nextCounts;
      allUser[slug] = nextUser;

      saveReactionCounts(allCounts);
      saveUserReactions(allUser);
      setCounts(nextCounts);
      setUserReactions(nextUser);
    },
    [slug],
  );

  return (
    <div className="flex items-center gap-2" role="group" aria-label="واکنش‌ها">
      {REACTIONS.map((r) => {
        const active = userReactions.includes(r.type);
        const count = counts[r.type] ?? 0;
        return (
          <button
            key={r.type}
            type="button"
            onClick={() => handleReact(r.type)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-all ${
              active
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)] shadow-sm'
                : 'border-[var(--border-light)] bg-[var(--surface-2)] text-[var(--text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
            }`}
            aria-pressed={active}
            aria-label={`${r.label} (${count})`}
          >
            <span aria-hidden="true">{r.emoji}</span>
            <span>{r.label}</span>
            {count > 0 && (
              <span className="min-w-[1.25rem] rounded-full bg-[var(--surface-3)] px-1.5 text-center text-[10px]">
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
