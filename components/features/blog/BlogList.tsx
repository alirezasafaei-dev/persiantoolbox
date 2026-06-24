import { getAllPosts, getAllCategories } from '@/lib/blog';
import BlogListClient from './BlogListClient';

type Props = {
  category?: string;
};

export default function BlogList({ category }: Props) {
  const allPosts = getAllPosts();
  const posts = category ? allPosts.filter((p) => p.category === category) : allPosts;
  const categories = getAllCategories();

  return <BlogListClient posts={posts} categories={categories} category={category} />;
}
