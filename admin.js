// ========== Admin Panel Full Logic ==========
const AUTH_KEY = 'amir_admin_auth';
const loginPage = document.getElementById('loginPage');
const adminPage = document.getElementById('adminPage');
const logoutBtn = document.getElementById('logoutBtn');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

// Common icon set for pickers
const ICON_SET = [
    'fas fa-server','fas fa-globe','fas fa-hdd','fas fa-shield-alt','fab fa-wordpress','fas fa-globe-americas',
    'fas fa-network-wired','fas fa-user-shield','fas fa-cloud','fas fa-database','fas fa-code','fab fa-python',
    'fab fa-js','fab fa-react','fab fa-html5','fab fa-css3-alt','fab fa-php','fab fa-node-js','fab fa-docker',
    'fab fa-git-alt','fab fa-github','fab fa-telegram','fab fa-instagram','fab fa-linkedin','fab fa-facebook',
    'fab fa-twitter','fab fa-youtube','fab fa-whatsapp','fab fa-discord','fas fa-envelope','fas fa-phone',
    'fas fa-clock','fas fa-headset','fas fa-life-ring','fas fa-comments','fas fa-medal','fas fa-star',
    'fas fa-chart-line','fas fa-robot','fas fa-plug','fas fa-cloud-upload-alt','fas fa-shopping-bag',
    'fas fa-mobile-alt','fas fa-laptop-code','fas fa-book','fas fa-bolt','fas fa-undo','fas fa-key',
    'fas fa-bullhorn','fas fa-graduation-cap','fas fa-fire','fas fa-crown','fas fa-gem','fas fa-heart',
    'fab fa-figma','fab fa-aws','fab fa-linux','fab fa-google','fas fa-envelope-open-text','fas fa-paper-plane',
    'fas fa-map-marker-alt','fab fa-instagram-square','fab fa-telegram-plane','fab fa-whatsapp-square'
];

// ---- Theme
(function initTheme() {
    const btn = document.getElementById('themeToggle');
    const t = localStorage.getItem('amir_theme') || 'light';
    applyTheme(t);
    if (btn) btn.addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme');
        applyTheme(cur === 'dark' ? 'light' : 'dark');
    });
})();
function applyTheme(theme) {
    const btn = document.getElementById('themeToggle');
    if (theme === 'dark') { document.documentElement.setAttribute('data-theme', 'dark'); if (btn) btn.innerHTML = '<i class="fas fa-sun"></i>'; }
    else { document.documentElement.removeAttribute('data-theme'); if (btn) btn.innerHTML = '<i class="fas fa-moon"></i>'; }
    localStorage.setItem('amir_theme', theme);
}

// ---- Auth
function checkAuth() {
    if (localStorage.getItem(AUTH_KEY) === 'true') {
        loginPage.classList.add('hidden');
        adminPage.classList.remove('hidden');
        logoutBtn.classList.remove('hidden');
        initDashboard();
    } else {
        loginPage.classList.remove('hidden');
        adminPage.classList.add('hidden');
        logoutBtn.classList.add('hidden');
    }
}
loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const u = document.getElementById('loginUser').value;
    const p = document.getElementById('loginPass').value;
    if (u === SITE.auth.username && p === SITE.auth.password) {
        localStorage.setItem(AUTH_KEY, 'true');
        loginError.style.display = 'none';
        checkAuth();
    } else {
        loginError.textContent = 'نام کاربری یا رمز عبور اشتباه است.';
        loginError.style.display = 'block';
    }
});
logoutBtn.addEventListener('click', () => { localStorage.removeItem(AUTH_KEY); checkAuth(); });

// ---- Tabs
document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.admin-pane').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.querySelector(`[data-pane="${tab.dataset.tab}"]`).classList.add('active');
    });
});

// ---- To Persian
function toPersianNum(n) { const p=['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹']; return (n===null||n===undefined)?'':n.toString().replace(/\d/g,d=>p[d]); }
function formatPrice(n) { return toPersianNum(Number(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g,',')); }
function fmtDate(iso) {
    try { const d = new Date(iso); return toPersianNum(d.toLocaleString('fa-IR')); } catch(e) { return iso; }
}

// ---- Reusable: Icon Picker
function iconPicker(selected, onPick) {
    const wrap = document.createElement('div');
    wrap.className = 'icon-picker';
    ICON_SET.forEach(ic => {
        const b = document.createElement('button');
        b.innerHTML = `<i class="${ic}"></i>`;
        if (ic === selected) b.classList.add('active');
        b.title = ic;
        b.addEventListener('click', () => {
            wrap.querySelectorAll('button').forEach(x => x.classList.remove('active'));
            b.classList.add('active');
            onPick(ic, b);
        });
        wrap.appendChild(b);
    });
    return wrap;
}

// ---- Modal helper
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
let modalSaveHandler = null;
document.getElementById('modalCancel').addEventListener('click', () => modal.classList.remove('active'));
modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('active'); });
document.getElementById('modalSave').addEventListener('click', () => { if (modalSaveHandler) modalSaveHandler(); });
function openModal(title, bodyEl, onSave) {
    modalTitle.textContent = title;
    modalBody.innerHTML = '';
    modalBody.appendChild(bodyEl);
    modalSaveHandler = onSave;
    modal.classList.add('active');
}
function closeModal() { modal.classList.remove('active'); }

