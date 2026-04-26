#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';

const root = process.cwd();
const argv = process.argv.slice(2);
const args = new Set(argv);
const checkMode = args.has('--check');

const reportArgIndex = argv.findIndex((arg) => arg === '--report');
const reportPathArg =
  reportArgIndex >= 0 && argv[reportArgIndex + 1]
    ? argv[reportArgIndex + 1]
    : argv.find((arg) => arg.startsWith('--report='))?.split('=').slice(1).join('=') ?? null;

const compactLimit = Number.parseInt(process.env['CODEX_AUTO_COMPACT_LIMIT'] ?? '100000', 10);

const userConfigPath = resolve(homedir(), '.codex/config.toml');
const repoConfigPath = resolve(root, '.codex/config.toml');
const mcpConfigPath = resolve(root, 'mcp-config.toml');

const advisorySkills = [
  'openai-docs',
  'playwright',
  'security-best-practices',
  'security-threat-model',
  'gh-fix-ci',
  'doc',
];

const advisoryMcpBins = [
  'mcp-server-everything',
  'mcp-server-filesystem',
  'codex-shell-tool-mcp',
  'mcp-server-postgres',
  'mcp-server-memory',
  'mcp-server-sequential-thinking',
  'mcp-server-github',
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function readText(path) {
  return readFileSync(path, 'utf8');
}

function writeText(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content.endsWith('\n') ? content : `${content}\n`, 'utf8');
}

function upsertTopLevelKey(content, key, valueLiteral) {
  const line = `${key} = ${valueLiteral}`;
  const keyRegex = new RegExp(`^${escapeRegExp(key)}\\s*=.*$`, 'm');
  if (keyRegex.test(content)) {
    return content.replace(keyRegex, line);
  }

  const firstSection = content.search(/^\s*\[/m);
  if (firstSection === -1) {
    return `${content.trimEnd()}\n${line}\n`;
  }

  const before = content.slice(0, firstSection).trimEnd();
  const after = content.slice(firstSection).replace(/^\n+/, '');
  return `${before}\n${line}\n\n${after}`;
}

function ensureProjectTrusted(content, projectRoot) {
  const normalized = content.replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');
  const header = `projects."${projectRoot}"`;
  const output = [];
  let found = false;

  for (let i = 0; i < lines.length; ) {
    const sectionMatch = lines[i]?.match(/^\s*\[([^\]]+)\]\s*$/);
    if (!sectionMatch) {
      if (!/^\s*trust_level\s*=\s*"trusted"\s*$/.test(lines[i] ?? '')) {
        output.push(lines[i] ?? '');
      }
      i += 1;
      continue;
    }

    const sectionName = sectionMatch[1]?.trim();
    let end = i + 1;
    while (end < lines.length && !/^\s*\[/.test(lines[end] ?? '')) {
      end += 1;
    }

    if (sectionName === header) {
      found = true;
      output.push(`[${header}]`);
      output.push('trust_level = "trusted"');
      output.push('');
      i = end;
      continue;
    }

    output.push(...lines.slice(i, end));
    i = end;
  }

  if (!found) {
    output.push('');
    output.push(`[${header}]`);
    output.push('trust_level = "trusted"');
    output.push('');
  }

  return `${output.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd()}\n`;
}

function alignMcpWorkspace(content, projectRoot) {
  const workspaceMatch = content.match(/CODEX_WORKSPACE\s*=\s*"([^"]+)"/);
  const projectPathMatch = content.match(/PROJECT_PATH\s*=\s*"([^"]+)"/);
  const configuredRoot = workspaceMatch?.[1] ?? projectPathMatch?.[1] ?? null;

  if (!configuredRoot || configuredRoot === projectRoot) {
    return content;
  }

  return content.split(configuredRoot).join(projectRoot);
}

