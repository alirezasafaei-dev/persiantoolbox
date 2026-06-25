# PersianToolbox - Complete Documentation

**Project:** PersianToolbox (Traffic Engine)
**URL:** https://persiantoolbox.ir/
**Role:** Top of Funnel - SEO-driven traffic generation
**Last Updated:** 2026-06-21

> **Current status:** Auth, account, subscription, checkout, dashboard, admin panels, premium page, and 51 production-quality tools are fully implemented. Security hardened (HMAC webhook, async scrypt, CSRF). Lighthouse 96/100 performance.

---

## 🎯 Project Purpose

PersianToolbox is the **traffic engine** of the three-site revenue system. It generates SEO-driven traffic through 51 free Persian-language tools, then converts visitors to the portfolio site via strategic CTAs.

### Revenue Role

- **Stage:** Awareness & Engagement (Top of Funnel)
- **Goal:** Generate high-quality traffic and warm leads
- **Monetization:** Future SaaS premium tiers (freemium model)

### Product Direction Note

- The current financial surface is already a core category, not a side experiment.
- Recommended expansion is **incremental market-aware tooling inside the existing toolbox**, not a separate financial product.
- Canonical strategy document: `docs/technical/01-Architecture/05-finance-market-data-strategy.md`

---

## 🏗️ Architecture

### Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5.x (strict mode)
- **Styling:** Tailwind CSS 3.x
- **Components:** Custom + Radix UI
- **State Management:** React Context
- **Testing:** Vitest + Playwright
- **Build Tool:** Turbopack
- **Package Manager:** pnpm

### Project Structure

```
sites/live/persiantoolbox/
├── app/                      # Next.js App Router
│   ├── (tools)/             # Tool pages
│   ├── api/                 # API routes (if any)
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Homepage
├── components/
│   ├── ui/                  # Base UI components
│   ├── tools/               # Tool-specific components
│   └── layout/              # Layout components (Header, Footer)
├── shared/
│   ├── cross-site/          # Cross-site components
│   │   └── PortfolioCTA.tsx # CTA to portfolio
│   └── utils/               # Shared utilities
├── lib/                     # Core libraries
├── public/                  # Static assets
├── styles/                  # Global styles
├── tests/                   # Test suites
├── scripts/                 # Build and deploy scripts
├── REVENUE_SYSTEM.md        # Revenue integration docs
├── DOCUMENTATION.md         # This file
└── package.json
```

---

## 🛠️ Available Tools (46+)

### PDF Tools

1. PDF Merge - ادغام PDF
2. PDF Split - تقسیم PDF
3. PDF Compress - فشرده‌سازی PDF
4. PDF to Image - تبدیل PDF به تصویر
5. Image to PDF - تبدیل تصویر به PDF
6. Word to PDF - تبدیل Word به PDF
7. PDF to Excel - تبدیل PDF به اکسل
8. Decrypt PDF - حذف رمز PDF
9. Watermark PDF - واترمارک PDF
10. Rotate PDF - چرخش PDF
11. Reorder PDF - مرتب‌سازی صفحات
12. Delete PDF Pages - حذف صفحات
13. Extract PDF Pages - استخراج صفحات
14. Add Page Numbers - افزودن شماره صفحه
15. Add Header/Footer - افزودن هدر/فوتر
16. Crop PDF - برش PDF
17. Flatten PDF - هموارسازی PDF
18. Extract Text - استخراج متن
19. PDF to Text - تبدیل PDF به متن

### Image Tools

20. Image Format Converter - تبدیل فرمت تصویر
21. Image Background Remover - حذف پس‌زمینه
22. Rotate Image - چرخش تصویر
23. Resize Image - تغییر اندازه
24. Text on Image - متن روی تصویر
25. Image to QR - تبدیل تصویر به QR

### Date Tools

26. Shamsi-Gregorian Converter - تبدیل تاریخ
27. Date Difference - اختلاف تاریخ
28. Persian Calendar - تقویم فارسی
29. Event Reminder - یادآور رویداد