// ---- Renderers
function renderProducts() {
    const tb = document.getElementById('productsTable');
    if (!tb) return;
    const cats = { hosting:'هاست', domain:'دامنه', server:'سرور', vpn:'VPN' };
    const badges = { hot:'داغ', new:'جدید', sale:'تخفیف' };
    tb.innerHTML = SITE.products.map((p,i) => `
        <tr>
            <td>${toPersianNum(i+1)}</td>
            <td class="pi"><i class="${p.icon}"></i></td>
            <td><strong>${p.name}</strong></td>
            <td>${cats[p.category]||'-'}</td>
            <td>${formatPrice(p.price)}</td>
            <td>${p.badge?`<span class="badge-on" style="background:var(--primary);color:#fff;">${badges[p.badge]||p.badge}</span>`:'-'}</td>
            <td class="actions">
                <button class="btn btn-outline btn-sm" data-edit-prod="${p.id}"><i class="fas fa-edit"></i></button>
                <button class="btn btn-danger btn-sm" data-del-prod="${p.id}"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`).join('') || `<tr><td colspan="7" class="empty">محصولی وجود ندارد</td></tr>`;
    tb.querySelectorAll('[data-edit-prod]').forEach(b => b.addEventListener('click', () => editProduct(+b.dataset.editProd)));
    tb.querySelectorAll('[data-del-prod]').forEach(b => b.addEventListener('click', () => {
        if (confirm('حذف این محصول؟')) {
            SITE.products = SITE.products.filter(p => p.id !== +b.dataset.delProd);
            saveData(); renderProducts(); refreshShopEverywhere();
        }
    }));
}
function productForm(product) {
    const p = product || { id:0, name:'', category:'hosting', price:0, unit:'ماهانه', icon:'fas fa-box', badge:'', description:'', features:[] };
    const form = document.createElement('div');
    form.innerHTML = `
        <div class="form-group"><label>نام محصول *</label><input type="text" id="m_pName" value="${p.name}"></div>
        <div class="row-3">
            <div class="form-group"><label>دسته</label>
                <select id="m_pCat">
                    <option value="hosting" ${p.category==='hosting'?'selected':''}>هاست</option>
                    <option value="domain" ${p.category==='domain'?'selected':''}>دامنه</option>
                    <option value="server" ${p.category==='server'?'selected':''}>سرور</option>
                    <option value="vpn" ${p.category==='vpn'?'selected':''}>کانفیگ VPN</option>
                </select>
            </div>
            <div class="form-group"><label>برچسب</label>
                <select id="m_pBadge">
                    <option value="" ${!p.badge?'selected':''}>بدون برچسب</option>
                    <option value="hot" ${p.badge==='hot'?'selected':''}>داغ</option>
                    <option value="new" ${p.badge==='new'?'selected':''}>جدید</option>
                    <option value="sale" ${p.badge==='sale'?'selected':''}>تخفیف</option>
                </select>
            </div>
            <div class="form-group"><label>آیکون</label><input type="text" id="m_pIcon" value="${p.icon}" placeholder="مثلاً fas fa-server"></div>
        </div>
        <div class="form-group"><label>توضیح کوتاه</label><input type="text" id="m_pDesc" value="${p.description||''}"></div>
        <div class="form-group"><label>توضیحات کامل (جزئیات محصول)</label><textarea id="m_pLong" rows="5" placeholder="توضیحات کامل محصول که در صفحه جزئیات نمایش داده می‌شود...">${p.longDescription||''}</textarea></div>
        <div class="row-2">
            <div class="form-group"><label>قیمت (تومان) *</label><input type="number" id="m_pPrice" value="${p.price}" min="0"></div>
            <div class="form-group"><label>واحد</label><input type="text" id="m_pUnit" value="${p.unit||'ماهانه'}"></div>
        </div>
        <div class="form-group">
            <label>آیکون (انتخاب سریع)</label>
            <div id="m_pIconPicker"></div>
        </div>
        <div class="form-group">
            <label>ویژگی‌ها</label>
            <div class="features-inputs" id="m_pFeats"></div>
            <button type="button" class="btn btn-outline btn-sm" id="m_pAddFeat"><i class="fas fa-plus"></i> افزودن ویژگی</button>
        </div>`;
    // icon picker
    setTimeout(() => {
        const picker = iconPicker(p.icon, (ic) => { form.querySelector('#m_pIcon').value = ic; });
        form.querySelector('#m_pIconPicker').appendChild(picker);
        const featsBox = form.querySelector('#m_pFeats');
        (p.features||[]).forEach(f => addFeatRow(featsBox, f));
        form.querySelector('#m_pAddFeat').addEventListener('click', () => addFeatRow(featsBox, ''));
    }, 10);
    function addFeatRow(box, val) {
        const r = document.createElement('div'); r.className = 'mini-row';
        r.innerHTML = `<input type="text" class="feat-input" value="${val||''}" placeholder="ویژگی..."><button type="button" class="feat-del"><i class="fas fa-times"></i></button>`;
        r.querySelector('.feat-del').addEventListener('click', () => r.remove());
        box.appendChild(r);
    }
    return form;
}
function editProduct(id) {
    const p = SITE.products.find(x => x.id === id);
    if (!p) return;
    openModal('ویرایش محصول', productForm(p), () => saveProduct(id));
}
function saveProduct(id) {
    const name = modalBody.querySelector('#m_pName').value.trim();
    if (!name) { alert('نام محصول را وارد کنید'); return; }
    const obj = {
        id: id || nextId(SITE.products),
        name,
        category: modalBody.querySelector('#m_pCat').value,
        badge: modalBody.querySelector('#m_pBadge').value,
        icon: modalBody.querySelector('#m_pIcon').value || 'fas fa-box',
        description: modalBody.querySelector('#m_pDesc').value,
        longDescription: modalBody.querySelector('#m_pLong') ? modalBody.querySelector('#m_pLong').value : '',
        price: parseInt(modalBody.querySelector('#m_pPrice').value) || 0,
        unit: modalBody.querySelector('#m_pUnit').value || 'ماهانه',
        features: Array.from(modalBody.querySelectorAll('.feat-input')).map(i => i.value.trim()).filter(Boolean)
    };
    if (id) {
        SITE.products = SITE.products.map(x => x.id === id ? obj : x);
    } else {
        SITE.products.push(obj);
    }
    saveData(); renderProducts(); refreshShopEverywhere(); closeModal();
}
document.getElementById('addProductBtn').addEventListener('click', () => openModal('محصول جدید', productForm(null), () => saveProduct(0)));

