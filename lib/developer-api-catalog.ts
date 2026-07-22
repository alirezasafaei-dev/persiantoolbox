export type DeveloperApiProduct = {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  method: 'GET';
  endpoint: string;
  docsPath: string;
  rateLimit: string;
  cachePolicy: string;
  keywords: string[];
};

export const developerApiProducts: DeveloperApiProduct[] = [
  {
    id: 'market',
    title: 'API نرخ ارز، طلا و رمزارز',
    shortTitle: 'Market API',
    description:
      'دریافت نرخ‌های مرجع ارز، طلا و رمزارز همراه با زمان به‌روزرسانی، منبع و وضعیت تازگی داده.',
    method: 'GET',
    endpoint: '/api/market',
    docsPath: '/developers/api/market',
    rateLimit: '30 درخواست در دقیقه برای هر IP',
    cachePolicy: 'کش داخلی پنج‌دقیقه‌ای؛ پاسخ می‌تواند live، cached یا stale باشد.',
    keywords: ['api نرخ ارز', 'api طلا', 'api ارز رایگان', 'market api iran', 'api رمزارز'],
  },
  {
    id: 'salary-laws',
    title: 'API قوانین حقوق و دستمزد ۱۴۰۵',
    shortTitle: 'Salary Laws API',
    description:
      'دریافت مجموعه نسخه‌دار پارامترهای حقوق، معافیت مالیاتی، بیمه، مزایا و پله‌های مالیاتی.',
    method: 'GET',
    endpoint: '/api/data/salary-laws',
    docsPath: '/developers/api/salary-laws',
    rateLimit: 'محدودیت اختصاصی اعلام نشده است.',
    cachePolicy: 'ETag و Last-Modified با کش CDN یک‌ساعته و stale-while-revalidate.',
    keywords: ['api حقوق ۱۴۰۵', 'api مالیات حقوق', 'api بیمه حقوق', 'salary api iran'],
  },
  {
    id: 'status',
    title: 'API وضعیت و نسخه سرویس',
    shortTitle: 'Status API',
    description: 'بررسی سلامت، آمادگی و نسخه جاری سرویس برای مانیتورینگ و یکپارچه‌سازی.',
    method: 'GET',
    endpoint: '/api/health',
    docsPath: '/developers/api/status',
    rateLimit: 'محدودیت اختصاصی اعلام نشده است.',
    cachePolicy: 'برای مانیتورینگ زنده طراحی شده و نباید به‌عنوان داده کسب‌وکار کش بلندمدت شود.',
    keywords: ['api health check', 'api status', 'liveness endpoint', 'readiness endpoint'],
  },
];

export function buildOpenApiDocument(baseUrl: string) {
  return {
    openapi: '3.1.0',
    info: {
      title: 'PersianToolbox Public API',
      version: '8.0.0',
      description:
        'رابط‌های عمومی و بدون کلید PersianToolbox. وضعیت تازگی و منبع داده را در هر پاسخ بررسی کنید.',
      license: {
        name: 'Apache-2.0',
        identifier: 'Apache-2.0',
      },
    },
    servers: [{ url: baseUrl, description: 'Production' }],
    tags: [
      { name: 'Market', description: 'داده‌های مرجع بازار' },
      { name: 'Salary', description: 'داده نسخه‌دار حقوق و دستمزد' },
      { name: 'Operations', description: 'سلامت، آمادگی و نسخه سرویس' },
    ],
    paths: {
      '/api/market': {
        get: {
          tags: ['Market'],
          operationId: 'getMarketData',
          summary: 'دریافت نرخ‌های مرجع بازار',
          description:
            'نرخ‌های مرجع ارز، طلا و رمزارز را همراه با timestamp، sources و freshness برمی‌گرداند. این endpoint نرخ بازار آزاد ایران را تضمین نمی‌کند.',
          responses: {
            '200': {
              description: 'پاسخ موفق',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/MarketResponse' },
                },
              },
            },
            '500': { $ref: '#/components/responses/InternalError' },
          },
        },
      },
      '/api/data/salary-laws': {
        get: {
          tags: ['Salary'],
          operationId: 'getSalaryLaws',
          summary: 'دریافت قوانین نسخه‌دار حقوق و دستمزد',
          parameters: [
            {
              name: 'If-None-Match',
              in: 'header',
              required: false,
              schema: { type: 'string' },
              description: 'ETag پاسخ قبلی برای دریافت 304 در صورت عدم تغییر.',
            },
          ],
          responses: {
            '200': {
              description: 'مجموعه داده حقوق و دستمزد',
              headers: {
                ETag: { schema: { type: 'string' } },
                'Last-Modified': { schema: { type: 'string' } },
              },
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/SalaryLawsResponse' },
                },
              },
            },
            '304': { description: 'داده از زمان ETag ارسالی تغییر نکرده است.' },
            '500': { $ref: '#/components/responses/InternalError' },
          },
        },
      },
      '/api/health': {
        get: {
          tags: ['Operations'],
          operationId: 'getHealth',
          summary: 'بررسی سلامت سرویس',
          responses: {
            '200': {
              description: 'سرویس پاسخ‌گو است.',
              content: {
                'application/json': { schema: { type: 'object', additionalProperties: true } },
              },
            },
          },
        },
      },
      '/api/ready': {
        get: {
          tags: ['Operations'],
          operationId: 'getReadiness',
          summary: 'بررسی آمادگی سرویس',
          responses: {
            '200': {
              description: 'سرویس آماده دریافت ترافیک است.',
              content: {
                'application/json': { schema: { type: 'object', additionalProperties: true } },
              },
            },
            '503': { description: 'سرویس هنوز آماده نیست.' },
          },
        },
      },
      '/api/version': {
        get: {
          tags: ['Operations'],
          operationId: 'getVersion',
          summary: 'دریافت نسخه جاری سرویس',
          responses: {
            '200': {
              description: 'اطلاعات نسخه و build.',
              content: {
                'application/json': { schema: { type: 'object', additionalProperties: true } },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        MarketResponse: {
          type: 'object',
          required: ['ok', 'data'],
          properties: {
            ok: { type: 'boolean', const: true },
            data: {
              type: 'object',
              required: ['timestamp', 'currencies', 'gold', 'crypto', 'sources', 'freshness'],
              properties: {
                timestamp: { type: 'integer', description: 'Unix timestamp in milliseconds' },
                currencies: { type: 'object', additionalProperties: true },
                gold: { type: 'object', additionalProperties: true },
                crypto: { type: 'object', additionalProperties: true },
                sources: { type: 'array', items: { type: 'string' } },
                freshness: { type: 'string', enum: ['live', 'cached', 'stale'] },
              },
            },
          },
        },
        SalaryLawsResponse: {
          type: 'object',
          required: ['version', 'updatedAt', 'source', 'years'],
          properties: {
            version: { type: 'string' },
            updatedAt: { type: 'string', format: 'date' },
            source: { type: 'string' },
            region: { type: 'string' },
            years: { type: 'object', additionalProperties: true },
          },
        },
      },
      responses: {
        InternalError: {
          description: 'خطای داخلی سرویس',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  ok: { type: 'boolean', const: false },
                  error: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  } as const;
}
