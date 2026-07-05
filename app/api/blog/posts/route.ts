import { NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/blog';

export const revalidate = 3600;

export function GET() {
  return NextResponse.json({
    posts: getAllPosts(),
  });
}
