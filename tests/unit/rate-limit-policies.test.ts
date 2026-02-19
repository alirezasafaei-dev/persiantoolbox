import { describe, expect, it } from 'vitest';
import { rateLimitPolicies } from '@/lib/server/rateLimitPolicies';

describe('rate limit policies', () => {
  it('defines required endpoint policies', () => {
    expect(rateLimitPolicies.analyticsIngest).toBeDefined();
    expect(rateLimitPolicies.adminSiteSettings).toBeDefined();
    expect(rateLimitPolicies.authFuture).toBeDefined();
    expect(rateLimitPolicies.subscriptionFuture).toBeDefined();
  });
});
