#!/usr/bin/env node

/**
 * UTM Generator — PersianToolbox Growth
 * 
 * Generates deterministic UTM URLs for content tracking.
 * 
 * Usage:
 *   node scripts/growth/utm-generator.ts \
 *     --path="/pdf-tools/compress/compress-pdf" \
 *     --source=instagram \
 *     --medium=social \
 *     --cluster=pdf_tools \
 *     --cycle=1 \
 *     --asset-type=reel \
 *     --day=1
 */

interface UTMParams {
  path: string;
  source: string;
  medium: string;
  cluster: string;
  cycle: number;
  assetType: string;
  day: number;
}

function parseArgs(args: string[]): Partial<UTMParams> {
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

function generateUTM(params: UTMParams): string {
  const base = 'https://persiantoolbox.ir';
  const url = new URL(params.path, base);
  
  url.searchParams.set('utm_source', params.source.toLowerCase());
  url.searchParams.set('utm_medium', params.medium.toLowerCase());
  url.searchParams.set('utm_campaign', `${params.cluster}_cycle${params.cycle}`);
  url.searchParams.set('utm_content', `${params.assetType}_day${params.day}`);
  
  return url.toString();
}

function validateParams(params: Partial<UTMParams>): params is UTMParams {
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
      console.error(`Missing required parameter: --${key}`);
      return false;
    }
  }
  
  return true;
}

function main() {
  const params = parseArgs(process.argv);
  
  if (!validateParams(params)) {
    process.exit(1);
  }
  
  const url = generateUTM(params);
  console.log(url);
}

main();