// Shop toggle
document.getElementById('shopToggle').addEventListener('change', e => {
    SITE.shopEnabled = e.target.checked; saveData(); refreshShopEverywhere();
});

// ---- Messages
function renderMessages() {
    const list = document.getElementById('messagesList');
    const totalEl = document.getElementById('msgTotal');
    const countEl = document.getElementById('msgCount');
    if (!list) return;
    const msgs = [...SITE.messages].reverse();
    const unread = SITE.messages.filter(m => !m.read).length;
    totalEl.textContent = toPersianNum(SITE.messages.length);
    countEl.textContent = toPersianNum(unread);
    countEl.style.display = unread ? 'inline-block' : 'none';
    if (!msgs.length) { list.innerHTML = '<div class="empty">هنوز پیامی دریافت نشده است.</div>'; return; }
    list.innerHTML = msgs.map(m => `
        <div class="msg-card ${m.read?'':'unread'}" data-mid="${m.id}">
            <div class="msg-head">
                <span class="msg-name"><i class="fas fa-user"></i> ${m.name}</span>
                <span class="msg-date"><i class="far fa-clock"></i> ${fmtDate(m.date)}</span>
            </div>
            <div class="msg-meta">
                ${m.phone?`<span><i class="fas fa-phone"></i> ${m.phone}</span>`:''}
                ${m.email?`<span><i class="fas fa-envelope"></i> ${m.email}</span>`:''}
                ${m.subject?`<span><i class="fas fa-tag"></i> ${m.subject}</span>`:''}
            </div>
            <div class="msg-body">${m.message}</div>
            <div style="margin-top:0.5rem;display:flex;gap:0.3rem;">
                ${!m.read?`<button class="btn btn-outline btn-sm" data-read="${m.id}"><i class="fas fa-check"></i> خواندم</button>`:''}
                <a href="https://t.me/${(m.phone||'').replace(/^0/,'')}" target="_blank" class="btn btn-primary btn-sm"><i class="fab fa-telegram"></i> پاسخ تلگرام</a>
                <button class="btn btn-danger btn-sm" data-del="${m.id}"><i class="fas fa-trash"></i></button>
            </div>
        </div>`).join('');
    list.querySelectorAll('[data-read]').forEach(b => b.addEventListener('click', () => {
        const id = +b.dataset.read;
        SITE.messages = SITE.messages.map(x => x.id === id ? {...x, read:true} : x);
        saveData(); renderMessages();
    }));
    list.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => {
        if (!confirm('حذف این پیام؟')) return;
        SITE.messages = SITE.messages.filter(x => x.id !== +b.dataset.del);
        saveData(); renderMessages();
    }));
}
document.getElementById('markAllRead').addEventListener('click', () => {
    SITE.messages = SITE.messages.map(x => ({...x, read:true}));
    saveData(); renderMessages();
});
document.getElementById('deleteAllMsgs').addEventListener('click', () => {
    if (!confirm('همه پیام‌ها حذف شوند؟')) return;
    SITE.messages = []; saveData(); renderMessages();
});

