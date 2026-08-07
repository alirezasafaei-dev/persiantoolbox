#!/usr/bin/env node

/**
 * Hero Tool Scorer — PersianToolbox Growth
 * 
 * Calculates hero tool scores based on GSC data, product analytics, and social signals.
 * 
 * Usage:
 *   node scripts/growth/hero-tool-scorer.ts
 * 
 * Output:
 *   docs/growth/hero-scores.json
 */

import fs from 'node:fs/promises';
import path from 'node:path';

export interface ToolScore {
  id: string;
  path: string;
  title: string;
  cluster: string;
  score: number;
  gsc: {
    clicks28d: number;
    impressions28d: number;
    ctr: number;
    avgPosition: number;
  };
  product: {
    starts: number;
    completions: number;
    completionRate: number;
  };
  social: {
    reach: number;
    saves: number;
    shares: number;
  };
  status: string;
  strategy: string;
  priority: 'high' | 'medium' | 'low';
}

export interface HeroScores {
  version: string;
  lastUpdated: string;
  methodology: string;
  weights: Record<string, number>;
  heroTools: ToolScore[];
  clusters: Record<string, {
    tools: number;
    avgScore: number;
    topTool: string;
    strategy: string;
  }>;
}

export const WEIGHTS = {
  searchImpressions: 0.25,
  searchClicks: 0.20,
  ctr: 0.10,
  avgPosition: 0.15,
  productStarts: 0.10,
  completionRate: 0.10,
  socialPerformance: 0.05,
  monetizationIntent: 0.05,
};

// Placeholder data — replace with real GSC/analytics data
const TOOLS_DATA: Omit<ToolScore, 'score'>[] = [
  {
    id: 'address-fa-to-en',
    path: '/text-tools/address-fa-to-en',
    title: 'تبدیل آدرس فارسی به انگلیسی',
    cluster: 'address_tools',
    gsc: { clicks28d: 38, impressions28d: 43, ctr: 0.88, avgPosition: 2.1 },
    product: { starts: 150, completions: 120, completionRate: 0.80 },
    social: { reach: 0, saves: 0, shares: 0 },
    status: '#1 Performer',
    strategy: 'Expand content cluster, add FAQ, internal linking',
    priority: 'high',
  },
  {
    id: 'persian-ocr',
    path: '/tools/persian-ocr',
    title: 'OCR فارسی',
    cluster: 'ocr_tools',
    gsc: { clicks28d: 13, impressions28d: 334, ctr: 0.039, avgPosition: 5.2 },
    product: { starts: 80, completions: 60, completionRate: 0.75 },
    social: { reach: 0, saves: 0, shares: 0 },
    status: 'High Potential',
    strategy: 'Blog content cluster, comparison articles',
    priority: 'high',
  },
  {
    id: 'check-penalty',
    path: '/tools/check-penalty',
    title: 'محاسبه تأخیر تأدیه چک',
    cluster: 'finance_tools',
    gsc: { clicks28d: 6, impressions28d: 34, ctr: 0.18, avgPosition: 4.5 },
    product: { starts: 40, completions: 35, completionRate: 0.88 },
    social: { reach: 0, saves: 0, shares: 0 },
    status: 'High Impressions',
    strategy: 'Improve CTR with better meta description',
    priority: 'high',
  },
  {
    id: 'shamsi-gregorian',
    path: '/date-tools/shamsi-gregorian',
    title: 'تبدیل تاریخ شمسی به میلادی',
    cluster: 'date_tools',
    gsc: { clicks28d: 5, impressions28d: 150, ctr: 0.033, avgPosition: 8.2 },
    product: { starts: 200, completions: 180, completionRate: 0.90 },
    social: { reach: 0, saves: 0, shares: 0 },
    status: 'Page One',
    strategy: 'Internal linking, FAQ schema',
    priority: 'medium',
  },
  {
    id: 'salary',
    path: '/salary',
    title: 'محاسبه حقوق ۱۴۰۵',
    cluster: 'finance_tools',
    gsc: { clicks28d: 4, impressions28d: 120, ctr: 0.033, avgPosition: 12.5 },
    product: { starts: 100, completions: 85, completionRate: 0.85 },
    social: { reach: 0, saves: 0, shares: 0 },
    status: 'Seasonal',
    strategy: 'Update for 1405, add comparison content',
    priority: 'medium',
  },
  {
    id: 'compress-pdf',
    path: '/pdf-tools/compress/compress-pdf',
    title: 'فشرده‌سازی PDF',
    cluster: 'pdf_tools',
    gsc: { clicks28d: 3, impressions28d: 90, ctr: 0.033, avgPosition: 9.8 },
    product: { starts: 150, completions: 130, completionRate: 0.87 },
    social: { reach: 0, saves: 0, shares: 0 },
    status: 'Evergreen',
    strategy: 'Blog tutorials, comparison articles',
    priority: 'medium',
  },
  {
    id: 'add-page-numbers',
    path: '/pdf-tools/edit/add-page-numbers',
    title: 'شماره صفحه PDF',
    cluster: 'pdf_tools',
    gsc: { clicks28d: 2, impressions28d: 60, ctr: 0.033, avgPosition: 11.2 },
    product: { starts: 80, completions: 70, completionRate: 0.88 },
    social: { reach: 0, saves: 0, shares: 0 },
    status: 'Page One Opportunity',
    strategy: 'Step-by-step guide content',
    priority: 'medium',
  },
  {
    id: 'loan',
    path: '/loan',
    title: 'محاسبه وام',
    cluster: 'finance_tools',
    gsc: { clicks28d: 2, impressions28d: 80, ctr: 0.025, avgPosition: 10.5 },
    product: { starts: 120, completions: 100, completionRate: 0.83 },
    social: { reach: 0, saves: 0, shares: 0 },
    status: 'Steady',
    strategy: 'Add comparison content, internal linking',
    priority: 'low',
  },
];

