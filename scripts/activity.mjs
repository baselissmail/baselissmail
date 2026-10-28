#!/usr/bin/env node
// Draws assets/activity.svg: the last 12 months of contributions across my work and personal accounts,
// as a bedside monitor (dark in both themes, like hardware). Most of my commits land on the work account,
// so the personal profile on its own undersells the year.
//
//   GH_TOKEN=$(gh auth token) npm run activity
//
// Runs daily in .github/workflows/refresh.yml. A failed API call leaves the last drawing in place.

import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mono500, mono700, outline } from './type.mjs';

const ACCOUNTS = [
  { login: 'basel-kepler', role: 'work' },
  { login: 'baselissmail', role: 'personal' },
];
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../assets/activity.svg');
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

const c = {
  surface: '#0f1d1c', border: '#1f3835', bar: '#0b1716', ink: '#d3e6e2', muted: '#87a7a1', dim: '#5d7a75',
  grid: '#132826', gridStrong: '#1b3532', pass: '#5be0c6', warn: '#f2b84b',
};

async function calendar(login) {
  const query = `query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{
    weeks{contributionDays{date contributionCount}}}}}}`;
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { authorization: `bearer ${TOKEN}`, 'content-type': 'application/json', 'user-agent': 'baselissmail-readme' },
    body: JSON.stringify({ query, variables: { login } }),
  });
  const body = await res.json();
  if (!res.ok || body.errors) throw new Error(`${login}: HTTP ${res.status} ${JSON.stringify(body.errors ?? body.message)}`);
  return body.data.user.contributionsCollection.contributionCalendar.weeks.flatMap((w) => w.contributionDays);
}

let days;
try {
  if (!TOKEN) throw new Error('no GITHUB_TOKEN or GH_TOKEN');
  const calendars = await Promise.all(ACCOUNTS.map((a) => calendar(a.login)));
  const byDate = new Map();
  calendars.forEach((cal, i) => {
    for (const d of cal) {
      const day = byDate.get(d.date) ?? { date: d.date, total: 0, by: {} };
      day.total += d.contributionCount;
      day.by[ACCOUNTS[i].role] = d.contributionCount;
      byDate.set(d.date, day);
    }
  });
  days = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
} catch (err) {
  console.log(`::warning::Contribution calendars unavailable (${err.message}); activity.svg unchanged`);
  process.exit(0);
}

// ------------------------------------------------------------------ numbers
const total = days.reduce((n, d) => n + d.total, 0);
const work = days.reduce((n, d) => n + (d.by.work ?? 0), 0);
const active = days.filter((d) => d.total > 0).length;
const busiest = days.reduce((a, b) => (b.total > a.total ? b : a));
const fmtDate = (iso, opts) => new Intl.DateTimeFormat('en', { timeZone: 'UTC', ...opts }).format(new Date(`${iso}T00:00:00Z`));
const n = (v) => v.toLocaleString('en');

const weeks = [];
for (let i = 0; i < days.length; i += 7) {
  const chunk = days.slice(i, i + 7);
  weeks.push({ start: chunk[0].date, total: chunk.reduce((s, d) => s + d.total, 0) });
}

// ------------------------------------------------------------------ drawing
const W = 1200;
const H = 350;
const TOP = 56; // trace area
const BOTTOM = 218;
const LEFT = 28;
const RIGHT = W - 28;
const peak = Math.max(...weeks.map((w) => w.total), 1);
const x = (i) => LEFT + (i * (RIGHT - LEFT)) / (weeks.length - 1);
const y = (v) => BOTTOM - 10 - (v / peak) * (BOTTOM - TOP - 34);

