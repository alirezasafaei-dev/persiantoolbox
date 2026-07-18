#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { google } from 'googleapis';

const READONLY_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const DEFAULT_PROPERTY = 'sc-domain:persiantoolbox.ir';
const jsonMode = process.argv.includes('--json');

const emit = (payload) => {
  if (jsonMode) {
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
    return;
  }

  for (const [key, value] of Object.entries(payload)) {
    process.stdout.write(`${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}\n`);
  }
};

const fail = (message, details = {}) => {
  emit({ ok: false, error: message, ...details });
  process.exit(1);
};

const credentialsPath = process.env['GOOGLE_APPLICATION_CREDENTIALS']?.trim();
if (!credentialsPath) {
  fail('GOOGLE_APPLICATION_CREDENTIALS is not set');
}

const resolvedCredentialsPath = path.resolve(credentialsPath);
if (!fs.existsSync(resolvedCredentialsPath)) {
  fail('Credential file does not exist', { credentialPath: resolvedCredentialsPath });
}

const stat = fs.statSync(resolvedCredentialsPath);
if (!stat.isFile()) {
  fail('Credential path is not a regular file', { credentialPath: resolvedCredentialsPath });
}

if (process.platform !== 'win32' && (stat.mode & 0o077) !== 0) {
  fail('Credential file permissions are too broad; run chmod 600', {
    credentialPath: resolvedCredentialsPath,
    mode: `0${(stat.mode & 0o777).toString(8)}`,
  });
}

let credentialMetadata;
try {
  const parsed = JSON.parse(fs.readFileSync(resolvedCredentialsPath, 'utf8'));
  credentialMetadata = {
    type: typeof parsed.type === 'string' ? parsed.type : '',
    clientEmail: typeof parsed.client_email === 'string' ? parsed.client_email : '',
    projectId: typeof parsed.project_id === 'string' ? parsed.project_id : '',
  };
} catch (error) {
  fail('Credential file is not valid JSON', {
    credentialPath: resolvedCredentialsPath,
    detail: error instanceof Error ? error.message : String(error),
  });
}

if (credentialMetadata.type !== 'service_account' || !credentialMetadata.clientEmail) {
  fail('Credential file is not a Google service-account key', {
    credentialPath: resolvedCredentialsPath,
  });
}

const property =
  process.env['GOOGLE_SEARCH_CONSOLE_SITE_URL']?.trim() ||
  process.env['GSC_SITE_URL']?.trim() ||
  DEFAULT_PROPERTY;

const auth = new google.auth.GoogleAuth({
  keyFile: resolvedCredentialsPath,
  scopes: [READONLY_SCOPE],
});
const searchConsole = google.searchconsole({ version: 'v1', auth });

const today = new Date();
const endDate = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
const startDate = new Date(today.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

try {
  const [sitesResponse, performanceResponse, sitemapResponse] = await Promise.all([
    searchConsole.sites.list(),
    searchConsole.searchanalytics.query({
      siteUrl: property,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['date'],
        rowLimit: 1,
      },
    }),
    searchConsole.sitemaps.list({ siteUrl: property }),
  ]);

  const accessibleSites = (sitesResponse.data.siteEntry ?? []).map((entry) => ({
    siteUrl: entry.siteUrl ?? '',
    permissionLevel: entry.permissionLevel ?? '',
  }));
  const propertyEntry = accessibleSites.find((entry) => entry.siteUrl === property);

  if (!propertyEntry) {
    fail('Configured property is not visible to the service account', {
      property,
      serviceAccount: credentialMetadata.clientEmail,
      accessibleSites,
    });
  }

  emit({
    ok: true,
    readonly: true,
    scope: READONLY_SCOPE,
    property,
    permissionLevel: propertyEntry.permissionLevel,
    serviceAccount: credentialMetadata.clientEmail,
    projectId: credentialMetadata.projectId,
    performanceProbe: {
      startDate,
      endDate,
      rows: performanceResponse.data.rows?.length ?? 0,
    },
    sitemapProbe: {
      entries:
        sitemapResponse.data.sitemap?.length ?? sitemapResponse.data.sitemapEntry?.length ?? 0,
    },
  });
} catch (error) {
  fail('Google Search Console readonly probe failed', {
    property,
    serviceAccount: credentialMetadata.clientEmail,
    detail: error instanceof Error ? error.message : String(error),
  });
}
