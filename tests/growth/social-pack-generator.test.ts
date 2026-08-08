import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  validateSocialPack,
  generateUTMForDerivative,
  generatePackSummary,
  generateWeekSummary,
  loadPacksFromFile,
  listPackFiles,
  resolveToolPath,
  PLATFORMS,
  CREATORS,
  PACK_STATUSES,
  type SocialPack,
  type ContentDerivative,
} from '../../scripts/growth/social-pack-generator';

function makeDerivative(overrides: Partial<ContentDerivative> = {}): ContentDerivative {
  return {
    platform: 'instagram',
    type: 'reel',
    creator: 'rose',
    hook: 'میدونستی آدرس فارسیت رو میتونی تو ۳ ثانیه به انگلیسی تبدیل کنی؟',
    solution: 'فقط آدرست رو وارد کن، خروجی استاندارد بگیر.',
    cta: 'لینک در بیو',
    ...overrides,
  };
}

function makePack(overrides: Partial<SocialPack> = {}): SocialPack {
  return {
    day: 1,
    heroTool: 'address-fa-to-en',
    userProblem: 'تبدیل آدرس فارسی به انگلیسی برای پست بین‌المللی',
    masterMessage: 'آدرس فارسی رو تو ۳ ثانیه به انگلیسی تبدیل کن',
    cluster: 'address_tools',
    cycle: 1,
    creator: 'rose',
    derivatives: [makeDerivative()],
    status: 'planned',
    ...overrides,
  };
}

describe('validateSocialPack (§45)', () => {
  it('accepts a valid pack', () => {
    const result = validateSocialPack(makePack());
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects day 0', () => {
    const result = validateSocialPack(makePack({ day: 0 }));
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('day');
  });

  it('rejects day 31', () => {
    const result = validateSocialPack(makePack({ day: 31 }));
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('day');
  });

  it('rejects negative day', () => {
    const result = validateSocialPack(makePack({ day: -1 }));
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('day');
  });

  it('rejects non-integer day', () => {
    const result = validateSocialPack(makePack({ day: 1.5 }));
    expect(result.valid).toBe(false);
  });

  it('accepts boundary days 1 and 30', () => {
    expect(validateSocialPack(makePack({ day: 1 })).valid).toBe(true);
    expect(validateSocialPack(makePack({ day: 30 })).valid).toBe(true);
  });

  it('rejects empty heroTool', () => {
    const result = validateSocialPack(makePack({ heroTool: '' }));
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('heroTool');
  });

  it('rejects whitespace-only heroTool', () => {
    const result = validateSocialPack(makePack({ heroTool: '   ' }));
    expect(result.valid).toBe(false);
  });

  it('rejects empty cluster', () => {
    const result = validateSocialPack(makePack({ cluster: '' }));
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('cluster');
  });

  it('rejects non-positive cycle', () => {
    expect(validateSocialPack(makePack({ cycle: 0 })).valid).toBe(false);
    expect(validateSocialPack(makePack({ cycle: -3 })).valid).toBe(false);
  });

  it('rejects non-integer cycle', () => {
    expect(validateSocialPack(makePack({ cycle: 2.5 })).valid).toBe(false);
  });

  it('rejects invalid creator', () => {
    const result = validateSocialPack(makePack({ creator: 'ali' as SocialPack['creator'] }));
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('creator');
  });

  it('rejects invalid status', () => {
    const result = validateSocialPack(makePack({ status: 'draft' as SocialPack['status'] }));
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('status');
  });

  it('rejects empty derivatives array', () => {
    const result = validateSocialPack(makePack({ derivatives: [] }));
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('derivative');
  });

  it('rejects missing derivatives', () => {
    const pack = makePack() as Partial<SocialPack>;
    delete pack.derivatives;
    const result = validateSocialPack(pack as SocialPack);
    expect(result.valid).toBe(false);
  });

  it('rejects invalid derivative platform', () => {
    const pack = makePack({
      derivatives: [makeDerivative({ platform: 'facebook' as ContentDerivative['platform'] })],
    });
    const result = validateSocialPack(pack);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('platform');
  });

  it('rejects invalid derivative type', () => {
    const pack = makePack({
      derivatives: [makeDerivative({ type: 'meme' as ContentDerivative['type'] })],
    });
    const result = validateSocialPack(pack);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('type');
  });

  it('rejects invalid derivative creator', () => {
    const pack = makePack({
      derivatives: [makeDerivative({ creator: 'guest' as ContentDerivative['creator'] })],
    });
    const result = validateSocialPack(pack);
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('creator');
  });

  it('rejects missing hook', () => {
    const derivative = makeDerivative() as Partial<ContentDerivative>;
    delete derivative.hook;
    const result = validateSocialPack(makePack({ derivatives: [derivative as ContentDerivative] }));
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('hook');
  });

  it('rejects missing solution', () => {
    const derivative = makeDerivative() as Partial<ContentDerivative>;
    delete derivative.solution;
    const result = validateSocialPack(makePack({ derivatives: [derivative as ContentDerivative] }));
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('solution');
  });

  it('rejects missing cta', () => {
    const derivative = makeDerivative() as Partial<ContentDerivative>;
    delete derivative.cta;
    const result = validateSocialPack(makePack({ derivatives: [derivative as ContentDerivative] }));
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('cta');
  });

  it('rejects empty hook string', () => {
    const pack = makePack({ derivatives: [makeDerivative({ hook: '' })] });
    expect(validateSocialPack(pack).valid).toBe(false);
  });

  it('collects multiple errors at once', () => {
    const pack = makePack({
      day: 0,
      heroTool: '',
      derivatives: [
        makeDerivative({ platform: 'facebook' as ContentDerivative['platform'], hook: '' }),
      ],
    });
    const result = validateSocialPack(pack);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(4);
  });

  it('accepts all canonical statuses', () => {
    for (const status of PACK_STATUSES) {
      expect(validateSocialPack(makePack({ status })).valid).toBe(true);
    }
  });

  it('accepts all creators', () => {
    for (const creator of CREATORS) {
      expect(validateSocialPack(makePack({ creator })).valid).toBe(true);
    }
  });

  it('accepts all platforms', () => {
    for (const platform of PLATFORMS) {
      const pack = makePack({
        derivatives: [makeDerivative({ platform })],
      });
      expect(validateSocialPack(pack).valid).toBe(true);
    }
  });

  it('accepts a pack with maximum derivatives', () => {
    const derivatives: ContentDerivative[] = [];
    for (let i = 0; i < 30; i += 1) {
      derivatives.push(makeDerivative({ hook: `hook ${i}` }));
    }
    const result = validateSocialPack(makePack({ derivatives }));
    expect(result.valid).toBe(true);
  });
});