// ---- Socials
function renderSocials() {
    const tb = document.getElementById('socialsTable');
    if (!tb) return;
    tb.innerHTML = SITE.socials.map((s,i) => `
        <tr>
            <td class="pi"><i class="${s.icon}" style="color:${s.color||'inherit'};"></i></td>
            <td>${s.name}</td>
            <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;"><a href="${s.url}" target="_blank" style="color:var(--primary);font-size:0.82rem;">${s.url}</a></td>
            <td><span style="display:inline-block;width:20px;height:20px;border-radius:4px;background:${s.color||'#ccc'};"></span></td>
            <td class="actions">
                <button class="btn btn-outline btn-sm" data-edit-soc="${s.id}"><i class="fas fa-edit"></i></button>
                <button class="btn btn-danger btn-sm" data-del-soc="${s.id}"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`).join('') || `<tr><td colspan="5" class="empty">شبکه اجتماعی تعریف نشده</td></tr>`;
    tb.querySelectorAll('[data-edit-soc]').forEach(b => b.addEventListener('click', () => editSocial(+b.dataset.editSoc)));
    tb.querySelectorAll('[data-del-soc]').forEach(b => b.addEventListener('click', () => {
        if (confirm('حذف این شبکه اجتماعی؟')) { SITE.socials = SITE.socials.filter(s => s.id !== +b.dataset.delSoc); saveData(); renderSocials(); renderSiteSocials(); }
    }));
}
function socialForm(s) {
    s = s || { id:0, name:'', icon:'fab fa-telegram', url:'', color:'#0088cc' };
    const form = document.createElement('div');
    form.innerHTML = `
        <div class="row-2">
            <div class="form-group"><label>نام (مثلاً اینستاگرام)</label><input type="text" id="m_sName" value="${s.name}"></div>
            <div class="form-group"><label>کلاس آیکون</label><input type="text" id="m_sIcon" value="${s.icon}"></div>
        </div>
        <div class="form-group"><label>لینک کامل</label><input type="text" id="m_sUrl" value="${s.url}" placeholder="https://..."></div>
        <div class="form-group"><label>رنگ (HEX)</label><input type="color" class="color-input" id="m_sColor" value="${s.color||'#0088cc'}"></div>
        <div class="form-group"><label>انتخاب آیکون</label><div id="m_sIconPicker"></div></div>`;
    setTimeout(() => {
        form.querySelector('#m_sIconPicker').appendChild(iconPicker(s.icon, ic => form.querySelector('#m_sIcon').value = ic));
    },10);
    return form;
}
function editSocial(id) {
    const s = SITE.socials.find(x => x.id === id);
    openModal('ویرایش شبکه اجتماعی', socialForm(s), () => saveSocial(id));
}
function saveSocial(id) {
    const obj = {
        id: id || nextId(SITE.socials),
        name: modalBody.querySelector('#m_sName').value.trim(),
        icon: modalBody.querySelector('#m_sIcon').value.trim(),
        url: modalBody.querySelector('#m_sUrl').value.trim(),
        color: modalBody.querySelector('#m_sColor').value
    };
    if (!obj.name) { alert('نام را وارد کنید'); return; }
    if (id) SITE.socials = SITE.socials.map(x => x.id===id?obj:x);
    else SITE.socials.push(obj);
    saveData(); renderSocials(); renderSiteSocials(); closeModal();
}
document.getElementById('addSocialBtn').addEventListener('click', () => openModal('افزودن شبکه اجتماعی', socialForm(null), () => saveSocial(0)));
function renderSiteSocials() {
    // Re-render footer socials across pages via saving and a re-render would happen on page load.
    // For live feedback here we don't need it; next page load will use new data.
}

// ---- Contact Cards
function renderContact() {
    const tb = document.getElementById('contactTable');
    if (!tb) return;
    tb.innerHTML = SITE.contactCards.map(c => `
        <tr>
            <td class="pi"><i class="${c.icon}"></i></td>
            <td><strong>${c.title}</strong></td>
            <td>${c.value}</td>
            <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;font-size:0.8rem;">${c.url||'-'}</td>
            <td style="font-size:0.8rem;color:var(--text-muted);">${c.hint||''}</td>
            <td class="actions">
                <button class="btn btn-outline btn-sm" data-edit-cc="${c.id}"><i class="fas fa-edit"></i></button>
                <button class="btn btn-danger btn-sm" data-del-cc="${c.id}"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`).join('') || `<tr><td colspan="6" class="empty">-</td></tr>`;
    tb.querySelectorAll('[data-edit-cc]').forEach(b => b.addEventListener('click', () => editContact(+b.dataset.editCc)));
    tb.querySelectorAll('[data-del-cc]').forEach(b => b.addEventListener('click', () => {
        if (confirm('حذف؟')) { SITE.contactCards = SITE.contactCards.filter(x => x.id !== +b.dataset.delCc); saveData(); renderContact(); }
    }));
}
function contactForm(c) {
    c = c || { id:0, icon:'fas fa-phone', title:'', value:'', url:'', hint:'' };
    const form = document.createElement('div');
    form.innerHTML = `
        <div class="row-2">
            <div class="form-group"><label>عنوان</label><input type="text" id="m_cTitle" value="${c.title}"></div>
            <div class="form-group"><label>آیکون</label><input type="text" id="m_cIcon" value="${c.icon}"></div>
        </div>
        <div class="form-group"><label>مقدار (متن نمایشی)</label><input type="text" id="m_cValue" value="${c.value}"></div>
        <div class="form-group"><label>لینک (اختیاری)</label><input type="text" id="m_cUrl" value="${c.url||''}" placeholder="https:// یا mailto: یا tel:"></div>
        <div class="form-group"><label>توضیح کوچک</label><input type="text" id="m_cHint" value="${c.hint||''}"></div>
        <div class="form-group"><label>انتخاب آیکون</label><div id="m_cIconPicker"></div></div>`;
    setTimeout(() => form.querySelector('#m_cIconPicker').appendChild(iconPicker(c.icon, ic => form.querySelector('#m_cIcon').value = ic)),10);
    return form;
}
function editContact(id) {
    const c = SITE.contactCards.find(x => x.id === id);
    openModal('ویرایش کارت تماس', contactForm(c), () => saveContact(id));
}
function saveContact(id) {
    const obj = {
        id: id || nextId(SITE.contactCards),
        title: modalBody.querySelector('#m_cTitle').value.trim(),
        icon: modalBody.querySelector('#m_cIcon').value.trim() || 'fas fa-address-book',
        value: modalBody.querySelector('#m_cValue').value,
        url: modalBody.querySelector('#m_cUrl').value.trim(),
        hint: modalBody.querySelector('#m_cHint').value.trim()
    };
    if (!obj.title) { alert('عنوان را وارد کنید'); return; }
    if (id) SITE.contactCards = SITE.contactCards.map(x => x.id===id?obj:x);
    else SITE.contactCards.push(obj);
    saveData(); renderContact(); closeModal();
}
document.getElementById('addContactBtn').addEventListener('click', () => openModal('افزودن کارت تماس', contactForm(null), () => saveContact(0)));

