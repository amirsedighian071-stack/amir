// ========== Amir Sedighian Website - Full App (with Cart & Telegram) ==========
const STORAGE_KEY = 'amir_site_data_v2';
const CART_KEY = 'amir_cart';

const DEFAULT_DATA = {
    auth: { username: 'admin', password: 'admin123' },

    // Telegram config for sending orders to admin
    telegram: { botToken: '', chatId: '', botUsername: '', cardNumber: '', cardHolder: '' },

    shopEnabled: true,
    products: [
        { id: 1, name: 'هاست لینوکس حرفه‌ای', category: 'hosting', price: 250000, unit: 'ماهانه', icon: 'fas fa-server', badge: 'hot',
          description: 'هاست پرسرعت SSD با پشتیبانی ۲۴ ساعته',
          longDescription: 'این سرویس مناسب وب‌سایت‌هایی است که به پایداری و سرعت بالا نیاز دارند. با استفاده از جدیدترین سخت‌افزارهای SSD و کشینگ پیشرفته، سایت شما با بهترین سرعت در دسترس بازدیدکنندگان خواهد بود.\n\nویژگی‌ها:\n• نصب رایگان کنترل پنل\n• بک‌آپ روزانه خودکار\n• گواهی SSL رایگان\n• پشتیبانی ۲۴ ساعته از طریق تلگرام\n• ضمانت بازگشت وجه ۷ روزه',
          features: ['فضای ۵ گیگابایت SSD', 'پهنای باند نامحدود', 'گواهی SSL رایگان', 'پشتیبانی ۲۴/۷'] },
        { id: 2, name: 'دامنه .ir', category: 'domain', price: 150000, unit: 'سالانه', icon: 'fas fa-globe', badge: 'new',
          description: 'ثبت دامنه .ir با قیمت مناسب',
          longDescription: 'ثبت دامنه .ir با کمترین قیمت و تحویل فوری. پس از ثبت، دسترسی کامل DNS و مدیریت دامنه در اختیار شما قرار می‌گیرد.',
          features: ['ثبت فوری', 'مدیریت DNS کامل', 'قفل انتقال', 'تجدید آسان'] },
        { id: 3, name: 'سرور مجازی ایران', category: 'server', price: 750000, unit: 'ماهانه', icon: 'fas fa-hdd', badge: 'hot',
          description: 'سرور مجازی با پینگ پایین و آپتایم بالا',
          longDescription: 'سرور مجازی ایران با آی‌پی ثابت و پینگ بسیار مناسب برای کاربران داخل کشور. مناسب میزبانی سایت، ربات تلگرام و سرویس‌های داخلی.',
          features: ['۱ هسته پردازنده', 'رم ۲ گیگابایت', 'فضای ۲۰ گیگ SSD', 'آی‌پی ثابت'] },
        { id: 4, name: 'کانفیگ V2Ray – ۱ ماهه', category: 'vpn', price: 120000, unit: 'ماهانه', icon: 'fas fa-shield-alt', badge: 'sale',
          description: 'کانفیگ پرسرعت VLESS با REALITY',
          longDescription: 'کانفیگ VLESS با پروتکل REALITY که یکی از امن‌ترین و پرسرعت‌ترین متدها در حال حاضر است. مناسب کاربرد روزانه و بدون قطعی.',
          features: ['VLESS + REALITY', 'بدون محدودیت حجم', 'چینش اختصاصی', 'همه اپراتورها'] },
        { id: 5, name: 'هاست وردپرس', category: 'hosting', price: 350000, unit: 'ماهانه', icon: 'fab fa-wordpress', badge: '',
          description: 'هاست بهینه شده برای وردپرس',
          longDescription: 'هاست مخصوص وردپرس با LiteSpeed Cache و تنظیمات بهینه. نصب خودکار وردپرس، بک‌آپ روزانه و ضد بدافزار از امکانات این سرویس است.',
          features: ['نصب خودکار وردپرس', 'کش LiteSpeed', 'بک‌آپ روزانه', 'ضد بدافزار'] },
        { id: 6, name: 'دامنه .com', category: 'domain', price: 850000, unit: 'سالانه', icon: 'fas fa-globe-americas', badge: '',
          description: 'ثبت دامنه بین‌المللی .com',
          longDescription: 'ثبت دامنه بین‌المللی .com با بهترین قیمت. مناسب کسب‌وکارهای بین‌المللی و پروژه‌های جهانی.',
          features: ['ثبت بین‌المللی', 'WHOIS Privacy', 'مدیریت کامل', 'قابل انتقال'] },
        { id: 7, name: 'سرور مجازی آلمان', category: 'server', price: 1200000, unit: 'ماهانه', icon: 'fas fa-network-wired', badge: 'new',
          description: 'سرور مجازی لوکیشن آلمان',
          longDescription: 'سرور مجازی آلمان با کیفیت بالا و پورت ۱ گیگ. مناسب ترید، کانفیگ VPN و سرویس‌های بین‌المللی.',
          features: ['۲ هسته پردازنده', 'رم ۴ گیگابایت', 'فضای ۵۰ گیگ NVMe', 'پورت ۱ گیگ'] },
        { id: 8, name: 'کانفیگ Trojan – ۳ ماهه', category: 'vpn', price: 300000, unit: 'سه ماهه', icon: 'fas fa-user-shield', badge: '',
          description: 'کانفیگ Trojan با gRPC',
          longDescription: 'کانفیگ Trojan با gRPC روی سرور تمیز، پرسرعت و با پایداری بالا. با خرید سه‌ماهه تخفیف ویژه دریافت می‌کنید.',
          features: ['Trojan + gRPC', 'آی‌پی تمیز', 'چند کاربره', 'ضد فیلتر'] }
    ],

    visible: {
        hero: true, features: true, shopPreview: true, cta_home: true,
        shopPage: true, projects: true, about: true, skills: true, whyme: true,
        contactInfo: true, contactForm: true, stats: true, footer: true
    },

    texts: {
        brand: 'AmirSedighian',
        hero_badge: 'برنامه‌نویس فول‌استک و مهندس زیرساخت',
        hero_title_before: 'امیر', hero_title_grad: 'صدیقیان',
        hero_subtitle: 'سلام 👋 امیر صدیقیان هستم، توسعه‌دهنده فول‌استک وب و متخصص ربات‌های تلگرام. طراحی و توسعه وب‌سایت‌های مدرن، ربات‌های دو زبانه با پنل ادمین و راهکارهای زیرساختی مبتنی بر کلادفلر رو انجام می\u200Cدم.',
        stats_projects: 'پروژه موفق', stats_years: 'سال تجربه', stats_clients: 'مشتری راضی',
        features_title: 'خدمات من', features_subtitle: 'خدمات حرفه\u200Cای در حوزه توسعه و زیرساخت',
        shopPreview_title: 'محصولات پر فروش', shopPreview_subtitle: 'نمونه\u200Cای از سرویس\u200Cهای ارائه شده در فروشگاه', shopPreview_btn: 'مشاهده همه محصولات',
        cta_home_title: 'پروژه\u200Cای دارید که می\u200Cخواهید بسازیم؟', cta_home_desc: 'همین حالا با من در ارتباط باشید تا درباره جزئیات پروژه صحبت کنیم.', cta_home_btn: 'شروع گفتگو',
        shopPage_title: 'فروشگاه', shopPage_subtitle: 'خرید هاست، دامنه، سرور مجازی و کانفیگ\u200Cهای VPN پرسرعت با بهترین کیفیت و پشتیبانی.',
        shopCta_title: 'سرویس دلخواه خود را پیدا نکردید؟', shopCta_desc: 'برای سفارش کانفیگ اختصاصی یا مشاوره رایگان با من در تماس باشید.',
        projects_title: 'نمونه\u200Cکارها', projects_subtitle: 'برخی از پروژه\u200Cهای انجام شده.',
        projectsCta_title: 'پروژه مشابهی می\u200Cخواهید؟', projectsCta_desc: 'با توضیح پروژه\u200Cی خود با من تماس بگیرید تا بهترین راهکار را ارائه دهم.', projectsCta_btn: 'درخواست پروژه',
        about_title: 'درباره من', about_subtitle: 'آشنایی بیشتر با امیر صدیقیان.',
        about_name: 'امیر صدیقیان',
        about_intro: 'با بیش از ۵ سال تجربه در حوزه توسعه نرم\u200Cافزار و مهندسی زیرساخت، در زمینه\u200Cهای زیر فعالیت و تخصص دارم:',
        about_years: '۵+',
        about_block1_title: 'توسعه نرم\u200Cافزار و وب', about_block1_desc: 'برنامه\u200Cنویس فول\u200Cاستک وب و متخصص ربات\u200Cهای تلگرام (به\u200Cویژه ربات\u200Cهای دو زبانه با پنل ادمین تحت وب با استفاده از React، Tailwind CSS، Cloudflare Workers و Cloudflare KV).',
        about_block2_title: 'مهندسی زیرساخت و شبکه', about_block2_desc: 'مهندس زیرساخت کلادفلر و علاقه\u200Cمند به شبکه\u200Cهای امن و پروتکل\u200Cهای V2Ray (مانند VLESS، VMess، Trojan با REALITY و gRPC) و ابزارهای مدیریت سرور.',
        about_block3_title: 'زبان\u200Cهای برنامه\u200Cنویسی', about_block3_desc: 'مسلط به پایتون، جاوا اسکریپت، تایپ\u200Cاسکریپت، HTML، CSS و PHP.',
        skills_title: 'مهارت\u200Cها',
        whyme_title: 'چرا همکاری با من؟', whyme_subtitle: 'چیزی که کار من رو متمایز می\u200Cکنه',
        contact_title: 'تماس با من', contact_subtitle: 'برای سفارش پروژه، مشاوره و یا سوالات خود از راه\u200Cهای زیر با من در ارتباط باشید.',
        contactForm_title: 'ارسال پیام', contact_name: 'نام و نام خانوادگی', contact_email: 'ایمیل', contact_phone: 'شماره تماس', contact_subject: 'موضوع', contact_message: 'پیام شما', contact_send: 'ارسال پیام',
        formSuccess: '✓ پیام شما با موفقیت ارسال شد. به زودی پاسخ خواهم داد.',
        shopDisabled_title: 'فروشگاه در حال بروزرسانی است', shopDisabled_desc: 'صبور باشید، به زودی با محصولات جدید برمی\u200Cگردیم.', shopDisabled_extra: 'برای سفارش با پشتیبانی در ارتباط باشید.',
        copyrightName: 'امیر صدیقیان', footer_about: 'توسعه\u200Cدهنده فول\u200Cاستک و مهندس زیرساخت.',
        // Shop/cart texts
        addToCart: 'افزودن به سبد خرید', viewCart: 'مشاهده سبد خرید', cartTitle: 'سبد خرید', cartEmpty: 'سبد خرید شما خالی است',
        goToShop: 'بازدید از فروشگاه', cartTotal: 'مبلغ کل', completeOrder: 'تکمیل خرید', continueShopping: 'ادامه خرید',
        checkoutTitle: 'تکمیل سفارش', checkoutDesc: 'اطلاعات خود را وارد کنید تا فاکتور به تلگرام ادمین ارسال شود.',
        yourName: 'نام و نام خانوادگی *', yourPhone: 'شماره تماس (تلگرام) *', yourEmail: 'ایمیل (اختیاری)',
        orderNote: 'یادداشت (اختیاری)', sendOrder: 'ارسال سفارش',
        orderSuccess: '✓ سفارش شما با موفقیت ثبت شد! به زودی با شما تماس می\u200Cگیریم.',
        orderError: 'خطا در ارسال سفارش. لطفاً دوباره تلاش کنید یا مستقیماً از تلگرام با ما در ارتباط باشید.',
        cartAdded: 'به سبد خرید اضافه شد', detailsProduct: 'مشاهده جزئیات'
    },

    aboutPhoto: '', heroPhoto: '',
    socials: [
        { id: 1, name: 'تلگرام', icon: 'fab fa-telegram', url: 'https://t.me/amirsedighian', color: '#0088cc' },
        { id: 2, name: 'گیت\u200Cهاب', icon: 'fab fa-github', url: 'https://github.com/amirsedighian', color: '#24292e' },
        { id: 3, name: 'ایمیل', icon: 'fas fa-envelope', url: 'mailto:contact@amirsedighian.ir', color: '#ea4335' }
    ],
    features: [
        { id: 1, icon: 'fas fa-laptop-code', title: 'توسعه وب', desc: 'طراحی و توسعه وب\u200Cسایت\u200Cهای مدرن فول\u200Cاستک با React، Tailwind و فناوری\u200Cهای روز دنیا.' },
        { id: 2, icon: 'fab fa-telegram', title: 'ربات\u200Cهای تلگرام', desc: 'ساخت ربات\u200Cهای تلگرام دو زبانه با پنل ادمین وب، مبتنی بر Cloudflare Workers و KV.' },
        { id: 3, icon: 'fas fa-server', title: 'مدیریت سرور', desc: 'پیکربندی، مدیریت و بهینه\u200Cسازی سرور با تمرکز بر امنیت و پایداری سرویس\u200Cها.' },
        { id: 4, icon: 'fas fa-shield-alt', title: 'شبکه\u200Cهای امن', desc: 'کانفیگ پروتکل\u200Cهای V2Ray شامل VLESS، VMess، Trojan با REALITY و gRPC.' },
        { id: 5, icon: 'fas fa-cloud', title: 'زیرساخت کلاد', desc: 'پیاده\u200Cسازی و مدیریت زیرساخت روی Cloudflare با Workers، KV و R2.' },
        { id: 6, icon: 'fas fa-headset', title: 'پشتیبانی ۲۴/۷', desc: 'پشتیبانی مداوم و مشاوره تخصصی در تمام مراحل پروژه و پس از تحویل.' }
    ],
    whyme: [
        { id: 1, icon: 'fas fa-medal', title: 'کیفیت محور', desc: 'تمام پروژه\u200Cها با رعایت بهترین استانداردها و کیفیت بالا تحویل داده می\u200Cشوند.' },
        { id: 2, icon: 'fas fa-clock', title: 'تحویل به موقع', desc: 'تعهد به زمان\u200Cبندی پروژه یکی از مهم\u200Cترین اصول کاری من است.' },
        { id: 3, icon: 'fas fa-comments', title: 'ارتباط مستمر', desc: 'در تمام مراحل پروژه در جریان پیشرفت کار قرار خواهید گرفت.' },
        { id: 4, icon: 'fas fa-chart-line', title: 'مقیاس\u200Cپذیری', desc: 'کدها به\u200Cگونه\u200Cای نوشته می\u200Cشوند که در آینده به\u200Cراحتی قابل گسترش باشند.' },
        { id: 5, icon: 'fas fa-book', title: 'مستندسازی', desc: 'تحویل مستندات کامل فنی و راهنمای استفاده برای هر پروژه.' },
        { id: 6, icon: 'fas fa-life-ring', title: 'پشتیبانی پس از تحویل', desc: 'پس از راه\u200Cاندازی پروژه هم کنار شما هستم و پشتیبانی می\u200Cکنم.' }
    ],
    skills: [
        { id: 1, icon: 'fab fa-python', name: 'Python' }, { id: 2, icon: 'fab fa-js', name: 'JavaScript' },
        { id: 3, icon: 'fas fa-code', name: 'TypeScript' }, { id: 4, icon: 'fab fa-react', name: 'React' },
        { id: 5, icon: 'fab fa-html5', name: 'HTML5' }, { id: 6, icon: 'fab fa-css3-alt', name: 'CSS3' },
        { id: 7, icon: 'fab fa-php', name: 'PHP' }, { id: 8, icon: 'fas fa-cloud', name: 'Cloudflare' },
        { id: 9, icon: 'fab fa-telegram', name: 'Telegram Bot' }, { id: 10, icon: 'fas fa-server', name: 'Linux Server' },
        { id: 11, icon: 'fas fa-shield-alt', name: 'V2Ray' }, { id: 12, icon: 'fab fa-docker', name: 'Docker' }
    ],
    projects: [
        { id: 1, icon: 'fas fa-robot', tag: 'ربات تلگرام', title: 'ربات فروشگاهی دو زبانه', desc: 'ربات تلگرام فروشگاهی با پنل ادمین وب، درگاه پرداخت و پشتیبانی از فارسی و انگلیسی.', tech: 'React,Cloudflare Workers,KV' },
        { id: 2, icon: 'fas fa-globe', tag: 'وب\u200Cسایت', title: 'سایت شرکتی مدرن', desc: 'طراحی و توسعه وب\u200Cسایت شرکتی ریسپانسیو با پنل مدیریت محتوا و SEO بهینه.', tech: 'Next.js,Tailwind,TypeScript' },
        { id: 3, icon: 'fas fa-network-wired', tag: 'زیرساخت', title: 'پنل مدیریت VPN', desc: 'پنل مدیریت کاربران VPN با پشتیبانی از پروتکل\u200Cهای VLESS، VMess و Trojan.', tech: 'Python,Docker,gRPC' },
        { id: 4, icon: 'fas fa-chart-line', tag: 'داشبورد', title: 'داشبورد تحلیلی', desc: 'داشبورد تحلیلی Realtime با نمودارهای تعاملی و گزارش\u200Cگیری خودکار.', tech: 'React,Chart.js,API' },
        { id: 5, icon: 'fas fa-plug', tag: 'API', title: 'API بک\u200Cاند قدرتمند', desc: 'طراحی REST API با احراز هویت JWT، کشینگ و مستندسازی Swagger.', tech: 'Python,FastAPI,Redis' },
        { id: 6, icon: 'fas fa-cloud-upload-alt', tag: 'کلادفلر', title: 'استقرار روی Cloudflare', desc: 'مهاجرت و استقرار کامل زیرساخت روی Cloudflare Pages، Workers و R2.', tech: 'Cloudflare,Workers,R2' },
        { id: 7, icon: 'fas fa-shopping-bag', tag: 'فول\u200Cاستک', title: 'فروشگاه اینترنتی', desc: 'ساخت فروشگاه اینترنتی با سبد خرید، درگاه پرداخت، پنل ادمین و مدیریت سفارش\u200Cها.', tech: 'Next.js,PostgreSQL,Tailwind' },
        { id: 8, icon: 'fas fa-mobile-alt', tag: 'PWA', title: 'وب اپلیکیشن PWA', desc: 'توسعه وب اپلیکیشن پیش\u200Cرونده با قابلیت نصب روی موبایل و کار آفلاین.', tech: 'React,PWA,IndexedDB' },
        { id: 9, icon: 'fas fa-robot', tag: 'هوش مصنوعی', title: 'چت\u200Cبات هوشمند', desc: 'چت\u200Cبات متصل به API هوش مصنوعی با پشتیبانی از چندین زبان و حافظه مکالمه.', tech: 'Python,OpenAI,Telegram' }
    ],
    contactCards: [
        { id: 1, icon: 'fab fa-telegram', title: 'تلگرام', value: '@amirsedighian', url: 'https://t.me/amirsedighian', hint: 'سریع\u200Cترین راه پاسخگویی' },
        { id: 2, icon: 'fas fa-envelope', title: 'ایمیل', value: 'contact@amirsedighian.ir', url: 'mailto:contact@amirsedighian.ir', hint: 'برای مکاتبات رسمی' },
        { id: 3, icon: 'fab fa-github', title: 'گیت\u200Cهاب', value: 'github.com/amirsedighian', url: 'https://github.com/amirsedighian', hint: 'مشاهده پروژه\u200Cهای متن\u200Cباز' },
        { id: 4, icon: 'fas fa-phone', title: 'تماس تلفنی', value: 'هماهنگی از طریق تلگرام', url: '', hint: 'فقط با هماهنگی قبلی' },
        { id: 5, icon: 'fas fa-clock', title: 'ساعت پاسخگویی', value: 'همه روزه ۹ صبح تا ۱۲ شب', url: '', hint: 'پاسخگویی در سریع\u200Cترین زمان ممکن' }
    ],
    messages: [],
    orders: []
};