describe('generateUTMForDerivative (§11)', () => {
  it('generates the canonical UTM URL for an Instagram reel', () => {
    const derivative = makeDerivative();
    const pack = makePack({ derivatives: [derivative] });
    const url = generateUTMForDerivative(pack, derivative);
    expect(url).toBe(
      'https://persiantoolbox.ir/text-tools/address-fa-to-en?utm_source=instagram&utm_medium=reel_organic&utm_campaign=address_tools_cycle1&utm_content=rose_reel_day1',
    );
  });

  it('maps creator to the utm_content prefix', () => {
    const derivative = makeDerivative({ creator: 'founder', type: 'thread' });
    const pack = makePack({ derivatives: [derivative] });
    const url = generateUTMForDerivative(pack, derivative);
    expect(url).toContain('utm_content=founder_thread_day1');
  });

  it('maps type to utm_medium with _organic suffix', () => {
    const derivative = makeDerivative({ type: 'carousel' });
    const pack = makePack({ derivatives: [derivative] });
    const url = generateUTMForDerivative(pack, derivative);
    expect(url).toContain('utm_medium=carousel_organic');
  });

  it('uses pack cluster and cycle for the campaign', () => {
    const derivative = makeDerivative();
    const pack = makePack({ cluster: 'pdf_tools', cycle: 3, derivatives: [derivative] });
    const url = generateUTMForDerivative(pack, derivative);
    expect(url).toContain('utm_campaign=pdf_tools_cycle3');
  });

  it('uses pack day for utm_content', () => {
    const derivative = makeDerivative();
    const pack = makePack({ day: 15, derivatives: [derivative] });
    const url = generateUTMForDerivative(pack, derivative);
    expect(url).toContain('utm_content=rose_reel_day15');
  });

  it('uses the platform as utm_source', () => {
    const derivative = makeDerivative({ platform: 'telegram', type: 'post', creator: 'team' });
    const pack = makePack({ derivatives: [derivative] });
    const url = generateUTMForDerivative(pack, derivative);
    expect(url).toContain('utm_source=telegram');
    expect(url).toContain('utm_medium=post_organic');
    expect(url).toContain('utm_content=team_post_day1');
  });

  it('supports all 5 platforms', () => {
    const pack = makePack({ day: 7 });
    const expectations: Array<[ContentDerivative['platform'], string]> = [
      ['instagram', 'utm_source=instagram'],
      ['youtube', 'utm_source=youtube'],
      ['aparat', 'utm_source=aparat'],
      ['telegram', 'utm_source=telegram'],
      ['x', 'utm_source=x'],
    ];
    for (const [platform, expected] of expectations) {
      const derivative = makeDerivative({ platform });
      const url = generateUTMForDerivative(pack, derivative);
      expect(url).toContain(expected);
    }
  });

  it('resolves known hero tools to their routes', () => {
    expect(resolveToolPath('address-fa-to-en')).toBe('/text-tools/address-fa-to-en');
    expect(resolveToolPath('compress-pdf')).toBe('/pdf-tools/compress/compress-pdf');
    expect(resolveToolPath('persian-ocr')).toBe('/tools/persian-ocr');
    expect(resolveToolPath('salary')).toBe('/salary');
    expect(resolveToolPath('loan')).toBe('/loan');
  });

  it('falls back to /tools/{heroTool} for unknown tools', () => {
    expect(resolveToolPath('unknown-tool')).toBe('/tools/unknown-tool');
  });

  it('is deterministic for the same pack and derivative', () => {
    const derivative = makeDerivative();
    const pack = makePack({ derivatives: [derivative] });
    const url1 = generateUTMForDerivative(pack, derivative);
    const url2 = generateUTMForDerivative(pack, derivative);
    expect(url1).toBe(url2);
  });
});

