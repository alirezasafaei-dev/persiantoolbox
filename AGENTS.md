# Agent Governance - PersianToolbox

**Last Updated**: 2026-06-22
**Status**: ✅ Active
**Version**: v3.9.0

---

## 📜 Governance

This project uses a **DCO + CLA Hybrid** governance model:

- **[DCO.md](DCO.md)** — Developer Certificate of Origin for all contributors
- **[cla-individual.md](docs/licensing/cla-individual.md)** — Individual Contributor License Agreement
- **[cla-corporate.md](docs/licensing/cla-corporate.md)** — Corporate Contributor License Agreement

All commits must include a `Signed-off-by` trailer per the DCO process.

---

## 🤖 Agent Guidelines

### Preferred Agent Profiles

- **subagent_general**: Use for general development tasks requiring write access
- **subagent_explore**: Use for codebase exploration and research
- **deep-review**: Use for complex tool development or security reviews
- **fast-fix**: Use for quick bug fixes and small feature additions

### Agent Working Directory

- **Base Path**: `/home/dev13/my-project/sites/live/persiantoolbox`
- **Allowed Directories**: `src/`, `scripts/`, `docs/`, `tests/`, `packages/`, `app/`, `lib/`, `components/`
- **Restricted Directories**: `.git/`, `node_modules/`, `.next/`, `dist/`, `.turbo`

### Key Constraints

- **No Global Installs**: Use project-local dependencies only
- **Testing Required**: All changes must pass `pnpm test` and `pnpm lint`
- **Type Safety**: Must pass `pnpm typecheck`
- **Security First**: No hardcoded secrets, use environment variables
- **Privacy**: Maintain client-side processing for tools
- **Performance**: Changes must not degrade Lighthouse scores below 90

---

## 🚦 Decision Rules

### When to Use `subagent_general`

- New tool implementation
- Tool bug fixes and improvements
- Library package changes
- Feature implementation
- Build system modifications

### When to Use `subagent_explore`

- Understanding existing tool patterns
- Researching new tool implementations
- Analyzing library dependencies
- Understanding architecture

### When to Use `deep-review`

- Security-sensitive tool implementations
- Library package changes
- Performance-critical changes
- Major refactoring

### When to Use `fast-fix`

- Typo corrections
- Simple bug fixes
- Minor UI improvements
- Documentation updates

### When to Ask for Approval

- Breaking changes to tool APIs
- Library package major version updates
- Security-related changes
- Performance regressions >5%

---

## 📋 Execution Checklist

### Pre-Development

- [ ] Read relevant existing tool code
- [ ] Understand impact on other tools
- [ ] Check for similar implementations
- [ ] Review security implications
- [ ] Consider performance impact

### During Development

- [ ] Follow existing tool patterns
- [ ] Write/update tests for new functionality
- [ ] Use TypeScript strictly (no `any`)
- [ ] Maintain client-side processing
- [ ] Implement proper error handling

### Post-Development

- [ ] Run `pnpm lint` - must pass
- [ ] Run `pnpm typecheck` - must pass
- [ ] Run `pnpm test` - must pass
- [ ] Test tool functionality manually
- [ ] Check Lighthouse scores
- [ ] Verify privacy features

### Before Commit

- [ ] Write clear, conventional commit message
- [ ] Ensure changes are minimal and focused
- [ ] Check for accidentally committed files
- [ ] Verify environment variables not committed
- [ ] Run quality gates if significant change

---

## 🔧 Common Tasks

### Adding New Tool

```bash
# 1. Implement tool in app/(tools)/
# 2. Add tests in __tests__/
# 3. Update tools-registry.ts
# 4. Update documentation
# 5. Verify client-side processing
# 6. Test tool functionality
```

### Library Package Change

```bash
# 1. Modify package in src/packages/
# 2. Update exports
# 3. Add tests for changes
# 4. Build library
# 5. Update documentation
```

### Build System Change

```bash
# 1. Modify script in scripts/
# 2. Test locally
# 3. Update package.json
# 4. Test build process
# 5. Update documentation
```

---

## 🚨 Critical Rules

### NEVER