function checkCommandVersion(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

function collectFacts() {
  const nodeVersion = checkCommandVersion('node -v');
  const npmVersion = checkCommandVersion('npm -v');
  const pnpmVersion = checkCommandVersion('pnpm -v');

  const skillRoot = resolve(homedir(), '.codex/skills');
  const skillStatus = advisorySkills.map((name) => ({
    name,
    installed: existsSync(resolve(skillRoot, name, 'SKILL.md')),
  }));

  const nodeModulesBinRoot = resolve(root, 'node_modules/.bin');
  const hasNodeModules = existsSync(nodeModulesBinRoot);
  const mcpBins = advisoryMcpBins.map((bin) => {
    const binPath = resolve(root, 'node_modules/.bin', bin);
    return {
      name: bin,
      path: binPath,
      checked: hasNodeModules,
      installed: existsSync(binPath),
    };
  });

  return {
    nodeVersion,
    npmVersion,
    pnpmVersion,
    skillStatus,
    mcpBins,
  };
}

function buildMarkdownReport(data) {
  const lines = [];
  lines.push('# Codex Bootstrap Status');
  lines.push('');
  lines.push(`- generatedAt: ${new Date().toISOString()}`);
  lines.push(`- mode: ${checkMode ? 'check' : 'write'}`);
  lines.push(`- workspace: ${root}`);
  lines.push(`- model_auto_compact_token_limit: ${compactLimit}`);
  lines.push('');
  lines.push('## Toolchain');
  lines.push('');
  lines.push(`- node: ${data.facts.nodeVersion ?? 'missing'}`);
  lines.push(`- npm: ${data.facts.npmVersion ?? 'missing'}`);
  lines.push(`- pnpm: ${data.facts.pnpmVersion ?? 'missing'}`);
  lines.push('');
  lines.push('## Skills');
  lines.push('');
  for (const skill of data.facts.skillStatus) {
    lines.push(`- ${skill.name}: ${skill.installed ? 'installed' : 'missing'}`);
  }
  lines.push('');
  lines.push('## MCP Binaries');
  lines.push('');
  for (const bin of data.facts.mcpBins) {
    lines.push(`- ${bin.name}: ${bin.installed ? 'ok' : 'missing'} (${bin.path})`);
  }
  lines.push('');
  lines.push('## Checks');
  lines.push('');
  if (data.issues.length === 0) {
    lines.push('- all checks passed');
  } else {
    for (const issue of data.issues) {
      lines.push(`- ${issue}`);
    }
  }
  lines.push('');
  lines.push('## Advisories');
  lines.push('');
  if (data.advisories.length === 0) {
    lines.push('- none');
  } else {
    for (const advisory of data.advisories) {
      lines.push(`- ${advisory}`);
    }
  }
  lines.push('');
  lines.push('## Applied Changes');
  lines.push('');
  if (data.changes.length === 0) {
    lines.push('- none');
  } else {
    for (const change of data.changes) {
      lines.push(`- ${change}`);
    }
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function ensureLocalConfigs() {
  const changes = [];

  if (!existsSync(userConfigPath)) {
    writeText(
      userConfigPath,
      `model_auto_compact_token_limit = ${compactLimit}\n[projects."${root}"]\ntrust_level = "trusted"\n`,
    );
    changes.push(`created ${userConfigPath}`);
  } else {
    let userConfig = readText(userConfigPath);
    const before = userConfig;
    userConfig = upsertTopLevelKey(userConfig, 'model_auto_compact_token_limit', `${compactLimit}`);
    userConfig = ensureProjectTrusted(userConfig, root);
    if (userConfig !== before) {
      writeText(userConfigPath, userConfig);
      changes.push(`updated ${userConfigPath}`);
    }
  }

  let repoConfig = readText(repoConfigPath);
  const beforeRepo = repoConfig;
  repoConfig = upsertTopLevelKey(repoConfig, 'model_auto_compact_token_limit', `${compactLimit}`);
  if (repoConfig !== beforeRepo) {
    writeText(repoConfigPath, repoConfig);
    changes.push(`updated ${repoConfigPath}`);
  }

  let mcpConfig = readText(mcpConfigPath);
  const beforeMcp = mcpConfig;
  mcpConfig = alignMcpWorkspace(mcpConfig, root);
  if (mcpConfig !== beforeMcp) {
    writeText(mcpConfigPath, mcpConfig);
    changes.push(`updated ${mcpConfigPath}`);
  }

  return changes;
}

function runChecks() {
  const issues = [];
  const advisories = [];
  const facts = collectFacts();

  if (!facts.nodeVersion) {
    issues.push('node is not installed');
  }
  if (!facts.npmVersion) {
    issues.push('npm is not installed');
  }
  if (!facts.pnpmVersion) {
    issues.push('pnpm is not installed');
  }

  if (!existsSync(userConfigPath)) {
    issues.push(`missing ${userConfigPath}`);
  } else {
    const userConfig = readText(userConfigPath);
    if (!/^\s*model_auto_compact_token_limit\s*=\s*\d+\s*$/m.test(userConfig)) {
      issues.push(`model_auto_compact_token_limit not set in ${userConfigPath}`);
    }
    if (!new RegExp(`\\[projects\\."${escapeRegExp(root)}"\\]`).test(userConfig)) {
      issues.push(`project trust is missing in ${userConfigPath}`);
    }
  }

  const repoConfig = readText(repoConfigPath);
  if (!/^\s*model_auto_compact_token_limit\s*=\s*\d+\s*$/m.test(repoConfig)) {
    issues.push(`model_auto_compact_token_limit not set in ${repoConfigPath}`);
  }

  const mcpConfig = readText(mcpConfigPath);
  const workspace =
    mcpConfig.match(/CODEX_WORKSPACE\s*=\s*"([^"]+)"/)?.[1] ??
    mcpConfig.match(/PROJECT_PATH\s*=\s*"([^"]+)"/)?.[1] ??
    null;
  if (!workspace) {
    issues.push(`workspace keys not found in ${mcpConfigPath}`);
  } else if (workspace !== root) {
    issues.push(`mcp workspace mismatch: '${workspace}' != '${root}'`);
  }

  for (const skill of facts.skillStatus) {
    if (!skill.installed) {
      advisories.push(`skill missing: ${skill.name}`);
    }
  }
  for (const bin of facts.mcpBins) {
    if (!bin.checked) {
      advisories.push(`node_modules/.bin missing; skipped MCP binary check for ${bin.name}`);
      continue;
    }
    if (!bin.installed) {
      advisories.push(`mcp binary missing: ${bin.name}`);
    }
  }

  return { advisories, facts, issues };
}

function main() {
  const changes = checkMode ? [] : ensureLocalConfigs();
  const checkResult = runChecks();
  const advisories = checkResult.advisories;
  const issues = checkResult.issues;

  if (reportPathArg) {
    const reportPath = resolve(root, reportPathArg);
    writeText(
      reportPath,
      buildMarkdownReport({
        changes,
        facts: checkResult.facts,
        advisories,
        issues,
      }),
    );
    console.log(`[codex:bootstrap] report written: ${reportPath}`);
  }

  for (const change of changes) {
    console.log(`[codex:bootstrap] ${change}`);
  }

  for (const advisory of advisories) {
    console.log(`[codex:bootstrap] advisory: ${advisory}`);
  }

  if (issues.length > 0) {
    for (const issue of issues) {
      console.error(`[codex:bootstrap] issue: ${issue}`);
    }
    process.exit(1);
  }

  console.log('[codex:bootstrap] all checks passed');
}

main();
