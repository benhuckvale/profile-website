#!/usr/bin/env node

import { chmodSync, copyFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(__filename), '..');
const gitDir = path.join(projectRoot, '.git');
const hooksDir = path.join(gitDir, 'hooks');
const hooks = ['pre-commit', 'pre-push'];

if (!existsSync(gitDir)) {
  console.error('Unable to find .git directory. Run this script from inside the profile-website repository.');
  process.exit(1);
}

mkdirSync(hooksDir, { recursive: true });

for (const hook of hooks) {
  const sourceHook = path.join(projectRoot, 'githooks', hook);
  const targetHook = path.join(hooksDir, hook);
  if (!existsSync(sourceHook)) continue;
  copyFileSync(sourceHook, targetHook);
  chmodSync(targetHook, 0o755);
  console.log(`Installed ${hook} hook from githooks/${hook}.`);
}
