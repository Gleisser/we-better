#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const tokenEnvVar = ['VITE', 'API', 'TOKEN'].join('_');
const bannedFrontendEnvVars = [
  tokenEnvVar,
  ['VITE', 'STRAPI', 'API', 'TOKEN'].join('_'),
  ['VITE', 'STRAPI', 'TOKEN'].join('_'),
  ['VITE', 'STRAPI', 'API', 'URL'].join('_'),
  ['VITE', 'STRAPI', 'URL'].join('_'),
  ['VITE', 'API', 'URL'].join('_'),
];
const bannedLegacyOrigins = ['localhost:1337', 'strapiapp.com'];
const bannedCspPatterns = [
  "default-src *",
  "script-src *",
  "connect-src *",
  "frame-src *",
  "'unsafe-eval'",
];

function runGitGrep(pattern, pathspec = ['.']) {
  const result = spawnSync('git', ['grep', '-n', '-I', '--', pattern, '--', ...pathspec], {
    encoding: 'utf8',
  });

  if (result.status === 0) {
    return result.stdout
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);
  }

  if (result.status === 1) {
    return [];
  }

  throw new Error(result.stderr || `git grep failed with exit code ${result.status}`);
}

function failWithMatches(title, matches) {
  console.error(`\n[guardrails] ${title}`);
  for (const line of matches) {
    console.error(`  - ${line}`);
  }
}

function checkTokenVarIsAbsentInTrackedFiles() {
  const matches = runGitGrep(tokenEnvVar);
  if (matches.length > 0) {
    failWithMatches(`Disallowed env var detected in tracked files: ${tokenEnvVar}`, matches);
    return false;
  }
  return true;
}

function checkApiClientHasNoAuthorizationHeader() {
  const apiClientPath = join(process.cwd(), 'src', 'core', 'services', 'api-client.ts');
  const apiClientContent = readFileSync(apiClientPath, 'utf8');

  if (/Authorization/i.test(apiClientContent)) {
    console.error(
      '\n[guardrails] Disallowed Authorization header reference detected in src/core/services/api-client.ts'
    );
    return false;
  }

  return true;
}

function checkBannedFrontendEnvVars() {
  let valid = true;
  const trackedFrontendPathspec = ['src', '.env.example', 'vite-env.d.ts', 'vite.config.ts', 'vercel.json'];

  for (const envVar of bannedFrontendEnvVars) {
    const matches = runGitGrep(envVar, trackedFrontendPathspec);
    if (matches.length > 0) {
      failWithMatches(`Banned frontend env var detected: ${envVar}`, matches);
      valid = false;
    }
  }

  return valid;
}

function checkNoLegacyStrapiOriginsInFrontendRuntimeConfig() {
  let valid = true;

  for (const pattern of bannedLegacyOrigins) {
    const matches = runGitGrep(pattern, ['src/core/config', 'src/core/services']);
    if (matches.length > 0) {
      failWithMatches(
        `Legacy Strapi origin detected in frontend runtime code: ${pattern}`,
        matches
      );
      valid = false;
    }
  }

  return valid;
}

function checkIndexHtmlHasNoPermissiveMetaCsp() {
  const indexHtml = readFileSync(join(process.cwd(), 'index.html'), 'utf8');
  let valid = true;

  for (const pattern of bannedCspPatterns) {
    if (indexHtml.includes(pattern)) {
      console.error(`\n[guardrails] Permissive CSP pattern detected in index.html: ${pattern}`);
      valid = false;
    }
  }

  return valid;
}

function main() {
  const checks = [
    checkTokenVarIsAbsentInTrackedFiles(),
    checkApiClientHasNoAuthorizationHeader(),
    checkBannedFrontendEnvVars(),
    checkNoLegacyStrapiOriginsInFrontendRuntimeConfig(),
    checkIndexHtmlHasNoPermissiveMetaCsp(),
  ];

  if (checks.every(Boolean)) {
    console.log('[guardrails] Frontend security guardrails passed.');
    process.exit(0);
  }

  process.exit(1);
}

main();