// ============== Load/Save ==============
function loadData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) { localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA)); return JSON.parse(JSON.stringify(DEFAULT_DATA)); }
    try {
        const d = JSON.parse(raw);
        return Object.assign({}, DEFAULT_DATA, d, {
            auth: Object.assign({}, DEFAULT_DATA.auth, d.auth || {}),
            telegram: Object.assign({}, DEFAULT_DATA.telegram, d.telegram || {}),
            visible: Object.assign({}, DEFAULT_DATA.visible, d.visible || {}),
            texts: Object.assign({}, DEFAULT_DATA.texts, d.texts || {})
        });
    } catch(e) { return JSON.parse(JSON.stringify(DEFAULT_DATA)); }
}
function saveData(opts) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SITE));
    } catch (e) {
        // Uploaded images are stored as base64 and can exceed the ~5MB quota.
        // The server copy is still the source of truth, so don't break the UI.
        console.warn('[site] localStorage write failed (quota?):', e && e.name);
        if (typeof window !== 'undefined') window.__storageFull = true;
    }
    if (!opts || opts.push !== false) pushDataToServer();
}
const SITE = loadData();

// ============== Remote (shared) data sync ==============
// Everything the admin changes is pushed to a serverless store so that ALL
// visitors of the site see the same content, not just the admin's browser.
const SYNC_ENDPOINT = '/.netlify/functions/site-data';
const SYNC_POLL_MS = 15000;
let _pushTimer = null;
let _lastRemoteStamp = 0;
let _syncAvailable = true;

