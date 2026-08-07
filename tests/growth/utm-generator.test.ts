import { describe, it, expect } from 'vitest';
import { generateUTM, parseArgs, validateParams, type UTMParams } from '../../scripts/growth/utm-generator';

describe('UTM Generator', () => {
  const baseParams: UTMParams = {
    path: '/pdf-tools/compress/compress-pdf',
    source: 'instagram',
    medium: 'social',
    cluster: 'pdf_tools',
    cycle: 1,
    assetType: 'reel',
    day: 1,
  };

  describe('generateUTM', () => {
    it('generates correct UTM URL for Instagram Reel', () => {
      const url = generateUTM(baseParams);
      expect(url).toBe(
        'https://persiantoolbox.ir/pdf-tools/compress/compress-pdf?utm_source=instagram&utm_medium=social&utm_campaign=pdf_tools_cycle1&utm_content=reel_day1'
      );
    });

    it('generates correct UTM URL for Instagram Carousel', () => {
      const url = generateUTM({
        ...baseParams,
        assetType: 'carousel',
        day: 7,
      });
      expect(url).toContain('utm_content=carousel_day7');
    });

    it('generates correct UTM URL for Instagram Story', () => {
      const url = generateUTM({
        ...baseParams,
        medium: 'story',
        assetType: 'story',
        day: 5,
      });
      expect(url).toContain('utm_medium=story');
      expect(url).toContain('utm_content=story_day5');
    });

    it('generates correct UTM URL for Telegram', () => {
      const url = generateUTM({
        ...baseParams,
        source: 'telegram',
        cluster: 'ocr_tools',
        assetType: 'post',
        day: 3,
      });
      expect(url).toContain('utm_source=telegram');
      expect(url).toContain('utm_campaign=ocr_tools_cycle1');
      expect(url).toContain('utm_content=post_day3');
    });

    it('lowercases source and medium', () => {
      const url = generateUTM({
        ...baseParams,
        source: 'Instagram',
        medium: 'Social',
      });
      expect(url).toContain('utm_source=instagram');
      expect(url).toContain('utm_medium=social');
    });

    it('preserves existing query params', () => {
      const url = generateUTM({
        ...baseParams,
        path: '/tools?existing=param',
      });
      expect(url).toContain('existing=param');
      expect(url).toContain('utm_source=instagram');
    });

    it('handles URL encoding correctly', () => {
      const url = generateUTM({
        ...baseParams,
        path: '/text-tools/address-fa-to-en',
      });
      expect(url).toBe(
        'https://persiantoolbox.ir/text-tools/address-fa-to-en?utm_source=instagram&utm_medium=social&utm_campaign=pdf_tools_cycle1&utm_content=reel_day1'
      );
    });

    it('deterministic - same params produce same URL', () => {
      const url1 = generateUTM(baseParams);
      const url2 = generateUTM(baseParams);
      expect(url1).toBe(url2);
    });

    it('different cycles produce different campaign', () => {
      const url1 = generateUTM({ ...baseParams, cycle: 1 });
      const url2 = generateUTM({ ...baseParams, cycle: 2 });
      expect(url1).toContain('campaign=pdf_tools_cycle1');
      expect(url2).toContain('campaign=pdf_tools_cycle2');
    });

    it('different days produce different content', () => {
      const url1 = generateUTM({ ...baseParams, day: 1 });
      const url2 = generateUTM({ ...baseParams, day: 15 });
      expect(url1).toContain('content=reel_day1');
      expect(url2).toContain('content=reel_day15');
    });
  });

  describe('parseArgs', () => {
    it('parses all valid arguments', () => {
      const args = [
        'node',
        'script.ts',
        '--path=/tools',
        '--source=instagram',
        '--medium=social',
        '--cluster=pdf_tools',
        '--cycle=1',
        '--asset-type=reel',
        '--day=1',
      ];
      const params = parseArgs(args);
      expect(params.path).toBe('/tools');
      expect(params.source).toBe('instagram');
      expect(params.medium).toBe('social');
      expect(params.cluster).toBe('pdf_tools');
      expect(params.cycle).toBe(1);
      expect(params.assetType).toBe('reel');
      expect(params.day).toBe(1);
    });

    it('ignores unknown arguments', () => {
      const args = ['node', 'script.ts', '--path=/tools', '--unknown=value'];
      const params = parseArgs(args);
      expect(params.path).toBe('/tools');
      expect(params).not.toHaveProperty('unknown');
    });

    it('handles missing values', () => {
      const args = ['node', 'script.ts', '--path'];
      const params = parseArgs(args);
      expect(params.path).toBeUndefined();
    });
  });

  describe('validateParams', () => {
    it('returns true for valid params', () => {
      expect(validateParams(baseParams)).toBe(true);
    });

    it('returns false when path is missing', () => {
      const { path: _, ...params } = baseParams;
      expect(validateParams(params)).toBe(false);
    });

    it('returns false when source is missing', () => {
      const { source: _, ...params } = baseParams;
      expect(validateParams(params)).toBe(false);
    });

    it('returns false when medium is missing', () => {
      const { medium: _, ...params } = baseParams;
      expect(validateParams(params)).toBe(false);
    });

    it('returns false when cluster is missing', () => {
      const { cluster: _, ...params } = baseParams;
      expect(validateParams(params)).toBe(false);
    });

    it('returns false when cycle is missing', () => {
      const { cycle: _, ...params } = baseParams;
      expect(validateParams(params)).toBe(false);
    });

    it('returns false when assetType is missing', () => {
      const { assetType: _, ...params } = baseParams;
      expect(validateParams(params)).toBe(false);
    });

    it('returns false when day is missing', () => {
      const { day: _, ...params } = baseParams;
      expect(validateParams(params)).toBe(false);
    });

    it('returns false for empty object', () => {
      expect(validateParams({})).toBe(false);
    });
  });
});
