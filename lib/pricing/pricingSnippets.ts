import { formatPack3Snippet } from '@/lib/pricing/pricingConfig';
import { getResolvedPricing } from '@/lib/server/pricingStorage';

export async function getPack3PriceFormatted(): Promise<string> {
  const pricing = await getResolvedPricing();
  return pricing.pack3PriceFormatted;
}

export async function getPack3FaqAnswer(suffix: string): Promise<string> {
  const pricing = await getResolvedPricing();
  return `بسته ۳ خروجی تمیز فقط ${pricing.pack3PriceFormatted} تومان است${suffix}`;
}

export async function getHomePack3FaqAnswer(): Promise<string> {
  const pricing = await getResolvedPricing();
  return `با خرید بسته ۳ خروجی از ${pricing.pack3PriceFormatted} تومان یا اشتراک ماهانه می‌توانید خروجی تمیز PDF یا Word دریافت کنید. پرداخت از درگاه امن زرین‌پال انجام می‌شود.`;
}

export async function getPack3CtaLabel(): Promise<string> {
  const pricing = await getResolvedPricing();
  return formatPack3Snippet(pricing.pack3PriceFormatted);
}

export async function getPack3HeroCtaLabel(): Promise<string> {
  const pricing = await getResolvedPricing();
  return `خروجی حرفه‌ای از ${pricing.pack3PriceFormatted} تومان`;
}
