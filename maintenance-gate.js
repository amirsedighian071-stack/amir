// Pre-paint maintenance gate (public pages only).
// While the whole site is in maintenance mode, visitors must never see the
// regular pages. This tiny script runs in <head> before app.js loads:
//  - returning visitors: a cached flag applies the gate instantly (no flash);
//  - first visit: body stays hidden behind a tiny loader while one cheap
//    meta request confirms the mode, then the gate is shown or dismissed;
// app.js later replaces the placeholder with the full animated screen.
(function () {
    'use strict';
    var KEY = 'amir_maintenance_v1';
    var html = document.documentElement;
    if (!document.body || !document.body.classList.contains('public-site')) return;

    var cached = null;
    try { cached = localStorage.getItem(KEY); } catch (e) { /* private mode */ }
    var brandName = 'AmirSedighian';
    try { brandName = localStorage.getItem(KEY + '_brand') || brandName; } catch (e) { /* private mode */ }

    function injectGate() {
        if (document.getElementById('maintenanceGate') || document.getElementById('maintenanceScreen')) return;
        if (!document.body) return;
        var el = document.createElement('div');
        el.id = 'maintenanceGate';
        el.setAttribute('role', 'alert');
        el.innerHTML =
            '<div class="mg-visual" aria-hidden="true"><span class="mg-ring"></span><i class="fas fa-screwdriver-wrench"></i></div>' +
            // The brand logo must be visible from the very first paint of the
            // offline screen, exactly like on the full maintenance screen.
            '<div class="mg-brand"><i class="fas fa-code"></i><span>' + brandName + '</span></div>' +
            '<h1>در حال بروزرسانی سایت هستیم</h1>' +
            '<p>صبور باشید…</p>';
        document.body.appendChild(el);
        html.classList.add('maintenance-gate');
    }

    function queueGate() {
        if (document.body) { injectGate(); }
        else { document.addEventListener('DOMContentLoaded', injectGate); }
    }

    function dismissChecking() { html.classList.remove('maintenance-checking'); }

    if (cached === '1') {
        html.classList.add('maintenance-gate');
        queueGate();
    }

    if (cached !== '0') {
        // First visit (or stale cache): hide the body for a moment so regular
        // content can never flash through while maintenance is on.
        html.classList.add('maintenance-checking');
        var safety = setTimeout(dismissChecking, 2500);
        try {
            fetch('/.netlify/functions/site-data?meta=1&t=' + Date.now(), { cache: 'no-store' })
                .then(function (r) { return r.json(); })
                .then(function (j) {
                    clearTimeout(safety);
                    dismissChecking();
                    if (j && j.maintenanceMode) {
                        try { localStorage.setItem(KEY, '1'); } catch (e) { /* ignore */ }
                        queueGate();
                    } else {
                        try { localStorage.setItem(KEY, '0'); } catch (e) { /* ignore */ }
                        // Maintenance was switched off since the last visit:
                        // drop the gate (and its hiding class) right away so a
                        // stale cache can never blank the page or hide logos.
                        html.classList.remove('maintenance-gate');
                        var stale = document.getElementById('maintenanceGate');
                        if (stale) stale.remove();
                    }
                })
                .catch(function () { clearTimeout(safety); dismissChecking(); });
        } catch (e) {
            clearTimeout(safety);
            dismissChecking();
        }
    }
})();
