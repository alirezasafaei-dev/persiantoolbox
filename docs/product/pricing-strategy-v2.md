# Pricing Strategy v2 — Export Credit Model

**Date:** 2026-06-27
**Status:** IMPLEMENTED (config + UI)

## Overview

PersianToolbox monetization is based on **export credits**. Each clean export (without watermark) costs 1 credit. Watermarked exports are always free.

## Pricing Tiers

| Plan     | Price             | Credits/Month | Daily Limit | Top-ups | Max Users |
| -------- | ----------------- | ------------- | ----------- | ------- | --------- |
| Free     | 0                 | 0             | 0           | No      | 1         |
| Pack 3   | 49,000 تومان      | 3             | 3           | No      | 1         |
| Basic    | 99,000 تومان/ماه  | 10            | 3           | Yes     | 1         |
| Standard | 199,000 تومان/ماه | 120           | 10          | Yes     | 1         |
| Pro      | 399,000 تومان/ماه | 500           | 30          | Yes     | 1         |
| Team     | 999,000 تومان/ماه | 3000          | 200         | Yes     | 5         |

## Top-Up Packs

| Pack     | Credits | Price         |
| -------- | ------- | ------------- |
| 3 extra  | 3       | 49,000 تومان  |
| 10 extra | 10      | 129,000 تومان |
| 50 extra | 50      | 499,000 تومان |

## Credit Rules

1. **1 clean export = 1 credit**
2. **Watermarked export = free** (always)
3. **Preview = free** (always)
4. **Token/API failure = free** (no charge on error)
5. **Re-download same export within 30 minutes = free** (retry window)
6. **Daily limit enforced** (timezone: Asia/Tehran)
7. **Monthly credits reset** at subscription renewal

## Iran Market Alignment

- Prices in تومان (Iranian currency)
- Competitive with local alternatives
- Pack 3 for occasional users (low barrier)
- Standard as recommended (balanced value)
- Team for small businesses (3-5 users)

## Privacy Model

| Data             | Sent to Server | Stored   |
| ---------------- | -------------- | -------- |
| Document content | ❌ Never       | ❌ Never |
| Invoice items    | ❌ Never       | ❌ Never |
| Resume text      | ❌ Never       | ❌ Never |
| Writing text     | ❌ Never       | ❌ Never |
| Credit usage     | ✅ Yes         | ✅ Yes   |
| Plan info        | ✅ Yes         | ✅ Yes   |
| User ID          | ✅ Yes         | ✅ Yes   |

## Implementation Status

| Component              | Status                             |
| ---------------------- | ---------------------------------- |
| Central pricing config | ✅ lib/pricing/exportCredits.ts    |
| Subscription plans     | ✅ Updated to credit model         |
| Pricing UI             | ✅ Updated with credit explanation |
| Upgrade modal          | ✅ Updated with credit options     |
| Unit tests             | ✅ 19 tests for pricing config     |
| Credit metering        | ⏳ Next sprint                     |
| DB migration           | ⏳ Next sprint                     |