describe('generatePackSummary', () => {
  it('includes day, tool, platforms, creators and status', () => {
    const pack = makePack({
      derivatives: [
        makeDerivative({ platform: 'instagram', type: 'reel' }),
        makeDerivative({ platform: 'telegram', type: 'post', creator: 'team' }),
      ],
    });
    const summary = generatePackSummary(pack);

    expect(summary).toContain('# Social Pack — Day 1');
    expect(summary).toContain('address-fa-to-en');
    expect(summary).toContain('address_tools');
    expect(summary).toContain('instagram, telegram');
    expect(summary).toContain('rose, team');
    expect(summary).toContain('planned');
  });

  it('produces a markdown table with one row per derivative', () => {
    const pack = makePack({
      derivatives: [
        makeDerivative(),
        makeDerivative({ platform: 'youtube', type: 'short', creator: 'founder' }),
        makeDerivative({ platform: 'x', type: 'thread', creator: 'founder' }),
      ],
    });
    const summary = generatePackSummary(pack);
    const rows = summary.split('\n').filter((line) => line.startsWith('| '));
    // header + 3 derivative rows (separator line starts with '|---', not '| ')
    expect(rows.length).toBe(4);
    expect(summary).toContain('| 1 | instagram | reel | rose |');
    expect(summary).toContain('| 2 | youtube | short | founder |');
    expect(summary).toContain('| 3 | x | thread | founder |');
  });

  it('includes UTM links for every derivative', () => {
    const pack = makePack();
    const summary = generatePackSummary(pack);
    expect(summary).toContain('## UTM Links');
    expect(summary).toContain('utm_source=instagram');
    expect(summary).toContain('utm_content=rose_reel_day1');
  });
});

