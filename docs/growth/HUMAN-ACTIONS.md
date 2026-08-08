# Human Actions — Growth Mission

**Created**: 2026-08-08
**Updated**: 2026-08-08 (comprehensive rewrite)
**Status**: REQUIRED HUMAN ACTIONS ONLY
**Scope**: 30-Day Growth Mission — 5 platforms, daily content, weekly scorecards

---

## 1. Scope & Principles

This document enumerates **every action a human must perform** during the 30-day growth mission. If an action is not listed here, the agent handles it autonomously.

**Core principle**: The agent builds the machine (content packs, UTM links, analytics, scoring, reports). The human operates the machine (records video, posts content, exports insights, reviews results).

---

## 2. What the Agent Handles (NO Human Required)

These are fully automated by the agent loop and supporting scripts:

| System                    | § Reference | What It Does                                                                        |
| ------------------------- | ----------- | ----------------------------------------------------------------------------------- |
| UTM link generation       | §11         | Auto-generates platform-specific UTM links for every content piece                  |
| Social pack validation    | §45         | Validates captions, hashtags, UTMs, and media specs before publishing               |
| Agent state management    | §29-33      | Tracks mission lifecycle, claim/lease, heartbeats via GitHub                        |
| Weekly report generation  | §19-20      | Produces weekly scorecards with SEARCH/PRODUCT/SOCIAL/BUSINESS metrics              |
| Hero tool scoring         | §18         | Scores and ranks hero tools based on conversion data                                |
| Content queue management  | §46         | Manages Days 1-7 content packs with platform-specific assets                        |
| SocialLandingTracker      | §12         | Tracks `?from=` parameter for 5 platforms (instagram, youtube, aparat, telegram, x) |
| Analytics wiring          | §14-18      | Self-hosted analytics, consent-gated, hero tool funnel tracking                     |
| Hetzner orchestrator      | §34-36      | Scheduled missions, heartbeat, auto-claim via systemd                               |
| Deploy pipeline           | §0, §27     | Blue-green deploy with health checks (never without user approval)                  |
| Instagram insights import | §14         | When you provide CSV/screenshots, agent processes into T-score                      |

---

## 3. Before Day 1 — Setup Actions

These must be completed before the 30-day mission starts.

### 3.1 Instagram Account Setup (§14)

**What**: Configure the founder Instagram account for the growth mission.
**Why**: Instagram requires manual login and profile configuration.
**When**: Before Day 1.
**Where**: Instagram mobile app or web.

| Step | Action                         | Details                                                   |
| ---- | ------------------------------ | --------------------------------------------------------- |
| 1    | Log in                         | Use the founder Instagram account credentials             |
| 2    | Set profile photo              | Use founder headshot or PT logo (square, 320×320 minimum) |
| 3    | Update bio                     | `علیرضا \| مهندس نرم‌افزار \| سازنده PersianToolbox 🔧`   |
| 4    | Add website link               | `persiantoolbox.ir`                                       |
| 5    | Set account to public          | Settings → Privacy → Account Privacy → OFF                |
| 6    | Enable professional account    | Settings → Account → Switch to Professional → Creator     |
| 7    | Connect to Meta Business Suite | business.facebook.com → Instagram account                 |
| 8    | Verify Insights are available  | Profile → Insights tab should appear                      |

**Verification**: Profile shows bio, link, and Insights tab. Professional account badge visible.

### 3.2 API Credentials (§48-52)

**What**: Obtain API keys for all 5 platforms.
**Why**: Automated posting and analytics require API access.
**When**: Before Day 1 (some take days to approve).
**Where**: Each platform's developer console.

| Platform        | API            | Where to Get                               | Expected Time | Notes                                                         |
| --------------- | -------------- | ------------------------------------------ | ------------- | ------------------------------------------------------------- |
| **Telegram**    | Bot API        | @BotFather on Telegram                     | 5 minutes     | Create bot → get token → set webhook to Hetzner               |
| **YouTube**     | Data API v3    | Google Cloud Console → APIs & Services     | 1-3 days      | Enable YouTube Data API → create OAuth credentials            |
| **Instagram**   | Meta Graph API | Meta Business Suite → Settings → Instagram | 1-7 days      | Requires Facebook Page connected to Instagram                 |
| **X (Twitter)** | API v2         | developer.x.com → Developer Portal         | 1-7 days      | Apply for Basic tier ($100/mo) or use free tier for read-only |
| **Aparat**      | Official API   | aparat.com/api                             | Unknown       | Investigate — may not have public API; manual posting likely  |

