'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Card from '@/shared/ui/Card';
import SearchInput from '@/shared/ui/SearchInput';
import Tag from '@/shared/ui/Tag';
import Avatar from '@/shared/ui/Avatar';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';
import Button from '@/shared/ui/Button';
import Modal from '@/shared/ui/Modal';
import Pagination from '@/shared/ui/Pagination';
import StatCard from '@/shared/ui/StatCard';

type User = {
  id: string;
  email: string;
  createdAt: string;
  role: string;
  banned: boolean;
  subscription: string;
  subscriptionStatus: string;
  usageCount: number;
  lastActive: string;
};

type UserDetail = {
  user: {
    id: string;
    email: string;
    createdAt: string;
    role: string;
    banned: boolean;
  };
  subscription: { plan: string; status: string; expires: string };
  payments: { count: number; totalPaid: number };
  usage: { count: number; tools: string[] };
  sessions: number;
  recentHistory: Array<{ tool: string; inputSummary: string; createdAt: string }>;
};

type UsersResponse = {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'مدیر',
  editor: 'ویرایشگر',
  user: 'کاربر',
};

const ROLE_VARIANTS: Record<string, 'danger' | 'warning' | 'default'> = {
  admin: 'danger',
  editor: 'warning',
  user: 'default',
};

const SUB_LABELS: Record<string, string> = {
  free: 'رایگان',
  basic: 'پایه',
  pro: 'حرفه‌ای',
  premium: 'حرفه‌ای',
};

