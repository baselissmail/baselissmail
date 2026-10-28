#!/usr/bin/env node
// Draws the profile header: a career on ECG paper, in the smart-doctor palette.
// Text is converted to outlines so it looks the same on every OS (an <img> SVG can't load web fonts).
//
//   npm install && npm run header   → assets/header-light.svg, assets/header-dark.svg

import { writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const font = (pkg, weight) =>
  opentype.loadSync(require.resolve(`@fontsource/atkinson-hyperlegible-${pkg}/files/atkinson-hyperlegible-${pkg}-latin-${weight}-normal.woff`));

const sans800 = font('next', 800);
const sans400 = font('next', 400);
const mono500 = font('mono', 500);
const mono700 = font('mono', 700);

const W = 1200;
const H = 480;
const BASE = 362; // the trace's isoelectric line

const themes = {
  light: { paper: '#f6f9f8', ink: '#16252d', muted: '#56696e', grid: '#e3ece9', gridStrong: '#cddcd8', pass: '#0b7a6b', soft: '#9fb4b0' },
  dark: { paper: '#0e1a19', ink: '#e2ecea', muted: '#9db1b0', grid: '#172a28', gridStrong: '#233d3a', pass: '#45c2ae', soft: '#4d6764' },
};

// Each beat is a chapter, a little stronger than the last. The last one is still beating.
const beats = [
  { x: 190, amp: 0.74, year: '2016', label: 'Shamra search' },
  { x: 385, amp: 0.84, year: '2017', label: 'Maids.cc ERP' },
  { x: 580, amp: 0.94, year: '2021', label: 'PLATEAU 3D cities' },
  { x: 775, amp: 1.04, year: '2023', label: 'Kepler · EMRAY' },
  { x: 970, amp: 1.14, year: '2026', label: 'smart-doctor', now: true },
];

// The bedside monitor's side panel.
const vitals = [
  { label: 'YEARS SHIPPING', value: '10', unit: '' },
  { label: 'EHR VENDORS', value: '8', unit: 'integrated' },
  { label: 'CITIES MAPPED', value: '100+', unit: 'in 3D' },
];

/** Outline `text` with optional tracking (in em). Returns { d, width }. */
function outline(f, text, size, { x = 0, y = 0, tracking = 0, anchor = 'start' } = {}) {
  const scale = size / f.unitsPerEm;
  const glyphs = f.stringToGlyphs(text);
  let width = 0;
  glyphs.forEach((g, i) => {
    width += g.advanceWidth * scale;
    if (i < glyphs.length - 1) width += f.getKerningValue(g, glyphs[i + 1]) * scale + tracking * size;
  });
  let cx = anchor === 'middle' ? x - width / 2 : anchor === 'end' ? x - width : x;
  const parts = [];
  glyphs.forEach((g, i) => {
    parts.push(g.getPath(cx, y, size).toPathData(1));
    cx += g.advanceWidth * scale;
    if (i < glyphs.length - 1) cx += f.getKerningValue(g, glyphs[i + 1]) * scale + tracking * size;
  });
  return { d: parts.join(''), width };
}

/** One PQRST complex centred on x. */
function complex(x, amp = 1) {
  const p = (dx, dy) => `L${(x + dx).toFixed(1)} ${(BASE + dy * amp).toFixed(1)}`;
  return [
    p(-58, 0), `Q${x - 48} ${BASE - 9 * amp} ${x - 38} ${BASE}`, // P
    p(-14, 0), p(-8, 7), p(0, -66), p(7, 22), p(13, 0), // QRS
    p(24, 0), `Q${x + 40} ${BASE - 16 * amp} ${x + 56} ${BASE}`, // T
  ].join('');
}

function trace() {
  let d = `M0 ${BASE}`;
  for (const b of beats) d += complex(b.x, b.amp);
  return d + `L${beats.at(-1).x + 92} ${BASE}`;
}

function svg(t) {
  const last = beats.at(-1);
  const kicker = outline(mono500, 'TECH LEAD @ KEPLER · SMART ON FHIR · SERVERLESS AWS', 17, { x: 92, y: 80, tracking: 0.08 });
  const name = outline(sans800, 'Basel Issmail', 92, { x: 62, y: 172, tracking: -0.03 });
  const line1 = outline(sans400, 'I make healthcare systems talk to each other,', 30, { x: 64, y: 228, tracking: -0.005 });
  const line2 = outline(sans400, 'and explain themselves when they don’t.', 30, { x: 64, y: 266, tracking: -0.005 });

  const labels = beats.map((b, i) => {
    const year = outline(mono700, b.year, 17, { x: b.x, y: 424, anchor: 'middle', tracking: 0.04 });
    const label = outline(mono500, b.label, 16, { x: b.x, y: 450, anchor: 'middle' });
    const delay = (0.35 + (b.x / W) * 2.4).toFixed(2);
    return `<g class="lbl" style="animation-delay:${delay}s"><path class="${b.now ? 'pass' : 'ink'}" d="${year.d}"/><path class="${b.now ? 'pass' : 'muted'}" d="${label.d}"/></g>`;
  });

  const panel = vitals.map((v, i) => {
    const y = 74 + i * 70;
    const label = outline(mono500, v.label, 13, { x: 948, y, tracking: 0.1 });
    const value = outline(mono700, v.value, 36, { x: 946, y: y + 38 });
    const unit = v.unit ? outline(mono500, v.unit, 15, { x: 946 + value.width + 10, y: y + 38 }) : { d: '' };
    return `<path class="muted" d="${label.d}"/><path class="pass" d="${value.d}"/><path class="muted" d="${unit.d}"/>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t">
<title id="t">Basel Issmail. Tech lead at Kepler: SMART on FHIR, serverless AWS. I make healthcare systems talk to each other, and explain themselves when they don't. 10 years shipping, 8 EHR vendors integrated, 100+ cities mapped in 3D. Career as a heartbeat: 2016 Shamra search, 2017 Maids.cc ERP, 2021 PLATEAU 3D cities, 2023 Kepler EMRAY, 2026 smart-doctor.</title>
<style>
.ink{fill:${t.ink}}.rule{stroke:${t.gridStrong};stroke-width:1.5}.muted{fill:${t.muted}}.pass{fill:${t.pass}}
.trace{fill:none;stroke:${t.pass};stroke-width:3;stroke-linejoin:round;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:1;animation:draw 2.8s cubic-bezier(.45,.05,.35,1) .3s forwards}
.future{fill:none;stroke:${t.soft};stroke-width:2.5;stroke-dasharray:2 9;stroke-linecap:round;opacity:0;animation:fade .6s ease 3s forwards}
.lbl{opacity:0;animation:fade .5s ease forwards}
.ring{fill:none;stroke:${t.pass};stroke-width:2;transform-box:fill-box;transform-origin:center;opacity:0;animation:ring 2.2s ease-out 3.1s infinite}
.dot{fill:${t.pass};opacity:0;animation:fade .3s ease 3.05s forwards}
.blink{animation:blink 1.6s steps(1) infinite}
@keyframes draw{to{stroke-dashoffset:0}}
@keyframes fade{to{opacity:1}}
@keyframes ring{0%{opacity:.7;transform:scale(.4)}80%,100%{opacity:0;transform:scale(2.6)}}
@keyframes blink{50%{opacity:.25}}
@media (prefers-reduced-motion:reduce){.trace{stroke-dashoffset:0;animation:none}.future,.lbl,.dot{opacity:1;animation:none}.ring,.blink{animation:none}}
</style>
<defs>
<pattern id="minor" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="${t.grid}" stroke-width="1"/></pattern>
<pattern id="major" width="100" height="100" patternUnits="userSpaceOnUse"><rect width="100" height="100" fill="url(#minor)"/><path d="M100 0H0V100" fill="none" stroke="${t.gridStrong}" stroke-width="1"/></pattern>
</defs>
<rect width="${W}" height="${H}" fill="${t.paper}"/>
<rect width="${W}" height="${H}" fill="url(#major)"/>
<circle class="pass blink" cx="73" cy="74" r="6"/>
<path class="muted" d="${kicker.d}"/>
<path class="ink" d="${name.d}"/>
<path class="muted" d="${line1.d}"/>
<path class="muted" d="${line2.d}"/>
<path class="rule" d="M920 52V250"/>
${panel.join('\n')}
<path class="trace" pathLength="1" d="${trace()}"/>
<path class="future" d="M${last.x + 100} ${BASE}H${W}"/>
<circle class="dot" cx="${last.x + 92}" cy="${BASE}" r="6"/>
<circle class="ring" cx="${last.x + 92}" cy="${BASE}" r="8"/>
${labels.join('\n')}
</svg>
`;
}

for (const [mode, t] of Object.entries(themes)) {
  const file = path.join(ROOT, 'assets', `header-${mode}.svg`);
  await writeFile(file, svg(t));
  console.log(path.relative(ROOT, file));
}