function pushDataToServer() {
    if (!_syncAvailable) { window.__syncOk = false; return; }
    clearTimeout(_pushTimer);
    _pushTimer = setTimeout(async () => {
        try {
            const payload = Object.assign({}, SITE);
            const r = await fetch(SYNC_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: payload })
            });
            if (!r.ok) { _syncAvailable = false; window.__syncOk = false; return; }
            const j = await r.json();
            if (j && j.updatedAt) _lastRemoteStamp = j.updatedAt;
            window.__syncOk = true;
        } catch (e) {
            _syncAvailable = false;
            window.__syncOk = false;
        }
    }, 400);
}

function mergeRemote(remote) {
    if (!remote || typeof remote !== 'object') return false;
    const stamp = remote._updatedAt || 0;
    if (stamp && stamp <= _lastRemoteStamp) return false;
    _lastRemoteStamp = stamp;
    // Never let remote data overwrite local-only concerns (auth session/cart).
    Object.keys(DEFAULT_DATA).forEach(k => {
        if (remote[k] !== undefined) SITE[k] = remote[k];
    });
    SITE.texts = Object.assign({}, DEFAULT_DATA.texts, remote.texts || {});
    SITE.visible = Object.assign({}, DEFAULT_DATA.visible, remote.visible || {});
    SITE.telegram = Object.assign({}, DEFAULT_DATA.telegram, remote.telegram || {});
    SITE.auth = Object.assign({}, DEFAULT_DATA.auth, remote.auth || {});
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(SITE)); } catch (e) { /* quota: server copy still wins */ }
    return true;
}

