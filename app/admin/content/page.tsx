'use client';

import { useState, useEffect } from 'react';
import Card from '@/shared/ui/Card';
import Button from '@/shared/ui/Button';
import SearchInput from '@/shared/ui/SearchInput';
import Tag from '@/shared/ui/Tag';
import Modal from '@/shared/ui/Modal';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';

type BlogPost = {
  slug: string;
  title: string;
  date: string;
  category: string;
  published: boolean;
};

export default function ContentPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', slug: '', category: 'راهنما', content: '' });

  useEffect(() => {
    fetch('/api/admin/content')
      .then((r) => r.json())
      .then((data) => setPosts(data.posts ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = posts.filter(
    (p) => p.title.includes(search) || p.slug.includes(search) || p.category.includes(search),
  );

  const handleCreate = async () => {
    if (!newPost.title || !newPost.slug) {
      return;
    }
    await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPost),
    });
    setShowNewModal(false);
    setNewPost({ title: '', slug: '', category: 'راهنما', content: '' });
    setLoading(true);
    fetch('/api/admin/content')
      .then((r) => r.json())
      .then((data) => setPosts(data.posts ?? []))
      .finally(() => setLoading(false));
  };

  const handleDelete = async (slug: string) => {
    setPosts((prev) => prev.filter((p) => p.slug !== slug));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">مدیریت محتوا</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{posts.length} مقاله موجود است</p>
        </div>
        <Button onClick={() => setShowNewModal(true)}>مقاله جدید</Button>
      </div>

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="جستجوی مقالات..."
        className="max-w-sm"
      />

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-[var(--text-muted)]">مقاله‌ای یافت نشد</p>
          </Card>
        ) : (
          filtered.map((post) => (
            <Card key={post.slug} className="flex items-center justify-between p-4">
              <div className="space-y-1">
                <h3 className="font-semibold text-[var(--text-primary)]">{post.title}</h3>
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <span>{post.date}</span>
                  <span>•</span>
                  <Tag variant="primary">{post.category}</Tag>
                  <Tag variant={post.published ? 'success' : 'warning'}>
                    {post.published ? 'منتشر شده' : 'پیش‌نویس'}
                  </Tag>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm">
                  ویرایش
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(post.slug)}>
                  حذف
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal isOpen={showNewModal} onClose={() => setShowNewModal(false)} title="مقاله جدید">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
              عنوان
            </label>
            <input
              type="text"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              className="w-full rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-1)] px-4 py-2 text-sm text-[var(--text-primary)]"
              dir="rtl"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
              نامک (slug)
            </label>
            <input
              type="text"
              value={newPost.slug}
              onChange={(e) => setNewPost({ ...newPost, slug: e.target.value })}
              className="w-full rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-1)] px-4 py-2 font-mono text-sm text-[var(--text-primary)]"
              dir="ltr"
              placeholder="my-blog-post"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
              دسته‌بندی
            </label>
            <select
              value={newPost.category}
              onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
              className="w-full rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-1)] px-4 py-2 text-sm text-[var(--text-primary)]"
            >
              <option value="راهنما">راهنما</option>
              <option value="اخبار">اخبار</option>
              <option value="آموزشی">آموزشی</option>
              <option value="فنی">فنی</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
              محتوا (Markdown)
            </label>
            <textarea
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              rows={10}
              className="w-full rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-1)] px-4 py-2 font-mono text-sm text-[var(--text-primary)]"
              dir="ltr"
              placeholder="# Title\n\nContent here..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowNewModal(false)}>
              انصراف
            </Button>
            <Button onClick={handleCreate}>ایجاد مقاله</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