**Storage**: All API keys go in `.env` on Hetzner (`asdev@91.107.153.223`). Never commit to git.

**Telegram Bot Setup** (fastest — do first):

```bash
# 1. Open Telegram, search @BotFather
# 2. Send /newbot → name: "PersianToolbox Bot" → username: "persiantoolbox_bot"
# 3. Copy the token
# 4. Set webhook:
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://persiantoolbox.ir/api/telegram/webhook"}'
```

### 3.3 Hetzner Orchestrator Setup (§34-36)

**What**: Install and configure the orchestrator on Hetzner.
**Why**: The orchestrator runs scheduled missions and heartbeats.
**When**: Before Day 1.
**Where**: `asdev@91.107.153.223` via SSH.

```bash
# SSH into Hetzner
ssh -i /home/dev13/.ssh/id_ed25519 asdev@91.107.153.223

# Clone repo
git clone https://github.com/alirezasafaeisystems/persiantoolbox.git
cd persiantoolbox

# Install deps
pnpm install

# Copy environment
cp .env.example .env
# Edit .env with production values

# Build
NODE_OPTIONS=4096 pnpm build

# Set up systemd service
sudo cp scripts/orchestrator/persiantoolbox-orchestrator.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable persiantoolbox-orchestrator
sudo systemctl start persiantoolbox-orchestrator

# Verify
sudo systemctl status persiantoolbox-orchestrator
```

**Verification**: `systemctl status` shows active (running). `curl localhost:3000/api/health` returns OK.

### 3.4 Content Creation — Day 1 Kit

**What**: Record and prepare Day 1 content for all platforms.
**Why**: Content must exist before it can be published.
**When**: Before Day 1 (or on Day 1 morning).
**Where**: Recording studio / home office.

#### Instagram Reel (Day 1)

| Field              | Value                                                |
| ------------------ | ---------------------------------------------------- |
| Tool               | address-fa-to-en                                     |
| Route              | `/text-tools/address-fa-to-en`                       |
| Hook               | "۳ ثانیه" — Speed emphasis                           |
| Duration           | 8-10 seconds, vertical 9:16                          |
| Dialogue           | See `docs/growth/content-queue/day-01-production.md` |
| Google Flow Prompt | See Day 1 production kit                             |
| Caption            | See Day 1 production kit                             |
| Hashtags           | `#ابزار_آنلاین #تبدیل_آدرس #جعبه_ابزار_فارسی`        |

**Recording steps**:

1. Open Google Flow → paste prompt from Day 1 production kit
2. Generate video → review for identity consistency (Rose character)
3. Export in 9:16 vertical format
4. Review: check lip sync, identity match, duration (8-10s)
5. Save to device

#### YouTube Short (Day 1)

| Field       | Value                                       |
| ----------- | ------------------------------------------- |
| Content     | Same as Instagram Reel (reuse video)        |
| Format      | Vertical 9:16, under 60 seconds             |
| Title       | "تبدیل آدرس فارسی به انگلیسی در ۳ ثانیه ⚡" |
| Description | Tool link + UTM params                      |
| Tags        | Persian, address converter, فارسی           |

#### Aparat Short (Day 1)

| Field   | Value                                |
| ------- | ------------------------------------ |
| Content | Same as Instagram Reel (reuse video) |
| Format  | Vertical 9:16, under 60 seconds      |
| Title   | Same as YouTube                      |
| Tags    | Persian, address converter           |

#### Telegram Post (Day 1)

| Field | Value                                                                                                                                                             |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Text  | See Day 1 production kit (Persian text)                                                                                                                           |
| Link  | `https://persiantoolbox.ir/text-tools/address-fa-to-en?utm_source=telegram&utm_medium=community_organic&utm_campaign=pdf_tools_cycle1&utm_content=team_post_day1` |
| Image | Generate cover image for the tool                                                                                                                                 |

#### X Thread (Day 1)

| Field       | Value                                                            |
| ----------- | ---------------------------------------------------------------- |
| Thread      | 3-5 tweets, problem → solution → CTA                             |
| First tweet | Hook: "آدرس فارسیت رو چند دقیقه طول میکشه به انگلیسی تبدیل کنی؟" |
| Last tweet  | CTA with UTM link                                                |
| Media       | Attach cover image                                               |

