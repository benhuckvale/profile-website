#!/usr/bin/env node
/**
 * Fetch and integrate subsites from GitHub releases
 *
 * Reads subsites.yml configuration and downloads release artifacts,
 * extracting them to the dist/ directory for deployment.
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { parse as parseYaml } from 'yaml';

interface Subsite {
  path: string;
  owner: string;
  repo: string;
  artifact_pattern: string;
  token_env?: string;
  description?: string;
}

interface Config {
  subsites: Subsite[];
}

const DIST_DIR = join(process.cwd(), 'dist');
const CONFIG_FILE = join(process.cwd(), 'subsites.yml');

function log(message: string) {
  console.log(`[subsites] ${message}`);
}

function error(message: string) {
  console.error(`[subsites] ERROR: ${message}`);
}

function exec(command: string, env?: Record<string, string>): string {
  try {
    return execSync(command, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, ...env },
    }).trim();
  } catch (err: any) {
    error(`Command failed: ${command}`);
    error(err.stderr || err.message);
    throw err;
  }
}

function loadConfig(): Config {
  if (!existsSync(CONFIG_FILE)) {
    log('No subsites.yml found, skipping subsites integration');
    return { subsites: [] };
  }

  const content = readFileSync(CONFIG_FILE, 'utf-8');
  const config = parseYaml(content) as Config;

  if (!config.subsites || config.subsites.length === 0) {
    log('No subsites configured');
    return { subsites: [] };
  }

  return config;
}

function fetchSubsite(subsite: Subsite) {
  const { path, owner, repo, artifact_pattern, token_env, description } = subsite;

  log(`Fetching subsite: ${description || path}`);
  log(`  Repository: ${owner}/${repo}`);
  log(`  Artifact: ${artifact_pattern}`);
  log(`  Target path: /${path}`);

  const subsiteDir = join(DIST_DIR, path);
  const tempDir = join(DIST_DIR, '.subsites-temp', path);

  // Create temporary directory for download
  mkdirSync(tempDir, { recursive: true });

  // Prepare environment with token if specified
  const env: Record<string, string> = {};
  if (token_env) {
    const token = process.env[token_env];
    if (!token) {
      error(`Token environment variable ${token_env} not set`);
      throw new Error(`Missing token: ${token_env}`);
    }
    env.GH_TOKEN = token;
  }

  try {
    // Download release artifact using gh CLI
    log(`  Downloading from ${owner}/${repo}...`);
    exec(
      `gh release download --repo ${owner}/${repo} --pattern "${artifact_pattern}" --dir "${tempDir}" --clobber`,
      env
    );

    // Find the downloaded file
    const downloadedFile = join(tempDir, artifact_pattern);
    if (!existsSync(downloadedFile)) {
      throw new Error(`Downloaded file not found: ${downloadedFile}`);
    }

    log(`  Extracting to ${subsiteDir}...`);

    // Create subsite directory
    mkdirSync(subsiteDir, { recursive: true });

    // Extract based on file type
    if (artifact_pattern.endsWith('.zip')) {
      exec(`unzip -q -o "${downloadedFile}" -d "${subsiteDir}"`);
    } else if (artifact_pattern.endsWith('.tar.gz') || artifact_pattern.endsWith('.tgz')) {
      exec(`tar -xzf "${downloadedFile}" -C "${subsiteDir}"`);
    } else {
      // For non-archive files, just copy
      exec(`cp "${downloadedFile}" "${subsiteDir}/"`);
    }

    log(`  ✓ Successfully integrated subsite: ${path}`);
  } catch (err: any) {
    error(`Failed to fetch subsite ${path}: ${err.message}`);
    throw err;
  }
}

function main() {
  log('Starting subsites integration');

  // Check if dist/ exists
  if (!existsSync(DIST_DIR)) {
    error('dist/ directory not found. Run build first.');
    process.exit(1);
  }

  // Load configuration
  const config = loadConfig();

  if (config.subsites.length === 0) {
    log('No subsites to integrate');
    return;
  }

  // Fetch each subsite
  let successCount = 0;
  let failCount = 0;

  for (const subsite of config.subsites) {
    try {
      fetchSubsite(subsite);
      successCount++;
    } catch (err) {
      failCount++;
      error(`Skipping subsite ${subsite.path} due to error`);
    }
  }

  // Summary
  log('');
  log('='.repeat(60));
  log(`Subsites integration complete: ${successCount} succeeded, ${failCount} failed`);
  log('='.repeat(60));

  if (failCount > 0) {
    process.exit(1);
  }
}

main();