async function fetchRemoteData() {
    if (!_syncAvailable) return false;
    try {
        const r = await fetch(SYNC_ENDPOINT + '?t=' + Date.now(), { cache: 'no-store' });
        if (!r.ok) { _syncAvailable = false; return false; }
        const j = await r.json();
        if (!j || !j.data) return false;
        return mergeRemote(j.data);
    } catch (e) {
        _syncAvailable = false;
        return false;
    }
}

async function initSync(onUpdate) {
    const changed = await fetchRemoteData();
    if (changed && typeof onUpdate === 'function') onUpdate();
    // If no remote copy exists yet, seed it with what we have.
    if (_syncAvailable && !_lastRemoteStamp) pushDataToServer();
    setInterval(async () => {
        const c = await fetchRemoteData();
        if (c && typeof onUpdate === 'function') onUpdate();
    }, SYNC_POLL_MS);
    // Instant sync between tabs on the same device.
    window.addEventListener('storage', e => {
        if (e.key !== STORAGE_KEY || !e.newValue) return;
        try {
            const d = JSON.parse(e.newValue);
            Object.keys(DEFAULT_DATA).forEach(k => { if (d[k] !== undefined) SITE[k] = d[k]; });
            if (typeof onUpdate === 'function') onUpdate();
        } catch (err) { /* ignore */ }
    });
}

function loadCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '{}'); } catch(e) { return {}; }
}
function saveCart(cart) { localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartBadge(); }
let CART = loadCart();

// ============== Helpers ==============
function toPersianNum(n) {
    if (n===null||n===undefined) return '';
    const p=['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
    return n.toString().replace(/\d/g,d=>p[d]);
}
function formatPrice(n) { return toPersianNum(Number(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g,',')); }
function txt(key) { return SITE.texts[key] || DEFAULT_DATA.texts[key] || key; }
function isVisible(key) { return SITE.visible[key] !== false; }
function nextId(arr) { return arr.length ? Math.max(...arr.map(x => x.id||0))+1 : 1; }
function getProduct(id) { return SITE.products.find(p => p.id === id); }
function cartTotal() {
    return Object.entries(CART).reduce((sum, [pid, qty]) => {
        const p = getProduct(+pid); return sum + (p ? p.price * qty : 0);
    }, 0);
}
function cartCount() {
    return Object.values(CART).reduce((a,b) => a+b, 0);
}

// ============== Theme ==============
function initTheme() {
    const btn = document.getElementById('themeToggle'); if (!btn) return;
    const t = localStorage.getItem('amir_theme')||'light';
    applyTheme(t);
    btn.addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme');
        applyTheme(cur==='dark'?'light':'dark');
    });
}
function applyTheme(theme) {
    const btn = document.getElementById('themeToggle');
    if (theme==='dark') { document.documentElement.setAttribute('data-theme','dark'); if(btn) btn.innerHTML='<i class="fas fa-sun"></i>'; }
    else { document.documentElement.removeAttribute('data-theme'); if(btn) btn.innerHTML='<i class="fas fa-moon"></i>'; }
    localStorage.setItem('amir_theme', theme);
}

