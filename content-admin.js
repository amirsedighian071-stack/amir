// Section-based editor. Existing product/media/order tools are retained below
// each section; content changes are applied as field-level patches on Save.
const contentDrafts = new Map();
const CONTENT_LISTS = {home:['features'],shop:['products'],about:['skills','whyme'],contact:['contactCards'],footer:['socials'],projects:['projects']};
const CONTENT_FIELD_LABELS = {name:'نام',title:'عنوان',desc:'توضیح',description:'توضیح کوتاه',longDescription:'توضیح کامل',unit:'واحد قیمت',features:'ویژگی‌ها (هر خط یک مورد)',tag:'برچسب',tech:'فناوری‌ها',value:'مقدار',hint:'توضیح تکمیلی',image:'تصویر / آیکون',price:'قیمت'};
function resetNewContentItem(list,id) {
    // Legacy list editors may reuse the highest deleted ID. Do not inherit
    // translations or hidden states from the deleted record.
    if(SITE.itemTranslations[list]) delete SITE.itemTranslations[list][id];
    const prefix=`item:${list}:${id}`;
    Object.keys(SITE.visible).forEach(key=>{if(key===prefix || key.startsWith(prefix+':')) delete SITE.visible[key];});
}
function contentDraft(section, path, value) {
    if(!contentDrafts.has(section)) contentDrafts.set(section,new Map());
    contentDrafts.get(section).set(JSON.stringify(path),value);
    const state=document.querySelector(`[data-content-state="${section}"]`);
    if(state) state.textContent='تغییرات ذخیره‌نشده';
}
function contentValue(section,path,fallback) {
    const draft=contentDrafts.get(section), key=JSON.stringify(path);
    if(draft?.has(key)) return draft.get(key);
    let value=SITE;
    for(const part of path) value=value?.[part];
    return value ?? fallback;
}
function contentInput(section,path,value,label,options={}) {
    const wrapper=document.createElement('label'); wrapper.className=options.check?'cms-check':'cms-field';
    const title=document.createElement('span'); title.textContent=label;
    const input=document.createElement(options.check?'input':'textarea');
    if(options.check) {input.type='checkbox';input.checked=!!contentValue(section,path,value);}
    else {input.rows=options.rows || 2; const current=contentValue(section,path,value); input.value=Array.isArray(current)?current.join('\n'):current; input.dir=options.en?'ltr':'rtl';}
    input.dataset.contentPath=path.join('.');
    input.addEventListener(options.check?'change':'input',()=>contentDraft(section,path,options.check?input.checked:input.value));
    wrapper.append(title,input); return wrapper;
}
function contentToggle(section,key,label) { return contentInput(section,['visible',key],true,label,{check:true}); }
function saveContentSection(section) {
    const changes=contentDrafts.get(section);
    if(!changes?.size) return;
    changes.forEach((value,key)=>{
        const path=JSON.parse(key); let target=SITE;
        for(const part of path.slice(0,-1)) { if(!target[part] || typeof target[part]!=='object') target[part]={}; target=target[part]; }
        // Product feature translations are edited as one feature per line.
        target[path.at(-1)]=path[0]==='itemTranslations' && path.at(-1)==='features' ? String(value).split('\n').filter(Boolean) : value;
    });
    contentDrafts.delete(section);
    saveData(); markSync('saving');
    showAdminToast('تنظیمات این بخش ذخیره شد؛ وضعیت انتشار را در نوار همگام‌سازی ببینید.');
    document.querySelector(`[data-content-state="${section}"]`).textContent='ذخیره شد — در انتظار همگام‌سازی';
    renderContentSection(section);
}
function contentDetails(title,open=false) {
    const details=document.createElement('details'); details.className='cms-details'; details.open=open;
    const summary=document.createElement('summary'); summary.textContent=title; details.append(summary); return details;
}
function renderContentSection(section) {
    const box=document.querySelector(`[data-content-editor="${section}"]`); if(!box) return;
    // Do not discard focused inputs or uncommitted drafts on background refresh.
    if(box.contains(document.activeElement)) return;
    const schema=CONTENT_SECTIONS[section]; box.replaceChildren();
    const toggles=contentDetails('نمایش بخش‌ها و دکمه‌ها',true), grid=document.createElement('div'); grid.className='cms-toggle-grid';
    Object.entries(schema.visible).forEach(([key,label])=>grid.append(contentToggle(section,key,label)));
    toggles.append(grid); box.append(toggles);
    const texts=contentDetails('متن‌های فارسی و انگلیسی',true);
    const search=document.createElement('input'); search.type='search'; search.className='cms-search'; search.placeholder='جستجوی متن در این بخش…'; search.setAttribute('aria-label','جستجوی متن'); texts.append(search);
    const textList=document.createElement('div'); texts.append(textList);
    Object.entries(schema.texts).forEach(([key,label])=>{
        const row=document.createElement('div'); row.className='cms-text-row'; row.dataset.search=(label+' '+key).toLowerCase();
        const heading=document.createElement('div'); heading.className='cms-text-heading';
        const title=document.createElement('strong'); title.textContent=label; heading.append(title,contentToggle(section,'text:'+key,'نمایش متن'));
        const fields=document.createElement('div'); fields.className='cms-bilingual';
        fields.append(contentInput(section,['texts',key],CONTENT_FA[key] || '', 'فارسی'),contentInput(section,['textsEn',key],CONTENT_EN[key] || '', 'English',{en:true}));
        row.append(heading,fields); textList.append(row);
    });
    search.addEventListener('input',()=>textList.querySelectorAll('.cms-text-row').forEach(row=>{row.hidden=!row.dataset.search.includes(search.value.toLowerCase());}));
    box.append(texts);
    const links=CONTENT_LINKS[section] || {};
    if(Object.keys(links).length) {
        const details=contentDetails('مقصد دکمه‌ها و لینک‌ها');
        Object.entries(links).forEach(([key,link])=>details.append(contentInput(section,['contentLinks',key],link.url,link.label,{en:true,rows:1})));
        box.append(details);
    }
    (CONTENT_LISTS[section] || []).forEach(list=>{
        const details=contentDetails('ترجمه و نمایش کارت‌ها: '+({features:'خدمات',products:'محصولات',skills:'مهارت‌ها',whyme:'چرا من؟',contactCards:'تماس',socials:'شبکه‌های اجتماعی',projects:'پروژه‌ها'}[list]));
        const note=document.createElement('p'); note.className='cms-note'; note.textContent='افزودن، حذف، تصویر و متن فارسی کارت‌ها در ابزار مدیریت پایین همین بخش است. ترجمه انگلیسی و نمایش هر کارت را اینجا تنظیم کنید.'; details.append(note);
        (SITE[list] || []).forEach(item=>{
            const card=contentDetails(item.title || item.name || String(item.id));
            card.append(contentToggle(section,`item:${list}:${item.id}`,'نمایش این کارت'));
            const fields=Object.keys(item).filter(key=>CONTENT_FIELD_LABELS[key] && !['image','price'].includes(key));
            const defaults=(CONTENT_ITEMS_EN[list] || [])[item.id-1] || {};
            fields.forEach(field=>{
                const original=(DEFAULT_DATA[list] || []).find(x=>x.id===item.id);
                const unchanged=original && JSON.stringify(original[field])===JSON.stringify(item[field]);
                let value=SITE.itemTranslations[list]?.[item.id]?.[field] ?? (unchanged?defaults[field]:undefined) ?? item[field];
                if(Array.isArray(value)) value=value.join('\n');
                card.append(contentInput(section,['itemTranslations',list,String(item.id),field],value,'English — '+CONTENT_FIELD_LABELS[field],{en:true}));
            });
            if(list!=='skills' && list!=='socials') {
                const switches=document.createElement('div'); switches.className='cms-toggle-grid';
                [...new Set(['image',...fields.map(f=>({name:'title',description:'desc'}[f] || f)),...(list==='products'?['price']:[])])].forEach(field=>switches.append(contentToggle(section,`item:${list}:${item.id}:${field}`,'نمایش '+(CONTENT_FIELD_LABELS[field] || field))));
                card.append(switches);
            }
            details.append(card);
        });
        box.append(details);
    });
    if(['header','footer'].includes(section)) renderExtraEditor(section,box);
}
function renderExtraEditor(section,box) {
    const details=contentDetails('متن‌ها و لینک‌های اضافی — افزودن / حذف',true);
    const items=JSON.parse(JSON.stringify(contentValue(section,['extraContent',section],[])));
    const list=document.createElement('div');
    const draw=()=>{
        list.replaceChildren();
        items.forEach((item,index)=>{
            const row=document.createElement('div'); row.className='cms-extra-row';
            [['fa','متن فارسی'],['en','English'],['url','آدرس لینک (اختیاری)']].forEach(([key,label])=>{
                const wrap=document.createElement('label'); wrap.className='cms-field'; wrap.textContent=label;
                const input=document.createElement('input'); input.value=item[key] || ''; input.dir=key==='fa'?'rtl':'ltr';
                input.addEventListener('input',()=>{item[key]=input.value;contentDraft(section,['extraContent',section],items);}); wrap.append(input);row.append(wrap);
            });
            const toggle=document.createElement('label'); toggle.className='cms-check'; toggle.textContent='فعال';
            const cb=document.createElement('input'); cb.type='checkbox';cb.checked=item.enabled!==false;cb.onchange=()=>{item.enabled=cb.checked;contentDraft(section,['extraContent',section],items);};toggle.append(cb);row.append(toggle);
            const remove=document.createElement('button');remove.type='button';remove.className='btn btn-danger btn-sm';remove.textContent='حذف';remove.onclick=()=>{items.splice(index,1);contentDraft(section,['extraContent',section],items);draw();}; row.append(remove);list.append(row);
        });
    };
    const add=document.createElement('button');add.type='button';add.className='btn btn-outline btn-sm';add.textContent='+ افزودن متن یا لینک';add.onclick=()=>{items.push({id:Date.now(),fa:'',en:'',url:'',enabled:true});contentDraft(section,['extraContent',section],items);draw();};
    draw();details.append(list,add);box.append(details);
}
function refreshContentEditors() {
    Object.keys(CONTENT_SECTIONS).forEach(section=>{if(!contentDrafts.has(section)) renderContentSection(section);});
}
function setupContentAdmin() {
    const tabs=document.getElementById('adminTabs');if(!tabs)return;
    const legacy={home:['features'],shop:['shop'],about:['about','skills','whyme'],contact:['contact'],footer:['socials'],projects:['projects'],header:[]};
    const firstPane=document.querySelector('.admin-pane');
    const anchor=document.createComment('section editors'); firstPane.before(anchor);
    const intro=document.createElement('div');intro.className='cms-intro';intro.innerHTML='<span class="cms-eyebrow">مدیریت محتوای سایت</span><h2>هر بخش، تنظیمات مستقل</h2><p>متن‌های دو زبان، نمایش اجزا و دکمه‌ها را جداگانه ویرایش کنید. پس از ویرایش، «ذخیره این بخش» را بزنید.</p>';tabs.before(intro);
    document.querySelectorAll('.admin-tab,.admin-pane').forEach(el=>el.classList.remove('active'));
    const newTabs=document.createDocumentFragment();
    Object.entries(CONTENT_SECTIONS).forEach(([section,schema],index)=>{
        const tab=document.createElement('button');tab.className='admin-tab'+(!index?' active':'');tab.dataset.tab='content_'+section;tab.textContent=schema.label;newTabs.append(tab);
        const pane=document.createElement('div');pane.className='admin-pane'+(!index?' active':'');pane.dataset.pane='content_'+section;
        const bar=document.createElement('div');bar.className='cms-toolbar';
        const title=document.createElement('h3');title.textContent=schema.label;
        const state=document.createElement('span');state.dataset.contentState=section;state.className='cms-note';state.setAttribute('role','status');state.textContent='تنظیمات مستقل این بخش';
        const save=document.createElement('button');save.className='btn btn-primary btn-sm';save.type='button';save.textContent='ذخیره این بخش';save.dataset.saveSection=section;save.onclick=()=>saveContentSection(section);
        bar.append(title,state,save);pane.append(bar);
        const editor=document.createElement('div');editor.dataset.contentEditor=section;pane.append(editor);anchor.parentElement.insertBefore(pane,anchor);
        (legacy[section] || []).forEach(old=>{
            const oldPane=document.querySelector(`[data-pane="${old}"]`); const oldTab=document.querySelector(`[data-tab="${old}"]`);
            if(oldPane) {oldPane.classList.remove('admin-pane','active');oldPane.classList.add('cms-legacy-panel');pane.append(oldPane);}
            if(oldTab) oldTab.remove();
        });
        tab.addEventListener('click',()=>renderContentSection(section));
    });
    tabs.prepend(newTabs);
    // Superseded global editors remain mounted for backwards-compatible handlers,
    // but there is only one visible editor for each setting.
    ['texts','visibility'].forEach(key=>{
        document.querySelector(`[data-tab="${key}"]`)?.remove();
        const old=document.querySelector(`[data-pane="${key}"]`); if(old) {old.classList.remove('admin-pane');old.hidden=true;}
    });
    const shopStatus=document.getElementById('shopToggle')?.closest('.admin-card');
    if(shopStatus) document.querySelector('[data-content-editor="shop"]').before(shopStatus);
    const oldAbout=document.querySelector('.about-editor-card');if(oldAbout) oldAbout.hidden=true;
    const home=document.querySelector('[data-pane="content_home"]');
    const heroPhoto=document.getElementById('heroPhotoPreview')?.closest('.about-photo-item');
    if(heroPhoto) {const card=document.createElement('div');card.className='admin-card';card.append(heroPhoto);home.append(card);}
    window.addEventListener('beforeunload',e=>{if(contentDrafts.size){e.preventDefault();e.returnValue='';}});
    window.addEventListener('site:sync',e=>{
        if(e.detail.type==='push:ok') document.querySelectorAll('[data-content-state]').forEach(el=>{if(!contentDrafts.has(el.dataset.contentState))el.textContent='ذخیره و همگام‌سازی شد';});
    });
}
setupContentAdmin();
