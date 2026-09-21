// Generates realistic Persian (RTL) screenshot-style artwork for the portfolio
// projects. Output: assets/img/projects/p*.svg (1280x800, real Persian text).
// Run: node scripts/generate-project-shots.cjs
const fs = require('node:fs');
const path = require('node:path');

const OUT = path.join(__dirname, '..', 'assets', 'img', 'projects');
const W = 1280, H = 800;

const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const F = 'Vazirmatn,Tahoma,Arial,sans-serif';
const FM = "Consolas,'Courier New',monospace";

function T(x, y, s, o = {}) {
  const { size = 16, fill = '#e8eefc', anchor = 'end', weight = 400, opacity = 1, ff = F } = o;
  return `<text x="${x}" y="${y}" font-family="${ff}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" opacity="${opacity}">${esc(s)}</text>`;
}
function R(x, y, w, h, rx, fill, o = {}) {
  const { stroke = '', sw = 1, opacity = 1, dash = '' } = o;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" opacity="${opacity}"` +
    (stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : '') + (dash ? ` stroke-dasharray="${dash}"` : '') + '/>';
}
function C(cx, cy, r, fill, o = {}) {
  const { stroke = '', sw = 1, opacity = 1 } = o;
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" opacity="${opacity}"` +
    (stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : '') + '/>';
}
function LN(x1, y1, x2, y2, stroke, w, o = {}) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${w}" opacity="${o.opacity ?? 1}" stroke-linecap="round"/>`;
}
function tri(cx, y, s, up, color) {
  return up
    ? `<polygon points="${cx - s},${y} ${cx + s},${y} ${cx},${y - s * 1.4}" fill="${color}"/>`
    : `<polygon points="${cx - s},${y - s * 1.4} ${cx + s},${y - s * 1.4} ${cx},${y}" fill="${color}"/>`;
}
// rough text width estimator (Persian / Latin / emoji aware)
function tw(s, size) {
  let u = 0;
  for (const ch of String(s)) {
    if (/\p{Emoji}/u.test(ch) && ch.codePointAt(0) > 255) u += 1.35;
    else if (/[\u0600-\u06FF]/.test(ch)) u += 0.62;
    else if (ch === ' ') u += 0.32;
    else u += 0.56;
  }
  return u * size;
}

// ---------- palettes ----------
const D = { // dark admin UI
  bg: '#0b1220', bg2: '#0f172a', card: '#141d31', card2: '#1a2440', input: '#0d1526',
  border: '#26334f', hair: '#1f2a45', text: '#e9eefb', mut: '#8fa0c2', dim: '#5f6f92',
  pri: '#6366f1', priSoft: 'rgba(99,102,241,.16)', grn: '#10b981', grnSoft: 'rgba(16,185,129,.14)',
  amb: '#f59e0b', ambSoft: 'rgba(245,158,11,.14)', red: '#f87171', redSoft: 'rgba(248,113,113,.14)',
  cyn: '#06b6d4', vio: '#8b5cf6', bar: '#2b3a5e'
};
const L = { // light site UI
  bg: '#edf1f8', bg2: '#f6f8fc', card: '#ffffff', card2: '#f1f4fa', input: '#f1f4fa',
  border: '#dde4f0', hair: '#e8edf6', text: '#17233e', mut: '#5b6b8c', dim: '#93a1bd',
  pri: '#4f46e5', priSoft: 'rgba(79,70,229,.10)', grn: '#059669', grnSoft: 'rgba(5,150,105,.12)',
  amb: '#d97706', ambSoft: 'rgba(217,119,6,.12)', red: '#dc2626', redSoft: 'rgba(220,38,38,.10)',
  cyn: '#0891b2', vio: '#7c3aed', bar: '#e2e8f2'
};

// ---------- shared components ----------
function browserChrome(p, url, tab) {
  let s = R(0, 0, W, 66, 0, p.card) + LN(0, 66, W, 66, p.border, 1);
  s += C(30, 33, 7, '#f87171') + C(54, 33, 7, '#fbbf24') + C(78, 33, 7, '#34d399');
  s += R(360, 14, 560, 38, 19, p.input, { stroke: p.border });
  s += C(396, 33, 8, p.grn, { opacity: .9 }) + T(396, 37.5, '✓', { size: 11, fill: '#fff', anchor: 'middle', weight: 700 });
  s += T(656, 40, url, { size: 14.5, fill: p.mut, anchor: 'middle', ff: FM });
  s += R(W - 24 - 168, 14, 168, 38, 10, p.bg2, { stroke: p.border });
  s += T(W - 40, 40, tab, { size: 13.5, fill: p.mut });
  return s;
}
function glowDefs(key, c1, c2) {
  return `<radialGradient id="g${key}" cx=".5" cy="0" r="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient>`;
}
function pageBg(key, p) {
  return `<rect width="${W}" height="${H}" fill="url(#g${key})"/>` +
    `<ellipse cx="640" cy="-140" rx="620" ry="260" fill="#ffffff" opacity="${p === D ? '.05' : '.5'}"/>`;
}
function brandMark(x, y, s, label, p) {
  let r = `<defs><linearGradient id="bm${x}${y}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#06b6d4"/></linearGradient></defs>`;
  r += R(x - s, y, s, s, s * .28, `url(#bm${x}${y})`);
  r += T(x - s / 2, y + s * .72, '</>', { size: s * .4, fill: '#fff', anchor: 'middle', weight: 700, ff: FM });
  r += T(x - s - 12, y + s * .68, label, { size: 19, fill: p.text, weight: 800 });
  return r;
}
function btn(xRight, y, w, h, label, p, primary = true, size = 14.5) {
  const g = primary ? `<defs><linearGradient id="bt${xRight}${y}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs>` : '';
  return g + R(xRight - w, y, w, h, h / 2, primary ? `url(#bt${xRight}${y})` : 'none', primary ? {} : { stroke: p.border, sw: 1.5 }) +
    T(xRight - w / 2, y + h / 2 + size * .36, label, { size, fill: primary ? '#fff' : p.text, anchor: 'middle', weight: 700 });
}
function pill(cx, y, label, bg, fg, size = 12.5, h = 26) {
  const w = Math.max(56, tw(label, size) + 30);
  return R(cx - w / 2, y, w, h, h / 2, bg) + T(cx, y + h / 2 + size * .36, label, { size, fill: fg, anchor: 'middle', weight: 700 });
}
function sideBar(p, x, y, w, h, title, items) {
  let s = R(x, y, w, h, 16, p.card, { stroke: p.border });
  s += T(x + w - 20, y + 36, title, { size: 16, fill: p.text, weight: 800 });
  let ry = y + 58;
  items.forEach(it => {
    if (it.active) {
      s += R(x + 12, ry, w - 24, 42, 10, p.priSoft);
      s += R(x + w - 18, ry + 9, 4, 24, 2, p.pri);
    }
    s += R(x + w - 52, ry + 8, 26, 26, 8, it.active ? p.pri : p.bar);
    s += T(x + w - 39, ry + 27, it.t.slice(0, 1), { size: 13, fill: it.active ? '#fff' : p.mut, anchor: 'middle', weight: 700 });
    s += T(x + w - 62, ry + 28, it.t, { size: 14, fill: it.active ? p.text : p.mut, weight: it.active ? 700 : 400 });
    if (it.badge) {
      const bw = tw(it.badge, 12) + 20;
      s += R(x + 18, ry + 10, bw, 22, 11, p.priSoft) + T(x + 18 + bw / 2, ry + 26, it.badge, { size: 12, fill: p.pri, anchor: 'middle', weight: 700 });
    }
    ry += 46;
  });
  return s;
}
function searchBox(p, x, y, w, ph) {
  return R(x, y, w, 40, 12, p.input, { stroke: p.border }) +
    T(x + w - 16, y + 26, ph, { size: 13.5, fill: p.dim }) +
    C(x + 26, y + 20, 7, 'none', { stroke: p.dim, sw: 2 }) + LN(x + 31, y + 25, x + 38, y + 32, p.dim, 2);
}
function kpi(p, x, y, w, h, label, value, delta, up, vsize = 27) {
  let s = R(x, y, w, h, 16, p.card, { stroke: p.border });
  s += T(x + w - 20, y + 32, label, { size: 13.5, fill: p.mut });
  s += T(x + w - 20, y + 66, value, { size: vsize, fill: p.text, weight: 800 });
  const dc = up ? p.grn : p.red;
  s += tri(x + w - 30, y + h - 18, 6, up, dc);
  s += T(x + w - 44, y + h - 12, delta, { size: 12.5, fill: dc, weight: 700 });
  return s;
}
function panel(p, x, y, w, h, title, action = '') {
  let s = R(x, y, w, h, 16, p.card, { stroke: p.border });
  s += T(x + w - 20, y + 34, title, { size: 16, fill: p.text, weight: 800 });
  if (action) s += T(x + 20, y + 32, action, { size: 13, fill: p.pri, anchor: 'start', weight: 700 });
  s += LN(x + 20, y + 50, x + w - 20, y + 50, p.hair, 1);
  return s;
}
function avatar(cx, cy, r, ch, bg, fg = '#fff') {
  return C(cx, cy, r, bg) + T(cx, cy + r * .42, ch, { size: r * .95, fill: fg, anchor: 'middle', weight: 700 });
}
// RTL line/area chart: first value at RIGHT (newest at LEFT like Persian dashboards).
function lineArea(id, x, y, w, h, vals, color, o = {}) {
  const n = vals.length;
  const px = i => x + w - (i / (n - 1)) * w;
  const py = v => y + h - v * h;
  let d = `M ${px(0).toFixed(1)} ${py(vals[0]).toFixed(1)}`;
  for (let i = 1; i < n; i++) {
    const x0 = px(i - 1), y0 = py(vals[i - 1]), x1 = px(i), y1 = py(vals[i]);
    const mx = (x0 + x1) / 2;
    d += ` C ${mx.toFixed(1)} ${y0.toFixed(1)} ${mx.toFixed(1)} ${y1.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  }
  const area = `${d} L ${px(n - 1).toFixed(1)} ${(y + h).toFixed(1)} L ${px(0).toFixed(1)} ${(y + h).toFixed(1)} Z`;
  let s = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".4"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>`;
  s += `<path d="${area}" fill="url(#${id})"/>`;
  if (o.grid !== false) for (let g = 1; g <= 3; g++) s += LN(x, y + (h / 4) * g, x + w, y + (h / 4) * g, o.gridColor || '#26334f', 1, { opacity: .7 });
  s += `<path d="${d}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"/>`;
  if (o.dot) s += C(px(n - 1), py(vals[n - 1]), 5, '#fff', { stroke: color, sw: 3 });
  return s;
}
function vbars(x, y, w, h, vals, color, o = {}) {
  const n = vals.length, gap = o.gap ?? 9, bw = (w - gap * (n - 1)) / n;
  return vals.map((v, i) => {
    const bh = Math.max(8, v * h), slot = bw + gap;
    const bx = x + w - (i + 1) * slot + gap, by = y + h - bh;
    return R(bx.toFixed(1), by.toFixed(1), bw.toFixed(1), bh.toFixed(1), Math.min(6, bw / 3), color, { opacity: o.op ?? (v > .8 ? 1 : .82) });
  }).join('');
}
function hbar(x, y, w, h, v, color, track) {
  if (v <= 0.01) return R(x, y, w, h, h / 2, track);
  return R(x, y, w, h, h / 2, track) + R(x + w - w * v, y, Math.max(h, w * v), h, h / 2, color);
}
function donut(cx, cy, r, th, segs) {
  let a0 = -Math.PI / 2, out = '';
  const R2 = r - th / 2;
  segs.forEach(s => {
    const a1 = a0 + s.v * Math.PI * 2, large = (a1 - a0) > Math.PI ? 1 : 0;
    const x0 = cx + R2 * Math.cos(a0), y0 = cy + R2 * Math.sin(a0);
    const x1 = cx + R2 * Math.cos(a1), y1 = cy + R2 * Math.sin(a1);
    out += `<path d="M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${R2} ${R2} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}" fill="none" stroke="${s.c}" stroke-width="${th}"/>`;
    a0 = a1;
  });
  return out;
}
function legend(p, x, y, items, size = 13) { // x = right edge
  let s = '', yy = y;
  items.forEach(it => {
    s += R(x - 14, yy, 14, 14, 4, it.c);
    s += T(x - 24, yy + 13, it.t, { size, fill: p.mut });
    s += T(x - 30 - tw(it.t, size), yy + 13, it.v, { size, fill: p.text, weight: 700 });
    yy += 30;
  });
  return s;
}
// RTL table. cols from RIGHT: [{w, a}]. cells: string | {t,c,b} | {pill:[t,bg,fg]} | {bar:[v,color,pct]} | {dot:[t,color]} | {ltr}
function table(p, x, y, w, cols, header, rows, o = {}) {
  const rowH = o.rowH ?? 46, headH = 38;
  let s = '';
  const colX = []; let cx = x + w;
  cols.forEach(c => { cx -= c.w; colX.push(cx); });
  const cellX = (i, a) => a === 'start' ? colX[i] + 12 : a === 'middle' ? colX[i] + cols[i].w / 2 : colX[i] + cols[i].w - 12;
  header.forEach((h, i) => { s += T(cellX(i, cols[i].a || 'end'), y + 25, h, { size: 12.5, fill: p.dim, weight: 700, anchor: cols[i].a || 'end' }); });
  s += LN(x, y + headH, x + w, y + headH, p.hair, 1);
  rows.forEach((row, r) => {
    const ry = y + headH + r * rowH;
    row.forEach((cell, i) => {
      const a = cols[i].a || 'end', tx = cellX(i, a), ty = ry + rowH / 2 + 5.5;
      if (cell && typeof cell === 'object' && cell.pill) {
        const [t, bg, fg] = cell.pill, pw = tw(t, 12) + 26;
        const px0 = a === 'middle' ? tx - pw / 2 : a === 'start' ? tx : tx - pw;
        s += R(px0, ry + rowH / 2 - 12, pw, 24, 12, bg) + T(px0 + pw / 2, ry + rowH / 2 + 4.5, t, { size: 12, fill: fg, anchor: 'middle', weight: 700 });
      } else if (cell && typeof cell === 'object' && cell.bar) {
        const [v, color, pct] = cell.bar;
        s += R(tx - 118, ry + rowH / 2 - 4, 88, 8, 4, p.bar);
        if (v > 0.01) s += R(tx - 118 + 88 - 88 * v, ry + rowH / 2 - 4, Math.max(8, 88 * v), 8, 4, color);
        s += T(tx - 126, ty, pct, { size: 12, fill: p.mut });
      } else if (cell && typeof cell === 'object' && cell.dot) {
        const [t, color] = cell.dot;
        s += C(tx - tw(t, 13.5) - 14, ry + rowH / 2, 5, color) + T(tx, ty, t, { size: 13.5, fill: p.text });
      } else if (cell && typeof cell === 'object' && cell.ltr) {
        s += T(cols[i].a === 'start' ? colX[i] + 12 : tx, ty, cell.ltr, { size: 13, fill: p.mut, anchor: cols[i].a || 'end', ff: FM });
      } else if (cell && typeof cell === 'object') {
        s += T(tx, ty, cell.t, { size: 13.5, fill: cell.c || p.text, anchor: a, weight: cell.b ? 700 : 400 });
      } else {
        s += T(tx, ty, cell, { size: 13.5, fill: p.text, anchor: a });
      }
    });
    if (r < rows.length - 1) s += LN(x, ry + rowH, x + w, ry + rowH, p.hair, 1, { opacity: .7 });
  });
  return { svg: s, h: headH + rows.length * rowH };
}
function toggle(p, x, y, on) {
  return R(x, y, 46, 26, 13, on ? p.grn : p.bar) + C(x + (on ? 33 : 13), y + 13, 9, '#fff');
}
function phoneShell(key, x, y, w, h, screen, o = {}) {
  let s = R(x - 8, y - 8, w + 16, h + 16, 54, '#04060c', { stroke: '#33415f', sw: 2 });
  s += `<clipPath id="pc${key}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="44"/></clipPath>`;
  s += `<g clip-path="url(#pc${key})">` + R(x, y, w, h, 44, screen) + o.body + `</g>`;
  s += R(x + w / 2 - 52, y + 14, 104, 26, 13, '#04060c');
  s += T(x + 30, y + 36, '۹:۴۱', { size: 14, fill: '#fff', anchor: 'start', weight: 700 });
  s += R(x + w - 66, y + 22, 4, 8, 1, '#fff') + R(x + w - 60, y + 20, 4, 10, 1, '#fff') +
    R(x + w - 54, y + 18, 4, 12, 1, '#fff') + R(x + w - 48, y + 16, 4, 14, 1, '#fff', { opacity: .4 });
  s += R(x + w - 40, y + 20, 22, 11, 3, 'none', { stroke: '#fff', sw: 1.5 }) + R(x + w - 38, y + 22, 14, 7, 2, '#34d399');
  s += R(x + w / 2 - 55, y + h - 12, 110, 5, 3, 'rgba(255,255,255,.5)');
  return s;
}
function svgDoc(key, title, defs, body) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800" role="img" aria-label="${esc(title)}">` +
    `<title>${esc(title)}</title><defs>${defs}</defs>${body}</svg>\n`;
}

