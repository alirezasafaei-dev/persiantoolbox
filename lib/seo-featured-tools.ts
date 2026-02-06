import data from './seo-featured-tools.json';

export type FeaturedOgConfig = {
  path: string;
  title: string;
  gradient: string;
  background: string;
};

export const featuredOgTools = data as FeaturedOgConfig[];