// ============== Navbar ==============
function initNavbar() {
    const page = location.pathname.split('/').pop() || 'index.html';
    const map = {'':'home','index.html':'home','shop.html':'shop','projects.html':'projects','about.html':'about','contact.html':'contact'};
    const section = map[page] || 'home';
    document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.getAttribute('data-section')===section));
    const menuBtn = document.getElementById('mobileMenuBtn'), nav = document.getElementById('navMenu');
    if (menuBtn && nav) {
        menuBtn.addEventListener('click', () => {
            nav.classList.toggle('active');
            menuBtn.innerHTML = nav.classList.contains('active') ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });
        document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => {
            nav.classList.remove('active'); if (menuBtn) menuBtn.innerHTML='<i class="fas fa-bars"></i>';
        }));
    }
    const nb = document.getElementById('navbar');
    if (nb) window.addEventListener('scroll', () => nb.classList.toggle('scrolled', window.scrollY>20));
    if (!isVisible('footer')) { const f=document.querySelector('.footer'); if(f) f.style.display='none'; }
}

// ============== Shop renderer ==============
const CAT_NAME_MAP = {hosting:'هاست',domain:'دامنه',server:'سرور',vpn:'VPN'};
function renderShop(container, opts={}) {
    if (!container) return;
    const { category='all', limit=0, showFilters=true } = opts;
    if (!SITE.shopEnabled) {
        container.innerHTML = `<div class="shop-disabled"><i class="fas fa-tools"></i><h3>${txt('shopDisabled_title')}</h3><p>${txt('shopDisabled_desc')}</p><p style="margin-top:1rem;font-size:0.85rem;color:var(--text-muted);">${txt('shopDisabled_extra')} <a href="contact.html" style="color:var(--primary);">تماس با پشتیبانی</a></p></div>`;
        return;
    }
    const cats=[{id:'all',name:'همه'},{id:'hosting',name:'هاست'},{id:'domain',name:'دامنه'},{id:'server',name:'سرور'},{id:'vpn',name:'VPN'}];
    let list = category==='all' ? SITE.products : SITE.products.filter(p=>p.category===category);
    if (limit>0) list=list.slice(0,limit);
    const badges={hot:'<span class="product-badge badge-hot">داغ</span>',new:'<span class="product-badge badge-new">جدید</span>',sale:'<span class="product-badge badge-sale">تخفیف</span>'};
    let html='';
    if (showFilters && limit===0) {
        html += `<div class="shop-categories">${cats.map(c=>`<button class="shop-cat-btn ${c.id===category?'active':''}" data-cat="${c.id}">${c.name}</button>`).join('')}</div>`;
    }
    html += `<div class="products-grid">${list.map(p=>`
        <div class="product-card" data-pid="${p.id}">
            ${badges[p.badge]||''}
            <div class="product-image${p.image?' has-photo':''}">${p.image?`<img src="${p.image}" alt="${p.name}" loading="lazy">`:`<i class="${p.icon}"></i>`}</div>
            <div class="product-body">
                <div class="product-cat">${CAT_NAME_MAP[p.category]||''}</div>
                <h3 class="product-title">${p.name}</h3>
                <p class="product-desc">${p.description||''}</p>
                <ul class="product-features">${(p.features||[]).slice(0,3).map(f=>`<li><i class="fas fa-check-circle"></i> ${f}</li>`).join('')}</ul>
                <div class="product-footer">
                    <div class="product-price"><span class="price-amount">${formatPrice(p.price)}</span><span class="price-unit">تومان / ${p.unit}</span></div>
                    <button class="btn btn-primary btn-sm" data-quick="${p.id}"><i class="fas fa-cart-plus"></i> خرید</button>
                </div>
            </div>
        </div>`).join('')}</div>`;
    container.innerHTML = html;
    container.querySelectorAll('.shop-cat-btn').forEach(b=>b.addEventListener('click',()=>renderShop(container,{category:b.getAttribute('data-cat'),showFilters:true})));
    container.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', e => {
            if (e.target.closest('[data-quick]')) return;
            openProductDetail(+card.dataset.pid);
        });
    });
    container.querySelectorAll('[data-quick]').forEach(b=>b.addEventListener('click', e=>{
        e.stopPropagation();
        openProductDetail(+b.dataset.quick);
    }));
}
function refreshShopEverywhere() {
    document.querySelectorAll('[data-role="shop-grid"]').forEach(el => {
        renderShop(el, {category:'all', limit:parseInt(el.dataset.limit)||0, showFilters:el.dataset.showFilters!=='false'});
    });
}

