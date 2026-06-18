# PersianToolbox - Complete Documentation

**Project:** PersianToolbox (Traffic Engine)
**URL:** https://persiantoolbox.ir/
**Role:** Top of Funnel - SEO-driven traffic generation
**Last Updated:** 2026-06-18

---

## 🎯 Project Purpose

PersianToolbox is the **traffic engine** of the three-site revenue system. It generates SEO-driven traffic through 51+ free Persian-language tools, then converts visitors to the portfolio site via strategic CTAs.

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

## 🛠️ Available Tools (51+)

### Document Tools

1. PDF Merge - ادغام PDF
2. PDF Split - تقسیم PDF
3. PDF to Image - تبدیل PDF به تصویر
4. Image to PDF - تبدیل تصویر به PDF
5. PDF Compress - فشرده‌سازی PDF
6. Word to PDF - تبدیل Word به PDF
7. Excel to PDF - تبدیل Excel به PDF

### Text Tools

8. Word Counter - شمارش کلمات
9. Character Counter - شمارش کاراکترها
10. Text Case Converter - تبدیل حروف
11. JSON Formatter - فرمت‌دهی JSON
12. Base64 Encoder/Decoder
13. URL Encoder/Decoder
14. Markdown to HTML

### Image Tools

15. Image Compressor - فشرده‌سازی تصویر
16. Image Resizer - تغییر اندازه تصویر
17. Image Cropper - برش تصویر
18. Image Format Converter - تبدیل فرمت
19. Background Remover - حذف پس‌زمینه
20. Image Watermark - واترمارک

### Developer Tools

21. JSON to CSV
22. CSV to JSON
23. Color Picker - انتخاب رنگ
24. Gradient Generator - ساخت گرادیان
25. QR Code Generator - ساخت QR کد
26. Hash Generator (MD5, SHA)
27. Password Generator - ساخت رمز عبور
28. Lorem Ipsum Generator

### SEO Tools

29. Meta Tag Generator
30. Robots.txt Generator
31. Sitemap Generator
32. Schema Markup Generator
33. Open Graph Generator
34. Keyword Density Checker

### Calculation Tools

35. Loan Calculator - محاسبه وام
36. Currency Converter - تبدیل ارز
37. Unit Converter - تبدیل واحد
38. Age Calculator - محاسبه سن
39. BMI Calculator - محاسبه BMI
40. Percentage Calculator - محاسبه درصد

### More Tools

41. URL Shortener - کوتاه‌کننده لینک
42. Email Validator - اعتبارسنجی ایمیل
43. IP Lookup - جستجوی IP
44. Whois Lookup
45. DNS Lookup
46. SSL Checker
47. Website Speed Test
48. Backlink Checker
49. Plagiarism Checker
50. Grammar Checker
51. Invoice Generator

_(See `/app/(tools)/` directory for complete list)_

### Financial Surface Strategy

- Current finance hub lives at `/tools` and already groups salary, loan, interest, tax, inflation, investment, currency, bank-rate, and living-cost tools.
- Near-term recommendation is to improve this hub with **read-only market snapshots** and **historical return simulation**.
- Deliberately out of scope for MVP: trading features, realtime streaming, alerts, and full portfolio management.

---

## 🔄 Revenue Integration

### Analytics Tracking

Every page and tool action is tracked via the cross-site analytics system:

```typescript
import { trackEvent } from '@/shared/analytics/cross-site-tracker';

// Page view
trackEvent({
  event: 'page_view',
  source: 'persiantoolbox',
  url: window.location.href,
  referrer: document.referrer,
});

// Tool usage
trackEvent({
  event: 'tool_usage',
  source: 'persiantoolbox',
  toolName: 'pdf-merge',
  metadata: { fileCount: 2 },
});

// CTA click
trackEvent({
  event: 'cta_click',
  source: 'persiantoolbox',
  ctaType: 'portfolio',
  ctaVariant: 'tool-result',
});
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

### Week 2-4 (Upcoming)

- [ ] Add authentication for premium features
- [ ] Implement usage tracking per user
- [ ] Add premium feature gates
- [ ] Build user dashboard
- [ ] Integrate Stripe for subscriptions

---

## 📞 Support

**Technical Issues:** Check main docs at `/docs/`
**Deployment Issues:** See `/docs/operating/live-vps-deployment-2026-06-09.md`
**Architecture Questions:** See `/docs/architecture/system-overview.md`

---

**Document Version:** 1.0.0
**Last Updated:** 2026-06-18
**Next Review:** 2026-06-25
**Maintained By:** Alireza Safaei + AI Agents
