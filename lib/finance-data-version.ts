export type FinanceDataVersion = {
  tool: string;
  source: 'local-versioned-json' | 'formula-static' | 'api-fetched';
  version: string;
  updatedAt: string;
  description?: string;
};

export const financeDataVersions: FinanceDataVersion[] = [
  {
    tool: 'salary',
    source: 'local-versioned-json',
    version: 'v2',
    updatedAt: '2026-06-20',
    description: 'قوانین حقوق ۱۴۰۵ با حداقل حقوق ۱۵,۰۶۶,۹۰۴ تومان',
  },
  {
    tool: 'loan',
    source: 'formula-static',
    version: 'v1',
    updatedAt: '2026-02-16',
    description: 'فرمول اقساط مساوی و پلکانی بانک مرکزی',
  },
  {
    tool: 'interest',
    source: 'formula-static',
    version: 'v1',
    updatedAt: '2026-02-16',
    description: 'فرمول سود ساده و مرکب',
  },
  {
    tool: 'tax',
    source: 'formula-static',
    version: 'v1',
    updatedAt: '2026-06-16',
    description: 'مالیات بر درآمد ۱۴۰۵ با معافیت ۴۰۰ میلیون تومان',
  },
  {
    tool: 'insurance',
    source: 'formula-static',
    version: 'v1',
    updatedAt: '2026-06-20',
    description: 'نرخ بیمه تأمین اجتماعی ۲۳٪ و بیکاری ۳٪',
  },
  {
    tool: 'bonus',
    source: 'formula-static',
    version: 'v1',
    updatedAt: '2026-06-20',
    description: 'عیدانه معادل یک ماه حقوق',
  },
  {
    tool: 'severance',
    source: 'formula-static',
    version: 'v1',
    updatedAt: '2026-06-20',
    description: 'حق سنوات معادل یک ماه حقوق به ازای هر سال سابقه',
  },
  {
    tool: 'leave',
    source: 'formula-static',
    version: 'v1',
    updatedAt: '2026-06-20',
    description: 'مرخصی استحقاقی ۱۵ تا ۲۶ روز با افزایش هر ۴ سال',
  },
  {
    tool: 'inflation',
    source: 'api-fetched',
    version: 'v1',
    updatedAt: '2026-06-15',
    description: 'نرخ تورم بر اساس آخرین آمار رسمی',
  },
  {
    tool: 'currency',
    source: 'api-fetched',
    version: 'v1',
    updatedAt: '2026-06-15',
    description: 'نرخ ارز بر اساس آخرین اطلاعات بازار',
  },
  {
    tool: 'investment',
    source: 'formula-static',
    version: 'v1',
    updatedAt: '2026-06-15',
    description: 'فرمول سود مرکب و رشد سرمایه',
  },
];

export function getFinanceDataVersion(tool: string): FinanceDataVersion | undefined {
  return financeDataVersions.find((item) => item.tool === tool);
}

export function getAllFinanceDataVersions(): FinanceDataVersion[] {
  return financeDataVersions;
}