// =====================================================================
const shots = [];
function add(file, title, make) { shots.push({ file, title, make }); }

// ---------------- P1: bilingual shop bot ----------------
add('p1-bot-1.svg', 'ربات فروشگاهی تلگرام - گفت‌وگو', (key) => {
  const defs = glowDefs(key, '#2b1650', '#0b0620') +
    `<linearGradient id="nb${key}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a855f7"/><stop offset="1" stop-color="#6366f1"/></linearGradient>`;
  let b = `<rect width="1280" height="800" fill="url(#g${key})"/>`;
  b += R(1010, 60, 14, 680, 7, '#a855f7', { opacity: .8 }) + R(1032, 60, 40, 680, 20, '#a855f7', { opacity: .18 });
  b += `<ellipse cx="220" cy="700" rx="330" ry="200" fill="#6366f1" opacity=".22"/>`;
  const px = 460, pw = 360, py = 50, ph = 700;
  let s = '';
  s += R(px, py, pw, 76, 0, '#151b2e');
  s += T(px + 40, py + 46, '‹', { size: 30, fill: '#8fa0c2', anchor: 'start' });
  s += avatar(px + pw - 52, py + 44, 20, 'ف', '#8b5cf6');
  s += T(px + pw - 82, py + 38, 'فروشگاه من', { size: 17, fill: '#fff', weight: 800 });
  s += T(px + pw - 82, py + 58, 'bot', { size: 12.5, fill: '#8fa0c2' });
  const right = px + pw - 24; // user bubbles right edge
  const u = (t, yy) => {
    const tww = tw(t, 13.5), wdt = tww + 108;
    return R(right - wdt, yy, wdt, 36, 16, '#7c5cf0') +
      T(right - 12, yy + 24, t, { size: 13.5, fill: '#fff' }) +
      T(right - 24 - tww, yy + 25, '۰۹:۴۱ ✓✓', { size: 9.5, fill: '#cdc4ff' });
  };
  const bot = (t, yy, h = 40) => {
    const bw = 300;
    return R(px + 24, yy, bw, h, 16, '#1f2942') +
      T(px + 24 + bw - 16, yy + 26, t, { size: 13, fill: '#e9eefb' }) +
      T(px + 40, yy + h - 10, '۰۹:۴۱', { size: 10, fill: '#5f6f92', anchor: 'start' });
  };
  let yy = py + 92;
  s += u('/start', yy); yy += 46;
  s += bot('👋 به فروشگاه ما خوش آمدید!', yy); yy += 48;
  s += bot('لطفا یک دسته‌بندی انتخاب کنید:', yy); yy += 50;
  ['🔥 پرفروش‌ترین‌ها', '🧴 محصولات مراقبت پوست', '💄 محصولات آرایشی', '📱 لوازم جانبی موبایل'].forEach(t => {
    s += R(px + 24, yy, pw - 48, 36, 10, '#232f4d') + T(px + pw / 2, yy + 24, t, { size: 13, fill: '#dbe3f5', anchor: 'middle' });
    yy += 41;
  });
  s += u('🔥 پرفروش‌ترین‌ها', yy); yy += 46;
  s += bot('محبوب‌ترین محصولات ما:', yy, 36); yy += 44;
  const cards = [['عطر زنانه لاوی', '۱٬۲۵۰٬۰۰۰'], ['ساعت هوشمند X7', '۲٬۸۵۰٬۰۰۰'], ['سرم ویتامین C', '۶۸۰٬۰۰۰']];
  const cw = (pw - 48 - 16) / 3;
  cards.forEach((c, i) => {
    const cx0 = px + 24 + (2 - i) * (cw + 8);
    s += R(cx0, yy, cw, 96, 12, '#232f4d');
    s += R(cx0 + 8, yy + 8, cw - 16, 40, 8, `url(#nb${key})`, { opacity: .85 });
    s += C(cx0 + cw / 2, yy + 28, 11, 'rgba(255,255,255,.85)');
    s += T(cx0 + cw / 2, yy + 66, c[0], { size: 10.5, fill: '#e9eefb', anchor: 'middle', weight: 700 });
    s += T(cx0 + cw / 2, yy + 82, c[1], { size: 10, fill: '#8fa0c2', anchor: 'middle' });
  });
  yy += 104;
  s += R(px + 24, yy, pw - 48, 32, 10, '#7c5cf0') + T(px + pw / 2, yy + 21, '🛒 مشاهده سبد خرید', { size: 13, fill: '#fff', anchor: 'middle', weight: 700 });
  s += R(px, py + ph - 62, pw, 62, 0, '#151b2e');
  s += R(px + 60, py + ph - 48, pw - 120, 36, 18, '#0d1526', { stroke: '#26334f' });
  s += T(px + pw - 76, py + ph - 24, 'Message', { size: 13, fill: '#5f6f92' });
  s += C(px + 34, py + ph - 30, 15, '#7c5cf0') + T(px + 34, py + ph - 24, '≡', { size: 15, fill: '#fff', anchor: 'middle', weight: 700 });
  b += phoneShell(key, px, py, pw, ph, '#101728', { body: s });
  b += T(420, 380, 'ربات فروشگاهی دو زبانه', { size: 30, fill: '#fff', weight: 800 }) +
    T(420, 424, 'فروش، سبد خرید و پرداخت — داخل تلگرام', { size: 16, fill: '#c4b5fd' }) +
    T(420, 462, '✓ فارسی و انگلیسی    ✓ پنل ادمین تحت وب', { size: 14.5, fill: '#8fa0c2' }) +
    T(420, 492, '✓ پرداخت آنلاین و فاکتور خودکار', { size: 14.5, fill: '#8fa0c2' });
  return { defs, body: b };
});

add('p1-bot-2.svg', 'پنل ادمین ربات فروشگاهی', (key) => {
  const p = D;
  const defs = glowDefs(key, '#101a30', '#0b1220');
  let b = pageBg(key, p) + browserChrome(p, 'https://panel.example.com/bot', 'پنل ربات');
  const cy = 92;
  b += sideBar(p, W - 24 - 224, cy, 224, H - cy - 24, 'مدیریت ربات', [
    { t: 'داشبورد', active: true }, { t: 'سفارش‌ها', badge: '۱۲۸' }, { t: 'محصولات' },
    { t: 'دسته‌بندی‌ها' }, { t: 'مشتریان' }, { t: 'کدهای تخفیف' }, { t: 'پرداخت‌ها' }, { t: 'تنظیمات ربات' }, { t: 'گزارش‌ها' }
  ]);
  const cx = 24, cw = W - 24 - 224 - 48;
  b += T(cx + cw, cy + 8, 'داشبورد مدیریت ربات', { size: 24, fill: p.text, weight: 800 });
  b += T(cx + cw, cy + 34, 'نمای کلی فروشگاه تلگرامی شما', { size: 13.5, fill: p.mut });
  b += btn(cx + 150, cy - 2, 150, 38, '＋ سفارش جدید', p, true);
  b += searchBox(p, cx + 168, cy - 2, 250, 'جست‌وجو در سفارش‌ها…');
  const kw = (cw - 36) / 4, ky = cy + 52;
  [
    ['مجموع فروش (تومان)', '۲۵٬۴۳۰٬۰۰۰', 'رشد ۱۲٪', true],
    ['سفارش‌ها', '۱٬۲۴۳', 'رشد ۸٪', true],
    ['مشتریان', '۸۹۲', 'رشد ۵٪', true],
    ['نرخ تبدیل', '۴٫۷٪', 'رشد ۱٪', true]
  ].forEach((k, i) => { b += kpi(p, cx + (3 - i) * (kw + 12), ky, kw, 108, k[0], k[1], k[2], k[3], 24); });
  const chartY = ky + 128, chartH = 218;
  b += panel(p, cx, chartY, cw * .62, chartH, 'نمودار فروش', '۳۰ روز گذشته');
  b += lineArea(`a${key}`, cx + 30, chartY + 66, cw * .62 - 120, chartH - 130, [.2, .3, .26, .42, .38, .55, .5, .66, .6, .78, .72, .88], p.pri, { dot: true, gridColor: p.hair });
  ['۱۰ م', '۲۰ م', '۳۰ م', '۴۰ م'].forEach((t, i) => { b += T(cx + 52, chartY + 66 + (chartH - 130) - i * ((chartH - 130) / 3), t, { size: 11, fill: p.dim }); });
  ['خرداد', 'اردیبهشت', 'فروردین'].forEach((t, i) => { b += T(cx + cw * .62 - 90 - i * ((cw * .62 - 190) / 2), chartY + chartH - 14, t, { size: 11.5, fill: p.dim, anchor: 'middle' }); });
  b += panel(p, cx + cw * .62 + 16, chartY, cw * .38 - 16, chartH, 'پرفروش‌ترین‌ها', 'همه');
  const tops = [['هدفون بی‌سیم', '۴٬۳۲۰٬۰۰۰', '۳۲۰ فروش', '#6366f1'], ['ساعت هوشمند', '۳٬۸۷۰٬۰۰۰', '۲۸۰ فروش', '#8b5cf6'], ['موس گیمینگ', '۲٬۹۸۰٬۰۰۰', '۲۱۰ فروش', '#06b6d4'], ['کیبورد مکانیکال', '۲٬۴۵۰٬۰۰۰', '۱۸۵ فروش', '#10b981']];
  let ty = chartY + 66;
  const tx = cx + cw * .62 + 16, tw = cw * .38 - 16;
  tops.forEach(t => {
    b += R(tx + tw - 64, ty, 44, 44, 10, t[3], { opacity: .85 });
    b += T(tx + tw - 76, ty + 20, t[0], { size: 13.5, fill: p.text, weight: 700 });
    b += T(tx + tw - 76, ty + 38, t[2], { size: 11.5, fill: p.dim });
    b += T(tx + 20, ty + 27, t[1], { size: 12.5, fill: p.mut, anchor: 'start', weight: 700 });
    ty += 52;
  });
  const ordY = chartY + chartH + 16, ordH = H - ordY - 24;
  b += panel(p, cx, ordY, cw, ordH, 'سفارش‌های اخیر', 'مشاهده همه');
  const t = table(p, cx + 20, ordY + 54, cw - 40,
    [{ w: 110 }, { w: 170 }, { w: 220 }, { w: 150 }, { w: 130 }, { w: 130 }],
    ['شماره', 'مشتری', 'محصول', 'مبلغ', 'وضعیت', 'تاریخ'],
    [
      ['۱۲۵۸#', 'سارا محمدی', 'هدفون بی‌سیم', '۱٬۲۹۰٬۰۰۰', { pill: ['تکمیل شد', p.grnSoft, p.grn] }, '۳۰ خرداد'],
      ['۱۲۵۷#', 'علی رضایی', 'ساعت هوشمند', '۲٬۸۵۰٬۰۰۰', { pill: ['در انتظار', p.ambSoft, p.amb] }, '۳۰ خرداد'],
      ['۱۲۵۶#', 'مریم کریمی', 'موس گیمینگ', '۴۹۰٬۰۰۰', { pill: ['تکمیل شد', p.grnSoft, p.grn] }, '۲۹ خرداد'],
      ['۱۲۵۵#', 'رضا احمدی', 'کیبورد مکانیکال', '۱٬۷۹۰٬۰۰۰', { pill: ['لغو شد', p.redSoft, p.red] }, '۲۹ خرداد']
    ], { rowH: 42 });
  b += t.svg;
  return { defs, body: b };
});

add('p1-bot-3.svg', 'مدیریت محصولات ربات', (key) => {
  const p = D;
  const defs = glowDefs(key, '#101a30', '#0b1220');
  let b = pageBg(key, p) + browserChrome(p, 'https://panel.example.com/bot/products', 'محصولات');
  const cy = 92;
  b += sideBar(p, W - 24 - 224, cy, 224, H - cy - 24, 'مدیریت ربات', [
    { t: 'داشبورد' }, { t: 'سفارش‌ها', badge: '۱۲۸' }, { t: 'محصولات', active: true },
    { t: 'دسته‌بندی‌ها' }, { t: 'مشتریان' }, { t: 'کدهای تخفیف' }, { t: 'پرداخت‌ها' }, { t: 'تنظیمات ربات' }
  ]);
  const cx = 24, cw = W - 24 - 224 - 48;
  b += T(cx + cw, cy + 8, 'مدیریت محصولات', { size: 24, fill: p.text, weight: 800 });
  b += T(cx + cw, cy + 34, '۸ محصول در ۳ دسته‌بندی', { size: 13.5, fill: p.mut });
  b += btn(cx + 170, cy - 2, 170, 38, '＋ افزودن محصول', p, true);
  ['همه', 'موجود', 'ناموجود', 'پرفروش'].forEach((f, i) => {
    const fx = cx + cw - 20 - i * 108;
    b += R(fx - 96, cy + 52, 96, 34, 17, i === 0 ? p.pri : 'none', i === 0 ? {} : { stroke: p.border, sw: 1.5 });
    b += T(fx - 48, cy + 75, f, { size: 13, fill: i === 0 ? '#fff' : p.mut, anchor: 'middle', weight: 700 });
  });
  b += searchBox(p, cx, cy + 52, 300, 'جست‌وجوی محصول…');
  const pty = cy + 104, pth = H - pty - 24;
  b += panel(p, cx, pty, cw, pth, 'لیست محصولات', '۸ محصول');
  const cols = [{ w: 250 }, { w: 170 }, { w: 150 }, { w: 120 }, { w: 120 }, { w: 120 }];
  const t = table(p, cx + 20, pty + 54, cw - 40, cols,
    ['محصول', 'دسته', 'قیمت (تومان)', 'موجودی', 'وضعیت', 'عملیات'],
    [
      [{ t: 'هدفون بی‌سیم پرو', b: true }, 'صوتی', '۱٬۲۹۰٬۰۰۰', '۴۵', { pill: ['موجود', p.grnSoft, p.grn] }, { t: 'ویرایش', c: p.pri }],
      [{ t: 'ساعت هوشمند X7', b: true }, 'پوشیدنی', '۲٬۸۵۰٬۰۰۰', '۱۲', { pill: ['موجود', p.grnSoft, p.grn] }, { t: 'ویرایش', c: p.pri }],
      [{ t: 'عطر زنانه لاوی', b: true }, 'آرایشی', '۱٬۲۵۰٬۰۰۰', '۰', { pill: ['ناموجود', p.redSoft, p.red] }, { t: 'ویرایش', c: p.pri }],
      [{ t: 'سرم ویتامین C', b: true }, 'مراقبت پوست', '۶۸۰٬۰۰۰', '۶۷', { pill: ['موجود', p.grnSoft, p.grn] }, { t: 'ویرایش', c: p.pri }],
      [{ t: 'موس گیمینگ RGB', b: true }, 'جانبی موبایل', '۴۹۰٬۰۰۰', '۲۳', { pill: ['موجود', p.grnSoft, p.grn] }, { t: 'ویرایش', c: p.pri }],
      [{ t: 'شارژر فندکی ۳۸W', b: true }, 'جانبی موبایل', '۳۲۰٬۰۰۰', '۰', { pill: ['ناموجود', p.redSoft, p.red] }, { t: 'ویرایش', c: p.pri }],
      [{ t: 'کرم آبرسان پوست', b: true }, 'مراقبت پوست', '۴۵۰٬۰۰۰', '۳۱', { pill: ['موجود', p.grnSoft, p.grn] }, { t: 'ویرایش', c: p.pri }]
    ], { rowH: 47 });
  b += t.svg;
  return { defs, body: b };
});

