#!/usr/bin/env node

/**
 * Social Pack Generator — PersianToolbox Growth
 *
 * Generates structured social media content packs from a JSON definition file.
 * Validates content against the §11 UTM convention and generates
 * platform-native derivatives (reels, carousels, stories, shorts, videos,
 * posts, threads) for instagram, youtube, aparat, telegram and x.
 *
 * §11 UTM convention:
 *   utm_source={platform}
 *   utm_medium={type}_organic
 *   utm_campaign={cluster}_cycle{N}
 *   utm_content={creator}_{type}_day{N}
 *
 * Usage:
 *   npx tsx scripts/growth/social-pack-generator.ts --file=docs/growth/content-queue/day-01.json
 *   npx tsx scripts/growth/social-pack-generator.ts --validate-dir=docs/growth/social-packs/
 *   npx tsx scripts/growth/social-pack-generator.ts --week-summary=docs/growth/social-packs/week-1/
 */

import fs from 'node:fs';
import path from 'node:path';
import { generateUTM, isValidPlatform } from './utm-generator';

/** §11: Supported social platforms for organic growth tracking */
export const PLATFORMS = ['instagram', 'youtube', 'aparat', 'telegram', 'x'] as const;
export type Platform = (typeof PLATFORMS)[number];

/** §43: Platform-native derivative types */
export const DERIVATIVE_TYPES = [
  'reel',
  'carousel',
  'story',
  'short',
  'video',
  'post',
  'thread',
] as const;
export type DerivativeType = (typeof DERIVATIVE_TYPES)[number];

/** §43: Content creators */
export const CREATORS = ['rose', 'founder', 'team'] as const;
export type Creator = (typeof CREATORS)[number];

/** §45: Canonical pack lifecycle states */
export const PACK_STATUSES = [
  'planned',
  'ready',
  'asset_generated',
  'qa_passed',
  'published',
  'measuring',
  'measured',
  'iterated',
] as const;
export type PackStatus = (typeof PACK_STATUSES)[number];

export interface ContentDerivative {
  platform: Platform;
  type: DerivativeType;
  creator: Creator;
  /** 0-2s hook in Persian */
  hook: string;
  /** 2-5s tension (for video formats) */
  tension?: string;
  /** 5-8s solution in Persian */
  solution: string;
  /** Call to action */
  cta: string;
  /** Full dialogue script (for video formats) */
  dialogue?: string;
  /** Platform caption with hashtags */
  caption?: string;
  /** Carousel slide content */
  slides?: string[];
  /** Cover image text */
  coverText?: string;
}

