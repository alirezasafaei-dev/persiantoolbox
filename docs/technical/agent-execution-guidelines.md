# Agent Execution Guidelines

**Last Updated**: 2026-06-15
**Status**: ✅ Active
**Version**: v1.0

---

## 🎯 Agent Execution Principles

### Core Principles

1. **Quality First**: Never compromise on code quality
2. **Privacy First**: Always maintain user privacy
3. **Security First**: Never introduce security vulnerabilities
4. **Performance First**: Never degrade performance
5. **User Experience First**: Never degrade user experience

### Execution Philosophy

- **Minimal Changes**: Make the smallest change needed
- **Test Driven**: Write tests before or with code
- **Documentation Included**: Always document changes
- **Quality Gates**: Always pass quality gates
- **Pattern Consistent**: Follow existing patterns

---

## 📋 Agent Execution Workflow

### Phase 1: Task Analysis

1. **Understand Request**: Clearly understand what needs to be done
2. **Analyze Scope**: Determine the scope of work required
3. **Identify Risks**: Identify potential risks and constraints
4. **Plan Approach**: Plan the implementation approach
5. **Estimate Effort**: Estimate the effort required

### Phase 2: Exploration

1. **Explore Codebase**: Use `subagent_explore` for code research
2. **Understand Patterns**: Understand existing patterns
3. **Identify Dependencies**: Identify relevant dependencies
4. **Review Similar Code**: Review similar implementations
5. **Document Findings**: Document exploration findings

### Phase 3: Implementation

1. **Use Appropriate Profile**: Use `subagent_general` for implementation
2. **Follow Patterns**: Follow existing code patterns
3. **Write Tests**: Write comprehensive tests
4. **Implement Changes**: Implement the required changes
5. **Review Changes**: Review changes for quality

### Phase 4: Validation

1. **Run Quality Gates**: Run all quality gates
2. **Fix Issues**: Fix any issues that arise
3. **Manual Testing**: Perform manual testing if needed
4. **Performance Check**: Check for performance impact
5. **Security Check**: Verify security compliance

### Phase 5: Documentation

1. **Update Code Docs**: Update inline documentation
2. **Update Registry**: Update tool registry if applicable
3. **Update User Docs**: Update user documentation
4. **Update Technical Docs**: Update technical documentation
5. **Commit Changes**: Commit with clear message

---

## 🔧 Common Agent Execution Patterns

### Pattern 1: Bug Fix

```yaml
Profile: fast-fix
Steps: 1. Analyze bug report
  2. Reproduce bug
  3. Identify root cause
  4. Write regression test
  5. Implement fix
  6. Run quality gates
  7. Document fix
```

### Pattern 2: New Feature

```yaml
Profile: subagent_general
Steps: 1. Use tool-scaffolding skill
  2. Implement feature
  3. Write comprehensive tests
  4. Update tool registry
  5. Run quality gates
  6. Update documentation
  7. Manual testing
```

### Pattern 3: Code Refactoring

```yaml
Profile: subagent_general
Steps: 1. Analyze current code
  2. Plan refactoring
  3. Make changes incrementally
  4. Write tests for changes
  5. Run quality gates
  6. Performance testing
  7. Update documentation
```

### Pattern 4: Security Fix

```yaml
Profile: deep-review
Steps: 1. Analyze security issue
  2. Understand impact
  3. Design secure fix
  4. Implement fix with tests
  5. Security review
  6. Run quality gates
  7. Document security changes
```

### Pattern 5: Documentation Update

```yaml
Profile: fast-fix
Steps: 1. Use documentation-update skill
  2. Update relevant docs
  3. Verify accuracy
  4. Check for consistency
  5. Run quality gates
  6. Commit changes
```

---

## 🚨 Error Handling Guidelines

### When Quality Gates Fail

1. **Stop Execution**: Halt the current task
2. **Analyze Failure**: Understand why the gate failed
3. **Fix the Issue**: Fix the issue causing failure
4. **Re-run Gates**: Re-run quality gates
5. **Document**: Document the fix

### When Permission Errors Occur