// ---------------- P2: corporate site (LIGHT) ----------------
function corpNav(p, active) {
  let s = R(0, 66, W, 64, 0, p.card) + LN(0, 130, W, 130, p.border, 1);
  s += brandMark(W - 32, 79, 46, 'هلدینگ آریا', p);
  const links = ['خانه', 'خدمات', 'نمونه‌کارها', 'وبلاگ', 'تماس'];
  links.forEach((l, i) => {
    const lx = W - 280 - i * 110;
    s += T(lx, 106, l, { size: 15, fill: l === active ? p.pri : p.mut, weight: l === active ? 800 : 500 });
    if (l === active) s += R(lx - tw(l, 15) - 8, 114, tw(l, 15) + 8, 4, 2, p.pri);
  });
  s += btn(212, 82, 180, 42, 'مشاوره رایگان', p, true);
  return s;
}
add('p2-corp-1.svg', 'وب‌سایت شرکتی - صفحه اصلی', (key) => {
  const p = L;
  const defs = glowDefs(key, '#ffffff', '#e9eef7') +
    `<linearGradient id="h${key}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4f46e5"/><stop offset="1" stop-color="#06b6d4"/></linearGradient>`;
  let b = pageBg(key, p) + browserChrome(p, 'https://ariaholding.com', 'هلدینگ آریا') + corpNav(p, 'خانه');
  b += pill(W - 150, 168, '✓ بیش از ۱۲ سال تجربه', p.priSoft, p.pri, 13.5);
  b += T(W - 60, 248, 'راهکارهای نوین', { size: 46, fill: p.text, weight: 800 });
  b += T(W - 60, 304, 'کسب‌وکار دیجیتال', { size: 46, fill: p.pri, weight: 800 });
  b += T(W - 60, 352, 'ما به کسب‌وکارها کمک می‌کنیم با طراحی مدرن،', { size: 17, fill: p.mut });
  b += T(W - 60, 380, 'فناوری روز و استراتژی درست رشد کنند.', { size: 17, fill: p.mut });
  b += btn(W - 60, 404, 190, 50, 'شروع همکاری ←', p, true, 15.5);
  b += btn(W - 264, 404, 210, 50, 'مشاهده نمونه‌کارها', p, false, 15.5);
  b += R(70, 170, 520, 330, 24, `url(#h${key})`);
  b += R(110, 220, 200, 120, 16, 'rgba(255,255,255,.92)') + T(280, 258, 'رضایت مشتری', { size: 14, fill: p.mut }) + T(280, 296, '۹۸٪', { size: 32, fill: p.pri, weight: 800 });
  b += R(350, 300, 200, 120, 16, 'rgba(255,255,255,.92)') + T(520, 338, 'پروژه موفق', { size: 14, fill: p.mut }) + T(520, 376, '۲۴۰+', { size: 32, fill: p.pri, weight: 800 });
  b += C(430, 210, 26, 'rgba(255,255,255,.9)') + T(430, 219, '✓', { size: 22, fill: p.grn, anchor: 'middle', weight: 800 });
  b += R(70, 530, 1140, 110, 20, p.card, { stroke: p.border });
  const stats = [['۲۴۰+', 'پروژه موفق'], ['۹۸٪', 'رضایت مشتری'], ['۱۲', 'سال تجربه'], ['۴۰+', 'مشتری فعال']];
  stats.forEach((st, i) => {
    const sx = W - 70 - i * 285 - 142;
    b += T(sx, 578, st[0], { size: 32, fill: p.pri, anchor: 'middle', weight: 800 });
    b += T(sx, 606, st[1], { size: 14.5, fill: p.mut, anchor: 'middle' });
    if (i < 3) b += LN(W - 70 - (i + 1) * 285, 552, W - 70 - (i + 1) * 285, 618, p.border, 1.5);
  });
  b += T(640, 690, 'اعتماد بیش از ۴۰ برند معتبر', { size: 15, fill: p.mut, anchor: 'middle' });
  ['دیجی‌استایل', 'همراه‌کارت', 'فروشگاه مدرن', 'بانک آینده', 'اسنپ‌فود'].forEach((t, i) => {
    b += R(200 + i * 180, 712, 160, 44, 12, p.card, { stroke: p.border }) + T(280 + i * 180, 740, t, { size: 14, fill: p.mut, anchor: 'middle', weight: 700 });
  });
  return { defs, body: b };
});
add('p2-corp-2.svg', 'وب‌سایت شرکتی - خدمات', (key) => {
  const p = L;
  const defs = glowDefs(key, '#ffffff', '#e9eef7');
  let b = pageBg(key, p) + browserChrome(p, 'https://ariaholding.com/services', 'خدمات') + corpNav(p, 'خدمات');
  b += T(640, 190, 'خدمات ما', { size: 34, fill: p.text, anchor: 'middle', weight: 800 });
  b += T(640, 222, 'راهکارهای جامع برای رشد کسب‌وکار شما', { size: 16, fill: p.mut, anchor: 'middle' });
  const svcs = [
    ['طراحی وب‌سایت', 'وب‌سایت‌های مدرن، سریع و سئومحور', '#4f46e5', 'و'],
    ['اپلیکیشن موبایل', 'اپلیکیشن‌های اندروید و iOS', '#0891b2', 'م'],
    ['سئو و مارکتینگ', 'رشد رتبه گوگل و فروش بیشتر', '#059669', 'س'],
    ['هویت بصری', 'لوگو، برندینگ و طراحی گرافیک', '#d97706', 'ه'],
    ['مشاوره IT', 'مشاوره تخصصی تحول دیجیتال', '#7c3aed', 'ش'],
    ['پشتیبانی', 'پشتیبانی ۲۴ ساعته و نگهداری', '#dc2626', 'پ']
  ];
  svcs.forEach((svc, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = W - 90 - (col + 1) * 360, y = 250 + row * 200;
    b += R(x, y, 336, 176, 18, p.card, { stroke: p.border });
    b += R(x + 336 - 66, y + 24, 44, 44, 12, svc[2]) + T(x + 336 - 44, y + 54, svc[3], { size: 20, fill: '#fff', anchor: 'middle', weight: 800 });
    b += T(x + 336 - 80, y + 54, svc[0], { size: 18, fill: p.text, weight: 800 });
    b += T(x + 336 - 24, y + 92, svc[1], { size: 14, fill: p.mut });
    b += T(x + 336 - 24, y + 136, 'بیشتر بدانید ←', { size: 14, fill: p.pri, weight: 700 });
  });
  b += R(240, 668, 800, 90, 18, p.pri);
  b += T(980, 704, 'برای شروع پروژه آماده‌اید؟', { size: 20, fill: '#fff', weight: 800 });
  b += T(980, 730, 'همین امروز با کارشناسان ما صحبت کنید', { size: 14, fill: '#e0e7ff' });
  b += R(270, 690, 170, 46, 23, '#fff') + T(355, 719, 'تماس با ما', { size: 15, fill: p.pri, anchor: 'middle', weight: 800 });
  return { defs, body: b };
});
add('p2-corp-3.svg', 'وب‌سایت شرکتی - تماس', (key) => {
  const p = L;
  const defs = glowDefs(key, '#ffffff', '#e9eef7');
  let b = pageBg(key, p) + browserChrome(p, 'https://ariaholding.com/contact', 'تماس') + corpNav(p, 'تماس');
  b += T(640, 190, 'تماس با ما', { size: 34, fill: p.text, anchor: 'middle', weight: 800 });
  b += T(640, 222, 'پاسخگوی شما در کمتر از ۲۴ ساعت هستیم', { size: 16, fill: p.mut, anchor: 'middle' });
  b += R(660, 250, 480, 420, 20, p.card, { stroke: p.border });
  b += T(1100, 292, 'ارسال پیام', { size: 19, fill: p.text, weight: 800 });
  const fields = [['نام و نام خانوادگی', 'مثلاً سارا محمدی'], ['ایمیل', 'you@mail.com'], ['موضوع', 'مشاوره طراحی سایت']];
  fields.forEach((f, i) => {
    const fy = 312 + i * 78;
    b += T(1100, fy + 16, f[0], { size: 13.5, fill: p.mut });
    b += R(700, fy + 24, 400, 44, 10, p.input, { stroke: p.border }) + T(1084, fy + 52, f[1], { size: 13.5, fill: p.dim });
  });
  b += btn(1100, 560, 400, 48, 'ارسال پیام', p, true, 15.5);
  b += T(1100, 648, '✓ پیام شما با موفقیت ارسال شد', { size: 13.5, fill: p.grn, weight: 700 });
  const infos = [['آدرس', 'تهران، خیابان ولیعصر، مجتمع آریا، واحد ۱۲'], ['تلفن', '۰۲۱-۲۲۳۳۴۴۵۵  (۹ صبح تا ۶ عصر)'], ['ایمیل', 'hello@ariaholding.com']];
  infos.forEach((inf, i) => {
    const iy = 250 + i * 92;
    b += R(140, iy, 480, 76, 16, p.card, { stroke: p.border });
    b += R(556, iy + 18, 40, 40, 12, p.priSoft) + T(576, iy + 45, inf[0].slice(0, 1), { size: 17, fill: p.pri, anchor: 'middle', weight: 800 });
    b += T(540, iy + 34, inf[0], { size: 15, fill: p.text, weight: 800 });
    b += T(540, iy + 58, inf[1], { size: 13.5, fill: p.mut });
  });
  b += R(140, 532, 480, 138, 16, '#dbe7f5', { stroke: p.border });
  b += LN(180, 532, 260, 670, '#fff', 14) + LN(140, 600, 620, 590, '#fff', 10) + LN(420, 532, 460, 670, '#fff', 8);
  b += C(400, 596, 16, p.red) + C(400, 596, 6, '#fff');
  b += R(330, 546, 140, 32, 8, p.card) + T(400, 568, 'دفتر مرکزی', { size: 13, fill: p.text, anchor: 'middle', weight: 700 });
  b += R(0, 700, W, 100, 0, '#17233e');
  b += T(W - 60, 742, '© ۱۴۰۳ هلدینگ آریا — تمامی حقوق محفوظ است', { size: 13.5, fill: '#94a3c8' });
  b += T(240, 742, 'خانه    خدمات    نمونه‌کارها    تماس', { size: 13.5, fill: '#94a3c8', anchor: 'start' });
  return { defs, body: b };
});

