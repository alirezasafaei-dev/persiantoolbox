# Agent Permissions and Constraints

**Last Updated**: 2026-06-15
**Status**: ✅ Active
**Version**: v1.0

---

## 🔒 Agent Permissions

### File System Permissions

#### Read Access

- ✅ **Allowed Directories**: `app/`, `lib/`, `components/`, `tests/`, `docs/`, `scripts/`, `public/`
- ✅ **Configuration Files**: `package.json`, `tsconfig.json`, `vitest.config.ts`, `next.config.*`
- ✅ **Documentation Files**: `*.md`, `*.txt`, `LICENSE`
- ❌ **Restricted Directories**: `.git/`, `node_modules/`, `.next/`, `dist/`, `.turbo`, `.env*`

#### Write Access

- ✅ **Source Code**: `app/`, `lib/`, `components/`
- ✅ **Tests**: `tests/`, `__tests__/`
- ✅ **Documentation**: `docs/`
- ✅ **Configuration**: `*.config.*`, `package.json`
- ❌ **Restricted**: `.git/`, `node_modules/`, `.env*`, build artifacts

#### Execute Access

- ✅ **Build Scripts**: `pnpm build`, `pnpm dev`
- ✅ **Test Scripts**: `pnpm test`, `pnpm test:e2e`
- ✅ **Quality Scripts**: `pnpm lint`, `pnpm typecheck`
- ❌ **System Commands**: No direct shell access to system commands
- ❌ **Network Operations**: No external network calls (except MCP servers)

### Tool Permissions

#### Devin CLI Tools

- ✅ **File Operations**: `read`, `write`, `edit`, `find_file_by_name`
- ✅ **Search**: `grep`, `web_search`, `webfetch`
- ✅ **Execution**: `exec` for project scripts only
- ✅ **Git Operations**: `git` commands within repository
- ❌ **System Access**: No system-level operations
- ❌ **Network**: No direct network access (use MCP)

#### MCP Server Permissions

- ✅ **Neon**: Database operations (read/write)
- ✅ **Playwright**: Browser automation and testing
- ✅ **GitHub**: GitHub API operations (read/write)
- ❌ **External APIs**: No other MCP servers without approval

### API Permissions

#### Project APIs

- ✅ **Internal APIs**: Can call internal Next.js API routes
- ✅ **Database**: Can use database through MCP Neon server
- ❌ **External APIs**: No external API calls without explicit approval

#### Environment Variables

- ✅ **Public Variables**: `NEXT_PUBLIC_*` variables
- ❌ **Secret Variables**: No access to `DATABASE_URL`, `API_SECRET`, etc.
- ❌ **Private Variables**: No access to sensitive environment variables

---

## 🚫 Agent Constraints

### Code Quality Constraints

#### TypeScript

- **No `any` Types**: Strict typing required for all new code
- **No Type Assertions**: Avoid `as` unless absolutely necessary
- **No Loose Types**: Use specific types instead of generic types
- **Type Coverage**: All new code must be fully typed

#### Code Style

- **No Trailing Whitespace**: Files must be properly formatted
- **No Console Logs**: Remove debug statements before commit
- **No Dead Code**: Remove unused imports and functions
- **No Magic Numbers**: Use named constants

#### Architecture

- **No Global State**: Avoid global variables
- **No Tight Coupling**: Maintain loose coupling between components
- **No Circular Dependencies**: Avoid circular imports
- **No God Functions**: Break down large functions

### Security Constraints

#### Data Privacy

- **No Data Exfiltration**: Never send user data externally
- **No Logging Sensitive Data**: Don't log passwords, tokens, or personal info
- **No Secret Exposure**: Never commit secrets or keys
- **No Unencrypted Storage**: Use encryption for sensitive data

#### Code Security

- **No eval()**: Never use eval or similar dangerous functions
- **No innerHTML**: Never use innerHTML (use DOM methods)
- **No User Input in Code**: Never concatenate user input directly into code
- **No SQL Injection**: Use parameterized queries

### Performance Constraints

#### Bundle Size