// ---- Generic list editor factory (projects, features, skills, whyme)
function simpleEditor(config) {
    // config: { tableId, dataKey, fields:[{key,label,type}], onRender }
    const render = () => {
        const tb = document.getElementById(config.tableId);
        if (!tb) return;
        tb.innerHTML = SITE[config.dataKey].map((item,i) => {
            const main = item[config.fields[0].key] || '';
            const sub = item[config.fields[1]?.key] ? item[config.fields[1].key] : '';
            const ic = item.icon || '';
            return `<tr>
                <td>${toPersianNum(i+1)}</td>
                <td class="pi"><i class="${ic}"></i></td>
                <td><strong>${main}</strong>${sub?`<div style="font-size:0.78rem;color:var(--text-muted);margin-top:0.2rem;">${typeof sub==='string'?sub.slice(0,60):''}</div>`:''}</td>
                ${config.fields.length>2?`<td style="font-size:0.82rem;color:var(--text-secondary);">${item[config.fields[2].key]||''}</td>`:''}
                <td class="actions">
                    <button class="btn btn-outline btn-sm" data-edit="${item.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger btn-sm" data-del="${item.id}"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
        }).join('') || `<tr><td colspan="${config.fields.length+2}" class="empty">-</td></tr>`;
        tb.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => edit(+b.dataset.edit)));
        tb.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => {
            if (confirm('حذف؟')) { SITE[config.dataKey] = SITE[config.dataKey].filter(x => x.id !== +b.dataset.del); saveData(); render(); if (config.onChange) config.onChange(); }
        }));
    };
    function form(item) {
        item = item || config.fields.reduce((o,f)=>{o[f.key]='';return o;},{id:0,icon:'fas fa-star'});
        const wrap = document.createElement('div');
        let html = `<div class="form-group"><label>آیکون</label><input type="text" id="e_icon" value="${item.icon||''}"></div><div class="form-group"><label>انتخاب آیکون</label><div id="e_iconPicker"></div></div>`;
        config.fields.forEach(f => {
            if (f.type === 'textarea') html += `<div class="form-group"><label>${f.label}</label><textarea id="e_${f.key}">${item[f.key]||''}</textarea></div>`;
            else html += `<div class="form-group"><label>${f.label}</label><input type="text" id="e_${f.key}" value="${item[f.key]||''}"></div>`;
        });
        wrap.innerHTML = html;
        setTimeout(() => wrap.querySelector('#e_iconPicker').appendChild(iconPicker(item.icon, ic => wrap.querySelector('#e_icon').value = ic)), 10);
        return wrap;
    }
    function edit(id) {
        const item = SITE[config.dataKey].find(x => x.id === id);
        openModal('ویرایش', form(item), () => save(id));
    }
    function save(id) {
        const obj = { id: id || nextId(SITE[config.dataKey]), icon: modalBody.querySelector('#e_icon').value.trim() || 'fas fa-star' };
        config.fields.forEach(f => {
            const el = modalBody.querySelector(`#e_${f.key}`);
            obj[f.key] = el ? el.value : '';
        });
        if (id) SITE[config.dataKey] = SITE[config.dataKey].map(x => x.id===id?obj:x);
        else SITE[config.dataKey].push(obj);
        saveData(); render(); closeModal(); if (config.onChange) config.onChange();
    }
    document.getElementById(config.addBtnId).addEventListener('click', () => openModal('افزودن', form(null), () => save(0)));
    render();
    return render;
}

// ---- About photos
function updatePhotoPreviews() {
    const hp = document.getElementById('heroPhotoPreview');
    const ap = document.getElementById('aboutPhotoPreview');
    if (hp) {
        if (SITE.heroPhoto) hp.innerHTML = `<img src="${SITE.heroPhoto}">`; else hp.innerHTML = '<i class="fas fa-user"></i>';
    }
    if (ap) {
        if (SITE.aboutPhoto) ap.innerHTML = `<img src="${SITE.aboutPhoto}">`; else ap.innerHTML = '<i class="fas fa-user-tie"></i>';
    }
}
function setupPhoto(inputId, clearId, key) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.addEventListener('change', e => {
        const f = e.target.files[0]; if (!f) return;
        if (f.size > 1024*1024) { alert('اندازه عکس باید کمتر از ۱ مگابایت باشد'); return; }
        const r = new FileReader();
        r.onload = ev => { SITE[key] = ev.target.result; saveData(); updatePhotoPreviews(); };
        r.readAsDataURL(f);
    });
    document.getElementById(clearId).addEventListener('click', () => {
        if (confirm('حذف عکس؟')) { SITE[key] = ''; saveData(); updatePhotoPreviews(); }
    });
}
setupPhoto('heroPhotoInput','heroPhotoClear','heroPhoto');
setupPhoto('aboutPhotoInput','aboutPhotoClear','aboutPhoto');