// ---------------- P3: VPN panel (dark) ----------------
const vpnSide = ['داشبورد', 'کاربران', 'سرورها', 'کانفیگ‌ها', 'ترافیک', 'تیکت‌ها', 'تنظیمات'];
add('p3-vpn-1.svg', 'پنل VPN - کاربران', (key) => {
  const p = D;
  const defs = glowDefs(key, '#101a30', '#0b1220');
  let b = pageBg(key, p) + browserChrome(p, 'https://vpn.example.com/users', 'کاربران');
  const cy = 92;
  b += sideBar(p, W - 24 - 224, cy, 224, H - cy - 24, 'پنل مدیریت VPN', vpnSide.map(t => t === 'کاربران' ? { t, active: true } : { t }));
  const cx = 24, cw = W - 24 - 224 - 48;
  b += T(cx + cw, cy + 8, 'مدیریت کاربران', { size: 24, fill: p.text, weight: 800 });
  b += btn(cx + 150, cy - 2, 150, 38, '＋ کاربر جدید', p, true);
  b += searchBox(p, cx + 168, cy - 2, 250, 'جست‌وجوی کاربر…');
  const kw = (cw - 36) / 4, ky = cy + 52;
  [['کاربران فعال', '۸۴۶', 'رشد ۶٪', true], ['آنلاین', '۲۱۳', 'رشد ۳٪', true], ['مصرف امروز', '۱٫۲ ترابایت', 'رشد ۹٪', true], ['سرورها', '۱۲', 'پایدار', true]].forEach((k, i) => {
    b += kpi(p, cx + (3 - i) * (kw + 12), ky, kw, 104, k[0], k[1], k[2], k[3], 23);
  });
  const pty = ky + 124, pth = H - pty - 24;
  b += panel(p, cx, pty, cw, pth, 'لیست کاربران', '۸۴۶ کاربر');
  const t = table(p, cx + 20, pty + 54, cw - 40,
    [{ w: 190 }, { w: 130 }, { w: 210 }, { w: 150 }, { w: 130 }, { w: 120 }],
    ['کاربر', 'پروتکل', 'حجم باقی‌مانده', 'انقضا', 'وضعیت', 'عملیات'],
    [
      ['user_1042', { pill: ['VLESS', 'rgba(99,102,241,.2)', '#a5b4fc'] }, { bar: [.72, p.grn, '۷۲٪'] }, '۱۲ روز', { dot: ['فعال', p.grn] }, { t: 'تمدید', c: p.pri }],
      ['user_1043', { pill: ['Trojan', 'rgba(6,182,212,.16)', '#67e8f9'] }, { bar: [.31, p.amb, '۳۱٪'] }, '۵ روز', { dot: ['فعال', p.grn] }, { t: 'تمدید', c: p.pri }],
      ['user_1044', { pill: ['VMess', 'rgba(139,92,246,.18)', '#c4b5fd'] }, { bar: [.08, p.red, '۸٪'] }, '۲ روز', { dot: ['هشدار', p.amb] }, { t: 'تمدید', c: p.pri }],
      ['user_1045', { pill: ['VLESS', 'rgba(99,102,241,.2)', '#a5b4fc'] }, { bar: [.55, p.grn, '۵۵٪'] }, '۲۱ روز', { dot: ['فعال', p.grn] }, { t: 'تمدید', c: p.pri }],
      ['user_1046', { pill: ['Trojan', 'rgba(6,182,212,.16)', '#67e8f9'] }, { bar: [0, p.red, '۰٪'] }, 'منقضی', { dot: ['منقضی', p.red] }, { t: 'تمدید', c: p.pri }],
      ['user_1047', { pill: ['VLESS', 'rgba(99,102,241,.2)', '#a5b4fc'] }, { bar: [.9, p.grn, '۹۰٪'] }, '۳۰ روز', { dot: ['فعال', p.grn] }, { t: 'تمدید', c: p.pri }]
    ], { rowH: 44 });
  b += t.svg;
  return { defs, body: b };
});
add('p3-vpn-2.svg', 'پنل VPN - سرورها', (key) => {
  const p = D;
  const defs = glowDefs(key, '#101a30', '#0b1220');
  let b = pageBg(key, p) + browserChrome(p, 'https://vpn.example.com/servers', 'سرورها');
  const cy = 92;
  b += sideBar(p, W - 24 - 224, cy, 224, H - cy - 24, 'پنل مدیریت VPN', vpnSide.map(t => t === 'سرورها' ? { t, active: true } : { t }));
  const cx = 24, cw = W - 24 - 224 - 48;
  b += T(cx + cw, cy + 8, 'مدیریت سرورها', { size: 24, fill: p.text, weight: 800 });
  b += T(cx + cw, cy + 34, '۱۲ سرور فعال در ۸ کشور', { size: 13.5, fill: p.mut });
  b += btn(cx + 170, cy - 2, 170, 38, '＋ افزودن سرور', p, true);
  const servers = [
    ['آلمان — فرانکفورت', '۹۴.۱۳۰.۲۱.۴۵', '۴۸ms', .62, '۲۴۰ کاربر', true, ['VLESS', 'Trojan']],
    ['هلند — آمستردام', '۸۹.۴۱.۷۷.۱۲', '۵۵ms', .41, '۱۸۶ کاربر', true, ['VLESS', 'VMess']],
    ['فنلاند — هلسینکی', '۹۵.۲۱۷.۳۳.۸', '۶۸ms', .78, '۳۱۲ کاربر', true, ['VLESS']],
    ['ترکیه — استانبول', '۸۸.۲۳۰.۱۱.۹۰', '۳۵ms', .52, '۲۲۸ کاربر', true, ['Trojan', 'VMess']],
    ['امارات — دبی', '۸۶.۹۶.۴.۲۲', '۵۸ms', .24, '۹۴ کاربر', true, ['VLESS']],
    ['فرانسه — پاریس', '۵۱.۷۷.۹.۳۰', '۶۱ms', .0, '۰ کاربر', false, ['—']]
  ];
  servers.forEach((sv, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = cx + (2 - col) * ((cw - 32) / 3 + 16), y = cy + 56 + row * 312, w = (cw - 32) / 3;
    b += R(x, y, w, 296, 16, p.card, { stroke: p.border });
    b += C(x + w - 34, y + 36, 8, sv[5] ? p.grn : p.red);
    b += T(x + w - 52, y + 42, sv[0], { size: 15.5, fill: p.text, weight: 800 });
    b += T(x + w - 24, y + 66, sv[1], { size: 12.5, fill: p.dim, ff: FM });
    b += T(x + w - 24, y + 96, 'پینگ: ' + sv[2], { size: 13, fill: p.mut });
    b += T(x + 24, y + 96, sv[4], { size: 13, fill: p.mut, anchor: 'start' });
    b += T(x + w - 24, y + 124, 'بار سرور', { size: 12.5, fill: p.dim });
    b += hbar(x + 24, y + 134, w - 48, 10, sv[3], sv[3] > .7 ? p.amb : p.pri, p.bar);
    b += T(x + 24, y + 162, Math.round(sv[3] * 100) + '٪', { size: 12.5, fill: p.mut, anchor: 'start' });
    b += T(x + w - 24, y + 196, 'پروتکل‌ها:', { size: 12.5, fill: p.dim });
    let tagx = x + w - 24;
    sv[6].forEach(tg => {
      const twd = tw(tg, 11.5) + 24;
      b += R(tagx - twd, y + 206, twd, 24, 12, p.priSoft) + T(tagx - twd / 2, y + 223, tg, { size: 11.5, fill: '#a5b4fc', anchor: 'middle', ff: FM });
      tagx -= twd + 8;
    });
    b += LN(x + 24, y + 248, x + w - 24, y + 248, p.hair, 1);
    b += T(x + 24, y + 274, sv[5] ? '● آنلاین' : '● آفلاین', { size: 13, fill: sv[5] ? p.grn : p.red, anchor: 'start', weight: 700 });
    b += T(x + w - 24, y + 274, sv[5] ? 'مدیریت ←' : 'راه‌اندازی مجدد ↻', { size: 12.5, fill: p.pri, weight: 700 });
  });
  return { defs, body: b };
});
add('p3-vpn-3.svg', 'پنل VPN - گزارش ترافیک', (key) => {
  const p = D;
  const defs = glowDefs(key, '#101a30', '#0b1220');
  let b = pageBg(key, p) + browserChrome(p, 'https://vpn.example.com/traffic', 'ترافیک');
  const cy = 92;
  b += sideBar(p, W - 24 - 224, cy, 224, H - cy - 24, 'پنل مدیریت VPN', vpnSide.map(t => t === 'ترافیک' ? { t, active: true } : { t }));
  const cx = 24, cw = W - 24 - 224 - 48;
  b += T(cx + cw, cy + 8, 'گزارش ترافیک', { size: 24, fill: p.text, weight: 800 });
  ['امروز', 'هفته', 'ماه'].forEach((f, i) => {
    const fx = cx + (2 - i) * 108;
    b += R(fx, cy - 2, 96, 36, 18, i === 2 ? p.pri : 'none', i === 2 ? {} : { stroke: p.border, sw: 1.5 });
    b += T(fx + 48, cy + 22, f, { size: 13, fill: i === 2 ? '#fff' : p.mut, anchor: 'middle', weight: 700 });
  });
  b += panel(p, cx, cy + 52, cw * .64, 300, 'مصرف ترافیک (گیگابایت)', 'تیر ماه');
  b += lineArea(`a${key}`, cx + 30, cy + 118, cw * .64 - 120, 180, [.3, .42, .38, .55, .5, .68, .6, .75, .82, .7, .9, .95], p.cyn, { dot: true, gridColor: p.hair });
  b += lineArea(`b${key}`, cx + 30, cy + 118, cw * .64 - 120, 180, [.15, .25, .22, .3, .35, .42, .4, .5, .55, .52, .6, .66], p.vio, { grid: false });
  ['تیر', 'خرداد', 'اردیبهشت'].forEach((t, i) => { b += T(cx + cw * .64 - 60 - i * ((cw * .64 - 170) / 2), cy + 336, t, { size: 11.5, fill: p.dim, anchor: 'middle' }); });
  b += panel(p, cx + cw * .64 + 16, cy + 52, cw * .36 - 16, 300, 'سهم پروتکل‌ها', '');
  const dcx = cx + cw * .64 + 16 + (cw * .36 - 16) / 2;
  b += donut(dcx, cy + 180, 74, 26, [{ v: .58, c: p.pri }, { v: .27, c: p.cyn }, { v: .15, c: p.vio }]);
  b += T(dcx, cy + 174, '۵۸٪', { size: 26, fill: p.text, anchor: 'middle', weight: 800 });
  b += T(dcx, cy + 196, 'VLESS', { size: 12.5, fill: p.mut, anchor: 'middle', ff: FM });
  b += legend(p, cx + cw - 24, cy + 262, [{ t: 'VLESS', v: '۵۸٪', c: p.pri }, { t: 'Trojan', v: '۲۷٪', c: p.cyn }, { t: 'VMess', v: '۱۵٪', c: p.vio }], 12);
  const by = cy + 368, bh = H - by - 24;
  b += panel(p, cx, by, cw, bh, 'پرمصرف‌ترین کاربران امروز', '');
  const users = [['user_1044', .95, '۸٫۴ گیگ'], ['user_1021', .78, '۶٫۹ گیگ'], ['user_1077', .64, '۵٫۶ گیگ'], ['user_1009', .5, '۴٫۴ گیگ'], ['user_1055', .38, '۳٫۳ گیگ']];
  users.forEach((u, i) => {
    const ry = by + 66 + i * 40, bw = cw - 340;
    b += T(cx + cw - 24, ry + 16, u[0], { size: 13, fill: p.text, ff: FM });
    b += hbar(cx + 130, ry + 4, bw, 16, u[1], i < 2 ? p.amb : p.pri, p.bar);
    b += T(cx + 116, ry + 17, u[2], { size: 12.5, fill: p.mut });
  });
  return { defs, body: b };
});

// ---------------- P4: analytics dashboard (dark) ----------------
add('p4-dash-1.svg', 'داشبورد تحلیلی - نمای کلی', (key) => {
  const p = D;
  const defs = glowDefs(key, '#101a30', '#0b1220');
  let b = pageBg(key, p) + browserChrome(p, 'https://analytics.example.com/overview', 'نمای کلی');
  const cy = 92;
  b += sideBar(p, W - 24 - 224, cy, 224, H - cy - 24, 'تحلیل کسب‌وکار', [
    { t: 'نمای کلی', active: true }, { t: 'فروش' }, { t: 'بازدیدکنندگان' }, { t: 'محصولات' }, { t: 'گزارش‌ها' }, { t: 'هشدارها', badge: '۳' }, { t: 'تنظیمات' }
  ]);
  const cx = 24, cw = W - 24 - 224 - 48;
  b += T(cx + cw, cy + 8, 'نمای کلی', { size: 24, fill: p.text, weight: 800 });
  b += T(cx + cw, cy + 34, '۱۲ خرداد تا ۱۰ تیر  —  مقایسه با دوره قبل', { size: 13, fill: p.mut });
  b += btn(cx + 170, cy - 2, 170, 38, '＋ افزودن ویجت', p, true);
  const kw = (cw - 45) / 4, ky = cy + 52;
  [['درآمد کل', '۲۵۶٬۸۳۰٬۰۰۰', 'رشد ۱۸٪', true], ['سفارش‌ها', '۱٬۵۴۸', 'رشد ۱۴٪', true], ['مشتریان جدید', '۵۳۲', 'رشد ۱۲٪', true], ['نرخ تبدیل', '۳٫۲۳٪', 'رشد ۶٪', true]].forEach((k, i) => {
    b += kpi(p, cx + (3 - i) * (kw + 15), ky, kw, 106, k[0], k[1], k[2], k[3], 22);
  });
  const my = ky + 126, mh = 250;
  b += panel(p, cx, my, cw * .58, mh, 'فروش در طول زمان', 'روزانه');
  b += lineArea(`a${key}`, cx + 24, my + 66, cw * .58 - 100, mh - 120, [.25, .4, .55, .45, .62, .58, .75, .68, .85, .8, .95], p.pri, { dot: true, gridColor: p.hair });
  ['خرداد', 'تیر'].forEach((t, i) => { b += T(cx + cw * .58 - 50 - i * (cw * .58 - 150), my + mh - 14, t, { size: 11.5, fill: p.dim, anchor: 'middle' }); });
  b += panel(p, cx + cw * .58 + 16, my, cw * .42 - 16, mh, 'قیف تبدیل', '');
  const fun = [['بازدید', '۴۲٬۳۸۹', 1], ['مشاهده محصول', '۱۸٬۸۹۲', .72], ['سبد خرید', '۶٬۷۴۲', .45], ['خرید نهایی', '۱٬۳۷۱', .22]];
  fun.forEach((f, i) => {
    const ry = my + 62 + i * 46, fw = cw * .42 - 16 - 190;
    b += T(cx + cw - 40, ry + 15, f[0], { size: 12.5, fill: p.mut });
    b += hbar(cx + cw * .58 + 16 + 90, ry + 4, fw, 15, f[2], p.vio, p.bar);
    b += T(cx + cw * .58 + 16 + 78, ry + 16, f[1], { size: 12, fill: p.text, weight: 700 });
  });
  const by = my + mh + 16, bh = H - by - 24;
  b += panel(p, cx, by, cw * .58, bh, 'منابع ترافیک', '');
  b += donut(cx + 120, by + bh / 2 + 8, 62, 24, [{ v: .39, c: p.pri }, { v: .24, c: p.cyn }, { v: .18, c: p.grn }, { v: .12, c: p.amb }, { v: .07, c: p.vio }]);
  b += T(cx + 120, by + bh / 2 + 2, '۴۲٬۳۸۹', { size: 17, fill: p.text, anchor: 'middle', weight: 800 });
  b += T(cx + 120, by + bh / 2 + 22, 'بازدید', { size: 11.5, fill: p.mut, anchor: 'middle' });
  b += legend(p, cx + cw * .58 - 24, by + 66, [
    { t: 'مستقیم', v: '۳۹٪', c: p.pri }, { t: 'جست‌وجو', v: '۲۴٪', c: p.cyn },
    { t: 'شبکه اجتماعی', v: '۱۸٪', c: p.grn }, { t: 'تبلیغات', v: '۱۲٪', c: p.amb }
  ], 12.5);
  b += panel(p, cx + cw * .58 + 16, by, cw * .42 - 16, bh, 'هشدارهای هوشمند', '۳ مورد');
  [['نرخ پرش صفحه پرداخت بالا رفت', '۲ ساعت پیش', p.amb], ['فروش امروز ۱۸٪ بیشتر از میانگین', '۵ ساعت پیش', p.grn], ['موجودی ۳ محصول رو به اتمام است', 'دیروز', p.red]].forEach((a, i) => {
    const ry = by + 62 + i * 44;
    b += C(cx + cw - 44, ry + 10, 6, a[2]);
    b += T(cx + cw - 60, ry + 15, a[0], { size: 12.5, fill: p.text });
    b += T(cx + cw - 60, ry + 33, a[1], { size: 11, fill: p.dim });
  });
  return { defs, body: b };
});
add('p4-dash-2.svg', 'داشبورد تحلیلی - گزارش فروش', (key) => {
  const p = D;
  const defs = glowDefs(key, '#101a30', '#0b1220');
  let b = pageBg(key, p) + browserChrome(p, 'https://analytics.example.com/sales', 'فروش');
  const cy = 92;
  b += sideBar(p, W - 24 - 224, cy, 224, H - cy - 24, 'تحلیل کسب‌وکار', [
    { t: 'نمای کلی' }, { t: 'فروش', active: true }, { t: 'بازدیدکنندگان' }, { t: 'محصولات' }, { t: 'گزارش‌ها' }, { t: 'هشدارها', badge: '۳' }, { t: 'تنظیمات' }
  ]);
  const cx = 24, cw = W - 24 - 224 - 48;
  b += T(cx + cw, cy + 8, 'گزارش فروش', { size: 24, fill: p.text, weight: 800 });
  b += btn(cx + 150, cy - 2, 150, 38, '⬇ خروجی اکسل', p, false);
  b += R(cx + 168, cy - 2, 170, 38, 12, p.input, { stroke: p.border }) + T(cx + 322, cy + 23, 'تیر ماه ▾', { size: 13.5, fill: p.mut });
  b += panel(p, cx, cy + 52, cw, 300, 'فروش روزانه (میلیون تومان)', 'میانگین روزانه: ۸٫۵ میلیون');
  b += vbars(cx + 40, cy + 118, cw - 260, 190, [.4, .55, .5, .68, .62, .8, .72, .9, .66, .78, .85, .95, .7, .88], p.pri, { gap: 12 });
  ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'].forEach((t, i) => {
    b += T(cx + cw - 270 - i * ((cw - 290) / 7), cy + 326, t, { size: 10.5, fill: p.dim, anchor: 'middle' });
  });
  b += R(cx + cw - 210, cy + 118, 180, 190, 12, p.card2);
  b += T(cx + cw - 44, cy + 150, 'جمع فروش', { size: 12.5, fill: p.mut });
  b += T(cx + cw - 44, cy + 182, '۲۵۶ میلیون', { size: 21, fill: p.text, weight: 800 });
  b += T(cx + cw - 44, cy + 214, 'میانگین سبد: ۱۶۵٬۰۰۰', { size: 12, fill: p.mut });
  b += T(cx + cw - 44, cy + 238, 'بازگشت کالا: ۲٫۱٪', { size: 12, fill: p.mut });
  b += T(cx + cw - 44, cy + 262, 'تخفیف داده شده: ۱۲ میلیون', { size: 12, fill: p.mut });
  const pty = cy + 368, pth = H - pty - 24;
  b += panel(p, cx, pty, cw, pth, 'پرفروش‌ترین محصولات', '۵ محصول');
  const t = table(p, cx + 20, pty + 54, cw - 40,
    [{ w: 260 }, { w: 190 }, { w: 150 }, { w: 160 }, { w: 170 }],
    ['محصول', 'درآمد (تومان)', 'سفارش', 'نرخ تبدیل', 'تغییر'],
    [
      ['هدفون بی‌سیم', '۵۸٬۲۷۵٬۰۰۰', '۳۱۲', '۳٫۴٪', { t: '▲ ۱۲٪', c: p.grn }],
      ['ساعت هوشمند', '۴۳٬۱۶۵٬۰۰۰', '۲۳۸', '۳٫۱٪', { t: '▲ ۸٪', c: p.grn }],
      ['اسپیکر قابل حمل', '۲۸٬۹۵۰٬۰۰۰', '۱۸۷', '۲٫۹٪', { t: '▼ ۲٪', c: p.red }],
      ['مچ‌بند ورزشی', '۱۹٬۲۷۶٬۰۰۰', '۱۴۲', '۲٫۴٪', { t: '▲ ۵٪', c: p.grn }]
    ], { rowH: 44 });
  b += t.svg;
  return { defs, body: b };
});
add('p4-dash-3.svg', 'داشبورد تحلیلی - بازدیدکنندگان', (key) => {
  const p = D;
  const defs = glowDefs(key, '#101a30', '#0b1220');
  let b = pageBg(key, p) + browserChrome(p, 'https://analytics.example.com/visitors', 'بازدیدکنندگان');
  const cy = 92;
  b += sideBar(p, W - 24 - 224, cy, 224, H - cy - 24, 'تحلیل کسب‌وکار', [
    { t: 'نمای کلی' }, { t: 'فروش' }, { t: 'بازدیدکنندگان', active: true }, { t: 'محصولات' }, { t: 'گزارش‌ها' }, { t: 'هشدارها' }, { t: 'تنظیمات' }
  ]);
  const cx = 24, cw = W - 24 - 224 - 48;
  b += T(cx + cw, cy + 8, 'تحلیل بازدیدکنندگان', { size: 24, fill: p.text, weight: 800 });
  b += T(cx + cw, cy + 34, '۴۲٬۳۸۹ بازدید در ۳۰ روز گذشته', { size: 13.5, fill: p.mut });
  b += panel(p, cx, cy + 52, cw * .62, 300, 'بازدید در طول زمان', 'جدید در برابر بازگشتی');
  b += lineArea(`a${key}`, cx + 24, cy + 118, cw * .62 - 90, 190, [.3, .45, .4, .58, .52, .7, .64, .8, .74, .9], p.cyn, { dot: true, gridColor: p.hair });
  b += lineArea(`b${key}`, cx + 24, cy + 118, cw * .62 - 90, 190, [.2, .3, .28, .38, .36, .48, .45, .55, .52, .62], p.vio, { grid: false });
  b += C(cx + cw * .62 - 200, cy + 96, 6, p.cyn) + T(cx + cw * .62 - 212, cy + 101, 'جدید', { size: 12, fill: p.mut });
  b += C(cx + cw * .62 - 110, cy + 96, 6, p.vio) + T(cx + cw * .62 - 122, cy + 101, 'بازگشتی', { size: 12, fill: p.mut });
  b += panel(p, cx + cw * .62 + 16, cy + 52, cw * .38 - 16, 300, 'دستگاه‌ها', '');
  [['موبایل', '۶۸٪', .68, p.pri], ['دسکتاپ', '۲۴٪', .24, p.cyn], ['تبلت', '۸٪', .08, p.vio]].forEach((d, i) => {
    const ry = cy + 122 + i * 66, dw = cw * .38 - 16 - 90;
    b += T(cx + cw - 40, ry, d[0], { size: 13.5, fill: p.text, weight: 700 });
    b += T(cx + cw - 40, ry + 20, d[1], { size: 12, fill: p.mut });
    b += hbar(cx + cw * .62 + 56, ry - 4, dw - 60, 18, d[2], d[3], p.bar);
  });
  const by = cy + 368, bh = H - by - 24;
  b += panel(p, cx, by, cw * .5 - 8, bh, 'صفحات پربازدید', '');
  [['/shop', '۱۲٬۴۲۰'], ['/product/x7', '۸٬۹۳۰'], ['/blog/vpn-guide', '۶٬۲۱۰'], ['/', '۵٬۸۷۰'], ['/contact', '۲٬۱۴۰']].forEach((pg, i) => {
    const ry = by + 60 + i * 40;
    b += T(cx + 40, ry + 16, pg[0], { size: 12.5, fill: p.mut, anchor: 'start', ff: FM });
    b += T(cx + cw * .5 - 48, ry + 16, pg[1] + ' بازدید', { size: 12.5, fill: p.text });
  });
  b += panel(p, cx + cw * .5 + 8, by, cw * .5 - 8, bh, 'کشورها', '');
  [['ایران', '۸۲٪', .82], ['آلمان', '۶٪', .06], ['ترکیه', '۴٪', .04], ['سایر', '۸٪', .08]].forEach((cn, i) => {
    const ry = by + 60 + i * 46, cxx = cx + cw * .5 + 8, cww = cw * .5 - 8;
    b += T(cxx + cww - 24, ry + 16, cn[0], { size: 13, fill: p.text });
    b += hbar(cxx + 110, ry + 4, cww - 260, 16, cn[2], p.grn, p.bar);
    b += T(cxx + 96, ry + 17, cn[1], { size: 12.5, fill: p.mut });
  });
  return { defs, body: b };
});

