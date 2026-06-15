# Training Exercises - PersianToolbox CLI Agent

**Last Updated**: 2026-06-15
**Version**: 1.0
**Status**: Complete

---

## Exercise 1: Basic Agent Usage

### Objective
Learn to use different agent profiles for appropriate tasks.

### Tasks

1. **Use subagent_explore to analyze the tool registry**
   ```bash
   # Ask the agent to analyze tools-registry.ts
   Use subagent_explore to understand the structure of the tool registry
   ```

2. **Use subagent_general to create a simple utility**
   ```bash
   # Ask the agent to create a helper function
   Use subagent_general to create a utility function that formats dates
   ```

3. **Use fast-fix to correct a typo**
   ```bash
   # Find and fix a typo in documentation
   Use fast-fix to correct the misspelling in README.md
   ```

### Expected Outcome
- Understanding of when to use each agent profile
- Ability to select appropriate agent for task

---

## Exercise 2: Tool Development

### Objective
Learn to create a new tool following project patterns.

### Tasks

1. **Research existing tools**
   ```bash
   # Use explore agent to understand patterns
   Use subagent_explore to analyze 3 existing tool implementations
   ```

2. **Plan the new tool**
   - Define tool purpose
   - Identify required components
   - Plan test coverage

3. **Implement the tool**
   ```bash
   # Use general agent to implement
   Use subagent_general to create a new text transformation tool
   ```

4. **Write tests**
   ```bash
   # Generate tests
   import { testGeneration } from '@/lib/test-generation';
   const tests = await testGeneration.generateTests({...});
   ```

