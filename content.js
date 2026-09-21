// Public content layer: page-scoped controls, navigation and language direction.
function currentPage() {
    const path = location.pathname.replace(/\/+$/, '').split('/').pop().replace(/\.html$/, '');
    return ['shop','about','contact','projects'].includes(path) ? path : (document.body.dataset.page || 'home');
}
function safeContentUrl(value) {
    const url = String(value || '').trim();
    if (!url) return '';
    if (/^(https?:|mailto:|tel:)/i.test(url) || (!/^[a-z][a-z\d+.-]*:/i.test(url) && !url.startsWith('//'))) return url;
    return '';
}
function renderExtraContent() {
    for (const section of ['header','footer']) {
        const parent = document.querySelector(section==='header' ? '.nav-container' : '.footer .container');
        if (!parent) continue;
        let box = parent.querySelector('.content-extra');
        if (!box) { box=document.createElement('div'); box.className='content-extra'; parent.append(box); }
        box.replaceChildren();
        (SITE.extraContent[section] || []).filter(item=>item.enabled!==false).forEach(item=>{
            const url=safeContentUrl(item.url);
            const el=document.createElement(url?'a':'span');
            el.textContent=isEnglish() ? (item.en ?? item.fa ?? '') : (item.fa ?? '');
            if(url) el.href=url;
            box.append(el);
        });
    }
}
function applyContentControls() {
    if (!document.body.classList.contains('public-site')) return;
    document.documentElement.lang=isEnglish()?'en':'fa';
    document.documentElement.dir=isEnglish()?'ltr':'rtl';
    const page=currentPage();
    document.querySelectorAll('.nav-link').forEach(link=>{
        // Compare destinations too, so clean Netlify URLs never select Home by mistake.
        const active=link.dataset.section===page;
        link.classList.toggle('active',active);
        if(active) link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current');
    });
    const toggle=document.getElementById('languageToggle');
    if(toggle) {
        toggle.textContent=isEnglish()?'فارسی':'EN';
        toggle.setAttribute('aria-label',isEnglish()?'Switch to Persian':'Switch to English');
        if(!toggle.dataset.ready) {
            toggle.dataset.ready='1';
            toggle.addEventListener('click',()=>{
                localStorage.setItem('amir_language',isEnglish()?'fa':'en');
                // Reload preserves the cart and avoids stale modal/typewriter text.
                location.reload();
            });
        }
    }
    const menu=document.getElementById('mobileMenuBtn');
    if(menu) {
        menu.setAttribute('aria-controls','navMenu');
        menu.setAttribute('aria-label',isEnglish()?'Navigation menu':'منوی ناوبری');
        menu.setAttribute('aria-expanded',String(document.getElementById('navMenu').classList.contains('active')));
    }
    const modalControls={productDetailImage:'.product-detail-icon',productDetailCategory:'.product-detail-cat',productDetailTitle:'.product-detail-title',productDetailDesc:'.product-detail-desc',productDetailLong:'.product-detail-long',productDetailFeatures:'.product-detail-features',productDetailPrice:'.product-detail-pricebox',productDetailAdd:'#addCartBtn',productDetailCart:'#viewCartBtn',cartCheckout:'#checkoutBtn',checkoutForm:'#checkoutForm',checkoutName:'#chName',checkoutPhone:'#chPhone',checkoutEmail:'#chEmail',checkoutNote:'#chNote',checkoutSubmit:'#checkoutForm button[type=submit]',projectDetailImage:'.project-detail-hero',projectDetailTitle:'.project-detail-title',projectDetailTag:'.project-detail-tag',projectDetailDesc:'.project-detail-desc',projectDetailLong:'.project-detail-long',projectDetailTech:'.project-detail-tech',projectDetailContact:'.project-detail-actions a',projectDetailShop:'[data-project-open-shop]'};
    Object.entries(modalControls).forEach(([key,selector])=>document.querySelectorAll(selector).forEach(el=>{(el.matches('input,textarea')?el.closest('.form-group'):el).dataset.visible=key;}));
    document.querySelectorAll('[data-visible]').forEach(el=>{
        const hidden=!isVisible(el.dataset.visible);
        el.classList.toggle('content-hidden',hidden);
        // Hidden required fields must not prevent submitting the remaining form.
        if(el.matches('.form-group')) el.querySelectorAll('input,textarea,select').forEach(input=>{input.disabled=hidden;});
    });
    document.querySelectorAll('[data-text],[data-placeholder]').forEach(el=>{
        const key=el.dataset.text || el.dataset.placeholder;
        el.classList.toggle('content-text-hidden',!isVisible('text:'+key));
        if(el.dataset.placeholder) el.placeholder=txt(key);
    });
    document.querySelectorAll('[data-item-list]').forEach(el=>{
        const list=el.dataset.itemList, id=el.dataset.itemId;
        const fields={image:'.feature-icon,.project-image,.product-image,.contact-icon,.product-detail-icon,.project-detail-hero',title:'h3,h4,.product-title,.product-detail-title,.project-detail-title',desc:'.feature-card > p,.project-content > p,.product-desc,.product-detail-desc,.project-detail-desc',longDescription:'.product-detail-long,.project-detail-long',tag:'.project-tag,.project-detail-tag',tech:'.project-tech,.project-detail-tech',hint:'.contact-detail p',value:'.contact-detail a,.contact-detail > span',features:'.product-features,.product-detail-features',price:'.product-price,.product-detail-price',unit:'.price-unit'};
        Object.entries(fields).forEach(([field,selector])=>el.querySelectorAll(selector).forEach(child=>child.classList.toggle('content-item-hidden',!isVisible(`item:${list}:${id}:${field}`))));
    });
    // Disabled shop entry points must never navigate; announce why instead.
    document.querySelectorAll('a.shop-entry-disabled').forEach(el=>{
        if(el.dataset.entryBlocked==='1')return;
        el.dataset.entryBlocked='1';
        el.addEventListener('click',e=>{
            if(!el.classList.contains('shop-entry-disabled'))return;
            e.preventDefault();e.stopPropagation();
            if(typeof showToast==='function')showToast(txt('shopDisabled_title'),'error');
        },true);
    });
    const productControls={productImage:'.product-image',productBadge:'.product-badge',productCategory:'.product-cat',productName:'.product-title',productDescription:'.product-desc',productFeatures:'.product-features',productPrice:'.product-price',productBuy:'[data-quick]',shopFilters:'.shop-categories'};
    Object.entries(productControls).forEach(([key,selector])=>document.querySelectorAll(selector).forEach(el=>el.classList.toggle('content-hidden',!isVisible(page==='home' && key!=='shopFilters' ? 'home_'+key : key))));
    [['home_sliderArrows','.slider-arrow'],['home_sliderDots','.slider-dots'],['home_sliderProgress','.slider-progress']].forEach(([key,selector])=>document.querySelectorAll(selector).forEach(el=>el.classList.toggle('content-hidden',!isVisible(key))));
    const cart=document.getElementById('cartFloat');
    if(cart) {
        cart.classList.toggle('content-hidden',!SITE.shopEnabled || !isVisible('cart_'+page));
        const label=cart.querySelector('.cart-float-label'); if(label) {label.textContent=txt('cartTitle');label.classList.toggle('content-text-hidden',!isVisible('text:cartTitle'));}
    }
    // A closed shop disables every public entry point too: the home preview
    // section disappears entirely and all shop links become inert.
    const shopOff=SITE.shopEnabled===false;
    document.querySelectorAll('[data-visible="shopPreview"]').forEach(el=>el.classList.toggle('content-hidden',shopOff || !isVisible('shopPreview')));
    document.querySelectorAll('[data-shop-entry]').forEach(el=>{
        el.classList.toggle('shop-entry-disabled',shopOff);
        if(shopOff){el.setAttribute('aria-disabled','true');el.title=txt('shopDisabled_title');}
        else{el.removeAttribute('aria-disabled');if(el.dataset.entryTitle)el.title=el.dataset.entryTitle;else el.removeAttribute('title');}
    });
    document.querySelectorAll('[data-content-link]').forEach(el=>{
        const value=SITE.contentLinks[el.dataset.contentLink];
        if(value!==undefined) el.href=safeContentUrl(value) || '#';
    });
    renderExtraContent();
}
