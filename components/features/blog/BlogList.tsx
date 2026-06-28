import { getAllPosts, getAllCategories } from '@/lib/blog';
import type { BlogPostMeta } from '@/lib/blog';
import BlogListClient from './BlogListClient';

type Props = {
  category?: string;
  posts?: BlogPostMeta[];
};

export default function BlogList({ category, posts: postsProp }: Props) {
  const allPosts = postsProp ?? getAllPosts();
  const posts = category ? allPosts.filter((p) => p.category === category) : allPosts;
  const categories = getAllCategories();

  return <BlogListClient posts={posts} categories={categories} category={category} />;
}
