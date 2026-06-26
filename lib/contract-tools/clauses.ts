export type ClauseCategory =
  | 'obligations'
  | 'financial'
  | 'termination'
  | 'dispute'
  | 'confidentiality'
  | 'insurance'
  | 'special';

export interface SafeClause {
  id: string;
  category: ClauseCategory;
  title: string;
  text: string;
  appliesTo: string[];
  riskLevel: 'low' | 'medium' | 'high';
  lastReviewed: string;
  reviewStatus: 'approved' | 'needs-review' | 'draft';
}

export const clauseCategories: Record<ClauseCategory, string> = {
  obligations: 'تعهدات',
  financial: 'مالی',
  termination: 'فسخ',
  dispute: 'حل اختلاف',
  confidentiality: 'محرمانگی',
  insurance: 'بیمه',
  special: 'ویژه',
};

export const rentalClauses: SafeClause[] = [
  {
    id: 'rental-basic-obligations',
    category: 'obligations',
    title: 'تعهدات پایه مستأجر',
    text: 'مستأجر متعهد است اجاره‌بها را در موعد مقرر پرداخت نماید و از اجاره دادن ملک به غیر بدون اجازه کتبی موجر خودداری کند.',
    appliesTo: ['rental-lease'],
    riskLevel: 'low',
    lastReviewed: '2026-06-26',
    reviewStatus: 'needs-review',
  },
  {
    id: 'rental-maintenance',
    category: 'obligations',
    title: 'تعمیرات و نگهداری',
    text: 'تعمیرات جزئی بر عهده مستأجر و تعمیرات اساسی (سقف، لوله‌کشی، تأسیسات) بر عهده موجر است.',
    appliesTo: ['rental-lease'],
    riskLevel: 'low',
    lastReviewed: '2026-06-26',
    reviewStatus: 'needs-review',
  },
  {
    id: 'rental-inspection',
    category: 'obligations',
    title: 'بازدید ملک',
    text: 'موجر حق بازدید ملک را با هماهنگی قبلی و در ساعات منطقی (۸ صبح تا ۸ شب) دارد.',
    appliesTo: ['rental-lease'],
    riskLevel: 'low',
    lastReviewed: '2026-06-26',
    reviewStatus: 'needs-review',
  },
  {
    id: 'rental-termination-3month',
    category: 'termination',
    title: 'فسخ با اطلاع ۳ ماهه',
    text: 'هر یک از طرفین با اطلاع‌رسانی کتبی حداقل ۳ ماه قبل از پایان قرارداد، می‌تواند قرارداد را فسخ کند.',
    appliesTo: ['rental-lease'],
    riskLevel: 'medium',
    lastReviewed: '2026-06-26',
    reviewStatus: 'needs-review',
  },
  {
    id: 'rental-late-payment',
    category: 'financial',
    title: 'جریمه تأخیر پرداخت',
    text: 'در صورت تأخیر بیش از ۱۰ روز در پرداخت اجاره، روزانه معادل ۰.۱٪ مبلغ اجاره به عنوان جریمه تأخیر محاسبه می‌شود.',
    appliesTo: ['rental-lease'],
    riskLevel: 'medium',
    lastReviewed: '2026-06-26',
    reviewStatus: 'needs-review',
  },
  {
    id: 'rental-late-vacate',
    category: 'financial',
    title: 'جریمه تأخیر تخلیه',
    text: 'در صورت عدم تخلیه ملک در تاریخ مقرر، روزانه معادل ۲ برابر اجاره روزانه به عنوان خسارت تأخیر محاسبه می‌شود.',
    appliesTo: ['rental-lease'],
    riskLevel: 'high',
    lastReviewed: '2026-06-26',
    reviewStatus: 'needs-review',
  },
  {
    id: 'rental-parking',
    category: 'special',
    title: 'پارکینگ',
    text: 'یک پارکینگ سرپوشیده به شماره تعیین‌شده در اختیار مستأجر قرار می‌گیرد. مستأجر حق واگذاری پارکینگ به غیر را ندارد.',
    appliesTo: ['rental-lease'],
    riskLevel: 'low',
    lastReviewed: '2026-06-26',
    reviewStatus: 'needs-review',
  },
  {
    id: 'rental-pet',
    category: 'special',
    title: 'نگهداری حیوان خانگی',
    text: 'نگهداری حیوان خانگی با رضایت کتبی موجر و پرداخت خسارت احتمالی بلامانع است.',
    appliesTo: ['rental-lease'],
    riskLevel: 'low',
    lastReviewed: '2026-06-26',
    reviewStatus: 'needs-review',
  },
  {
    id: 'rental-dispute-arbitration',
    category: 'dispute',
    title: 'حل اختلاف از طریق داوری',
    text: 'در صورت بروز اختلاف، طرفین ابتدا تلاش می‌کنند از طریق مذاکره حل شود. در صورت عدم توافق، موضوع به داور خبره ارجاع می‌شود.',
    appliesTo: ['rental-lease'],
    riskLevel: 'medium',
    lastReviewed: '2026-06-26',
    reviewStatus: 'needs-review',
  },
];