// ============== Product Detail Modal ==============
let currentDetailQty = 1;
let currentDetailPid = null;
function openProductDetail(pid) {
    const p = getProduct(pid); if (!p) return;
    currentDetailPid = pid; currentDetailQty = CART[pid] || 1;
    const badges={hot:'داغ',new:'جدید',sale:'تخفیف'};
    const overlay = document.getElementById('productModal') || createProductModal();
    const icon = overlay.querySelector('.product-detail-icon');
    icon.classList.toggle('has-photo', !!p.image);
    icon.innerHTML = `${p.badge?`<span class="product-badge badge-${p.badge}">${badges[p.badge]}</span>`:''}${p.image?`<img src="${p.image}" alt="${p.name}">`:`<i class="${p.icon}"></i>`}`;
    overlay.querySelector('.product-detail-cat').textContent = CAT_NAME_MAP[p.category]||'';
    overlay.querySelector('.product-detail-title').textContent = p.name;
    overlay.querySelector('.product-detail-desc').textContent = p.description||'';
    overlay.querySelector('.product-detail-long').textContent = p.longDescription||'';
    overlay.querySelector('.product-detail-long').style.display = p.longDescription ? 'block' : 'none';
    overlay.querySelector('.pd-price').textContent = formatPrice(p.price);
    overlay.querySelector('.pd-unit').textContent = `تومان / ${p.unit}`;
    overlay.querySelector('.product-detail-features').innerHTML = (p.features||[]).map(f=>`<li><i class="fas fa-check-circle"></i> ${f}</li>`).join('');
    const qtyInput = overlay.querySelector('.qty-input');
    qtyInput.value = currentDetailQty;
    updateDetailTotal();
    overlay.classList.add('active');
    document.body.style.overflow='hidden';
}
function updateDetailTotal() {
    const p = getProduct(currentDetailPid); if(!p) return;
    const q = parseInt(document.querySelector('.qty-input').value)||1;
    document.querySelector('.pd-total-qty').textContent = toPersianNum(q);
    document.querySelector('.pd-total-price').textContent = formatPrice(p.price*q);
}
function createProductModal() {
    const div = document.createElement('div');
    div.className = 'overlay';
    div.id = 'productModal';
    div.innerHTML = `
        <div class="modal-lg">
            <button class="modal-close" data-close><i class="fas fa-times"></i></button>
            <div class="product-detail">
                <div class="product-detail-icon"></div>
                <div class="product-detail-body">
                    <div class="product-detail-cat"></div>
                    <h2 class="product-detail-title"></h2>
                    <p class="product-detail-desc"></p>
                    <div class="product-detail-long"></div>
                    <ul class="product-detail-features"></ul>
                    <div class="product-detail-pricebox">
                        <div class="product-detail-price">
                            <span class="price-amount pd-price"></span>
                            <span class="price-unit pd-unit"></span>
                        </div>
                        <div style="display:flex;align-items:center;gap:1rem;">
                            <span style="font-size:0.85rem;color:var(--text-secondary);">تعداد:</span>
                            <div class="qty-control">
                                <button type="button" data-qty="minus"><i class="fas fa-minus"></i></button>
                                <input type="number" class="qty-input" min="1" value="1">
                                <button type="button" data-qty="plus"><i class="fas fa-plus"></i></button>
                            </div>
                        </div>
                    </div>
                    <p style="font-size:0.9rem;margin-bottom:0.5rem;">جمع نهایی: <span class="pd-total-qty" style="font-weight:700;color:var(--primary);">۱</span> عدد = <strong class="pd-total-price" style="color:var(--primary);">-</strong></p>
                    <div class="detail-actions">
                        <button class="btn btn-primary" id="addCartBtn"><i class="fas fa-cart-plus"></i> ${txt('addToCart')}</button>
                        <button class="btn btn-outline" id="viewCartBtn" data-close><i class="fas fa-shopping-basket"></i> ${txt('viewCart')}</button>
                    </div>
                </div>
            </div>
        </div>`;
    document.body.appendChild(div);
    div.addEventListener('click', e => { if (e.target===div || e.target.hasAttribute('data-close')) { closeProductModal(); } });
    div.querySelector('[data-qty="plus"]').addEventListener('click', () => { const i=div.querySelector('.qty-input'); i.value=Math.max(1,(parseInt(i.value)||1)+1); updateDetailTotal(); });
    div.querySelector('[data-qty="minus"]').addEventListener('click', () => { const i=div.querySelector('.qty-input'); i.value=Math.max(1,(parseInt(i.value)||1)-1); updateDetailTotal(); });
    div.querySelector('.qty-input').addEventListener('input', () => { const i=div.querySelector('.qty-input'); if(parseInt(i.value)<1)i.value=1; updateDetailTotal(); });
    div.querySelector('#addCartBtn').addEventListener('click', () => {
        const q = parseInt(div.querySelector('.qty-input').value)||1;
        addToCart(currentDetailPid, q);
        showToast(txt('cartAdded'));
        closeProductModal();
    });
    div.querySelector('#viewCartBtn').addEventListener('click', () => { closeProductModal(); openCart(); });
    return div;
}
function closeProductModal() {
    const m = document.getElementById('productModal'); if(m)m.classList.remove('active');
    document.body.style.overflow='';
}

// ============== Cart ==============
function addToCart(pid, qty=1) {
    CART[pid] = (CART[pid]||0) + qty;
    saveCart(CART);
}
function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    const floatBtn = document.getElementById('cartFloat');
    const count = cartCount();
    if (badge) {
        badge.textContent = toPersianNum(count);
        badge.style.display = count>0 ? 'flex' : 'none';
    }
    if (floatBtn) floatBtn.style.display = count>0 ? 'flex' : 'none';
}
function createCartUI() {
    if (document.getElementById('cartFloat')) return;
    const btn = document.createElement('button');
    btn.className = 'cart-float'; btn.id = 'cartFloat'; btn.title = txt('cartTitle');
    btn.innerHTML = `<i class="fas fa-shopping-cart"></i><span class="cart-badge" id="cartBadge">0</span>`;
    btn.addEventListener('click', openCart);
    btn.style.display = 'none';
    document.body.appendChild(btn);
    updateCartBadge();
}
function openCart() {
    const overlay = document.getElementById('cartModal') || createCartModal();
    renderCartItems();
    overlay.classList.add('active');
    document.body.style.overflow='hidden';
}
function closeCart() { const m = document.getElementById('cartModal'); if(m)m.classList.remove('active'); document.body.style.overflow=''; }
function createCartModal() {
    const div = document.createElement('div');
    div.className='overlay'; div.id='cartModal';
    div.innerHTML = `
        <div class="modal-md">
            <button class="modal-close" data-close><i class="fas fa-times"></i></button>
            <div class="cart-header"><h2><i class="fas fa-shopping-basket"></i> ${txt('cartTitle')}</h2></div>
            <div class="cart-body" id="cartBody"></div>
            <div class="cart-footer">
                <div class="cart-total"><span>${txt('cartTotal')}:</span><span class="cart-total-price" id="cartTotal">0</span></div>
                <div class="cart-actions">
                    <button class="btn btn-outline btn-sm" data-close>${txt('continueShopping')}</button>
                    <button class="btn btn-primary btn-sm" id="checkoutBtn"><i class="fas fa-credit-card"></i> ${txt('completeOrder')}</button>
                </div>
            </div>
        </div>`;
    document.body.appendChild(div);
    div.addEventListener('click', e => { if(e.target===div||e.target.hasAttribute('data-close')) closeCart(); });
    div.querySelector('#checkoutBtn').addEventListener('click', () => { closeCart(); openCheckout(); });
    return div;
}
function renderCartItems() {
    const body = document.getElementById('cartBody');
    const items = Object.entries(CART);
    if (!items.length) {
        body.innerHTML = `<div class="cart-empty"><i class="fas fa-shopping-cart"></i><p>${txt('cartEmpty')}</p><a href="shop.html" class="btn btn-primary btn-sm" style="margin-top:1rem;display:inline-flex;" data-close><i class="fas fa-store"></i> ${txt('goToShop')}</a></div>`;
        document.getElementById('cartTotal').textContent = toPersianNum(0);
        return;
    }
    body.innerHTML = items.map(([pid,qty]) => {
        const p = getProduct(+pid); if(!p) return '';
        return `<div class="cart-item">
            <div class="cart-item-icon${p.image?' has-photo':''}">${p.image?`<img src="${p.image}" alt="${p.name}">`:`<i class="${p.icon}"></i>`}</div>
            <div class="cart-item-info">
                <h4>${p.name}</h4>
                <span>${toPersianNum(qty)} × ${formatPrice(p.price)} تومان</span>
            </div>
            <div class="cart-item-price">${formatPrice(p.price*qty)} تومان</div>
            <button class="cart-item-remove" data-remove="${p.id}" title="حذف"><i class="fas fa-trash"></i></button>
        </div>`;
    }).join('');
    document.getElementById('cartTotal').textContent = formatPrice(cartTotal()) + ' تومان';
    body.querySelectorAll('[data-remove]').forEach(b => b.addEventListener('click', () => {
        delete CART[b.dataset.remove]; saveCart(CART); renderCartItems(); updateCartBadge();
    }));
}