---

## 4. Weekly Actions (During 30-Day Mission)

### 4.1 Content Recording (Every Week)

**What**: Record 7 Reels, 7 YouTube Shorts, 7 Aparat Shorts, write 7 Telegram posts, write 7 X threads.
**Why**: Daily content drives the growth flywheel.
**When**: Record in batch (e.g., Sunday evening for the week).
**Where**: Home office / studio.

**Weekly content schedule**:

| Day   | Tool             | Content Type           | Persona |
| ----- | ---------------- | ---------------------- | ------- |
| Day 1 | address-fa-to-en | Reel/Short/Post/Thread | Rose    |
| Day 2 | pdf-compress     | Reel/Short/Post/Thread | Rose    |
| Day 3 | contract-tools   | Reel/Short/Post/Thread | Rose    |
| Day 4 | resume-builder   | Reel/Short/Post/Thread | Rose    |
| Day 5 | writing-studio   | Reel/Short/Post/Thread | Rose    |
| Day 6 | invoice-maker    | Reel/Short/Post/Thread | Rose    |
| Day 7 | founder-story    | Reel/Short/Post/Thread | Founder |

**Recording workflow** (per content piece):

1. Open production kit for the day (`docs/growth/content-queue/day-XX-production.md`)
2. Copy Google Flow prompt → generate video in Google Flow
3. Review video: identity consistency, duration, lip sync
4. Export in required format
5. Generate cover image (if needed)
6. Prepare caption from production kit
7. UTM links are pre-generated in the kit — copy them

**Batch recording tips**:

- Record all 7 Reels in one session (saves setup time)
- Use same outfit/environment across the week for consistency
- Keep a "recording checklist" to ensure each piece meets specs

### 4.2 Instagram Insights Export (Every 48-72 Hours)

**What**: Export engagement metrics for each published Reel.
**Why**: Instagram Insights are not available via API for free tier — manual export required.
**When**: 24h and 72h after publishing each Reel.
**Where**: Instagram app → Insights → Content.

**Steps**:

1. Open Instagram app → go to profile
2. Tap Insights → Content → Reels
3. For each Reel, record:

| Metric         | How to Find                                                   |
| -------------- | ------------------------------------------------------------- |
| Reach          | Insights → Content → Reel → Reach                             |
| Impressions    | Insights → Content → Reel → Impressions                       |
| Saves          | Insights → Content → Reel → Interactions → Saves              |
| Shares         | Insights → Content → Reel → Interactions → Shares             |
| Comments       | Insights → Content → Reel → Interactions → Comments           |
| Link Clicks    | Insights → Content → Reel → Profile Activity → Link Clicks    |
| Profile Visits | Insights → Content → Reel → Profile Activity → Profile Visits |

4. Send data to agent via one of:
   - **CSV file**: Export from Instagram → send to agent
   - **Screenshots**: Screenshot each Reel's insights → send to agent
   - **Manual entry**: Type the numbers into a message to the agent

**Agent processing**: The agent imports your data into the T-score baseline (`docs/growth/T0-baseline-scorecard.md`) and updates weekly scorecards.

### 4.3 Review Agent Reports (Every Week)

**What**: Review the weekly scorecard and agent decisions.
**Why**: Human judgment is needed to approve strategy changes.
**When**: Every Monday (after weekly scorecard is generated).
**Where**: `docs/growth/weekly-scorecards/` directory.

**Steps**:

1. Check `docs/growth/weekly-scorecards/` for new scorecard files
2. Review the scorecard:
   - SEARCH metrics (clicks, impressions, CTR, position)
   - PRODUCT metrics (tool starts, completions, exports)
   - SOCIAL metrics (reach, saves, shares, link clicks)
   - BUSINESS metrics (signups, checkouts, revenue)
3. Review agent decisions:
   - PROMOTE: Which content/tools got more resources?
   - ITERATE: Which underperformers got new angles?
   - KILL: What was deprioritized?
4. Approve or reject each decision
5. Provide feedback on content quality (e.g., "Reel Day 3 hook was weak — adjust")

**Approval format** (send to agent):

```
Week N Scorecard Review:
- [APPROVE] PROMOTE: Reels with "speed" hooks
- [APPROVE] ITERATE: Resume builder — try "before/after" angle
- [REJECT] KILL: Aparat — keep investing, metrics improving
- Feedback: Day 5 reel CTA was unclear, add "link in bio" verbal CTA
```