export const constructionClauses: SafeClause[] = [
  {
    id: 'construction-scope',
    category: 'obligations',
    title: 'موضوع قرارداد',
    text: 'موضوع این قرارداد اجرای خدمات موضوع قرارداد طبق شرح خدمات مندرج در قرارداد و مستندات پیوست است.',
    appliesTo: ['construction-contractor'],
    riskLevel: 'low',
    lastReviewed: '2026-06-26',
    reviewStatus: 'needs-review',
  },
  {
    id: 'construction-obligations',
    category: 'obligations',
    title: 'تعهدات پیمانکار',
    text: 'پیمانکار متعهد است خدمات موضوع قرارداد را طبق استانداردهای فنی و مهندسی، در موعد مقرر و با کیفیت مناسب انجام دهد.',
    appliesTo: ['construction-contractor'],
    riskLevel: 'low',
    lastReviewed: '2026-06-26',
    reviewStatus: 'needs-review',
  },
  {
    id: 'construction-payment',
    category: 'financial',
    title: 'نحوه پرداخت',
    text: 'پرداخت‌ها طبق جدول زمانی و شرایط مندرج در قرارداد انجام می‌شود. هر مرحله پرداخت منوط به تأیید کارفرما است.',
    appliesTo: ['construction-contractor'],
    riskLevel: 'low',
    lastReviewed: '2026-06-26',
    reviewStatus: 'needs-review',
  },
  {
    id: 'construction-delay-penalty',
    category: 'financial',
    title: 'جریمه تأخیر',
    text: 'در صورت تأخیر غیرموجه پیمانکار بیش از ۱۵ روز، روزانه معادل ۰.۱٪ مبلغ کل قرارداد به عنوان جریمه تأخیر کسر می‌شود.',
    appliesTo: ['construction-contractor'],
    riskLevel: 'high',
    lastReviewed: '2026-06-26',
    reviewStatus: 'needs-review',
  },
  {
    id: 'construction-change-order',
    category: 'obligations',
    title: 'تغییرات و الحاقیه',
    text: 'هرگونه تغییر در شرح خدمات، مصالح یا زمان‌بندی فقط با توافق کتبی طرفین و تنظیم الحاقیه امکان‌پذیر است.',
    appliesTo: ['construction-contractor'],
    riskLevel: 'medium',
    lastReviewed: '2026-06-26',
    reviewStatus: 'needs-review',
  },
  {
    id: 'construction-warranty',
    category: 'obligations',
    title: 'گارانتی',
    text: 'پیمانکار گارانتی ۱۲ ماهه برای کیفیت اجرا و مصالح مصرفی ارائه می‌دهد. در صورت بروز عیب در دوره گارانتی، پیمانکار متعهد به رفع عیب است.',
    appliesTo: ['construction-contractor'],
    riskLevel: 'medium',
    lastReviewed: '2026-06-26',
    reviewStatus: 'needs-review',
  },
  {
    id: 'construction-force-majeure',
    category: 'termination',
    title: 'فورس ماژور',
    text: 'در صورت بروز حوادث غیرمترقبه (زلزله، سیل، جنگ، اعتصاب) که خارج از کنترل طرفین باشد، مهلت اجرا به اندازه مدت تأخیر تمدید می‌شود.',
    appliesTo: ['construction-contractor'],
    riskLevel: 'low',
    lastReviewed: '2026-06-26',
    reviewStatus: 'needs-review',
  },
  {
    id: 'construction-ip',
    category: 'confidentiality',
    title: 'مالکیت نقشه‌ها و طرح‌ها',
    text: 'تمام نقشه‌ها، طرح‌ها و مستندات فنی تهیه‌شده در این پروژه متعلق به کارفرما است و پیمانکار حق استفاده تجاری از آن‌ها را ندارد.',
    appliesTo: ['construction-contractor'],
    riskLevel: 'medium',
    lastReviewed: '2026-06-26',
    reviewStatus: 'needs-review',
  },
  {
    id: 'construction-insurance',
    category: 'insurance',
    title: 'بیمه و مسئولیت',
    text: 'پیمانکار متعهد است بیمه مسئولیت و بیمه کارگران را در طول دوره اجرا تهیه کند و مسئولیت حوادث ناشی از کار بر عهده پیمانکار است.',
    appliesTo: ['construction-contractor'],
    riskLevel: 'medium',
    lastReviewed: '2026-06-26',
    reviewStatus: 'needs-review',
  },
  {
    id: 'construction-dispute',
    category: 'dispute',
    title: 'حل اختلاف',
    text: 'در صورت بروز اختلاف، طرفین ابتدا تلاش می‌کنند از طریق مذاکره حل شود. در صورت عدم توافق، موضوع به کارشناس رسمی دادگستری ارجاع می‌شود.',
    appliesTo: ['construction-contractor'],
    riskLevel: 'medium',
    lastReviewed: '2026-06-26',
    reviewStatus: 'needs-review',
  },
];

export function getClausesForTemplate(templateId: string): SafeClause[] {
  switch (templateId) {
    case 'rental-lease':
      return rentalClauses;
    case 'construction-contractor':
      return constructionClauses;
    default:
      return [];
  }
}

export function getClausesByCategory(templateId: string, category: ClauseCategory): SafeClause[] {
  return getClausesForTemplate(templateId).filter((c) => c.category === category);
}
