#!/usr/bin/env node
/**
 * Copy Docusaurus build output into the Nuxt app `public/docs/` folder
 * so routes like /docs/user-guide/overview are served as static files.
 *
 * Run after: DOCUSAURUS_BASE_URL=/docs/ npm run build
 * From repo root: npm run docs:embed
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildDir = path.join(__dirname, '../build');
const destDir = path.join(__dirname, '../../public/docs');

if (!fs.existsSync(buildDir)) {
  console.error('Missing website/build — run: cd website && DOCUSAURUS_BASE_URL=/docs/ npm run build');
  process.exit(1);
}

fs.rmSync(destDir, { recursive: true, force: true });
fs.mkdirSync(destDir, { recursive: true });

for (const name of fs.readdirSync(buildDir)) {
  fs.cpSync(path.join(buildDir, name), path.join(destDir, name), { recursive: true });
}

console.log(`Embedded docs → ${destDir}`);