1. **Stop Execution**: Halt the current operation
2. **Check Permissions**: Verify required permissions
3. **Request Approval**: Request approval if needed
4. **Document**: Document the permission issue
5. **Wait**: Wait for human intervention

### When Pattern Mismatch Occurs

1. **Stop Execution**: Halt the current task
2. **Analyze Pattern**: Understand the pattern mismatch
3. **Adapt Approach**: Adapt to existing patterns
4. **Consult**: Consult with existing code
5. **Document**: Document pattern decision

### When Performance Degradation Occurs

1. **Stop Execution**: Halt the current task
2. **Analyze Impact**: Understand performance impact
3. **Optimize**: Optimize the implementation
4. **Re-test**: Re-test performance
5. **Document**: Document performance decisions

---

## 📊 Decision Making Guidelines

### When to Use Specific Profiles

#### Use `fast-fix` When:

- Fixing typos or grammar errors
- Updating documentation
- Minor UI adjustments
- Simple configuration changes
- Non-critical bug fixes

#### Use `subagent_general` When:

- Implementing new features
- Making code changes
- Updating components
- Modifying build system
- Creating new files

#### Use `subagent_explore` When:

- Understanding code structure
- Researching implementations
- Analyzing dependencies
- Understanding architecture
- Finding code patterns

#### Use `deep-review` When:

- Security-sensitive changes
- Performance-critical changes
- Major refactoring
- Library package changes
- Breaking changes

### When to Ask for Approval

#### Requires Approval When:

- Breaking changes to public APIs
- Major version updates for dependencies
- Security-related changes
- Performance changes >5%
- Architecture changes
- Privacy changes

#### Does Not Require Approval When:

- Bug fixes
- Minor improvements
- Documentation updates
- Test additions
- Non-breaking enhancements

---

## 🔄 Iterative Improvement Guidelines

### Learning from Failures

1. **Document Failures**: Document agent failures
2. **Analyze Patterns**: Analyze failure patterns
3. **Update Skills**: Update skills based on learnings
4. **Improve Guidelines**: Improve execution guidelines
5. **Share Knowledge**: Share learnings with team

### Continuous Optimization

1. **Monitor Performance**: Monitor agent performance
2. **Identify Bottlenecks**: Identify performance bottlenecks
3. **Optimize Skills**: Optimize skill implementations
4. **Update Guidelines**: Update guidelines for efficiency
5. **Measure Impact**: Measure optimization impact

---

## 📝 Documentation Requirements

### Execution Documentation

- Document the task performed
- Document the approach taken
- Document decisions made
- Document challenges faced
- Document solutions implemented

### Code Documentation

- Add comments to complex code
- Update type definitions
- Add JSDoc comments
- Update examples
- Update error messages

### User Documentation

- Update README if needed
- Update user guides
- Update FAQ
- Update examples
- Update screenshots

---

## ✅ Success Criteria

### Task Success Criteria

- [ ] Task completed as requested
- [ ] Code follows project patterns
- [ ] Quality gates pass
- [ ] Tests are comprehensive
- [ ] Documentation is updated
- [ ] No regressions introduced

### Quality Success Criteria

- [ ] Lint passes with zero errors
- [ ] Typecheck passes with zero errors
- [ ] Tests pass with zero failures
- [ ] Build succeeds with zero warnings
- [ ] Performance meets standards
- [ ] Security scan passes

### Process Success Criteria

- [ ] Execution was efficient
- [ ] Documentation is clear
- [ ] Learnings are captured
- [ ] Patterns are followed
- [ ] Guidelines are respected

---

## 🎓 Best Practices

### Before Starting

- Understand the task completely
- Explore the codebase thoroughly
- Plan the approach carefully
- Identify risks early
- Set clear success criteria

### During Execution

- Follow existing patterns
- Write tests as you go
- Document decisions
- Monitor for issues
- Be ready to adapt

### After Completion

- Verify quality gates pass
- Test thoroughly
- Update documentation
- Commit with clear message
- Capture learnings

---

_These execution guidelines ensure consistent, high-quality agent operations while maintaining the high standards of the PersianToolbox project._
