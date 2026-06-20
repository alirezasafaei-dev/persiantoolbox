/**
 * Conversion Funnel Event Definitions
 * Documents the event taxonomy for cross-site funnel tracking
 */

export type FunnelStage = 'awareness' | 'interest' | 'consideration' | 'intent' | 'conversion';

export type FunnelEvent = {
  stage: FunnelStage;
  event: string;
  site: 'toolbox' | 'portfolio' | 'audit';
  description: string;
  triggers: string[];
};

export const funnelEvents: FunnelEvent[] = [
  // Awareness
  {
    stage: 'awareness',
    event: 'page_view',
    site: 'toolbox',
    description: 'کاربر از ابزار بازدید می‌کند',
    triggers: ['بازدید صفحه ابزار', 'ورود از موتور جستجو'],
  },
  {
    stage: 'awareness',
    event: 'page_view',
    site: 'portfolio',
    description: 'کاربر از پورتفولیو بازدید می‌کند',
    triggers: ['بازدید صفحه اصلی', 'بازدید صفحه خدمات'],
  },
  {
    stage: 'awareness',
    event: 'page_view',
    site: 'audit',
    description: 'کاربر از سایت ارزیابی بازدید می‌کند',
    triggers: ['بازدید صفحه اصلی', 'بازدید صفحه ارزیابی'],
  },

  // Interest
  {
    stage: 'interest',
    event: 'tool_usage',
    site: 'toolbox',
    description: 'کاربر از ابزار استفاده می‌کند',
    triggers: ['محاسبه حقوق', 'محاسبه وام', 'ادغام PDF', 'تبدیل تاریخ'],
  },
  {
    stage: 'interest',
    event: 'guide_view',
    site: 'toolbox',
    description: 'کاربر راهنما را مطالعه می‌کند',
    triggers: ['بازدید راهنما', 'خواندن مقاله'],
  },

  // Consideration
  {
    stage: 'consideration',
    event: 'cta_click',
    site: 'toolbox',
    description: 'کاربر روی CTA کلیک می‌کند',
    triggers: ['کلیک روی لینک پورتفولیو', 'کلیک روی لینک ارزیابی'],
  },
  {
    stage: 'consideration',
    event: 'trust_page_view',
    site: 'toolbox',
    description: 'کاربر صفحه شفافیت فنی را مشاهده می‌کند',
    triggers: ['بازدید /trust', 'بازدید /privacy'],
  },

  // Intent
  {
    stage: 'intent',
    event: 'audit_start',
    site: 'audit',
    description: 'کاربر ارزیابی سایت را شروع می‌کند',
    triggers: ['وارد کردن URL', 'ارسال فرم ارزیابی'],
  },
  {
    stage: 'intent',
    event: 'contact_submit',
    site: 'portfolio',
    description: 'کاربر فرم تماس را ارسال می‌کند',
    triggers: ['ارسال فرم تماس', 'ارسال فرم صلاحیت'],
  },

  // Conversion
  {
    stage: 'conversion',
    event: 'payment_start',
    site: 'audit',
    description: 'کاربر پرداخت را شروع می‌کند',
    triggers: ['کلیک روی پرداخت', 'ارسال به درگاه'],
  },
  {
    stage: 'conversion',
    event: 'conversion',
    site: 'portfolio',
    description: 'تبدیل نهایی (تماس، پروژه، استخدام)',
    triggers: ['تماس موفق', 'عقد قرارداد', ' استخدام'],
  },
];

export const funnelStages: { id: FunnelStage; label: string; color: string }[] = [
  { id: 'awareness', label: 'آگاهی', color: '#3b82f6' },
  { id: 'interest', label: 'علاقه', color: '#8b5cf6' },
  { id: 'consideration', label: 'بررسی', color: '#f59e0b' },
  { id: 'intent', label: 'قصد', color: '#f97316' },
  { id: 'conversion', label: 'تبدیل', color: '#10b981' },
];

export function getEventsByStage(stage: FunnelStage): FunnelEvent[] {
  return funnelEvents.filter((e) => e.stage === stage);
}

export function getEventsBySite(site: FunnelEvent['site']): FunnelEvent[] {
  return funnelEvents.filter((e) => e.site === site);
}
