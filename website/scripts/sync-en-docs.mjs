#!/usr/bin/env node
/**
 * Copy Hebrew docs to English folder when missing (developer adds translation after).
 * Run from website/: node scripts/sync-en-docs.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcRoot = path.join(__dirname, '../docs');
const destRoot = path.join(__dirname, '../i18n/en/docusaurus-plugin-content-docs/current');

const banner = `---
# TODO: Translate to English — source of truth is Hebrew in website/docs/
---§

`;

function walk(dir, rel = '') {
  for (const name of fs.readdirSync(dir)) {
    const abs = path.join(dir, name);
    const relPath = path.join(rel, name);
    if (fs.statSync(abs).isDirectory()) {
      walk(abs, relPath);
    } else if (name.endsWith('.md')) {
      const dest = path.join(destRoot, relPath);
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        const content = fs.readFileSync(abs, 'utf8');
        fs.writeFileSync(dest, banner + content);
        console.log('Created stub:', relPath);
      }
    }
  }
}

walk(srcRoot);
console.log('Done.');