// ---------------- P5: backend API ----------------
add('p5-api-1.svg', 'مستندات API', (key) => {
  const p = L;
  const defs = glowDefs(key, '#ffffff', '#e9eef7');
  let b = pageBg(key, p) + browserChrome(p, 'https://api.example.com/docs', 'مستندات API');
  const cx = 90, cw = W - 180;
  b += T(cx + cw, 130, 'مستندات API فروشگاه', { size: 26, fill: p.text, weight: 800 });
  b += btn(cx + 150, 108, 150, 40, '🔒 ورود', p, true);
  b += pill(cx + 330, 111, 'نسخه ۲٫۴', p.grnSoft, p.grn, 12.5);
  b += R(cx, 164, cw, 48, 12, p.card, { stroke: p.border });
  b += T(cx + cw - 20, 194, 'سرور:', { size: 13.5, fill: p.mut });
  b += T(cx + cw - 80, 194, 'https://api.example.com/v2', { size: 14, fill: p.text, ff: FM });
  b += T(cx + 20, 194, 'OpenAPI 3.1 ✓', { size: 13, fill: p.grn, anchor: 'start', weight: 700 });
  const groups = [
    ['احراز هویت', [['POST', '/auth/login', 'ورود و دریافت توکن', '#1d4ed8', '#dbeafe'], ['POST', '/auth/refresh', 'تمدید توکن دسترسی', '#1d4ed8', '#dbeafe']]],
    ['محصولات', [['GET', '/products', 'لیست محصولات با فیلتر و صفحه‌بندی', '#059669', '#d1fae5'], ['GET', '/products/{id}', 'جزئیات یک محصول', '#059669', '#d1fae5'], ['POST', '/products', 'ایجاد محصول جدید (ادمین)', '#1d4ed8', '#dbeafe']]],
    ['سفارش‌ها', [['GET', '/orders', 'لیست سفارش‌های کاربر', '#059669', '#d1fae5'], ['POST', '/orders', 'ثبت سفارش جدید', '#1d4ed8', '#dbeafe'], ['DELETE', '/orders/{id}', 'لغو سفارش', '#dc2626', '#fee2e2']]]
  ];
  let yy = 228;
  groups.forEach((g, gi) => {
    b += T(cx + cw, yy + 16, g[0], { size: 16.5, fill: p.text, weight: 800 });
    b += LN(cx, yy + 26, cx + cw, yy + 26, p.border, 1);
    yy += 34;
    g[1].forEach(e => {
      b += R(cx, yy, cw, 46, 10, p.card, { stroke: p.border });
      const mw = e[0].length * 8.5 + 26;
      b += R(cx + cw - 14 - mw, yy + 10, mw, 26, 6, e[4]) + T(cx + cw - 14 - mw / 2, yy + 28, e[0], { size: 12, fill: e[3], anchor: 'middle', weight: 800, ff: FM });
      b += T(cx + cw - 28 - mw, yy + 29, e[1], { size: 13.5, fill: p.text, ff: FM });
      b += T(cx + 36, yy + 29, e[2], { size: 12.5, fill: p.mut, anchor: 'start' });
      yy += 52;
    });
    if (gi < groups.length - 1) yy += 4;
  });
  return { defs, body: b };
});
add('p5-api-2.svg', 'تست و پاسخ API', (key) => {
  const p = D;
  const defs = glowDefs(key, '#101a30', '#0b1220');
  let b = pageBg(key, p) + browserChrome(p, 'https://api.example.com/playground', 'آزمایشگاه API');
  const cx = 24, cw = W - 48;
  b += R(cx, 92, cw, 56, 14, p.card, { stroke: p.border });
  b += R(cx + cw - 110, 102, 86, 36, 8, p.grnSoft) + T(cx + cw - 67, 126, 'GET', { size: 15, fill: p.grn, anchor: 'middle', weight: 800, ff: FM });
  b += T(cx + cw - 126, 126, 'https://api.example.com/v2/products?limit=3', { size: 14.5, fill: p.text, ff: FM });
  b += btn(cx + 130, 102, 130, 36, 'ارسال ▶', p, true);
  b += R(cx, 160, cw * .5 - 8, H - 184, 16, p.card, { stroke: p.border });
  b += T(cx + cw * .5 - 32, 196, 'نمونه درخواست — Python', { size: 15, fill: p.text, weight: 800 });
  ['Python', 'cURL', 'JS'].forEach((t, i) => {
    b += R(cx + 24 + i * 86, 172, 78, 32, 8, i === 0 ? p.priSoft : 'none', i === 0 ? {} : { stroke: p.border }) +
      T(cx + 63 + i * 86, 194, t, { size: 12.5, fill: i === 0 ? '#a5b4fc' : p.mut, anchor: 'middle', weight: 700, ff: FM });
  });
  const code = [
    [['import', '#c792ea'], [' requests', '#e9eefb']],
    [[' ', '#e9eefb']],
    [['resp', '#e9eefb'], [' = ', '#8fa0c2'], ['requests', '#e9eefb'], ['.', '#8fa0c2'], ['get', '#ffcb6b'], ['(', '#8fa0c2']],
    [['    ', '#e9eefb'], ['"https://api.example.com/v2/products",', '#9ccc9c']],
    [['    headers', '#e9eefb'], [' = ', '#8fa0c2'], ['{', '#8fa0c2'], ['"Authorization"', '#9ccc9c'], [': ', '#8fa0c2'], ['"Bearer TOKEN"', '#9ccc9c'], ['}', '#8fa0c2']],
    [[')', '#8fa0c2']],
    [[' ', '#e9eefb']],
    [['print', '#ffcb6b'], ['(resp.', '#e9eefb'], ['json', '#ffcb6b'], ['())', '#e9eefb']]
  ];
  code.forEach((ln, i) => {
    let txp = cx + 32;
    const typ = 226 + i * 30;
    ln.forEach(seg => {
      b += `<text x="${txp}" y="${typ}" font-family="${FM}" font-size="15" fill="${seg[1]}" text-anchor="start">${esc(seg[0])}</text>`;
      txp += seg[0].length * 9;
    });
  });
  b += R(cx + 24, H - 150, cw * .5 - 56, 100, 12, p.card2);
  b += T(cx + cw * .5 - 56, H - 118, 'احراز هویت JWT', { size: 13.5, fill: p.text, weight: 700 });
  b += T(cx + cw * .5 - 56, H - 94, 'توکن در هدر Authorization ارسال می‌شود', { size: 12.5, fill: p.mut });
  b += T(cx + cw * .5 - 56, H - 72, 'محدودیت نرخ: ۱۰۰ درخواست در دقیقه', { size: 12.5, fill: p.mut });
  const rx = cx + cw * .5 + 8, rw = cw * .5 - 8;
  b += R(rx, 160, rw, H - 184, 16, p.card, { stroke: p.border });
  b += R(rx + rw - 130, 172, 106, 34, 10, p.grnSoft) + T(rx + rw - 77, 195, '200 OK', { size: 14, fill: p.grn, anchor: 'middle', weight: 800, ff: FM });
  b += T(rx + 24, 195, 'زمان پاسخ: ۴۸ میلی‌ثانیه', { size: 12.5, fill: p.mut, anchor: 'start' });
  const json = [
    [['{', '#8fa0c2']],
    [['  "ok"', '#7dd3fc'], [': ', '#8fa0c2'], ['true', '#f78c6c'], [',', '#8fa0c2']],
    [['  "total"', '#7dd3fc'], [': ', '#8fa0c2'], ['128', '#f78c6c'], [',', '#8fa0c2']],
    [['  "items"', '#7dd3fc'], [': [', '#8fa0c2']],
    [['    {', '#8fa0c2'], ['"id"', '#7dd3fc'], [': ', '#8fa0c2'], ['1', '#f78c6c'], [', ', '#8fa0c2'], ['"stock"', '#7dd3fc'], [': ', '#8fa0c2'], ['45}', '#8fa0c2']],
    [['    {', '#8fa0c2'], ['"id"', '#7dd3fc'], [': ', '#8fa0c2'], ['2', '#f78c6c'], [', ', '#8fa0c2'], ['"stock"', '#7dd3fc'], [': ', '#8fa0c2'], ['12}', '#8fa0c2']],
    [['  ],', '#8fa0c2']],
    [['  "cached"', '#7dd3fc'], [': ', '#8fa0c2'], ['true', '#f78c6c'], ['  // Redis', '#5f6f92']],
    [['}', '#8fa0c2']]
  ];
  json.forEach((ln, i) => {
    let txp = rx + 32;
    const typ = 240 + i * 30;
    ln.forEach(seg => {
      b += `<text x="${txp}" y="${typ}" font-family="${FM}" font-size="14.5" fill="${seg[1]}" text-anchor="start">${esc(seg[0])}</text>`;
      txp += seg[0].length * 8.7;
    });
  });
  b += R(rx + 24, H - 150, rw - 48, 100, 12, p.card2);
  b += T(rx + rw - 48, H - 118, 'کش Redis فعال است', { size: 13.5, fill: p.grn, weight: 700 });
  b += T(rx + rw - 48, H - 94, 'این پاسخ از کش خوانده شد (۴۸ms به‌جای ۳۲۰ms)', { size: 12.5, fill: p.mut });
  b += T(rx + rw - 48, H - 72, 'مستندات کامل در Swagger', { size: 12.5, fill: p.pri, weight: 700 });
  return { defs, body: b };
});

