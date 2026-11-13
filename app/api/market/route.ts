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
let pendingRefresh: Promise<MarketData | null> | null = null;
const CACHE_TTL = 5 * 60 * 1000;
const RETRY_DELAY = 30 * 1000;
let lastFailure: number | null = null;

const TROY_OUNCE_GRAMS = 31.1035;

function positive(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function finite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
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
    const rates = data?.rates;
    return rates &&
      rates.USD === 1 &&
      ['EUR', 'GBP', 'AED', 'TRY', 'IRR'].every((code) => positive(rates[code]))
      ? rates
      : null;
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
    if (
      !['bitcoin', 'ethereum'].every(
        (id) => positive(data?.[id]?.usd) && finite(data?.[id]?.usd_24h_change),
      )
    ) {
      return null;
    }
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
    return positive(pricePerOunceUSD) && finite(data?.['tether-gold']?.usd_24h_change)
      ? { pricePerOunceUSD, change24h }
      : null;
  } catch {
    return null;
  }
}

async function refreshMarketData(): Promise<MarketData | null> {
  const now = Date.now();

  if (cachedData && now - cacheTimestamp < CACHE_TTL) {
    return { ...cachedData, freshness: 'cached' };
  }

  const sources: string[] = [];
  const result: MarketData = {
    timestamp: now,
    currencies: {},
    crypto: {},
    gold: { pricePerGram: 0, change24h: 0 },
    units: {
      currencyBase: 'USD',
      iranCurrency: 'IRR',
      goldPricePerGram: 'IRR',
      cryptoPrice: 'USD',
    },
    sources: [],
    freshness: 'live',
  };
  result.timestamp = now;

  const [rates, crypto, gold] = await Promise.all([
    fetchCurrencyRates(),
    fetchCryptoPrices(),
    fetchGoldPrice(),
  ]);

  if (!rates || !crypto || !gold) {
    lastFailure = Date.now();
    return cachedData ? { ...cachedData, freshness: 'stale' } : null;
  }

  const usdToIrr = rates['IRR']!;
  const pricePerGram = Math.round((gold.pricePerOunceUSD / TROY_OUNCE_GRAMS) * usdToIrr);
  if (!positive(pricePerGram)) {
    lastFailure = Date.now();
    return cachedData ? { ...cachedData, freshness: 'stale' } : null;
  }

  if (rates) {
    sources.push('exchangerate-api');
    result.currencies = {
      USD: { code: 'USD', name: 'دلار آمریکا', rate: 1, change24h: 0 },
      EUR: { code: 'EUR', name: 'یورو', rate: rates['EUR']!, change24h: 0 },
      GBP: { code: 'GBP', name: 'پوند انگلیس', rate: rates['GBP']!, change24h: 0 },
      AED: { code: 'AED', name: 'درهم امارات', rate: rates['AED']!, change24h: 0 },
      TRY: { code: 'TRY', name: 'لیر ترکیه', rate: rates['TRY']!, change24h: 0 },
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
      pricePerGram,
      change24h: gold.change24h,
    };
  }

  const hasCompleteLiveSnapshot = Boolean(rates && crypto && gold);
  if (hasCompleteLiveSnapshot) {
    result.sources = sources;
    result.freshness = 'live';
    cachedData = result;
    cacheTimestamp = now;
    lastFailure = null;
    return cachedData;
  }

  if (cachedData) {
    return { ...cachedData, freshness: 'stale' };
  }

  return null;
}

async function fetchMarketData(): Promise<MarketData | null> {
  if (cachedData && Date.now() - cacheTimestamp < CACHE_TTL) {
    return { ...cachedData, freshness: 'cached' };
  }
  if (!pendingRefresh) {
    if (lastFailure !== null && Date.now() - lastFailure < RETRY_DELAY) {
      return cachedData ? { ...cachedData, freshness: 'stale' } : null;
    }
    pendingRefresh = refreshMarketData().finally(() => {
      pendingRefresh = null;
    });
  }
  return pendingRefresh;
}

export async function GET() {
  try {
    const data = await fetchMarketData();
    if (!data) {
      return NextResponse.json(
        { ok: false, error: 'Market data temporarily unavailable' },
        {
          status: 503,
          headers: {
            'Cache-Control': 'no-store',
            'Retry-After': '30',
            'Access-Control-Allow-Origin': '*',
          },
        },
      );
    }
    return NextResponse.json(
      { ok: true, data },
      {
        headers: {
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  } catch (error) {
    logger.error('Market data API error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch market data' },
      {
        status: 500,
        headers: { 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' },
      },
    );
  }
}
