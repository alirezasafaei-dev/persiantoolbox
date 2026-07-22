export type BlogAuthor = {
  id: string;
  name: string;
  bio: string;
  avatarInitials: string;
};

export const BLOG_AUTHORS: Record<string, BlogAuthor> = {
  'علیرضا صفایی': {
    id: 'alireza-safaei',
    name: 'علیرضا صفایی',
    bio: 'توسعه‌دهنده و نویسنده محتوای فنی. علاقه‌مند به ابزارهای آنلاین، برنامه‌نویسی و آموزش.',
    avatarInitials: 'ع‌ص',
  },
  'تیم فارسی': {
    id: 'team-farsi',
    name: 'تیم فارسی',
    bio: 'تیم محتوای جعبه ابزار فارسی. تولید مقالات آموزشی و راهنماهای کاربردی.',
    avatarInitials: 'ت‌ف',
  },
};

export function getAuthorById(id: string): BlogAuthor | undefined {
  return Object.values(BLOG_AUTHORS).find((a) => a.id === id);
}

export function getAuthorByName(name: string): BlogAuthor | undefined {
  return BLOG_AUTHORS[name];
}

export function getAllAuthors(): BlogAuthor[] {
  return Object.values(BLOG_AUTHORS);
}