// ---------------- P6: cloudflare deploy (dark) ----------------
add('p6-cloud-1.svg', 'زیرساخت ابری - نمای کلی', (key) => {
  const p = D;
  const defs = glowDefs(key, '#101a30', '#0b1220');
  let b = pageBg(key, p) + browserChrome(p, 'https://cloud.example.com/overview', 'زیرساخت');
  const cy = 92;
  b += sideBar(p, W - 24 - 224, cy, 224, H - cy - 24, 'زیرساخت ابری', [
    { t: 'نمای کلی', active: true }, { t: 'دامنه‌ها' }, { t: 'توابع' }, { t: 'ذخیره‌سازی R2' }, { t: 'کش' }, { t: 'امنیت' }, { t: 'صورتحساب' }
  ]);
  const cx = 24, cw = W - 24 - 224 - 48;
  b += T(cx + cw, cy + 8, 'نمای کلی زیرساخت', { size: 24, fill: p.text, weight: 800 });
  b += pill(cx + cw - 130, cy + 22, '● همه سیستم‌ها پایدار', p.grnSoft, p.grn, 12.5);
  const kw = (cw - 36) / 4, ky = cy + 56;
  [['درخواست امروز', '۱٬۲۴۰٬۰۰۰', 'رشد ۱۱٪', true], ['پهنای باند', '۸۴ گیگابایت', 'رشد ۶٪', true], ['نرخ هیت کش', '۹۴٪', 'رشد ۲٪', true], ['آپتایم', '۹۹٫۹۹٪', '۳۰ روز', true]].forEach((k, i) => {
    b += kpi(p, cx + (3 - i) * (kw + 12), ky, kw, 104, k[0], k[1], k[2], k[3], 22);
  });
  const dy = ky + 124, dh = 210;
  b += panel(p, cx, dy, cw * .55, dh, 'آخرین استقرار', 'مشاهده همه');
  const steps = [['Push در گیت', '✓'], ['Build', '✓'], ['Deploy', '✓']];
  steps.forEach((st, i) => {
    const sx = cx + cw * .55 - 40 - i * 150;
    b += C(sx - 40, dy + 96, 20, p.grn, { opacity: .18 }) + T(sx - 40, dy + 103, st[1], { size: 16, fill: p.grn, anchor: 'middle', weight: 800 });
    b += T(sx - 40, dy + 130, st[0], { size: 12, fill: p.mut, anchor: 'middle' });
    if (i < 2) b += LN(sx - 170, dy + 96, sx - 60, dy + 96, p.grn, 2.5);
  });
  b += R(cx + 24, dy + dh - 70, cw * .55 - 48, 50, 10, p.card2);
  b += T(cx + cw * .55 - 40, dy + dh - 50, 'کامیت: «رفع باگ سبد خرید»', { size: 12.5, fill: p.text });
  b += T(cx + cw * .55 - 40, dy + dh - 32, '۲ دقیقه پیش — example.com', { size: 11.5, fill: p.dim });
  b += panel(p, cx + cw * .55 + 16, dy, cw * .45 - 16, dh, 'دامنه‌ها', '＋ دامنه');
  [['example.com', 'فعال ✓', p.grn], ['shop.example.com', 'فعال ✓', p.grn], ['api.example.com', 'فعال ✓', p.grn], ['blog.example.com', 'در حال انتشار…', p.amb]].forEach((d, i) => {
    const ry = dy + 60 + i * 38;
    b += T(cx + cw - 44, ry + 14, d[0], { size: 13, fill: p.text, ff: FM });
    b += T(cx + cw * .55 + 40, ry + 14, d[1], { size: 12, fill: d[2], anchor: 'start', weight: 700 });
  });
  const ly = dy + dh + 16, lh = H - ly - 24;
  b += panel(p, cx, ly, cw, lh, 'درخواست‌ها در ۲۴ ساعت گذشته', '۱٬۲۴۰٬۰۰۰ درخواست');
  b += lineArea(`a${key}`, cx + 30, ly + 62, cw - 130, lh - 120, [.2, .28, .24, .35, .42, .55, .5, .65, .72, .68, .85, .92], p.pri, { dot: true, gridColor: p.hair });
  b += T(cx + 60, ly + lh - 16, '۰۰:۰۰', { size: 11, fill: p.dim, anchor: 'middle' }) + T(cx + cw - 70, ly + lh - 16, 'اکنون', { size: 11, fill: p.dim, anchor: 'middle' });
  return { defs, body: b };
});
add('p6-cloud-2.svg', 'زیرساخت ابری - توابع', (key) => {
  const p = D;
  const defs = glowDefs(key, '#101a30', '#0b1220');
  let b = pageBg(key, p) + browserChrome(p, 'https://cloud.example.com/workers', 'توابع');
  const cy = 92;
  b += sideBar(p, W - 24 - 224, cy, 224, H - cy - 24, 'زیرساخت ابری', [
    { t: 'نمای کلی' }, { t: 'دامنه‌ها' }, { t: 'توابع', active: true }, { t: 'ذخیره‌سازی R2' }, { t: 'کش' }, { t: 'امنیت' }, { t: 'صورتحساب' }
  ]);
  const cx = 24, cw = W - 24 - 224 - 48;
  b += T(cx + cw, cy + 8, 'توابع Workers', { size: 24, fill: p.text, weight: 800 });
  b += btn(cx + 150, cy - 2, 150, 38, '＋ تابع جدید', p, true);
  b += panel(p, cx, cy + 52, cw, 330, 'لیست توابع', '۶ تابع فعال');
  const t = table(p, cx + 20, cy + 106, cw - 40,
    [{ w: 200 }, { w: 180 }, { w: 170 }, { w: 130 }, { w: 150 }, { w: 100 }],
    ['نام تابع', 'مسیر', 'فراخوانی امروز', 'خطا', 'میانگین اجرا', 'وضعیت'],
    [
      ['shop-api', { ltr: '/api/*' }, '۸۴۲٬۰۰۰', '۰٫۰۱٪', '۱۲ms', { dot: ['فعال', p.grn] }],
      ['bot-webhook', { ltr: '/bot/hook' }, '۱۲۶٬۰۰۰', '۰٫۰۰٪', '۸ms', { dot: ['فعال', p.grn] }],
      ['auth-guard', { ltr: '/auth/*' }, '۹۸٬۰۰۰', '۰٫۰۳٪', '۱۵ms', { dot: ['فعال', p.grn] }],
      ['image-resize', { ltr: '/img/*' }, '۴۵٬۰۰۰', '۰٫۰۰٪', '۲۲ms', { dot: ['فعال', p.grn] }],
      ['invoice-pdf', { ltr: '/invoice' }, '۱۲٬۰۰۰', '۰٫۱۲٪', '۱۸۰ms', { dot: ['هشدار', p.amb] }]
    ], { rowH: 44 });
  b += t.svg;
  const by = cy + 398, bh = H - by - 24;
  b += panel(p, cx, by, cw * .5 - 8, bh, 'فضاهای نام KV', '');
  [['sessions', '۱۲٬۴۰۰ کلید', '۴۸ مگ'], ['products-cache', '۸٬۲۰۰ کلید', '۱۲۰ مگ'], ['rate-limits', '۳٬۱۰۰ کلید', '۱۲ مگ']].forEach((kv, i) => {
    const ry = by + 62 + i * 52, kx = cx, kww = cw * .5 - 8;
    b += T(kx + kww - 24, ry + 16, kv[0], { size: 13.5, fill: p.text, weight: 700, ff: FM });
    b += T(kx + kww - 24, ry + 36, kv[1] + ' — ' + kv[2], { size: 11.5, fill: p.dim });
    b += T(kx + 24, ry + 26, 'مشاهده ←', { size: 12.5, fill: p.pri, anchor: 'start', weight: 700 });
  });
  b += panel(p, cx + cw * .5 + 8, by, cw * .5 - 8, bh, 'اجرای توابع (ساعتی)', '');
  b += vbars(cx + cw * .5 + 32, by + 66, cw * .5 - 66, bh - 110, [.4, .55, .5, .7, .62, .8, .75, .9, .68, .85, .78, .95], p.cyn, { gap: 8 });
  return { defs, body: b };
});

// ---------------- P7: online shop (LIGHT) ----------------
function shopNav(p, cartCount) {
  let s = R(0, 66, W, 70, 0, p.card) + LN(0, 136, W, 136, p.border, 1);
  s += brandMark(W - 32, 76, 48, 'شاپ‌لند', p);
  s += R(420, 82, 420, 42, 21, p.input, { stroke: p.border }) + T(824, 109, 'جست‌وجوی محصول…', { size: 14, fill: p.dim });
  s += R(190, 82, 130, 42, 21, p.priSoft) + T(255, 109, '🛒 سبد (' + cartCount + ')', { size: 14, fill: p.pri, anchor: 'middle', weight: 700 });
  s += R(60, 82, 110, 42, 21, 'none', { stroke: p.border, sw: 1.5 }) + T(115, 109, 'ورود', { size: 14, fill: p.text, anchor: 'middle', weight: 700 });
  const cats = ['موبایل', 'لپ‌تاپ', 'صوتی', 'پوشیدنی', 'خانه هوشمند', 'تخفیف‌ها 🔥'];
  let row = R(0, 136, W, 44, 0, p.card) + LN(0, 180, W, 180, p.border, 1);
  cats.forEach((c, i) => { row += T(W - 60 - i * 150, 165, c, { size: 14, fill: i === 5 ? p.red : p.mut, weight: i === 5 ? 700 : 500 }); });
  return s + row;
}
function productCard(p, x, y, w, h, name, price, old, rating, hue) {
  let s = R(x, y, w, h, 16, p.card, { stroke: p.border });
  s += `<defs><linearGradient id="pc${Math.round(x)}${Math.round(y)}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${hue}"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs>`;
  s += R(x + 12, y + 12, w - 24, h * .48, 12, `url(#pc${Math.round(x)}${Math.round(y)})`, { opacity: .9 });
  s += C(x + w / 2, y + 12 + h * .24, 26, 'rgba(255,255,255,.9)') + T(x + w / 2, y + 12 + h * .24 + 8, name.slice(0, 1), { size: 22, fill: hue, anchor: 'middle', weight: 800 });
  s += T(x + w - 16, y + h * .48 + 42, name, { size: 14.5, fill: p.text, weight: 700 });
  s += T(x + w - 16, y + h * .48 + 64, '★ ' + rating, { size: 12.5, fill: p.amb, weight: 700 });
  if (old) s += T(x + w - 16, y + h * .48 + 84, old, { size: 12, fill: p.dim }) + LN(x + w - 24 - tw(old, 12), y + h * .48 + 80, x + w - 16, y + h * .48 + 80, p.dim, 1.5);
  s += T(x + w - 16, y + h - 54, price, { size: 16, fill: p.pri, weight: 800 });
  s += T(x + w - 16, y + h - 36, 'تومان', { size: 11.5, fill: p.mut });
  s += R(x + 14, y + h - 44, 96, 32, 16, p.pri) + T(x + 62, y + h - 22, '＋ سبد', { size: 12.5, fill: '#fff', anchor: 'middle', weight: 700 });
  return s;
}
add('p7-shop-1.svg', 'فروشگاه اینترنتی - ویترین', (key) => {
  const p = L;
  const defs = glowDefs(key, '#ffffff', '#e9eef7') +
    `<linearGradient id="hb${key}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4f46e5"/><stop offset=".6" stop-color="#7c3aed"/><stop offset="1" stop-color="#db2777"/></linearGradient>`;
  let b = pageBg(key, p) + browserChrome(p, 'https://shopland.example.com', 'شاپ‌لند') + shopNav(p, '۳');
  b += R(60, 200, 1160, 170, 20, `url(#hb${key})`);
  b += T(1160, 262, 'جشنواره تابستانه ☀', { size: 30, fill: '#fff', weight: 800 });
  b += T(1160, 302, 'تا ۴۰٪ تخفیف روی گوشی، لپ‌تاپ و کالای دیجیتال', { size: 16, fill: '#e0e7ff' });
  b += R(960, 316, 180, 40, 20, '#fff') + T(1050, 342, 'همین حالا خرید کنید', { size: 14, fill: p.pri, anchor: 'middle', weight: 800 });
  b += C(300, 285, 70, 'rgba(255,255,255,.16)') + C(420, 300, 40, 'rgba(255,255,255,.16)') + T(300, 296, '٪۴۰-', { size: 30, fill: '#fff', anchor: 'middle', weight: 800 });
  b += T(1220, 412, 'پیشنهادهای ویژه', { size: 20, fill: p.text, weight: 800 });
  b += T(80, 410, 'مشاهده همه ←', { size: 13.5, fill: p.pri, anchor: 'start', weight: 700 });
  const prods = [
    ['گوشی آلفا ۱۲', '۱۸٬۵۰۰٬۰۰۰', '۲۱٬۰۰۰٬۰۰۰', '۴٫۸ (۱۲۴)', '#4f46e5'],
    ['هدفون بی‌سیم پرو', '۱٬۲۹۰٬۰۰۰', '۱٬۶۰۰٬۰۰۰', '۴٫۹ (۸۶)', '#0891b2'],
    ['ساعت هوشمند X7', '۲٬۸۵۰٬۰۰۰', '', '۴٫۷ (۲۰۴)', '#059669'],
    ['لپ‌تاپ اولترا ۱۴', '۳۲٬۰۰۰٬۰۰۰', '۳۵٬۵۰۰٬۰۰۰', '۴٫۹ (۵۸)', '#d97706']
  ];
  prods.forEach((pd, i) => {
    b += productCard(p, 60 + (3 - i) * (280 + 40 / 3), 428, 280, 300, pd[0], pd[1], pd[2], pd[3], pd[4]);
  });
  return { defs, body: b };
});
add('p7-shop-2.svg', 'فروشگاه اینترنتی - محصول و سبد', (key) => {
  const p = L;
  const defs = glowDefs(key, '#ffffff', '#e9eef7') +
    `<linearGradient id="gi${key}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4f46e5"/><stop offset="1" stop-color="#06b6d4"/></linearGradient>`;
  let b = pageBg(key, p) + browserChrome(p, 'https://shopland.example.com/p/alpha-12', 'گوشی آلفا ۱۲') + shopNav(p, '۲');
  b += R(830, 200, 330, 380, 18, p.card, { stroke: p.border });
  b += R(850, 220, 290, 280, 14, `url(#gi${key})`);
  b += R(955, 260, 80, 170, 14, '#101728') + R(965, 270, 60, 120, 6, '#3b82f6', { opacity: .8 }) + C(995, 415, 8, '#334155');
  [0, 1, 2, 3].forEach(i => { b += R(850 + i * 76, 512, 66, 52, 10, i === 0 ? '#dbe4f5' : p.input, { stroke: i === 0 ? p.pri : p.border, sw: i === 0 ? 2 : 1 }); });
  b += T(790, 238, 'گوشی موبایل آلفا ۱۲ — ۲۵۶ گیگ', { size: 21, fill: p.text, weight: 800 });
  b += T(790, 266, '★ ۴٫۸  —  ۱۲۴ دیدگاه    |    ۸۰۰+ فروش', { size: 13.5, fill: p.amb, weight: 700 });
  b += T(790, 310, '۱۸٬۵۰۰٬۰۰۰ تومان', { size: 28, fill: p.pri, weight: 800 });
  b += T(790, 334, '۲۱٬۰۰۰٬۰۰۰', { size: 14, fill: p.dim }) + LN(790 - tw('۲۱٬۰۰۰٬۰۰۰', 14) - 6, 328, 790, 328, p.dim, 1.5);
  b += pill(710, 348, '۱۲٪ تخفیف', p.redSoft, p.red, 12.5);
  b += T(790, 408, 'رنگ:', { size: 14, fill: p.mut });
  ['#17233e', '#3b82f6', '#e2e8f0'].forEach((c, i) => { b += C(740 - i * 36, 402, 13, c, { stroke: i === 0 ? p.pri : p.border, sw: i === 0 ? 2.5 : 1.5 }); });
  b += R(560, 432, 230, 50, 14, p.pri) + T(675, 463, '🛒 افزودن به سبد', { size: 15, fill: '#fff', anchor: 'middle', weight: 800 });
  b += R(560, 490, 230, 50, 14, 'none', { stroke: p.pri, sw: 2 }) + T(675, 521, '⚡ خرید فوری', { size: 15, fill: p.pri, anchor: 'middle', weight: 800 });
  b += T(790, 566, '✓ ضمانت اصالت کالا    ✓ ۷ روز بازگشت    ✓ ارسال رایگان', { size: 12.5, fill: p.grn, weight: 700 });
  b += R(60, 200, 430, 380, 18, p.card, { stroke: p.border });
  b += T(450, 240, 'سبد خرید (۲)', { size: 18, fill: p.text, weight: 800 });
  [['هدفون بی‌سیم پرو', '۱٬۲۹۰٬۰۰۰'], ['موس گیمینگ RGB', '۴۹۰٬۰۰۰']].forEach((it, i) => {
    const iy = 260 + i * 100;
    b += R(360, iy, 70, 70, 12, p.priSoft) + T(395, iy + 42, it[0].slice(0, 1), { size: 24, fill: p.pri, anchor: 'middle', weight: 800 });
    b += T(344, iy + 28, it[0], { size: 14, fill: p.text, weight: 700 });
    b += T(344, iy + 52, it[1] + ' تومان', { size: 13, fill: p.mut });
    b += R(84, iy + 18, 90, 34, 10, p.input, { stroke: p.border }) + T(129, iy + 41, '− ۱ ＋', { size: 14, fill: p.text, anchor: 'middle', weight: 700 });
  });
  b += LN(84, 470, 450, 470, p.border, 1);
  b += T(450, 500, 'جمع سبد:', { size: 14, fill: p.mut });
  b += T(450, 530, '۱٬۷۸۰٬۰۰۰ تومان', { size: 20, fill: p.text, weight: 800 });
  b += R(84, 520, 200, 44, 12, p.pri) + T(184, 548, 'تکمیل خرید ←', { size: 14.5, fill: '#fff', anchor: 'middle', weight: 800 });
  b += T(1220, 620, 'توضیحات', { size: 15, fill: p.pri, weight: 800 }) + R(1150, 630, 70, 4, 2, p.pri);
  b += T(1110, 620, 'مشخصات فنی', { size: 15, fill: p.mut });
  b += T(950, 620, 'دیدگاه‌ها (۱۲۴)', { size: 15, fill: p.mut });
  b += R(60, 648, 1160, 120, 16, p.card, { stroke: p.border });
  b += T(1180, 690, 'آلفا ۱۲ با نمایشگر ۱۲۰ هرتزی، باتری ۵۰۰۰ میلی‌آمپری و دوربین ۱۰۸ مگاپیکسلی؛', { size: 14.5, fill: p.text });
  b += T(1180, 716, 'همراه با شارژر ۶۷ واتی، گارد و گلس رایگان ارسال می‌شود.', { size: 14.5, fill: p.mut });
  b += T(1180, 744, 'حافظه: ۲۵۶ گیگ  |  رم: ۱۲ گیگ  |  شبکه: 5G', { size: 13, fill: p.dim });
  return { defs, body: b };
});
add('p7-shop-3.svg', 'فروشگاه اینترنتی - تسویه حساب', (key) => {
  const p = L;
  const defs = glowDefs(key, '#ffffff', '#e9eef7');
  let b = pageBg(key, p) + browserChrome(p, 'https://shopland.example.com/checkout', 'تسویه حساب') + shopNav(p, '۲');
  const steps = [['۱', 'سبد خرید', true], ['۲', 'اطلاعات ارسال', false], ['۳', 'پرداخت', false]];
  steps.forEach((st, i) => {
    const sx = 940 - i * 300;
    b += C(sx, 216, 18, st[2] ? p.grn : i === 1 ? p.pri : p.bar) + T(sx, 223, st[2] ? '✓' : st[0], { size: 15, fill: '#fff', anchor: 'middle', weight: 800 });
    b += T(sx - 30, 222, st[1], { size: 14.5, fill: i === 1 ? p.text : p.mut, weight: i === 1 ? 700 : 400 });
    if (i < 2) b += LN(sx - 282, 216, sx - 20, 216, p.border, 2);
  });
  b += R(640, 250, 520, 470, 18, p.card, { stroke: p.border });
  b += T(1120, 292, 'اطلاعات ارسال', { size: 18, fill: p.text, weight: 800 });
  const rows = [[['نام و نام خانوادگی', 'سارا محمدی']], [['موبایل', '۰۹۱۲۳۴۵۶۷۸۹']]];
  let fy = 306;
  rows.forEach(r => {
    b += T(1120, fy + 14, r[0][0], { size: 13, fill: p.mut });
    b += R(680, fy + 22, 440, 42, 10, p.input, { stroke: p.border }) + T(1104, fy + 49, r[0][1], { size: 13.5, fill: p.text });
    fy += 76;
  });
  b += T(1120, fy + 14, 'استان', { size: 13, fill: p.mut }) + T(898, fy + 14, 'شهر', { size: 13, fill: p.mut });
  b += R(908, fy + 22, 212, 42, 10, p.input, { stroke: p.border }) + T(1104, fy + 49, 'تهران ▾', { size: 13.5, fill: p.text });
  b += R(680, fy + 22, 212, 42, 10, p.input, { stroke: p.border }) + T(876, fy + 49, 'تهران ▾', { size: 13.5, fill: p.text });
  fy += 76;
  b += T(1120, fy + 14, 'آدرس', { size: 13, fill: p.mut });
  b += R(680, fy + 22, 440, 42, 10, p.input, { stroke: p.border }) + T(1104, fy + 49, 'خیابان ولیعصر، کوچه ۱۲، پلاک ۳', { size: 13.5, fill: p.text });
  b += R(680, fy + 76, 440, 52, 14, p.pri);
  b += T(900, fy + 108, 'پرداخت امن ←  ۱٬۸۲۵٬۰۰۰ تومان', { size: 15.5, fill: '#fff', anchor: 'middle', weight: 800 });
  b += R(60, 250, 540, 230, 18, p.card, { stroke: p.border });
  b += T(560, 290, 'روش ارسال', { size: 17, fill: p.text, weight: 800 });
  [['پیشتاز — ۲ روزه', '۴۵٬۰۰۰ تومان', true], ['سفارشی — ۴ روزه', 'رایگان', false]].forEach((sh, i) => {
    const sy = 304 + i * 62;
    b += R(100, sy, 460, 52, 12, sh[2] ? p.priSoft : p.input, { stroke: sh[2] ? p.pri : p.border, sw: sh[2] ? 2 : 1 });
    b += C(524, sy + 26, 9, 'none', { stroke: sh[2] ? p.pri : p.dim, sw: 2.5 }) + (sh[2] ? C(524, sy + 26, 4, p.pri) : '');
    b += T(500, sy + 32, sh[0], { size: 14, fill: p.text, weight: 700 });
    b += T(124, sy + 32, sh[1], { size: 13.5, fill: p.mut, anchor: 'start' });
  });
  b += R(60, 496, 540, 224, 18, p.card, { stroke: p.border });
  b += T(560, 534, 'خلاصه سفارش', { size: 17, fill: p.text, weight: 800 });
  b += T(560, 566, '۲ کالا', { size: 13.5, fill: p.mut }) + T(100, 566, '۱٬۹۰۰٬۰۰۰', { size: 13.5, fill: p.text, anchor: 'start' });
  b += T(560, 592, 'تخفیف جشنواره', { size: 13.5, fill: p.grn }) + T(100, 592, '−۱۲۰٬۰۰۰', { size: 13.5, fill: p.grn, anchor: 'start' });
  b += T(560, 618, 'هزینه ارسال', { size: 13.5, fill: p.mut }) + T(100, 618, '۴۵٬۰۰۰', { size: 13.5, fill: p.text, anchor: 'start' });
  b += LN(100, 636, 560, 636, p.border, 1);
  b += T(560, 666, 'مبلغ قابل پرداخت:', { size: 14.5, fill: p.text, weight: 800 });
  b += T(100, 666, '۱٬۸۲۵٬۰۰۰ تومان', { size: 17, fill: p.pri, anchor: 'start', weight: 800 });
  b += T(900, 684, '🔒 پرداخت امن با درگاه بانکی', { size: 12.5, fill: p.mut, anchor: 'middle' });
  return { defs, body: b };
});

