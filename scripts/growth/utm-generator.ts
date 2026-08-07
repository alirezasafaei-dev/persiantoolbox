#!/usr/bin/env node

/**
 * UTM Generator — PersianToolbox Growth
 *
 * Generates deterministic UTM URLs for content tracking.
 *
 * Supported platforms (§11): instagram, youtube, aparat, telegram, x
 * UTM convention: utm_source={platform}, utm_medium={type}_organic,
 *   utm_campaign={cluster}_cycle{N}, utm_content={creator}_day{N}
 *
 * Usage:
 *   node scripts/growth/utm-generator.ts \
 *     --path="/pdf-tools/compress/compress-pdf" \
 *     --source=instagram \
 *     --medium=reel_organic \
 *     --cluster=pdf_tools \
 *     --cycle=1 \
 *     --asset-type=reel \
 *     --day=1
 */

/** §11: Supported social platforms for organic growth tracking */
export const SUPPORTED_PLATFORMS = ['instagram', 'youtube', 'aparat', 'telegram', 'x'] as const;

/** §11: Valid organic medium types per platform */
export const VALID_MEDIUM_TYPES = [
  'reel_organic',
  'carousel_organic',
  'story_organic',
  'post_organic',
  'short_organic',
  'video_organic',
  'community_organic',
] as const;

export interface UTMParams {
  path: string;
  source: string;
  medium: string;
  cluster: string;
  cycle: number;
  assetType: string;
  day: number;
}

export function parseArgs(args: string[]): Partial<UTMParams> {
  const params: Partial<UTMParams> = {};

  for (const arg of args.slice(2)) {
    const [key, value] = arg.replace(/^--/, '').split('=');

    if (value === undefined) continue;

    switch (key) {
      case 'path':
        params.path = value;
        break;
      case 'source':
        params.source = value;
        break;
      case 'medium':
        params.medium = value;
        break;
      case 'cluster':
        params.cluster = value;
        break;
      case 'cycle':
        params.cycle = parseInt(value, 10);
        break;
      case 'asset-type':
        params.assetType = value;
        break;
      case 'day':
        params.day = parseInt(value, 10);
        break;
    }
  }

  return params;
}

export function generateUTM(params: UTMParams): string {
  const base = 'https://persiantoolbox.ir';
  const url = new URL(params.path, base);

  const source = params.source.toLowerCase();
  url.searchParams.set('utm_source', source);
  url.searchParams.set('utm_medium', params.medium.toLowerCase());
  url.searchParams.set('utm_campaign', `${params.cluster}_cycle${params.cycle}`);
  url.searchParams.set('utm_content', `${params.assetType}_day${params.day}`);

  return url.toString();
}

/** Validate that the source is a supported platform */
export function isValidPlatform(source: string): boolean {
  return SUPPORTED_PLATFORMS.includes(source.toLowerCase() as (typeof SUPPORTED_PLATFORMS)[number]);
}

export function validateParams(params: Partial<UTMParams>): params is UTMParams {
  const required: (keyof UTMParams)[] = [
    'path',
    'source',
    'medium',
    'cluster',
    'cycle',
    'assetType',
    'day',
  ];

  for (const key of required) {
    if (params[key] === undefined) {
      return false;
    }
  }

  return true;
}

function main() {
  const params = parseArgs(process.argv);

  if (!validateParams(params)) {
    console.error('Missing required parameters');
    process.exit(1);
  }

  const url = generateUTM(params);
  console.log(url);
}

// Only run main when executed directly, not when imported
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