### Text Tools

30. Word Counter - شمارش کلمات
31. Number Converter - مبدل اعداد
32. Remove Spaces - حذف فاصله
33. Case Converter - تبدیل حروف
34. Extract Info - استخراج اطلاعات

### Finance Tools

35. Loan Calculator - محاسبه وام
36. Salary Calculator - محاسبه حقوق
37. Interest Calculator - محاسبه سود
38. Currency Converter - تبدیل ارز
39. Inflation Calculator - محاسبه تورم
40. Investment Calculator - محاسبه سرمایه‌گذاری
41. Tax Calculator - محاسبه مالیات
42. Bank Rate Comparator - مقایسه نرخ بانک
43. Living Cost - هزینه زندگی

### Validation Tools

44. Address FA to EN - تبدیل آدرس فارسی به انگلیسی

_(See `lib/tools-registry.ts` for complete list)_

### Financial Surface Strategy

- Current finance hub lives at `/tools` and already groups salary, loan, interest, tax, inflation, investment, currency, bank-rate, and living-cost tools.
- Near-term recommendation is to improve this hub with **read-only market snapshots** and **historical return simulation**.
- Deliberately out of scope for MVP: trading features, realtime streaming, alerts, and full portfolio management.

---

## 🔄 Revenue Integration

### Analytics Tracking

Every page and tool action is tracked via the cross-site analytics system:

```typescript
import { analytics } from '@/lib/monitoring';

// Page view
analytics.trackEvent('page_view', { path: window.location.pathname });

// Tool usage
analytics.trackEvent('tool_usage', { toolId: 'pdf-merge', fileCount: 2 });

// CTA click
analytics.trackEvent('cta_click', { variant: 'tool-result', destination: 'portfolio' });
```

### CTA Integration Points

**1. Footer CTA (Global)**

- Location: Every page footer
- Variant: `footer`
- Message: "نیاز به خدمات توسعه وب دارید؟"

**2. Tool Result CTA**

- Location: After tool completes operation
- Variant: `tool-result`
- Message: "نتیجه رو دوست داشتید؟ سیستم مشابه بسازید"
- Example: PDF Merge tool (`/app/(tools)/pdf-merge/page.tsx`)

**3. Premium Gate (Future)**

- Location: Advanced features
- Variant: `premium-gate`
- Triggers: Rate limiting, batch operations, API access

**4. Sidebar CTA (Future)**

- Location: Tool pages sidebar
- Variant: `sidebar`
- Context: Related services

### Conversion Funnel

```
User lands on tool page (SEO)
  ↓
Uses free tool (engagement)
  ↓
Sees result + CTA (conversion opportunity)
  ↓
Clicks CTA to Portfolio (funnel progression)
  ↓
Views case studies (trust building)
  ↓
Contacts for project (conversion)
```

---

## 📊 SEO Strategy

### Current Approach

- **Target Keywords:** Persian long-tail keywords
- **Content:** Tool pages optimized for specific queries
- **Structure:** Clean URLs (e.g., `/pdf-merge`, `/word-counter`)
- **Schema:** Markup for tools (SoftwareApplication)
- **Meta Tags:** Optimized title, description, OG tags

### Top Performing Tools (by traffic - to be measured)

1. PDF Merge
2. Image Compressor
3. Word Counter
4. QR Code Generator
5. Password Generator

### SEO Checklist per Tool

- ✅ Persian keyword in title
- ✅ Meta description <160 chars
- ✅ H1 tag with keyword
- ✅ Alt text on images
- ✅ Schema markup
- ✅ Internal linking
- ✅ Fast load time (<2s)
- ✅ Mobile responsive

---

## 🚀 Development Workflow

### Local Development

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev
# → http://localhost:3000

# Run tests
pnpm test          # Unit tests
pnpm test:e2e      # E2E tests

# Type checking
pnpm typecheck

