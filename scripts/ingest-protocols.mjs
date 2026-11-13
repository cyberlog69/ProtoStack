#!/usr/bin/env node
/**
 * ProtoStack data audit.
 *
 * This script does not scrape IANA or the IETF. It reads the checked-in data
 * files and reports the real counts and a few structural checks so the README,
 * category metadata, and the catalog cannot silently drift apart.
 *
 * Usage: node scripts/ingest-protocols.mjs [--check]
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'src', 'data', 'protocols');

const VALID_CATEGORIES = new Set([
  'network',
  'transport',
  'application',
  'iot',
  'security',
  'wireless',
  'cloud',
]);

const checkOnly = process.argv.includes('--check');
const errors = [];

if (!fs.existsSync(DATA_DIR)) {
  console.error(`Data directory not found: ${DATA_DIR}`);
  process.exit(1);
}

const files = fs.readdirSync(DATA_DIR).filter((file) => file.endsWith('.ts'));

if (files.length === 0) {
  console.error(`No protocol data files found in ${DATA_DIR}`);
  process.exit(1);
}

const categoryCounts = new Map();
const ids = new Set();
let total = 0;

for (const file of files.sort()) {
  const content = fs.readFileSync(path.join(DATA_DIR, file), 'utf8');

  // Protocol declarations and their category are indented with four spaces;
  // nested ids (actors, steps, quiz questions) are indented further.
  const protocolIds = [...content.matchAll(/^ {4}id: '([^']+)',/gm)].map((match) => match[1]);
  const categories = [...content.matchAll(/^ {4}category: '([^']+)',/gm)].map((match) => match[1]);

  total += protocolIds.length;

  for (const id of protocolIds) {
    if (ids.has(id)) errors.push(`Duplicate protocol id "${id}" in ${file}`);
    ids.add(id);
  }

  if (categories.length !== protocolIds.length) {
    errors.push(
      `${file}: found ${protocolIds.length} protocol ids but ${categories.length} categories`,
    );
  }

  for (const category of categories) {
    if (!VALID_CATEGORIES.has(category)) {
      errors.push(`${file}: unknown category "${category}"`);
      continue;
    }
    categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
  }

  if (/RFC 913\b/.test(content)) {
    errors.push(`${file}: contains the incorrect RFC 913 reference`);
  }
}

console.log('ProtoStack protocol data audit');
console.log(`Files scanned: ${files.length}`);
console.log(`Protocols found: ${total}`);
console.log('');

for (const category of [...VALID_CATEGORIES].sort()) {
  console.log(`  ${category.padEnd(12)} ${categoryCounts.get(category) ?? 0}`);
}

const categoryTotal = [...categoryCounts.values()].reduce((sum, count) => sum + count, 0);
if (categoryTotal !== total) errors.push(`Category total ${categoryTotal} does not match protocol total ${total}`);

console.log('');

if (errors.length > 0) {
  console.error(`Found ${errors.length} issue(s):`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(checkOnly ? 'All structural checks passed.' : 'All structural checks passed. No files were modified.');