- Commit `.env` files or secrets
- Compromise client-side processing
- Add external API calls without privacy consideration
- Disable security features
- Commit directly to `main` branch
- Skip tests for any reason
- Use `eval()` or similar dangerous functions
- Hardcode credentials or API keys
- Ignore TypeScript errors
- Commit node_modules or build artifacts

### ALWAYS

- Maintain client-side processing
- Use environment variables for configuration
- Write tests for new functionality
- Follow existing tool patterns
- Consider user privacy
- Think about performance impact
- Document complex logic
- Handle errors gracefully
- Validate user inputs

---

## 📊 Quality Gates

### Must Pass Before Merge

- ✅ All linting rules (`pnpm lint`)
- ✅ TypeScript compilation (`pnpm typecheck`)
- ✅ Unit tests (`pnpm test`)
- ✅ E2E tests (`pnpm test:e2e`)
- ✅ No security vulnerabilities
- ✅ Lighthouse scores 90+

### Optional But Recommended

- 📊 Full test suite with coverage
- 🎨 Visual regression tests
- 🚀 Performance budget checks
- 🔍 Security deep scan

---

## 🆘 Troubleshooting

### Build Failures

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules
pnpm install

# Clear Turbocache
rm -rf .turbo
```

### Test Failures

```bash
# Run tests in verbose mode
pnpm test --verbose

# Run specific test file
pnpm test path/to/test.test.ts

# Update visual snapshots
pnpm test:visual:update
```

### Type Errors

```bash
# Check TypeScript configuration
cat tsconfig.json

# Build library
pnpm build:lib

# Check for any types
pnpm typecheck
```

---

## 📚 Project-Specific Resources

### Key Files

- **Package Configuration**: `package.json`
- **TypeScript Config**: `tsconfig.json`
- **Library Config**: `tsup.config.ts`
- **Environment Variables**: `.env.example`
- **Testing Config**: Vitest configuration

### Important Scripts

- **Development**: `pnpm dev`
- **Build**: `pnpm build`
- **Test**: `pnpm test`
- **Lint**: `pnpm lint`
- **Type Check**: `pnpm typecheck`
- **Library Build**: `pnpm build:lib`

### Quality Scripts

- **Full Check**: `pnpm check`
- **Quality Gates**: `pnpm ci:contracts`
- **Performance**: `pnpm performance:budgets`
- **Security**: `pnpm security:scan`

---

## 🔒 Privacy Rules

### Client-Side Processing

- **Mandatory**: All tool processing must be client-side
- **Data Privacy**: No user data should be transmitted
- **No Server Processing**: Tools must work offline
- **Secure**: Use secure libraries and practices

### Allowed Dependencies

- **Client-side Libraries**: PDF-lib, PDF.js for PDF processing
- **Calculation Libraries**: JavaScript math libraries
- **Image Processing**: Client-side image libraries
- **No External APIs**: Tools must not depend on external APIs

---

## 🔄 Continuous Improvement

### Regular Maintenance Tasks

- **Weekly**: Dependency updates
- **Monthly**: Security audits
- **Quarterly**: Performance reviews
- **Biannually**: Tool library review

### Agent Feedback Loop

- Report patterns that could be automated
- Suggest improvements to tool UX
- Identify new tool opportunities
- Flag technical debt for future sprints
- Recommend privacy enhancements

---

## 🤖 CLI Agent Automation Support

### Agent Skills Directory

- **Location**: `.agents/skills/`
- **Purpose**: Reusable agent workflows and patterns
- **Usage**: Automatically loaded by Devin CLI

### MCP Server Integration

- **Neon**: Database operations
- **Playwright**: Browser automation and testing
- **GitHub**: GitHub API integration

### Agent Execution Patterns

1. **Exploration**: Use `subagent_explore` for code research
2. **Implementation**: Use `subagent_general` for code changes
3. **Validation**: Use quality gates before committing
4. **Documentation**: Update docs as part of implementation

---

---

## 🚀 Full Project Completion Prompt

این پرامپت را در چت جدید وارد کنید تا تکمیل کامل پروژه اجرا شود:

```
تو یک مهندس ارشد فول‌استک، QA engineer، DevOps engineer و release manager هستی.