const points = weeks.map((w, i) => [+x(i).toFixed(1), +y(w.total).toFixed(1)]);
const line = points.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`).join('');
const area = `${line}L${RIGHT} ${BOTTOM}L${LEFT} ${BOTTOM}Z`;
const peakAt = weeks.findIndex((w) => w.total === peak);
const [lastX, lastY] = points.at(-1);

const paths = [];
const text = (cls, f, s, size, opts) => paths.push(`<path class="${cls}" d="${outline(f, s, size, opts).d}"/>`);

// top bar
text('pass', mono700, 'LIVE', 14, { x: 46, y: 33, tracking: 0.12 });
text('muted', mono500, 'CONTRIBUTIONS · LAST 12 MONTHS · WORK + PERSONAL', 14, { x: 104, y: 33, tracking: 0.1 });
text('dim', mono500, `updated ${fmtDate(days.at(-1).date, { month: 'short', day: 'numeric', year: 'numeric' })}`, 14, { x: W - 28, y: 33, anchor: 'end', tracking: 0.04 });

// month ticks under the trace
let lastMonth = '';
weeks.forEach((w, i) => {
  const m = w.start.slice(0, 7);
  if (m !== lastMonth && i > 0 && i < weeks.length - 2) {
    text('dim', mono500, fmtDate(w.start, { month: 'short' }).toUpperCase(), 13, { x: x(i), y: BOTTOM + 20, anchor: 'middle', tracking: 0.08 });
  }
  lastMonth = m;
});

// peak label
const [px, py] = points[peakAt];
const peakLabel = `PEAK WEEK ${n(peak)}`;
const anchor = peakAt > weeks.length - 8 ? 'end' : peakAt < 6 ? 'start' : 'middle';
text('warn late', mono700, peakLabel, 14, { x: px, y: py - 12, anchor, tracking: 0.08 });

// stat cells
const cells = [
  { label: 'CONTRIBUTIONS', value: n(total), sub: 'both accounts' },
  { label: 'ON @BASEL-KEPLER', value: n(work), sub: `${Math.round((work / total) * 100)}% · my work account` },
  { label: 'ACTIVE DAYS', value: String(active), sub: 'with a contribution' },
  { label: 'BUSIEST DAY', value: String(busiest.total), sub: fmtDate(busiest.date, { month: 'short', day: 'numeric', year: 'numeric' }) },
];
const cellW = W / cells.length;
cells.forEach((cell, i) => {
  const cx = i * cellW + 28;
  text('muted', mono500, cell.label, 15, { x: cx, y: 272, tracking: 0.08 });
  text(i === 1 ? 'pass' : 'ink', mono700, cell.value, 36, { x: cx - 2, y: 312 });
  text('dim', mono500, cell.sub, 15, { x: cx, y: 334 });
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t">
<title id="t">${n(total)} contributions in the last 12 months across my work account (@basel-kepler, ${n(work)}) and personal account (@baselissmail). ${active} active days; busiest day ${busiest.total} on ${busiest.date}.</title>
<style>
.ink{fill:${c.ink}}.muted{fill:${c.muted}}.dim{fill:${c.dim}}.pass{fill:${c.pass}}.warn{fill:${c.warn}}
.trace{fill:none;stroke:${c.pass};stroke-width:2.5;stroke-linejoin:round;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:1;animation:draw 2.6s cubic-bezier(.45,.05,.35,1) .2s forwards}
.glow{fill:none;stroke:${c.pass};stroke-width:9;stroke-linejoin:round;opacity:0;animation:glow .8s ease 2.6s forwards}
.area{fill:url(#fade);opacity:0;animation:fade 1s ease 1.8s forwards}
.late{opacity:0;animation:fade .5s ease 2.7s forwards}
.blink{animation:blink 1.6s steps(1) infinite}
.ring{fill:none;stroke:${c.pass};stroke-width:2;transform-box:fill-box;transform-origin:center;opacity:0;animation:ring 2.2s ease-out 2.9s infinite}
@keyframes draw{to{stroke-dashoffset:0}}
@keyframes fade{to{opacity:1}}
@keyframes glow{to{opacity:.12}}
@keyframes blink{50%{opacity:.25}}
@keyframes ring{0%{opacity:.7;transform:scale(.4)}80%,100%{opacity:0;transform:scale(2.6)}}
@media (prefers-reduced-motion:reduce){.trace{stroke-dashoffset:0;animation:none}.area,.late{opacity:1;animation:none}.glow{opacity:.12;animation:none}.blink,.ring{animation:none}}
</style>
<defs>
<clipPath id="screen"><rect width="${W}" height="${H}" rx="16"/></clipPath>
<pattern id="minor" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M12 0H0V12" fill="none" stroke="${c.grid}" stroke-width="1"/></pattern>
<pattern id="major" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill="url(#minor)"/><path d="M60 0H0V60" fill="none" stroke="${c.gridStrong}" stroke-width="1"/></pattern>
<linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.pass}" stop-opacity=".22"/><stop offset="1" stop-color="${c.pass}" stop-opacity="0"/></linearGradient>
</defs>
<g clip-path="url(#screen)">
<rect width="${W}" height="${H}" fill="${c.surface}"/>
<rect width="${W}" height="52" fill="${c.bar}"/>
<rect y="${TOP - 4}" width="${W}" height="${BOTTOM - TOP + 32}" fill="url(#major)"/>
<path d="M0 52H${W}M0 ${BOTTOM + 28}H${W}" stroke="${c.border}" stroke-width="1.5"/>
${cells.slice(1).map((_, i) => `<path d="M${(i + 1) * cellW} ${BOTTOM + 28}V${H}" stroke="${c.border}" stroke-width="1.5"/>`).join('')}
<path class="area" d="${area}"/>
<path class="glow" d="${line}"/>
<path class="trace" pathLength="1" d="${line}"/>
<circle class="pass blink" cx="30" cy="28" r="6"/>
<g class="late"><circle class="warn" cx="${px}" cy="${py}" r="4.5"/></g>
<circle class="pass late" cx="${lastX}" cy="${lastY}" r="5"/>
<circle class="ring" cx="${lastX}" cy="${lastY}" r="7"/>
${paths.join('\n')}
</g>
<rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="15.5" fill="none" stroke="${c.border}" stroke-width="1.5"/>
</svg>
`;

await writeFile(OUT, svg);
console.log(`assets/activity.svg: ${n(total)} contributions (${n(work)} work), ${active} active days, busiest ${busiest.total} on ${busiest.date}`);
