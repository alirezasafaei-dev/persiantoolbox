'use client';

import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/ui/AdminSidebar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ name: string; email: string; role?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) {
          router.push('/account');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.user) {
          const role = data.user.role;
          const isAdmin = role === 'admin' || role === 'editor';
          if (!isAdmin) {
            router.push('/account');
            return;
          }
          setUser({
            name: data.user.email.split('@')[0],
            email: data.user.email,
            role: data.user.role,
          });
        } else {
          router.push('/account');
        }
        setLoading(false);
      })
      .catch(() => {
        router.push('/account');
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[var(--border-light)] border-t-[var(--color-primary)]" />
          <p className="text-sm text-[var(--text-muted)]">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      <AdminSidebar
        userName={user?.name}
        userEmail={user?.email}
        userRole={user?.role}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