// ---------------- P8: PWA phones ----------------
function pwaBottomNav(px, py, pw, ph, active) {
  const items = ['خانه', 'آمار', 'پیام‌ها', 'پروفایل'];
  let s = R(px, py + ph - 96, pw, 96, 0, '#151b2e');
  items.forEach((t, i) => {
    const ix = px + pw - 45 - i * ((pw - 40) / 3.4);
    s += T(ix, py + ph - 48, t, { size: 12, fill: t === active ? '#a5b4fc' : '#5f6f92', anchor: 'middle', weight: t === active ? 700 : 400 });
    s += C(ix, py + ph - 66, 5, t === active ? '#6366f1' : '#2b3a5e');
  });
  return s;
}
add('p8-pwa-1.svg', 'وب‌اپلیکیشن - نصب و داشبورد', (key) => {
  const defs = glowDefs(key, '#1c1440', '#0b0620') + `<linearGradient id="pd${key}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#a855f7"/></linearGradient>`;
  let b = `<rect width="1280" height="800" fill="url(#g${key})"/>`;
  b += `<ellipse cx="1050" cy="150" rx="300" ry="220" fill="#7c3aed" opacity=".25"/>` + `<ellipse cx="200" cy="680" rx="300" ry="200" fill="#06b6d4" opacity=".18"/>`;
  const px = 150, pw = 350, py = 60, ph = 680;
  let s = '';
  s += R(px, py + 56, pw, 64, 12, '#1e2a45');
  s += T(px + pw - 20, py + 84, 'نصب اپلیکیشن', { size: 15, fill: '#fff', weight: 800 });
  s += T(px + pw - 20, py + 106, 'این وب‌اپ را روی صفحه اصلی نصب کنید', { size: 11.5, fill: '#8fa0c2' });
  s += R(px + 20, py + 78, 76, 32, 10, `url(#pd${key})`) + T(px + 58, py + 99, 'نصب', { size: 13, fill: '#fff', anchor: 'middle', weight: 800 });
  s += T(px + pw - 20, py + 148, 'سلام امیر 👋', { size: 21, fill: '#fff', weight: 800 });
  s += T(px + pw - 20, py + 170, 'نمای کلی امروز', { size: 12.5, fill: '#8fa0c2' });
  const kpis = [['بازدید امروز', '۸٬۴۹۸'], ['کاربران', '۴٬۲۸۷'], ['لایک', '۱٬۲۹۸'], ['دیدگاه', '۲۳۴']];
  kpis.forEach((k, i) => {
    const kx = px + 20 + (1 - i % 2) * ((pw - 52) / 2 + 12), ky = py + 186 + Math.floor(i / 2) * 108;
    s += R(kx, ky, (pw - 52) / 2, 96, 14, '#1a2440');
    s += T(kx + (pw - 52) / 2 - 14, ky + 28, k[0], { size: 11.5, fill: '#8fa0c2' });
    s += T(kx + (pw - 52) / 2 - 14, ky + 58, k[1], { size: 22, fill: '#fff', weight: 800 });
    s += `<polyline points="${kx + 14},${ky + 80} ${kx + 40},${ky + 72} ${kx + 66},${ky + 76} ${kx + 92},${ky + 66} ${kx + 118},${ky + 70}" fill="none" stroke="#8b5cf6" stroke-width="2.5" stroke-linecap="round"/>`;
  });
  s += T(px + pw - 20, py + 428, 'فعالیت‌های اخیر', { size: 14.5, fill: '#fff', weight: 800 });
  s += T(px + 20, py + 428, 'مشاهده همه', { size: 11.5, fill: '#a5b4fc', anchor: 'start' });
  [['کاربر جدید ثبت‌نام کرد', '۲ دقیقه پیش'], ['پست شما لایک شد', '۱۰ دقیقه پیش'], ['دیدگاه جدید اضافه شد', '۱ ساعت پیش']].forEach((a, i) => {
    const ay = py + 442 + i * 48;
    s += R(px + 20, ay, pw - 40, 40, 10, '#1a2440');
    s += C(px + pw - 44, ay + 20, 11, '#6366f1', { opacity: .25 }) + C(px + pw - 44, ay + 20, 5, '#a5b4fc');
    s += T(px + pw - 62, ay + 25, a[0], { size: 12, fill: '#dbe3f5' });
    s += T(px + 32, ay + 25, a[1], { size: 10.5, fill: '#5f6f92', anchor: 'start' });
  });
  s += pwaBottomNav(px, py, pw, ph, 'خانه');
  b += phoneShell(key, px, py, pw, ph, '#101728', { body: s });
  b += T(1150, 320, 'وب‌اپلیکیشن پیش‌رونده', { size: 40, fill: '#fff', weight: 800 });
  b += T(1150, 372, 'نصب مستقیم از مرورگر — بدون نیاز به کافه‌بازار', { size: 18, fill: '#c4b5fd' });
  b += T(1150, 424, '✓ کار در حالت آفلاین    ✓ اعلان‌های لحظه‌ای', { size: 16, fill: '#8fa0c2' });
  b += T(1150, 458, '✓ همگام‌سازی خودکار پس از اتصال', { size: 16, fill: '#8fa0c2' });
  b += R(930, 500, 220, 52, 26, `url(#pd${key})`) + T(1040, 532, '⬇ نصب نسخه نمایشی', { size: 15, fill: '#fff', anchor: 'middle', weight: 800 });
  return { defs, body: b };
});
add('p8-pwa-2.svg', 'وب‌اپلیکیشن - حالت آفلاین', (key) => {
  const defs = glowDefs(key, '#0e2a33', '#08131a') + `<linearGradient id="pd${key}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#06b6d4"/><stop offset="1" stop-color="#6366f1"/></linearGradient>`;
  let b = `<rect width="1280" height="800" fill="url(#g${key})"/>`;
  b += `<ellipse cx="200" cy="150" rx="300" ry="220" fill="#06b6d4" opacity=".2"/>` + `<ellipse cx="1100" cy="680" rx="300" ry="200" fill="#6366f1" opacity=".2"/>`;
  const px = 780, pw = 350, py = 60, ph = 680;
  let s = '';
  s += R(px, py + 56, pw, 60, 12, 'rgba(245,158,11,.16)', { stroke: '#f59e0b', sw: 1.5 });
  s += T(px + pw - 20, py + 82, '⚠ اتصال اینترنت قطع است', { size: 14.5, fill: '#fbbf24', weight: 800 });
  s += T(px + pw - 20, py + 102, 'حالت آفلاین فعال شد — نگران نباشید', { size: 11.5, fill: '#dbe3f5' });
  s += T(px + pw - 20, py + 146, 'محتوای ذخیره‌شده', { size: 16, fill: '#fff', weight: 800 });
  [['سفارش‌های من', '۱۲ مورد — قابل مشاهده آفلاین'], ['محصولات نشان‌شده', '۸ مورد'], ['پیام‌های خوانده‌نشده', '۳ پیام']].forEach((c, i) => {
    const ay = py + 160 + i * 76;
    s += R(px + 20, ay, pw - 40, 64, 12, '#1a2440');
    s += T(px + pw - 36, ay + 27, c[0], { size: 13.5, fill: '#fff', weight: 700 });
    s += T(px + pw - 36, ay + 48, c[1], { size: 11.5, fill: '#8fa0c2' });
    s += C(px + 44, ay + 32, 13, '#10b981', { opacity: .2 }) + T(px + 44, ay + 37, '✓', { size: 13, fill: '#10b981', anchor: 'middle', weight: 800 });
  });
  s += R(px + 20, py + 448, pw - 40, 92, 14, `url(#pd${key})`);
  s += T(px + pw - 36, py + 478, '۳ تغییر در انتظار همگام‌سازی', { size: 14, fill: '#fff', weight: 800 });
  s += T(px + pw - 36, py + 500, 'بلافاصله پس از اتصال ارسال می‌شوند', { size: 12, fill: '#e0e7ff' });
  s += T(px + pw - 36, py + 524, '✓ صف ارسال امن است', { size: 11.5, fill: '#e0e7ff' });
  s += T(px + pw - 36, py + 570, 'ذخیره‌سازی آفلاین', { size: 13.5, fill: '#dbe3f5' });
  s += R(px + 20, py + 550, 46, 26, 13, '#10b981') + C(px + 20 + 33, py + 563, 9, '#fff');
  s += T(px + pw - 36, py + 596, 'فضای استفاده‌شده: ۴۸ مگابایت', { size: 11.5, fill: '#8fa0c2' });
  s += hbar(px + 20, py + 606, pw - 40, 10, .32, '#06b6d4', '#2b3a5e');
  s += pwaBottomNav(px, py, pw, ph, 'پروفایل');
  b += phoneShell(key, px, py, pw, ph, '#101728', { body: s });
  b += T(630, 320, 'آفلاین هم کار می‌کند', { size: 40, fill: '#fff', weight: 800 });
  b += T(630, 372, 'داده‌ها روی گوشی ذخیره می‌شوند', { size: 18, fill: '#99f6e4' });
  b += T(630, 424, '✓ مشاهده سفارش‌ها بدون اینترنت', { size: 16, fill: '#8fa0c2' });
  b += T(630, 458, '✓ ثبت تغییرات و ارسال خودکار بعدی', { size: 16, fill: '#8fa0c2' });
  return { defs, body: b };
});
add('p8-pwa-3.svg', 'وب‌اپلیکیشن - نصب و اعلان', (key) => {
  const defs = glowDefs(key, '#241445', '#0b0620');
  let b = `<rect width="1280" height="800" fill="url(#g${key})"/>`;
  b += `<ellipse cx="640" cy="100" rx="480" ry="200" fill="#7c3aed" opacity=".22"/>`;
  const p1x = 220, pw = 300, py = 100, ph = 600;
  let s1 = '';
  s1 += T(p1x + pw / 2, py + 120, 'نصب شد ✓', { size: 20, fill: '#fff', anchor: 'middle', weight: 800 });
  s1 += T(p1x + pw / 2, py + 146, 'اپ روی صفحه اصلی قرار گرفت', { size: 12.5, fill: '#8fa0c2', anchor: 'middle' });
  const apps = [['فروشگاه', '#6366f1', 'ف'], ['پیام‌ها', '#06b6d4', 'پ'], ['بانک', '#10b981', 'ب'], ['تقویم', '#f59e0b', 'ت'], ['آب‌وهوا', '#3b82f6', 'ه'], ['یادداشت', '#8b5cf6', 'ی'], ['اپ من', '#db2777', 'م'], ['تنظیمات', '#64748b', 'ت']];
  apps.forEach((a, i) => {
    const ax = p1x + 34 + (i % 4) * 62, ay = py + 170 + Math.floor(i / 4) * 92;
    s1 += R(ax, ay, 52, 52, 14, a[1]) + T(ax + 26, ay + 35, a[2], { size: 22, fill: '#fff', anchor: 'middle', weight: 800 });
    s1 += T(ax + 26, ay + 72, a[0], { size: 10.5, fill: '#dbe3f5', anchor: 'middle' });
  });
  s1 += R(p1x + 34, py + 364, pw - 68, 60, 16, '#1a2440');
  s1 += T(p1x + pw - 50, py + 390, 'اپ من', { size: 13.5, fill: '#fff', weight: 700 });
  s1 += T(p1x + pw - 50, py + 410, 'برای اجرا لمس کنید', { size: 11, fill: '#8fa0c2' });
  b += phoneShell(key + 'a', p1x, py, pw, ph, '#101728', { body: s1 });
  const p2x = 760;
  let s2 = '';
  s2 += T(p2x + pw - 24, py + 100, 'اعلان‌ها', { size: 20, fill: '#fff', weight: 800 });
  s2 += T(p2x + 24, py + 100, 'پاک کردن همه', { size: 11.5, fill: '#a5b4fc', anchor: 'start' });
  [['🔔 سفارش جدید #۱۲۵۹ ثبت شد', 'همین حالا', true], ['📦 سفارش #۱۲۵۴ ارسال شد', '۲ ساعت پیش', false], ['💬 پیام جدید از پشتیبانی', 'دیروز', false], ['🎁 کد تخفیف ۲۰٪ برای شما', '۲ روز پیش', false]].forEach((n, i) => {
    const ay = py + 120 + i * 92;
    s2 += R(p2x + 20, ay, pw - 40, 80, 14, n[2] ? 'rgba(99,102,241,.18)' : '#1a2440', n[2] ? { stroke: '#6366f1', sw: 1.5 } : {});
    s2 += T(p2x + pw - 36, ay + 30, n[0], { size: 12.5, fill: '#fff', weight: 700 });
    s2 += T(p2x + pw - 36, ay + 52, n[1], { size: 11, fill: '#8fa0c2' });
    s2 += T(p2x + 36, ay + 52, 'مشاهده ←', { size: 11, fill: '#a5b4fc', anchor: 'start' });
  });
  s2 += R(p2x + 20, py + 500, pw - 40, 60, 14, '#10b981');
  s2 += T(p2x + pw / 2, py + 536, '✓ اعلان‌ها فعال است', { size: 14, fill: '#fff', anchor: 'middle', weight: 800 });
  b += phoneShell(key + 'b', p2x, py, pw, ph, '#101728', { body: s2 });
  b += T(640, 748, 'نصب در یک لمس  •  اعلان لحظه‌ای  •  اجرا در کمتر از ۲ ثانیه', { size: 15, fill: '#c4b5fd', anchor: 'middle' });
  return { defs, body: b };
});

