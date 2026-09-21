const {test,expect}=require('@playwright/test');
const errors=new WeakMap();
test.beforeEach(async({page})=>{
    const list=[];errors.set(page,list);page.on('pageerror',e=>list.push(e.message));
    await page.route('**/.netlify/functions/**',route=>route.fulfill({json:{ok:true,data:null,updatedAt:1}}));
    await page.route(/https:\/\/(fonts\.googleapis|fonts\.gstatic|cdnjs\.cloudflare)\.com\//,route=>route.abort());
});
test.afterEach(async({page})=>expect(errors.get(page)).toEqual([]));
async function login(page,path='/admin') {
    await page.goto(path);
    await page.locator('#loginUser').fill('admin');await page.locator('#loginPass').fill('admin123');
    await page.locator('#loginForm button[type=submit]').click();
    await expect(page.locator('#adminPage')).toBeVisible();
}
async function tab(page,name){await page.locator(`[data-tab="content_${name}"]`).click();}
function input(page,section,path){return page.locator(`[data-content-editor="${section}"] [data-content-path="${path}"]`);}
async function save(page,section){await page.locator(`[data-save-section="${section}"]`).click();}

test('both admin entrypoints contain separate, working section editors',async({page})=>{
    for(const path of ['/admin','/admin.html']){
        await page.goto(path);if(await page.locator('#loginPage').isVisible()) await login(page,path);
        for(const name of ['home','shop','about','contact','header','footer','projects']){
            await tab(page,name);await expect(page.locator(`[data-pane="content_${name}"]`)).toBeVisible();
            await expect(page.locator('.admin-pane.active')).toHaveCount(1);
            await expect(page.locator(`[data-save-section="${name}"]`)).toBeVisible();
        }
    }
});

test('About CTA can be hidden independently; saves only its own section and keeps drafts',async({page})=>{
    await login(page);await input(page,'home','texts.cta_home_title').fill('پیش‌نویس خانه');
    await tab(page,'about');await input(page,'about','texts.aboutCta_title').fill('همکاری جدید');
    await input(page,'about','visible.aboutCta').uncheck();await save(page,'about');
    await tab(page,'home');await expect(input(page,'home','texts.cta_home_title')).toHaveValue('پیش‌نویس خانه');
    const data=await page.evaluate(()=>JSON.parse(localStorage.getItem('amir_site_data_v2')));
    expect(data.texts.cta_home_title).not.toBe('پیش‌نویس خانه');expect(data.visible.aboutCta).toBe(false);
    // Discard this intentional draft to allow navigation.
    await page.evaluate(()=>contentDrafts.clear());
    await page.goto('/about.html');await expect(page.locator('[data-visible="aboutCta"]')).toBeHidden();
    await page.goto('/');await expect(page.locator('[data-visible="cta_home"]')).toBeVisible();
});

test('all public pages switch to English LTR and preserve language across navigation',async({page})=>{
    await page.goto('/');await page.locator('#languageToggle').click();
    for(const path of ['/','/shop.html','/about.html','/contact.html','/projects.html']){
        await page.goto(path);await expect(page.locator('html')).toHaveAttribute('lang','en');await expect(page.locator('html')).toHaveAttribute('dir','ltr');
        const text=await page.locator('main').innerText();expect(text).not.toMatch(/[\u0600-\u06ff]/);
        await expect(page.locator('[data-text="copyright"]')).toHaveText('© 2026 Mr aMir. Built for the web.');
    }
    await page.locator('#languageToggle').click();await expect(page.locator('html')).toHaveAttribute('dir','rtl');
});

test('mobile navigation marks current page for clean and html URLs in both directions',async({page})=>{
    await page.setViewportSize({width:390,height:844});
    for(const lang of ['fa','en']){
        await page.goto('/');await page.evaluate(lang=>localStorage.setItem('amir_language',lang),lang);
        for(const route of ['shop','about','contact','projects']){
            await page.goto('/'+route);await page.locator('#mobileMenuBtn').click();
            await expect(page.locator('#mobileMenuBtn')).toHaveAttribute('aria-expanded','true');
            await expect(page.locator('.nav-link.active')).toHaveCount(1);
            await expect(page.locator('.nav-link.active')).toHaveAttribute('data-section',route);
            await expect(page.locator('.nav-link.active')).toHaveAttribute('aria-current','page');
            await expect(page.locator('.nav-link.active')).toBeInViewport();
        }
    }
});

test('header and footer identities, extra texts, blank strings and safe links persist',async({page})=>{
    await login(page);await tab(page,'header');await input(page,'header','texts.brand').fill('Header name');await save(page,'header');
    await tab(page,'footer');await input(page,'footer','texts.footer_brand').fill('Footer name');await input(page,'footer','texts.footer_about').fill('');
    await page.locator('[data-pane="content_footer"]').getByRole('button',{name:'+ افزودن متن یا لینک',exact:true}).click();
    const row=page.locator('[data-pane="content_footer"] .cms-extra-row');
    await row.locator('input').nth(0).fill('<img src=x onerror=alert(1)>');await row.locator('input').nth(1).fill('New footer text');await row.locator('input').nth(2).fill('javascript:alert(1)');await save(page,'footer');
    await page.goto('/');await expect(page.locator('.navbar [data-text="brand"]')).toHaveText('Header name');
    await expect(page.locator('[data-text="footer_brand"]')).toHaveText('Footer name');await expect(page.locator('[data-text="footer_about"]')).toBeEmpty();
    await expect(page.locator('.footer .content-extra')).toHaveText('<img src=x onerror=alert(1)>');await expect(page.locator('.content-extra img,.content-extra a')).toHaveCount(0);
});

test('closed shop shows editable animated maintenance, hides products and prevents buying',async({page})=>{
    await login(page);await tab(page,'shop');await page.locator('label.switch:has(#shopToggle)').click();
    await input(page,'shop','texts.shopDisabled_title').fill('در حال بروزرسانی هستیم');await save(page,'shop');
    await page.goto('/shop.html');await expect(page.locator('.shop-disabled')).toBeVisible();await expect(page.locator('.shop-disabled h3')).toHaveText('در حال بروزرسانی هستیم');
    await expect(page.locator('.maintenance-orbit')).toBeVisible();await expect(page.locator('.product-card')).toHaveCount(0);
    await page.evaluate(()=>{addToCart(1);openProductDetail(1);});await expect(page.locator('#productModal')).toHaveCount(0);
    expect(await page.evaluate(()=>Object.keys(CART).length)).toBe(0);
    await page.goto('/');await expect(page.locator('.shop-disabled')).toBeVisible();
});

test('individual controls hide required contact fields without blocking submission',async({page})=>{
    await page.goto('/contact.html');await page.evaluate(()=>{SITE.visible.contact_field_cPhone=false;SITE.visible['text:contact_subtitle']=false;saveData({push:false});renderSitePage();});
    await expect(page.locator('#cPhone')).toBeHidden();await expect(page.locator('#cPhone')).toBeDisabled();await expect(page.locator('[data-text="contact_subtitle"]')).toBeHidden();
    await page.locator('#cName').fill('Test');await page.locator('#cMessage').fill('Message');await page.locator('#contactForm button[type=submit]').click();await expect(page.locator('#formMessage')).toContainText('با موفقیت');
});

test('legacy saved content migrates without losing data and cards have independent translations and visibility',async({page})=>{
    await page.goto('/');await page.evaluate(()=>{
        localStorage.setItem('amir_site_data_v2',JSON.stringify({texts:{brand:'Legacy',about_name:'نام قدیمی'},visible:{stats:false},products:[{id:99,name:'محصول شخصی',price:42,category:'hosting',unit:'ماه',features:[],description:'شرح',icon:'fas fa-box'}]}));
    });
    await login(page);await tab(page,'shop');
    const details=page.locator('[data-content-editor="shop"] > details').filter({has:page.locator('summary').filter({hasText:'ترجمه و نمایش کارت‌ها'})});
    await details.locator('> summary').click();await details.getByText('محصول شخصی',{exact:true}).click();
    await input(page,'shop','itemTranslations.products.99.name').fill('Custom product');
    await input(page,'shop','visible.item:products:99:desc').uncheck();await save(page,'shop');
    await page.goto('/shop.html');await page.locator('#languageToggle').click();
    await expect(page.locator('.product-title')).toHaveText('Custom product');await expect(page.locator('.product-desc')).toBeHidden();
    const data=await page.evaluate(()=>JSON.parse(localStorage.getItem('amir_site_data_v2')));expect(data.texts.brand).toBe('Legacy');expect(data.texts.about_name).toBe('نام قدیمی');expect(data.visible.stats).toBe(false);
});

test('English product details and cart remain functional',async({page})=>{
    await page.goto('/shop.html');await page.locator('#languageToggle').click();
    await page.locator('[data-quick]').first().click();await expect(page.locator('#productModal')).toBeVisible();
    expect(await page.locator('#productModal').innerText()).not.toMatch(/[\u0600-\u06ff]/);
    await page.locator('#addCartBtn').click();await page.locator('#cartFloat').click();await expect(page.locator('#cartModal')).toBeVisible();
    await page.locator('#checkoutBtn').click();await expect(page.locator('#checkoutModal')).toBeVisible();
    expect(await page.locator('#checkoutModal').innerText()).not.toMatch(/[\u0600-\u06ff]/);
});

test('hide whole page, header and footer; remote merge retains new settings',async({page})=>{
    await page.goto('/about.html');await page.evaluate(()=>{
        mergeRemote({_updatedAt:Date.now(),texts:{aboutCta_title:'Remote CTA'},textsEn:{aboutCta_title:'Remote English'},visible:{page_about:false,header:false,footer:false},extraContent:{footer:[{fa:'متن',en:'Text',enabled:true}]}});renderSitePage();
    });
    await expect(page.locator('main')).toBeHidden();await expect(page.locator('.navbar')).toBeHidden();await expect(page.locator('.footer')).toBeHidden();
    await page.reload();await expect(page.locator('main')).toBeHidden();
    expect(await page.evaluate(()=>SITE.textsEn.aboutCta_title)).toBe('Remote English');
});

test('home preview buttons are independent from shop controls and updates reach typed content',async({page})=>{
    await page.goto('/');await page.evaluate(()=>{SITE.visible.home_productBuy=false;saveData({push:false});renderSitePage();});
    for(const button of await page.locator('[data-quick]').all()) await expect(button).toBeHidden();
    await page.goto('/shop.html');await expect(page.locator('[data-quick]').first()).toBeVisible();
    await page.goto('/about.html');await page.evaluate(()=>{SITE.texts.about_intro='متن معرفی به‌روز';renderSitePage();});
    await expect(page.locator('[data-text="about_intro"]')).toHaveText('متن معرفی به‌روز');
});

test('extra header content can be disabled and removed; repeated translation features remain separate lines',async({page})=>{
    await login(page);await tab(page,'header');
    await page.locator('[data-pane="content_header"]').getByRole('button',{name:'+ افزودن متن یا لینک',exact:true}).click();
    let row=page.locator('[data-pane="content_header"] .cms-extra-row');await row.locator('input').nth(0).fill('خبر جدید');await row.locator('input[type=checkbox]').uncheck();await save(page,'header');
    await page.goto('/');await expect(page.locator('.navbar .content-extra')).toBeEmpty();
    await page.goto('/admin');await tab(page,'header');row=page.locator('[data-pane="content_header"] .cms-extra-row');await row.getByRole('button',{name:'حذف',exact:true}).click();await save(page,'header');
    expect(await page.evaluate(()=>SITE.extraContent.header.length)).toBe(0);
    await page.evaluate(()=>{SITE.itemTranslations.products={1:{features:['First feature','Second feature']}};});
    await tab(page,'shop');
    const details=page.locator('[data-content-editor="shop"] > details').filter({has:page.locator('summary').filter({hasText:'ترجمه و نمایش کارت‌ها'})});
    await details.locator('> summary').click();await details.getByText('هاست لینوکس حرفه‌ای',{exact:true}).click();
    await expect(input(page,'shop','itemTranslations.products.1.features')).toHaveValue('First feature\nSecond feature');
});
