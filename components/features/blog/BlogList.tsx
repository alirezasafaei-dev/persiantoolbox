import { getAllPosts, getAllCategories, normalizeCategoryLabel } from '@/lib/blog';
import type { BlogPostMeta } from '@/lib/blog';
import BlogListClient from './BlogListClient';

type Props = {
  category?: string;
  posts?: BlogPostMeta[];
};

export default function BlogList({ category, posts: postsProp }: Props) {
  const allPosts = postsProp ?? getAllPosts();
  let posts = allPosts;
  if (category) {
    const activeCategory = normalizeCategoryLabel(category);
    posts = allPosts.filter((post) => normalizeCategoryLabel(post.category) === activeCategory);
  }
  const categories = getAllCategories();

  return <BlogListClient posts={posts} categories={categories} category={category} />;
}
