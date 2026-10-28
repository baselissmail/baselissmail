#!/usr/bin/env node
// Rewrites the "Latest writing" list in README.md from my Medium feed.
// No dependencies; runs daily in .github/workflows/refresh.yml. A failed fetch leaves the README alone.

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FEED = 'https://medium.com/feed/@basel.issmail';
const COUNT = 5;
const README = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../README.md');
const START = '<!-- posts:start -->';
const END = '<!-- posts:end -->';

const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'" };
const decode = (s) =>
  s
    .replace(/^<!\[CDATA\[|\]\]>$/g, '')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&(\w+|#39);/g, (m, e) => entities[e] ?? m)
    .trim();
const field = (item, tag) => decode(item.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`))?.[1] ?? '');

let xml;
try {
  const res = await fetch(FEED, { headers: { 'user-agent': 'baselissmail-readme (+https://github.com/baselissmail)' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  xml = await res.text();
} catch (err) {
  console.log(`::warning::Medium feed unavailable (${err.message}); README unchanged`);
  process.exit(0);
}

const posts = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
  .map(([, item]) => ({
    title: field(item, 'title').replace(/([[\]])/g, '\\$1'),
    url: field(item, 'link').split('?')[0],
    date: new Date(field(item, 'pubDate')),
  }))
  .filter((p) => p.title && p.url && !Number.isNaN(+p.date))
  .slice(0, COUNT);

if (!posts.length) {
  console.log('::warning::Medium feed had no posts; README unchanged');
  process.exit(0);
}

const fmt = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const list = posts.map((p) => `- [${p.title}](${p.url}) <sub>· ${fmt.format(p.date)}</sub>`).join('\n');

const readme = await readFile(README, 'utf8');
const at = readme.indexOf(START);
const end = readme.indexOf(END);
if (at < 0 || end < at) throw new Error(`README.md needs ${START} … ${END}`);
const next = `${readme.slice(0, at + START.length)}\n${list}\n${readme.slice(end)}`;

if (next !== readme) {
  await writeFile(README, next);
  console.log(`README.md: ${posts.length} posts, newest "${posts[0].title}"`);
} else {
  console.log('README.md already up to date');
}