پروژه:
- مسیر: /home/dev13/my-project/sites/live/persiantoolbox
- سایت: https://persiantoolbox.ir
- VPS: 193.93.169.247 (کاربر: ubuntu، پورت: 22)
- رمز SSH در فایل .env موجود است
- نقشه راه: docs/roadmap.md

مأموریت:
نقشه راه کامل پروژه را اجرا کن. تمام فیچرهای غیرفعال و نیمه‌کاره را تکمیل کن. همه چیز باید کامل و واقعی باشد.

قوانین:
- خودکار کار کن بدون توقف
- فقط برای موارد مخرب یا مبهم تأیید بگیر
- کد واقعی بنویس، placeholder نذار
- RTL و رفتار فارسی‌اول را حفظ کن
- حریم خصوصی محلی را حفظ کن
- تست بنویس
- قبل از دیپلوی quality gates را اجرا کن

مراحل اجرا (به ترتیب):

فاز ۱: احراز هویت و حساب کاربری
1. خواندن lib/server/auth.ts, lib/server/sessions.ts, lib/server/passwords.ts
2. بررسی API route‌ها: app/api/auth/login, logout, me, register
3. بررسی صحت جریان لاگین/لاگاوت/رجیستر
4. فعال‌سازی فلگ auth در lib/features/availability.ts
5. خواندن app/account/page.tsx
6. فعال‌سازی فلگ account
7. تست کامل جریان احراز هویت

فاز ۲: اشتراک و پرداخت
1. خواندن lib/subscriptions/, lib/subscriptionPlans.ts
2. بررسی API route‌ها: app/api/subscription/*
3. فعال‌سازی فلگ subscription
4. فعال‌سازی فلگ plans
5. فعال‌سازی فلگ checkout
6. خواندن app/(tools)/subscription/page.tsx و حذف بنر "به‌زودی"
7. خواندن app/(tools)/premium/page.tsx و حذف بنر "به‌زودی"
8. تست کامل جریان اشتراک

فاز ۳: پریمیوم و تبلیغات
1. خواندن lib/premium/premium-features.ts
2. فعال‌سازی premium features
3. فعال‌سازی فلگ ads
4. تست صفحه تبلیغات

فاز ۴: پنل ادمین
1. فعال‌سازی فلگ admin-site-settings
2. فعال‌سازی فلگ admin-monetization
3. فعال‌سازی فلگ dashboard
4. تست پنل‌های ادمین

فاز ۵: توسعه‌دهندگان و ابزارها
1. فعال‌سازی فلگ developers
2. بررسی ابزارهای Base64 و JSON Formatter
3. پیاده‌سازی یا حذف رمزگذاری PDF (encrypt-pdf)
4. تست تمام ابزارها

فاز ۶: تست و کیفیت
1. اجرای pnpm lint
2. اجرای pnpm typecheck
3. اجرای pnpm vitest --run
4. اجرای pnpm test:ci
5. اجرای pnpm build
6. رفع تمام خطاها

فاز ۷: دیپلوی
1. بروزرسانی version در package.json
2. هماهنگ‌سازی کد با VPS (rsync)
3. build روی VPS
4. ریستارت PM2
5. بررسی تمام مسیرها روی سایت زنده

فاز ۸: مستندات و تمیزکاری
1. بروزرسانی docs/roadmap.md
2. حذف placeholder و stub کدها
3. پاکسازی فایل‌های استفاده نشده
4. کامیت نهایی

خروجی نهایی:
- تمام فلگ‌های غیرفعال فعال شده باشند
- تمام بنرهای "به‌زودی" حذف شده باشند
- تمام ابزارها کاربردی باشند
- اپ موبایل تکمیل شده باشد
- تست‌ها کامل باشند
- سایت زنده و کاربردی باشد
- مستندات بروز شده باشد
```

---

## Contributor licensing

- Follow the Developer Certificate of Origin process in `DCO.md` and include the required `Signed-off-by` trailer on commits.
- Review the applicable contributor terms in `docs/licensing/cla-individual.md` or `docs/licensing/cla-corporate.md` before contributing.

---

_This governance document ensures consistent, high-quality contributions while maintaining the privacy-first, performance-focused nature of the PersianToolbox platform._
