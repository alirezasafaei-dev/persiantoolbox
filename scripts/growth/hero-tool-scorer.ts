#!/usr/bin/env node

/**
 * Hero Tool Scorer v2 — PersianToolbox Growth
 *
 * Calculates hero tool scores based on verified data sources.
 * All dimensions have explicit source metadata. Unavailable dimensions
 * are neutralized (weight redistributed) rather than treated as zero.
 *
 * Usage:
 *   node scripts/growth/hero-tool-scorer.ts
 *
 * Output:
 *   docs/growth/hero-scores.json
 */

import fs from 'node:fs/promises';
import path from 'node:path';

export type DataSource = {
  source: string | null;
  observed: boolean;
  note?: string;
};

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
  sources: {
    gsc: DataSource;
    product: DataSource;
    social: DataSource;
    monetization: DataSource;
  };
  componentScores?: Record<string, number>;
}

export interface HeroScores {
  version: string;
  scorerVersion: string;
  lastUpdated: string;
  dataTimestamp: string;
  methodology: string;
  weights: Record<string, number>;
  reweighting: Record<string, number>;
  heroTools: ToolScore[];
  clusters: Record<
    string,
    {
      tools: number;
      avgScore: number;
      topTool: string;
      strategy: string;
    }
  >;
}

export const WEIGHTS = {
  searchImpressions: 0.25,
  searchClicks: 0.2,
  ctr: 0.1,
  avgPosition: 0.15,
  productStarts: 0.1,
  completionRate: 0.1,
  socialPerformance: 0.05,
  monetizationIntent: 0.05,
};

/**
 * GSC data sourced from Google Search Console export.
 * Source: GSC query report, date range 2026-07-10 to 2026-08-07 (28d).
 * This is the ONLY verified data dimension.
 */
const GSC_DATA: Record<
  string,
  {
    clicks28d: number;
    impressions28d: number;
    ctr: number;
    avgPosition: number;
  }
> = {
  'address-fa-to-en': {
    clicks28d: 38,
    impressions28d: 43,
    ctr: 0.88,
    avgPosition: 2.1,
  },
  'persian-ocr': {
    clicks28d: 13,
    impressions28d: 334,
    ctr: 0.039,
    avgPosition: 5.2,
  },
  'check-penalty': {
    clicks28d: 6,
    impressions28d: 34,
    ctr: 0.18,
    avgPosition: 4.5,
  },
  'shamsi-gregorian': {
    clicks28d: 5,
    impressions28d: 150,
    ctr: 0.033,
    avgPosition: 8.2,
  },
  salary: {
    clicks28d: 4,
    impressions28d: 120,
    ctr: 0.033,
    avgPosition: 12.5,
  },
  'compress-pdf': {
    clicks28d: 3,
    impressions28d: 90,
    ctr: 0.033,
    avgPosition: 9.8,
  },
  'add-page-numbers': {
    clicks28d: 2,
    impressions28d: 60,
    ctr: 0.033,
    avgPosition: 11.2,
  },
  loan: {
    clicks28d: 2,
    impressions28d: 80,
    ctr: 0.025,
    avgPosition: 10.5,
  },
};

/**
 * Tool definitions — paths and metadata.
 * Product analytics and social metrics are NOT available — set to neutral defaults.
 */
const TOOLS_DATA: Omit<ToolScore, 'score' | 'sources' | 'componentScores'>[] = [
  {
    id: 'address-fa-to-en',
    path: '/text-tools/address-fa-to-en',
    title: 'تبدیل آدرس فارسی به انگلیسی',
    cluster: 'address_tools',
    gsc: GSC_DATA['address-fa-to-en']!,
    product: { starts: 0, completions: 0, completionRate: 0 },
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
    gsc: GSC_DATA['persian-ocr']!,
    product: { starts: 0, completions: 0, completionRate: 0 },
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
    gsc: GSC_DATA['check-penalty']!,
    product: { starts: 0, completions: 0, completionRate: 0 },
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
    gsc: GSC_DATA['shamsi-gregorian']!,
    product: { starts: 0, completions: 0, completionRate: 0 },
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
    gsc: GSC_DATA['salary']!,
    product: { starts: 0, completions: 0, completionRate: 0 },
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
    gsc: GSC_DATA['compress-pdf']!,
    product: { starts: 0, completions: 0, completionRate: 0 },
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
    gsc: GSC_DATA['add-page-numbers']!,
    product: { starts: 0, completions: 0, completionRate: 0 },
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
    gsc: GSC_DATA['loan']!,
    product: { starts: 0, completions: 0, completionRate: 0 },
    social: { reach: 0, saves: 0, shares: 0 },
    status: 'Steady',
    strategy: 'Add comparison content, internal linking',
    priority: 'low',
  },
];