export function calculateScore(tool: Omit<ToolScore, 'score'>): number {
  // Normalize GSC metrics (0-100 scale)
  const impressionsScore = Math.min((tool.gsc.impressions28d / 350) * 100, 100);
  const clicksScore = Math.min((tool.gsc.clicks28d / 40) * 100, 100);
  const ctrScore = Math.min(tool.gsc.ctr * 100, 100);
  const positionScore = Math.max(0, 100 - (tool.gsc.avgPosition - 1) * 5);
  
  // Normalize product metrics (0-100 scale)
  const startsScore = Math.min((tool.product.starts / 200) * 100, 100);
  const completionScore = tool.product.completionRate * 100;
  
  // Normalize social metrics (0-100 scale)
  const socialScore = Math.min(
    ((tool.social.reach + tool.social.saves * 10 + tool.social.shares * 5) / 1000) * 100,
    100
  );
  
  // Monetization intent (placeholder — use pricing page visits in production)
  const monetizationScore = 50; // Default middle value
  
  // Weighted sum
  const score =
    impressionsScore * WEIGHTS.searchImpressions +
    clicksScore * WEIGHTS.searchClicks +
    ctrScore * WEIGHTS.ctr +
    positionScore * WEIGHTS.avgPosition +
    startsScore * WEIGHTS.productStarts +
    completionScore * WEIGHTS.completionRate +
    socialScore * WEIGHTS.socialPerformance +
    monetizationScore * WEIGHTS.monetizationIntent;
  
  return Math.round(score);
}

function generateHeroScores(): HeroScores {
  const heroTools: ToolScore[] = TOOLS_DATA.map((tool) => ({
    ...tool,
    score: calculateScore(tool),
  }));
  
  // Sort by score descending
  heroTools.sort((a, b) => b.score - a.score);
  
  // Group by cluster
  const clusters: Record<string, {
    tools: number;
    avgScore: number;
    topTool: string;
    strategy: string;
  }> = {};
  
  for (const tool of heroTools) {
    const cluster = tool.cluster;
    if (!clusters[cluster]) {
      clusters[cluster] = {
        tools: 0,
        avgScore: 0,
        topTool: tool.id,
        strategy: '',
      };
    }
    clusters[cluster].tools++;
    clusters[cluster].avgScore += tool.score;
  }
  
  // Calculate average scores
  for (const cluster of Object.values(clusters)) {
    cluster.avgScore = Math.round(cluster.avgScore / cluster.tools);
  }
  
  const today = new Date().toISOString().split('T')[0] ?? new Date().toISOString();
  
  return {
    version: '1.0',
    lastUpdated: today,
    methodology: 'Weighted scoring based on GSC data, product analytics, and social signals',
    weights: WEIGHTS,
    heroTools,
    clusters,
  };
}

async function main() {
  const scores = generateHeroScores();
  const outputPath = path.join(process.cwd(), 'docs/growth/hero-scores.json');
  
  await fs.writeFile(outputPath, JSON.stringify(scores, null, 2), 'utf-8');
  console.log(`Hero scores written to ${outputPath}`);
  
  const topTool = scores.heroTools[0];
  if (topTool) {
    console.log(`Top tool: ${topTool.id} (score: ${topTool.score})`);
  }
}

// Only run main when executed directly, not when imported
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Error generating hero scores:', error);
    process.exit(1);
  });
}