export interface SocialPack {
  day: number;
  heroTool: string;
  userProblem: string;
  masterMessage: string;
  cluster: string;
  cycle: number;
  creator: Creator;
  derivatives: ContentDerivative[];
  status: PackStatus;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Known hero tool → route mapping (kept in sync with hero-tool-scorer.ts).
 * Unknown tools fall back to `/tools/{heroTool}`.
 */
export const TOOL_PATHS: Record<string, string> = {
  'address-fa-to-en': '/text-tools/address-fa-to-en',
  'persian-ocr': '/tools/persian-ocr',
  'check-penalty': '/tools/check-penalty',
  'shamsi-gregorian': '/date-tools/shamsi-gregorian',
  salary: '/salary',
  'compress-pdf': '/pdf-tools/compress/compress-pdf',
  'add-page-numbers': '/pdf-tools/edit/add-page-numbers',
  loan: '/loan',
};

/** Resolve a hero tool id to its destination route. */
export function resolveToolPath(heroTool: string): string {
  return TOOL_PATHS[heroTool] ?? `/tools/${heroTool}`;
}

/**
 * Validate a social pack against the §45 rules:
 * - day must be 1-30
 * - heroTool, cluster must be non-empty strings
 * - cycle must be a positive integer
 * - creator must be one of: rose, founder, team
 * - status must be a canonical lifecycle state
 * - at least 1 derivative required
 * - each derivative must have platform, type, creator, hook, solution, cta
 * - platform must be a §11 platform (validated via isValidPlatform)
 */
export function validateSocialPack(pack: SocialPack): ValidationResult {
  const errors: string[] = [];

  if (!Number.isInteger(pack.day) || pack.day < 1 || pack.day > 30) {
    errors.push(`day must be an integer between 1 and 30 (got: ${pack.day})`);
  }

  if (typeof pack.heroTool !== 'string' || pack.heroTool.trim() === '') {
    errors.push('heroTool must be a non-empty string');
  }

  if (typeof pack.cluster !== 'string' || pack.cluster.trim() === '') {
    errors.push('cluster must be a non-empty string');
  }

  if (!Number.isInteger(pack.cycle) || pack.cycle < 1) {
    errors.push(`cycle must be a positive integer (got: ${pack.cycle})`);
  }

  if (!CREATORS.includes(pack.creator as Creator)) {
    errors.push(`creator must be one of: ${CREATORS.join(', ')} (got: ${pack.creator})`);
  }

  if (!PACK_STATUSES.includes(pack.status as PackStatus)) {
    errors.push(`status must be one of: ${PACK_STATUSES.join(', ')} (got: ${pack.status})`);
  }

  if (!Array.isArray(pack.derivatives) || pack.derivatives.length === 0) {
    errors.push('at least 1 derivative is required');
  } else {
    pack.derivatives.forEach((derivative, index) => {
      const label = `derivatives[${index}]`;

      if (typeof derivative !== 'object' || derivative === null) {
        errors.push(`${label} must be an object`);
        return;
      }

      if (!isValidPlatform(derivative.platform)) {
        errors.push(
          `${label}.platform must be one of: ${PLATFORMS.join(', ')} (got: ${derivative.platform})`,
        );
      }

      if (!DERIVATIVE_TYPES.includes(derivative.type as DerivativeType)) {
        errors.push(
          `${label}.type must be one of: ${DERIVATIVE_TYPES.join(', ')} (got: ${derivative.type})`,
        );
      }

      if (!CREATORS.includes(derivative.creator as Creator)) {
        errors.push(
          `${label}.creator must be one of: ${CREATORS.join(', ')} (got: ${derivative.creator})`,
        );
      }

      if (typeof derivative.hook !== 'string' || derivative.hook.trim() === '') {
        errors.push(`${label}.hook must be a non-empty string`);
      }

      if (typeof derivative.solution !== 'string' || derivative.solution.trim() === '') {
        errors.push(`${label}.solution must be a non-empty string`);
      }

      if (typeof derivative.cta !== 'string' || derivative.cta.trim() === '') {
        errors.push(`${label}.cta must be a non-empty string`);
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Generate the §11 UTM URL for a derivative.
 * Maps creator to the utm_content prefix and type to utm_medium with
 * an `_organic` suffix, per the canonical convention:
 *   utm_content={creator}_{type}_day{N}
 */
export function generateUTMForDerivative(pack: SocialPack, derivative: ContentDerivative): string {
  const url = generateUTM({
    path: resolveToolPath(pack.heroTool),
    source: derivative.platform,
    medium: `${derivative.type}_organic`,
    cluster: pack.cluster,
    cycle: pack.cycle,
    assetType: derivative.type,
    day: pack.day,
  });

  // §11: utm_content={creator}_{type}_day{N}
  const parsed = new URL(url);
  parsed.searchParams.set('utm_content', `${derivative.creator}_${derivative.type}_day${pack.day}`);
  return parsed.toString();
}

/** Generate a markdown summary table for a single pack. */
export function generatePackSummary(pack: SocialPack): string {
  const platforms = Array.from(new Set(pack.derivatives.map((d) => d.platform))).join(', ');
  const creators = Array.from(new Set(pack.derivatives.map((d) => d.creator))).join(', ');

  const rows = pack.derivatives
    .map(
      (d, index) =>
        `| ${index + 1} | ${d.platform} | ${d.type} | ${d.creator} | ${d.hook} | ${d.cta} |`,
    )
    .join('\n');

  const utmLinks = pack.derivatives
    .map((d) => `- **${d.platform} / ${d.type}**: \`${generateUTMForDerivative(pack, d)}\``)
    .join('\n');

  return `# Social Pack — Day ${pack.day}

**Tool**: ${pack.heroTool}
**Cluster**: ${pack.cluster}
**Cycle**: ${pack.cycle}
**Creator**: ${pack.creator}
**Status**: ${pack.status}
**Platforms**: ${platforms}
**Creators**: ${creators}
**User Problem**: ${pack.userProblem}
**Master Message**: ${pack.masterMessage}

## Derivatives

| # | Platform | Type | Creator | Hook | CTA |
|---|----------|------|---------|------|-----|
${rows}

## UTM Links

${utmLinks}
`;
}

/** Generate a weekly overview with totals and distributions. */
export function generateWeekSummary(packs: SocialPack[]): string {
  const totalDerivatives = packs.reduce((sum, pack) => sum + pack.derivatives.length, 0);

  const platformCounts: Record<string, number> = {};
  const creatorCounts: Record<string, number> = {};
  const statusCounts: Record<string, number> = {};

  for (const pack of packs) {
    for (const derivative of pack.derivatives) {
      platformCounts[derivative.platform] = (platformCounts[derivative.platform] ?? 0) + 1;
      creatorCounts[derivative.creator] = (creatorCounts[derivative.creator] ?? 0) + 1;
    }
    statusCounts[pack.status] = (statusCounts[pack.status] ?? 0) + 1;
  }

  const distributionTable = (counts: Record<string, number>): string => {
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) return '_No data_';
    return entries.map(([key, count]) => `| ${key} | ${count} |`).join('\n');
  };

  const days = packs.map((p) => p.day).sort((a, b) => a - b);
  const dayRange = days.length > 0 ? `${days[0]}-${days[days.length - 1]}` : '-';

  return `# Week Summary — Social Packs

**Packs**: ${packs.length}
**Derivatives**: ${totalDerivatives}
**Days Covered**: ${dayRange}

## Platform Distribution

| Platform | Count |
|----------|-------|
${distributionTable(platformCounts)}

## Creator Distribution

| Creator | Count |
|---------|-------|
${distributionTable(creatorCounts)}

## Status Counts

| Status | Count |
|--------|-------|
${distributionTable(statusCounts)}
`;
}

/**
 * Load and validate all packs from a JSON file containing an array of
 * SocialPack objects. Throws with detailed errors when any pack is invalid.
 */
export function loadPacksFromFile(filePath: string): SocialPack[] {
  let raw: string;
  try {
    raw = fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    throw new Error(
      `Failed to read pack file "${filePath}": ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch (error) {
    throw new Error(
      `Failed to parse JSON in "${filePath}": ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  if (!Array.isArray(data)) {
    throw new Error(`Pack file "${filePath}" must contain a JSON array of SocialPack objects`);
  }

  const packs: SocialPack[] = [];
  const invalid: string[] = [];

  data.forEach((item, index) => {
    const result = validateSocialPack(item as SocialPack);
    if (result.valid) {
      packs.push(item as SocialPack);
    } else {
      invalid.push(`pack[${index}]: ${result.errors.join('; ')}`);
    }
  });

  if (invalid.length > 0) {
    throw new Error(
      `Invalid pack(s) in "${filePath}":\n${invalid.map((line) => `- ${line}`).join('\n')}`,
    );
  }

  return packs;
}

/** List all `.json` files in a directory (non-recursive). */
export function listPackFiles(dirPath: string): string[] {
  let entries: string[];
  try {
    entries = fs.readdirSync(dirPath);
  } catch (error) {
    throw new Error(
      `Failed to read directory "${dirPath}": ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  return entries
    .filter((entry) => entry.endsWith('.json'))
    .map((entry) => path.join(dirPath, entry))
    .sort();
}

function printUsage(): void {
  console.log(`Social Pack Generator — PersianToolbox Growth

Usage:
  npx tsx scripts/growth/social-pack-generator.ts --file=<path>
      Generate a markdown summary for each pack in a JSON file.

  npx tsx scripts/growth/social-pack-generator.ts --validate-dir=<dir>
      Validate all JSON pack files in a directory (exit 1 on any failure).

  npx tsx scripts/growth/social-pack-generator.ts --week-summary=<dir>
      Generate a weekly overview from all JSON pack files in a directory.

  npx tsx scripts/growth/social-pack-generator.ts --help
      Show this help.`);
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    printUsage();
    return;
  }

  const fileArg = args.find((arg) => arg.startsWith('--file='));
  const validateDirArg = args.find((arg) => arg.startsWith('--validate-dir='));
  const weekSummaryArg = args.find((arg) => arg.startsWith('--week-summary='));

  if (fileArg) {
    const filePath = fileArg.split('=')[1];
    if (!filePath) {
      console.error('Missing value for --file');
      process.exit(1);
    }
    const packs = loadPacksFromFile(filePath);
    for (const pack of packs) {
      console.log(generatePackSummary(pack));
    }
    console.log(`✅ ${packs.length} pack(s) loaded from ${filePath}`);
    return;
  }

  if (validateDirArg) {
    const dirPath = validateDirArg.split('=')[1];
    if (!dirPath) {
      console.error('Missing value for --validate-dir');
      process.exit(1);
    }
    const files = listPackFiles(dirPath);
    if (files.length === 0) {
      console.error(`No JSON pack files found in "${dirPath}"`);
      process.exit(1);
    }
    let failed = 0;
    for (const file of files) {
      try {
        const packs = loadPacksFromFile(file);
        console.log(`✅ ${path.basename(file)}: ${packs.length} pack(s) valid`);
      } catch (error) {
        failed += 1;
        console.error(
          `❌ ${path.basename(file)}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
    if (failed > 0) {
      console.error(`${failed} file(s) failed validation`);
      process.exit(1);
    }
    console.log(`✅ All ${files.length} file(s) valid`);
    return;
  }

  if (weekSummaryArg) {
    const dirPath = weekSummaryArg.split('=')[1];
    if (!dirPath) {
      console.error('Missing value for --week-summary');
      process.exit(1);
    }
    const files = listPackFiles(dirPath);
    const packs: SocialPack[] = [];
    for (const file of files) {
      packs.push(...loadPacksFromFile(file));
    }
    console.log(generateWeekSummary(packs));
    return;
  }

  printUsage();
  process.exit(1);
}

// Only run main when executed directly, not when imported
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
