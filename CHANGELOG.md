# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [7.9.0] - 2026-07-09

### Added

- Deployment readiness checklist (32 checks across 6 categories)
- Incident response runbook (4 incident types)
- Performance optimization checklist
- Backup/restore drill + security audit scripts
- Uptime timer (5-minute persistent) + Lighthouse CI config
- Rollback rehearsal script
- CHANGELOG.md
- CWV monitoring script
- Performance monitoring script

### Changed

- Improved testimonials with honest usage-pattern data
- Reduced JSON-LD from 20 to 10 articles
- Removed unused reviewedBy/reviewedDate from blog frontmatter
- Consistent brand name 'جعبه ابزار فارسی' across all pages

### Fixed

- Remove keyword stuffing: 'بدون ثبت‌نام' (8→0), 'پردازش محلی' (2→0)
- Systematic design token enforcement across 70 files
- text-white → text-[var(--text-inverted)] (43+ files)
- shadow/rounded tokens consistency
- Dark mode CSS variable overrides
- Undefined --border-subtle → --border-light
- FeedbackSurvey excluded from trust/contact pages
- Focus-trap in UpgradeModal
- Null pathname handling in FeedbackSurvey
- Contrast fixes (#888→#666, #999→#666)
- ESLint --ext flag removal
- Security audit exclusions for third-party libs
