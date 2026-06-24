# TODO Next (Prioritized)

## P0

1. Finish CSP tightening from `style-src-attr 'unsafe-inline'` fallback to full nonce/hash coverage for remaining inline style attributes, and keep Playwright security header contracts green.

## P1

1. Add guide listing/search UX improvements (topic tags, reading time, internal link cards) and measure engagement events.
2. Add Lighthouse budget thresholds per critical Persian routes (`/`, `/tools`, `/pdf-tools`, `/guides`) with trend reporting.
3. Add automated doc link checker for `README.md` + `docs/**` in CI gate.

## P2

1. Add structured observability dashboard contract (SLO/SLA and error-budget docs in repo).
2. Add route-level accessibility smoke checks for top guides and tool pages in Playwright + axe.
3. **CLI Agent Execution - Phase 0**: Configure agent profiles in AGENTS.md, set up agent skill definitions in `.agents/skills/`, define agent permissions and constraints, create agent execution guidelines, set up agent monitoring and logging.
4. **CLI Agent Execution - Sprint 1**: Create agent skill for new tool scaffolding, automate tool test generation, automate tool documentation updates, set up tool registry integration, create tool validation automation.