# Linting
pnpm lint
pnpm lint:fix

# Build for production
pnpm build

# Start production build
pnpm start
```

### Adding a New Tool

1. **Create tool page**

   ```bash
   mkdir -p app/\(tools\)/new-tool
   touch app/\(tools\)/new-tool/page.tsx
   ```

2. **Implement tool component**

   ```typescript
   // app/(tools)/new-tool/page.tsx
   import { PortfolioCTA } from '@/shared/cross-site/PortfolioCTA';

   export default function NewToolPage() {
     return (
       <div>
         <h1>ابزار جدید</h1>
         {/* Tool implementation */}

         {/* CTA after result */}
         <PortfolioCTA variant="tool-result" />
       </div>
     );
   }
   ```

3. **Add analytics tracking**

   ```typescript
   import { trackEvent } from '@/shared/analytics/cross-site-tracker';

   function handleToolAction() {
     // Tool logic...

     trackEvent({
       event: 'tool_usage',
       source: 'persiantoolbox',
       toolName: 'new-tool',
     });
   }
   ```

4. **Add SEO metadata**

   ```typescript
   export const metadata = {
     title: 'عنوان ابزار | PersianToolbox',
     description: 'توضیحات ابزار...',
     keywords: 'کلمات کلیدی',
   };
   ```

5. **Test the tool**

   ```bash
   pnpm test -- new-tool
   pnpm test:e2e -- new-tool
   ```

6. **Update navigation** (if needed)
   - Add to homepage tool list
   - Add to sitemap
   - Update internal links

---

## 🧪 Testing Strategy

### Unit Tests (Vitest)

- Test tool logic functions
- Test utility functions
- Test component rendering
- Mock external dependencies

```typescript
// tests/tools/pdf-merge.test.ts
import { describe, it, expect } from 'vitest';
import { mergePDFs } from '@/lib/pdf-utils';

describe('PDF Merge Tool', () => {
  it('should merge multiple PDFs', async () => {
    const result = await mergePDFs([file1, file2]);
    expect(result).toBeDefined();
  });
});
```

### E2E Tests (Playwright)

- Test complete user flows
- Test CTA clicks and tracking
- Test tool usage end-to-end

```typescript
// tests/e2e/pdf-merge.spec.ts
import { test, expect } from '@playwright/test';

test('PDF merge tool flow', async ({ page }) => {
  await page.goto('/pdf-merge');

  // Upload files
  await page.setInputFiles('#file-input', ['test1.pdf', 'test2.pdf']);

  // Click merge
  await page.click('#merge-button');

  // Verify result
  await expect(page.locator('.result')).toBeVisible();

  // Verify CTA appears
  await expect(page.locator('[data-cta]')).toBeVisible();
});
```

---

## 📦 Deployment

### Production Build

```bash
# Build optimized production bundle
pnpm build

# Test production build locally
pnpm start
```

### Deploy to VPS

```bash
# SSH to VPS
ssh user@persiantoolbox.ir

# Navigate to project
cd /var/www/persiantoolbox

# Pull latest changes
git pull origin main

# Install dependencies
pnpm install --frozen-lockfile

# Build
pnpm build

# Restart PM2 process
pm2 restart persiantoolbox

