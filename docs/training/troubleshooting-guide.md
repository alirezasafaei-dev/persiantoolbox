# Troubleshooting Guide - PersianToolbox CLI Agent

**Last Updated**: 2026-06-15
**Version**: 1.0
**Status**: Complete

---

## Common Issues and Solutions

### 1. Build Failures

#### Symptoms
- `pnpm build` fails
- TypeScript compilation errors
- Missing dependencies

#### Solutions

```bash
# Clear all caches
rm -rf .next
rm -rf .turbo
rm -rf node_modules/.cache

# Reinstall dependencies
rm -rf node_modules
pnpm install

# Clear pnpm store
pnpm store prune

# Try build again
pnpm build
```

### 2. Lint Errors

#### Symptoms
- `pnpm lint` fails
- ESLint errors in code
- Prettier formatting issues

#### Solutions

```bash
# Auto-fix lint errors
pnpm lint --fix

# Check specific file
pnpm lint src/path/to/file.ts

# Clear ESLint cache
rm -rf .eslintcache

# Run lint again
pnpm lint
```

### 3. Type Errors

#### Symptoms
- `pnpm typecheck` fails
- TypeScript compilation errors
- Type mismatch errors

#### Solutions

```bash
# Run typecheck
pnpm typecheck

# Check specific file
npx tsc --noEmit src/path/to/file.ts

# Clear TypeScript cache
rm -rf node_modules/.cache
rm -rf .next/cache

# Reinstall dependencies
rm -rf node_modules
pnpm install
```

### 4. Test Failures

#### Symptoms
- `pnpm test` fails
- Individual test failures
- Test timeout errors

#### Solutions

```bash
# Run specific test
pnpm vitest run path/to/test.test.ts

# Run with verbose output
pnpm vitest run --reporter=verbose

# Run with coverage
pnpm vitest run --coverage

# Clear test cache
rm -rf node_modules/.cache
rm -rf .vitest
```

### 5. Git Issues

#### Symptoms
- Commit rejected by hooks
- Merge conflicts
- Branch issues

#### Solutions

```bash
# Check git status
git status

# Stash changes
git stash

# Pull latest changes
git pull origin main

# Resolve conflicts manually
# Then continue

# Pop stash
git stash pop
```

### 6. Performance Issues

#### Symptoms
- Slow build times
- High memory usage
- Slow test execution

#### Solutions

```bash
# Clear all caches
rm -rf .next
rm -rf .turbo
rm -rf node_modules/.cache

# Check memory usage
node --max-old-space-size=4096

# Run build with limited parallelism
pnpm build --concurrency=1

# Monitor performance
./scripts/workspace-status.sh
```

### 7. Agent Issues

#### Symptoms
- Agent commands fail
- Agent skills not found
- Agent execution errors

#### Solutions

```bash
# Check agent configuration
cat AGENTS.md

# Verify skills directory
ls -la .agents/skills/

# Check agent logs
cat logs/agent.log

# Restart agent session
# Close and reopen terminal
```

### 8. Environment Issues

#### Symptoms
- Missing environment variables
- Configuration errors
- Permission issues

#### Solutions

```bash
# Check environment
env | grep -i persian

# Verify .env file
cat .env.example

# Copy example env
cp .env.example .env

# Edit .env with correct values
nano .env

# Verify permissions
chmod 600 .env
```

### 9. Network Issues

#### Symptoms
- API calls fail
- Package installation fails
- Git push fails

#### Solutions

```bash
# Check network connection
ping google.com

# Verify npm registry
npm config get registry

# Check git remote
git remote -v

# Test git connection
ssh -T git@github.com
```

### 10. Database Issues

#### Symptoms
- Database connection fails
- Query errors
- Migration failures

#### Solutions

```bash
# Check database connection
# Verify DATABASE_URL in .env

# Run migrations
# Check migration files in prisma/migrations

# Reset database (careful!)
# npx prisma migrate reset
```

---

## Diagnostic Commands

### System Status

```bash
# Check workspace status
./scripts/workspace-status.sh

# Check live site health
./scripts/live-healthcheck.sh

# Check server status
./scripts/server-status.sh
```

### Project Health

```bash
# Run all quality checks
pnpm lint && pnpm typecheck && pnpm test

# Check build status
pnpm build

# Check for security vulnerabilities
pnpm audit
```

### Git Status

```bash
# Check git status
git status

# Check git log
git log --oneline -10

# Check git branches
git branch -a

# Check git remote
git remote -v
```

---

## Error Messages Reference

### Lint Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `no-unused-vars` | Unused variable | Remove or use variable |
| `no-undef` | Undefined variable | Import or declare variable |
| `indent` | Indentation error | Run `pnpm lint --fix` |
| `quotes` | Quote style | Run `pnpm lint --fix` |
| `semi` | Missing semicolon | Run `pnpm lint --fix` |

### Type Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `TS2304` | Cannot find name | Import or declare |
| `TS2339` | Property does not exist | Check type definition |
| `TS2345` | Argument type mismatch | Fix type annotation |
| `TS2322` | Type not assignable | Fix type assignment |

### Test Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `AssertionError` | Test failed | Fix implementation |
| `TimeoutError` | Test timeout | Increase timeout |
| `ReferenceError` | Undefined reference | Import or declare |

---

## Getting Help

### Documentation

1. **Agent Governance**: `AGENTS.md`
2. **Technical Docs**: `docs/technical/`
3. **Training**: `docs/training/`
4. **README**: `README.md`

### Support Channels

1. **Technical Lead**: For architecture decisions
2. **Development Team**: For implementation questions
3. **Documentation**: For usage questions

### Escalation Process

1. **Level 1**: Check documentation
2. **Level 2**: Run diagnostics
3. **Level 3**: Contact team
4. **Level 4**: Escalate to lead

---

## Prevention Tips

### Regular Maintenance

1. **Weekly**
   - Run `pnpm lint && pnpm typecheck && pnpm test`
   - Update dependencies
   - Review error logs

2. **Monthly**
   - Security audit
   - Performance review
   - Documentation update

3. **Quarterly**
   - Major dependency updates
   - Architecture review
   - Training refresh

### Best Practices

1. **Always run quality checks before commit**
2. **Keep dependencies updated**
3. **Follow coding standards**
4. **Document changes**
5. **Test thoroughly**
