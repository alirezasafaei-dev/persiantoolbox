# Release Candidate Reports

این پوشه خروجی اجرای gateهای Release Candidate را نگهداری می‌کند.

## تولید گزارش

- اعتبارسنجی RC: `pnpm release:rc:validate`
- اعتبارسنجی rollback drill: `pnpm release:rollback:validate`
- اجرای RC core gates: `pnpm release:rc:run`

## قرارداد خروجی

هر گزارش `rc-gates-*.json` باید شامل این فیلدها باشد:

- `version`
- `generatedAt`
- `tier`
- `overallStatus`
- `steps[]`
- `releaseRecommendation`
