# Monetization Plan — PersianToolbox

**Date:** 2026-06-27
**Based on:** Live Growth Audit 2026-06-27

---

## Current State

### Pricing Structure

| Plan  | Price             | Features                                                |
| ----- | ----------------- | ------------------------------------------------------- |
| Free  | ۰ تومان           | Basic tools, single-file, standard output, no signup    |
| Basic | ۹۹,۰۰۰ تومان/ماه  | Batch processing, HD output, no ads, templates, history |
| Pro   | ۱۹۹,۰۰۰ تومان/ماه | Dashboard, custom reports, dedicated support            |

### What Exists

- ✅ Pricing page with 3 tiers
- ✅ ZarinPal integration configured (production mode)
- ✅ Subscription plans defined in code
- ✅ Feature flags for checkout, account, subscription
- ✅ Premium gates in UI (watermark, limited features)

### What's Missing

- ❌ No pay-per-export option
- ❌ Premium gates are UI-only (no server-side enforcement)
- ❌ No template marketplace
- ❌ No per-document purchase
- ❌ Checkout flow may not be fully functional
- ❌ No conversion tracking

---

## Monetization Strategy

### Phase 1: Pay-per-Export (Week 1-2)

**Fastest path to first revenue.**

| Product         | Free Limit          | Pay-per-Export Price         | Trigger        |
| --------------- | ------------------- | ---------------------------- | -------------- |
| Invoice/Receipt | Watermarked preview | ۵,۰۰۰ تومان per clean PDF    | Export button  |
| Resume          | Watermarked preview | ۵,۰۰۰ تومان per clean PDF    | Export button  |
| Writing Editor  | 5000 chars          | ۳,۰۰۰ تومان per full cleanup | Cleanup button |

**Implementation:**

1. Add "خرید تکی" button next to "خروجی رایگان"
2. ZarinPal one-time payment
3. Generate download link after payment
4. No account required

**Why this works:**

- Low barrier (5,000 تومان ≈ $0.10)
- No commitment
- Immediate value
- Users who need one document don't want subscription

### Phase 2: Monthly Premium (Week 3-4)

**For regular users.**

| Feature        | Free        | Basic (99K) | Pro (199K) |
| -------------- | ----------- | ----------- | ---------- |
| Tools          | All basic   | All basic   | All basic  |
| Processing     | Single file | Batch       | Batch      |
| Output quality | Standard    | HD          | HD         |
| Templates      | 1 theme     | 5+ themes   | 10+ themes |
| History        | None        | 30 days     | Unlimited  |
| Ads            | Yes         | No          | No         |
| Support        | Email       | Priority    | Dedicated  |
| Dashboard      | No          | Basic       | Advanced   |
| Custom reports | No          | No          | Yes        |

**Pricing adjustment for IR market:**

- Basic: ۷۹,۰۰۰ تومان/ماه (down from 99K)
- Pro: ۱۴۹,۰۰۰ تومان/ماه (down from 199K)
- Annual: ۶۹۰,۰۰۰ تومان (Basic), ۱,۴۹۰,۰۰۰ تومان (Pro)

### Phase 3: Small Business Plan (Month 2-3)

**For freelancers and small businesses.**

| Feature           | Price             | Details                                |
| ----------------- | ----------------- | -------------------------------------- |
| Business Profile  | ۱۹۹,۰۰۰ تومان/ماه | Company info saved, auto-fill invoices |
| Invoice Templates | ۱۰+ templates     | Professional themes                    |
| Invoice History   | Unlimited         | All past invoices                      |
| Branding          | Custom logo/stamp | Upload company logo                    |
| Priority Support  | Email + chat      | Faster response                        |

### Phase 4: Team/Business Profile (Month 4-6)

**For teams and enterprises.**

| Feature         | Price                   | Details                          |
| --------------- | ----------------------- | -------------------------------- |
| Team Seat       | ۹۹,۰۰۰ تومان/seat/month | Shared templates, team history   |
| Admin Dashboard | ۲۹۹,۰۰۰ تومان/ماه       | Usage analytics, team management |
| API Access      | Custom pricing          | Integrate with existing systems  |

---

## Free vs Paid Value Split

### Principles

1. **Never lock basic value** — Free users get real, useful output
2. **Upgrade at moment of value** — Show premium benefit when user needs it
3. **Watermark, don't block** — Free output has watermark, not error
4. **No annoying paywalls** — Don't interrupt workflow with popups

