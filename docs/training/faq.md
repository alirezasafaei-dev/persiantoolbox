# FAQ - PersianToolbox CLI Agent

**Last Updated**: 2026-06-15
**Version**: 1.0
**Status**: Complete

---

## General Questions

### Q: What is the PersianToolbox CLI Agent?

**A:** The PersianToolbox CLI Agent is an AI-powered automation system that helps developers with common tasks like code review, bug fixing, testing, and documentation. It uses specialized skills and utilities to automate repetitive development workflows.

### Q: How do I get started?

**A:**

1. Clone the repository
2. Install dependencies with `pnpm install`
3. Read the `AGENTS.md` file for governance guidelines
4. Check `docs/training/agent-usage-guide.md` for usage instructions

### Q: What are the available agent profiles?

**A:**

- **subagent_general**: General development tasks with write access
- **subagent_explore**: Codebase exploration and research (read-only)
- **deep-review**: Complex analysis and security reviews
- **fast-fix**: Quick bug fixes and small changes

---

## Technical Questions

### Q: How do I run quality checks?

**A:**

```bash
pnpm lint          # Check code style
pnpm typecheck     # Check TypeScript types
pnpm test          # Run tests
pnpm build         # Build the project
```

### Q: What should I do if lint fails?

**A:**

```bash
# Auto-fix most issues
pnpm lint --fix

# Check specific file
pnpm lint src/path/to/file.ts
```

### Q: How do I add a new tool?

**A:**

1. Use the tool-scaffolding skill
2. Follow existing patterns in `app/(tools)/`
3. Add tests in `__tests__/`
4. Update `tools-registry.ts`
5. Run quality checks

### Q: How do I fix a failing test?

**A:**

1. Run the specific test: `pnpm vitest run path/to/test.test.ts`
2. Check the error message
3. Fix the implementation or test
4. Re-run to verify

### Q: How do I update dependencies?

**A:**

```bash
# Check for updates
pnpm outdated

# Update specific package
pnpm update package-name

# Update all (minor/patch)
pnpm update

# Update all (including major)
pnpm update --latest
```

---

## Agent Questions

### Q: When should I use each agent profile?

**A:**

- **subagent_general**: Creating new features, implementing changes
- **subagent_explore**: Understanding codebase, researching patterns
- **deep-review**: Security reviews, architecture analysis
- **fast-fix**: Typo fixes, minor UI changes

### Q: How do agent skills work?

**A:** Agent skills are reusable workflows stored in `.agents/skills/`. Each skill has a `SKILL.md` file with instructions. Import the corresponding utility from `lib/` to use the skill's functionality.

### Q: How do I create a new agent skill?

**A:**

1. Create a new directory in `.agents/skills/`
2. Add a `SKILL.md` file with instructions
3. Create corresponding utility in `lib/`
4. Update documentation

### Q: How do I track agent performance?

**A:** Use the analytics dashboard:

```typescript
import { agentAnalyticsDashboard } from '@/lib/agent-analytics-dashboard';
const analytics = agentAnalyticsDashboard.getAnalytics();
```

---

## Workflow Questions

### Q: How do I submit code for review?

**A:**

1. Create a feature branch
2. Make your changes
3. Run quality checks
4. Commit with descriptive message
5. Push and create pull request

### Q: How do I handle merge conflicts?

**A:**

1. Pull latest changes: `git pull origin main`
2. Resolve conflicts manually
3. Test your changes
4. Commit the resolution

### Q: How do I revert a change?

**A:**

```bash
# Revert last commit
git revert HEAD

# Revert specific commit
git revert <commit-hash>

# Undo last commit (keep changes)
git reset --soft HEAD~1
```

### Q: How do I update documentation?

**A:**

1. Use the documentation-update skill
2. Or manually update relevant files in `docs/`
3. Run quality checks
4. Commit changes

---

## Troubleshooting Questions

### Q: Build fails with TypeScript errors

**A:**

```bash
# Clear cache
rm -rf .next
rm -rf node_modules/.cache

# Reinstall
rm -rf node_modules
pnpm install

# Try build again
pnpm build
```

### Q: Tests are timing out

**A:**

1. Check for infinite loops
2. Increase timeout in test config
3. Check for external dependencies
4. Run with `--reporter=verbose` for details

### Q: Lint keeps failing after fix

**A:**

1. Clear ESLint cache: `rm -rf .eslintcache`
2. Check for conflicting rules
3. Run `pnpm lint --fix` again
4. Check `.eslintrc.cjs` configuration

### Q: Git hooks are blocking commits

**A:**

1. Check hook scripts in `.husky/`
2. Ensure they're executable: `chmod +x .husky/*`
3. Run quality checks before committing
4. Contact team if issue persists

---

## Performance Questions

### Q: How do I improve build performance?

**A:**

1. Use incremental builds
2. Enable caching
3. Reduce bundle size
4. Use dynamic imports for heavy components

### Q: How do I optimize test performance?

**A:**

1. Run only affected tests
2. Use parallel test execution
3. Mock external dependencies
4. Optimize test setup/teardown

### Q: How do I reduce memory usage?

**A:**

1. Use streaming for large data
2. Implement pagination
3. Clear caches when not needed
4. Profile memory usage

---

## Security Questions

### Q: How do I handle sensitive data?

**A:**

1. Never commit secrets to git
2. Use environment variables
3. Check `.env.example` for required vars
4. Use secure coding practices

### Q: How do I report a security vulnerability?

**A:**

1. Do not publicize the vulnerability
2. Contact technical lead directly
3. Provide detailed reproduction steps
4. Allow time for fix before disclosure

### Q: How do I check for security issues?

**A:**

```bash
# Check for vulnerable dependencies
pnpm audit

# Fix vulnerabilities
pnpm audit fix

# Review code for security issues
Use deep-review agent for security analysis
```

---

## Getting Help

### Q: Where can I find more documentation?

**A:**

- `AGENTS.md` - Agent governance and guidelines
- `docs/technical/` - Technical documentation
- `docs/training/` - Training materials
- `README.md` - Project overview

### Q: How do I contact the team?

**A:**

- Technical lead: For architecture decisions
- Development team: For implementation questions
- Documentation: For usage questions

### Q: How do I report a bug?

**A:**

1. Check if issue already exists
2. Create detailed reproduction steps
3. Include error messages and logs
4. Submit through appropriate channel

### Q: How do I request a feature?

**A:**

1. Describe the use case
2. Explain the benefit
3. Provide examples if possible
4. Submit through appropriate channel

---

## Quick Reference

### Essential Commands

```bash
pnpm install       # Install dependencies
pnpm dev           # Start development server
pnpm build         # Build for production
pnpm test          # Run tests
pnpm lint          # Check code style
pnpm typecheck     # Check types
```

### Git Commands

```bash
git status         # Check status
git add .          # Stage all changes
git commit -m ""   # Commit changes
git push           # Push to remote
git pull           # Pull from remote
```

### Agent Commands

```bash
# Quality checks
./scripts/workspace-status.sh

# Health checks
./scripts/live-healthcheck.sh
```