# Verify deployment
pm2 logs persiantoolbox --lines 50
curl -I https://persiantoolbox.ir/
```

### Deployment Checklist

- ✅ All tests passing locally
- ✅ No TypeScript errors
- ✅ No lint warnings
- ✅ Environment variables set on VPS
- ✅ Database migrations run (if any)
- ✅ PM2 ecosystem file updated
- ✅ Nginx config updated (if needed)
- ✅ SSL certificate valid
- ✅ Analytics tracking verified
- ✅ CTAs rendering correctly

---

## 🔧 Configuration

### Environment Variables

```bash
# .env.local (development)
NEXT_PUBLIC_ANALYTICS_API=http://localhost:3001/api/track
NEXT_PUBLIC_PORTFOLIO_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# .env.production (VPS)
NEXT_PUBLIC_ANALYTICS_API=https://alirezasafaeisystems.ir/api/track
NEXT_PUBLIC_PORTFOLIO_URL=https://alirezasafaeisystems.ir
NEXT_PUBLIC_SITE_URL=https://persiantoolbox.ir
```

### PM2 Ecosystem

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'persiantoolbox',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/persiantoolbox',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_ANALYTICS_API: 'https://alirezasafaeisystems.ir/api/track',
        NEXT_PUBLIC_PORTFOLIO_URL: 'https://alirezasafaeisystems.ir',
        NEXT_PUBLIC_SITE_URL: 'https://persiantoolbox.ir',
      },
    },
  ],
};
```

---

## 📈 Performance Targets

### Core Web Vitals

- **LCP (Largest Contentful Paint):** <2.5s
- **FID (First Input Delay):** <100ms
- **CLS (Cumulative Layout Shift):** <0.1

### Lighthouse Scores (Target)

- **Performance:** >90
- **Accessibility:** >95
- **Best Practices:** >90
- **SEO:** >95

### Bundle Size

- **Initial JS:** <200KB
- **Total JS:** <500KB
- **First Load JS:** <300KB

---

## 🐛 Common Issues & Solutions

### Issue: CTA not tracking clicks

**Solution:** Verify analytics API endpoint is reachable

```bash
curl -X POST https://alirezasafaeisystems.ir/api/track \
  -H "Content-Type: application/json" \
  -d '{"event":"test","source":"persiantoolbox"}'
```

### Issue: Tool page not rendering

**Solution:** Check browser console for hydration errors, verify SSR compatibility

### Issue: Slow page load

**Solution:**

- Optimize images (use Next.js Image component)
- Code split heavy dependencies
- Lazy load components below fold
- Enable Edge Runtime for static pages

### Issue: SEO meta tags not showing

**Solution:** Verify `metadata` export in page.tsx, check `layout.tsx` for conflicts

---

## 📚 Related Documentation

- **[REVENUE_SYSTEM.md](./REVENUE_SYSTEM.md)** - Revenue integration details
- **[../../.agents/CONTEXT.md](../../.agents/CONTEXT.md)** - Project-wide context
- **[../../docs/architecture/system-overview.md](../../docs/architecture/system-overview.md)** - System architecture
- **[../../docs/roadmaps/30-day-mvp.md](../../docs/roadmaps/30-day-mvp.md)** - Implementation roadmap
- **[../../docs/frontend/cta-system.md](../../docs/frontend/cta-system.md)** - CTA implementation guide

---

## 🎯 Current Sprint Tasks

### Week 1 (Current)

- [x] Implement PortfolioCTA component
- [x] Add CTA to Footer (global)
- [x] Add CTA to PDF Merge tool (example)
- [ ] Scale CTA to remaining 49 tools
- [ ] Verify analytics tracking end-to-end
- [ ] A/B test CTA variants

### Remaining Work

- [ ] Consolidate cross-site analytics (E0-02 verified)
- [ ] Prove cross-site funnel attribution (E0-03)
- [ ] Record production evidence baseline (E0-05)
- [ ] Publish local-first technical trust page (E1-03)
- [ ] Create intent-based CTA registry (E1-02)

### Deferred

- Premium gating and per-user quotas (deferred until one paid outcome is validated)
- Provider-backed payment integration (requires owner merchant decision)
- AI tool suite and wallet (deterministic tools must be stable first)

---

## 📞 Support

**Technical Issues:** Check main docs at `/docs/`
**Deployment Issues:** See `/docs/operating/live-vps-deployment-2026-06-09.md`
**Architecture Questions:** See `/docs/architecture/system-overview.md`

---

**Document Version:** 1.1.0
**Last Updated:** 2026-06-20
**Next Review:** 2026-06-27
**Maintained By:** Alireza Safaei + AI Agents