### Free Tier (What Users Get)

- ✅ All 80+ tools functional
- ✅ Single-file processing
- ✅ Standard output quality
- ✅ Preview before export
- ✅ Draft save/restore (localStorage)
- ✅ No registration required
- ⚠️ Watermarked output on premium templates
- ⚠️ Limited character count on writing tools

### Premium Tier (What Users Pay For)

- ✅ Clean, watermark-free output
- ✅ Batch processing (multiple files)
- ✅ HD output quality
- ✅ Professional templates
- ✅ Export history
- ✅ No ads
- ✅ Priority support

---

## Upgrade CTA Placement

### Best Moments to Show Upgrade

| Moment                  | Product | CTA                                  |
| ----------------------- | ------- | ------------------------------------ |
| Export with watermark   | Invoice | "حذف واترمارک با خرید تکی یا اشتراک" |
| Export with watermark   | Resume  | "خروجی حرفه‌ای با اشتراک"            |
| Character limit reached | Writing | "افزایش محدودیت با اشتراک"           |
| Draft limit reached     | All     | "ذخیره نامحدود با اشتراک"            |
| Batch processing needed | PDF     | "پردازش چندفایلی با اشتراک"          |

### Bad Moments (Don't Show)

- ❌ On page load
- ❌ In the middle of typing
- ❌ Before user sees value
- ❌ As a modal popup
- ❌ On mobile (too intrusive)

---

## Retention Loops

### For Free Users

1. **Draft persistence** — "آخرین فاکتور شما ذخیره شد" (Last invoice saved)
2. **Usage stats** — "شما این ماه ۵ فاکتور ساختید" (You made 5 invoices this month)
3. **Email tips** — "نکته: قالب جدید فاکتور اضافه شد" (New invoice template added)

### For Premium Users

1. **Invoice history** — "تاریخچه فاکتورهای شما" (Your invoice history)
2. **Template updates** — "قالب جدید حرفه‌ای اضافه شد" (New professional template)
3. **Feature announcements** — "قابلیت جدید: امضای آنلاین" (New feature: online signing)

---

## Revenue Projections

### Conservative (3 months)

| Month | Pay-per-Export | Subscriptions | Total  |
| ----- | -------------- | ------------- | ------ |
| 1     | $50            | $100          | $150   |
| 2     | $100           | $300          | $400   |
| 3     | $200           | $800          | $1,000 |

### Optimistic (6 months)

| Month | Pay-per-Export | Subscriptions | Total  |
| ----- | -------------- | ------------- | ------ |
| 4     | $400           | $2,000        | $2,400 |
| 5     | $600           | $3,500        | $4,100 |
| 6     | $800           | $5,000        | $5,800 |

### Key Assumptions

- 10,000 monthly active users by month 3
- 5% conversion to pay-per-export
- 2% conversion to subscription
- Average pay-per-export: $0.10 (5,000 تومان)
- Average subscription: $2/month (99,000 تومان)

---

## Implementation Checklist

### Phase 1 (Week 1-2)

- [ ] Add pay-per-export button to invoice export
- [ ] Add pay-per-export button to resume export
- [ ] Add pay-per-export button to writing cleanup
- [ ] Implement ZarinPal one-time payment
- [ ] Generate download link after payment
- [ ] Add conversion tracking events

### Phase 2 (Week 3-4)

- [ ] Update pricing page with new tiers
- [ ] Implement server-side premium enforcement
- [ ] Add batch processing for premium users
- [ ] Add HD output for premium users
- [ ] Add template selection for premium users

### Phase 3 (Month 2-3)

- [ ] Add business profile feature
- [ ] Add company info storage
- [ ] Add auto-fill for invoices
- [ ] Add custom branding (logo/stamp)

### Phase 4 (Month 4-6)

- [ ] Add team management
- [ ] Add admin dashboard
- [ ] Add API access
- [ ] Add usage analytics

---

## Risk Mitigation

| Risk                    | Mitigation                                   |
| ----------------------- | -------------------------------------------- |
| Low conversion rate     | A/B test CTAs, improve value proposition     |
| Payment gateway issues  | Support multiple gateways (ZarinPal + IDPay) |
| User churn              | Improve retention loops, add value regularly |
| Competitor undercutting | Focus on privacy-first differentiation       |
| Pricing too high        | Test lower price points (50K/100K)           |
