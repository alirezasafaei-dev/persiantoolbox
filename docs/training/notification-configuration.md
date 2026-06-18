# Agent Notification Configuration - PersianToolbox

**Last Updated**: 2026-06-15
**Version**: 1.0
**Status**: Complete

---

## Notification Types

### 1. Code Quality Notifications

| Event | Severity | Channel | Recipients |
|-------|----------|---------|------------|
| Lint failure | High | Email + Slack | Developer |
| Typecheck failure | High | Email + Slack | Developer |
| Test failure | High | Email + Slack | Developer |
| Build failure | Critical | Email + Slack + Phone | Team Lead |
| Security vulnerability | Critical | Email + Slack + Phone | Security Team |

### 2. Performance Notifications

| Event | Severity | Channel | Recipients |
|-------|----------|---------|------------|
| Response time high | Medium | Slack | Developer |
| Error rate high | High | Email + Slack | Team Lead |
| Memory usage high | Medium | Slack | DevOps |
| Cache hit rate low | Low | Slack | Developer |

### 3. Agent Notifications

| Event | Severity | Channel | Recipients |
|-------|----------|---------|------------|
| Agent execution failure | High | Email + Slack | Developer |
| Skill update available | Low | Slack | Team |
| Configuration change | Medium | Email | Team Lead |
| Handoff request | High | Email + Slack | Team Lead |

---

## Notification Configuration

### Email Configuration

```typescript
const emailConfig = {
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },
  from: 'agent@persiantoolbox.ir',
  templates: {
    codeQuality: 'code-quality-notification',
    performance: 'performance-notification',
    agent: 'agent-notification',
  },
};
```

### Slack Configuration

```typescript
const slackConfig = {
  webhookUrl: process.env.SLACK_WEBHOOK_URL,
  channels: {
    codeQuality: '#code-quality',
    performance: '#performance',
    agent: '#agent-notifications',
    urgent: '#urgent',
  },
};
```

### Phone Configuration

```typescript
const phoneConfig = {
  enabled: process.env.PHONE_NOTIFICATIONS === 'true',
  provider: 'twilio',
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  from: process.env.TWILIO_FROM_NUMBER,
  recipients: {
    critical: process.env.CRITICAL_RECIPIENT_PHONE,
  },
};
```

---

## Notification Rules

### Code Quality Rules

```typescript
const codeQualityRules = [
  {
    condition: (event) => event.type === 'lint' && event.severity === 'error',
    actions: ['email', 'slack'],
    recipients: ['developer'],
    message: 'Lint errors detected in your code',
  },
  {
    condition: (event) => event.type === 'test' && event.failures > 5,
    actions: ['email', 'slack'],
    recipients: ['developer', 'team-lead'],
    message: 'Multiple test failures detected',
  },
  {
    condition: (event) => event.type === 'security' && event.severity === 'critical',
    actions: ['email', 'slack', 'phone'],
    recipients: ['security-team', 'team-lead'],
    message: 'Critical security vulnerability detected',
  },
];
```

### Performance Rules

```typescript
const performanceRules = [
  {
    condition: (event) => event.metric === 'responseTime' && event.value > 5000,
    actions: ['slack'],
    recipients: ['developer'],
    message: 'Response time exceeding threshold',
  },
  {
    condition: (event) => event.metric === 'errorRate' && event.value > 0.05,
    actions: ['email', 'slack'],
    recipients: ['team-lead'],
    message: 'Error rate exceeding threshold',
  },
];
```

### Agent Rules

```typescript
const agentRules = [
  {
    condition: (event) => event.type === 'execution-failure',
    actions: ['email', 'slack'],
    recipients: ['developer'],
    message: 'Agent execution failed',
  },
  {
    condition: (event) => event.type === 'handoff-request',
    actions: ['email', 'slack'],
    recipients: ['team-lead'],
    message: 'Handoff request received',
  },
];
```

---

## Notification Templates

### Email Templates

#### Code Quality Alert