// ============== Checkout ==============
function openCheckout() {
    if (Object.keys(CART).length === 0) { showToast(txt('cartEmpty'),'error'); return; }
    const overlay = document.getElementById('checkoutModal') || createCheckoutModal();
    renderCheckoutSummary();
    overlay.classList.add('active');
    document.body.style.overflow='hidden';
}
function closeCheckout() { const m = document.getElementById('checkoutModal'); if(m)m.classList.remove('active'); document.body.style.overflow=''; }
function createCheckoutModal() {
    const div = document.createElement('div');
    div.className='overlay'; div.id='checkoutModal';
    div.innerHTML = `
        <div class="modal-md">
            <button class="modal-close" data-close><i class="fas fa-times"></i></button>
            <div class="checkout-header">
                <h2><i class="fas fa-file-invoice"></i> ${txt('checkoutTitle')}</h2>
                <p>${txt('checkoutDesc')}</p>
            </div>
            <form id="checkoutForm" class="checkout-body">
                <div class="order-summary" id="orderSummary"></div>
                <div class="form-group"><label>${txt('yourName')}</label><input type="text" id="chName" required></div>
                <div class="form-group"><label>${txt('yourPhone')}</label><input type="tel" id="chPhone" required placeholder="مثلاً ۰۹۱۲۳۴۵۶۷۸۹"></div>
                <div class="form-group"><label>${txt('yourEmail')}</label><input type="email" id="chEmail"></div>
                <div class="form-group"><label>${txt('orderNote')}</label><textarea id="chNote" rows="3"></textarea></div>
                <div id="checkoutMsg"></div>
                <button type="submit" class="btn btn-primary btn-block"><i class="fab fa-telegram"></i> ${txt('sendOrder')}</button>
            </form>
        </div>`;
    document.body.appendChild(div);
    div.addEventListener('click', e => { if(e.target===div||e.target.hasAttribute('data-close')) closeCheckout(); });
    div.querySelector('#checkoutForm').addEventListener('submit', handleCheckoutSubmit);
    return div;
}
function renderCheckoutSummary() {
    const items = Object.entries(CART);
    let total = 0;
    let html = `<h4>خلاصه سفارش</h4>`;
    items.forEach(([pid,qty]) => {
        const p = getProduct(+pid); if(!p) return;
        total += p.price*qty;
        html += `<div class="order-item"><span>${p.name} × ${toPersianNum(qty)}</span><span>${formatPrice(p.price*qty)} تومان</span></div>`;
    });
    html += `<div class="order-item"><span>جمع کل</span><span>${formatPrice(total)} تومان</span></div>`;
    document.getElementById('orderSummary').innerHTML = html;
}
async function handleCheckoutSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('chName').value.trim();
    const phone = document.getElementById('chPhone').value.trim();
    const email = document.getElementById('chEmail').value.trim();
    const note = document.getElementById('chNote').value.trim();
    const msgBox = document.getElementById('checkoutMsg');
    const btn = e.target.querySelector('button[type=submit]');
    btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال ثبت...';

    const invoiceId = 'ORD-' + Date.now().toString(36).toUpperCase();
    const items = Object.entries(CART).map(([pid,qty]) => {
        const p = getProduct(+pid);
        return { pid: p.id, name: p.name, qty, price: p.price, icon: p.icon };
    });
    const total = cartTotal();

    const order = { id: invoiceId, name, phone, email, note, items, total, date: new Date().toISOString(),
      botUsername: SITE.telegram.botUsername || '' };
    SITE.orders = SITE.orders || [];

    // Try serverless endpoint (Netlify) first; falls back to localStorage-only
    let serverResp = null;
    try {
        const r = await fetch('/.netlify/functions/create-order', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(order)
        });
        if (r.ok) serverResp = await r.json();
    } catch(err) { /* no server, fall through */ }

    // Fallback: store locally and attempt direct send (if token configured)
    if (!serverResp) {
        SITE.orders.push({...order, sent: false});
        saveData();
    } else {
        SITE.orders.push({...order, sent: true});
        saveData();
    }

    btn.disabled = false;
    msgBox.className = 'form-message success';
    msgBox.textContent = '✓ سفارش شما ثبت شد! در حال انتقال به ربات تلگرام...';

    CART = {}; saveCart(CART);

    setTimeout(() => {
        closeCheckout();
        document.getElementById('checkoutForm').reset();
        msgBox.className = ''; msgBox.textContent='';
        // Redirect to Telegram bot
        if (serverResp && serverResp.telegramUrl) {
            window.location.href = serverResp.telegramUrl;
        } else if (SITE.socials) {
            // fallback to admin telegram
            const tg = SITE.socials.find(s => s.icon && s.icon.includes('telegram'));
            if (tg && tg.url) window.location.href = tg.url;
            else showToast('برای پیگیری سفارش از طریق تلگرام با ما در ارتباط باشید.');
        }
    }, 2000);
}

// ============== Toast ==============
function showToast(text, type='success') {
    let t = document.getElementById('toast');
    if (!t) {
        t = document.createElement('div');
        t.className = 'toast'; t.id='toast';
        document.body.appendChild(t);
    }
    t.innerHTML = `<i class="fas fa-${type==='error'?'exclamation-circle':'check-circle'}"></i> ${text}`;
    t.className = `toast ${type} show`;
    setTimeout(()=>t.classList.remove('show'), 2500);
}

