# Agent Governance - PersianToolbox

**Last Updated**: 2026-06-15
**Status**: ✅ Active
**Version**: v3.1.0

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

_This governance document ensures consistent, high-quality contributions while maintaining the privacy-first, performance-focused nature of the PersianToolbox platform._