- **No Large Dependencies**: Avoid adding large libraries
- **No Unused Code**: Remove unused dependencies
- **No Bundle Bloat**: Monitor bundle size impact
- **No Lazy Loading Issues**: Ensure proper code splitting

#### Runtime Performance

- **No Expensive Operations**: Avoid blocking operations
- **No Memory Leaks**: Clean up resources properly
- **No Inefficient Algorithms**: Use efficient algorithms
- **No Unnecessary Re-renders**: Optimize React components

### Privacy Constraints

#### Client-Side Processing

- **Mandatory**: All tool processing must be client-side
- **No Server Processing**: No server-side computation of user data
- **No Data Transmission**: No user data sent to external servers
- **No Data Storage**: No persistent storage of user data

#### Data Handling

- **No Analytics**: No user analytics without consent
- **No Tracking**: No user tracking mechanisms
- **No Profiling**: No user profiling or behavioral analysis
- **No Data Selling**: No selling or sharing of user data

---

## 🎯 Agent Execution Boundaries

### Scope of Work

- **In Scope**: Code changes within the repository
- **In Scope**: Documentation updates
- **In Scope**: Test creation and modification
- **In Scope**: Build system changes
- **Out of Scope**: System configuration
- **Out of Scope**: External service configuration
- **Out of Scope**: Network operations outside MCP

### Decision Authority

- **Can Decide**: Code implementation details
- **Can Decide**: Test strategies
- **Can Decide**: Documentation structure
- **Cannot Decide**: Breaking changes (requires approval)
- **Cannot Decide**: Security changes (requires approval)
- **Cannot Decide**: Major architecture changes (requires approval)

### Review Requirements

- **No Review Required**: Bug fixes, minor improvements, documentation
- **Review Required**: New features, breaking changes, security changes
- **Review Required**: Performance changes, architecture changes
- **Review Required**: Dependencies changes (major versions)

---

## 📋 Agent Validation Requirements

### Pre-Execution Validation

- [ ] Verify task is within agent scope
- [ ] Check for required approvals
- [ ] Validate permissions for requested operations
- [ ] Confirm no security violations
- [ ] Ensure privacy constraints are met

### During Execution Validation

- [ ] Monitor for permission violations
- [ ] Check for security issues
- [ ] Verify privacy compliance
- [ ] Monitor resource usage
- [ ] Validate code quality standards

### Post-Execution Validation

- [ ] Verify all quality gates pass
- [ ] Confirm no security vulnerabilities introduced
- [ ] Check privacy compliance maintained
- [ ] Validate performance impact acceptable
- [ ] Ensure documentation updated

---

## 🚨 Emergency Constraints

### Immediate Stop Conditions

- **Security Violation**: Stop immediately if security issue detected
- **Privacy Violation**: Stop immediately if privacy issue detected
- **Permission Error**: Stop if permission denied
- **Quality Gate Failure**: Stop if quality gates fail
- **System Error**: Stop if system error occurs

### Emergency Procedures

1. **Stop Execution**: Immediately halt all operations
2. **Report Issue**: Clearly report the violation
3. **Rollback**: Roll back any changes made
4. **Document**: Document the issue for review
5. **Await Instructions**: Wait for human intervention

---

## 📊 Monitoring Requirements

### Agent Execution Logging

- **Log All Operations**: Log all file operations
- **Log Quality Gates**: Log quality gate results
- **Log Errors**: Log all errors with context
- **Log Performance**: Log execution time and resource usage
- **Log Decisions**: Log agent decision points

### Error Monitoring

- **Track Errors**: Monitor error rates and patterns
- **Alert on Failures**: Alert on repeated failures
- **Analyze Root Causes**: Analyze error patterns
- **Improve Skills**: Update skills based on error analysis
- **Report Metrics**: Report error metrics regularly

### Performance Monitoring

- **Track Execution Time**: Monitor agent execution duration
- **Track Resource Usage**: Monitor memory and CPU usage
- **Track Success Rate**: Monitor agent success/failure rates
- **Optimize Performance**: Optimize based on performance data
- **Report Metrics**: Report performance metrics regularly

---

_This permissions and constraints document ensures safe and effective agent operations while maintaining security, privacy, and quality standards._