### 4.4 Publish Content (Daily)

**What**: Upload and publish each day's content to all platforms.
**Why**: Instagram/YouTube/Aparat/Telegram/X APIs may not support automated publishing (especially free tiers).
**When**: Daily, ideally at peak hours (12-2 PM, 8-10 PM Iran time).
**Where**: Each platform's app or web interface.

**Publishing checklist per content piece**:

- [ ] Video/content uploaded
- [ ] Caption pasted from production kit
- [ ] Hashtags added (from production kit)
- [ ] UTM link added (from production kit)
- [ ] Cover image set (if applicable)
- [ ] Location tag added (optional: Iran / تهران)
- [ ] Alt text added (accessibility)
- [ ] Published at optimal time

**Platform-specific notes**:

| Platform  | Where to Post                      | Notes                              |
| --------- | ---------------------------------- | ---------------------------------- |
| Instagram | App → Reel → Upload                | Add to Stories too for extra reach |
| YouTube   | Studio → Content → Shorts → Upload | Add to Shorts playlist             |
| Aparat    | Web → Upload Video                 | Add to relevant category           |
| Telegram  | App → Channel → New Post           | Use formatting (bold, links)       |
| X         | Web/App → New Tweet/Thread         | Pin first thread to profile        |

---

## 5. Monthly Actions (End of 30-Day Mission)

### 5.1 Final Scorecard Review

**What**: Review T30 scorecard and decide next phase.
**Why**: Strategic decisions require human judgment.
**When**: Day 30.
**Where**: `docs/growth/weekly-scorecards/2026-WXX.md` (final week).

**Decision framework**:

| Metric                  | Green (Continue) | Yellow (Iterate) | Red (Pivot/Pause) |
| ----------------------- | ---------------- | ---------------- | ----------------- |
| Instagram followers     | +500             | +200-500         | <200              |
| Tool starts from social | +50%             | +20-50%          | <20%              |
| Weekly reach            | 10K+             | 5K-10K           | <5K               |
| Engagement rate         | >5%              | 3-5%             | <3%               |
| Revenue from social     | +$100            | $50-100          | <$50              |

**Outcomes**:

- **Continue**: Scale what's working, double down on winning platforms
- **Iterate**: Adjust content angles, posting times, or platform mix
- **Pivot**: Change strategy entirely (e.g., focus on 2 platforms instead of 5)
- **Pause**: Stop content creation, focus on product improvements

### 5.2 API Credential Rotation

**What**: Rotate any API tokens that may have been exposed.
**Why**: Security hygiene — rotate tokens periodically.
**When**: End of 30-day mission (or sooner if compromise suspected).
**Where**: Each platform's developer console + Hetzner `.env`.

**Steps**:

1. Generate new API keys for each platform
2. Update `.env` on Hetzner: `ssh asdev@91.107.153.223 "nano persiantoolbox/.env"`
3. Restart orchestrator: `sudo systemctl restart persiantoolbox-orchestrator`
4. Verify health: `curl localhost:3000/api/health`
5. Revoke old keys in each platform's developer console

### 5.3 Infrastructure Review

**What**: Review orchestrator health, costs, and performance.
**Why**: Hetzner costs and system health need periodic checks.
**When**: End of 30-day mission.
**Where**: Hetzner console + SSH.

**Checks**:

- [ ] Orchestrator uptime (should be 99%+)
- [ ] Hetzner monthly cost (should be within budget)
- [ ] Disk usage (should be <80%)
- [ ] Memory usage (should be <80%)
- [ ] No failed missions in the last 30 days
- [ ] All API credentials still valid

---

## 6. Quick Reference Commands

### Check Orchestrator Status (on Hetzner)

```bash
ssh -i ~/.ssh/id_ed25519 asdev@91.107.153.223 \
  "sudo systemctl status persiantoolbox-orchestrator"
```

### View Current Mission State

```bash
cat docs/growth/agent-loop/state.json
```

### Validate Content Packs

```bash
npx tsx scripts/growth/social-pack-generator.ts \
  --validate-dir=docs/growth/social-packs/
```

### Generate Weekly Summary

```bash
npx tsx scripts/growth/weekly-growth-report.ts --week=1
```

### Check SocialLandingTracker