// ============== Socials & Contact form & Counters (same as before) ==============
function renderSocials() {
    document.querySelectorAll('[data-role="socials"]').forEach(c => {
        c.innerHTML = SITE.socials.map(s => `<a href="${s.url||'#'}" ${s.url&&s.url.startsWith('http')?'target="_blank"':''} title="${s.name}"><i class="${s.icon}"></i></a>`).join('');
    });
}
function initContactForm() {
    const form = document.getElementById('contactForm'); if (!form) return;
    const msg = document.getElementById('formMessage');
    form.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('cName')?.value || '';
        const email = document.getElementById('cEmail')?.value || '';
        const phone = document.getElementById('cPhone')?.value || '';
        const subject = document.getElementById('cSubject')?.value || '';
        const message = document.getElementById('cMessage')?.value || '';
        SITE.messages.push({id:nextId(SITE.messages), name, email, phone, subject, message, date:new Date().toISOString(), read:false});
        saveData();
        if (msg) { msg.className='form-message success'; msg.textContent=txt('formSuccess'); }
        form.reset();
        setTimeout(()=>{ if(msg){msg.className='form-message';msg.textContent='';} }, 5000);
    });
}
function initCounters() {
    const counters=document.querySelectorAll('.stat-number'); if(!counters.length)return;
    const anim=el=>{const t=+el.getAttribute('data-target');let c=0;const s=t/50;const tk=()=>{c+=s;if(c<t){el.textContent=toPersianNum(Math.ceil(c));requestAnimationFrame(tk);}else el.textContent=toPersianNum(t);};tk();};
    if (typeof IntersectionObserver === 'undefined') { counters.forEach(anim); return; }
    const obs=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){anim(e.target);obs.unobserve(e.target);}});},{threshold:0.5});
    counters.forEach(c=>obs.observe(c));
}
function setYear() { const y=document.getElementById('currentYear'); if(y) y.textContent=toPersianNum(new Date().getFullYear()); }

// ============== Section renderers shared by all pages ==============
function renderFeaturesGrid() {
    const fg = document.getElementById('featuresGrid');
    if (!fg) return;
    fg.innerHTML = SITE.features.map(f => `
        <div class="feature-card">
            <div class="feature-icon${f.image?' has-photo':''}">${f.image?`<img src="${f.image}" alt="${f.title}" loading="lazy">`:`<i class="${f.icon}"></i>`}</div>
            <h3>${f.title}</h3>
            <p>${f.desc}</p>
        </div>`).join('');
}
function renderProjectsGrid() {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;
    grid.innerHTML = SITE.projects.map(p => `
        <div class="project-card">
            <div class="project-image${p.image?' has-photo':''}">${p.image?`<img src="${p.image}" alt="${p.title}" loading="lazy">`:`<i class="${p.icon}"></i>`}</div>
            <div class="project-content">
                <span class="project-tag">${p.tag||''}</span>
                <h3>${p.title||''}</h3>
                <p>${p.desc||''}</p>
                <div class="project-tech">${(p.tech||'').split(',').filter(t=>t.trim()).map(t=>`<span>${t.trim()}</span>`).join('')}</div>
            </div>
        </div>`).join('');
}
function renderSkillsGrid() {
    const el = document.getElementById('skillsGrid');
    if (!el) return;
    el.innerHTML = SITE.skills.map(s => `<div class="skill-tag"><i class="${s.icon}"></i> ${s.name}</div>`).join('');
}
function renderWhymeGrid() {
    const el = document.getElementById('whymeGrid');
    if (!el) return;
    el.innerHTML = SITE.whyme.map(w => `
        <div class="feature-card">
            <div class="feature-icon${w.image?' has-photo':''}">${w.image?`<img src="${w.image}" alt="${w.title}" loading="lazy">`:`<i class="${w.icon}"></i>`}</div>
            <h3>${w.title}</h3>
            <p>${w.desc}</p>
        </div>`).join('');
}
function renderContactCards() {
    const el = document.getElementById('contactInfo');
    if (!el) return;
    el.innerHTML = SITE.contactCards.map(c => `
        <div class="contact-card">
            <div class="contact-icon"><i class="${c.icon}"></i></div>
            <div class="contact-detail">
                <h4>${c.title}</h4>
                ${c.url ? `<a href="${c.url}" ${c.url.startsWith('http')?'target="_blank"':''}>${c.value}</a>` : `<span>${c.value}</span>`}
                ${c.hint?`<p style="font-size:0.8rem;color:var(--text-muted);margin-top:0.3rem;">${c.hint}</p>`:''}
            </div>
        </div>`).join('');
}
function renderPhotos() {
    const h = document.getElementById('heroAvatar');
    if (h) {
        h.innerHTML = SITE.heroPhoto
            ? `<img src="${SITE.heroPhoto}" alt="avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
            : '<i class="fas fa-user"></i>';
    }
    const a = document.getElementById('aboutPhoto');
    if (a) {
        a.innerHTML = SITE.aboutPhoto
            ? `<img src="${SITE.aboutPhoto}" alt="about" style="width:100%;height:100%;object-fit:cover;border-radius:1.5rem;">`
            : '<i class="fas fa-user-tie"></i>';
    }
}
function applyTexts() {
    document.querySelectorAll('[data-text]').forEach(el => {
        const k = el.getAttribute('data-text');
        if (SITE.texts[k] !== undefined) el.textContent = SITE.texts[k];
    });
    document.querySelectorAll('[data-visible]').forEach(el => {
        el.style.display = isVisible(el.getAttribute('data-visible')) ? '' : 'none';
    });
}
// Re-render the entire public page from current SITE data.
function renderSitePage() {
    applyTexts();
    renderPhotos();
    renderSocials();
    renderFeaturesGrid();
    renderProjectsGrid();
    renderSkillsGrid();
    renderWhymeGrid();
    renderContactCards();
    refreshShopEverywhere();
}

window.SITE=SITE; window.saveData=saveData; window.CAT_NAME_MAP=CAT_NAME_MAP;
window.refreshShopEverywhere=refreshShopEverywhere;
window.renderSitePage=renderSitePage; window.initSync=initSync;
window.fetchRemoteData=fetchRemoteData; window.pushDataToServer=pushDataToServer;

document.addEventListener('DOMContentLoaded', () => {
    // Each step is isolated so a single failure can never blank the whole page.
    [initTheme, initNavbar, initCounters, initContactForm, setYear, createCartUI, renderSitePage]
        .forEach(fn => { try { fn(); } catch (e) { console.error('[site] init failed:', fn.name, e); } });
    // Keep every visitor in sync with the admin panel's latest changes.
    if (!document.getElementById('adminPage')) {
        initSync(() => { try { renderSitePage(); } catch (e) { console.error('[site] re-render failed', e); } });
    }
});