// About texts save
function loadAboutTexts() {
    const ids = ['about_name','about_intro','about_years','about_block1_title','about_block1_desc','about_block2_title','about_block2_desc','about_block3_title','about_block3_desc'];
    ids.forEach(id => {
        const el = document.getElementById('t_'+id);
        if (el) el.value = SITE.texts[id] || '';
    });
}
document.getElementById('saveAboutTexts').addEventListener('click', () => {
    const ids = ['about_name','about_intro','about_years','about_block1_title','about_block1_desc','about_block2_title','about_block2_desc','about_block3_title','about_block3_desc'];
    ids.forEach(id => { SITE.texts[id] = document.getElementById('t_'+id).value; });
    saveData(); alert('ذخیره شد. برای مشاهده، صفحه درباره من را رفرش کنید.');
});

// ---- All texts editor
function renderTextsEditor() {
    const box = document.getElementById('textsEditor');
    if (!box) return;
    box.innerHTML = '';
    const labels = {
        brand:'متن لوگو', hero_badge:'نشان بالای عنوان', hero_title_before:'نام (قبل از گرادیان)',
        hero_title_grad:'نام خانوادگی (گرادیان)', hero_subtitle:'توضیح اصلی',
        stats_projects:'برچسب آمار پروژه', stats_years:'برچسب سال‌ها', stats_clients:'برچسب مشتریان',
        features_title:'عنوان بخش خدمات', features_subtitle:'زیرعنوان خدمات',
        shopPreview_title:'عنوان محصولات پر فروش', shopPreview_subtitle:'زیرعنوان محصولات', shopPreview_btn:'دکمه مشاهده همه',
        cta_home_title:'عنوان CTA صفحه اصلی', cta_home_desc:'توضیح CTA', cta_home_btn:'دکمه CTA',
        shopPage_title:'عنوان صفحه فروشگاه', shopPage_subtitle:'توضیح صفحه فروشگاه',
        shopCta_title:'عنوان CTA فروشگاه', shopCta_desc:'توضیح CTA فروشگاه',
        projects_title:'عنوان نمونه‌کارها', projects_subtitle:'توضیح نمونه‌کارها',
        projectsCta_title:'عنوان CTA پروژه', projectsCta_desc:'توضیح CTA پروژه', projectsCta_btn:'دکمه CTA پروژه',
        about_title:'عنوان صفحه درباره من', about_subtitle:'توضیح صفحه درباره من',
        skills_title:'عنوان مهارت‌ها',
        whyme_title:'عنوان چرا من؟', whyme_subtitle:'توضیح چرا من؟',
        contact_title:'عنوان تماس', contact_subtitle:'توضیح تماس',
        contactForm_title:'عنوان فرم تماس', contact_name:'برچسب نام', contact_email:'برچسب ایمیل',
        contact_phone:'برچسب تلفن', contact_subject:'برچسب موضوع', contact_message:'برچسب پیام',
        contact_send:'متن دکمه ارسال', formSuccess:'پیام موفقیت',
        shopDisabled_title:'عنوان فروشگاه غیرفعال', shopDisabled_desc:'توضیح فروشگاه غیرفعال',
        shopDisabled_extra:'متن کمکی فروشگاه غیرفعال',
        copyrightName:'نام در کپی‌رایت', footer_about:'توضیح کوتاه در فوتر'
    };
    Object.keys(SITE.texts).forEach(key => {
        const val = SITE.texts[key] || '';
        const row = document.createElement('div');
        row.className = 'text-edit-row';
        const isLong = val.length > 60 || key.includes('desc') || key.includes('subtitle') || key.includes('intro') || key.includes('_message') || key.includes('_about');
        row.innerHTML = `<label>${labels[key]||key}</label>${isLong?`<textarea data-tkey="${key}">${val}</textarea>`:`<input type="text" data-tkey="${key}" value="${val}">`}<div></div>`;
        box.appendChild(row);
    });
}
document.getElementById('saveTexts').addEventListener('click', () => {
    document.querySelectorAll('[data-tkey]').forEach(el => {
        SITE.texts[el.dataset.tkey] = el.value;
    });
    saveData(); alert('همه متن‌ها ذخیره شدند. برای مشاهده، سایت را رفرش کنید.');
});

// ---- Visibility
function renderVisibility() {
    const box = document.getElementById('visibilityList');
    if (!box) return;
    const labels = {
        hero:'بخش معرفی (Hero) صفحه اصلی', features:'بخش خدمات صفحه اصلی',
        shopPreview:'پیش‌نمایش محصولات صفحه اصلی', cta_home:'باکس CTA صفحه اصلی',
        stats:'بخش آمار', shopPage:'هدر و محتوای فروشگاه',
        projects:'بخش نمونه‌کارها', about:'بخش درباره من',
        skills:'قسمت مهارت‌ها (درباره من)', whyme:'بخش چرا همکاری با من',
        contactInfo:'کارت‌های اطلاعات تماس', contactForm:'فرم ارسال پیام',
        footer:'فوتر (پاورقی) سایت'
    };
    box.innerHTML = Object.keys(SITE.visible).map(k => `
        <div class="toggle-row">
            <div style="font-weight:500;">${labels[k]||k}</div>
            <label class="switch"><input type="checkbox" data-vis="${k}" ${SITE.visible[k]?'checked':''}><span class="slider"></span></label>
        </div>`).join('');
    box.querySelectorAll('[data-vis]').forEach(cb => cb.addEventListener('change', () => {
        SITE.visible[cb.dataset.vis] = cb.checked; saveData();
    }));
}