```bash
# Test UTM parameter on any page
curl -s "https://persiantoolbox.ir/?from=instagram" | grep -o 'from=instagram'
```

### Import Instagram Insights (Manual)

```bash
# When you have CSV/screenshots, send them to the agent with:
# "Import this Instagram insights data for T7 scorecard"
# Agent will process into docs/growth/weekly-scorecards/
```

---

## 7. Human Action Checklist — Quick Start

Print this and check off as you complete each item.

### Before Day 1

- [ ] Instagram account configured (§3.1)
- [ ] Telegram bot created and webhook set (§3.2)
- [ ] YouTube Data API enabled (§3.2)
- [ ] Instagram Meta API access requested (§3.2)
- [ ] X developer account applied (§3.2)
- [ ] Aparat API investigated (§3.2)
- [ ] Hetzner orchestrator installed (§3.3)
- [ ] Day 1 content recorded (§3.4)
- [ ] Day 1 cover images generated (§3.4)
- [ ] Day 1 Telegram post written (§3.4)
- [ ] Day 1 X thread written (§3.4)

### Every Day (30 days)

- [ ] Publish Instagram Reel (§4.4)
- [ ] Publish YouTube Short (§4.4)
- [ ] Publish Aparat Short (§4.4)
- [ ] Publish Telegram post (§4.4)
- [ ] Publish X thread (§4.4)
- [ ] Add Reel to Instagram Stories (§4.4)
- [ ] Respond to comments within 1 hour (§4.4)

### Every 48-72 Hours

- [ ] Export Instagram Insights for published Reels (§4.2)
- [ ] Send insights data to agent (§4.2)

### Every Week

- [ ] Record next week's 7 content pieces (§4.1)
- [ ] Review weekly scorecard (§4.3)
- [ ] Approve/reject agent decisions (§4.3)
- [ ] Provide feedback on content quality (§4.3)

### End of 30-Day Mission

- [ ] Review T30 final scorecard (§5.1)
- [ ] Decide next phase: continue / iterate / pivot / pause (§5.1)
- [ ] Rotate API credentials (§5.2)
- [ ] Review infrastructure health (§5.3)

---

## 8. Escalation & Support

### If You're Stuck

| Problem                            | What to Do                                                                                                                               |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Instagram won't let you post Reels | Check account is public + professional. Update app. Try web upload.                                                                      |
| Google Flow video looks wrong      | Regenerate with adjusted prompt. Check Rose character bible for identity constraints.                                                    |
| API key rejected                   | Verify key is correct. Check rate limits. Rotate if expired.                                                                             |
| Orchestrator not responding        | SSH into Hetzner → `sudo systemctl restart persiantoolbox-orchestrator` → check logs with `journalctl -u persiantoolbox-orchestrator -f` |
| Content not getting reach          | Check posting time (peak hours). Review hook quality. Check hashtags. Ask agent for analysis.                                            |
| Agent report has errors            | Send the error to the agent with the exact command/output. Agent will fix.                                                               |

### Emergency Contacts

- **Agent**: Respond in this chat or create a mission in `docs/growth/agent-loop/missions/`
- **Hetzner SSH**: `ssh -i /home/dev13/.ssh/id_ed25519 asdev@91.107.153.223`
- **Production health**: `curl -s https://persiantoolbox.ir/api/health`

---

## 9. What NOT to Do

| Don't                                         | Why                                                                       |
| --------------------------------------------- | ------------------------------------------------------------------------- |
| Don't deploy without running QA gate          | typecheck + lint + vitest + build must pass first                         |
| Don't share API keys in chat or git           | Use `.env` files only; never commit secrets                               |
| Don't skip Instagram Insights export          | Agent needs data for scorecards; without it, growth is unmeasurable       |
| Don't post without UTM links                  | All traffic must be trackable; links are pre-generated in production kits |
| Don't change agent code without understanding | The agent loop is fragile; ask the agent to make changes                  |
| Don't auto-approve agent decisions            | Review scorecards weekly; human judgment is required                      |
| Don't rotate API keys without testing         | Always verify new keys work before revoking old ones                      |

---

## 10. Version History

| Version | Date       | Changes                                                                                                                                     |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2026-08-08 | Initial human actions document                                                                                                              |
| 2.0     | 2026-08-08 | Comprehensive rewrite: 5 platforms, daily content, weekly scorecards, orchestrator setup, API credentials, monthly review, escalation guide |