describe('generateWeekSummary', () => {
  it('aggregates totals across packs', () => {
    const packs = [
      makePack({ day: 1, derivatives: [makeDerivative(), makeDerivative({ type: 'story' })] }),
      makePack({ day: 2, derivatives: [makeDerivative({ platform: 'telegram', type: 'post' })] }),
    ];
    const summary = generateWeekSummary(packs);
    expect(summary).toContain('**Packs**: 2');
    expect(summary).toContain('**Derivatives**: 3');
    expect(summary).toContain('**Days Covered**: 1-2');
  });

  it('reports platform distribution', () => {
    const packs = [
      makePack({ day: 1, derivatives: [makeDerivative()] }),
      makePack({ day: 2, derivatives: [makeDerivative({ platform: 'telegram', type: 'post' })] }),
      makePack({ day: 3, derivatives: [makeDerivative()] }),
    ];
    const summary = generateWeekSummary(packs);
    expect(summary).toContain('## Platform Distribution');
    expect(summary).toContain('| instagram | 2 |');
    expect(summary).toContain('| telegram | 1 |');
  });

  it('reports creator distribution', () => {
    const packs = [
      makePack({ day: 1, derivatives: [makeDerivative({ creator: 'rose' })] }),
      makePack({ day: 2, derivatives: [makeDerivative({ creator: 'founder' })] }),
      makePack({ day: 3, derivatives: [makeDerivative({ creator: 'team' })] }),
    ];
    const summary = generateWeekSummary(packs);
    expect(summary).toContain('## Creator Distribution');
    expect(summary).toContain('| rose | 1 |');
    expect(summary).toContain('| founder | 1 |');
    expect(summary).toContain('| team | 1 |');
  });

  it('reports status counts', () => {
    const packs = [
      makePack({ day: 1, status: 'planned' }),
      makePack({ day: 2, status: 'published' }),
      makePack({ day: 3, status: 'published' }),
    ];
    const summary = generateWeekSummary(packs);
    expect(summary).toContain('## Status Counts');
    expect(summary).toContain('| planned | 1 |');
    expect(summary).toContain('| published | 2 |');
  });

  it('handles an empty pack list', () => {
    const summary = generateWeekSummary([]);
    expect(summary).toContain('**Packs**: 0');
    expect(summary).toContain('**Derivatives**: 0');
    expect(summary).toContain('_No data_');
  });
});

describe('loadPacksFromFile', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'social-pack-test-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('loads and validates a file with valid packs', () => {
    const filePath = path.join(tempDir, 'day-01.json');
    fs.writeFileSync(filePath, JSON.stringify([makePack(), makePack({ day: 2 })], null, 2));
    const packs = loadPacksFromFile(filePath);
    expect(packs).toHaveLength(2);
    expect(packs[0]?.day).toBe(1);
    expect(packs[1]?.day).toBe(2);
  });

  it('throws with detailed errors when a pack is invalid', () => {
    const filePath = path.join(tempDir, 'invalid.json');
    fs.writeFileSync(
      filePath,
      JSON.stringify([makePack(), makePack({ day: 99, cluster: '' })], null, 2),
    );
    expect(() => loadPacksFromFile(filePath)).toThrow(/pack\[1\]/);
    expect(() => loadPacksFromFile(filePath)).toThrow(/day/);
    expect(() => loadPacksFromFile(filePath)).toThrow(/cluster/);
  });

  it('throws when the file does not exist', () => {
    expect(() => loadPacksFromFile(path.join(tempDir, 'missing.json'))).toThrow(/Failed to read/);
  });

  it('throws when the file is not valid JSON', () => {
    const filePath = path.join(tempDir, 'bad.json');
    fs.writeFileSync(filePath, '{ not json');
    expect(() => loadPacksFromFile(filePath)).toThrow(/Failed to parse JSON/);
  });

  it('throws when the file does not contain an array', () => {
    const filePath = path.join(tempDir, 'object.json');
    fs.writeFileSync(filePath, JSON.stringify({ day: 1 }));
    expect(() => loadPacksFromFile(filePath)).toThrow(/JSON array/);
  });

  it('returns an empty array for an empty pack list', () => {
    const filePath = path.join(tempDir, 'empty.json');
    fs.writeFileSync(filePath, JSON.stringify([]));
    expect(loadPacksFromFile(filePath)).toEqual([]);
  });
});

describe('listPackFiles', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'social-pack-dir-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('lists only JSON files sorted alphabetically', () => {
    fs.writeFileSync(path.join(tempDir, 'b.json'), '[]');
    fs.writeFileSync(path.join(tempDir, 'a.json'), '[]');
    fs.writeFileSync(path.join(tempDir, 'notes.md'), '# not a pack');
    const files = listPackFiles(tempDir);
    expect(files).toHaveLength(2);
    expect(path.basename(files[0] ?? '')).toBe('a.json');
    expect(path.basename(files[1] ?? '')).toBe('b.json');
  });

  it('throws for a missing directory', () => {
    expect(() => listPackFiles(path.join(tempDir, 'nope'))).toThrow(/Failed to read directory/);
  });
});
