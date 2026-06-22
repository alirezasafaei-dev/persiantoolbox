'use client';

import { useState, useEffect } from 'react';
import Card from '@/shared/ui/Card';
import SearchInput from '@/shared/ui/SearchInput';
import Tag from '@/shared/ui/Tag';
import Avatar from '@/shared/ui/Avatar';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';

type User = {
  id: string;
  email: string;
  createdAt: string;
  subscription: string;
  lastActive: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((data) => setUsers(data.users ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => u.email.includes(search));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[var(--text-primary)]">مدیریت کاربران</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">{users.length} کاربر ثبت‌نام شده</p>
      </div>

      <div className="flex items-center gap-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="جستجوی ایمیل..."
          className="max-w-sm"
        />
      </div>

      <Card className="p-4">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-[var(--text-muted)]">کاربری یافت نشد</div>
        ) : (
          <div className="space-y-2">
            {filtered.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={user.email} size="sm" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{user.email}</p>
                    <p className="text-xs text-[var(--text-muted)]">عضویت: {user.createdAt}</p>
                  </div>
                </div>
                <Tag variant={user.subscription === 'free' ? 'default' : 'success'}>
                  {user.subscription === 'free'
                    ? 'رایگان'
                    : user.subscription === 'basic'
                      ? 'پایه'
                      : 'حرفه‌ای'}
                </Tag>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