function downloadCSV(users: User[]) {
  const header = 'ایمیل,تاریخ عضویت,نقش,وضعیت,اشتراک,تعداد استفاده';
  const rows = users.map(
    (u) =>
      `${u.email},${u.createdAt},${ROLE_LABELS[u.role] ?? u.role},${u.banned ? 'مسدود' : 'فعال'},${SUB_LABELS[u.subscription] ?? u.subscription},${u.usageCount}`,
  );
  const csv = `\uFEFF${[header, ...rows].join('\n')}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [subFilter, setSubFilter] = useState('');
  const [bannedFilter, setBannedFilter] = useState('');

  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [updatingBan, setUpdatingBan] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) {
        params.set('search', debouncedSearch);
      }
      if (roleFilter) {
        params.set('role', roleFilter);
      }
      if (subFilter) {
        params.set('subscription', subFilter);
      }
      if (bannedFilter) {
        params.set('banned', bannedFilter);
      }
      params.set('page', String(page));
      params.set('limit', '50');

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data: UsersResponse = await res.json();
      setUsers(data.users ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, roleFilter, subFilter, bannedFilter, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, roleFilter, subFilter, bannedFilter]);

  const openDetail = async (userId: string) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      const data: UserDetail = await res.json();
      setSelectedUser(data);
    } catch {
      setSelectedUser(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingRole(userId);
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      if (selectedUser?.user.id === userId) {
        setSelectedUser((prev) =>
          prev ? { ...prev, user: { ...prev.user, role: newRole } } : prev,
        );
      }
    } catch {
      // ignore
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleBanToggle = async (userId: string, banned: boolean) => {
    setUpdatingBan(userId);
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banned }),
      });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, banned } : u)));
      if (selectedUser?.user.id === userId) {
        setSelectedUser((prev) => (prev ? { ...prev, user: { ...prev.user, banned } } : prev));
      }
    } catch {
      // ignore
    } finally {
      setUpdatingBan(null);
    }
  };

  const stats = useMemo(() => {
    return {
      total,
      active: users.filter((u) => !u.banned).length,
      banned: users.filter((u) => u.banned).length,
      premium: users.filter((u) => u.subscription !== 'free').length,
    };
  }, [users, total]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[var(--text-primary)]">مدیریت کاربران</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">{total} کاربر ثبت‌نام شده</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard title="کل کاربران" value={total} icon="👥" />
        <StatCard title="فعال (صفحه جاری)" value={stats.active} icon="✅" />
        <StatCard title="مسدود شده (صفحه جاری)" value={stats.banned} icon="🚫" />
        <StatCard title="پریمیوم (صفحه جاری)" value={stats.premium} icon="⭐" />
      </div>
      <p className="text-xs text-[var(--text-muted)]">
        صفحه {page + 1} از {Math.ceil(total / 50) || 1} — آمار فعال/مسدود/پریمیوم مربوط به صفحه جاری
        است
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="جستجوی ایمیل..."
          className="max-w-sm flex-1"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-1)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
        >
          <option value="">همه نقش‌ها</option>
          <option value="admin">مدیر</option>
          <option value="editor">ویرایشگر</option>
          <option value="user">کاربر</option>
        </select>
        <select
          value={subFilter}
          onChange={(e) => setSubFilter(e.target.value)}
          className="rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-1)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
        >
          <option value="">همه اشتراک‌ها</option>
          <option value="free">رایگان</option>
          <option value="basic">پایه</option>
          <option value="pro">حرفه‌ای</option>
        </select>
        <select
          value={bannedFilter}
          onChange={(e) => setBannedFilter(e.target.value)}
          className="rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-1)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
        >
          <option value="">همه وضعیت‌ها</option>
          <option value="false">فعال</option>
          <option value="true">مسدود</option>
        </select>
        <Button variant="secondary" size="sm" onClick={() => downloadCSV(users)}>
          خروجی CSV
        </Button>
      </div>

      <Card className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : users.length === 0 ? (
          <div className="py-8 text-center text-[var(--text-muted)]">کاربری یافت نشد</div>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className={`flex flex-col gap-3 rounded-[var(--radius-md)] border p-4 sm:flex-row sm:items-center sm:justify-between ${
                  user.banned
                    ? 'border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5'
                    : 'border-[var(--border-light)] bg-[var(--surface-1)]'
                }`}
              >
                <button
                  type="button"
                  className="flex flex-1 items-center gap-3 text-start"
                  onClick={() => openDetail(user.id)}
                >
                  <Avatar name={user.email} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                      {user.email}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      عضویت: {user.createdAt} · {user.usageCount} استفاده
                    </p>
                  </div>
                </button>

                <div className="flex items-center gap-2">
                  <Tag variant={ROLE_VARIANTS[user.role] ?? 'default'}>
                    {ROLE_LABELS[user.role] ?? user.role}
                  </Tag>
                  <Tag variant={user.subscription === 'free' ? 'default' : 'success'}>
                    {SUB_LABELS[user.subscription] ?? user.subscription}
                  </Tag>
                  {user.banned ? <Tag variant="danger">مسدود</Tag> : null}

                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={updatingRole === user.id}
                    className="rounded-[var(--radius-sm)] border border-[var(--border-medium)] bg-[var(--surface-1)] px-2 py-1 text-xs text-[var(--text-primary)] focus:outline-none disabled:opacity-50"
                  >
                    <option value="user">کاربر</option>
                    <option value="editor">ویرایشگر</option>
                    <option value="admin">مدیر</option>
                  </select>

                  <Button
                    variant={user.banned ? 'secondary' : 'danger'}
                    size="sm"
                    isLoading={updatingBan === user.id}
                    onClick={() => handleBanToggle(user.id, !user.banned)}
                  >
                    {user.banned ? 'رفع مسدودی' : 'مسدود'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Pagination current={page} total={total} pageSize={50} onChange={setPage} />

      <Modal
        isOpen={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedUser(null);
        }}
        title="جزئیات کاربر"
        maxWidth="max-w-2xl"
      >
        {detailLoading ? (
          <div className="flex items-center justify-center py-10">
            <LoadingSpinner size="lg" />
          </div>
        ) : selectedUser ? (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar name={selectedUser.user.email} size="lg" />
              <div>
                <p className="text-lg font-bold text-[var(--text-primary)]">
                  {selectedUser.user.email}
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  عضویت: {selectedUser.user.createdAt}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <Tag variant={ROLE_VARIANTS[selectedUser.user.role] ?? 'default'}>
                    {ROLE_LABELS[selectedUser.user.role] ?? selectedUser.user.role}
                  </Tag>
                  {selectedUser.user.banned ? <Tag variant="danger">مسدود</Tag> : null}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-3 text-center">
                <p className="text-2xl font-black text-[var(--text-primary)]">
                  {selectedUser.usage.count}
                </p>
                <p className="text-xs text-[var(--text-muted)]">تعداد استفاده</p>
              </div>
              <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-3 text-center">
                <p className="text-2xl font-black text-[var(--text-primary)]">
                  {selectedUser.sessions}
                </p>
                <p className="text-xs text-[var(--text-muted)]">نشست‌ها</p>
              </div>
              <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-3 text-center">
                <p className="text-2xl font-black text-[var(--text-primary)]">
                  {selectedUser.payments.count}
                </p>
                <p className="text-xs text-[var(--text-muted)]">پرداخت‌ها</p>
              </div>
              <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-3 text-center">
                <p className="text-2xl font-black text-[var(--text-primary)]">
                  {selectedUser.usage.tools.length}
                </p>
                <p className="text-xs text-[var(--text-muted)]">ابزارهای استفاده شده</p>
              </div>
            </div>

            {selectedUser.subscription.plan ? (
              <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] p-4">
                <h3 className="mb-2 text-sm font-bold text-[var(--text-primary)]">اشتراک</h3>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-[var(--text-muted)]">طرح:</span>
                  <span className="text-[var(--text-primary)]">
                    {SUB_LABELS[selectedUser.subscription.plan] ?? selectedUser.subscription.plan}
                  </span>
                  <span className="text-[var(--text-muted)]">وضعیت:</span>
                  <span className="text-[var(--text-primary)]">
                    {selectedUser.subscription.status}
                  </span>
                  {selectedUser.subscription.expires ? (
                    <>
                      <span className="text-[var(--text-muted)]">انقضا:</span>
                      <span className="text-[var(--text-primary)]">
                        {selectedUser.subscription.expires}
                      </span>
                    </>
                  ) : null}
                </div>
              </div>
            ) : null}

            {selectedUser.usage.tools.length > 0 && (
              <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] p-4">
                <h3 className="mb-2 text-sm font-bold text-[var(--text-primary)]">
                  ابزارهای استفاده شده
                </h3>
                <div className="flex flex-wrap gap-1">
                  {selectedUser.usage.tools.map((tool) => (
                    <Tag key={tool} size="sm">
                      {tool}
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            {selectedUser.recentHistory.length > 0 && (
              <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] p-4">
                <h3 className="mb-2 text-sm font-bold text-[var(--text-primary)]">
                  آخرین فعالیت‌ها
                </h3>
                <div className="space-y-2">
                  {selectedUser.recentHistory.map((entry, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-primary)]">{entry.tool}</span>
                      <span className="truncate max-w-[200px] text-[var(--text-muted)]">
                        {entry.inputSummary}
                      </span>
                      <span className="text-[var(--text-muted)]">{entry.createdAt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 border-t border-[var(--border-light)] pt-4">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
                  تغییر نقش
                </label>
                <select
                  value={selectedUser.user.role}
                  onChange={(e) => handleRoleChange(selectedUser.user.id, e.target.value)}
                  disabled={updatingRole === selectedUser.user.id}
                  className="w-full rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-1)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none disabled:opacity-50"
                >
                  <option value="user">کاربر</option>
                  <option value="editor">ویرایشگر</option>
                  <option value="admin">مدیر</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  variant={selectedUser.user.banned ? 'secondary' : 'danger'}
                  size="md"
                  isLoading={updatingBan === selectedUser.user.id}
                  onClick={() => handleBanToggle(selectedUser.user.id, !selectedUser.user.banned)}
                >
                  {selectedUser.user.banned ? 'رفع مسدودی' : 'مسدود کردن'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-[var(--text-muted)]">خطا در بارگذاری اطلاعات</div>
        )}
      </Modal>
    </div>
  );
}