5. **Validate quality**
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   ```

### Expected Outcome
- Complete tool implementation
- Comprehensive test coverage
- All quality gates passing

---

## Exercise 3: Bug Fixing

### Objective
Learn to use bug triage and regression testing.

### Tasks

1. **Analyze a bug report**
   ```bash
   import { bugTriageAutomation } from '@/lib/bug-triage-automation';
   const analysis = await bugTriageAutomation.analyzeBug({
     title: "Button not responding to clicks",
     description: "Click events are not being handled",
     steps: ["Navigate to homepage", "Click button", "Nothing happens"]
   });
   ```

2. **Implement the fix**
   ```bash
   # Use fast-fix for simple bugs
   Use fast-fix to fix the click handler
   ```

3. **Write regression test**
   ```bash
   import { regressionTesting } from '@/lib/regression-testing';
   const test = await regressionTesting.generateRegressionTestForFix(
     'BUG-001',
     'Fixed click handler binding',
     ['src/components/Button.tsx']
   );
   ```

4. **Verify the fix**
   ```bash
   pnpm test
   ```

### Expected Outcome
- Bug triage analysis
- Implemented fix
- Regression test coverage

---

## Exercise 4: Code Review

### Objective
Learn to use automated code review tools.

### Tasks

1. **Run automated review**
   ```bash
   import { codeReviewAutomation } from '@/lib/code-review-automation';
   const result = await codeReviewAutomation.reviewCode({
     targetFiles: ['src/components/Button.tsx'],
     reviewType: 'full',
     includeTests: true
   });
   ```

2. **Review the report**
   - Analyze issues found
   - Review suggestions
   - Prioritize fixes

3. **Fix identified issues**
   ```bash
   # Use appropriate agent to fix issues
   Use subagent_general to fix the identified issues
   ```

4. **Re-run review**
   ```bash
   # Verify fixes
   const result = await codeReviewAutomation.reviewCode({...});
   ```

### Expected Outcome
- Understanding of code review process
- Ability to use automated review tools
- Improved code quality

---

## Exercise 5: Performance Optimization

### Objective
Learn to use performance monitoring and optimization tools.

### Tasks

1. **Run benchmarks**
   ```bash
   import { performanceBenchmarks } from '@/lib/performance-benchmarks';
   const result = await performanceBenchmarks.benchmark('data-processing', async () => {
     await processData();
   });
   ```

2. **Analyze results**
   - Review average time
   - Check percentiles
   - Identify bottlenecks

3. **Implement optimizations**
   ```bash
   # Use general agent to optimize
   Use subagent_general to optimize the data processing function
   ```

4. **Re-benchmark**
   ```bash
   # Verify improvements
   const result = await performanceBenchmarks.benchmark('data-processing', async () => {
     await optimizedProcessData();
   });
   ```

### Expected Outcome
- Performance baseline established
- Optimizations implemented
- Measurable improvement

---

## Exercise 6: Security Scanning

### Objective
Learn to use security scanning tools.

### Tasks

1. **Run security scan**
   ```bash
   import { securityScanAutomation } from '@/lib/security-scan-automation';
   const result = await securityScanAutomation.scanSecurity({
     scanType: 'full',
     includeDependencies: true,
     includeCodeAnalysis: true
   });
   ```

2. **Review vulnerabilities**
   - Analyze severity levels
   - Review recommendations
   - Prioritize fixes

3. **Fix vulnerabilities**
   ```bash
   # Use appropriate agent to fix
   Use subagent_general to fix security issues
   ```

4. **Re-scan**
   ```bash
   # Verify fixes
   const result = await securityScanAutomation.scanSecurity({...});
   ```

### Expected Outcome
- Security vulnerabilities identified
- Fixes implemented
- Reduced security risk

---

## Exercise 7: Dependency Management

### Objective
Learn to use dependency update automation.

### Tasks

1. **Check for updates**
   ```bash
   import { dependencyUpdateAutomation } from '@/lib/dependency-update-automation';
   const result = await dependencyUpdateAutomation.checkForUpdates({
     updateType: 'minor',
     includeDevDependencies: true
   });
   ```

2. **Review updates**
   - Check for breaking changes
   - Review security updates
   - Plan update strategy

3. **Apply updates**
   ```bash
   const result = await dependencyUpdateAutomation.updateDependencies({
     updateType: 'minor',
     testAfterUpdate: true
   });
   ```

4. **Verify compatibility**
   ```bash
   pnpm test
   pnpm build
   ```

### Expected Outcome
- Dependencies updated
- No breaking changes
- Tests passing

---

## Exercise 8: Documentation Update

### Objective
Learn to use documentation automation tools.

### Tasks

1. **Analyze documentation**
   ```bash
   import { documentationUpdate } from '@/lib/documentation-update';
   const analysis = await documentationUpdate.analyzeDocumentation();
   ```

2. **Update documentation**
   ```bash
   # Use general agent to update docs
   Use subagent_general to update the tool documentation
   ```

3. **Validate consistency**
   ```bash
   const result = await documentationUpdate.validateConsistency();
   ```

4. **Review changes**
   - Check for accuracy
   - Verify completeness
   - Ensure consistency

### Expected Outcome
- Documentation updated
- Consistency validated
- Changes reviewed

---

## Exercise 9: Refactoring

### Objective
Learn to use refactoring automation tools.

### Tasks

1. **Identify code smells**
   ```bash
   import { refactoringAutomation } from '@/lib/refactoring-automation';
   const smells = await refactoringAutomation.analyzeCodeSmells([
     'src/utils/helpers.ts'
   ]);
   ```

2. **Plan refactoring**
   - Prioritize changes
   - Plan incremental approach
   - Consider test coverage

3. **Implement refactoring**
   ```bash
   const result = await refactoringAutomation.refactorCode({
     targetFiles: ['src/utils/helpers.ts'],
     refactoringType: 'extract',
     dryRun: false
   });
   ```

4. **Verify no regressions**
   ```bash
   pnpm test
   ```

### Expected Outcome
- Code smells identified
- Refactoring implemented
- No regressions

---

## Exercise 10: Complete Workflow

### Objective
Execute a complete development workflow using all tools.

### Tasks

1. **Plan the feature**
   - Define requirements
   - Identify affected files
   - Plan implementation

2. **Implement the feature**
   ```bash
   Use subagent_general to implement the feature
   ```

3. **Write tests**
   ```bash
   import { testGeneration } from '@/lib/test-generation';
   const tests = await testGeneration.generateTests({...});
   ```

4. **Run code review**
   ```bash
   import { codeReviewAutomation } from '@/lib/code-review-automation';
   const result = await codeReviewAutomation.reviewCode({...});
   ```

5. **Fix issues**
   ```bash
   Use subagent_general to fix identified issues
   ```

6. **Update documentation**
   ```bash
   import { documentationUpdate } from '@/lib/documentation-update';
   await documentationUpdate.updateDocumentation({...});
   ```

7. **Validate quality**
   ```bash
   pnpm lint && pnpm typecheck && pnpm test
   ```

8. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: implement new feature"
   git push origin feature/new-feature
   ```

### Expected Outcome
- Complete feature implementation
- Comprehensive test coverage
- All quality gates passing
- Documentation updated
- Code submitted for review

---

## Assessment Criteria

### Technical Skills
- [ ] Can select appropriate agent profile
- [ ] Can use agent skills effectively
- [ ] Can implement features following patterns
- [ ] Can write and run tests
- [ ] Can use quality gates

### Process Skills
- [ ] Follows git workflow
- [ ] Writes clear commit messages
- [ ] Documents changes
- [ ] Reviews code before submitting

### Problem Solving
- [ ] Can analyze bug reports
- [ ] Can identify root causes
- [ ] Can implement effective fixes
- [ ] Can prevent similar issues

---

## Additional Resources

- `docs/training/agent-usage-guide.md` - Detailed usage guide
- `docs/training/troubleshooting-guide.md` - Problem resolution
- `docs/training/best-practices-guide.md` - Coding standards
- `docs/training/faq.md` - Common questions