// ---------------- P9: AI chatbot (dark) ----------------
add('p9-ai-1.svg', 'چت‌بات هوشمند - گفت‌وگو', (key) => {
  const p = D;
  const defs = glowDefs(key, '#101a30', '#0b1220');
  let b = pageBg(key, p) + browserChrome(p, 'https://ai.example.com/chat', 'دستیار هوشمند');
  const cy = 92;
  b += sideBar(p, W - 24 - 224, cy, 224, H - cy - 24, 'گفت‌وگوها', [
    { t: 'پیگیری سفارش', active: true }, { t: 'پشتیبانی فروشگاه' }, { t: 'سؤال درباره تخفیف' }, { t: 'بازگشت کالا' }, { t: 'گفت‌وگوی جدید ＋' }
  ]);
  const cx = 24, cw = W - 24 - 224 - 48;
  b += R(cx, cy, cw, 64, 14, p.card, { stroke: p.border });
  b += avatar(cx + cw - 48, cy + 32, 19, 'ه', p.pri);
  b += T(cx + cw - 78, cy + 28, 'دستیار هوشمند', { size: 16, fill: p.text, weight: 800 });
  b += T(cx + cw - 78, cy + 48, '● آنلاین — معمولاً در ۳ ثانیه پاسخ می‌دهد', { size: 12, fill: p.grn });
  b += pill(cx + 110, cy + 19, 'فارسی ▾', p.card2, p.mut, 12.5);
  const chatY = cy + 80, chatH = H - chatY - 120;
  b += R(cx, chatY, cw, chatH, 16, p.bg2, { stroke: p.border });
  const msgs = [
    ['bot', 'سلام! 👋 چطور می‌تونم کمکتون کنم؟', '۱۰:۲۴'],
    ['user', 'سلام، می‌خوام سفارشم رو پیگیری کنم', '۱۰:۲۵'],
    ['bot', 'حتماً! لطفا شماره سفارش رو بفرستید', '۱۰:۲۵'],
    ['user', '۱۲۵۹', '۱۰:۲۵'],
    ['bot', 'LONG', '۱۰:۲۵', true]
  ];
  let my = chatY + 24;
  msgs.forEach(m => {
    const isUser = m[0] === 'user';
    if (m[3]) {
      const bw = 520, bx = cx + 24, bhh = 96;
      b += R(bx, my, bw, bhh, 16, p.card2);
      b += T(bx + bw - 20, my + 28, 'سفارش ۱۲۵۹ شما دیروز ارسال شد و هم‌اکنون', { size: 13.5, fill: p.text });
      b += T(bx + bw - 20, my + 52, 'در مرکز تجزیه تهران است 📦', { size: 13.5, fill: p.text });
      b += T(bx + bw - 20, my + 76, 'کد رهگیری: ۱۹۰۴۵۵۷۷۲۲۰۰۱۲', { size: 12.5, fill: p.cyn });
      b += T(bx + 16, my + bhh - 8, m[2], { size: 10, fill: p.dim, anchor: 'start' });
      my += bhh + 14;
      return;
    }
    const tww = tw(m[1], 13.5), bw = Math.min(cw - 220, tww + 110);
    const bx = isUser ? cx + cw - 24 - bw : cx + 24;
    b += R(bx, my, bw, 52, 16, isUser ? p.pri : p.card2);
    b += T(bx + bw - 20, my + 26, m[1], { size: 13.5, fill: isUser ? '#fff' : p.text });
    b += T(bx + 16, my + 44, m[2] + (isUser ? ' ✓✓' : ''), { size: 10, fill: isUser ? '#d5d9ff' : p.dim, anchor: 'start' });
    my += 66;
  });
  b += R(cx + cw - 220, my + 2, 196, 38, 19, 'none', { stroke: p.pri, sw: 1.5 }) + T(cx + cw - 122, my + 27, 'پیگیری سفارش', { size: 13, fill: '#a5b4fc', anchor: 'middle', weight: 700 });
  b += R(cx + cw - 440, my + 2, 208, 38, 19, 'none', { stroke: p.border, sw: 1.5 }) + T(cx + cw - 336, my + 27, 'گفت‌وگو با اپراتور', { size: 13, fill: p.mut, anchor: 'middle', weight: 700 });
  b += R(cx, H - 88, cw, 64, 14, p.card, { stroke: p.border });
  b += R(cx + 80, H - 76, cw - 180, 40, 20, p.input, { stroke: p.border }) + T(cx + cw - 116, H - 50, 'پیامت را بنویس…', { size: 13.5, fill: p.dim });
  b += C(cx + 52, H - 56, 20, p.pri) + T(cx + 52, H - 49, '➤', { size: 15, fill: '#fff', anchor: 'middle' });
  return { defs, body: b };
});
add('p9-ai-2.svg', 'چت‌بات هوشمند - دانش و زبان', (key) => {
  const p = D;
  const defs = glowDefs(key, '#101a30', '#0b1220');
  let b = pageBg(key, p) + browserChrome(p, 'https://ai.example.com/knowledge', 'دانش ربات');
  const cy = 92;
  b += sideBar(p, W - 24 - 224, cy, 224, H - cy - 24, 'دستیار هوشمند', [
    { t: 'گفت‌وگوها' }, { t: 'پایگاه دانش', active: true }, { t: 'زبان‌ها' }, { t: 'اپراتورها' }, { t: 'تحلیل‌ها' }, { t: 'تنظیمات' }
  ]);
  const cx = 24, cw = W - 24 - 224 - 48;
  b += T(cx + cw, cy + 8, 'پایگاه دانش', { size: 24, fill: p.text, weight: 800 });
  b += T(cx + cw, cy + 34, '۱۲۴ سؤال و جواب — آخرین آموزش: ۲ ساعت پیش', { size: 13.5, fill: p.mut });
  b += btn(cx + 170, cy - 2, 170, 38, '＋ افزودن دانش', p, true);
  b += panel(p, cx, cy + 52, cw * .62, 300, 'سؤالات پرتکرار', 'آموزش مجدد ⟳');
  const t = table(p, cx + 20, cy + 106, cw * .62 - 40,
    [{ w: 240 }, { w: 130 }, { w: 110 }, { w: 90 }],
    ['سؤال', 'دسته', 'بازدید', 'وضعیت'],
    [
      ['چطور سفارشم را پیگیری کنم؟', 'سفارش', '۱٬۲۴۰', { pill: ['فعال', p.grnSoft, p.grn] }],
      ['شرایط بازگشت کالا چیست؟', 'بازگشت', '۸۶۰', { pill: ['فعال', p.grnSoft, p.grn] }],
      ['کد تخفیف کجا وارد می‌شود؟', 'تخفیف', '۶۴۰', { pill: ['فعال', p.grnSoft, p.grn] }],
      ['هزینه ارسال چقدر است؟', 'ارسال', '۵۲۰', { pill: ['پیش‌نویس', p.ambSoft, p.amb] }]
    ], { rowH: 46 });
  b += t.svg;
  b += panel(p, cx + cw * .62 + 16, cy + 52, cw * .38 - 16, 300, 'زبان‌ها', '');
  [['فارسی', '۹۸٪ دقت', true], ['English', '۹۶٪ دقت', true], ['العربية', 'به‌زودی', false]].forEach((lg, i) => {
    const ry = cy + 122 + i * 68, lx = cx + cw * .62 + 16, lw = cw * .38 - 16;
    b += T(lx + lw - 24, ry + 16, lg[0], { size: 14.5, fill: p.text, weight: 700 });
    b += T(lx + lw - 24, ry + 38, lg[1], { size: 12, fill: p.dim });
    b += toggle(p, lx + 24, ry + 8, lg[2]);
  });
  const hy = cy + 368, hh = H - hy - 24;
  b += panel(p, cx, hy, cw * .5 - 8, hh, 'انتقال به اپراتور انسانی', '');
  b += T(cx + cw * .5 - 32, hy + 92, 'انتقال خودکار هنگام افت اطمینان', { size: 13.5, fill: p.text });
  b += toggle(p, cx + 24, hy + 78, true);
  b += T(cx + cw * .5 - 32, hy + 130, 'آستانه اطمینان: ۷۵٪', { size: 13, fill: p.mut });
  b += hbar(cx + 24, hy + 142, cw * .5 - 56, 12, .75, p.pri, p.bar);
  b += T(cx + cw * .5 - 32, hy + 178, 'اپراتورهای آنلاین: ۳ نفر', { size: 12.5, fill: p.grn });
  b += R(cx + 24, hy + 196, 200, 40, 12, p.pri) + T(cx + 124, hy + 222, 'مدیریت اپراتورها', { size: 13.5, fill: '#fff', anchor: 'middle', weight: 700 });
  b += panel(p, cx + cw * .5 + 8, hy, cw * .5 - 8, hh, 'حافظه مکالمه', '');
  b += T(cx + cw - 32, hy + 92, 'به‌خاطر سپردن سلیقه هر کاربر', { size: 13.5, fill: p.text });
  b += toggle(p, cx + cw * .5 + 32, hy + 78, true);
  [['نام و شهر کاربر', '✓'], ['سفارش‌های قبلی', '✓'], ['موضوع گفت‌وگوهای قبل', '✓']].forEach((mm, i) => {
    b += T(cx + cw - 56, hy + 132 + i * 34, mm[0], { size: 13, fill: p.mut });
    b += T(cx + cw - 40, hy + 132 + i * 34, mm[1], { size: 14, fill: p.grn, weight: 800 });
  });
  return { defs, body: b };
});
add('p9-ai-3.svg', 'چت‌بات هوشمند - تحلیل گفت‌وگوها', (key) => {
  const p = D;
  const defs = glowDefs(key, '#101a30', '#0b1220');
  let b = pageBg(key, p) + browserChrome(p, 'https://ai.example.com/insights', 'تحلیل‌ها');
  const cy = 92;
  b += sideBar(p, W - 24 - 224, cy, 224, H - cy - 24, 'دستیار هوشمند', [
    { t: 'گفت‌وگوها' }, { t: 'پایگاه دانش' }, { t: 'زبان‌ها' }, { t: 'اپراتورها' }, { t: 'تحلیل‌ها', active: true }, { t: 'تنظیمات' }
  ]);
  const cx = 24, cw = W - 24 - 224 - 48;
  b += T(cx + cw, cy + 8, 'تحلیل گفت‌وگوها', { size: 24, fill: p.text, weight: 800 });
  const kw = (cw - 36) / 4, ky = cy + 52;
  [['گفت‌وگو امروز', '۳۴۲', 'رشد ۱۵٪', true], ['رضایت کاربران', '۹۲٪', 'رشد ۴٪', true], ['پاسخ خودکار', '۸۷٪', 'رشد ۶٪', true], ['میانگین پاسخ', '۳ ثانیه', 'بهبود ۱ ثانیه', true]].forEach((k, i) => {
    b += kpi(p, cx + (3 - i) * (kw + 12), ky, kw, 104, k[0], k[1], k[2], k[3], 23);
  });
  const my = ky + 124, mh = 260;
  b += panel(p, cx, my, cw * .58, mh, 'حجم گفت‌وگوها', '۷ روز گذشته');
  b += vbars(cx + 24, my + 66, cw * .58 - 140, mh - 120, [.5, .62, .58, .75, .7, .88, .95], p.vio, { gap: 14 });
  ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'].forEach((t, i) => {
    b += T(cx + cw * .58 - 150 - i * ((cw * .58 - 190) / 7), my + mh - 14, t, { size: 10, fill: p.dim, anchor: 'middle' });
  });
  b += R(cx + cw * .58 - 110, my + 66, 86, mh - 100, 12, p.card2);
  b += T(cx + cw * .58 - 67, my + 110, 'اوج', { size: 12, fill: p.mut, anchor: 'middle' });
  b += T(cx + cw * .58 - 67, my + 136, 'جمعه', { size: 14, fill: p.text, anchor: 'middle', weight: 800 });
  b += T(cx + cw * .58 - 67, my + 158, '۵۸ گفت‌وگو', { size: 11.5, fill: p.dim, anchor: 'middle' });
  b += panel(p, cx + cw * .58 + 16, my, cw * .42 - 16, mh, 'موضوعات پرتکرار', '');
  [['پیگیری سفارش', .9], ['بازگشت کالا', .62], ['تخفیف‌ها', .48], ['ساعت کاری', .3]].forEach((tp, i) => {
    const ry = my + 66 + i * 48, tx0 = cx + cw * .58 + 16, tw0 = cw * .42 - 16;
    b += T(tx0 + tw0 - 24, ry + 14, tp[0], { size: 12.5, fill: p.text });
    b += hbar(tx0 + 24, ry + 22, tw0 - 48, 12, tp[1], p.pri, p.bar);
  });
  const fy = my + mh + 16, fh = H - fy - 24;
  b += panel(p, cx, fy, cw, fh, 'آخرین بازخوردها', 'میانگین ۴٫۶ از ۵');
  const fb = [
    ['سارا م.', 'عالی بود، سریع جواب گرفتم!', '★ ۵', '#10b981'],
    ['علی ر.', 'کد رهگیری رو درست پیدا کرد', '★ ۵', '#6366f1'],
    ['مریم ک.', 'کاش ساعت کاری رو هم می‌دونست', '★ ۴', '#f59e0b']
  ];
  fb.forEach((f, i) => {
    const fx = cx + 24 + (2 - i) * ((cw - 48 - 32) / 3 + 16), fw = (cw - 48 - 32) / 3;
    b += R(fx, fy + 54, fw, fh - 78, 12, p.card2);
    b += avatar(fx + fw - 40, fy + 84, 15, f[0].slice(0, 1), f[3]);
    b += T(fx + fw - 64, fy + 89, f[0], { size: 13, fill: p.text, weight: 700 });
    b += T(fx + 16, fy + 89, f[2], { size: 12, fill: p.amb, anchor: 'start', weight: 700 });
    b += T(fx + fw - 24, fy + 114, f[1], { size: 12.5, fill: p.mut });
  });
  return { defs, body: b };
});

// ---------- write ----------
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
shots.forEach((s, i) => {
  const key = 'k' + i;
  const { defs, body } = s.make(key);
  fs.writeFileSync(path.join(OUT, s.file), svgDoc(key, s.title, defs, body), 'utf8');
  console.log('wrote', s.file);
});
console.log('done: ' + shots.length + ' shots');
