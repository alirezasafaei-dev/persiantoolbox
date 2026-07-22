import { NextResponse } from 'next/server';
import { logger } from '@/lib/server/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface MarketData {
  timestamp: number;
  currencies: {
    [key: string]: {
      code: string;
      name: string;
      rate: number;
      change24h: number;
    };
  };
  gold: {
    pricePerGram: number;
    change24h: number;
  };
  crypto: {
    [key: string]: {
      symbol: string;
      name: string;
      priceUSD: number;
      change24h: number;
    };
  };
  units: {
    currencyBase: 'USD';
    iranCurrency: 'IRR';
    goldPricePerGram: 'IRR';
    cryptoPrice: 'USD';
  };
  sources: string[];
  freshness: 'live' | 'cached' | 'stale';
}

type CryptoSnapshot = {
  BTC: { priceUSD: number; change24h: number };
  ETH: { priceUSD: number; change24h: number };
};

type GoldSnapshot = {
  pricePerOunceUSD: number;
  change24h: number;
};

let cachedData: MarketData | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000;
const DEFAULT_USD_TO_IRR = 42000;
const TROY_OUNCE_GRAMS = 31.1035;

function getDefaults(): MarketData {
  return {
    timestamp: Date.now(),
    currencies: {
      USD: { code: 'USD', name: 'دلار آمریکا', rate: 1, change24h: 0 },
      EUR: { code: 'EUR', name: 'یورو', rate: 0.92, change24h: 0 },
      GBP: { code: 'GBP', name: 'پوند انگلیس', rate: 0.79, change24h: 0 },
      AED: { code: 'AED', name: 'درهم امارات', rate: 3.67, change24h: 0 },
      TRY: { code: 'TRY', name: 'لیر ترکیه', rate: 32.5, change24h: 0 },
      IRR: { code: 'IRR', name: 'ریال ایران', rate: DEFAULT_USD_TO_IRR, change24h: 0 },
    },
    gold: { pricePerGram: 0, change24h: 0 },
    crypto: {
      BTC: { symbol: 'BTC', name: 'بیت‌کوین', priceUSD: 0, change24h: 0 },
      ETH: { symbol: 'ETH', name: 'اتریوم', priceUSD: 0, change24h: 0 },
    },
    units: {
      currencyBase: 'USD',
      iranCurrency: 'IRR',
      goldPricePerGram: 'IRR',
      cryptoPrice: 'USD',
    },
    sources: ['default'],
    freshness: 'stale',
  };
}

async function fetchCurrencyRates(): Promise<Record<string, number> | null> {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.rates ?? null;
  } catch {
    return null;
  }
}

async function fetchCryptoPrices(): Promise<CryptoSnapshot | null> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true',
      { signal: AbortSignal.timeout(5000) },
    );
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return {
      BTC: {
        priceUSD: data.bitcoin?.usd ?? 0,
        change24h: data.bitcoin?.usd_24h_change ?? 0,
      },
      ETH: {
        priceUSD: data.ethereum?.usd ?? 0,
        change24h: data.ethereum?.usd_24h_change ?? 0,
      },
    };
  } catch {
    return null;
  }
}

async function fetchGoldPrice(): Promise<GoldSnapshot | null> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=tether-gold&vs_currencies=usd&include_24hr_change=true',
      { signal: AbortSignal.timeout(5000) },
    );
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    const pricePerOunceUSD = data['tether-gold']?.usd ?? 0;
    const change24h = data['tether-gold']?.usd_24h_change ?? 0;
    return pricePerOunceUSD > 0 ? { pricePerOunceUSD, change24h } : null;
  } catch {
    return null;
  }
}

async function fetchMarketData(): Promise<MarketData> {
  const now = Date.now();

  if (cachedData && now - cacheTimestamp < CACHE_TTL) {
    return { ...cachedData, freshness: 'cached' };
  }

  const sources: string[] = [];
  const result = getDefaults();
  result.timestamp = now;

  const [rates, crypto, gold] = await Promise.all([
    fetchCurrencyRates(),
    fetchCryptoPrices(),
    fetchGoldPrice(),
  ]);

  const usdToIrr = rates?.['IRR'] ?? DEFAULT_USD_TO_IRR;

  if (rates) {
    sources.push('exchangerate-api');
    result.currencies = {
      USD: { code: 'USD', name: 'دلار آمریکا', rate: 1, change24h: 0 },
      EUR: { code: 'EUR', name: 'یورو', rate: rates['EUR'] ?? 0.92, change24h: 0 },
      GBP: { code: 'GBP', name: 'پوند انگلیس', rate: rates['GBP'] ?? 0.79, change24h: 0 },
      AED: { code: 'AED', name: 'درهم امارات', rate: rates['AED'] ?? 3.67, change24h: 0 },
      TRY: { code: 'TRY', name: 'لیر ترکیه', rate: rates['TRY'] ?? 32.5, change24h: 0 },
      IRR: { code: 'IRR', name: 'ریال ایران', rate: usdToIrr, change24h: 0 },
    };
  }

  if (crypto) {
    sources.push('coingecko');
    result.crypto = {
      BTC: {
        symbol: 'BTC',
        name: 'بیت‌کوین',
        priceUSD: crypto.BTC.priceUSD,
        change24h: crypto.BTC.change24h,
      },
      ETH: {
        symbol: 'ETH',
        name: 'اتریوم',
        priceUSD: crypto.ETH.priceUSD,
        change24h: crypto.ETH.change24h,
      },
    };
  }

  if (gold && rates) {
    if (!sources.includes('coingecko')) {
      sources.push('coingecko');
    }
    result.gold = {
      pricePerGram: Math.round((gold.pricePerOunceUSD / TROY_OUNCE_GRAMS) * usdToIrr),
      change24h: gold.change24h,
    };
  }

  const hasCompleteLiveSnapshot = Boolean(rates && crypto && gold);
  if (hasCompleteLiveSnapshot) {
    result.sources = sources;
    result.freshness = 'live';
    cachedData = result;
    cacheTimestamp = now;
    return cachedData;
  }

  if (cachedData) {
    return { ...cachedData, freshness: 'stale' };
  }

  if (sources.length > 0) {
    result.sources = [...sources, 'default-fallback'];
  }
  result.freshness = 'stale';
  return result;
}

export async function GET() {
  try {
    const data = await fetchMarketData();
    return NextResponse.json(
      { ok: true, data },
      {
        headers: {
          'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=900',
        },
      },
    );
  } catch (error) {
    logger.error('Market data API error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ ok: false, error: 'Failed to fetch market data' }, { status: 500 });
  }
}
