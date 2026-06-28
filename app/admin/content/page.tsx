'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Card from '@/shared/ui/Card';
import Button from '@/shared/ui/Button';
import SearchInput from '@/shared/ui/SearchInput';
import Tag from '@/shared/ui/Tag';
import Modal from '@/shared/ui/Modal';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';
import Tabs from '@/shared/ui/Tabs';
import Toggle from '@/shared/ui/Toggle';
import { useToast } from '@/shared/ui/toast-context';

type BlogPost = {
  slug: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
  description: string;
  published: boolean;
  author: string;
  coverImage: string;
};

type PostStats = Record<string, { views: number; likes: number; shares: number }>;

const MARKDOWN_TOOLBAR = [
  { label: 'B', action: 'bold', title: 'بولد' },
  { label: 'I', action: 'italic', title: 'ایتالیک' },
  { label: 'H1', action: 'h1', title: 'تیتر ۱' },
  { label: 'H2', action: 'h2', title: 'تیتر ۲' },
  { label: 'H3', action: 'h3', title: 'تیتر ۳' },
  { label: '🔗', action: 'link', title: 'لینک' },
  { label: '📷', action: 'image', title: 'تصویر' },
  { label: '⟨/⟩', action: 'code', title: 'کد' },
  { label: '—', action: 'hr', title: 'خط جداکننده' },
  { label: '•', action: 'ul', title: 'لیست' },
  { label: '1.', action: 'ol', title: 'لیست شماره‌دار' },
  { label: '> ', action: 'quote', title: 'نقل‌قول' },
];

