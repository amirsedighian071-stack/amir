/*
 * Generates the portfolio gallery screenshots (assets/img/projects/*.jpg).
 *
 * Every slide is a flat, realistic Persian UI screenshot (desktop browser or
 * phone) rendered from vector mockups: RTL layout, Vazirmatn typeface, real
 * product photos embedded where relevant. Run:
 *
 *     node scripts/build-project-shots.cjs
 *
 * Requires the `sharp` and `vazirmatn` devDependencies and the Vazirmatn
 * TTFs registered with fontconfig (see scripts/install-shot-fonts.sh).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'img', 'projects');
const PRODUCTS = path.join(ROOT, 'assets', 'img', 'products');

const FA = 'Vazirmatn';
const LA = 'DejaVu Sans';
const MO = 'DejaVu Sans Mono';

// ---------------------------------------------------------------- utilities
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const fa = s => String(s).replace(/\d/g, d => FA_DIGITS[+d]);
const faNum = n => fa(String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '٬'));
const faDate = (y, m, d) => `${fa(y)}/${fa(String(m).padStart(2, '0'))}/${fa(String(d).padStart(2, '0'))}`;

// text element; a: start|middle|end  (anchors behave on the bbox, RTL-safe)
function T(x, y, s, o = {}) {
    const fam = o.fam || FA;
    return `<text x="${x}" y="${y}" font-family="${fam}" font-size="${o.size || 14}" font-weight="${o.w || 400}" fill="${o.c || '#0f172a'}" text-anchor="${o.a || 'start'}"${o.ls ? ` letter-spacing="${o.ls}"` : ''}${o.op != null ? ` opacity="${o.op}"` : ''}>${esc(s)}</text>`;
}
function R(x, y, w, h, fill, o = {}) {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx != null ? o.rx : 0}" fill="${fill}"${o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw || 1}"` : ''}${o.op != null ? ` opacity="${o.op}"` : ''}${o.filter ? ` filter="url(#${o.filter})"` : ''}${o.clip ? ` clip-path="url(#${o.clip})"` : ''}/>`;
}
function L(x1, y1, x2, y2, stroke, sw = 1, o = {}) {
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.op != null ? ` opacity="${o.op}"` : ''}${o.cap ? ` stroke-linecap="${o.cap}"` : ''}/>`;
}
function C(cx, cy, r, fill, o = {}) {
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw || 1}"` : ''}${o.op != null ? ` opacity="${o.op}"` : ''}/>`;
}
function P(d, o = {}) {
    return `<path d="${d}" fill="${o.fill || 'none'}" stroke="${o.stroke || 'none'}" stroke-width="${o.sw || 1}"${o.cap ? ` stroke-linecap="${o.cap}" stroke-linejoin="round"` : ''}${o.op != null ? ` opacity="${o.op}"` : ''}/>`;
}
// deterministic pseudo random
function rng(seed) { let s = seed >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }

// ------------------------------------------------------------------- icons
function icon(name, x, y, s, color, sw = 1.8) {
    // x,y = top-left of an s×s box
    const k = s / 24;
    const g = (inner) => `<g transform="translate(${x},${y}) scale(${k})">${inner}</g>`;
    const st = { stroke: color, sw, cap: 'round' };
    switch (name) {
        case 'search': return g(C(10.5, 10.5, 6.5, 'none', st) + L(15.5, 15.5, 20.5, 20.5, color, sw, { cap: 'round' }));
        case 'bell': return g(P('M12 3a6 6 0 0 0-6 6v4l-2 3v1h16v-1l-2-3V9a6 6 0 0 0-6-6z', st) + P('M10 19a2 2 0 0 0 4 0', st));
        case 'cart': return g(P('M3 4h2l2.6 11.2a1.5 1.5 0 0 0 1.5 1.2h7.9a1.5 1.5 0 0 0 1.5-1.2L21 8H6', st) + C(9.5, 20, 1.6, color) + C(17, 20, 1.6, color));
        case 'home': return g(P('M4 11l8-7 8 7', st) + P('M6 10v10h12V10', st));
        case 'user': return g(C(12, 8, 4, 'none', st) + P('M4 20c1.5-4 5-5.5 8-5.5s6.5 1.5 8 5.5', st));
        case 'users': return g(C(9, 8.5, 3.5, 'none', st) + P('M2.5 19c1.2-3.4 4-4.8 6.5-4.8s5.3 1.4 6.5 4.8', st) + P('M16 5.6a3.5 3.5 0 0 1 0 6.6M17.5 14.6c2 .6 3.6 2 4.3 4.4', st));
        case 'chart': return g(L(4, 20, 20, 20, color, sw, { cap: 'round' }) + L(4, 20, 4, 4, color, sw, { cap: 'round' }) + P('M7 15l4-5 3 3 5-7', st));
        case 'bars': return g(L(6, 20, 6, 12, color, sw + .6, { cap: 'round' }) + L(12, 20, 12, 6, color, sw + .6, { cap: 'round' }) + L(18, 20, 18, 15, color, sw + .6, { cap: 'round' }));
        case 'gear': return g(C(12, 12, 3.2, 'none', st) + P('M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M18.5 5.5l-2.1 2.1M7.6 16.4l-2.1 2.1', st));
        case 'send': return g(P('M21 3L10 14', st) + P('M21 3l-7 18-4-7-7-4 18-7z', st));
        case 'check': return g(P('M4.5 12.5l5 5 10-11', st));
        case 'check-circle': return g(C(12, 12, 9, 'none', st) + P('M8 12.5l2.8 2.8 5.4-6', st));
        case 'menu': return g(L(4, 7, 20, 7, color, sw, { cap: 'round' }) + L(4, 12, 20, 12, color, sw, { cap: 'round' }) + L(4, 17, 20, 17, color, sw, { cap: 'round' }));
        case 'close': return g(L(6, 6, 18, 18, color, sw, { cap: 'round' }) + L(18, 6, 6, 18, color, sw, { cap: 'round' }));
        case 'plus': return g(L(12, 5, 12, 19, color, sw, { cap: 'round' }) + L(5, 12, 19, 12, color, sw, { cap: 'round' }));
        case 'zoom': return g(C(10.5, 10.5, 6.5, 'none', st) + L(15.5, 15.5, 20.5, 20.5, color, sw, { cap: 'round' }) + L(8, 10.5, 13, 10.5, color, sw, { cap: 'round' }) + L(10.5, 8, 10.5, 13, color, sw, { cap: 'round' }));
        case 'chat': return g(P('M4 5h16v11H9l-5 4V5z', st));
        case 'server': return g(R(3.5, 4, 17, 6.5, 'none', { rx: 2, stroke: color, sw }) + R(3.5, 13.5, 17, 6.5, 'none', { rx: 2, stroke: color, sw }) + C(7, 7.2, 1.1, color) + C(7, 16.7, 1.1, color));
        case 'shield': return g(P('M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z', st));
        case 'cloud': return g(P('M7 18a4 4 0 0 1-.6-7.9A5.5 5.5 0 0 1 17 8.6 4.2 4.2 0 0 1 17.5 18H7z', st));
        case 'doc': return g(P('M6 3h8l4 4v14H6V3z', st) + L(9, 11, 15, 11, color, sw, { cap: 'round' }) + L(9, 15, 15, 15, color, sw, { cap: 'round' }));
        case 'folder': return g(P('M3.5 6h6l2 2.5h9V19h-17V6z', st));
        case 'download': return g(P('M12 4v10M8 10.5l4 4 4-4', st) + L(5, 19.5, 19, 19.5, color, sw, { cap: 'round' }));
        case 'star': return g(P('M12 3.6l2.5 5.2 5.7.7-4.2 3.9 1.1 5.6-5.1-2.8-5.1 2.8 1.1-5.6-4.2-3.9 5.7-.7L12 3.6z', st));
        case 'box': return g(P('M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z', st) + P('M4 7.5l8 4.5 8-4.5M12 12v9', st));
        case 'card': return g(R(3, 5.5, 18, 13, 'none', { rx: 2.5, stroke: color, sw }) + L(3, 10, 21, 10, color, sw) + L(6.5, 14.5, 11, 14.5, color, sw, { cap: 'round' }));
        case 'phone': return g(R(7.5, 3, 9, 18, 'none', { rx: 2.5, stroke: color, sw }) + L(10.5, 18, 13.5, 18, color, sw, { cap: 'round' }));
        case 'mail': return g(R(3.5, 5.5, 17, 13, 'none', { rx: 2, stroke: color, sw }) + P('M4 7l8 6 8-6', st));
        case 'lock': return g(R(5.5, 10.5, 13, 9.5, 'none', { rx: 2, stroke: color, sw }) + P('M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5', st));
        case 'eye': return g(P('M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12z', st) + C(12, 12, 2.8, 'none', st));
        case 'refresh': return g(P('M19.5 12a7.5 7.5 0 1 1-2.2-5.3', st) + P('M19.8 4.5v4h-4', st));
        case 'back': return g(P('M9 5l7 7-7 7', st));           // RTL "back" points right
        case 'chev-l': return g(P('M14 6l-6 6 6 6', st));
        case 'chev-r': return g(P('M10 6l6 6-6 6', st));
        case 'kebab': return g(C(12, 5.5, 1.7, color) + C(12, 12, 1.7, color) + C(12, 18.5, 1.7, color));
        case 'filter': return g(P('M4 5h16l-6 7v6l-4 2v-8L4 5z', st));
        case 'calendar': return g(R(4, 5.5, 16, 15, 'none', { rx: 2, stroke: color, sw }) + L(4, 10, 20, 10, color, sw) + L(8.5, 3.5, 8.5, 7, color, sw, { cap: 'round' }) + L(15.5, 3.5, 15.5, 7, color, sw, { cap: 'round' }));
        case 'copy': return g(R(8, 8, 12, 12, 'none', { rx: 2, stroke: color, sw }) + P('M5.5 15.5H4.5v-11h11v1', st));
        case 'wifi-off': return g(P('M3 3l18 18', st) + P('M5 10a11 11 0 0 1 5.2-2.9M12.5 7.1A11 11 0 0 1 19 10M8.5 13.5a6.5 6.5 0 0 1 3-1.6M12 18h.01', st));
        case 'robot': return g(R(5, 8, 14, 10, 'none', { rx: 3, stroke: color, sw }) + L(12, 4.5, 12, 8, color, sw) + C(12, 4, 1.3, color) + C(9.5, 12.5, 1.3, color) + C(14.5, 12.5, 1.3, color) + L(9.5, 15.5, 14.5, 15.5, color, sw, { cap: 'round' }));
        case 'logout': return g(P('M14 4h-9v16h9', st) + P('M10 12h10M17 8.5l3.5 3.5-3.5 3.5', st));
        case 'play': return g(P('M8 5.5l11 6.5-11 6.5v-13z', st));
        case 'pin': return g(P('M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11z', st) + C(12, 10, 2.6, 'none', st));
        case 'wallet': return g(R(3.5, 6, 17, 13, 'none', { rx: 2.5, stroke: color, sw }) + P('M3.5 9.5h17', st) + C(16.5, 14.5, 1.3, color));
        case 'clock': return g(C(12, 12, 8.5, 'none', st) + P('M12 7.5V12l3 2', st));
        case 'clip': return g(P('M20 11.5l-8.2 8.2a5 5 0 0 1-7-7L13 4.5a3.3 3.3 0 0 1 4.7 4.7L9.6 17.3a1.7 1.7 0 0 1-2.4-2.4l7.5-7.5', st));
        case 'mic': return g(R(9.5, 3.5, 5, 10, 'none', { rx: 2.5, stroke: color, sw }) + P('M6 11.5a6 6 0 0 0 12 0M12 17.5V21', st));
        case 'emoji': return g(C(12, 12, 8.5, 'none', st) + C(9, 10, 1.2, color) + C(15, 10, 1.2, color) + P('M8.5 14a4.5 4.5 0 0 0 7 0', st));
        default: return g(C(12, 12, 8, 'none', { stroke: color, sw }));
    }
}

// ------------------------------------------------------------- photo embed
const photoCache = {};
function photo(file) {
    if (!photoCache[file]) photoCache[file] = fs.readFileSync(path.join(PRODUCTS, file)).toString('base64');
    return `data:image/jpeg;base64,${photoCache[file]}`;
}
function img(file, x, y, w, h, clipId) {
    return `<image href="${photo(file)}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${clipId})"/>`;
}

// ------------------------------------------------------------------ themes
const TH = {
    light: { bg: '#f1f5f9', surface: '#ffffff', surface2: '#f8fafc', border: '#e2e8f0', text: '#0f172a', sub: '#64748b', mute: '#94a3b8' },
    dark: { bg: '#0f172a', surface: '#1e293b', surface2: '#16233b', border: '#334155', text: '#f1f5f9', sub: '#94a3b8', mute: '#64748b' }
};
const ACC = { indigo: '#6366f1', violet: '#8b5cf6', blue: '#3b82f6', green: '#10b981', amber: '#f59e0b', red: '#ef4444', teal: '#14b8a6', orange: '#f6821f', tg: '#229ed9' };

// ----------------------------------------------------------- shared pieces
function defs(sh = true) {
    return `<defs>
    ${sh ? `<filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="4" stdDeviation="10" flood-color="#0f172a" flood-opacity="0.10"/></filter>
    <filter id="sh2" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="10" stdDeviation="22" flood-color="#0f172a" flood-opacity="0.22"/></filter>` : ''}
    </defs>`;
}
function pill(cx, cy, label, color, t, o = {}) {
    const w = o.w || (label.length * 7.4 + (o.size || 12) + 22);
    const h = o.h || 26;
    return R(cx - w / 2, cy - h / 2, w, h, color, { rx: h / 2, op: o.bgOp != null ? o.bgOp : 0.14 }) +
        T(cx, cy + (o.size || 12) * 0.36, label, { size: o.size || 12, w: 600, c: o.text || color, a: 'middle' }) +
        (o.dot ? C(cx + w / 2 - 12, cy, 3.2, color) : '');
}
function btn(x, y, w, h, label, kind, t, accent, o = {}) {
    const fill = kind === 'primary' ? accent : 'none';
    const tc = kind === 'primary' ? '#ffffff' : kind === 'ghost' ? t.sub : accent;
    return R(x, y, w, h, fill, { rx: o.rx != null ? o.rx : 10, stroke: kind === 'primary' ? 'none' : t.border, sw: 1.2 }) +
        (o.icon ? icon(o.icon, x + 14, y + (h - 18) / 2, 18, tc) : '') +
        T(x + w / 2 + (o.icon ? 9 : 0), y + h / 2 + 5, label, { size: o.size || 14, w: 600, c: tc, a: 'middle' });
}
function field(x, y, w, h, label, value, t, o = {}) {
    return T(x + w, y - 8, label, { size: 12.5, w: 500, c: t.sub, a: 'end' }) +
        R(x, y, w, h, o.fill || t.surface2, { rx: 10, stroke: o.focus ? ACC.indigo : t.border, sw: o.focus ? 1.6 : 1.2 }) +
        T(x + w - 14, y + h / 2 + 5, value, { size: 13.5, c: o.ph ? t.mute : t.text, a: 'end' }) +
        (o.chev ? icon('chev-l', x + 12, y + (h - 16) / 2, 16, t.mute) : '');
}
function toggle(x, y, on, accent) {
    return R(x, y, 44, 24, on ? accent : '#cbd5e1', { rx: 12 }) + C(on ? x + 32 : x + 12, y + 12, 9, '#ffffff');
}
function progress(x, y, w, h, pct, color, t) {
    const fw = Math.max(h, w * pct / 100);
    return R(x, y, w, h, t.border, { rx: h / 2, op: .6 }) + R(x + w - fw, y, fw, h, color, { rx: h / 2 });
}
function spark(x, y, w, h, pts, color) {
    const n = pts.length - 1;
    const d = pts.map((p, i) => `${i ? 'L' : 'M'}${(x + w * i / n).toFixed(1)},${(y + h - p * h).toFixed(1)}`).join('');
    return P(d, { stroke: color, sw: 2, cap: 'round' });
}
function areaChart(x, y, w, h, pts, color, t, o = {}) {
    const n = pts.length - 1;
    const px = i => x + w * i / n, py = p => y + h - p * h;
    let d = `M${px(0)},${py(pts[0])}`;
    for (let i = 1; i <= n; i++) {
        const cx = (px(i - 1) + px(i)) / 2;
        d += ` C${cx},${py(pts[i - 1])} ${cx},${py(pts[i])} ${px(i)},${py(pts[i])}`;
    }
    let out = '';
    for (let g = 0; g <= 4; g++) out += L(x, y + h * g / 4, x + w, y + h * g / 4, t.border, 1, { op: .7 });
    const gid = 'ag' + Math.round(x + y + w);
    out += `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity="0.28"/><stop offset="1" stop-color="${color}" stop-opacity="0.02"/></linearGradient></defs>`;
    out += P(`${d} L${px(n)},${y + h} L${px(0)},${y + h} Z`, { fill: `url(#${gid})` });
    out += P(d, { stroke: color, sw: 2.6, cap: 'round' });
    if (o.series2) {
        const q = o.series2;
        let d2 = `M${px(0)},${py(q[0])}`;
        for (let i = 1; i <= n; i++) { const cx = (px(i - 1) + px(i)) / 2; d2 += ` C${cx},${py(q[i - 1])} ${cx},${py(q[i])} ${px(i)},${py(q[i])}`; }
        out += P(d2, { stroke: o.color2 || t.mute, sw: 2, dash: '6 6', cap: 'round' });
    }
    if (o.dotAt != null) { const i = o.dotAt; out += C(px(i), py(pts[i]), 5.5, color, { stroke: t.surface, sw: 3 }); }
    return out;
}
function barChart(x, y, w, h, vals, color, t, o = {}) {
    const n = vals.length, bw = w / n * (o.gap || 0.52);
    let out = '';
    for (let g = 0; g <= 3; g++) out += L(x, y + h * g / 3, x + w, y + h * g / 3, t.border, 1, { op: .7 });
    vals.forEach((v, i) => {
        const cx = x + w * (i + .5) / n, bh = Math.max(4, v * h);
        out += R(cx - bw / 2, y + h - bh, bw, bh, i === (o.hl != null ? o.hl : vals.indexOf(Math.max(...vals))) ? color : color, { rx: 6, op: i === (o.hl != null ? o.hl : vals.indexOf(Math.max(...vals))) ? 1 : .45 });
    });
    return out;
}
function donut(cx, cy, r, segs, t, o = {}) {
    const circ = 2 * Math.PI * r;
    let off = 0, out = C(cx, cy, r, 'none', { stroke: t.border, sw: o.sw || 16, op: .5 });
    segs.forEach(s => {
        const len = circ * s.v / 100;
        out += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${s.c}" stroke-width="${o.sw || 16}" stroke-dasharray="${len - 3} ${circ - len + 3}" stroke-dashoffset="${-off}" transform="rotate(-90 ${cx} ${cy})" stroke-linecap="round"/>`;
        off += len;
    });
    return out;
}
function qr(x, y, size, seed, fg, bg) {
    const n = 21, cell = size / n, r = rng(seed);
    let out = R(x, y, size, size, bg, { rx: 8 });
    const finder = (fx, fy) => {
        out += R(x + fx * cell, y + fy * cell, 7 * cell, 7 * cell, fg, { rx: 2 });
        out += R(x + (fx + 1) * cell, y + (fy + 1) * cell, 5 * cell, 5 * cell, bg);
        out += R(x + (fx + 2) * cell, y + (fy + 2) * cell, 3 * cell, 3 * cell, fg, { rx: 1 });
    };
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        const inF = (i < 8 && j < 8) || (i > n - 9 && j < 8) || (i < 8 && j > n - 9);
        if (!inF && r() > 0.52) out += R(x + i * cell, y + j * cell, cell * .92, cell * .92, fg, { rx: 1 });
    }
    finder(0, 0); finder(n - 7, 0); finder(0, n - 7);
    return out;
}
// desktop browser chrome; returns {y: contentTop, s: svg}
function browser(w, o) {
    const dark = o.theme === 'dark';
    const strip = dark ? '#202124' : '#dee1e6', bar = dark ? '#35363a' : '#ffffff';
    const tabA = dark ? '#35363a' : '#ffffff', tabI = dark ? '#9aa0a6' : '#5f6364';
    const pillBg = dark ? '#202124' : '#f1f3f4', urlC = dark ? '#e8eaed' : '#3c4043';
    let s = R(0, 0, w, 44, strip);
    const tabs = o.tabs || [{ t: o.title }];
    let tx = 84;
    tabs.forEach((tb, i) => {
        const tw = 236;
        if (i === 0) {
            s += P(`M${tx},44 v-26 a8 8 0 0 1 8-8 h${tw - 16} a8 8 0 0 1 8 8 v26 z`, { fill: tabA });
            s += C(tx + 22, 27, 6, o.fav || ACC.indigo);
            s += T(tx + 38, 32, tb.t, { size: 12.5, c: dark ? '#e8eaed' : '#202124', w: 500 });
            s += icon('close', tx + tw - 26, 19, 15, tabI, 1.6);
        } else {
            s += C(tx + 22, 27, 6, tb.fav || '#9aa0a6', { op: .8 });
            s += T(tx + 38, 32, tb.t, { size: 12.5, c: tabI });
        }
        tx += tw + 6;
    });
    s += icon('plus', tx + 6, 15, 17, tabI, 1.8);
    s += R(0, 44, w, 48, bar);
    s += icon('chev-r', 18, 58, 20, tabI, 2);           // RTL: back points right
    s += icon('chev-l', 50, 58, 20, tabI, 2, { op: .45 });
    s += icon('refresh', 82, 58, 20, tabI, 2);
    const pw = w - 330;
    s += R(116, 52, pw, 32, pillBg, { rx: 16 });
    s += icon('lock', 130, 60, 15, ACC.green, 2);
    s += T(154, 73, o.url, { size: 13, fam: LA, c: urlC });
    s += icon('star', 116 + pw - 30, 60, 16, tabI, 1.8);
    s += C(w - 150, 68, 13, o.avatar || ACC.violet);
    s += T(w - 150, 73, 'ا', { size: 12, w: 700, c: '#fff', a: 'middle' });
    s += icon('kebab', w - 118, 58, 20, tabI, 2);
    return { y: 92, s };
}
// phone status bar (iOS-like); returns {y, s}
function statusbar(w, t, o = {}) {
    const c = o.light ? '#ffffff' : t.text;
    let s = T(34, 30, fa('9:41'), { size: 15, w: 600, c });
    const bx = w - 34;
    s += R(bx - 25, 17, 22, 11, 'none', { rx: 3, stroke: c, sw: 1.2, op: .9 }) + R(bx - 23, 19, 14, 7, c, { rx: 1.5 }) + R(bx - 2, 20.5, 2, 4, c, { rx: 1 });
    s += P(`M${bx - 40} 24 a10 10 0 0 1 12 0 M${bx - 37.5} 27 a6.5 6.5 0 0 1 7 0 M${bx - 35} 30 a3 3 0 0 1 2.4 0`, { stroke: c, sw: 1.6, cap: 'round' });
    [-12, -8.5, -5, -1.5].forEach((dx, i) => { s += R(bx - 62 - dx - 3.5, 28 - (i + 1) * 3.2, 3, (i + 1) * 3.2 + 2, c, { rx: 1 }); });
    return { y: 44, s };
}

// =========================================================== SLIDE BUILDERS
const DW = 1500, DH = 950, MW = 660, MH = 1320;

// ---------- P1: telegram shop bot ----------
function tgChat(o) {
    const dark = o.theme === 'dark';
    const t = dark ? { bg: '#0e1621', in: '#182533', out: '#2b5278', text: '#f1f5f9', sub: '#8fa3b8', bar: '#17212b', kb: '#1c2733', kbb: '#2a3a4a' }
        : { bg: '#e7ebf0', in: '#ffffff', out: '#effdde', text: '#0f172a', sub: '#708090', bar: '#ffffff', kb: '#ffffff', kbb: '#dbe1e8' };
    let s = R(0, 0, MW, MH, t.bg);
    const sb = statusbar(MW, { text: t.text }, { light: dark }); s += sb.s;
    // header
    s += R(0, 44, MW, 62, t.bar);
    s += icon('back', 22, 63, 24, dark ? ACC.tg : '#64748b', 2.2);
    s += C(78, 75, 21, o.avatarColor || ACC.violet);
    s += icon('robot', 66, 63, 24, '#ffffff', 2);
    s += T(110, 71, o.title, { size: 16.5, w: 700, c: t.text });
    s += T(110, 91, o.subtitle || 'bot', { size: 12, c: dark ? ACC.tg : '#4c9ac4', fam: o.subtitle ? FA : LA });
    s += icon('search', MW - 96, 64, 22, t.sub, 2);
    s += icon('kebab', MW - 52, 64, 22, t.sub, 2);
    s += L(0, 106, MW, 106, dark ? '#1f2c3a' : '#d5dbe2', 1);
    return { s, top: 106, t, dark };
}
function p1bot1() {
    const { s: head, top, t, dark } = tgChat({ theme: 'dark', title: 'فروشگاه من', avatarColor: ACC.violet });
    let s = head;
    const W = MW * 0.78;
    // date chip
    s += pill(MW / 2, top + 26, fa('امروز'), '#8fa3b8', null, { bgOp: .18, text: '#b6c4d4', size: 12 });
    // outgoing /start
    let y = top + 56;
    const ow = 120;
    s += R(MW - 24 - ow, y, ow, 42, t.out, { rx: 14 });
    s += T(MW - 24 - 14, y + 27, '/start', { size: 14.5, fam: MO, c: '#eaf3fb', a: 'end' });
    s += T(MW - 24 - ow + 12, y + 27, fa('9:41'), { size: 10.5, c: '#bcd6ea', a: 'start' });
    y += 54;
    // incoming welcome
    const iw = W;
    s += R(24, y, iw, 108, t.in, { rx: 14 });
    s += T(40, y + 32, 'سلام! به فروشگاه ما خوش آمدید!', { size: 15, w: 600, c: t.text });
    s += T(40, y + 58, 'لطفاً از دسته‌بندی‌های زیر انتخاب کنید:', { size: 14, c: '#c3d2e0' });
    s += T(40 + iw - 14, y + 92, fa('9:41'), { size: 10.5, c: '#7f93a8', a: 'end' });
    y += 122;
    // product cards message
    const cw = W, ch = 330;
    s += R(24, y, cw, ch, t.in, { rx: 14 });
    s += T(40, y + 32, 'محبوب‌ترین محصولات ما:', { size: 14.5, w: 600, c: t.text });
    const cards = [['hosting-wordpress.jpg', 'هاست وردپرس پرسرعت', '۱٬۲۵۰٬۰۰۰'], ['vpn-v2ray.jpg', 'کانفیگ V2Ray پایدار', '۶۸۰٬۰۰۰'], ['domain-ir.jpg', 'ثبت دامنه ir', '۴۵۰٬۰۰۰']];
    const gap = 10, cwid = (cw - 32 - gap * 2) / 3;
    cards.forEach((cd, i) => {
        const cx = 40 + (cards.length - 1 - i) * (cwid + gap);
        s += `<defs><clipPath id="pc${i}"><rect x="${cx}" y="${y + 46}" width="${cwid}" height="${cwid * 0.86}" rx="10"/></clipPath></defs>`;
        s += img(cd[0], cx, y + 46, cwid, cwid * 0.86, `pc${i}`);
        s += T(cx + cwid / 2, y + 46 + cwid * 0.86 + 24, cd[1], { size: 12, w: 600, c: t.text, a: 'middle' });
        s += T(cx + cwid / 2, y + 46 + cwid * 0.86 + 45, cd[2] + ' تومان', { size: 11.5, c: '#9fb2c6', a: 'middle' });
        s += R(cx + 8, y + 46 + cwid * 0.86 + 56, cwid - 16, 30, ACC.violet, { rx: 8 });
        s += T(cx + cwid / 2, y + 46 + cwid * 0.86 + 76, 'خرید', { size: 12.5, w: 600, c: '#fff', a: 'middle' });
    });
    s += T(40 + cw - 14, y + ch - 14, fa('9:42'), { size: 10.5, c: '#7f93a8', a: 'end' });
    y += ch + 16;
    // reply keyboard
    const kb = [['پرفروش‌ترین‌ها'], ['دسته‌بندی‌ها'], ['پیگیری سفارش', 'کد تخفیف']];
    let ky = MH - 74 - 14 - (kb.length * 54 - 8);
    kb.forEach(row => {
        const rw = (MW - 48 - (row.length - 1) * 8);
        row.forEach((b, i) => {
            const bw = rw / row.length;
            const bx = 24 + i * (bw + 8);
            s += R(bx, ky, bw, 46, t.kb, { rx: 11, stroke: t.kbb, sw: 1 });
            s += T(bx + bw / 2, ky + 29, b, { size: 14, w: 500, c: t.text, a: 'middle' });
        });
        ky += 54;
    });
    // input bar
    s += R(0, MH - 74, MW, 74, t.bar);
    s += C(40, MH - 37, 19, ACC.violet);
    s += icon('menu', 31, MH - 46, 18, '#fff', 2);
    s += icon('clip', 70, MH - 48, 22, t.sub, 2);
    s += R(102, MH - 60, MW - 102 - 96, 46, t.kb, { rx: 23 });
    s += T(122, MH - 31, 'پیام', { size: 14.5, c: '#6d8196' });
    s += icon('mic', MW - 78, MH - 48, 22, t.sub, 2);
    s += C(MW - 36, MH - 37, 19, ACC.violet);
    s += icon('send', MW - 45, MH - 46, 18, '#fff', 2);
    return { w: MW, h: MH, svg: s };
}

function p1bot2() {
    const { s: head, top, t, dark } = tgChat({ theme: 'dark', title: 'فروشگاه من', avatarColor: ACC.violet });
    let s = head;
    let y = top + 26;
    s += pill(MW / 2, y, fa('امروز'), '#8fa3b8', null, { bgOp: .18, text: '#b6c4d4', size: 12 });
    y += 30;
    // outgoing: buy click
    const ow = 210;
    s += R(MW - 24 - ow, y, ow, 42, t.out, { rx: 14 });
    s += T(MW - 38, y + 27, 'خرید هاست وردپرس پرسرعت', { size: 13, a: 'end', c: '#eaf3fb' });
    y += 54;
    // incoming: cart summary
    const iw = MW * 0.8;
    s += R(24, y, iw, 176, t.in, { rx: 14 });
    s += T(40, y + 32, 'سبد خرید شما:', { size: 15, w: 600, c: t.text });
    s += L(40, y + 48, 24 + iw - 16, y + 48, '#243447', 1);
    s += T(24 + iw - 16, y + 74, 'هاست وردپرس پرسرعت × ۱', { size: 13.5, c: '#c3d2e0', a: 'end' });
    s += T(40, y + 74, '۱۲۵۰٬۰۰۰ تومان', { size: 13.5, c: '#c3d2e0' });
    s += T(24 + iw - 16, y + 100, 'کد تخفیف: AMIR10', { size: 13.5, c: '#7ee2b8', a: 'end' });
    s += T(40, y + 100, '−۱۲۵٬۰۰۰ تومان', { size: 13.5, c: '#7ee2b8' });
    s += L(40, y + 118, 24 + iw - 16, y + 118, '#243447', 1);
    s += T(24 + iw - 16, y + 146, 'مبلغ قابل پرداخت:', { size: 14.5, w: 700, c: t.text, a: 'end' });
    s += T(40, y + 146, '۱٬۱۵٬۰۰ تومان', { size: 14.5, w: 700, c: '#7ee2b8' });
    s += T(24 + iw - 14, y + 166, fa('9:44'), { size: 10.5, c: '#7f93a8', a: 'end' });
    // inline pay button
    y += 190;
    s += R(24, y, iw, 48, ACC.violet, { rx: 12 });
    s += icon('card', 44, y + 14, 20, '#fff', 2);
    s += T(24 + iw / 2 + 10, y + 30, 'پرداخت آنلاین', { size: 15, w: 600, c: '#fff', a: 'middle' });
    y += 62;
    // outgoing: paid
    const ow2 = 150;
    s += R(MW - 24 - ow2, y, ow2, 42, t.out, { rx: 14 });
    s += T(MW - 38, y + 27, '✓ پرداخت انجام شد', { size: 13, a: 'end', c: '#eaf3fb' });
    y += 54;
    // incoming invoice with QR
    const ih = 300;
    s += R(24, y, iw, ih, t.in, { rx: 14 });
    s += T(40, y + 34, '✓ سفارش شما ثبت شد', { size: 15.5, w: 700, c: '#7ee2b8' });
    s += T(40, y + 60, 'فاکتور الکترونیکی:', { size: 13.5, c: '#c3d2e0' });
    s += L(40, y + 76, 24 + iw - 16, y + 76, '#243447', 1);
    const rows = [['شماره سفارش', '#140312'], ['تاریخ', faDate(1405, 6, 30)], ['محصول', 'هاست وردپرس پرسرعت'], ['مبلغ پرداختی', '۱٬۱۲۵٬۰۰۰ تومان']];
    rows.forEach((r, i) => {
        s += T(24 + iw - 16, y + 102 + i * 27, r[0], { size: 13, c: '#8fa3b8', a: 'end' });
        s += T(24 + iw - 150, y + 102 + i * 27, r[1], { size: 13, w: 600, c: t.text, a: 'end' });
    });
    s += qr(40, y + 92, 96, 7, '#16222e', '#ffffff');
    s += T(88, y + 208, 'رهگیری مرسوله', { size: 11, c: '#8fa3b8', a: 'middle' });
    s += R(152, y + ih - 62, iw - 176, 40, '#22314a', { rx: 10 });
    s += T(152 + (iw - 176) / 2, y + ih - 37, 'مشاهده وضعیت سفارش', { size: 13, w: 600, c: '#9ec1f0', a: 'middle' });
    s += T(24 + iw - 14, y + ih - 14, fa('9:45'), { size: 10.5, c: '#7f93a8', a: 'end' });
    // input bar
    s += R(0, MH - 74, MW, 74, t.bar);
    s += C(40, MH - 37, 19, ACC.violet); icon('menu', 31, MH - 46, 18, '#fff', 2);
    s += icon('clip', 70, MH - 48, 22, t.sub, 2);
    s += R(102, MH - 60, MW - 102 - 96, 46, t.kb, { rx: 23 });
    s += T(122, MH - 31, 'پیام', { size: 14.5, c: '#6d8196' });
    s += C(MW - 36, MH - 37, 19, ACC.violet);
    s += icon('send', MW - 45, MH - 46, 18, '#fff', 2);
    return { w: MW, h: MH, svg: s };
}

function p1bot3() {
    const t = TH.light, ac = ACC.violet;
    const br = browser(DW, { theme: 'light', url: 'https://bot-panel.amirsedighian.ir/dashboard', title: 'پنل مدیریت ربات', tabs: [{ t: 'پنل مدیریت ربات' }, { t: 'مستندات API', fav: ACC.teal }], fav: ac });
    let s = br.s + R(0, br.y, DW, DH - br.y, t.bg);
    const top = br.y, sideW = 250;
    // RTL sidebar on the right
    s += R(DW - sideW, top, sideW, DH - top, t.surface) + L(DW - sideW, top, DW - sideW, DH, t.border, 1);
    s += C(DW - 40, top + 36, 16, ac); s += icon('robot', DW - 49, top + 27, 18, '#fff', 2);
    s += T(DW - 66, top + 42, 'پنل مدیریت ربات', { size: 15.5, w: 700, c: t.text, a: 'end' });
    const nav = [['chart', 'داشبورد', 1], ['box', 'محصولات', 0], ['card', 'سفارش‌ها', 0], ['users', 'کاربران', 0], ['wallet', 'پرداخت‌ها', 0], ['gear', 'تنظیمات', 0]];
    nav.forEach((n, i) => {
        const ny = top + 78 + i * 46;
        if (n[2]) s += R(DW - sideW + 12, ny, sideW - 24, 40, ac, { rx: 10, op: .12 });
        s += icon(n[0], DW - 48, ny + 10, 20, n[2] ? ac : t.sub, 2);
        s += T(DW - 68, ny + 25, n[1], { size: 14, w: n[2] ? 700 : 500, c: n[2] ? ac : t.sub, a: 'end' });
        if (i === 2) s += pill(DW - sideW + 34, ny + 20, fa(12), ACC.red, null, { size: 10.5, h: 20, bgOp: .16 });
    });
    s += L(DW - sideW + 16, top + 372, DW - 16, top + 372, t.border, 1);
    s += icon('logout', DW - 48, top + 396, 20, t.sub, 2);
    s += T(DW - 68, top + 411, 'خروج از حساب', { size: 13.5, c: t.sub, a: 'end' });
    // topbar
    const cx0 = 32, cx1 = DW - sideW - 32;
    s += T(cx1, top + 44, 'داشبورد فروش', { size: 21, w: 800, c: t.text, a: 'end' });
    s += T(cx1, top + 70, 'نمای کلی عملکرد ربات در ۳۰ روز گذشته', { size: 13, c: t.sub, a: 'end' });
    s += R(cx0, top + 24, 300, 40, t.surface, { rx: 20, stroke: t.border });
    s += icon('search', cx0 + 14, top + 35, 18, t.mute, 2);
    s += T(cx0 + 42, top + 49, 'جست‌وجوی سفارش، کاربر…', { size: 13, c: t.mute });
    s += icon('bell', cx0 + 340, top + 34, 20, t.sub, 2); s += C(cx0 + 352, top + 34, 4.5, ACC.red);
    s += C(cx0 + 396, top + 44, 18, ac); s += T(cx0 + 396, top + 49, 'م', { size: 13, w: 700, c: '#fff', a: 'middle' });
    // KPIs
    const kpis = [['card', 'سفارش امروز', faNum(48), '+۱۲٪ نسبت به دیروز', ACC.green], ['wallet', 'درآمد این ماه', faNum(864000000), 'ریال', ac], ['users', 'کاربران فعال', faNum(2140), '+۳۴۰ کاربر جدید', ACC.blue], ['chat', 'پیام‌های پاسخ‌داده', faNum(15800), '٪۹۹٫۸ موفق', ACC.teal]];
    const kw = (cx1 - cx0 - 3 * 20) / 4;
    kpis.forEach((k, i) => {
        const kx = cx0 + (kpis.length - 1 - i) * (kw + 20);
        s += R(kx, top + 96, kw, 108, t.surface, { rx: 14, filter: 'sh' });
        s += R(kx + kw - 58, top + 116, 40, 40, k[4], { rx: 11, op: .13 });
        s += icon(k[0], kx + kw - 48, top + 126, 20, k[4], 2);
        s += T(kx + 20, top + 130, k[1], { size: 13, c: t.sub });
        s += T(kx + 20, top + 164, k[2], { size: 24, w: 800, c: t.text });
        s += T(kx + 20, top + 188, k[3], { size: 11.5, c: k[4] });
    });
    // chart card
    const chY = top + 228, chH = 330;
    s += R(cx0, chY, (cx1 - cx0) * 0.64, chH, t.surface, { rx: 14, filter: 'sh' });
    s += T(cx0 + (cx1 - cx0) * 0.64 - 24, chY + 36, 'نمودار درآمد روزانه', { size: 15.5, w: 700, c: t.text, a: 'end' });
    ['هفته', 'ماه', 'سال'].forEach((r, i) => {
        const rw = 56, rx = cx0 + 20 + i * 60;
        s += R(rx, chY + 18, rw, 30, i === 1 ? ac : t.surface2, { rx: 8, stroke: i === 1 ? 'none' : t.border });
        s += T(rx + rw / 2, chY + 38, r, { size: 12.5, w: 600, c: i === 1 ? '#fff' : t.sub, a: 'middle' });
    });
    s += areaChart(cx0 + 46, chY + 84, (cx1 - cx0) * 0.64 - 92, chH - 150, [.22, .3, .26, .42, .38, .55, .48, .66, .6, .78, .7, .9], ac, t, { dotAt: 9, series2: [.18, .22, .24, .3, .33, .4, .42, .5, .52, .6, .61, .7], color2: ACC.teal });
    ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور'].forEach((m, i) => {
        s += T(cx0 + 46 + ((cx1 - cx0) * 0.64 - 92) * i / 5, chY + chH - 26, m, { size: 11.5, c: t.mute, a: 'middle' });
    });
    // right column: top products
    const rx0 = cx0 + (cx1 - cx0) * 0.64 + 20, rw0 = cx1 - rx0;
    s += R(rx0, chY, rw0, chH, t.surface, { rx: 14, filter: 'sh' });
    s += T(rx0 + rw0 - 24, chY + 36, 'پرفروش‌ترین‌ها', { size: 15.5, w: 700, c: t.text, a: 'end' });
    [['هاست وردپرس', 86, ac], ['کانفیگ V2Ray', 64, ACC.blue], ['سرور مجازی آلمان', 47, ACC.teal], ['دامنه .ir', 31, ACC.amber]].forEach((p, i) => {
        const py = chY + 74 + i * 62;
        s += T(rx0 + rw0 - 24, py + 12, p[0], { size: 13.5, w: 600, c: t.text, a: 'end' });
        s += T(rx0 + 24, py + 12, fa(p[1]) + ' فروش', { size: 12, c: t.mute });
        s += progress(rx0 + 24, py + 24, rw0 - 48, 8, p[1], p[2], t);
    });
    // orders table
    const ty = chY + chH + 24, tw = cx1 - cx0;
    s += R(cx0, ty, tw, DH - ty - 28, t.surface, { rx: 14, filter: 'sh' });
    s += T(cx1 - 24, ty + 34, 'آخرین سفارش‌ها', { size: 15.5, w: 700, c: t.text, a: 'end' });
    s += T(cx0 + 24, ty + 34, 'مشاهده همه', { size: 12.5, w: 600, c: ac });
    const cols = [[.16, 'کد سفارش'], [.24, 'مشتری'], [.24, 'محصول'], [.14, 'مبلغ (تومان)'], [.12, 'وضعیت'], [.1, 'تاریخ']];
    let xx = cx1;
    const hy = ty + 62;
    s += R(cx0 + 12, hy - 22, tw - 24, 36, t.surface2, { rx: 8 });
    const xs = [];
    cols.forEach(c => { xx -= tw * c[0]; xs.push(xx + tw * c[0]); s += T(xx + tw * c[0] - 18, hy, c[1], { size: 12.5, w: 600, c: t.sub, a: 'end' }); });
    const orows = [
        ['#140318', 'رضا محمدی', 'هاست وردپرس پرسرعت', faNum(1250000), ['موفق', ACC.green], faDate(1405, 6, 30)],
        ['#140317', 'سارا احمدی', 'کانفیگ V2Ray', faNum(680000), ['در انتظار', ACC.amber], faDate(1405, 6, 30)],
        ['#140316', 'علی کریمی', 'سرور مجازی آلمان', faNum(4800000), ['موفق', ACC.green], faDate(1405, 6, 29)],
        ['#140315', 'نگار رضایی', 'ثبت دامنه .ir', faNum(450000), ['موفق', ACC.green], faDate(1405, 6, 29)],
        ['#140314', 'امیر حسینی', 'هاست لینوکس', faNum(900000), ['بازگشت وجه', ACC.red], faDate(1405, 6, 28)]
    ].slice(0, 4);
    orows.forEach((r, i) => {
        const ry = hy + 34 + i * 46;
        if (i % 2) s += R(cx0 + 12, ry - 24, tw - 24, 44, t.surface2, { rx: 8, op: .6 });
        s += T(xs[0] - 18, ry, r[0], { size: 12.5, fam: MO, c: t.sub, a: 'end' });
        s += C(xs[1] - 30, ry - 5, 12, [ac, ACC.blue, ACC.teal, ACC.amber, ACC.violet][i]); s += T(xs[1] - 30, ry - 1, r[1][0], { size: 10.5, w: 700, c: '#fff', a: 'middle' });
        s += T(xs[1] - 50, ry, r[1], { size: 13, w: 500, c: t.text, a: 'end' });
        s += T(xs[2] - 18, ry, r[2], { size: 13, c: t.text, a: 'end' });
        s += T(xs[3] - 18, ry, r[3], { size: 13, w: 600, c: t.text, a: 'end' });
        s += pill(xs[4] - tw * .06, ry - 5, r[4][0], r[4][1], null, { size: 11.5, h: 24 });
        s += T(xs[5] - 18, ry, r[5], { size: 12.5, c: t.mute, a: 'end' });
    });
    return { w: DW, h: DH, svg: s };
}

// ---------- P2: corporate site ----------
function p2corp1() {
    const t = TH.light, ac = ACC.blue;
    const br = browser(DW, { theme: 'light', url: 'https://www.sayeh-gostar.ir/', title: 'شرکت سایه گستر', tabs: [{ t: 'شرکت سایه گستر | صفحه اصلی' }, { t: 'تماس با ما', fav: ACC.green }], fav: ac });
    let s = br.s + R(0, br.y, DW, DH - br.y, '#ffffff');
    const top = br.y;
    // nav
    s += R(0, top, DW, 72, '#ffffff') + L(0, top + 72, DW, top + 72, t.border, 1);
    s += C(DW - 70, top + 36, 18, ac); s += icon('cloud', DW - 79, top + 27, 18, '#fff', 2);
    s += T(DW - 98, top + 42, 'سایه گستر', { size: 18, w: 800, c: t.text, a: 'end' });
    ['خانه', 'خدمات', 'پروژه‌ها', 'درباره ما', 'تماس'].forEach((m, i) => {
        s += T(DW - 260 - i * 110, top + 42, m, { size: 14.5, w: i === 0 ? 700 : 500, c: i === 0 ? ac : t.sub, a: 'end' });
        if (i === 0) s += R(DW - 260 - i * 110 - 34, top + 54, 36, 3, ac, { rx: 2 });
    });
    s += btn(DW - 1180, top + 18, 130, 38, 'درخواست مشاوره', 'primary', t, ac, { size: 13 });
    // hero
    const hy = top + 72;
    s += R(0, hy, DW, DH - hy, '#f8fafc');
    s += C(240, hy + 420, 260, ac, { op: .06 }); s += C(DW - 180, hy + 120, 200, ACC.violet, { op: .07 });
    s += pill(DW - 120, hy + 86, '✦ مشاوره رایگان', ac, null, { size: 12.5, h: 30 });
    s += T(DW - 120, hy + 160, 'راه‌حل‌های ابری برای', { size: 44, w: 800, c: t.text, a: 'end' });
    s += T(DW - 120, hy + 216, 'رشد کسب‌وکار شما', { size: 44, w: 800, c: ac, a: 'end' });
    s += T(DW - 120, hy + 262, 'طراحی وب‌سایت، زیرساخت ابری و پشتیبانی حرفه‌ای؛', { size: 16, c: t.sub, a: 'end' });
    s += T(DW - 120, hy + 290, 'همه‌چیز برای حضور قدرتمند در اینترنت.', { size: 16, c: t.sub, a: 'end' });
    s += btn(DW - 330, hy + 330, 190, 52, 'شروع همکاری', 'primary', t, ac, { size: 15 });
    s += btn(DW - 120 - 190, hy + 330, 170, 52, 'مشاهده پروژه‌ها', 'outline', t, ac, { size: 15 });
    s += icon('play', DW - 120 - 190 + 18, hy + 347, 18, ac, 2);
    // hero visual card
    const vx = 120, vw = 620, vy = hy + 70, vh = 400;
    s += R(vx, vy, vw, vh, '#ffffff', { rx: 20, filter: 'sh2' });
    s += `<defs><clipPath id="hv"><rect x="${vx}" y="${vy}" width="${vw}" height="${vh * 0.62}" rx="20"/></clipPath></defs>`;
    s += img('hosting-linux.jpg', vx, vy, vw, vh * 0.62, 'hv');
    s += R(vx, vy + vh * 0.62 - 60, vw, 60, '#0f172a', { op: .55 });
    s += T(vx + vw - 24, vy + vh * 0.62 - 24, 'زیرساخت ابری پایدار', { size: 15, w: 600, c: '#fff', a: 'end' });
    s += T(vx + 28, vy + vh * 0.62 + 44, '۹۹٫۹٪ آپ‌تایم تضمین‌شده', { size: 15, w: 700, c: t.text });
    s += T(vx + 28, vy + vh * 0.62 + 72, 'مانیتورینگ ۲۴ ساعته و پشتیبانی متخصص', { size: 13, c: t.sub });
    s += R(vx + 28, vy + vh - 78, 150, 44, ac, { rx: 12, op: .12 });
    s += T(vx + 103, vy + vh - 50, 'جزئیات بیشتر', { size: 13, w: 600, c: ac, a: 'middle' });
    // floating stat chips
    s += R(vx + vw - 90, vy - 26, 210, 62, '#ffffff', { rx: 14, filter: 'sh' });
    s += icon('chart', vx + vw - 72, vy - 8, 22, ACC.green, 2.2);
    s += T(vx + vw - 40, vy - 2, '+۲۴۰ پروژه موفق', { size: 13.5, w: 700, c: t.text });
    s += T(vx + vw - 40, vy + 18, 'در ۵ سال گذشته', { size: 11.5, c: t.mute });
    s += R(vx - 40, vy + vh - 96, 200, 62, '#ffffff', { rx: 14, filter: 'sh' });
    s += icon('users', vx - 22, vy + vh - 78, 22, ac, 2.2);
    s += T(vx + 10, vy + vh - 72, '۱۸۰ مشتری فعال', { size: 13.5, w: 700, c: t.text });
    s += T(vx + 10, vy + vh - 52, 'از کسب‌وکارهای ایرانی', { size: 11.5, c: t.mute });
    // trust bar
    s += R(0, DH - 92, DW, 92, '#ffffff') + L(0, DH - 92, DW, DH - 92, t.border, 1);
    s += T(DW - 120, DH - 40, 'مورد اعتماد:', { size: 13.5, w: 600, c: t.mute, a: 'end' });
    [' دیجی‌کالا', 'اسنپ', 'تپسی', 'کافه‌بازار', 'دیوار'].forEach((b, i) => {
        s += T(DW - 260 - i * 190, DH - 40, b, { size: 16, w: 800, c: '#cbd5e1', a: 'end', ls: 1 });
    });
    return { w: DW, h: DH, svg: s };
}

function p2corp2() {
    const t = TH.light, ac = ACC.blue;
    const br = browser(DW, { theme: 'light', url: 'https://www.sayeh-gostar.ir/services', title: 'خدمات | سایه گستر', tabs: [{ t: 'خدمات | سایه گستر' }], fav: ac });
    let s = br.s + R(0, br.y, DW, DH - br.y, '#ffffff');
    const top = br.y;
    s += R(0, top, DW, 64, '#ffffff') + L(0, top + 64, DW, top + 64, t.border, 1);
    s += C(DW - 60, top + 32, 15, ac); s += T(DW - 84, top + 38, 'سایه گستر', { size: 15.5, w: 800, c: t.text, a: 'end' });
    s += T(120, top + 38, 'خدمات', { size: 14.5, w: 700, c: ac });
    // section header
    s += T(DW / 2, top + 128, 'خدمات ما', { size: 34, w: 800, c: t.text, a: 'middle' });
    s += R(DW / 2 - 32, top + 146, 64, 4, ac, { rx: 2 });
    s += T(DW / 2, top + 182, 'هر آنچه برای حضور دیجیتال قدرتمند نیاز دارید', { size: 15, c: t.sub, a: 'middle' });
    // service cards 3×2
    const cards = [
        ['fas', 'laptop', 'طراحی وب‌سایت', 'وب‌سایت مدرن و واکنش‌گرا با جدیدترین تکنولوژی‌های روز دنیا و سئوی عالی.', ac],
        ['cloud', 'زیرساخت ابری', 'استقرار و مدیریت سرویس‌ها روی کلاد با بالاترین سطح دسترس‌پذیری.', ACC.violet],
        ['shield', 'امنیت و محافظت', 'پیکربندی فایروال، گواهی SSL و محافظت در برابر حملات سایبری.', ACC.green],
        ['chart', 'سئو و بازاریابی', 'بهینه‌سازی برای موتورهای جست‌وجو و افزایش رتبه در گوگل.', ACC.amber],
        ['robot', 'اتوماسیون فروش', 'ربات‌های تلگرام و واتس‌اپ برای فروش و پشتیبانی خودکار.', ACC.teal],
        ['headset', 'پشتیبانی ۲۴/۷', 'تیم پشتیبانی متخصص در تمام ساعات شبانه‌روز کنار شماست.', ACC.red]
    ];
    const cw = 400, chh = 250, gap = 28;
    const x0 = (DW - cw * 3 - gap * 2) / 2;
    cards.forEach((cd, i) => {
        const cx = x0 + (2 - (i % 3)) * (cw + gap), cy = top + 216 + Math.floor(i / 3) * (chh + gap);
        s += R(cx, cy, cw, chh, '#ffffff', { rx: 16, stroke: t.border, sw: 1.2 });
        s += R(cx + cw - 76, cy + 28, 52, 52, cd[4], { rx: 14, op: .13 });
        s += icon(cd[0] === 'fas' ? 'laptop' : cd[0], cx + cw - 66, cy + 38, 32, cd[4], 2.2);
        s += T(cx + cw - 28, cy + 116, cd[2], { size: 18, w: 800, c: t.text, a: 'end' });
        const words = cd[3].split(' ');
        let line = '', ly = cy + 148;
        words.forEach(wd => {
            if ((line + ' ' + wd).length > 34) { s += T(cx + cw - 28, ly, line, { size: 13.5, c: t.sub, a: 'end', }); ly += 24; line = wd; }
            else line = line ? line + ' ' + wd : wd;
        });
        if (line) s += T(cx + cw - 28, ly, line, { size: 13.5, c: t.sub, a: 'end' });
        s += T(cx + 28, cy + chh - 26, 'مشاهده جزئیات', { size: 13, w: 600, c: cd[4] });
        s += icon('chev-l', cx + 118, cy + chh - 38, 14, cd[4], 2.2);
    });
    // stats band
    s += R(0, DH - 128, DW, 128, '#0f172a');
    [[faNum(240) + '+', 'پروژه تحویل‌شده'], [fa(99.9) + '٪', 'رضایت مشتریان'], [faNum(180) + '+', 'مشتری فعال'], [fa(5), 'سال تجربه']].forEach((st, i) => {
        const sx = DW - 200 - i * 360;
        s += T(sx, DH - 66, st[0], { size: 30, w: 800, c: '#ffffff', a: 'middle' });
        s += T(sx, DH - 36, st[1], { size: 13, c: '#94a3b8', a: 'middle' });
    });
    return { w: DW, h: DH, svg: s };
}

function p2corp3() {
    const t = TH.light, ac = ACC.blue;
    let s = R(0, 0, MW, MH, '#ffffff');
    const sb = statusbar(MW, t); s += sb.s;
    // mobile nav
    s += R(0, 44, MW, 60, '#ffffff') + L(0, 104, MW, 104, t.border, 1);
    s += C(40, 74, 15, ac); s += icon('cloud', 32, 66, 16, '#fff', 2);
    s += T(64, 80, 'سایه گستر', { size: 15.5, w: 800, c: t.text });
    s += icon('menu', MW - 44, 64, 22, t.text, 2.2);
    // hero
    s += R(0, 104, MW, 470, '#f8fafc');
    s += C(MW - 60, 200, 130, ac, { op: .08 });
    s += pill(MW / 2, 156, '✦ مشاوره رایگان', ac, null, { size: 12, h: 28 });
    s += T(MW / 2, 224, 'راه‌حل‌های ابری برای', { size: 30, w: 800, c: t.text, a: 'middle' });
    s += T(MW / 2, 266, 'رشد کسب‌وکار شما', { size: 30, w: 800, c: ac, a: 'middle' });
    s += T(MW / 2, 306, 'طراحی وب‌سایت، زیرساخت ابری و', { size: 14, c: t.sub, a: 'middle' });
    s += T(MW / 2, 330, 'پشتیبانی حرفه‌ای در یک پکیج کامل', { size: 14, c: t.sub, a: 'middle' });
    s += btn(MW / 2 - 130, 366, 260, 50, 'شروع همکاری', 'primary', t, ac, { size: 15 });
    s += btn(MW / 2 - 130, 428, 260, 50, 'مشاهده پروژه‌ها', 'outline', t, ac, { size: 15 });
    s += T(MW / 2, 516, '۹۹٫۹٪ آپ‌تایم • پشتیبانی ۲۴/۷ • تحویل به‌موقع', { size: 12.5, c: t.mute, a: 'middle' });
    // services preview
    let y = 606;
    s += T(MW / 2, y + 20, 'خدمات پرطرفدار', { size: 20, w: 800, c: t.text, a: 'middle' });
    s += R(MW / 2 - 26, y + 34, 52, 4, ac, { rx: 2 });
    y += 62;
    [['laptop', 'طراحی وب‌سایت', 'واکنش‌گرا، سریع و بهینه برای گوگل', ac], ['cloud', 'زیرساخت ابری', 'استقرار بدون دغدغه روی کلادفلر', ACC.violet], ['shield', 'امنیت و محافظت', 'SSL، فایروال و مانیتورینگ مداوم', ACC.green]].forEach((cd, i) => {
        s += R(24, y, MW - 48, 96, '#ffffff', { rx: 14, stroke: t.border, sw: 1.2 });
        s += R(MW - 96, y + 24, 48, 48, cd[3], { rx: 13, op: .13 });
        s += icon(cd[0], MW - 86, y + 34, 28, cd[3], 2.2);
        s += T(MW - 120, y + 44, cd[1], { size: 16, w: 700, c: t.text, a: 'end' });
        s += T(MW - 120, y + 68, cd[2], { size: 12.5, c: t.sub, a: 'end' });
        s += icon('chev-l', 44, y + 38, 18, t.mute, 2);
        y += 110;
    });
    // cta
    s += R(24, y + 8, MW - 48, 120, ac, { rx: 16 });
    s += T(MW / 2, y + 56, 'پروژه‌ای در ذهن دارید؟', { size: 17, w: 800, c: '#fff', a: 'middle' });
    s += T(MW / 2, y + 84, 'همین حالا رایگان مشاوره بگیرید', { size: 13, c: '#dbeafe', a: 'middle' });
    s += R(MW / 2 - 70, y + 96 - 6, 140, 0, 'none');
    // bottom nav bar
    s += R(0, MH - 70, MW, 70, '#ffffff') + L(0, MH - 70, MW, MH - 70, t.border, 1);
    [['home', 'خانه', 1], ['box', 'خدمات', 0], ['chat', 'پروژه‌ها', 0], ['user', 'درباره ما', 0], ['phone', 'تماس', 0]].forEach((n, i) => {
        const nx = MW - 66 - i * ((MW - 100) / 4);
        s += icon(n[0], nx - 11, MH - 52, 22, n[2] ? ac : t.mute, 2.1);
        s += T(nx, MH - 20, n[1], { size: 11, w: n[2] ? 700 : 400, c: n[2] ? ac : t.mute, a: 'middle' });
    });
    return { w: MW, h: MH, svg: s };
}

// ---------- P3: VPN panel (dark) ----------
function vpnShell(active, title, sub) {
    const t = TH.dark, ac = ACC.teal;
    const br = browser(DW, { theme: 'dark', url: 'https://vpn-panel.internal/' + active, title: 'پنل مدیریت VPN', tabs: [{ t: 'پنل مدیریت VPN' }, { t: 'مستندات سرورها', fav: ACC.amber }], fav: ac, avatar: ac });
    let s = br.s + R(0, br.y, DW, DH - br.y, t.bg);
    const top = br.y, sideW = 240;
    s += R(DW - sideW, top, sideW, DH - top, t.surface) + L(DW - sideW, top, DW - sideW, DH, t.border, 1);
    s += R(DW - 56, top + 22, 32, 32, ac, { rx: 9 }); s += icon('shield', DW - 48, top + 30, 16, '#04211b', 2.4);
    s += T(DW - 74, top + 44, 'پنل VPN', { size: 16, w: 800, c: t.text, a: 'end' });
    [['users', 'کاربران', 'users'], ['server', 'سرورها', 'servers'], ['chart', 'ترافیک', 'traffic'], ['gear', 'تنظیمات', 'settings']].forEach((n, i) => {
        const ny = top + 84 + i * 46, on = n[2] === active;
        if (on) s += R(DW - sideW + 12, ny, sideW - 24, 40, ac, { rx: 10, op: .15 });
        s += icon(n[0], DW - 48, ny + 10, 20, on ? ac : t.sub, 2);
        s += T(DW - 68, ny + 25, n[1], { size: 14, w: on ? 700 : 500, c: on ? ac : t.sub, a: 'end' });
    });
    s += R(DW - sideW + 16, top + 300, sideW - 32, 86, '#0b1a2e', { rx: 12, stroke: t.border });
    s += T(DW - 32, top + 328, 'وضعیت کلاد', { size: 12.5, w: 600, c: t.sub, a: 'end' });
    s += C(DW - sideW + 34, top + 324, 5, ACC.green); s += T(DW - sideW + 46, top + 328, 'پایدار', { size: 12.5, c: ACC.green });
    s += T(DW - 32, top + 362, 'آپ‌تایم ۹۹٫۹۸٪ • ۶ سرور', { size: 11.5, c: t.mute, a: 'end' });
    const cx1 = DW - sideW - 32, cx0 = 32;
    s += T(cx1, top + 44, title, { size: 21, w: 800, c: t.text, a: 'end' });
    s += T(cx1, top + 70, sub, { size: 13, c: t.sub, a: 'end' });
    s += btn(cx0 + 150, top + 24, 150, 40, 'ساخت کانفیگ', 'primary', t, ac, { size: 13.5, icon: 'plus' });
    s += btn(cx0, top + 24, 130, 40, 'خروجی Excel', 'outline', t, ac, { size: 13, icon: 'download' });
    return { s, top, cx0, cx1, t, ac };
}
function p3vpn1() {
    const { s: sh, top, cx0, cx1, t, ac } = vpnShell('users', 'مدیریت کاربران', '۳۴۲ کاربر فعال روی ۶ سرور');
    let s = sh;
    // KPI minis
    [['users', 'کاربران فعال', faNum(342), ACC.green], ['server', 'سرورهای آنلاین', fa(6), ac], ['chart', 'ترافیک امروز', '۱٫۲ ترابایت', ACC.blue], ['shield', 'کانفیگ‌های فعال', faNum(518), ACC.violet]].forEach((k, i) => {
        const kw = (cx1 - cx0 - 60) / 4, kx = cx0 + (3 - i) * (kw + 20);
        s += R(kx, top + 96, kw, 86, t.surface, { rx: 13, stroke: t.border });
        s += icon(k[0], kx + kw - 44, top + 116, 20, k[3], 2);
        s += T(kx + 20, top + 128, k[1], { size: 12.5, c: t.sub });
        s += T(kx + 20, top + 160, k[2], { size: 21, w: 800, c: t.text });
    });
    // table
    const ty = top + 206, tw = cx1 - cx0;
    s += R(cx0, ty, tw, DH - ty - 26, t.surface, { rx: 14, stroke: t.border });
    s += R(cx1 - 254, ty + 16, 240, 38, '#0b1a2e', { rx: 10, stroke: t.border });
    s += icon('search', cx1 - 240, ty + 26, 17, t.mute, 2);
    s += T(cx1 - 214, ty + 40, 'جست‌وجوی کاربر…', { size: 12.5, c: t.mute });
    s += pill(cx1 - 320, ty + 35, 'همه پروتکل‌ها', t.sub, null, { size: 12, h: 32, bgOp: .12, text: t.sub });
    s += icon('chev-l', cx1 - 352, ty + 27, 15, t.mute, 2);
    s += T(cx0 + 22, ty + 40, faNum(342) + ' کاربر', { size: 12.5, c: t.sub });
    const cols = [[.17, 'کاربر'], [.12, 'پروتکل'], [.2, 'حجم باقی‌مانده'], [.13, 'انقضا'], [.12, 'سرور'], [.12, 'وضعیت'], [.14, 'عملیات']];
    let xx = cx1; const xs = [];
    const hy = ty + 86;
    s += R(cx0 + 12, hy - 24, tw - 24, 36, '#0b1a2e', { rx: 8 });
    cols.forEach(c => { xx -= tw * c[0]; xs.push(xx + tw * c[0]); s += T(xx + tw * c[0] - 18, hy, c[1], { size: 12.5, w: 600, c: t.sub, a: 'end' }); });
    const rows = [
        ['رضا محمدی', 'VLESS', 76, faDate(1405, 8, 12), 'آلمان ۱', ['فعال', ACC.green]],
        ['سارا احمدی', 'Trojan', 42, faDate(1405, 7, 3), 'هلند ۲', ['فعال', ACC.green]],
        ['علی کریمی', 'VMess', 12, faDate(1405, 6, 28), 'آلمان ۱', ['رو به اتمام', ACC.amber]],
        ['نگار رضایی', 'VLESS', 91, faDate(1405, 9, 20), 'فرانسه ۱', ['فعال', ACC.green]],
        ['امیر حسینی', 'Trojan', 0, faDate(1405, 6, 10), 'هلند ۱', ['منقضی', ACC.red]],
        ['مریم موسوی', 'VLESS', 58, faDate(1405, 8, 2), 'آلمان ۲', ['فعال', ACC.green]],
        ['حسین کاظمی', 'VMess', 33, faDate(1405, 7, 19), 'فرانسه ۱', ['فعال', ACC.green]]
    ];
    rows.forEach((r, i) => {
        const ry = hy + 40 + i * 52;
        if (i % 2) s += R(cx0 + 12, ry - 26, tw - 24, 48, '#0b1a2e', { rx: 8, op: .5 });
        s += C(xs[0] - 32, ry - 5, 14, [ac, ACC.blue, ACC.violet, ACC.amber, ACC.red, ACC.teal, ACC.indigo][i]);
        s += T(xs[0] - 32, ry - 1, r[0][0], { size: 11, w: 700, c: '#08131f', a: 'middle' });
        s += T(xs[0] - 56, ry, r[0], { size: 13.5, w: 600, c: t.text, a: 'end' });
        s += R(xs[1] - 74, ry - 17, 62, 24, '#0b1a2e', { rx: 7, stroke: t.border });
        s += T(xs[1] - 43, ry, r[1], { size: 11, w: 700, fam: MO, c: ac, a: 'middle' });
        s += progress(xs[2] - 160, ry - 9, 110, 8, r[2], r[2] > 30 ? ac : ACC.amber, t);
        s += T(xs[2] - 18, ry, fa(r[2]) + '٪', { size: 12, c: t.sub, a: 'end' });
        s += T(xs[3] - 18, ry, r[3], { size: 12.5, c: t.sub, a: 'end' });
        s += T(xs[4] - 18, ry, r[4], { size: 12.5, c: t.text, a: 'end' });
        s += pill(xs[5] - tw * .06, ry - 5, r[5][0], r[5][1], null, { size: 11.5, h: 24 });
        s += icon('eye', xs[6] - 84, ry - 15, 18, t.sub, 2);
        s += icon('refresh', xs[6] - 56, ry - 15, 18, t.sub, 2);
        s += icon('close', xs[6] - 28, ry - 15, 18, ACC.red, 2);
    });
    return { w: DW, h: DH, svg: s };
}
function p3vpn2() {
    const base = p3vpn1();
    let s = base.svg;
    const t = TH.dark, ac = ACC.teal;
    s += R(0, 0, DW, DH, '#020617', { op: .66 });
    const mw = 760, mh = 600, mx = (DW - mw) / 2, my = (DH - mh) / 2;
    s += R(mx, my, mw, mh, t.surface, { rx: 18, stroke: t.border, filter: 'sh2' });
    s += T(mx + mw - 32, my + 46, 'ساخت کانفیگ جدید', { size: 19, w: 800, c: t.text, a: 'end' });
    s += icon('close', mx + 28, my + 28, 20, t.sub, 2.2);
    s += L(mx + 24, my + 68, mx + mw - 24, my + 68, t.border, 1);
    const fw = mw - 300, fx = mx + 300, half = (fw - 40 - 20) / 2;
    s += field(fx, my + 116, fw - 40, 44, 'نام کاربر', 'مثلاً: رضا محمدی', t, { ph: 1 });
    s += field(fx + half + 20, my + 190, half, 44, 'پروتکل', 'VLESS', t, { chev: 1, focus: 1 });
    s += field(fx, my + 190, half, 44, 'سرور', 'آلمان ۱', t, { chev: 1 });
    s += field(fx + half + 20, my + 264, half, 44, 'حجم (گیگابایت)', '۱۰۰', t);
    s += field(fx, my + 264, half, 44, 'تاریخ انقضا', faDate(1405, 9, 20), t, { chev: 1 });
    s += T(mx + 40, my + 116, 'پیش‌نمایش کانفیگ', { size: 13.5, w: 600, c: t.sub });
    s += qr(mx + 40, my + 136, 168, 21, '#0b1a2e', '#ffffff');
    s += T(mx + 124, my + 330, 'اسکن با اپلیکیشن', { size: 12, c: t.mute, a: 'middle' });
    s += R(mx + 40, my + 348, 168, 38, '#0b1a2e', { rx: 10, stroke: t.border });
    s += icon('copy', mx + 58, my + 357, 18, ac, 2);
    s += T(mx + 132, my + 372, 'کپی لینک کانفیگ', { size: 12.5, w: 600, c: ac, a: 'middle' });
    // protocol chips
    s += T(mx + 40, my + 116 + 0, '', {});
    ['VLESS', 'VMess', 'Trojan'].forEach((p, i) => {
        s += R(mx + mw - 114 - i * 82, my + 420, 74, 34, i === 0 ? ac : '#0b1a2e', { rx: 9, op: i === 0 ? .2 : 1, stroke: i === 0 ? ac : t.border });
        s += T(mx + mw - 77 - i * 82, my + 442, p, { size: 12.5, w: 700, fam: MO, c: i === 0 ? ac : t.sub, a: 'middle' });
    });
    s += T(mx + 236, my + 442, 'REALITY + gRPC فعال است', { size: 12, c: ACC.green });
    s += icon('check-circle', mx + 40, my + 428, 18, ACC.green, 2);
    s += L(mx + 24, my + mh - 84, mx + mw - 24, my + mh - 84, t.border, 1);
    s += btn(mx + 24, my + mh - 64, 150, 44, 'انصراف', 'outline', t, ac, { size: 14 });
    s += btn(mx + mw - 194, my + mh - 64, 170, 44, 'ساخت کانفیگ', 'primary', t, ac, { size: 14, icon: 'check' });
    return { w: DW, h: DH, svg: s };
}
function p3vpn3() {
    const { s: sh, top, cx0, cx1, t, ac } = vpnShell('traffic', 'گزارش ترافیک', 'مصرف هفتگی کاربران و سرورها');
    let s = sh;
    const cw = (cx1 - cx0 - 20) * 0.62, c2x = cx0 + cw + 20, c2w = cx1 - c2x;
    s += R(cx0, top + 96, cw, 400, t.surface, { rx: 14, stroke: t.border });
    s += T(cx0 + cw - 24, top + 132, 'ترافیک هفته اخیر (گیگابایت)', { size: 15, w: 700, c: t.text, a: 'end' });
    s += areaChart(cx0 + 46, top + 170, cw - 92, 250, [.3, .42, .38, .6, .52, .78, .66], ac, t, { dotAt: 5, series2: [.22, .3, .34, .4, .44, .5, .55], color2: ACC.violet });
    ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'].forEach((d, i) => {
        s += T(cx0 + 46 + (cw - 92) * i / 6, top + 462, d, { size: 11.5, c: t.mute, a: 'middle' });
    });
    // donut card
    s += R(c2x, top + 96, c2w, 400, t.surface, { rx: 14, stroke: t.border });
    s += T(c2x + c2w - 24, top + 132, 'سهم پروتکل‌ها', { size: 15, w: 700, c: t.text, a: 'end' });
    s += donut(c2x + c2w / 2, top + 268, 82, [{ v: 52, c: ac }, { v: 29, c: ACC.violet }, { v: 19, c: ACC.amber }], t, { sw: 20 });
    s += T(c2x + c2w / 2, top + 262, fa(52) + '٪', { size: 24, w: 800, c: t.text, a: 'middle' });
    s += T(c2x + c2w / 2, top + 288, 'VLESS', { size: 12, fam: MO, c: t.sub, a: 'middle' });
    [['VLESS', fa(52) + '٪', ac], ['VMess', fa(29) + '٪', ACC.violet], ['Trojan', fa(19) + '٪', ACC.amber]].forEach((r, i) => {
        const ry = top + 396 + i * 0; // legend inline below
    });
    let lx = c2x + c2w - 30;
    [['Trojan', ACC.amber], ['VMess', ACC.violet], ['VLESS', ac]].forEach(r => {
        s += T(lx, top + 402, r[0], { size: 12, fam: MO, c: t.sub, a: 'end' });
        s += C(lx - r[0].length * 7.6 - 12, top + 398, 5, r[1]);
        lx -= r[0].length * 7.6 + 44;
    });
    // server load list
    s += R(cx0, top + 516, cx1 - cx0, DH - top - 542, t.surface, { rx: 14, stroke: t.border });
    s += T(cx1 - 24, top + 552, 'بار سرورها', { size: 15, w: 700, c: t.text, a: 'end' });
    const sw = (cx1 - cx0 - 60) / 3;
    [['آلمان ۱', 68, ac], ['آلمان ۲', 41, ACC.green], ['هلند ۱', 87, ACC.amber], ['هلند ۲', 23, ACC.green], ['فرانسه ۱', 55, ac], ['فرانسه ۲', 12, ACC.green]].forEach((sv, i) => {
        const sx = cx0 + 20 + (2 - (i % 3)) * (sw + 20), sy = top + 580 + Math.floor(i / 3) * 78;
        s += icon('server', sx + sw - 26, sy + 2, 20, sv[2], 2);
        s += T(sx, sy + 16, sv[0], { size: 13.5, w: 600, c: t.text });
        s += T(sx, sy + 40, fa(sv[1]) + '٪ ظرفیت', { size: 12, c: t.sub });
        s += progress(sx, sy + 50, sw - 20, 8, sv[1], sv[2], t);
    });
    return { w: DW, h: DH, svg: s };
}

// ---------- P4: analytics dashboard ----------
function p4dash1() {
    const t = TH.light, ac = ACC.indigo;
    const br = browser(DW, { theme: 'light', url: 'https://analytics.roshan-insight.ir/overview', title: 'داشبورد تحلیلی روشنا', tabs: [{ t: 'داشبورد تحلیلی روشنا' }, { t: 'گزارش‌ها', fav: ACC.green }, { t: 'تنظیمات', fav: ACC.amber }], fav: ac });
    let s = br.s + R(0, br.y, DW, DH - br.y, t.bg);
    const top = br.y;
    // topbar with filters
    s += R(0, top, DW, 66, t.surface) + L(0, top + 66, DW, top + 66, t.border, 1);
    s += T(DW - 40, top + 41, 'داشبورد تحلیلی', { size: 18, w: 800, c: t.text, a: 'end' });
    s += R(DW - 470, top + 15, 250, 36, t.surface2, { rx: 10, stroke: t.border });
    s += icon('calendar', DW - 246, top + 24, 18, t.sub, 2);
    s += T(DW - 268, top + 38, faDate(1405, 6, 1) + ' تا ' + faDate(1405, 6, 30), { size: 12.5, c: t.text, a: 'end' });
    s += icon('chev-l', DW - 456, top + 25, 16, t.mute, 2);
    s += btn(180, top + 14, 130, 38, 'خروجی گزارش', 'primary', t, ac, { size: 12.5, icon: 'download' });
    s += btn(40, top + 14, 120, 38, 'بازه زمانی', 'outline', t, ac, { size: 12.5, icon: 'filter' });
    s += icon('bell', 320, top + 24, 20, t.sub, 2); s += C(332, top + 24, 4.5, ACC.red);
    // KPI row
    const kpis = [['فروش این ماه', '۸۴٬۵۰۰٬۰۰', '+۱۸٫۴٪', ACC.green, 'wallet'], ['بازدید کل', faNum(128400), '+۶٫۲٪', ACC.green, 'eye'], ['نرخ تبدیل', '۳٫۸٪', '−۰٫۴٪', ACC.red, 'chart'], ['سفارش‌ها', faNum(1866), '+۱۲٫۱٪', ACC.green, 'cart']];
    const kw = (DW - 80 - 60) / 4;
    kpis.forEach((k, i) => {
        const kx = 40 + (3 - i) * (kw + 20);
        s += R(kx, top + 92, kw, 116, t.surface, { rx: 14, filter: 'sh' });
        s += T(kx + kw - 22, top + 124, k[0], { size: 13, c: t.sub, a: 'end' });
        s += R(kx + 22, top + 112, 42, 42, ac, { rx: 12, op: .12 });
        s += icon(k[4], kx + 32, top + 122, 22, ac, 2);
        s += T(kx + kw - 22, top + 166, k[1], { size: 25, w: 800, c: t.text, a: 'end' });
        s += pill(kx + 60, top + 188, k[2], k[3], null, { size: 11, h: 22 });
        s += spark(kx + 100, top + 176, kw - 130, 24, [.3, .5, .4, .65, .55, .8, .7, .9], k[3] === ACC.green ? ACC.green : ACC.red);
    });
    // main chart
    const my = top + 232, mh = 420, mw = (DW - 80 - 24) * 0.68;
    s += R(40, my, mw, mh, t.surface, { rx: 16, filter: 'sh' });
    s += T(40 + mw - 26, my + 40, 'روند فروش و بازدید', { size: 16, w: 700, c: t.text, a: 'end' });
    s += C(40 + 34, my + 34, 5, ac); s += T(40 + 46, my + 39, 'فروش', { size: 12.5, c: t.sub });
    s += C(40 + 110, my + 34, 5, ACC.teal); s += T(40 + 122, my + 39, 'بازدید', { size: 12.5, c: t.sub });
    ['روز', 'هفته', 'ماه', 'سال'].forEach((r, i) => {
        const rw = 54, rx = 40 + mw - 250 + i * 58;
        s += R(rx, my + 20, rw, 30, i === 2 ? ac : t.surface2, { rx: 8, stroke: i === 2 ? 'none' : t.border });
        s += T(rx + rw / 2, my + 40, r, { size: 12, w: 600, c: i === 2 ? '#fff' : t.sub, a: 'middle' });
    });
    s += areaChart(40 + 56, my + 92, mw - 110, mh - 170, [.25, .4, .32, .5, .46, .62, .55, .74, .68, .86, .78, .95], ac, t, { dotAt: 9, series2: [.2, .28, .3, .36, .4, .45, .5, .54, .6, .64, .7, .76], color2: ACC.teal });
    for (let i = 0; i < 12; i += 2) s += T(40 + 56 + (mw - 110) * i / 11, my + mh - 34, fa(i + 1), { size: 11.5, c: t.mute, a: 'middle' });
    s += T(40 + 56 + (mw - 110), my + mh - 34, fa(12), { size: 11.5, c: t.mute, a: 'middle' });
    // side: realtime + goals
    const sx = 40 + mw + 24, sw2 = DW - 40 - sx;
    s += R(sx, my, sw2, 200, t.surface, { rx: 16, filter: 'sh' });
    s += C(sx + sw2 - 34, my + 34, 5, ACC.green);
    s += T(sx + sw2 - 48, my + 39, 'آمار زنده', { size: 15, w: 700, c: t.text, a: 'end' });
    s += T(sx + sw2 - 26, my + 96, faNum(312), { size: 34, w: 800, c: t.text, a: 'end' });
    s += T(sx + sw2 - 26, my + 122, 'کاربر آنلاین در این لحظه', { size: 12.5, c: t.sub, a: 'end' });
    s += spark(sx + 26, my + 150, sw2 - 52, 34, [.4, .55, .45, .7, .6, .8, .65, .9, .75, .95], ACC.green);
    s += R(sx, my + 220, sw2, mh - 220, t.surface, { rx: 16, filter: 'sh' });
    s += T(sx + sw2 - 26, my + 256, 'اهداف ماه', { size: 15, w: 700, c: t.text, a: 'end' });
    [['فروش', 84, ac], ['کاربر جدید', 61, ACC.teal], ['رضایت مشتری', 93, ACC.green]].forEach((g, i) => {
        const gy = my + 292 + i * 52;
        s += T(sx + sw2 - 26, gy, g[0], { size: 13, w: 600, c: t.text, a: 'end' });
        s += T(sx + 26, gy, fa(g[1]) + '٪', { size: 12.5, w: 700, c: g[2] });
        s += progress(sx + 26, gy + 12, sw2 - 52, 8, g[1], g[2], t);
    });
    // bottom strip: channels
    const by = my + mh + 24;
    s += R(40, by, DW - 80, DH - by - 26, t.surface, { rx: 16, filter: 'sh' });
    s += T(DW - 66, by + 36, 'کانال‌های ورودی', { size: 15, w: 700, c: t.text, a: 'end' });
    [['گوگل', 46, ac], ['تلگرام', 27, ACC.blue], ['اینستاگرام', 17, ACC.violet], ['ورود مستقیم', 10, ACC.amber]].forEach((ch, i) => {
        const chw = (DW - 80 - 80) / 4, chx = 60 + (3 - i) * (chw + 8);
        s += T(chx + chw - 20, by + 76, ch[0], { size: 13.5, w: 600, c: t.text, a: 'end' });
        s += T(chx + 20, by + 76, fa(ch[1]) + '٪', { size: 15, w: 800, c: ch[2] });
        s += progress(chx + 20, by + 90, chw - 40, 9, ch[1], ch[2], t);
    });
    return { w: DW, h: DH, svg: s };
}
function p4dash2() {
    const t = TH.light, ac = ACC.indigo;
    const br = browser(DW, { theme: 'light', url: 'https://analytics.roshan-insight.ir/reports/sales', title: 'گزارش فروش | روشنا', tabs: [{ t: 'گزارش فروش | روشنا' }], fav: ac });
    let s = br.s + R(0, br.y, DW, DH - br.y, t.bg);
    const top = br.y;
    s += R(0, top, DW, 62, t.surface) + L(0, top + 62, DW, top + 62, t.border, 1);
    s += T(DW - 40, top + 39, 'گزارش فروش ماهانه', { size: 17, w: 800, c: t.text, a: 'end' });
    s += T(DW - 320, top + 39, 'داشبورد', { size: 13, c: t.sub, a: 'end' });
    s += icon('chev-l', DW - 292, top + 28, 14, t.mute, 2);
    // bar chart card
    const bw = (DW - 80 - 24) * 0.6;
    s += R(40, top + 88, bw, 430, t.surface, { rx: 16, filter: 'sh' });
    s += T(40 + bw - 26, top + 126, 'فروش به تفکیک ماه', { size: 15.5, w: 700, c: t.text, a: 'end' });
    s += barChart(40 + 50, top + 170, bw - 100, 280, [.35, .48, .42, .6, .52, .72, .64, .8, .7, .92, .84, 1], ac, t, { hl: 9 });
    ['فرو', 'ارد', 'خرد', 'تیر', 'مرد', 'شهر'].forEach((m, i) => s += T(40 + 50 + (bw - 100) * (i + .5) / 6, top + 484, m, { size: 11.5, c: t.mute, a: 'middle' }));
    // tooltip on highlighted bar
    const tx = 40 + 50 + (bw - 100) * 9.5 / 6;
    s += R(tx - 74, top + 176, 148, 52, '#0f172a', { rx: 10, filter: 'sh' });
    s += T(tx, top + 198, 'مرداد ۱۴۰۵', { size: 11.5, c: '#94a3b8', a: 'middle' });
    s += T(tx, top + 218, '۸۴۲٬۵۰۰٬۰۰۰ تومان', { size: 12.5, w: 700, c: '#fff', a: 'middle' });
    // donut card
    const dx = 40 + bw + 24, dw = DW - 40 - dx;
    s += R(dx, top + 88, dw, 430, t.surface, { rx: 16, filter: 'sh' });
    s += T(dx + dw - 26, top + 126, 'منابع فروش', { size: 15.5, w: 700, c: t.text, a: 'end' });
    s += donut(dx + dw / 2, top + 268, 88, [{ v: 44, c: ac }, { v: 26, c: ACC.teal }, { v: 18, c: ACC.violet }, { v: 12, c: ACC.amber }], t, { sw: 22 });
    s += T(dx + dw / 2, top + 262, faNum(1866), { size: 22, w: 800, c: t.text, a: 'middle' });
    s += T(dx + dw / 2, top + 286, 'سفارش', { size: 12, c: t.sub, a: 'middle' });
    [['وب‌سایت', 44, ac], ['اپلیکیشن', 26, ACC.teal], ['تلگرام', 18, ACC.violet], ['حضوری', 12, ACC.amber]].forEach((r, i) => {
        const ry = top + 400 + i * 28;
        s += C(dx + dw - 30, ry - 5, 5, r[2]);
        s += T(dx + dw - 44, ry, r[0], { size: 12.5, c: t.sub, a: 'end' });
        s += T(dx + 30, ry, fa(r[1]) + '٪', { size: 12.5, w: 700, c: t.text });
    });
    // table
    const ty = top + 542, tw = DW - 80;
    s += R(40, ty, tw, DH - ty - 26, t.surface, { rx: 16, filter: 'sh' });
    s += T(DW - 66, ty + 36, 'محصولات برتر', { size: 15.5, w: 700, c: t.text, a: 'end' });
    const cols = [[.26, 'محصول'], [.16, 'دسته‌بندی'], [.14, 'فروش'], [.16, 'درآمد (تومان)'], [.14, 'رشد'], [.14, 'روند']];
    let xx = DW - 40; const xs = []; const hy = ty + 68;
    s += R(52, hy - 24, tw - 24, 34, t.surface2, { rx: 8 });
    cols.forEach(c => { xx -= tw * c[0]; xs.push(xx + tw * c[0]); s += T(xx + tw * c[0] - 18, hy, c[1], { size: 12.5, w: 600, c: t.sub, a: 'end' }); });
    [['اشتراک طلایی سالانه', 'اشتراک', faNum(486), faNum(288000000), '+۲۴٪', [.3, .4, .5, .45, .6, .7, .8]],
    ['پکیج آموزش ویدیویی', 'آموزش', faNum(352), faNum(176000000), '+۱۱٪', [.4, .35, .5, .55, .5, .6, .65]],
    ['اشتراک نقره‌ای ماهانه', 'اشتراک', faNum(298), faNum(89000000), '−۳٪', [.6, .55, .5, .52, .45, .42, .4]],
    ['مشاوره تخصصی ساعتی', 'خدمات', faNum(141), faNum(84000000), '+۸٪', [.3, .35, .4, .5, .48, .55, .6]]].forEach((r, i) => {
        const ry = hy + 36 + i * 46;
        if (i % 2) s += R(52, ry - 24, tw - 24, 44, t.surface2, { rx: 8, op: .7 });
        s += T(xs[0] - 18, ry, r[0], { size: 13.5, w: 600, c: t.text, a: 'end' });
        s += pill(xs[1] - tw * .08, ry - 5, r[1], ac, null, { size: 11.5, h: 24 });
        s += T(xs[2] - 18, ry, r[2], { size: 13, c: t.text, a: 'end' });
        s += T(xs[3] - 18, ry, r[3], { size: 13, w: 600, c: t.text, a: 'end' });
        s += T(xs[4] - 18, ry, r[4], { size: 12.5, w: 700, c: r[4][0] === '+' ? ACC.green : ACC.red, a: 'end' });
        s += spark(xs[5] - 120, ry - 16, 100, 22, r[5], r[4][0] === '+' ? ACC.green : ACC.red);
    });
    return { w: DW, h: DH, svg: s };
}
function p4dash3() {
    const t = TH.light, ac = ACC.indigo;
    const br = browser(DW, { theme: 'light', url: 'https://analytics.roshan-insight.ir/reports', title: 'گزارش‌گیری | روشنا', tabs: [{ t: 'گزارش‌گیری | روشنا' }], fav: ac });
    let s = br.s + R(0, br.y, DW, DH - br.y, t.bg);
    const top = br.y;
    s += T(DW - 40, top + 46, 'مرکز گزارش‌گیری', { size: 20, w: 800, c: t.text, a: 'end' });
    s += T(DW - 40, top + 72, 'گزارش‌های دوره‌ای را زمان‌بندی و دریافت کنید', { size: 13, c: t.sub, a: 'end' });
    // filter bar
    s += R(40, top + 96, DW - 80, 74, t.surface, { rx: 14, filter: 'sh' });
    s += field(DW - 240, top + 116, 200, 40, 'از تاریخ', faDate(1405, 6, 1), t);
    s += field(DW - 460, top + 116, 200, 40, 'تا تاریخ', faDate(1405, 6, 30), t);
    s += field(DW - 700, top + 116, 220, 40, 'نوع گزارش', 'فروش و درآمد', t, { chev: 1 });
    s += btn(60, top + 114, 150, 42, 'خروجی Excel', 'primary', t, ACC.green, { size: 13, icon: 'download' });
    s += btn(220, top + 114, 130, 42, 'PDF', 'outline', t, ACC.red, { size: 13, icon: 'doc' });
    s += btn(360, top + 114, 160, 42, 'زمان‌بندی خودکار', 'outline', t, ac, { size: 13, icon: 'clock' });
    // scheduled reports list
    const ly = top + 194, lw = (DW - 80 - 24) * 0.55;
    s += R(40, ly, lw, DH - ly - 26, t.surface, { rx: 16, filter: 'sh' });
    s += T(40 + lw - 26, ly + 38, 'گزارش‌های زمان‌بندی‌شده', { size: 15.5, w: 700, c: t.text, a: 'end' });
    [['گزارش روزانه فروش', 'هر روز ساعت ۸', 'فعال', ACC.green, 'card'], ['گزارش هفتگی بازدید', 'شنبه‌ها ساعت ۹', 'فعال', ACC.green, 'eye'], ['گزارش ماهانه مدیریت', 'اول هر ماه', 'فعال', ACC.green, 'doc'], ['هشدار افت شاخص‌ها', 'بلادرنگ', 'متوقف', ACC.red, 'bell']].forEach((r, i) => {
        const ry = ly + 76 + i * 88;
        s += R(60, ry, lw - 40, 74, t.surface2, { rx: 12, stroke: t.border });
        s += R(60 + lw - 108, ry + 18, 40, 40, r[4] === 'bell' ? ACC.red : ac, { rx: 11, op: .13 });
        s += icon(r[4], 60 + lw - 98, ry + 28, 20, r[4] === 'bell' ? ACC.red : ac, 2);
        s += T(60 + lw - 124, ry + 34, r[0], { size: 14.5, w: 700, c: t.text, a: 'end' });
        s += T(60 + lw - 124, ry + 56, r[1], { size: 12.5, c: t.sub, a: 'end' });
        s += pill(110, ry + 37, r[2], r[3], null, { size: 11.5, h: 24 });
        s += toggle(150, ry + 26, r[2] === 'فعال', ACC.green);
    });
    // preview table
    const px = 40 + lw + 24, pw = DW - 40 - px;
    s += R(px, ly, pw, DH - ly - 26, t.surface, { rx: 16, filter: 'sh' });
    s += T(px + pw - 26, ly + 38, 'پیش‌نمایش گزارش فروش', { size: 15.5, w: 700, c: t.text, a: 'end' });
    s += R(px + 20, ly + 58, pw - 40, 150, t.surface2, { rx: 12 });
    s += barChart(px + 44, ly + 82, pw - 88, 100, [.4, .55, .48, .7, .62, .85, .78], ac, t, { hl: 5 });
    const rows = [['شنبه', faNum(48200000), faNum(186)], ['یکشنبه', faNum(51800000), faNum(204)], ['دوشنبه', faNum(44900000), faNum(171)], ['سه‌شنبه', faNum(63400000), faNum(242)], ['چهارشنبه', faNum(58100000), faNum(221)]];
    s += T(px + pw - 40, ly + 236, 'روز', { size: 12.5, w: 600, c: t.sub, a: 'end' });
    s += T(px + pw / 2 + 30, ly + 236, 'درآمد (تومان)', { size: 12.5, w: 600, c: t.sub, a: 'end' });
    s += T(px + 40, ly + 236, 'سفارش‌ها', { size: 12.5, w: 600, c: t.sub });
    rows.forEach((r, i) => {
        const ry = ly + 268 + i * 42;
        if (i % 2) s += R(px + 20, ry - 22, pw - 40, 38, t.surface2, { rx: 8, op: .7 });
        s += T(px + pw - 40, ry, r[0], { size: 13, w: 500, c: t.text, a: 'end' });
        s += T(px + pw / 2 + 30, ry, r[1], { size: 13, c: t.text, a: 'end' });
        s += T(px + 40, ry, r[2], { size: 13, c: t.text });
    });
    // pagination
    const py2 = DH - 62;
    s += T(px + 40, py2, 'صفحه ۱ از ۴', { size: 12.5, c: t.sub });
    [1, 2, 3, 4].forEach((n, i) => {
        s += R(px + pw - 168 + i * 36, py2 - 20, 30, 30, i === 0 ? ac : t.surface2, { rx: 8, stroke: i === 0 ? 'none' : t.border });
        s += T(px + pw - 153 + i * 36, py2, fa(n), { size: 12.5, w: 600, c: i === 0 ? '#fff' : t.sub, a: 'middle' });
    });
    s += icon('chev-l', px + pw - 200, py2 - 14, 18, t.mute, 2);
    return { w: DW, h: DH, svg: s };
}

// ---------- P5: API ----------
function p5api1() {
    const t = TH.light, ac = ACC.blue;
    const br = browser(DW, { theme: 'light', url: 'https://api.novin-dev.ir/docs', title: 'مستندات API | نوین‌دِو', tabs: [{ t: 'مستندات API | نوین‌دِو' }, { t: 'GitHub', fav: '#24292e' }], fav: ac });
    let s = br.s + R(0, br.y, DW, DH - br.y, '#fafbfc');
    const top = br.y;
    s += R(0, top, DW, 70, '#ffffff') + L(0, top + 70, DW, top + 70, t.border, 1);
    s += T(DW - 40, top + 44, 'مستندات API نوین‌دِو', { size: 19, w: 800, c: t.text, a: 'end' });
    s += pill(DW - 330, top + 38, 'v2.4.1', ac, null, { size: 12, fam: MO, h: 26 });
    s += T(DW - 420, top + 44, 'Swagger / OpenAPI 3.1', { size: 12.5, fam: MO, c: t.sub, a: 'end' });
    s += btn(60, top + 16, 150, 38, 'دریافت Schema', 'outline', t, ac, { size: 12.5, icon: 'download' });
    // auth banner
    s += R(40, top + 94, DW - 80, 62, '#eef6ff', { rx: 12, stroke: '#bfdbfe' });
    s += icon('lock', DW - 76, top + 114, 20, ac, 2);
    s += T(DW - 96, top + 124, 'احراز هویت: هدر Authorization با توکن JWT', { size: 13.5, w: 600, c: '#1e40af', a: 'end' });
    s += T(DW - 480, top + 124, 'Bearer <token>', { size: 12.5, fam: MO, c: '#1e40af', a: 'end' });
    s += T(70, top + 124, 'نمونه توکن تستی در پنل توسعه‌دهندگان موجود است.', { size: 12.5, c: '#3b82f6' });
    // endpoint list
    const eps = [
        ['POST', '/api/v1/auth/login', 'ورود و دریافت توکن', ACC.green, 0],
        ['GET', '/api/v1/products', 'فهرست محصولات با صفحه‌بندی و فیلتر', ACC.blue, 1],
        ['GET', '/api/v1/products/{id}', 'جزئیات یک محصول', ACC.blue, 0],
        ['POST', '/api/v1/orders', 'ثبت سفارش جدید', ACC.green, 0],
        ['GET', '/api/v1/orders/{id}/status', 'وضعیت سفارش', ACC.blue, 0],
        ['PUT', '/api/v1/users/{id}', 'به‌روزرسانی پروفایل کاربر', ACC.amber, 0],
        ['DELETE', '/api/v1/cart/{itemId}', 'حذف آیتم از سبد', ACC.red, 0]
    ];
    let y = top + 180;
    eps.forEach((e, i) => {
        const eh = e[4] ? 262 : 52;
        s += R(40, y, DW - 80, eh, '#ffffff', { rx: 12, stroke: e[4] ? ac : t.border, sw: e[4] ? 1.6 : 1 });
        s += R(DW - 150, y + 11, 76, 30, e[3], { rx: 8, op: .15 });
        s += T(DW - 112, y + 31, e[0], { size: 12, w: 700, fam: MO, c: e[3], a: 'middle' });
        s += T(DW - 170, y + 32, e[1], { size: 13.5, fam: MO, c: t.text, a: 'end' });
        s += T(DW - 620, y + 32, e[2], { size: 13, c: t.sub, a: 'end' });
        s += icon(e[4] ? 'chev-l' : 'chev-r', 60, y + 17, 18, t.mute, 2);
        if (e[4]) {
            s += L(56, y + 52, DW - 56, y + 52, t.border, 1);
            s += T(DW - 70, y + 78, 'پارامترها', { size: 13.5, w: 700, c: t.text, a: 'end' });
            [['page', 'integer', 'شماره صفحه (پیش‌فرض ۱)', 0], ['limit', 'integer', 'تعداد آیتم در هر صفحه (حداکثر ۵۰)', 0], ['category', 'string', 'فیلتر دسته‌بندی', 0], ['q', 'string', 'جست‌وجو در نام محصولات', 1]].forEach((p, pi) => {
                const py = y + 102 + pi * 30;
                s += T(DW - 70, py, p[0], { size: 12.5, w: 700, fam: MO, c: '#0f172a', a: 'end' });
                s += T(DW - 190, py, p[1], { size: 12, fam: MO, c: ACC.violet, a: 'end' });
                s += T(DW - 290, py, p[2], { size: 12.5, c: t.sub, a: 'end' });
                if (p[3]) s += pill(DW - 700, py - 5, 'اختیاری', t.mute, null, { size: 10.5, h: 20, bgOp: .14, text: t.sub });
                else s += pill(DW - 700, py - 5, 'اختیاری', t.mute, null, { size: 10.5, h: 20, bgOp: .14, text: t.sub });
            });
            s += R(DW - 220, y + 212, 150, 36, ac, { rx: 9 });
            s += T(DW - 145, y + 235, 'اجرای آزمایشی', { size: 13, w: 600, c: '#fff', a: 'middle' });
            s += R(DW - 420, y + 212, 180, 36, '#ffffff', { rx: 9, stroke: t.border });
            s += T(DW - 330, y + 235, '۲۰۰ OK • ۸۴ms', { size: 12.5, w: 600, c: ACC.green, a: 'middle' });
            s += T(70, y + 235, 'پاسخ نمونه:', { size: 12.5, w: 600, c: t.sub });
        }
        y += eh + 10;
    });
    return { w: DW, h: DH, svg: s };
}
function p5api2() {
    const t = TH.dark;
    const br = browser(DW, { theme: 'dark', url: 'https://api.novin-dev.ir/docs#test', title: 'تست API | نوین‌دِو', tabs: [{ t: 'تست API — ترمینال' }], fav: ACC.blue });
    let s = br.s + R(0, br.y, DW, DH - br.y, '#0b1120');
    const top = br.y;
    // terminal window
    const tw = (DW - 100) * 0.58, tx = DW - 50 - tw, ty = top + 40, th = DH - top - 90;
    s += R(tx, ty, tw, th, '#0f172a', { rx: 14, stroke: '#1e293b', filter: 'sh2' });
    s += R(tx, ty, tw, 44, '#1e293b', { rx: 14 }); s += R(tx, ty + 22, tw, 22, '#1e293b');
    ['#ef4444', '#f59e0b', '#10b981'].forEach((c, i) => s += C(tx + 26 + i * 24, ty + 22, 6.5, c));
    s += T(tx + tw / 2, ty + 27, 'amir@server: ~ — curl', { size: 12.5, fam: MO, c: '#94a3b8', a: 'middle' });
    const code = [
        ['# ', '$ ', 'curl -X GET "https://api.novin-dev.ir/api/v1/products?limit=2" \\'],
        ['', '  ', '  -H "Authorization: Bearer eyJhbGciOi…" \\'],
        ['', '  ', '  -H "Accept: application/json"'],
        ['', '', ''],
        ['# ', '{', ''],
        ['', '  "ok": true,', ''],
        ['', '  "count": 128,', ''],
        ['', '  "items": [', ''],
        ['', '    { "id": 1, "name": "هاست وردپرس پرسرعت",', ''],
        ['', '      "price": 1250000, "unit": "ماهانه" },', ''],
        ['', '    { "id": 2, "name": "کانفیگ V2Ray",', ''],
        ['', '      "price": 680000, "unit": "ماهانه" }', ''],
        ['', '  ],', ''],
        ['', '  "cached": true, "ttl": 60', ''],
        ['', '}', ''],
        ['', '', ''],
        ['# ', '$ ', 'curl -X POST "https://api.novin-dev.ir/api/v1/orders" \\'],
        ['', '  ', '  -H "Authorization: Bearer eyJhbGciOi…" -d @order.json'],
        ['', '', ''],
        ['', 'HTTP/2 201 Created', ''],
        ['', 'x-cache: HIT • x-req-time: 6ms', ''],
        ['', '', '{ "ok": true, "orderId": 140319 }']
    ];
    let cy = ty + 78;
    code.forEach(ln => {
        if (ln[0] === '# ' && ln[1] === '$ ') {
            s += T(tx + 26, cy, '$', { size: 13.5, fam: MO, c: '#10b981' });
            s += T(tx + 44, cy, ln[2], { size: 13, fam: MO, c: '#e2e8f0' });
        } else if (ln[0] === '# ') {
            s += T(tx + 26, cy, '{', { size: 13.5, fam: MO, c: '#e2e8f0' });
        } else if (ln[1]) {
            s += T(tx + 44, cy, ln[1], { size: 13, fam: MO, c: '#94a3b8' });
            s += T(tx + 44 + ln[1].length * 7.8, cy, ln[2], { size: 13, fam: MO, c: '#e2e8f0' });
        } else if (ln[1] === '') {
            const j = ln[2];
            const colored = j
                .replace(/"([^"]+)":/g, '@k@$1@/k@')
                .replace(/: "([^"]*)"/g, ': @s@$1@/s@')
                .replace(/: (\d+|true|false)/g, ': @n@$1@/n@');
            let xx2 = tx + 26, mode = 'p';
            const tokens = colored.split(/(@\/?[ksn]@)/);
            tokens.forEach(tk => {
                if (tk === '@k@') { mode = 'k'; return; } if (tk === '@s@') { mode = 's'; return; } if (tk === '@n@') { mode = 'n'; return; }
                if (tk === '@/k@' || tk === '@/s@' || tk === '@/n@') { mode = 'p'; return; }
                if (!tk) return;
                const col = mode === 'k' ? '#7dd3fc' : mode === 's' ? '#a5b4fc' : mode === 'n' ? '#fbbf24' : '#e2e8f0';
                // Persian inside JSON value: render with Vazirmatn
                const isFa = /[؀-ۿ]/.test(tk);
                s += T(xx2, cy, tk, { size: 13, fam: isFa ? FA : MO, c: col });
                xx2 += tk.length * (isFa ? 6.6 : 7.8);
            });
        }
        cy += 26;
    });
    s += R(tx + 26, cy - 16, 9, 17, '#10b981');
    // right: test results card
    const rx = 50, rw = tx - 90;
    s += R(rx, ty, rw, 300, '#111c33', { rx: 14, stroke: '#1e293b', filter: 'sh2' });
    s += T(rx + rw - 26, ty + 40, 'نتیجه تست‌های خودکار', { size: 15.5, w: 700, c: '#f1f5f9', a: 'end' });
    s += pill(rx + 70, ty + 34, fa(24) + ' از ' + fa(24), ACC.green, null, { size: 12, h: 26 });
    [['احراز هویت JWT', '۱۲ms'], ['کش Redis', '۳ms'], ['صفحه‌بندی', '۹ms'], ['Rate limit', '۶ms']].forEach((r, i) => {
        const ry = ty + 82 + i * 52;
        s += icon('check-circle', rx + rw - 44, ry - 14, 20, ACC.green, 2.2);
        s += T(rx + rw - 60, ry, r[0], { size: 13.5, w: 600, c: '#e2e8f0', a: 'end' });
        s += T(rx + 26, ry, r[1], { size: 12.5, fam: MO, c: '#64748b' });
    });
    s += R(rx, ty + 320, rw, 220, '#111c33', { rx: 14, stroke: '#1e293b', filter: 'sh2' });
    s += T(rx + rw - 26, ty + 358, 'شاخص‌های سرویس', { size: 15.5, w: 700, c: '#f1f5f9', a: 'end' });
    s += areaChart(rx + 40, ty + 390, rw - 80, 120, [.5, .55, .52, .6, .58, .66, .63, .7], ACC.teal, { border: '#1e293b', surface: '#111c33' });
    s += T(rx + rw - 26, ty + 524, 'میانگین پاسخ: ۸۴ میلی‌ثانیه • آپ‌تایم ۹۹٫۹۹٪', { size: 12, c: '#94a3b8', a: 'end' });
    return { w: DW, h: DH, svg: s };
}

// ---------- P6: Cloudflare ----------
function p6cloud1() {
    const t = TH.light, ac = ACC.orange;
    const br = browser(DW, { theme: 'light', url: 'https://dash.cloudflare.com/amir/workers-and-pages', title: 'Cloudflare | Workers & Pages', tabs: [{ t: 'Workers & Pages | کلادفلر' }, { t: 'R2 Storage', fav: ac }], fav: ac });
    let s = br.s + R(0, br.y, DW, DH - br.y, '#f9f9f8');
    const top = br.y, sideW = 236;
    s += R(DW - sideW, top, sideW, DH - top, '#ffffff') + L(DW - sideW, top, DW - sideW, DH, t.border, 1);
    s += C(DW - 44, top + 40, 17, ac); s += icon('cloud', DW - 53, top + 31, 18, '#fff', 2.4);
    s += T(DW - 70, top + 46, 'حساب amir', { size: 15, w: 700, c: t.text, a: 'end' });
    [['home', 'نمای کلی'], ['chart', 'تحلیل‌ها'], ['workers', 'Workers & Pages'], ['box', 'R2 Storage'], ['shield', 'Security'], ['gear', 'تنظیمات']].forEach((n, i) => {
        const ny = top + 84 + i * 44, on = i === 2;
        if (on) s += R(DW - sideW + 10, ny, sideW - 20, 38, '#fef1e7', { rx: 9 });
        s += icon(n[0] === 'workers' ? 'refresh' : n[0], DW - 46, ny + 9, 19, on ? ac : t.sub, 2);
        s += T(DW - 66, ny + 24, n[1], { size: 13.5, w: on ? 700 : 500, c: on ? ac : t.sub, a: 'end', fam: /[A-Z]/.test(n[1]) ? LA : FA });
    });
    const cx1 = DW - sideW - 36, cx0 = 36;
    s += T(cx1, top + 46, 'Workers & Pages', { size: 21, w: 800, c: t.text, a: 'end', fam: LA });
    s += T(cx1, top + 72, 'استقرارهای اخیر پروژه‌ها', { size: 13, c: t.sub, a: 'end' });
    s += btn(cx0 + 160, top + 26, 160, 40, 'استقرار جدید', 'primary', t, ac, { size: 13.5, icon: 'plus' });
    s += btn(cx0, top + 26, 140, 40, 'اتصال Git', 'outline', t, ac, { size: 13, icon: 'folder' });
    // deployments table
    const ty = top + 100, tw = cx1 - cx0;
    s += R(cx0, ty, tw, 420, '#ffffff', { rx: 14, stroke: t.border });
    const cols = [[.22, 'پروژه'], [.16, 'شاخه'], [.14, 'کامیت'], [.13, 'وضعیت'], [.15, 'زمان'], [.2, 'عملیات']];
    let xx = cx1; const xs = []; const hy = ty + 40;
    s += R(cx0 + 12, hy - 24, tw - 24, 36, '#f4f4f2', { rx: 8 });
    cols.forEach(c => { xx -= tw * c[0]; xs.push(xx + tw * c[0]); s += T(xx + tw * c[0] - 18, hy, c[1], { size: 12.5, w: 600, c: t.sub, a: 'end' }); });
    const deps = [
        ['shop-frontend', 'main', 'a41f9c2', 'موفق', '۲ دقیقه پیش', 'Production'],
        ['telegram-bot-worker', 'main', '7d02bb8', 'موفق', '۱۸ دقیقه پیش', 'Production'],
        ['api-gateway', 'release/v2', 'e9c15aa', 'در حال ساخت', '۴ دقیقه پیش', 'Preview'],
        ['landing-pages', 'main', '31cbe07', 'موفق', 'دیروز ۲۲:۱۴', 'Production'],
        ['image-resizer', 'dev', '9f4e21d', 'ناموفق', 'دیروز ۱۹:۰۲', 'Preview']
    ];
    deps.forEach((d, i) => {
        const ry = hy + 42 + i * 66;
        if (i % 2) s += R(cx0 + 12, ry - 28, tw - 24, 58, '#fafaf9', { rx: 8 });
        s += C(xs[0] - 34, ry - 6, 15, [ac, ACC.violet, ACC.blue, ACC.teal, ACC.indigo][i]);
        s += icon('cloud', xs[0] - 42, ry - 14, 16, '#fff', 2);
        s += T(xs[0] - 58, ry, d[0], { size: 13.5, w: 700, fam: MO, c: t.text, a: 'end' });
        s += R(xs[1] - 86, ry - 17, 74, 25, '#f4f4f2', { rx: 7, stroke: t.border });
        s += T(xs[1] - 49, ry, d[1], { size: 11.5, fam: MO, c: t.sub, a: 'middle' });
        s += T(xs[2] - 18, ry, d[2], { size: 12.5, fam: MO, c: ACC.blue, a: 'end' });
        const stc = d[3] === 'موفق' ? ACC.green : d[3] === 'ناموفق' ? ACC.red : ACC.amber;
        s += icon(d[3] === 'موفق' ? 'check-circle' : d[3] === 'ناموفق' ? 'close' : 'refresh', xs[3] - 82, ry - 15, 18, stc, 2.2);
        s += T(xs[3] - 56, ry, d[3], { size: 12.5, w: 600, c: stc, a: 'end' });
        s += T(xs[4] - 18, ry, d[4], { size: 12.5, c: t.sub, a: 'end' });
        s += pill(xs[5] - 70, ry - 5, d[5], d[5] === 'Production' ? ACC.green : ACC.blue, null, { size: 10.5, h: 22, fam: LA });
        s += icon('eye', xs[5] - 140, ry - 15, 18, t.mute, 2);
        s += icon('kebab', xs[5] - 24, ry - 15, 18, t.mute, 2);
    });
    // metrics row
    const my = ty + 444;
    [['درخواست‌ها (۲۴ ساعت)', faNum(2480000), '+۸٪', ACC.green, [.4, .5, .46, .62, .58, .74, .7, .86]], ['خطاها', '۰٫۰۲٪', '−۰٫۰۱٪', ACC.green, [.6, .5, .55, .4, .45, .35, .4, .3]], ['زمان CPU', '۴۲ms', 'پایدار', ACC.blue, [.5, .52, .48, .54, .5, .53, .51, .52]]].forEach((m, i) => {
        const mw = (cx1 - cx0 - 40) / 3, mx = cx0 + (2 - i) * (mw + 20);
        s += R(mx, my, mw, DH - my - 28, '#ffffff', { rx: 14, stroke: t.border });
        s += T(mx + mw - 22, my + 34, m[0], { size: 13, c: t.sub, a: 'end' });
        s += T(mx + mw - 22, my + 74, m[1], { size: 26, w: 800, c: t.text, a: 'end' });
        s += pill(mx + 52, my + 66, m[2], m[3], null, { size: 11, h: 22 });
        s += spark(mx + 100, my + 100, mw - 130, 44, m[4], ac);
    });
    return { w: DW, h: DH, svg: s };
}
function p6cloud2() {
    const t = TH.light, ac = ACC.orange;
    const br = browser(DW, { theme: 'light', url: 'https://dash.cloudflare.com/amir/r2/media-bucket', title: 'R2 Storage | کلادفلر', tabs: [{ t: 'R2 Storage | کلادفلر' }], fav: ac });
    let s = br.s + R(0, br.y, DW, DH - br.y, '#f9f9f8');
    const top = br.y;
    s += T(DW - 40, top + 46, 'media-bucket', { size: 21, w: 800, c: t.text, a: 'end', fam: MO });
    s += T(DW - 250, top + 46, 'R2 / buckets /', { size: 13, c: t.sub, a: 'end', fam: MO });
    s += btn(200, top + 26, 140, 40, 'آپلود فایل', 'primary', t, ac, { size: 13.5, icon: 'download' });
    s += btn(40, top + 26, 140, 40, 'پوشه جدید', 'outline', t, ac, { size: 13, icon: 'folder' });
    // usage card
    const uw = 380;
    s += R(DW - 40 - uw, top + 92, uw, 150, '#ffffff', { rx: 14, stroke: t.border });
    s += T(DW - 66, top + 126, 'مصرف فضای ذخیره‌سازی', { size: 14, w: 700, c: t.text, a: 'end' });
    s += donut(DW - 40 - uw + 76, top + 176, 42, [{ v: 62, c: ac }, { v: 38, c: '#e7e5e4' }], t, { sw: 12 });
    s += T(DW - 40 - uw + 76, top + 182, fa(62) + '٪', { size: 15, w: 800, c: t.text, a: 'middle' });
    s += T(DW - 66, top + 168, '۶٫۲ از ۱۰ گیگابایت', { size: 13, c: t.sub, a: 'end' });
    s += T(DW - 66, top + 192, '۱٬۲۸۴ آبجکت • بدون هزینه خروج ترافیک', { size: 12, c: t.mute, a: 'end' });
    s += T(DW - 66, top + 220, 'صرافی ماهانه: $۰٫۰۰', { size: 12.5, w: 700, c: ACC.green, a: 'end' });
    // file table
    const tx0 = 40, tw = DW - 80 - uw - 24, ty = top + 92;
    s += R(tx0, ty, tw, DH - ty - 28, '#ffffff', { rx: 14, stroke: t.border });
    s += R(tx0 + tw - 276, ty + 16, 260, 38, '#f4f4f2', { rx: 10, stroke: t.border });
    s += icon('search', tx0 + tw - 262, ty + 26, 17, t.mute, 2);
    s += T(tx0 + tw - 236, ty + 40, 'جست‌وجو در فایل‌ها…', { size: 12.5, c: t.mute });
    const cols = [[.34, 'نام فایل'], [.14, 'اندازه'], [.16, 'نوع'], [.18, 'آخرین تغییر'], [.18, 'عملیات']];
    let xx = tx0 + tw; const xs = []; const hy = ty + 84;
    s += R(tx0 + 12, hy - 24, tw - 24, 34, '#f4f4f2', { rx: 8 });
    cols.forEach(c => { xx -= tw * c[0]; xs.push(xx + tw * c[0]); s += T(xx + tw * c[0] - 18, hy, c[1], { size: 12.5, w: 600, c: t.sub, a: 'end' }); });
    const files = [
        ['products/hosting-wordpress.jpg', '۲۴۸ KB', 'image/jpeg', '۱۴۰۵/۰۶/۲۸'],
        ['products/vpn-v2ray.jpg', '۱۹۶ KB', 'image/jpeg', '۱۴۰۵/۰۶/۲۸'],
        ['invoices/140312.pdf', '۸۴ KB', 'application/pdf', '۱۴۰۵/۰۶/۳۰'],
        ['backups/db-weekly.sql.gz', '۱۲٫۴ MB', 'application/gzip', '۱۴۰۵/۰۶/۲۹'],
        ['media/intro-video.mp4', '۴۸٫۲ MB', 'video/mp4', '۱۴۰۵/۰۶/۲۱'],
        ['assets/vazir-font.woff2', '۹۶ KB', 'font/woff2', '۱۴۰۵/۰۵/۱۲']
    ];
    files.forEach((f, i) => {
        const ry = hy + 40 + i * 56;
        if (i % 2) s += R(tx0 + 12, ry - 26, tw - 24, 50, '#fafaf9', { rx: 8 });
        s += icon(f[0].endsWith('.pdf') ? 'doc' : f[0].includes('.mp4') ? 'play' : f[0].includes('.sql') ? 'server' : 'box', xs[0] - 40, ry - 15, 20, f[0].endsWith('.pdf') ? ACC.red : f[0].includes('.mp4') ? ACC.violet : ac, 2);
        s += T(xs[0] - 52, ry, f[0], { size: 12.5, fam: MO, c: t.text, a: 'end' });
        s += T(xs[1] - 18, ry, f[1], { size: 12.5, c: t.sub, a: 'end' });
        s += T(xs[2] - 18, ry, f[2], { size: 11.5, fam: MO, c: t.mute, a: 'end' });
        s += T(xs[3] - 18, ry, f[3], { size: 12.5, c: t.sub, a: 'end' });
        s += icon('copy', xs[4] - 96, ry - 15, 18, t.mute, 2);
        s += icon('download', xs[4] - 66, ry - 15, 18, t.mute, 2);
        s += icon('close', xs[4] - 36, ry - 15, 18, ACC.red, 2);
    });
    // right bottom: lifecycle card
    const cy0 = top + 266;
    s += R(DW - 40 - uw, cy0, uw, DH - cy0 - 28, '#ffffff', { rx: 14, stroke: t.border });
    s += T(DW - 66, cy0 + 34, 'قوانین نگهداری (Lifecycle)', { size: 14, w: 700, c: t.text, a: 'end' });
    [['پشتیبان‌گیری خودکار هفتگی', 1], ['حذف فایل‌های موقت پس از ۳۰ روز', 1], ['فشرده‌سازی تصاویر هنگام آپلود', 0]].forEach((r, i) => {
        const ry = cy0 + 72 + i * 56;
        s += T(DW - 66, ry, r[0], { size: 12.5, w: 500, c: t.text, a: 'end' });
        s += toggle(DW - 40 - uw + 24, ry - 14, r[1], ac);
    });
    s += R(DW - 40 - uw + 20, cy0 + 240, uw - 40, 74, '#fef1e7', { rx: 10 });
    s += T(DW - 60, cy0 + 272, 'خروج ترافیک از R2 روی کلادفلر رایگان است؛', { size: 12, c: '#9a3412', a: 'end' });
    s += T(DW - 60, cy0 + 292, 'به همین دلیل هزینه egress صفر می‌ماند.', { size: 12, c: '#9a3412', a: 'end' });
    return { w: DW, h: DH, svg: s };
}

// ---------- P7: shop ----------
function p7shop1() {
    const t = TH.light, ac = ACC.violet;
    const br = browser(DW, { theme: 'light', url: 'https://shop.nik-kala.ir/products', title: 'فروشگاه نیک‌کالا', tabs: [{ t: 'فروشگاه نیک‌کالا | محصولات' }, { t: 'سبد خرید', fav: ACC.green }], fav: ac });
    let s = br.s + R(0, br.y, DW, DH - br.y, '#ffffff');
    const top = br.y;
    s += R(0, top, DW, 74, '#ffffff') + L(0, top + 74, DW, top + 74, t.border, 1);
    s += C(DW - 62, top + 37, 18, ac); s += icon('cart', DW - 71, top + 28, 18, '#fff', 2.2);
    s += T(DW - 90, top + 44, 'نیک‌کالا', { size: 19, w: 800, c: t.text, a: 'end' });
    s += R(DW / 2 - 260, top + 19, 520, 38, t.surface2, { rx: 19, stroke: t.border });
    s += icon('search', DW / 2 - 240, top + 29, 18, t.mute, 2);
    s += T(DW / 2 - 210, top + 43, 'جست‌وجو در میان ۱۲۸ محصول…', { size: 13, c: t.mute });
    ['خانه', 'محصولات', 'درباره ما', 'تماس'].forEach((m, i) => s += T(DW - 260 - i * 96, top + 43, m, { size: 14, w: i === 1 ? 700 : 500, c: i === 1 ? ac : t.sub, a: 'end' }));
    s += icon('cart', 96, top + 27, 21, t.text, 2); s += C(88, top + 26, 9, ACC.red); s += T(88, top + 30, fa(2), { size: 10.5, w: 700, c: '#fff', a: 'middle' });
    s += icon('user', 48, top + 27, 21, t.sub, 2);
    // category chips
    let y = top + 98;
    let chipX = DW - 40;
    ['همه', 'هاست', 'دامنه', 'سرور مجازی', 'VPN', 'گواهی SSL'].forEach((c, i) => {
        const cw2 = c.length * 8.6 + 44;
        chipX -= cw2;
        s += R(chipX, y, cw2, 38, i === 0 ? ac : t.surface2, { rx: 19, stroke: i === 0 ? 'none' : t.border });
        s += T(chipX + cw2 / 2, y + 25, c, { size: 13, w: 600, c: i === 0 ? '#fff' : t.sub, a: 'middle' });
        chipX -= 12;
    });
    s += T(40, y + 25, faNum(128) + ' محصول', { size: 13, c: t.sub });
    // grid
    const prods = [
        ['hosting-wordpress.jpg', 'هاست وردپرس پرسرعت', '۱٬۲۵۰٬۰۰۰', 'پرفروش', ac],
        ['hosting-linux.jpg', 'هاست لینوکس پایه', '۹۰۰٬۰۰۰', '', ''],
        ['vps-germany.jpg', 'سرور مجازی آلمان', '۴٬۸۰۰٬۰۰۰', 'ویژه', ACC.amber],
        ['vps-iran.jpg', 'سرور مجازی ایران', '۳۲۰۰٬۰۰۰', '', ''],
        ['vpn-v2ray.jpg', 'کانفیگ V2Ray', '۶۸۰٬۰۰۰', 'پرفروش', ac],
        ['vpn-trojan.jpg', 'کانفیگ Trojan', '۷۲۰٬۰۰۰', '', ''],
        ['domain-ir.jpg', 'ثبت دامنه .ir', '۴۵۰٬۰۰۰', '', ''],
        ['domain-com.jpg', 'ثبت دامنه .com', '۹۸۰٬۰۰۰', 'جدید', ACC.green]
    ];
    const gw = (DW - 80 - 3 * 22) / 4, gh = 330;
    y += 60;
    prods.forEach((p, i) => {
        const px = 40 + (3 - (i % 4)) * (gw + 22), py = y + Math.floor(i / 4) * (gh + 22);
        s += R(px, py, gw, gh, '#ffffff', { rx: 14, stroke: t.border, sw: 1.2, filter: 'sh' });
        s += `<defs><clipPath id="pg${i}"><rect x="${px + 1}" y="${py + 1}" width="${gw - 2}" height="168" rx="13"/></clipPath></defs>`;
        s += img(p[0], px + 1, py + 1, gw - 2, 168, `pg${i}`);
        if (p[3]) s += R(px + 14, py + 14, p[3].length * 8 + 22, 26, p[4], { rx: 8 }); s += T(px + 25, py + 32, p[3], { size: 11.5, w: 700, c: '#fff' });
        s += T(px + gw - 18, py + 196, p[1], { size: 14.5, w: 700, c: t.text, a: 'end' });
        s += T(px + gw - 18, py + 222, 'تحویل آنی • پشتیبانی ۲۴/۷', { size: 11.5, c: t.mute, a: 'end' });
        s += T(px + gw - 18, py + 258, p[2], { size: 16.5, w: 800, c: t.text, a: 'end' });
        s += T(px + gw - 18 - p[2].length * 9.4 - 8, py + 258, 'تومان', { size: 11.5, c: t.mute, a: 'end' });
        s += R(px + 16, py + gh - 52, gw - 32, 38, ac, { rx: 10, op: .12 });
        s += icon('cart', px + gw / 2 - 62, py + gh - 42, 18, ac, 2);
        s += T(px + gw / 2 + 10, py + gh - 27, 'افزودن به سبد', { size: 13, w: 600, c: ac, a: 'middle' });
    });
    return { w: DW, h: DH, svg: s };
}
function p7shop2() {
    const t = TH.light, ac = ACC.violet;
    const br = browser(DW, { theme: 'light', url: 'https://shop.nik-kala.ir/product/vps-germany', title: 'سرور مجازی آلمان | نیک‌کالا', tabs: [{ t: 'سرور مجازی آلمان | نیک‌کالا' }], fav: ac });
    let s = br.s + R(0, br.y, DW, DH - br.y, '#fafafa');
    const top = br.y;
    s += R(0, top, DW, 66, '#ffffff') + L(0, top + 66, DW, top + 66, t.border, 1);
    s += C(DW - 56, top + 33, 16, ac); s += T(DW - 80, top + 39, 'نیک‌کالا', { size: 16.5, w: 800, c: t.text, a: 'end' });
    s += T(DW - 200, top + 39, 'محصولات', { size: 13.5, c: t.sub, a: 'end' });
    s += icon('chev-l', DW - 176, top + 28, 14, t.mute, 2);
    s += T(DW - 300, top + 39, 'سرور مجازی', { size: 13.5, c: t.sub, a: 'end' });
    s += icon('chev-l', DW - 276, top + 28, 14, t.mute, 2);
    s += T(DW - 400, top + 39, 'سرور مجازی آلمان', { size: 13.5, w: 600, c: t.text, a: 'end' });
    // gallery
    const gx = DW - 760, gw = 520, gy = top + 100;
    s += R(gx, gy, gw, 420, '#ffffff', { rx: 16, stroke: t.border });
    s += `<defs><clipPath id="pd"><rect x="${gx + 12}" y="${gy + 12}" width="${gw - 24}" height="330" rx="12"/></clipPath></defs>`;
    s += img('vps-germany.jpg', gx + 12, gy + 12, gw - 24, 330, 'pd');
    s += R(gx + 28, gy + 28, 86, 30, ACC.amber, { rx: 9 }); s += T(gx + 71, gy + 48, 'پیشنهاد ویژه', { size: 11.5, w: 700, c: '#fff', a: 'middle' });
    [0, 1, 2].forEach(i => {
        s += R(gx + 12 + i * 92, gy + 356, 80, 52, '#ffffff', { rx: 9, stroke: i === 0 ? ac : t.border, sw: i === 0 ? 2 : 1 });
        s += `<defs><clipPath id="pt${i}"><rect x="${gx + 16 + i * 92}" y="${gy + 360}" width="72" height="44" rx="6"/></clipPath></defs>`;
        s += img(['vps-germany.jpg', 'vps-iran.jpg', 'hosting-linux.jpg'][i], gx + 16 + i * 92, gy + 360, 72, 44, `pt${i}`);
    });
    // info column
    const ix = 60, iw = DW - 820 - 60;
    s += T(ix + iw, gy + 30, 'سرور مجازی آلمان — پلن حرفه‌ای', { size: 26, w: 800, c: t.text, a: 'end' });
    s += T(ix + iw, gy + 62, 'منابع اختصاصی، شبکه پایدار و تحویل آنی پس از پرداخت', { size: 14, c: t.sub, a: 'end' });
    s += R(ix + iw - 120, gy + 84, 120, 30, '#f5f3ff', { rx: 8 }); s += T(ix + iw - 60, gy + 104, '★ ۴٫۹ از ۵', { size: 12.5, w: 700, c: ac, a: 'middle' });
    s += T(ix + iw - 140, gy + 104, faNum(212) + ' دیدگاه', { size: 12.5, c: t.mute, a: 'end' });
    s += L(ix, gy + 136, ix + iw, gy + 136, t.border, 1);
    s += T(ix + iw, gy + 176, '۴۸۰۰٬۰۰۰', { size: 34, w: 800, c: ac, a: 'end' });
    s += T(ix + iw - 190, gy + 176, 'تومان / ماهانه', { size: 14, c: t.sub, a: 'end' });
    s += T(ix + iw - 320, gy + 172, '۵٬۶۰۰٬۰۰۰', { size: 15, c: t.mute, a: 'end' });
    s += L(ix + iw - 330, gy + 166, ix + iw - 250, gy + 166, ACC.red, 1.6);
    [['cpu', '۴ هسته CPU اختصاصی'], ['box', '۸ گیگابایت RAM و ۱۶۰GB NVMe'], ['chart', 'پهنای باند ۱ گیگابیت'], ['shield', 'آنتی‌دیداس پایه رایگان']].forEach((f, i) => {
        s += icon('check-circle', ix + iw - 22 - (i % 2) * 300, gy + 214 + Math.floor(i / 2) * 34, 19, ACC.green, 2.2);
        s += T(ix + iw - 50 - (i % 2) * 300, gy + 229 + Math.floor(i / 2) * 34, f[1], { size: 13.5, c: t.text, a: 'end' });
    });
    s += T(ix + 150, gy + 320, 'تعداد', { size: 13, c: t.sub, a: 'end' });
    s += R(ix + 180, gy + 298, 130, 42, '#ffffff', { rx: 10, stroke: t.border });
    s += T(ix + 245, gy + 325, fa(1), { size: 15, w: 700, c: t.text, a: 'middle' });
    s += icon('plus', ix + 200, gy + 310, 18, t.sub, 2); s += L(ix + 282, gy + 312, ix + 282, gy + 328, t.sub, 2);
    s += btn(ix + iw - 260, gy + 296, 260, 48, 'افزودن به سبد خرید', 'primary', t, ac, { size: 15, icon: 'cart' });
    s += btn(ix + iw - 260, gy + 356, 260, 46, 'خرید سریع', 'outline', t, ac, { size: 14, icon: 'card' });
    // support strip
    s += R(ix, gy + 430, iw + 700, 84, '#ffffff', { rx: 14, stroke: t.border });
    [['refresh', 'ضمانت بازگشت وجه ۷ روزه'], ['headset2', 'پشتیبانی ۲۴/۷ تلگرام'], ['lock', 'پرداخت امن بانکی']].forEach((f, i) => {
        const fx = ix + iw + 660 - i * 300;
        s += icon(f[0] === 'headset2' ? 'chat' : f[0], fx - 20, gy + 462, 20, ac, 2);
        s += T(fx - 48, gy + 477, f[1], { size: 13, w: 600, c: t.text, a: 'end' });
    });
    return { w: DW, h: DH, svg: s };
}
function p7shop3() {
    const t = TH.light, ac = ACC.violet;
    const br = browser(DW, { theme: 'light', url: 'https://shop.nik-kala.ir/admin/orders', title: 'پنل فروشندگان | نیک‌کالا', tabs: [{ t: 'مدیریت سفارش‌ها | نیک‌کالا' }], fav: ac });
    let s = br.s + R(0, br.y, DW, DH - br.y, t.bg);
    const top = br.y, sideW = 230;
    s += R(DW - sideW, top, sideW, DH - top, '#ffffff') + L(DW - sideW, top, DW - sideW, DH, t.border, 1);
    s += C(DW - 40, top + 36, 15, ac); s += T(DW - 64, top + 42, 'پنل فروشندگان', { size: 14.5, w: 800, c: t.text, a: 'end' });
    [['chart', 'داشبورد'], ['cart', 'سفارش‌ها', 1], ['box', 'محصولات'], ['wallet', 'مالی'], ['users', 'مشتریان'], ['gear', 'تنظیمات']].forEach((n, i) => {
        const ny = top + 76 + i * 44;
        if (n[2]) s += R(DW - sideW + 10, ny, sideW - 20, 38, ac, { rx: 10, op: .12 });
        s += icon(n[0], DW - 46, ny + 9, 19, n[2] ? ac : t.sub, 2);
        s += T(DW - 66, ny + 24, n[1], { size: 13.5, w: n[2] ? 700 : 500, c: n[2] ? ac : t.sub, a: 'end' });
        if (n[2]) s += pill(DW - sideW + 32, ny + 19, fa(9), ACC.red, null, { size: 10.5, h: 20 });
    });
    const cx1 = DW - sideW - 32, cx0 = 32;
    s += T(cx1, top + 44, 'مدیریت سفارش‌ها', { size: 20, w: 800, c: t.text, a: 'end' });
    s += T(cx1, top + 70, '۹ سفارش در انتظار بررسی', { size: 13, c: ACC.amber, a: 'end' });
    s += btn(cx0 + 140, top + 24, 140, 40, 'خروجی Excel', 'outline', t, ac, { size: 13, icon: 'download' });
    s += btn(cx0, top + 24, 120, 40, 'فیلتر', 'outline', t, ac, { size: 13, icon: 'filter' });
    // status summary chips
    [['در انتظار پرداخت', 9, ACC.amber], ['در حال انجام', 14, ACC.blue], ['تکمیل‌شده', 486, ACC.green], ['مرجوعی', 6, ACC.red]].forEach((c, i) => {
        const cw2 = (cx1 - cx0 - 60) / 4, cxx = cx0 + (3 - i) * (cw2 + 20);
        s += R(cxx, top + 92, cw2, 74, '#ffffff', { rx: 12, stroke: t.border });
        s += C(cxx + 30, top + 129, 6, c[2]);
        s += T(cxx + 46, top + 124, c[0], { size: 12.5, c: t.sub });
        s += T(cxx + cw2 - 20, top + 138, fa(c[1]), { size: 22, w: 800, c: t.text, a: 'end' });
    });
    // orders table
    const ty = top + 190, tw = cx1 - cx0;
    s += R(cx0, ty, tw, DH - ty - 26, '#ffffff', { rx: 14, filter: 'sh' });
    const cols = [[.13, 'کد سفارش'], [.2, 'مشتری'], [.24, 'اقلام'], [.15, 'مبلغ (تومان)'], [.12, 'وضعیت'], [.16, 'تاریخ ثبت']];
    let xx = cx1; const xs = []; const hy = ty + 44;
    s += R(cx0 + 12, hy - 26, tw - 24, 36, t.surface2, { rx: 8 });
    cols.forEach(c => { xx -= tw * c[0]; xs.push(xx + tw * c[0]); s += T(xx + tw * c[0] - 18, hy, c[1], { size: 12.5, w: 600, c: t.sub, a: 'end' }); });
    const ords = [
        ['NK-10482', 'رضا محمدی', 'هاست وردپرس ×۱، دامنه .ir ×۱', faNum(1700000), ['در انتظار', ACC.amber], faDate(1405, 6, 30) + ' — ۱۴:۲۲'],
        ['NK-10481', 'سارا احمدی', 'کانفیگ V2Ray ×۱', faNum(680000), ['در حال انجام', ACC.blue], faDate(1405, 6, 30) + ' — ۱۱:۰۵'],
        ['NK-10480', 'علی کریمی', 'سرور مجازی آلمان ×۱', faNum(4800000), ['تکمیل‌شده', ACC.green], faDate(1405, 6, 29) + ' — ۲۱:۴۰'],
        ['NK-10479', 'نگار رضایی', 'هاست لینوکس ×۲', faNum(1800000), ['تکمیل‌شده', ACC.green], faDate(1405, 6, 29) + ' — ۱۸:۱۲'],
        ['NK-10478', 'امیر حسینی', 'کانفیگ Trojan ×۱', faNum(720000), ['مرجوعی', ACC.red], faDate(1405, 6, 28) + ' — ۰۹:۳۷'],
        ['NK-10477', 'مریم موسوی', 'دامنه .com ×۱', faNum(980000), ['تکمیل‌شده', ACC.green], faDate(1405, 6, 28) + ' — ۰۸:۱۵']
    ];
    ords.forEach((r, i) => {
        const ry = hy + 40 + i * 56;
        if (i % 2) s += R(cx0 + 12, ry - 27, tw - 24, 50, t.surface2, { rx: 8, op: .7 });
        s += T(xs[0] - 18, ry, r[0], { size: 12.5, w: 700, fam: MO, c: ac, a: 'end' });
        s += C(xs[1] - 32, ry - 5, 13, [ac, ACC.blue, ACC.teal, ACC.amber, ACC.red, ACC.violet][i]); s += T(xs[1] - 32, ry - 1, r[1][0], { size: 10.5, w: 700, c: '#fff', a: 'middle' });
        s += T(xs[1] - 54, ry, r[1], { size: 13, w: 600, c: t.text, a: 'end' });
        s += T(xs[2] - 18, ry, r[2], { size: 12.5, c: t.sub, a: 'end' });
        s += T(xs[3] - 18, ry, r[3], { size: 13, w: 700, c: t.text, a: 'end' });
        s += pill(xs[4] - tw * .06, ry - 5, r[4][0], r[4][1], null, { size: 11.5, h: 24 });
        s += T(xs[5] - 18, ry, r[5], { size: 12, c: t.mute, a: 'end' });
    });
    return { w: DW, h: DH, svg: s };
}

// ---------- P8: PWA ----------
function p8pwa1() {
    const t = TH.light, ac = ACC.teal;
    let s = R(0, 0, MW, MH, '#eef7f6');
    const sb = statusbar(MW, t); s += sb.s;
    s += R(0, 44, MW, 62, '#ffffff') + L(0, 106, MW, 106, t.border, 1);
    s += icon('back', 24, 64, 22, t.text, 2.2);
    s += T(MW / 2, 82, 'نمونه اپ', { size: 17, w: 800, c: t.text, a: 'middle' });
    s += icon('kebab', MW - 44, 64, 22, t.sub, 2);
    // app content: task list
    let y = 130;
    s += T(40, y + 20, 'سلام، امیر', { size: 22, w: 800, c: t.text });
    s += T(40, y + 48, 'امروز ۴ کار در انتظار توست', { size: 13.5, c: t.sub });
    s += R(MW - 84, y, 44, 44, ac, { rx: 14, op: .15 });
    s += icon('bell', MW - 73, y + 11, 22, ac, 2.2);
    y += 76;
    [['ارسال پیشنهاد قیمت', 'امروز — ۱۶:۰۰', 1, ac], ['جلسه با تیم فنی', 'امروز — ۱۸:۳۰', 0, ACC.blue], ['بررسی طرح اپ', 'فردا — ۱۰:۰۰', 0, ACC.violet], ['ثبت گزارش هفتگی', 'جمعه — ۲۰:۰۰', 0, ACC.amber]].forEach((tk, i) => {
        s += R(24, y, MW - 48, 84, '#ffffff', { rx: 16, filter: 'sh' });
        s += R(24, y, 6, 84, tk[3], { rx: 3 });
        s += R(MW - 76, y + 28, 28, 28, tk[2] ? ac : '#ffffff', { rx: 9, stroke: tk[2] ? 'none' : t.border, sw: 1.5 });
        if (tk[2]) s += icon('check', MW - 71, y + 33, 18, '#fff', 2.6);
        s += T(MW - 96, y + 40, tk[0], { size: 15, w: 700, c: tk[2] ? t.mute : t.text, a: 'end' });
        s += T(MW - 96, y + 64, tk[1], { size: 12.5, c: t.sub, a: 'end' });
        y += 98;
    });
    // install prompt (bottom sheet)
    s += R(0, MH - 320, MW, 320, '#020617', { op: .45 });
    const shy = MH - 268;
    s += R(0, shy, MW, 268, '#ffffff', { rx: 28 });
    s += R(MW / 2 - 30, shy + 12, 60, 5, t.border, { rx: 3 });
    s += R(MW / 2 - 44, shy + 36, 88, 88, ac, { rx: 22, filter: 'sh' });
    s += icon('box', MW / 2 - 26, shy + 54, 52, '#ffffff', 2.2);
    s += T(MW / 2, shy + 156, 'نصب اپلیکیشن «نمونه اپ»', { size: 18, w: 800, c: t.text, a: 'middle' });
    s += T(MW / 2, shy + 184, 'بدون فروشگاه اپ، مستقیم از مرورگر نصب کنید؛', { size: 13, c: t.sub, a: 'middle' });
    s += T(MW / 2, shy + 206, 'آفلاین هم در دسترس خواهد بود.', { size: 13, c: t.sub, a: 'middle' });
    s += R(MW / 2 - 140, shy + 222, 132, 44, '#ffffff', { rx: 12, stroke: t.border });
    s += T(MW / 2 - 74, shy + 250, 'بعداً', { size: 14.5, w: 600, c: t.sub, a: 'middle' });
    s += R(MW / 2 + 8, shy + 222, 132, 44, ac, { rx: 12 });
    s += T(MW / 2 + 74, shy + 250, 'نصب اپ', { size: 14.5, w: 700, c: '#fff', a: 'middle' });
    return { w: MW, h: MH, svg: s };
}
function p8pwa2() {
    const t = TH.light, ac = ACC.teal;
    let s = R(0, 0, MW, MH, '#f6faf9');
    const sb = statusbar(MW, t); s += sb.s;
    s += R(0, 44, MW, 62, '#ffffff') + L(0, 106, MW, 106, t.border, 1);
    s += icon('back', 24, 64, 22, t.text, 2.2);
    s += T(MW / 2, 82, 'سفارش‌های من', { size: 17, w: 800, c: t.text, a: 'middle' });
    s += icon('refresh', MW - 46, 64, 22, ac, 2.2);
    // offline banner
    s += R(16, 118, MW - 32, 52, '#fff7ed', { rx: 12, stroke: '#fed7aa' });
    s += icon('wifi-off', MW - 54, 132, 22, '#ea580c', 2.2);
    s += T(MW - 86, 140, 'آفلاین هستید', { size: 13.5, w: 700, c: '#9a3412', a: 'end' });
    s += T(MW - 86, 158, 'تغییرات پس از اتصال به‌صورت خودکار همگام می‌شوند', { size: 11.5, c: '#c2410c', a: 'end' });
    s += pill(56, 144, fa(3), '#ea580c', null, { size: 11, h: 22 });
    let y = 190;
    [['NK-10482', 'در انتظار همگام‌سازی', ACC.amber, 'فاکتور هاست وردپرس', 1], ['NK-10481', 'همگام شد', ACC.green, 'فاکتور کانفیگ V2Ray', 0], ['NK-10480', 'همگام شد', ACC.green, 'فاکتور سرور مجازی', 0], ['NK-10479', 'همگام شد', ACC.green, 'فاکتور هاست لینوکس', 0]].forEach((o, i) => {
        s += R(24, y, MW - 48, 96, '#ffffff', { rx: 16, filter: 'sh' });
        s += T(MW - 48, y + 36, o[0], { size: 14.5, w: 700, fam: MO, c: t.text, a: 'end' });
        s += T(MW - 48, y + 60, o[3], { size: 12.5, c: t.sub, a: 'end' });
        const pw2 = o[1].length * 7.4 + 34;
        s += pill(MW - 48 - pw2 / 2, y + 78, o[1], o[2], null, { size: 10.5, h: 20 });
        s += R(44, y + 24, 48, 48, ac, { rx: 13, op: .13 });
        s += icon('doc', 56, y + 36, 24, ac, 2);
        if (o[4]) s += icon('clock', 44 + pw2 + 16, y + 68, 16, ACC.amber, 2);
        y += 110;
    });
    // cached data card
    s += R(24, y + 4, MW - 48, 108, '#ffffff', { rx: 16, stroke: t.border });
    s += T(MW - 48, y + 38, 'داده‌های ذخیره‌شده برای حالت آفلاین', { size: 14, w: 700, c: t.text, a: 'end' });
    s += progress(48, y + 56, MW - 96 - 130, 9, 72, ac, t);
    s += T(48 + MW - 96 - 130 + 12, y + 64, fa(72) + '٪', { size: 12, w: 700, c: ac });
    s += T(MW - 48, y + 90, 'حجم داده آفلاین: ۴٫۲ از ۶ مگابایت', { size: 11.5, c: t.mute, a: 'end' });
    y += 124;
    s += R(24, y, MW - 48, 150, '#ffffff', { rx: 16, stroke: t.border });
    s += T(MW - 48, y + 34, 'تنظیمات همگام‌سازی', { size: 14, w: 700, c: t.text, a: 'end' });
    [['همگام‌سازی خودکار با Wi-Fi', 1], ['دانلود فقط تصاویر فشرده', 0]].forEach((r2, i2) => {
        const ry2 = y + 66 + i2 * 44;
        s += T(MW - 48, ry2, r2[0], { size: 12.5, w: 500, c: t.text, a: 'end' });
        s += toggle(48, ry2 - 14, r2[1], ac);
    });
    // bottom nav
    s += R(0, MH - 72, MW, 72, '#ffffff') + L(0, MH - 72, MW, MH - 72, t.border, 1);
    [['home', 'خانه', 0], ['box', 'سفارش‌ها', 1], ['plus', '', 2], ['chart', 'گزارش', 0], ['user', 'پروفایل', 0]].forEach((n, i) => {
        const nx = MW - 66 - i * ((MW - 100) / 4);
        if (n[2] === 2) { s += C(nx, MH - 44, 26, ac); s += icon('plus', nx - 11, MH - 55, 22, '#fff', 2.4); }
        else { s += icon(n[0], nx - 11, MH - 54, 22, n[1] ? ac : t.mute, 2.1); s += T(nx, MH - 20, n[1], { size: 11, w: n[1] ? 700 : 400, c: n[1] ? ac : t.mute, a: 'middle' }); }
    });
    return { w: MW, h: MH, svg: s };
}
function p8pwa3() {
    const t = TH.dark, ac = ACC.teal;
    let s = R(0, 0, MW, MH, '#0b1416');
    const sb = statusbar(MW, { text: '#f1f5f9' }, { light: true }); s += sb.s;
    s += R(0, 44, MW, 62, '#101c1f') + L(0, 106, MW, 106, '#1e2f33', 1);
    s += icon('back', 24, 64, 22, '#e2e8f0', 2.2);
    s += T(MW / 2, 82, 'همگام‌سازی', { size: 17, w: 800, c: '#f1f5f9', a: 'middle' });
    s += icon('kebab', MW - 44, 64, 22, '#94a3b8', 2);
    // progress ring
    const cx = MW / 2, cy = 300, r = 96;
    s += C(cx, cy, r, 'none', { stroke: '#16343a', sw: 16 });
    s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${ac}" stroke-width="16" stroke-linecap="round" stroke-dasharray="${2 * Math.PI * r * 0.68} ${2 * Math.PI * r}" transform="rotate(-90 ${cx} ${cy})"/>`;
    s += T(cx, cy - 4, fa(68) + '٪', { size: 40, w: 800, c: '#f1f5f9', a: 'middle' });
    s += T(cx, cy + 30, 'در حال همگام‌سازی…', { size: 14, c: '#94a3b8', a: 'middle' });
    s += T(cx, cy + 130, '۳ آیتم در صف • اتصال برقرار شد', { size: 13, c: ac, a: 'middle' });
    // queue list
    let y = 520;
    s += T(40, y, 'صف همگام‌سازی', { size: 15, w: 700, c: '#f1f5f9' });
    y += 24;
    [['افزودن یادداشت «جلسه فروش»', 'در حال ارسال', ac, 1], ['ویرایش سفارش NK-10482', 'در صف', '#94a3b8', 0], ['ثبت خروج آفلاین', 'در صف', '#94a3b8', 0], ['دریافت فاکتور NK-10481', 'تکمیل', ACC.green, 2], ['به‌روزرسانی موجودی انبار', 'تکمیل', ACC.green, 2]].forEach((q, i) => {
        s += R(24, y, MW - 48, 66, '#101c1f', { rx: 14, stroke: '#1e2f33' });
        s += icon(q[3] === 2 ? 'check-circle' : q[3] === 1 ? 'refresh' : 'clock', 44, y + 22, 22, q[2], 2.2);
        s += T(80, y + 32, q[0], { size: 13.5, w: 600, c: '#e2e8f0' });
        s += T(80, y + 52, q[1], { size: 11.5, c: q[2] });
        s += T(MW - 44, y + 40, fa(i + 1), { size: 13, w: 700, c: '#33555c', a: 'end' });
        y += 78;
    });
    // notification preview
    s += R(24, y + 8, MW - 48, 92, '#12262a', { rx: 16, stroke: '#1e3a40', filter: 'sh' });
    s += R(44, y + 28, 44, 44, ac, { rx: 12 });
    s += icon('bell', 55, y + 39, 22, '#062a26', 2.4);
    s += T(104, y + 44, 'همگام‌سازی کامل شد', { size: 14, w: 700, c: '#f1f5f9' });
    s += T(104, y + 68, 'همه تغییرات آفلاین با موفقیت ارسال شد ✓', { size: 12, c: '#94a3b8' });
    s += T(MW - 44, y + 40, 'اکنون', { size: 11, c: '#64748b', a: 'end' });
    y += 108;
    s += R(24, y, MW - 48, 96, '#101c1f', { rx: 16, stroke: '#1e2f33' });
    s += T(MW - 44, y + 34, 'فضای ذخیره‌سازی آفلاین', { size: 13.5, w: 700, c: '#f1f5f9', a: 'end' });
    s += progress(48, y + 52, MW - 96 - 90, 9, 46, ac, { border: '#16343a' });
    s += T(MW - 44 - 0, y + 60, '', {});
    s += T(48 + MW - 96 - 90 + 12, y + 60, fa(46) + '٪', { size: 12, w: 700, c: ac });
    s += T(MW - 44, y + 80, '۲۳ مگابایت از ۵۰ مگابایت', { size: 11.5, c: '#64748b', a: 'end' });
    return { w: MW, h: MH, svg: s };
}

// ---------- P9: AI chat ----------
function p9ai1() {
    const t = TH.light, ac = ACC.indigo;
    const br = browser(DW, { theme: 'light', url: 'https://ai.goftman.ir/chat', title: 'گفت‌مان — دستیار هوشمند', tabs: [{ t: 'گفت‌مان | دستیار هوشمند' }, { t: 'تنظیمات', fav: ACC.amber }], fav: ac });
    let s = br.s + R(0, br.y, DW, DH - br.y, '#f8fafc');
    const top = br.y, sideW = 290;
    // sidebar (right)
    s += R(DW - sideW, top, sideW, DH - top, '#ffffff') + L(DW - sideW, top, DW - sideW, DH, t.border, 1);
    s += R(DW - sideW + 20, top + 22, sideW - 40, 44, ac, { rx: 12 });
    s += icon('plus', DW - sideW + 40, top + 35, 18, '#fff', 2.4);
    s += T(DW - sideW + 70, top + 50, 'گفتگوی جدید', { size: 14, w: 700, c: '#fff' });
    s += T(DW - 40, top + 100, 'گفتگوهای اخیر', { size: 12.5, w: 700, c: t.mute, a: 'end' });
    [['ترجمه قرارداد تجاری', 1], ['خلاصه مقاله هوش مصنوعی', 0], ['ایده‌پردازی کمپین تبلیغاتی', 0], ['دیباگ کد پایتون', 0], ['نامه رسمی به کارفرما', 0]].forEach((c, i) => {
        const cy = top + 118 + i * 46;
        if (c[1]) s += R(DW - sideW + 12, cy, sideW - 24, 40, ac, { rx: 10, op: .1 });
        s += icon('chat', DW - 44, cy + 10, 18, c[1] ? ac : t.mute, 2);
        s += T(DW - 66, cy + 25, c[0], { size: 13, w: c[1] ? 700 : 500, c: c[1] ? ac : t.sub, a: 'end' });
    });
    s += L(DW - sideW + 20, top + 372, DW - 20, top + 372, t.border, 1);
    s += R(DW - sideW + 20, top + 392, sideW - 40, 62, t.surface2, { rx: 12 });
    s += C(DW - 52, top + 423, 16, ac); s += T(DW - 52, top + 428, 'ا', { size: 12, w: 700, c: '#fff', a: 'middle' });
    s += T(DW - 78, top + 417, 'امیر صدیقیان', { size: 13, w: 700, c: t.text, a: 'end' });
    s += T(DW - 78, top + 437, 'طرح حرفه‌ای • نامحدود', { size: 11.5, c: t.mute, a: 'end' });
    const cx1 = DW - sideW - 40, cx0 = 40;
    // chat header
    s += R(cx0, top + 20, cx1 - cx0, 62, '#ffffff', { rx: 14, stroke: t.border });
    s += C(cx1 - 40, top + 51, 18, ac); s += icon('robot', cx1 - 49, top + 42, 18, '#fff', 2);
    s += T(cx1 - 70, top + 46, 'دستیار هوشمند گفت‌مان', { size: 15, w: 700, c: t.text, a: 'end' });
    s += T(cx1 - 70, top + 66, 'مدل زبانی فارسی • حافظه مکالمه فعال', { size: 11.5, c: t.sub, a: 'end' });
    s += pill(cx0 + 70, top + 51, 'آنلاین', ACC.green, null, { size: 11.5, h: 24 });
    // messages
    let y = top + 106;
    const mw = (cx1 - cx0) * 0.62;
    // user msg
    s += R(cx1 - mw, y, mw, 58, ac, { rx: 16 });
    s += T(cx1 - 20, y + 25, 'یک ایمیل رسمی برای پیگیری وضعیت پروژه بنویس', { size: 14.5, c: '#fff', a: 'end' });
    s += T(cx1 - 20, y + 45, 'که لحن دوستانه اما حرفه‌ای داشته باشد', { size: 14.5, c: '#e0e7ff', a: 'end' });
    s += C(cx1 - mw - 22, y + 22, 16, '#cbd5e1'); s += icon('user', cx1 - mw - 30, y + 14, 16, '#475569', 2);
    y += 74;
    // ai msg
    const ah = 330;
    s += R(cx0, y, mw + 60, ah, '#ffffff', { rx: 16, stroke: t.border, filter: 'sh' });
    s += C(cx0 + 34, y + 34, 16, ac); s += icon('robot', cx0 + 26, y + 26, 16, '#fff', 2);
    s += T(cx0 + 60, y + 40, 'حتماً؛ پیش‌نویس زیر پیشنهاد می‌شود:', { size: 14.5, w: 600, c: t.text });
    s += R(cx0 + 22, y + 62, mw + 16, 200, t.surface2, { rx: 12 });
    const mail = ['موضوع: پیگیری وضعیت پروژه فروشگاه', 'با سلام و احترام،', 'امیدوارم حالتان خوب باشد. پیرو جلسه هفته گذشته،', 'خواهشمندم در صورت امکان آخرین وضعیت پروژه و', 'زمان‌بندی تحویل را اعلام بفرمایید.', 'پیشاپیش از همکاری شما سپاسگزارم.', 'با تجدید احترام — امیر صدیقیان'];
    mail.forEach((ln, i) => s += T(cx0 + 42, y + 92 + i * 25, ln, { size: 13.5, c: i === 0 ? t.text : t.sub, w: i === 0 ? 700 : 400 }));
    s += T(cx0 + 22, y + 292, 'اگر بخواهید لحن رسمی‌تر یا صمیمی‌تر هم می‌نویسم.', { size: 13.5, c: t.sub });
    s += icon('copy', cx0 + mw + 20, y + 288, 17, t.mute, 2);
    s += icon('refresh', cx0 + mw - 6, y + 288, 17, t.mute, 2);
    y += ah + 20;
    // typing indicator
    s += R(cx0, y, 120, 46, '#ffffff', { rx: 16, stroke: t.border });
    [0, 1, 2].forEach(i => s += C(cx0 + 38 + i * 22, y + 23, 5, ac, { op: .35 + i * .25 }));
    // composer
    s += R(cx0, DH - 92, cx1 - cx0, 64, '#ffffff', { rx: 32, stroke: t.border, filter: 'sh' });
    s += T(cx0 + 90, DH - 54, 'پیام خود را بنویسید…', { size: 14, c: t.mute });
    s += icon('clip', cx0 + 30, DH - 72, 20, t.sub, 2);
    s += icon('mic', cx0 + 58, DH - 72, 20, t.sub, 2);
    s += C(cx1 - 40, DH - 60, 24, ac); s += icon('send', cx1 - 50, DH - 70, 20, '#fff', 2.2);
    return { w: DW, h: DH, svg: s };
}
function p9ai2() {
    const { s: head, top, t, dark } = tgChat({ theme: 'light', title: 'دستیار هوشمند', subtitle: 'bot', avatarColor: ACC.indigo });
    let s = head;
    let y = top + 24;
    s += pill(MW / 2, y, fa('امروز'), '#94a3b8', null, { bgOp: .2, text: '#64748b', size: 12 });
    y += 30;
    const ow = MW * 0.7;
    s += R(MW - 24 - ow, y, ow, 66, t.out, { rx: 14 });
    s += T(MW - 40, y + 27, 'سلام! می‌تونی خلاصه این مقاله رو بگی؟', { size: 14, c: '#1f2a17', a: 'end' });
    s += T(MW - 40, y + 50, 'https://example.ir/ai-trends', { size: 12, fam: MO, c: '#3b6e22', a: 'end' });
    y += 80;
    const ih = 420, iw = MW * 0.84;
    s += R(24, y, iw, ih, t.in, { rx: 14, filter: 'sh' });
    s += T(40, y + 32, 'خلاصه مقاله در ۴ نکته:', { size: 14.5, w: 700, c: t.text });
    const bullets = [
        '۱. مدل‌های زبانی بزرگ به سمت استدلال', '    قدم می‌گذارند، نه فقط تولید متن.',
        '۲. هزینه آموزش با روش‌های تازه تا ۴۰٪', '    کاهش یافته است.',
        '۳. کاربرد عملی در پشتیبانی مشتریان', '    بیشترین رشد را داشته است.',
        '۴. حریم خصوصی داده‌ها چالش اصلی', '    شرکت‌ها باقی می‌ماند.'
    ];
    bullets.forEach((b, i) => s += T(40, y + 62 + i * 26, b, { size: 13.5, c: b[0] === '۱' || b[0] === '۲' || b[0] === '۳' || b[0] === '۴' ? t.text : t.sub, w: b[1] === '.' ? 400 : 600 }));
    s += L(40, y + 226, 24 + iw - 16, y + 226, t.border, 1);
    s += T(40, y + 252, 'می‌خواهی نسخه کامل‌تر یا ترجمه انگلیسی هم بفرستم؟', { size: 13.5, c: t.sub });
    s += R(40, y + 274, 150, 40, '#eef2ff', { rx: 10 });
    s += T(115, y + 299, 'نسخه کامل‌تر', { size: 12.5, w: 600, c: ACC.indigo, a: 'middle' });
    s += R(200, y + 274, 150, 40, '#eef2ff', { rx: 10 });
    s += T(275, y + 299, 'ترجمه انگلیسی', { size: 12.5, w: 600, c: ACC.indigo, a: 'middle' });
    s += T(40 + iw - 16, y + ih - 14, fa('10:12'), { size: 10.5, fam: MO, c: '#94a3b8', a: 'end' });
    y += ih + 16;
    const ow2 = 170;
    s += R(MW - 24 - ow2, y, ow2, 42, t.out, { rx: 14 });
    s += T(MW - 38, y + 27, 'نسخه کامل‌تر لطفاً', { size: 13.5, c: '#1f2a17', a: 'end' });
    s += T(MW - 24 - ow2 + 12, y + 27, fa('10:13') + ' ✓✓', { size: 10.5, c: '#6e9a58' });
    // input
    s += R(0, MH - 74, MW, 74, t.bar);
    s += icon('clip', 34, MH - 48, 22, t.sub, 2);
    s += R(66, MH - 60, MW - 66 - 96, 46, '#ffffff', { rx: 23, stroke: t.border });
    s += T(86, MH - 31, 'پیام', { size: 14.5, c: '#94a3b8' });
    s += C(MW - 36, MH - 37, 19, ACC.indigo);
    s += icon('send', MW - 45, MH - 46, 18, '#fff', 2);
    return { w: MW, h: MH, svg: s };
}
function p9ai3() {
    const t = TH.light, ac = ACC.indigo;
    const br = browser(DW, { theme: 'light', url: 'https://ai.goftman.ir/settings', title: 'تنظیمات دستیار | گفت‌مان', tabs: [{ t: 'تنظیمات دستیار | گفت‌مان' }], fav: ac });
    let s = br.s + R(0, br.y, DW, DH - br.y, t.bg);
    const top = br.y;
    s += T(DW - 40, top + 46, 'تنظیمات دستیار هوشمند', { size: 20, w: 800, c: t.text, a: 'end' });
    s += T(DW - 40, top + 72, 'زبان، حافظه و رفتار پاسخ‌دهی را شخصی‌سازی کنید', { size: 13, c: t.sub, a: 'end' });
    const lw = (DW - 80 - 24) * 0.56;
    s += R(40, top + 96, lw, DH - top - 126, '#ffffff', { rx: 16, filter: 'sh' });
    s += T(40 + lw - 26, top + 134, 'پیکربندی عمومی', { size: 15.5, w: 700, c: t.text, a: 'end' });
    s += field(70, top + 176, lw - 60, 44, 'زبان پاسخ‌ها', 'فارسی', t, { chev: 1 });
    s += field(70, top + 250, lw - 60, 44, 'مدل زبانی', 'goftman-pro-v2', t, { chev: 1 });
    s += T(70 + lw - 60, top + 330, 'حافظه مکالمه', { size: 13.5, w: 600, c: t.text, a: 'end' });
    s += T(70 + lw - 60, top + 352, 'گفتگوها به‌خاطر سپرده شوند', { size: 12, c: t.sub, a: 'end' });
    s += toggle(70, top + 330, 1, ac);
    s += T(70 + lw - 60, top + 402, 'پاسخ‌دهی چندزبانه', { size: 13.5, w: 600, c: t.text, a: 'end' });
    s += T(70 + lw - 60, top + 424, 'ترجمه خودکار ورودی انگلیسی', { size: 12, c: t.sub, a: 'end' });
    s += toggle(70, top + 402, 1, ac);
    s += T(70 + lw - 60, top + 474, 'انتقال به اپراتور انسانی', { size: 13.5, w: 600, c: t.text, a: 'end' });
    s += T(70 + lw - 60, top + 496, 'در موارد خاص گفتگو واگذار شود', { size: 12, c: t.sub, a: 'end' });
    s += toggle(70, top + 474, 0, ac);
    s += T(70, top + 550, 'خلاقیت پاسخ (Temperature)', { size: 13, w: 600, c: t.text });
    s += progress(70, top + 566, lw - 100, 8, 35, ac, t);
    s += C(70 + (lw - 100) * 0.35, top + 570, 9, '#ffffff', { stroke: ac, sw: 3 });
    s += T(70 + lw - 60, top + 574, '۰٫۳۵', { size: 12.5, w: 700, c: ac, a: 'end' });
    s += btn(70, top + 610, 160, 46, 'ذخیره تنظیمات', 'primary', t, ac, { size: 14, icon: 'check' });
    s += btn(240, top + 610, 140, 46, 'بازنشانی', 'outline', t, ac, { size: 14 });
    // right column: memory + stats
    const rx = 40 + lw + 24, rw = DW - 40 - rx;
    s += R(rx, top + 96, rw, 300, '#ffffff', { rx: 16, filter: 'sh' });
    s += T(rx + rw - 26, top + 134, 'حافظه مکالمه', { size: 15.5, w: 700, c: t.text, a: 'end' });
    [['ترجیح لحن رسمی در نامه‌ها', '۲ روز پیش'], ['کاربر توسعه‌دهنده پایتون است', '۵ روز پیش'], ['نام کارفرما: شرکت سایه گستر', '۱ هفته پیش'], ['پروژه فعال: فروشگاه نیک‌کالا', '۱ هفته پیش']].forEach((m, i) => {
        const my = top + 172 + i * 52;
        s += R(rx + 20, my - 20, rw - 40, 44, t.surface2, { rx: 10 });
        s += icon('pin', rx + rw - 44, my - 9, 18, ac, 2);
        s += T(rx + rw - 62, my + 2, m[0], { size: 12.5, w: 600, c: t.text, a: 'end' });
        s += T(rx + 34, my + 2, m[1], { size: 11, c: t.mute });
    });
    s += R(rx, top + 420, rw, DH - top - 450, '#ffffff', { rx: 16, filter: 'sh' });
    s += T(rx + rw - 26, top + 458, 'آمار مصرف', { size: 15.5, w: 700, c: t.text, a: 'end' });
    s += donut(rx + 86, top + 560, 56, [{ v: 64, c: ac }, { v: 36, c: '#e2e8f0' }], t, { sw: 14 });
    s += T(rx + 86, top + 566, fa(64) + '٪', { size: 16, w: 800, c: t.text, a: 'middle' });
    s += T(rx + rw - 30, top + 540, '۶۴٪ از سهم ماهانه مصرف شده', { size: 12.5, c: t.sub, a: 'end' });
    s += T(rx + rw - 30, top + 566, '۱۲۸٬۴۰۰ توکن از ۲۰۰٬۰۰۰', { size: 13.5, w: 700, c: t.text, a: 'end' });
    s += T(rx + rw - 30, top + 594, 'تجدید سهمیه: ۸ روز دیگر', { size: 12, c: t.mute, a: 'end' });
    return { w: DW, h: DH, svg: s };
}

// ------------------------------------------------------------------ output
const SLIDES = [
    ['p1-bot-1', p1bot1], ['p1-bot-2', p1bot2], ['p1-bot-3', p1bot3],
    ['p2-corp-1', p2corp1], ['p2-corp-2', p2corp2], ['p2-corp-3', p2corp3],
    ['p3-vpn-1', p3vpn1], ['p3-vpn-2', p3vpn2], ['p3-vpn-3', p3vpn3],
    ['p4-dash-1', p4dash1], ['p4-dash-2', p4dash2], ['p4-dash-3', p4dash3],
    ['p5-api-1', p5api1], ['p5-api-2', p5api2],
    ['p6-cloud-1', p6cloud1], ['p6-cloud-2', p6cloud2],
    ['p7-shop-1', p7shop1], ['p7-shop-2', p7shop2], ['p7-shop-3', p7shop3],
    ['p8-pwa-1', p8pwa1], ['p8-pwa-2', p8pwa2], ['p8-pwa-3', p8pwa3],
    ['p9-ai-1', p9ai1], ['p9-ai-2', p9ai2], ['p9-ai-3', p9ai3]
];

async function main() {
    fs.mkdirSync(OUT, { recursive: true });
    const only = process.argv[2];
    for (const [name, build] of SLIDES) {
        if (only && !name.includes(only)) continue;
        const r = build();
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${r.w}" height="${r.h}" viewBox="0 0 ${r.w} ${r.h}">${defs()}${r.svg}</svg>`;
        await sharp(Buffer.from(svg), { density: 96 }).jpeg({ quality: 88, mozjpeg: false }).toFile(path.join(OUT, name + '.jpg'));
        console.log('built', name + '.jpg', r.w + 'x' + r.h);
    }
}
main().catch(e => { console.error(e); process.exit(1); });
