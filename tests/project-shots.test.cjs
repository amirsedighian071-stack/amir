// Regression tests for the portfolio screenshot overhaul:
// Persian SVG artwork, legacy .jpg migration and the zoom lightbox.
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');

function loadSite() {
    const store = {};
    const listeners = {};
    const sandbox = {
        console,
        navigator: {},
        localStorage: {
            getItem: k => (k in store ? store[k] : null),
            setItem: (k, v) => { store[k] = String(v); },
            removeItem: k => { delete store[k]; },
        },
        document: {
            addEventListener: (t, fn) => { (listeners[t] = listeners[t] || []).push(fn); },
            removeEventListener: () => {},
            getElementById: () => null,
            querySelectorAll: () => [],
            querySelector: () => null,
            createElement: () => { throw new Error('no DOM in unit test'); },
            hidden: false,
            body: { style: {}, classList: { contains: () => false, toggle: () => {}, add: () => {} }, appendChild: () => {} },
            documentElement: { classList: { add: () => {} }, getAttribute: () => null, setAttribute: () => {}, removeAttribute: () => {} },
        },
        setTimeout: () => 0, clearTimeout: () => {}, setInterval: () => 0, clearInterval: () => {},
        requestAnimationFrame: () => 0,
    };
    sandbox.window = sandbox;
    sandbox.window.addEventListener = () => {};
    sandbox.globalThis = sandbox;
    vm.createContext(sandbox);
    const src = ['content-config.js', 'content-translations.js', 'app.js']
        .map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n;\n') +
        '\n;window.__test = { DEFAULT_DATA, SITE, CONTENT_UI, migrateLegacyShot, applyDefaultMedia, mediaSlidesHtml, txt, openShotLightbox, closeShotLightbox };';
    vm.runInContext(src, sandbox, { filename: 'site-bundle.js' });
    return sandbox.__test;
}

const T = loadSite();

describe('portfolio shots', () => {
    it('every bundled project image/gallery entry is an .svg that exists on disk', () => {
        assert.ok(T.DEFAULT_DATA.projects.length >= 9);
        for (const p of T.DEFAULT_DATA.projects) {
            for (const src of [p.image, ...(p.gallery || [])]) {
                assert.match(src, /^assets\/img\/projects\/[A-Za-z0-9-]+\.svg$/, `bad shot path: ${src}`);
                assert.ok(fs.existsSync(path.join(ROOT, src)), `missing file: ${src}`);
            }
        }
    });

    it('the generator produced 25 well-formed screenshot SVGs', () => {
        const files = fs.readdirSync(path.join(ROOT, 'assets/img/projects')).filter(f => f.endsWith('.svg'));
        assert.equal(files.length, 25);
        for (const f of files) {
            const raw = fs.readFileSync(path.join(ROOT, 'assets/img/projects', f), 'utf8');
            assert.ok(raw.startsWith('<?xml'), `${f}: missing XML prolog`);
            assert.ok(raw.includes('<svg') && raw.includes('</svg>'), `${f}: not an svg doc`);
            assert.ok(!raw.includes('undefined') && !raw.includes('NaN'), `${f}: broken geometry`);
            assert.match(raw, /[\u0600-\u06FF]/, `${f}: no Persian text`);
        }
    });

    it('legacy .jpg shots migrate to the matching .svg', () => {
        assert.equal(T.migrateLegacyShot('assets/img/projects/p1-bot-1.jpg'), 'assets/img/projects/p1-bot-1.svg');
        assert.equal(T.migrateLegacyShot('assets/img/projects/p9-ai-3.jpg'), 'assets/img/projects/p9-ai-3.svg');
        // Admin uploads, unknown paths and non-strings are never touched.
        assert.equal(T.migrateLegacyShot('data:image/png;base64,AAAA'), 'data:image/png;base64,AAAA');
        assert.equal(T.migrateLegacyShot('assets/img/projects/xxx.jpg'), 'assets/img/projects/xxx.jpg');
        assert.equal(T.migrateLegacyShot('assets/img/products/p1.jpg'), 'assets/img/products/p1.jpg');
        assert.equal(T.migrateLegacyShot(null), null);
        assert.equal(T.migrateLegacyShot(undefined), undefined);
    });

    it('applyDefaultMedia remaps legacy shots on saved project items', () => {
        const data = { products: [], projects: [{ id: 1, image: 'assets/img/projects/p2-corp-1.jpg', gallery: ['assets/img/projects/p2-corp-1.jpg', 'data:image/png;base64,ZZ'] }] };
        T.applyDefaultMedia(data);
        assert.equal(data.projects[0].image, 'assets/img/projects/p2-corp-1.svg');
        assert.deepEqual(data.projects[0].gallery, ['assets/img/projects/p2-corp-1.svg', 'data:image/png;base64,ZZ']);
    });

    it('zoom UI strings exist in Persian and English', () => {
        for (const key of ['viewFull', 'zoomIn', 'zoomOut', 'zoomReset']) {
            assert.ok(Array.isArray(T.CONTENT_UI[key]), `${key} missing from CONTENT_UI`);
            assert.ok(T.CONTENT_UI[key][0] && T.CONTENT_UI[key][1], `${key} needs fa+en`);
            assert.match(T.CONTENT_UI[key][0], /[\u0600-\u06FF]/, `${key} fa text`);
        }
    });

    it('mediaSlidesHtml renders a zoom button into every slider', () => {
        const p = T.DEFAULT_DATA.projects[0];
        const multi = T.mediaSlidesHtml(p, { arrows: true, autoplay: 1000 });
        assert.ok(multi.includes('data-media-zoom'), 'multi slider needs zoom button');
        assert.ok(multi.includes(T.txt('viewFull')), 'zoom aria-label');
        const single = T.mediaSlidesHtml({ image: p.image, title: p.title });
        assert.ok(single.includes('data-media-zoom'), 'single slider needs zoom button');
        assert.equal(T.mediaSlidesHtml({}), '', 'no media -> empty');
    });

    it('lightbox entry points are defined', () => {
        assert.equal(typeof T.openShotLightbox, 'function');
        assert.equal(typeof T.closeShotLightbox, 'function');
    });
});