function formatNumber(n: number): string {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1)}M`;
  }
  if (n >= 1_000) {
    return `${(n / 1_000).toFixed(1)}K`;
  }
  return String(n);
}

function renderMarkdownPreview(md: string): string {
  const html = md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-[var(--color-primary)] underline">$1</a>',
    )
    .replace(
      /^> (.+)$/gm,
      '<blockquote class="border-r-4 border-[var(--color-primary)] pr-4 text-[var(--text-muted)] italic">$1</blockquote>',
    )
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^---$/gm, '<hr class="border-[var(--border-light)]" />')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');
  return `<p>${html}</p>`;
}

function applyMarkdownAction(textarea: HTMLTextAreaElement, action: string): string {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const selected = text.substring(start, end);
  const before = text.substring(0, start);
  const after = text.substring(end);

  const wrappers: Record<string, [string, string, string]> = {
    bold: ['**', '**', selected || 'متن بولد'],
    italic: ['*', '*', selected || 'متن ایتالیک'],
    h1: ['# ', '', selected || 'تیتر اول'],
    h2: ['## ', '', selected || 'تیتر دوم'],
    h3: ['### ', '', selected || 'تیتر سوم'],
    link: ['[', '](https://)', selected || 'متن لینک'],
    image: ['![', '](url)', selected || 'توضیح تصویر'],
    code: ['`', '`', selected || 'کد'],
    hr: ['\n---\n', '', ''],
    ul: ['- ', '', selected || 'آیتم لیست'],
    ol: ['1. ', '', selected || 'آیتم لیست'],
    quote: ['> ', '', selected || 'نقل‌قول'],
  };

  const [pre, post, fallback] = wrappers[action] ?? ['', '', ''];
  const insertion = selected || fallback;
  return before + pre + insertion + post + after;
}

function generateStats(posts: BlogPost[]): PostStats {
  const stats: PostStats = {};
  posts.forEach((post, i) => {
    stats[post.slug] = {
      views: (i + 1) * 150,
      likes: (i + 1) * 12,
      shares: (i + 1) * 5,
    };
  });
  return stats;
}

export default function ContentPage() {
  const { showToast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('همه');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [editorForm, setEditorForm] = useState({
    title: '',
    slug: '',
    category: 'آموزشی',
    tags: '',
    description: '',
    content: '',
    published: false,
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  const [showTagModal, setShowTagModal] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [editingTag, setEditingTag] = useState<string | null>(null);

  const stats = useMemo(() => generateStats(posts), [posts]);

  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAutoSaveRef = useRef<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorFormRef = useRef(editorForm);

  useEffect(() => {
    editorFormRef.current = editorForm;
  }, [editorForm]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleAutoSave = useCallback(async () => {
    const form = editorFormRef.current;
    if (!form.title || !form.slug) {
      return;
    }
    try {
      const tagsArray = form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      if (editingPost) {
        await fetch('/api/admin/content', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug: editingPost.slug,
            title: form.title,
            category: form.category,
            tags: tagsArray,
            description: form.description,
            content: form.content,
            published: form.published,
          }),
        });
      } else {
        const slug = form.slug.replace(/\s+/g, '-').toLowerCase();
        await fetch('/api/admin/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug,
            title: form.title,
            category: form.category,
            tags: tagsArray,
            description: form.description,
            content: form.content,
            published: form.published,
          }),
        });
      }
      showToast('پیش‌نویس ذخیره شد', 'info');
    } catch {
      showToast('خطا در ذخیره خودکار', 'error');
    }
  }, [editingPost, showToast]);

  useEffect(() => {
    if (!showEditor) {
      return;
    }
    autoSaveRef.current = setInterval(() => {
      const now = Date.now();
      if (now - lastAutoSaveRef.current > 25000) {
        lastAutoSaveRef.current = now;
        handleAutoSave();
      }
    }, 30000);
    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, [showEditor, handleAutoSave]);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/content');
      const data = await res.json();
      setPosts(data.posts ?? []);
      setCategories(data.categories ?? []);
      setTags(data.tags ?? []);
    } catch {
      showToast('خطا در بارگذاری مقالات', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchSearch =
        p.title.includes(search) ||
        p.slug.includes(search) ||
        p.description.includes(search) ||
        p.tags.some((t) => t.includes(search));
      const matchCategory = filterCategory === 'همه' || p.category === filterCategory;
      const matchStatus =
        filterStatus === 'all' ||
        (filterStatus === 'published' && p.published) ||
        (filterStatus === 'draft' && !p.published);
      return matchSearch && matchCategory && matchStatus;
    });
  }, [posts, search, filterCategory, filterStatus]);

  const allVisibleSelected = filtered.length > 0 && filtered.every((p) => selectedIds.has(p.slug));

  const toggleSelectAll = useCallback(() => {
    if (allVisibleSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((p) => p.slug)));
    }
  }, [allVisibleSelected, filtered]);

  const toggleSelect = useCallback((slug: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  }, []);

  const openEditor = useCallback((post?: BlogPost) => {
    if (post) {
      setEditingPost(post);
      setEditorForm({
        title: post.title,
        slug: post.slug,
        category: post.category,
        tags: post.tags.join(', '),
        description: post.description,
        content: '',
        published: post.published,
      });
    } else {
      setEditingPost(null);
      setEditorForm({
        title: '',
        slug: '',
        category: 'آموزشی',
        tags: '',
        description: '',
        content: '',
        published: false,
      });
    }
    setPreviewMode(false);
    setShowEditor(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!editorForm.title || !editorForm.slug) {
      showToast('عنوان و نامک الزامی هستند', 'error');
      return;
    }
    setSaving(true);
    try {
      const slug = editorForm.slug.replace(/\s+/g, '-').toLowerCase();
      const tagsArray = editorForm.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      if (editingPost) {
        await fetch('/api/admin/content', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug: editingPost.slug,
            title: editorForm.title,
            category: editorForm.category,
            tags: tagsArray,
            description: editorForm.description,
            content: editorForm.content,
            published: editorForm.published,
          }),
        });
        showToast('مقاله بروزرسانی شد', 'success');
      } else {
        await fetch('/api/admin/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug,
            title: editorForm.title,
            category: editorForm.category,
            tags: tagsArray,
            description: editorForm.description,
            content: editorForm.content,
            published: editorForm.published,
          }),
        });
        showToast('مقاله ایجاد شد', 'success');
      }
      setShowEditor(false);
      setLoading(true);
      await fetchPosts();
    } catch {
      showToast('خطا در ذخیره مقاله', 'error');
    } finally {
      setSaving(false);
    }
  }, [editorForm, editingPost, showToast, fetchPosts]);

  const handleBulkAction = useCallback(
    async (action: 'publish' | 'unpublish' | 'delete') => {
      const slugs = Array.from(selectedIds);
      if (slugs.length === 0) {
        showToast('هیچ مقاله‌ای انتخاب نشده', 'info');
        return;
      }

      if (action === 'delete') {
        // eslint-disable-next-line no-alert
        const confirmed = window.confirm(`آیا از حذف ${slugs.length} مقاله مطمئن هستید؟`);
        if (!confirmed) {
          return;
        }
      }

      try {
        await fetch('/api/admin/content', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, slugs }),
        });
        const actionLabels: Record<string, string> = {
          publish: 'منتشر شد',
          unpublish: 'پیش‌نویس شد',
          delete: 'حذف شد',
        };
        showToast(`${slugs.length} مقاله ${actionLabels[action]}`, 'success');
        setSelectedIds(new Set());
        setLoading(true);
        await fetchPosts();
      } catch {
        showToast('خطا در انجام عملیات', 'error');
      }
    },
    [selectedIds, showToast, fetchPosts],
  );

  const handleDeleteSingle = useCallback(
    async (slug: string) => {
      try {
        await fetch('/api/admin/content', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug }),
        });
        showToast('مقاله حذف شد', 'success');
        setShowDeleteConfirm(null);
        setLoading(true);
        await fetchPosts();
      } catch {
        showToast('خطا در حذف مقاله', 'error');
      }
    },
    [showToast, fetchPosts],
  );

  const handleAddCategory = useCallback(async () => {
    if (!newCategory.trim()) {
      return;
    }
    const trimmed = newCategory.trim();
    if (categories.includes(trimmed)) {
      showToast('این دسته‌بندی قبلاً اضافه شده', 'info');
      return;
    }
    setCategories((prev) => [...prev, trimmed]);
    setNewCategory('');
    setShowCategoryModal(false);
    showToast('دسته‌بندی اضافه شد', 'success');
  }, [newCategory, categories, showToast]);

  const handleDeleteCategory = useCallback(
    (cat: string) => {
      setCategories((prev) => prev.filter((c) => c !== cat));
      showToast('دسته‌بندی حذف شد', 'success');
    },
    [showToast],
  );

  const handleRenameCategory = useCallback(
    (oldName: string) => {
      if (!editingCategory?.trim()) {
        return;
      }
      const newName = editingCategory.trim();
      setCategories((prev) => prev.map((c) => (c === oldName ? newName : c)));
      setEditingCategory(null);
      showToast('دسته‌بندی بروزرسانی شد', 'success');
    },
    [editingCategory, showToast],
  );

  const handleAddTag = useCallback(async () => {
    if (!newTag.trim()) {
      return;
    }
    const trimmed = newTag.trim();
    if (tags.includes(trimmed)) {
      showToast('این برچسب قبلاً اضافه شده', 'info');
      return;
    }
    setTags((prev) => [...prev, trimmed]);
    setNewTag('');
    setShowTagModal(false);
    showToast('برچسب اضافه شد', 'success');
  }, [newTag, tags, showToast]);

  const handleDeleteTag = useCallback(
    (tag: string) => {
      setTags((prev) => prev.filter((t) => t !== tag));
      showToast('برچسب حذف شد', 'success');
    },
    [showToast],
  );

  const handleRenameTag = useCallback(
    (oldName: string) => {
      if (!editingTag?.trim()) {
        return;
      }
      const newName = editingTag.trim();
      setTags((prev) => prev.map((t) => (t === oldName ? newName : t)));
      setEditingTag(null);
      showToast('برچسب بروزرسانی شد', 'success');
    },
    [editingTag, showToast],
  );

  const handleToolbarAction = useCallback((action: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }
    const newText = applyMarkdownAction(textarea, action);
    setEditorForm((prev) => ({ ...prev, content: newText }));
  }, []);

  const publishedCount = posts.filter((p) => p.published).length;
  const draftCount = posts.filter((p) => !p.published).length;
  const totalViews = Object.values(stats).reduce((sum, s) => sum + s.views, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const postsTabContent = (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="جستجوی مقالات..."
          className="max-w-xs"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-1)] px-3 py-2 text-sm text-[var(--text-primary)]"
        >
          <option value="همه">همه دسته‌بندی‌ها</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'all' | 'published' | 'draft')}
          className="rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-1)] px-3 py-2 text-sm text-[var(--text-primary)]"
        >
          <option value="all">همه وضعیت‌ها</option>
          <option value="published">منتشر شده</option>
          <option value="draft">پیش‌نویس</option>
        </select>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-primary)] bg-[var(--color-primary)]/10 px-4 py-3">
          <span className="text-sm font-semibold text-[var(--color-primary)]">
            {selectedIds.size} مقاله انتخاب شده
          </span>
          <Button size="sm" variant="primary" onClick={() => handleBulkAction('publish')}>
            انتشار
          </Button>
          <Button size="sm" variant="secondary" onClick={() => handleBulkAction('unpublish')}>
            پیش‌نویس
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleBulkAction('delete')}>
            حذف
          </Button>
        </div>
      )}

      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-[var(--text-muted)]">مقاله‌ای یافت نشد</p>
        </Card>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-[var(--text-muted)]">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleSelectAll}
              className="h-4 w-4 rounded border-[var(--border-medium)] accent-[var(--color-primary)]"
              aria-label="انتخاب همه"
            />
            <span className="w-10">وضعیت</span>
            <span className="flex-1">عنوان</span>
            <span className="hidden w-24 sm:block">دسته</span>
            <span className="hidden w-20 sm:block">تاریخ</span>
            <span className="hidden w-20 text-center md:block">آمار</span>
            <span className="w-28 text-start">عملیات</span>
          </div>
          {filtered.map((post) => {
            const postStats = stats[post.slug] ?? { views: 0, likes: 0, shares: 0 };
            return (
              <div
                key={post.slug}
                className={`flex items-center gap-3 rounded-[var(--radius-md)] border px-4 py-3 transition-colors ${
                  selectedIds.has(post.slug)
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                    : 'border-[var(--border-light)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(post.slug)}
                  onChange={() => toggleSelect(post.slug)}
                  className="h-4 w-4 rounded border-[var(--border-medium)] accent-[var(--color-primary)]"
                  aria-label={`انتخاب ${post.title}`}
                />
                <Tag variant={post.published ? 'success' : 'warning'} size="sm">
                  {post.published ? 'منتشر' : 'پیش‌نویس'}
                </Tag>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-[var(--text-primary)]">
                    {post.title}
                  </h3>
                  {post.description ? (
                    <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">
                      {post.description}
                    </p>
                  ) : null}
                  {post.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {post.tags.slice(0, 3).map((t) => (
                        <Tag key={t} size="sm">
                          {t}
                        </Tag>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="text-xs text-[var(--text-muted)]">
                          +{post.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <span className="hidden sm:inline-flex">
                  <Tag variant="primary" size="sm">
                    {post.category}
                  </Tag>
                </span>
                <span className="hidden w-24 text-xs text-[var(--text-muted)] sm:block">
                  {post.date}
                </span>
                <div className="hidden w-20 text-center text-xs text-[var(--text-muted)] md:block">
                  <div className="flex flex-col gap-0.5">
                    <span>👁 {formatNumber(postStats.views)}</span>
                    <span>❤ {formatNumber(postStats.likes)}</span>
                    <span>↗ {formatNumber(postStats.shares)}</span>
                  </div>
                </div>
                <div className="flex w-28 justify-end gap-1">
                  <Button variant="secondary" size="sm" onClick={() => openEditor(post)}>
                    ویرایش
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(post.slug)}
                  >
                    حذف
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const categoriesTabContent = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">{categories.length} دسته‌بندی موجود</p>
        <Button
          size="sm"
          onClick={() => {
            setShowCategoryModal(true);
            setEditingCategory(null);
            setNewCategory('');
          }}
        >
          دسته‌بندی جدید
        </Button>
      </div>
      <div className="space-y-2">
        {categories.map((cat) => (
          <div
            key={cat}
            className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3"
          >
            {editingCategory === cat ? (
              <div className="flex flex-1 items-center gap-2">
                <input
                  type="text"
                  value={editingCategory}
                  onChange={(e) => setEditingCategory(e.target.value)}
                  className="flex-1 rounded-[var(--radius-sm)] border border-[var(--color-primary)] bg-[var(--surface-1)] px-3 py-1.5 text-sm text-[var(--text-primary)]"
                  dir="rtl"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleRenameCategory(cat);
                    }
                    if (e.key === 'Escape') {
                      setEditingCategory(null);
                    }
                  }}
                />
                <Button size="sm" variant="primary" onClick={() => handleRenameCategory(cat)}>
                  ذخیره
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setEditingCategory(null)}>
                  انصراف
                </Button>
              </div>
            ) : (
              <>
                <div>
                  <span className="font-semibold text-[var(--text-primary)]">{cat}</span>
                  <span className="mr-2 text-xs text-[var(--text-muted)]">
                    ({posts.filter((p) => p.category === cat).length} مقاله)
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setEditingCategory(cat)}>
                    ویرایش
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      const count = posts.filter((p) => p.category === cat).length;
                      if (count > 0) {
                        showToast(`این دسته‌بندی ${count} مقاله دارد`, 'error');
                        return;
                      }
                      handleDeleteCategory(cat);
                    }}
                  >
                    حذف
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const tagsTabContent = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">{tags.length} برچسب موجود</p>
        <Button
          size="sm"
          onClick={() => {
            setShowTagModal(true);
            setEditingTag(null);
            setNewTag('');
          }}
        >
          برچسب جدید
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <div
            key={tag}
            className="flex items-center gap-1 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-3 py-1.5"
          >
            {editingTag === tag ? (
              <input
                type="text"
                value={editingTag}
                onChange={(e) => setEditingTag(e.target.value)}
                className="w-24 rounded border border-[var(--color-primary)] bg-[var(--surface-1)] px-2 py-0.5 text-sm text-[var(--text-primary)]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRenameTag(tag);
                  }
                  if (e.key === 'Escape') {
                    setEditingTag(null);
                  }
                }}
              />
            ) : (
              <>
                <span className="text-sm font-semibold text-[var(--text-primary)]">{tag}</span>
                <span className="text-xs text-[var(--text-muted)]">
                  ({posts.filter((p) => p.tags.includes(tag)).length})
                </span>
                <button
                  type="button"
                  onClick={() => setEditingTag(tag)}
                  className="ml-1 text-[var(--text-muted)] hover:text-[var(--color-primary)]"
                  aria-label="ویرایش برچسب"
                >
                  ✏️
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteTag(tag)}
                  className="text-[var(--text-muted)] hover:text-[var(--color-danger)]"
                  aria-label="حذف برچسب"
                >
                  ✕
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">مدیریت محتوا</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {posts.length} مقاله • {publishedCount} منتشر شده • {draftCount} پیش‌نویس
          </p>
        </div>
        <Button onClick={() => openEditor()}>مقاله جدید</Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-4">
          <div className="text-xs text-[var(--text-muted)]">کل مقالات</div>
          <div className="mt-1 text-2xl font-black text-[var(--text-primary)]">{posts.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-[var(--text-muted)]">منتشر شده</div>
          <div className="mt-1 text-2xl font-black text-[var(--color-success)]">
            {publishedCount}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-[var(--text-muted)]">پیش‌نویس</div>
          <div className="mt-1 text-2xl font-black text-[var(--color-warning)]">{draftCount}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-[var(--text-muted)]">بازدید کل</div>
          <div className="mt-1 text-2xl font-black text-[var(--color-primary)]">
            {formatNumber(totalViews)}
          </div>
        </Card>
      </div>

      <Tabs
        tabs={[
          { id: 'posts', label: 'مقالات', content: postsTabContent },
          {
            id: 'categories',
            label: `دسته‌بندی‌ها (${categories.length})`,
            content: categoriesTabContent,
          },
          { id: 'tags', label: `برچسب‌ها (${tags.length})`, content: tagsTabContent },
        ]}
      />

      <Modal
        isOpen={showEditor}
        onClose={() => setShowEditor(false)}
        title={editingPost ? 'ویرایش مقاله' : 'مقاله جدید'}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
                عنوان
              </label>
              <input
                type="text"
                value={editorForm.title}
                onChange={(e) => setEditorForm({ ...editorForm, title: e.target.value })}
                className="w-full rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-1)] px-4 py-2 text-sm text-[var(--text-primary)]"
                dir="rtl"
                placeholder="عنوان مقاله"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
                نامک (slug)
              </label>
              <input
                type="text"
                value={editorForm.slug}
                onChange={(e) => setEditorForm({ ...editorForm, slug: e.target.value })}
                className="w-full rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-1)] px-4 py-2 font-mono text-sm text-[var(--text-primary)]"
                dir="ltr"
                placeholder="my-blog-post"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
                دسته‌بندی
              </label>
              <select
                value={editorForm.category}
                onChange={(e) => setEditorForm({ ...editorForm, category: e.target.value })}
                className="w-full rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-1)] px-4 py-2 text-sm text-[var(--text-primary)]"
              >
                {categories.length > 0 ? (
                  categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="آموزشی">آموزشی</option>
                    <option value="راهنما">راهنما</option>
                    <option value="اخبار">اخبار</option>
                    <option value="فنی">فنی</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
                برچسب‌ها (با کاما جدا کنید)
              </label>
              <input
                type="text"
                value={editorForm.tags}
                onChange={(e) => setEditorForm({ ...editorForm, tags: e.target.value })}
                className="w-full rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-1)] px-4 py-2 text-sm text-[var(--text-primary)]"
                dir="rtl"
                placeholder="مالی, آموزش, سرمایه‌گذاری"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
              توضیحات
            </label>
            <input
              type="text"
              value={editorForm.description}
              onChange={(e) => setEditorForm({ ...editorForm, description: e.target.value })}
              className="w-full rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-1)] px-4 py-2 text-sm text-[var(--text-primary)]"
              dir="rtl"
              placeholder="توضیحات کوتاه مقاله"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-semibold text-[var(--text-primary)]">
                محتوا (Markdown)
              </label>
              <div className="flex items-center gap-2">
                <Toggle checked={previewMode} onChange={setPreviewMode} label="پیش‌نمایش" />
              </div>
            </div>

            <div className="rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-1)]">
              {!previewMode && (
                <div className="flex flex-wrap gap-1 border-b border-[var(--border-light)] px-2 py-1.5">
                  {MARKDOWN_TOOLBAR.map((btn) => (
                    <button
                      type="button"
                      key={btn.action}
                      onClick={() => handleToolbarAction(btn.action)}
                      className="rounded px-2 py-1 text-xs font-bold text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
                      title={btn.title}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              )}

              {previewMode ? (
                <div
                  className="min-h-[300px] p-4 text-sm leading-relaxed text-[var(--text-primary)] prose prose-sm max-w-none"
                  dir="rtl"
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdownPreview(editorForm.content),
                  }}
                />
              ) : (
                <textarea
                  ref={textareaRef}
                  value={editorForm.content}
                  onChange={(e) => setEditorForm({ ...editorForm, content: e.target.value })}
                  rows={15}
                  className="w-full rounded-b-[var(--radius-md)] border-none bg-transparent px-4 py-3 font-mono text-sm text-[var(--text-primary)] focus:outline-none"
                  dir="ltr"
                  placeholder="# Title\n\nWrite your blog post content here..."
                />
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Toggle
              checked={editorForm.published}
              onChange={(checked) => setEditorForm({ ...editorForm, published: checked })}
              label="منتشر شده"
            />
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setShowEditor(false)}>
                انصراف
              </Button>
              <Button onClick={handleSave} isLoading={saving}>
                {editingPost ? 'بروزرسانی' : 'ایجاد مقاله'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="تأیید حذف"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-primary)]">
            آیا از حذف این مقاله مطمئن هستید؟ این عمل قابل بازگشت نیست.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(null)}>
              انصراف
            </Button>
            <Button
              variant="danger"
              onClick={() => showDeleteConfirm && handleDeleteSingle(showDeleteConfirm)}
            >
              حذف
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="دسته‌بندی جدید"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
              نام دسته‌بندی
            </label>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-1)] px-4 py-2 text-sm text-[var(--text-primary)]"
              dir="rtl"
              placeholder="نام دسته‌بندی"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddCategory();
                }
              }}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowCategoryModal(false)}>
              انصراف
            </Button>
            <Button onClick={handleAddCategory}>افزودن</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showTagModal} onClose={() => setShowTagModal(false)} title="برچسب جدید">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-[var(--text-primary)]">
              نام برچسب
            </label>
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="w-full rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-1)] px-4 py-2 text-sm text-[var(--text-primary)]"
              dir="rtl"
              placeholder="نام برچسب"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddTag();
                }
              }}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowTagModal(false)}>
              انصراف
            </Button>
            <Button onClick={handleAddTag}>افزودن</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