export function calculateScore(
  tool: Omit<ToolScore, 'score' | 'sources' | 'componentScores'>,
  reweighting: Record<string, number>,
): number {
  // Normalize GSC metrics (0-100 scale)
  const impressionsScore = Math.min((tool.gsc.impressions28d / 350) * 100, 100);
  const clicksScore = Math.min((tool.gsc.clicks28d / 40) * 100, 100);
  const ctrScore = Math.min(tool.gsc.ctr * 100, 100);
  const positionScore = Math.max(0, 100 - (tool.gsc.avgPosition - 1) * 5);

  // Product metrics — neutralize when not observed
  const startsScore = 50; // neutral default
  const completionScore = 50; // neutral default

  // Social metrics — neutralize when not observed
  const socialScore = 0;

  // Monetization intent — neutralize when not observed
  const monetizationScore = 50; // neutral default

  // Weighted sum with reweighting
  const score =
    impressionsScore * (reweighting['searchImpressions'] ?? WEIGHTS.searchImpressions) +
    clicksScore * (reweighting['searchClicks'] ?? WEIGHTS.searchClicks) +
    ctrScore * (reweighting['ctr'] ?? WEIGHTS.ctr) +
    positionScore * (reweighting['avgPosition'] ?? WEIGHTS.avgPosition) +
    startsScore * (reweighting['productStarts'] ?? 0) +
    completionScore * (reweighting['completionRate'] ?? 0) +
    socialScore * (reweighting['socialPerformance'] ?? 0) +
    monetizationScore * (reweighting['monetizationIntent'] ?? 0);

  return Math.round(score);
}

function generateHeroScores(): HeroScores {
  const dataTimestamp = new Date().toISOString();

  // Determine which dimensions are available and redistribute weights
  const availableDimensions: Record<string, boolean> = {
    searchImpressions: true,
    searchClicks: true,
    ctr: true,
    avgPosition: true,
    productStarts: false, // no product analytics
    completionRate: false, // no product analytics
    socialPerformance: false, // no social data
    monetizationIntent: false, // no monetization data
  };

  const availableWeight = Object.entries(availableDimensions)
    .filter(([, available]) => available)
    .reduce((sum, [key]) => sum + (WEIGHTS[key as keyof typeof WEIGHTS] ?? 0), 0);

  const reweighting: Record<string, number> = {};
  for (const [key, available] of Object.entries(availableDimensions)) {
    if (available) {
      reweighting[key] = WEIGHTS[key as keyof typeof WEIGHTS] ?? 0;
    } else {
      reweighting[key] = 0;
    }
  }

  // Normalize available weights to sum to 1.0
  if (availableWeight > 0) {
    for (const [key, available] of Object.entries(availableDimensions)) {
      if (available) {
        reweighting[key] = (WEIGHTS[key as keyof typeof WEIGHTS] ?? 0) / availableWeight;
      }
    }
  }

  const heroTools: ToolScore[] = TOOLS_DATA.map((tool) => ({
    ...tool,
    sources: {
      gsc: { source: 'gsc_export_2026-07-10_to_2026-08-07', observed: true },
      product: {
        source: null,
        observed: false,
        note: 'No product analytics available — dimension neutralized',
      },
      social: {
        source: null,
        observed: false,
        note: 'No social data available — dimension neutralized',
      },
      monetization: {
        source: null,
        observed: false,
        note: 'No monetization data available — dimension neutralized',
      },
    },
    score: calculateScore(tool, reweighting),
  }));

  // Sort by score descending
  heroTools.sort((a, b) => b.score - a.score);

  // Add component scores for transparency
  for (const tool of heroTools) {
    const impressionsScore = Math.min((tool.gsc.impressions28d / 350) * 100, 100);
    const clicksScore = Math.min((tool.gsc.clicks28d / 40) * 100, 100);
    const ctrScore = Math.min(tool.gsc.ctr * 100, 100);
    const positionScore = Math.max(0, 100 - (tool.gsc.avgPosition - 1) * 5);

    tool.componentScores = {
      searchImpressions: Math.round(impressionsScore * 100) / 100,
      searchClicks: Math.round(clicksScore * 100) / 100,
      ctr: Math.round(ctrScore * 100) / 100,
      avgPosition: Math.round(positionScore * 100) / 100,
      productStarts: 50, // neutralized
      completionRate: 50, // neutralized
      socialPerformance: 0, // no data
      monetizationIntent: 50, // neutralized
    };
  }

  // Group by cluster
  const clusters: Record<
    string,
    {
      tools: number;
      avgScore: number;
      topTool: string;
      strategy: string;
    }
  > = {};

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
    version: '2.0',
    scorerVersion: 'hero-scorer@2.0.0',
    lastUpdated: today,
    dataTimestamp,
    methodology:
      'Weighted scoring using GSC data only. Product, social, and monetization dimensions neutralized due to lack of verified data. Weights redistributed to available GSC dimensions.',
    weights: { ...WEIGHTS },
    reweighting,
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