// ---- Settings (password + data)
document.getElementById('setUser').value = SITE.auth.username;
document.getElementById('savePassword').addEventListener('click', () => {
    const oldU = document.getElementById('setUser').value;
    const oldP = document.getElementById('setOldPass').value;
    const newU = document.getElementById('setNewUser').value;
    const newP = document.getElementById('setNewPass').value;
    const newP2 = document.getElementById('setNewPass2').value;
    const msg = document.getElementById('passMsg');
    if (oldU !== SITE.auth.username || oldP !== SITE.auth.password) {
        msg.className = 'alert alert-error'; msg.textContent = 'نام کاربری یا رمز فعلی اشتباه است.'; return;
    }
    if (newP && newP !== newP2) { msg.className='alert alert-error'; msg.textContent='تکرار رمز با رمز جدید مطابقت ندارد.'; return; }
    SITE.auth.username = newU || oldU;
    if (newP) SITE.auth.password = newP;
    saveData();
    msg.className='alert alert-success'; msg.textContent='رمز با موفقیت تغییر کرد.';
    document.getElementById('setOldPass').value=''; document.getElementById('setNewPass').value=''; document.getElementById('setNewPass2').value='';
    setTimeout(()=>{msg.className='';msg.textContent='';},3000);
});

document.getElementById('setBrand').value = SITE.texts.brand || '';
document.getElementById('saveBrand').addEventListener('click', () => {
    SITE.texts.brand = document.getElementById('setBrand').value; saveData();
    alert('ذخیره شد.');
});

