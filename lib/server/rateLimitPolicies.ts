type RateLimitPolicy = {
  limit: number;
  windowMs: number;
  keyPrefix: string;
};

export const rateLimitPolicies = {
  analyticsIngest: {
    limit: Number(process.env['ANALYTICS_RATE_LIMIT'] ?? '120'),
    windowMs: Number(process.env['ANALYTICS_RATE_WINDOW_MS'] ?? '60000'),
    keyPrefix: 'analytics_ingest',
  },
  adminSiteSettings: {
    limit: Number(process.env['ADMIN_RATE_LIMIT'] ?? '60'),
    windowMs: Number(process.env['ADMIN_RATE_WINDOW_MS'] ?? '60000'),
    keyPrefix: 'admin_site_settings',
  },
  adminMutations: {
    limit: Number(process.env['ADMIN_MUTATION_RATE_LIMIT'] ?? '30'),
    windowMs: Number(process.env['ADMIN_MUTATION_RATE_WINDOW_MS'] ?? '60000'),
    keyPrefix: 'admin_mutation',
  },
  authFuture: {
    limit: Number(process.env['AUTH_RATE_LIMIT'] ?? '30'),
    windowMs: Number(process.env['AUTH_RATE_WINDOW_MS'] ?? '60000'),
    keyPrefix: 'auth',
  },
  subscriptionFuture: {
    limit: Number(process.env['SUBSCRIPTION_RATE_LIMIT'] ?? '30'),
    windowMs: Number(process.env['SUBSCRIPTION_RATE_WINDOW_MS'] ?? '60000'),
    keyPrefix: 'subscription',
  },
} satisfies Record<
  'analyticsIngest' | 'adminSiteSettings' | 'adminMutations' | 'authFuture' | 'subscriptionFuture',
  RateLimitPolicy
>;
