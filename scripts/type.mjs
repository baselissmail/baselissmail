// Shared by the SVG generators: Atkinson Hyperlegible (OFL) loaded from @fontsource, and text turned
// into outlines, because an SVG shown through <img> on GitHub can't load web fonts.

import { createRequire } from 'node:module';
import opentype from 'opentype.js';

const require = createRequire(import.meta.url);
const load = (pkg, weight) =>
  opentype.loadSync(require.resolve(`@fontsource/atkinson-hyperlegible-${pkg}/files/atkinson-hyperlegible-${pkg}-latin-${weight}-normal.woff`));

export const sans800 = load('next', 800);
export const sans400 = load('next', 400);
export const mono500 = load('mono', 500);
export const mono700 = load('mono', 700);

/** Outline `text` with optional tracking (in em). Returns { d, width }. */
export function outline(f, text, size, { x = 0, y = 0, tracking = 0, anchor = 'start' } = {}) {
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