document.getElementById('exportData').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(SITE, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `amir-site-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click(); URL.revokeObjectURL(url);
});
document.getElementById('importData').addEventListener('change', e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => {
        try {
            const d = JSON.parse(ev.target.result);
            if (!confirm('بازنویسی تمام داده‌های فعلی با فایل پشتیبان؟')) return;
            localStorage.setItem('amir_site_data_v2', JSON.stringify(d));
            location.reload();
        } catch(err) { alert('فایل نامعتبر است.'); }
    };
    r.readAsText(f);
});
document.getElementById('resetData').addEventListener('click', () => {
    if (!confirm('همه تغییرات شما پاک شده و سایت به حالت اولیه بازگردد؟')) return;
    if (!confirm('این عملیات غیرقابل بازگشت است. مطمئن هستید؟')) return;
    localStorage.removeItem('amir_site_data_v2');
    location.reload();
});

// ---- Orders
function renderOrders() {
    const list = document.getElementById('ordersList');
    const totalEl = document.getElementById('ordTotal');
    const countEl = document.getElementById('ordCount');
    if (!list) return;
    SITE.orders = SITE.orders || [];
    const orders = [...SITE.orders].reverse();
    totalEl.textContent = toPersianNum(orders.length);
    countEl.textContent = toPersianNum(orders.length);
    countEl.style.display = orders.length ? 'inline-block' : 'none';
    if (!orders.length) { list.innerHTML = '<div class="empty">هنوز سفارشی ثبت نشده است.</div>'; return; }
    list.innerHTML = orders.map(o => `
        <div class="msg-card ${o.sent?'':'unread'}">
            <div class="msg-head">
                <span class="msg-name"><i class="fas fa-file-invoice"></i> ${o.id}</span>
                <span class="msg-date"><i class="far fa-clock"></i> ${fmtDate(o.date)}</span>
            </div>
            <div class="msg-meta">
                <span><i class="fas fa-user"></i> ${o.name}</span>
                <span><i class="fas fa-phone"></i> ${o.phone}</span>
                ${o.email?`<span><i class="fas fa-envelope"></i> ${o.email}</span>`:''}
                <span style="color:${o.sent?'var(--success)':'var(--warning)'};font-weight:600;"><i class="fas fa-${o.sent?'check-circle':'exclamation-triangle'}"></i> ${o.sent?'ارسال به تلگرام':'ذخیره محلی'}</span>
            </div>
            <div class="msg-body">
                <strong>اقلام:</strong><br>
                ${o.items.map(it => `• ${it.name} × ${toPersianNum(it.qty)} = ${formatPrice(it.price*it.qty)} تومان`).join('<br>')}
                <br><br><strong>جمع کل: ${formatPrice(o.total)} تومان</strong>
                ${o.note?`<br><br><strong>یادداشت:</strong> ${o.note}`:''}
            </div>
            <div style="margin-top:0.5rem;display:flex;gap:0.3rem;flex-wrap:wrap;">
                <a href="https://t.me/${(o.phone||'').replace(/^0/,'')}" target="_blank" class="btn btn-primary btn-sm"><i class="fab fa-telegram"></i> تماس با مشتری</a>
                ${o.phone?`<a href="tel:${o.phone}" class="btn btn-outline btn-sm"><i class="fas fa-phone"></i> تماس تلفنی</a>`:''}
                <button class="btn btn-danger btn-sm" data-del-ord="${o.id}"><i class="fas fa-trash"></i></button>
            </div>
        </div>`).join('');
    list.querySelectorAll('[data-del-ord]').forEach(b => b.addEventListener('click', () => {
        if (!confirm('حذف این سفارش؟')) return;
        SITE.orders = SITE.orders.filter(x => x.id !== b.dataset.delOrd);
        saveData(); renderOrders();
    }));
}
document.getElementById('delAllOrders').addEventListener('click', () => {
    if (!confirm('همه سفارشات حذف شوند؟')) return;
    SITE.orders = []; saveData(); renderOrders();
});

// ---- Telegram Settings
function loadTelegramSettings() {
    document.getElementById('tgToken').value = SITE.telegram.botToken || '';
    document.getElementById('tgChatId').value = SITE.telegram.chatId || '';
    document.getElementById('tgBotUsername').value = SITE.telegram.botUsername || '';
    document.getElementById('tgCard').value = SITE.telegram.cardNumber || '';
    document.getElementById('tgCardHolder').value = SITE.telegram.cardHolder || '';
    updateTgStatus();
}
function updateTgStatus() {
    const box = document.getElementById('tgStatus'); if (!box) return;
    if (SITE.telegram.botToken && SITE.telegram.chatId) {
        box.innerHTML = `<span style="color:var(--success);"><i class="fas fa-check-circle"></i> ربات پیکربندی شده است</span>`;
    } else {
        box.innerHTML = `<span style="color:var(--warning);"><i class="fas fa-exclamation-triangle"></i> هنوز پیکربندی نشده است</span>`;
    }
}
document.getElementById('saveTelegram').addEventListener('click', async () => {
    const token = document.getElementById('tgToken').value.trim();
    const chatId = document.getElementById('tgChatId').value.trim();
    const botUsername = document.getElementById('tgBotUsername').value.trim().replace('@','');
    const cardNumber = document.getElementById('tgCard').value.trim();
    const cardHolder = document.getElementById('tgCardHolder').value.trim();
    const msg = document.getElementById('tgMsg');
    SITE.telegram.botToken = token;
    SITE.telegram.chatId = chatId;
    SITE.telegram.botUsername = botUsername;
    SITE.telegram.cardNumber = cardNumber;
    SITE.telegram.cardHolder = cardHolder;
    saveData();
    if (!token || !chatId) {
        msg.className = 'alert alert-error'; msg.textContent = 'لطفاً هر دو فیلد را وارد کنید.'; updateTgStatus();
        return;
    }
    msg.className = ''; msg.textContent = '';
    const btn = document.getElementById('saveTelegram');
    btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال تست...';
    try {
        const resp = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({
                chat_id: chatId,
                text: '✅ <b>اتصال ربات موفقیت‌آمیز بود!</b>\nاکنون سفارشات جدید فروشگاه به این چت ارسال می‌شوند.',
                parse_mode: 'HTML'
            })
        });
        const data = await resp.json();
        if (data.ok) {
            msg.className = 'alert alert-success'; msg.textContent = '✓ پیام تست با موفقیت ارسال شد! تنظیمات ذخیره گردید.';
        } else {
            msg.className = 'alert alert-error'; msg.textContent = 'خطا: ' + (data.description || 'مقادیر را بررسی کنید');
        }
    } catch(err) {
        msg.className = 'alert alert-error'; msg.textContent = 'خطا در برقراری ارتباط با تلگرام. اتصال اینترنت و مقادیر را بررسی کنید.';
    }
    btn.disabled = false; btn.innerHTML = '<i class="fas fa-save"></i> ذخیره و تست';
    updateTgStatus();
    setTimeout(()=>{msg.className='';msg.textContent='';},6000);
});

// ---- Dashboard Init
function initDashboard() {
    renderProducts();
    renderOrders();
    renderMessages();
    renderSocials();
    renderContact();
    updatePhotoPreviews();
    loadAboutTexts();
    renderTextsEditor();
    renderVisibility();
    loadTelegramSettings();
    document.getElementById('shopToggle').checked = SITE.shopEnabled;

    // Simple list editors
    simpleEditor({
        tableId:'projectsTable', dataKey:'projects',
        fields:[{key:'title',label:'عنوان'},{key:'tag',label:'برچسب'},{key:'desc',label:'توضیح',type:'textarea'},{key:'tech',label:'تکنولوژی‌ها (با کاما جدا کنید)'}],
        addBtnId:'addProjectBtn'
    });
    simpleEditor({
        tableId:'featuresTable', dataKey:'features',
        fields:[{key:'title',label:'عنوان'},{key:'desc',label:'توضیح',type:'textarea'}],
        addBtnId:'addFeatureBtn'
    });
    simpleEditor({
        tableId:'skillsTable', dataKey:'skills',
        fields:[{key:'name',label:'نام مهارت'}],
        addBtnId:'addSkillBtn'
    });
    simpleEditor({
        tableId:'whymeTable', dataKey:'whyme',
        fields:[{key:'title',label:'عنوان'},{key:'desc',label:'توضیح',type:'textarea'}],
        addBtnId:'addWhymeBtn'
    });
}

checkAuth();