```html
Subject: Code Quality Alert - {{projectName}}

Hi {{recipientName}},

We detected a code quality issue in your recent commit:

Type: {{issueType}}
Severity: {{severity}}
File: {{filePath}}
Line: {{lineNumber}}
Message: {{message}}

Please review and fix this issue.

Best regards,
PersianToolbox Agent System
```

#### Performance Alert

```html
Subject: Performance Alert - {{projectName}}

Hi {{recipientName}},

We detected a performance issue:

Metric: {{metric}}
Current Value: {{currentValue}}
Threshold: {{threshold}}
Impact: {{impact}}

Please investigate and optimize.

Best regards,
PersianToolbox Agent System
```

### Slack Templates

#### Code Quality Alert

```
:warning: *Code Quality Alert*

*Project*: {{projectName}}
*Type*: {{issueType}}
*Severity*: {{severity}}
*File*: {{filePath}}
*Message*: {{message}}

Please review and fix this issue.
```

#### Performance Alert

```
:chart_with_upwards_trend: *Performance Alert*

*Project*: {{projectName}}
*Metric*: {{metric}}
*Current*: {{currentValue}}
*Threshold*: {{threshold}}

Please investigate.
```

---

## Notification Schedule

### Real-time Notifications

- Code quality failures
- Security vulnerabilities
- Build failures
- Critical performance issues

### Daily Digest

- Performance metrics summary
- Agent execution summary
- Quality gate results
- Upcoming maintenance

### Weekly Report

- Detailed performance analysis
- Agent usage statistics
- Improvement recommendations
- Team productivity metrics

---

## Notification Management

### Subscribe to Notifications

```typescript
// Subscribe to code quality notifications
notificationManager.subscribe({
  userId: 'user-123',
  events: ['lint-failure', 'test-failure'],
  channels: ['email', 'slack'],
});
```

### Unsubscribe from Notifications

```typescript
// Unsubscribe from performance notifications
notificationManager.unsubscribe({
  userId: 'user-123',
  events: ['performance-alert'],
});
```

### Update Notification Preferences

```typescript
// Update notification preferences
notificationManager.updatePreferences({
  userId: 'user-123',
  preferences: {
    emailEnabled: true,
    slackEnabled: true,
    phoneEnabled: false,
    quietHours: {
      start: '22:00',
      end: '08:00',
    },
  },
});
```

---

## Escalation Procedures

### Level 1: Developer

- **Trigger**: Code quality issues, minor performance issues
- **Response Time**: 24 hours
- **Actions**: Fix issues, update code, notify team

### Level 2: Team Lead

- **Trigger**: Multiple failures, high severity issues
- **Response Time**: 4 hours
- **Actions**: Investigate, coordinate response, escalate if needed

### Level 3: Technical Lead

- **Trigger**: Critical issues, security vulnerabilities
- **Response Time**: 1 hour
- **Actions**: Emergency response, coordinate teams, external support

### Level 4: Management

- **Trigger**: Business-critical issues, major outages
- **Response Time**: 30 minutes
- **Actions**: Crisis management, stakeholder communication

---

## Monitoring and Reporting

### Notification Metrics

```typescript
const metrics = {
  totalNotifications: 0,
  byType: {
    email: 0,
    slack: 0,
    phone: 0,
  },
  bySeverity: {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  },
  responseTime: {
    average: 0,
    p95: 0,
    p99: 0,
  },
};
```

### Reporting Dashboard

- Real-time notification status
- Historical notification trends
- Response time analytics
- Escalation statistics

---

## Security Considerations

### Data Protection

- Encrypt notification content
- Secure transmission channels
- Access control for sensitive data
- Audit logging

### Access Control

- Role-based notification access
- Permission management
- Audit trails
- Compliance logging

---

## Appendix

### Notification Channels

| Channel | Use Case | Response Time |
|---------|----------|---------------|
| Email | Non-urgent notifications | 24 hours |
| Slack | Quick notifications | 4 hours |
| Phone | Critical notifications | 1 hour |

### Notification Templates

- `templates/email/code-quality.html`
- `templates/email/performance.html`
- `templates/slack/code-quality.md`
- `templates/slack/performance.md`

### Configuration Files

- `config/notifications.json`
- `config/escalation.json`
- `config/templates.json`
