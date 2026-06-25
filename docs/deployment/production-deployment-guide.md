# Production Deployment Guide

## Prerequisites

### System Requirements

- Node.js 20+
- pnpm 9.15.0+
- PostgreSQL 14+
- 2GB RAM minimum
- 20GB disk space minimum

### Environment Setup

```bash
# Install dependencies
pnpm install

# Generate OG images
pnpm generate:og

# Build application
NODE_OPTIONS="--max-old-space-size=4096" pnpm build

# Copy static assets to standalone (CRITICAL for Next.js standalone mode)
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public/

# Start production server
pnpm start
```

## Environment Configuration

### 1. Copy Environment Template

```bash
cp .env.production.example .env.production
```

### 2. Configure Required Variables

Edit `.env.production` and configure:

- `NEXT_PUBLIC_SITE_URL`: Your production domain
- `DATABASE_URL`: PostgreSQL connection string
- `COMMERCIAL_LICENSE_KEY`: Your commercial license key

### 3. Database Setup

#### PostgreSQL (Production)

```bash
# Create database
createdb persiantoolbox

# Run migrations
# (Migration scripts will be added in future versions)
```

## Deployment Options

### Option 1: VPS Deployment (Recommended)

```bash
# Clone repository
git clone https://github.com/alirezasafaei-dev/persiantoolbox.git
cd persiantoolbox

# Install dependencies
pnpm install

# Configure environment
cp .env.production.example .env.production
nano .env.production

# Build application
NODE_OPTIONS="--max-old-space-size=4096" pnpm build

# Copy static assets to standalone
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public/

# Start with PM2
pnpm install -g pm2
pm2 start ecosystem.config.js

# Setup systemd service
# (See ops/systemd directory for templates)
```

### Option 2: Platform as a Service

Deploy to Vercel, Railway, Render, or similar platforms:

- Connect your GitHub repository
- Configure build command: `pnpm build`
- Configure start command: `pnpm start`
- Add environment variables

## Post-Deployment Verification

### 1. Health Check

```bash
curl https://your-domain.com/api/health
# Expected: {"ok":true,"status":"healthy"}
```

### 2. Version Check

```bash
curl https://your-domain.com/api/version
# Expected: {"version":"6.7.0","commit":"<commit-sha>"}
```

### 3. Admin Dashboard

- Access `/admin/site-settings` to verify admin features
- Access `/admin/monetization` to verify monetization features
- Requires authentication

## Monitoring

### Logs

```bash
# PM2 logs
pm2 logs persian-toolbox

# System logs
journalctl -u persian-tools-production
```

### Health Monitoring

Set up monitoring for:

- `/api/health` endpoint
- Memory usage
- CPU usage
- Response times

## Security Checklist

- [ ] Commercial license key configured
- [ ] Database credentials secured
- [ ] HTTPS enabled
- [ ] CSP headers active
- [ ] Rate limiting enabled
- [ ] Admin authentication working
- [ ] Regular backups configured
- [ ] Security scan passing

## Backup Strategy

### Database Backup

```bash
# PostgreSQL
pg_dump persiantoolbox > backup-$(date +%Y%m%d).sql
```

### Configuration Backup

```bash
# Backup environment configuration
cp .env.production backup/.env.production.$(date +%Y%m%d)

# Backup site settings
cp .data/site-settings.json backup/site-settings.$(date +%Y%m%d).json
```

## Troubleshooting

### Database Connection Issues

- Check DATABASE_URL is correct
- Verify database is running
- Check network/firewall rules

### Build Failures

- Ensure all dependencies installed
- Check Node.js version compatibility
- Verify system has enough memory

### Runtime Errors

- Check logs for error messages
- Verify environment variables
- Test database connection

## Support

### Commercial License Support

- Email: license@persiantoolbox.ir
- Response time: 24-48h (tier dependent)

### Deployment Issues

- Email: support@persiantoolbox.ir
- Include: deployment logs, error messages, environment config

## Next Steps

1. Complete deployment checklist above
2. Run test suite: `pnpm test:ci`
3. Monitor first 24 hours closely
4. Set up automated backups
5. Configure monitoring alerts
