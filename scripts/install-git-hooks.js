#!/usr/bin/env node

import { chmodSync, copyFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(__filename), '..');
const gitDir = path.join(projectRoot, '.git');
const hooksDir = path.join(gitDir, 'hooks');
const sourceHook = path.join(projectRoot, 'githooks', 'pre-commit');
const targetHook = path.join(hooksDir, 'pre-commit');

if (!existsSync(gitDir)) {
  console.error('Unable to find .git directory. Run this script from inside the profile-website repository.');
  process.exit(1);
}

if (!existsSync(sourceHook)) {
  console.error('Unable to find githooks/pre-commit template.');
  process.exit(1);
}

mkdirSync(hooksDir, { recursive: true });
copyFileSync(sourceHook, targetHook);
chmodSync(targetHook, 0o755);

console.log('Installed pre-commit hook from githooks/pre-commit.');
