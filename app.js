// ========== Amir Sedighian Website - Full App (with Cart & Telegram) ==========
const STORAGE_KEY = 'amir_site_data_v2';
const CART_KEY = 'amir_cart';

const DEFAULT_DATA = {
    auth: { username: 'admin', password: 'admin123' },

    // Telegram config for sending orders to admin
    telegram: { botToken: '', chatId: '', botUsername: '', cardNumber: '', cardHolder: '', siteUrl: '' },

    shopEnabled: true,
    maintenanceMode: false,
    products: [
        { id: 1, name: 'هاست لینوکس حرفه‌ای', category: 'hosting', price: 250000, unit: 'ماهانه', icon: 'fas fa-server', badge: 'hot', image: 'assets/img/products/hosting-linux.jpg',
          description: 'هاست پرسرعت SSD با پشتیبانی ۲۴ ساعته',
          longDescription: 'این سرویس مناسب وب‌سایت‌هایی است که به پایداری و سرعت بالا نیاز دارند. با استفاده از جدیدترین سخت‌افزارهای SSD و کشینگ پیشرفته، سایت شما با بهترین سرعت در دسترس بازدیدکنندگان خواهد بود.\n\nویژگی‌ها:\n• نصب رایگان کنترل پنل\n• بک‌آپ روزانه خودکار\n• گواهی SSL رایگان\n• پشتیبانی ۲۴ ساعته از طریق تلگرام\n• ضمانت بازگشت وجه ۷ روزه',
          features: ['فضای ۵ گیگابایت SSD', 'پهنای باند نامحدود', 'گواهی SSL رایگان', 'پشتیبانی ۲۴/۷'] },
        { id: 2, name: 'دامنه .ir', category: 'domain', price: 150000, unit: 'سالانه', icon: 'fas fa-globe', badge: 'new', image: 'assets/img/products/domain-ir.jpg',
          description: 'ثبت دامنه .ir با قیمت مناسب',
          longDescription: 'ثبت دامنه .ir با کمترین قیمت و تحویل فوری. پس از ثبت، دسترسی کامل DNS و مدیریت دامنه در اختیار شما قرار می‌گیرد.',
          features: ['ثبت فوری', 'مدیریت DNS کامل', 'قفل انتقال', 'تجدید آسان'] },
        { id: 3, name: 'سرور مجازی ایران', category: 'server', price: 750000, unit: 'ماهانه', icon: 'fas fa-hdd', badge: 'hot', image: 'assets/img/products/vps-iran.jpg',
          description: 'سرور مجازی با پینگ پایین و آپتایم بالا',
          longDescription: 'سرور مجازی ایران با آی‌پی ثابت و پینگ بسیار مناسب برای کاربران داخل کشور. مناسب میزبانی سایت، ربات تلگرام و سرویس‌های داخلی.',
          features: ['۱ هسته پردازنده', 'رم ۲ گیگابایت', 'فضای ۲۰ گیگ SSD', 'آی‌پی ثابت'] },
        { id: 4, name: 'کانفیگ V2Ray – ۱ ماهه', category: 'vpn', price: 120000, unit: 'ماهانه', icon: 'fas fa-shield-alt', badge: 'sale', image: 'assets/img/products/vpn-v2ray.jpg',
          description: 'کانفیگ پرسرعت VLESS با REALITY',
          longDescription: 'کانفیگ VLESS با پروتکل REALITY که یکی از امن‌ترین و پرسرعت‌ترین متدها در حال حاضر است. مناسب کاربرد روزانه و بدون قطعی.',
          features: ['VLESS + REALITY', 'بدون محدودیت حجم', 'چینش اختصاصی', 'همه اپراتورها'] },
        { id: 5, name: 'هاست وردپرس', category: 'hosting', price: 350000, unit: 'ماهانه', icon: 'fab fa-wordpress', badge: '', image: 'assets/img/products/hosting-wordpress.jpg',
          description: 'هاست بهینه شده برای وردپرس',
          longDescription: 'هاست مخصوص وردپرس با LiteSpeed Cache و تنظیمات بهینه. نصب خودکار وردپرس، بک‌آپ روزانه و ضد بدافزار از امکانات این سرویس است.',
          features: ['نصب خودکار وردپرس', 'کش LiteSpeed', 'بک‌آپ روزانه', 'ضد بدافزار'] },
        { id: 6, name: 'دامنه .com', category: 'domain', price: 850000, unit: 'سالانه', icon: 'fas fa-globe-americas', badge: '', image: 'assets/img/products/domain-com.jpg',
          description: 'ثبت دامنه بین‌المللی .com',
          longDescription: 'ثبت دامنه بین‌المللی .com با بهترین قیمت. مناسب کسب‌وکارهای بین‌المللی و پروژه‌های جهانی.',
          features: ['ثبت بین‌المللی', 'WHOIS Privacy', 'مدیریت کامل', 'قابل انتقال'] },
        { id: 7, name: 'سرور مجازی آلمان', category: 'server', price: 1200000, unit: 'ماهانه', icon: 'fas fa-network-wired', badge: 'new', image: 'assets/img/products/vps-germany.jpg',
          description: 'سرور مجازی لوکیشن آلمان',
          longDescription: 'سرور مجازی آلمان با کیفیت بالا و پورت ۱ گیگ. مناسب ترید، کانفیگ VPN و سرویس‌های بین‌المللی.',
          features: ['۲ هسته پردازنده', 'رم ۴ گیگابایت', 'فضای ۵۰ گیگ NVMe', 'پورت ۱ گیگ'] },
        { id: 8, name: 'کانفیگ Trojan – ۳ ماهه', category: 'vpn', price: 300000, unit: 'سه ماهه', icon: 'fas fa-user-shield', badge: '', image: 'assets/img/products/vpn-trojan.jpg',
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
        checkoutTitle: 'تکمیل سفارش', checkoutDesc: 'اطلاعات خود را وارد کنید؛ پس از ثبت، فاکتور در ربات متصل به سایت برای شما نمایش داده می‌شود.',
        yourName: 'نام و نام خانوادگی *', yourPhone: 'شماره تماس *', yourTelegramId: 'آیدی تلگرام برای ارتباط ادمین *', yourEmail: 'ایمیل (اختیاری)',
        telegramIdHint: 'آیدی را به شکل @username وارد کنید؛ ادمین فقط از همین آیدی با شما در ارتباط خواهد بود.',
        orderNote: 'یادداشت (اختیاری)', sendOrder: 'ثبت سفارش و دریافت فاکتور در ربات',
        orderSuccess: '✓ سفارش شما با موفقیت ثبت شد! به زودی با شما تماس می\u200Cگیریم.',
        orderError: 'خطا در ارسال سفارش. لطفاً دوباره تلاش کنید یا مستقیماً از تلگرام با ما در ارتباط باشید.',
        detailsProduct: 'مشاهده جزئیات'
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
        { id: 1, icon: 'fas fa-robot', tag: 'ربات تلگرام', title: 'ربات فروشگاهی دو زبانه', desc: 'ربات تلگرام فروشگاهی با پنل ادمین وب، درگاه پرداخت و پشتیبانی از فارسی و انگلیسی.', tech: 'React,Cloudflare Workers,KV',
          image: 'assets/img/projects/p1-bot-1.jpg', gallery: ['assets/img/projects/p1-bot-1.jpg', 'assets/img/projects/p1-bot-2.jpg', 'assets/img/projects/p1-bot-3.jpg'],
          longDescription: 'یک فروشگاه کامل داخل تلگرام که مدیریت آن از پنل ادمین تحت وب انجام می‌شود؛ بدون نیاز به سرور گران و بدون دغدغه نگهداری.\n\n• نمایش محصولات و دسته‌بندی‌ها به فارسی و انگلیسی\n• سبد خرید، کد تخفیف و پرداخت آنلاین\n• ارسال خودکار فاکتور و تحویل لحظه‌ای سفارش\n• گزارش فروش روزانه، ماهانه و نمودار رشد در پنل\n\nکل زیرساخت روی Cloudflare Workers و KV اجرا می‌شود؛ به همین دلیل زمان پاسخ‌دهی پایین، آپ‌تایم بالا و هزینه نگهداری تقریباً صفر است.' },
        { id: 2, icon: 'fas fa-globe', tag: 'وب‌سایت', title: 'سایت شرکتی مدرن', desc: 'طراحی و توسعه وب‌سایت شرکتی ریسپانسیو با پنل مدیریت محتوا و SEO بهینه.', tech: 'Next.js,Tailwind,TypeScript',
          image: 'assets/img/projects/p2-corp-1.jpg', gallery: ['assets/img/projects/p2-corp-1.jpg', 'assets/img/projects/p2-corp-2.jpg', 'assets/img/projects/p2-corp-3.jpg'],
          longDescription: 'وب‌سایت شرکتی با تمرکز بر سرعت، سئو و ظاهر حرفه‌ای ساخته شد تا معرفی خدمات و جذب مشتری ساده باشد.\n\n• طراحی واکنش‌گرا برای موبایل، تبلت و دسکتاپ\n• پنل مدیریت محتوا برای ویرایش متن‌ها و تصاویر توسط خود کارفرما\n• ساختار سئوی فنی: متا تگ‌ها، Schema و نقشه سایت\n• امتیاز بالای سرعت در Lighthouse و Core Web Vitals\n\nپروژه با Next.js و Tailwind CSS پیاده‌سازی شده و روی زیرساخت ابری با SSL رایگان منتشر شده است.' },
        { id: 3, icon: 'fas fa-network-wired', tag: 'زیرساخت', title: 'پنل مدیریت VPN', desc: 'پنل مدیریت کاربران VPN با پشتیبانی از پروتکل‌های VLESS، VMess و Trojan.', tech: 'Python,Docker,gRPC',
          image: 'assets/img/projects/p3-vpn-1.jpg', gallery: ['assets/img/projects/p3-vpn-1.jpg', 'assets/img/projects/p3-vpn-2.jpg', 'assets/img/projects/p3-vpn-3.jpg'],
          longDescription: 'پنلی برای مدیریت متمرکز کاربران و کانفیگ‌ها، ساخته‌شده برای ادمین‌هایی که چندین سرور و صدها کاربر دارند.\n\n• ساخت و تحویل خودکار کانفیگ برای VLESS، VMess و Trojan\n• محدودیت حجم و تاریخ انقضا برای هر کاربر\n• گزارش مصرف و نمودار ترافیک\n• اجرا با Docker و به‌روزرسانی بدون قطعی سرویس\n\nارتباط پنل با سرورها از طریق gRPC انجام می‌شود تا مدیریت چند سرور هم‌زمان سریع و امن باشد.' },
        { id: 4, icon: 'fas fa-chart-line', tag: 'داشبورد', title: 'داشبورد تحلیلی', desc: 'داشبورد تحلیلی Realtime با نمودارهای تعاملی و گزارش‌گیری خودکار.', tech: 'React,Chart.js,API',
          image: 'assets/img/projects/p4-dash-1.jpg', gallery: ['assets/img/projects/p4-dash-1.jpg', 'assets/img/projects/p4-dash-2.jpg', 'assets/img/projects/p4-dash-3.jpg'],
          longDescription: 'داشبوردی که همه شاخص‌های کلیدی کسب‌وکار را در یک نگاه نشان می‌دهد و داده‌ها را لحظه‌ای به‌روز می‌کند.\n\n• نمودارهای تعاملی فروش، بازدید و نرخ تبدیل\n• فیلتر بازه زمانی و مقایسه دوره‌ای\n• گزارش‌گیری خودکار و خروجی Excel و PDF\n• هشدار هوشمند هنگام افت شاخص‌ها\n\nداده‌ها از REST API خوانده می‌شوند و رابط کاربری با React و Chart.js ساخته شده تا روی موبایل هم روان اجرا شود.' },
        { id: 5, icon: 'fas fa-plug', tag: 'API', title: 'API بک‌اند قدرتمند', desc: 'طراحی REST API با احراز هویت JWT، کشینگ و مستندسازی Swagger.', tech: 'Python,FastAPI,Redis',
          image: 'assets/img/projects/p5-api-1.jpg', gallery: ['assets/img/projects/p5-api-1.jpg', 'assets/img/projects/p5-api-2.jpg'],
          longDescription: 'یک بک‌اند تمیز و مقیاس‌پذیر که چند اپلیکیشن مختلف روی آن سوار می‌شوند.\n\n• احراز هویت با JWT و سطح‌بندی دسترسی\n• کشینگ با Redis برای کاهش چشمگیر زمان پاسخ\n• مستندسازی کامل Swagger برای تیم فرانت‌اند\n• تست خودکار و CI برای انتشار بدون خطا\n\nپیاده‌سازی با FastAPI انجام شده و روی سرور لینوکسی با Docker و Nginx منتشر می‌شود.' },
        { id: 6, icon: 'fas fa-cloud-upload-alt', tag: 'کلادفلر', title: 'استقرار روی Cloudflare', desc: 'مهاجرت و استقرار کامل زیرساخت روی Cloudflare Pages، Workers و R2.', tech: 'Cloudflare,Workers,R2',
          image: 'assets/img/projects/p6-cloud-1.jpg', gallery: ['assets/img/projects/p6-cloud-1.jpg', 'assets/img/projects/p6-cloud-2.jpg'],
          longDescription: 'مهاجرت کامل یک سرویس از هاست اشتراکی به زیرساخت مدرن کلادفلر؛ سریع‌تر، ارزان‌تر و پایدارتر.\n\n• انتقال DNS و تنظیمات امنیتی به Cloudflare\n• انتشار سایت روی Pages با بیلد خودکار از مخزن Git\n• اجرای منطق سرور روی Workers و ذخیره فایل‌ها روی R2\n• کشینگ هوشمند و کاهش زمان بارگذاری تا چند برابر\n\nنتیجه: بدون سرور ثابت، بدون هزینه اضافی و با آپ‌تایم بالا در تمام ساعات شبانه‌روز.' },
        { id: 7, icon: 'fas fa-shopping-bag', tag: 'فول‌استک', title: 'فروشگاه اینترنتی', desc: 'ساخت فروشگاه اینترنتی با سبد خرید، درگاه پرداخت، پنل ادمین و مدیریت سفارش‌ها.', tech: 'Next.js,PostgreSQL,Tailwind',
          image: 'assets/img/projects/p7-shop-1.jpg', gallery: ['assets/img/projects/p7-shop-1.jpg', 'assets/img/projects/p7-shop-2.jpg', 'assets/img/projects/p7-shop-3.jpg'],
          longDescription: 'یک فروشگاه اینترنتی کامل با تجربه کاربری ساده برای مشتری و مدیریت آسان برای فروشنده.\n\n• جست‌وجو و فیلتر سریع محصولات\n• سبد خرید، پرداخت امن و پیگیری سفارش\n• پنل ادمین برای موجودی، قیمت‌گذاری و کد تخفیف\n• ایمیل و پیامک اطلاع‌رسانی خودکار\n\nپایگاه‌داده PostgreSQL و فرانت‌اند Next.js انتخاب شد تا هم امنیت داده‌ها و هم سرعت صفحات بالا باشد.' },
        { id: 8, icon: 'fas fa-mobile-alt', tag: 'PWA', title: 'وب اپلیکیشن PWA', desc: 'توسعه وب اپلیکیشن پیش‌رونده با قابلیت نصب روی موبایل و کار آفلاین.', tech: 'React,PWA,IndexedDB',
          image: 'assets/img/projects/p8-pwa-1.jpg', gallery: ['assets/img/projects/p8-pwa-1.jpg', 'assets/img/projects/p8-pwa-2.jpg', 'assets/img/projects/p8-pwa-3.jpg'],
          longDescription: 'اپلیکیشنی که بدون فروشگاه اپلیکیشن روی گوشی کاربر نصب می‌شود و آفلاین هم کار می‌کند.\n\n• نصب مستقیم از مرورگر روی صفحه اصلی گوشی\n• ذخیره اطلاعات در IndexedDB و استفاده آفلاین\n• همگام‌سازی خودکار با سرور پس از اتصال\n• نوتیفیکیشن و آیکون اختصاصی اپلیکیشن\n\nبرای کسب‌وکارهایی مناسب است که می‌خواهند با هزینه کم، تجربه‌ای شبیه اپلیکیشن نیتیو به کاربر بدهند.' },
        { id: 9, icon: 'fas fa-robot', tag: 'هوش مصنوعی', title: 'چت‌بات هوشمند', desc: 'چت‌بات متصل به API هوش مصنوعی با پشتیبانی از چندین زبان و حافظه مکالمه.', tech: 'Python,OpenAI,Telegram',
          image: 'assets/img/projects/p9-ai-1.jpg', gallery: ['assets/img/projects/p9-ai-1.jpg', 'assets/img/projects/p9-ai-2.jpg', 'assets/img/projects/p9-ai-3.jpg'],
          longDescription: 'چت‌باتی که مثل یک پشتیبان انسانی پاسخ می‌دهد و مکالمه را به خاطر می‌سپارد.\n\n• پاسخ‌گویی هوشمند با استفاده از API هوش مصنوعی\n• حافظه مکالمه برای هر کاربر و ادامه گفتگو\n• پشتیبانی از فارسی، انگلیسی و چند زبان دیگر\n• انتقال گفتگو به اپراتور انسانی در موارد خاص\n\nبرای پشتیبانی فروشگاه‌ها و پاسخ‌گویی شبانه‌روزی به سؤالات پرتکرار طراحی شده است.' }
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

// Additive schema migration: preserve existing Persian content and independent settings.
Object.assign(DEFAULT_DATA.texts, CONTENT_FA);
DEFAULT_DATA.textsEn = {...CONTENT_EN};
DEFAULT_DATA.itemTranslations = {};
DEFAULT_DATA.extraContent = {header: [], footer: []};
DEFAULT_DATA.contentLinks = {};
Object.values(CONTENT_SECTIONS).forEach(section => {
    Object.keys(section.visible).forEach(key => { DEFAULT_DATA.visible[key] = true; });
});
// Starter products/projects published before bundled photos existed are saved
// server-side without an `image`/`gallery` field (mergeRemote would otherwise
// keep them icon-only forever). Fill the bundled visuals back in, but never
// override anything the admin touched: an uploaded photo (even an empty string
// after «حذف عکس») or a renamed card stays exactly as saved.
function applyDefaultMedia(data) {
    ['products', 'projects'].forEach(list => {
        (data[list] || []).forEach(item => {
            const def = (DEFAULT_DATA[list] || []).find(d => d.id === item.id);
            if (!def || !def.image || item.name !== def.name) return;
            if ((item.image === undefined || item.image === null) && def.image) item.image = def.image;
            if (list === 'projects' && (!item.gallery || !item.gallery.length) && item.gallery !== null && def.gallery) {
                item.gallery = def.gallery.slice();
            }
        });
    });
    return data;
}
function normalizeContent(data) {
    data.textsEn = {...CONTENT_EN, ...(data.textsEn || {})};
    data.itemTranslations = data.itemTranslations || {};
    data.extraContent = {header: [], footer: [], ...(data.extraContent || {})};
    data.contentLinks = data.contentLinks || {};
    applyDefaultMedia(data);
    return data;
}

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
const SITE = normalizeContent(loadData());

// ============== Remote (shared) data sync ==============
// Everything the admin changes is pushed to a serverless store so that ALL
// visitors of the site see the same content, not just the admin's browser.
const SYNC_ENDPOINT = '/.netlify/functions/site-data';
const SYNC_POLL_MS = 15000;
// Back-off used after a failed push, so one transient failure (a deploy in
// progress, a network blip) can never leave the published copy out of date
// for the whole browser session — the push keeps retrying until it succeeds.
const PUSH_RETRY_DELAYS = [1500, 5000, 15000, 30000];
let _pushTimer = null;
let _lastRemoteStamp = 0;
const _syncState = { ok: null, lastPushAt: null, lastError: null, failures: 0 };

function emitSync(type, detail) {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        try { window.dispatchEvent(new CustomEvent('site:sync', { detail: Object.assign({ type }, detail || {}) })); } catch (e) { /* ignore */ }
    }
}

function schedulePush(delayMs) {
    clearTimeout(_pushTimer);
    _pushTimer = setTimeout(runPush, Math.max(0, delayMs));
}

function runPush() {
    _pushTimer = null;
    // Telegram credentials are kept in a private server-side store. Older
    // browser-only versions may still have them locally, so remove them before
    // publishing a shared copy of the site data.
    // Shallow clone is enough (we only strip nested telegram keys) and avoids
    // serialising + parsing megabytes of base64 photos on the main thread.
    const payload = Object.assign({}, SITE, { telegram: Object.assign({}, SITE.telegram) });
    if (payload.telegram) {
        delete payload.telegram.botToken;
        delete payload.telegram.chatId;
    }
    return fetch(SYNC_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: payload })
    }).then(async (r) => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const j = await r.json();
        if (j && j.updatedAt) _lastRemoteStamp = j.updatedAt;
        _syncState.ok = true;
        _syncState.lastPushAt = Date.now();
        _syncState.lastError = null;
        _syncState.failures = 0;
        window.__syncOk = true;
        emitSync('push:ok', { updatedAt: j && j.updatedAt });
    }).catch((e) => {
        _syncState.ok = false;
        _syncState.lastPushAt = Date.now();
        _syncState.lastError = String(e && e.message || e);
        _syncState.failures += 1;
        window.__syncOk = false;
        emitSync('push:error', { error: _syncState.lastError, failures: _syncState.failures });
        const idx = Math.min(_syncState.failures - 1, PUSH_RETRY_DELAYS.length - 1);
        schedulePush(PUSH_RETRY_DELAYS[idx]);
    });
}

function pushDataToServer() {
    // User-initiated publish: try right away (cancels any pending retry).
    schedulePush(400);
}

function siteSyncState() {
    return Object.assign({}, _syncState);
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
    const remoteTelegram = Object.assign({}, remote.telegram || {});
    // Credentials belonged to an older browser-only implementation. Never
    // re-hydrate them from shared data; Telegram now keeps them server-side.
    delete remoteTelegram.botToken;
    delete remoteTelegram.chatId;
    SITE.telegram = Object.assign({}, DEFAULT_DATA.telegram, remoteTelegram);
    SITE.auth = Object.assign({}, DEFAULT_DATA.auth, remote.auth || {});
    normalizeContent(SITE);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(SITE)); } catch (e) { /* quota: server copy still wins */ }
    return true;
}

let _syncFetchPending = false;
async function fetchRemoteStamp() {
    try {
        const r = await fetch(SYNC_ENDPOINT + '?meta=1&t=' + Date.now(), { cache: 'no-store' });
        if (!r.ok) return null;
        const j = await r.json();
        return (j && j.updatedAt) || null;
    } catch (e) { return null; }
}
async function fetchRemoteData() {
    if (_syncFetchPending) return false;
    _syncFetchPending = true;
    try {
        // Cheap stamp check first: the full payload can be megabytes (base64
        // photos), so only download + parse it when something actually changed.
        // A null stamp means "unknown" (old server / first load) → fetch fully.
        const stamp = await fetchRemoteStamp();
        if (stamp && stamp <= _lastRemoteStamp) return false;
        const r = await fetch(SYNC_ENDPOINT + '?t=' + Date.now(), { cache: 'no-store' });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const j = await r.json();
        if (!j || !j.data) return false;
        return mergeRemote(j.data);
    } catch (e) {
        // Transient read failure: keep polling on the next tick instead of
        // switching sync off for the whole session.
        return false;
    } finally {
        _syncFetchPending = false;
    }
}

async function initSync(onUpdate) {
    const changed = await fetchRemoteData();
    if (changed && typeof onUpdate === 'function') onUpdate();
    // If no remote copy exists yet, seed it with what we have.
    if (!_lastRemoteStamp) schedulePush(400);
    const poll = async () => {
        // Background tabs don't need live data — skip the network + parse work.
        if (document.hidden) return;
        const c = await fetchRemoteData();
        if (c && typeof onUpdate === 'function') onUpdate();
    };
    setInterval(poll, SYNC_POLL_MS);
    // Refresh as soon as the tab becomes visible again.
    document.addEventListener('visibilitychange', () => { if (!document.hidden) poll(); });
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
    if (isEnglish()) return String(n);
    const p=['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
    return n.toString().replace(/\d/g,d=>p[d]);
}
function formatPrice(n) { return toPersianNum(Number(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g,',')); }
function isEnglish() { return document.body.classList.contains('public-site') && localStorage.getItem('amir_language') === 'en'; }
function txt(key) {
    return isEnglish() ? (SITE.textsEn[key] ?? CONTENT_EN[key] ?? SITE.texts[key] ?? key) : (SITE.texts[key] ?? DEFAULT_DATA.texts[key] ?? key);
}
function contentItems(list) {
    return (SITE[list] || []).filter(item => isVisible(`item:${list}:${item.id}`)).map(item => {
        if (!isEnglish()) return item;
        const original = (DEFAULT_DATA[list] || []).find(x => x.id === item.id);
        const defaults = (CONTENT_ITEMS_EN[list] || [])[item.id - 1] || {};
        const translated = {};
        // Default translations apply only to unchanged starter content, not custom records.
        Object.keys(defaults).forEach(key => {
            if (original && JSON.stringify(item[key]) === JSON.stringify(original[key])) translated[key] = defaults[key];
        });
        return {...item, ...translated, ...(SITE.itemTranslations[list]?.[item.id] || {})};
    });
}
function uiText(key) { return `<span data-text="${escapeContent(key)}" class="${isVisible('text:'+key)?'':'content-text-hidden'}">${escapeContent(txt(key))}</span>`; }
function escapeContent(value) { return String(value ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function isVisible(key) { return SITE.visible[key] !== false; }
function nextId(arr) { return arr.length ? Math.max(...arr.map(x => x.id||0))+1 : 1; }

// ============== Render change-detection helpers ==============
// Re-renders must be cheap AND must not rebuild grids (restarting sliders or
// dropping scroll position) when nothing changed. Small text fields are hashed
// fully for correctness; big base64 photos are only fingerprinted (length +
// head/tail hash) so we never serialise megabytes on the main thread.
function shash(str) {
    str = String(str == null ? '' : str);
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36);
}
function imgSig(img) {
    if (!img) return '0';
    const s = String(img);
    if (s.length < 200) return 's' + shash(s); // icon class / short url: hash fully
    return s.length + ':' + shash(s.slice(0, 48) + s.slice(-48));
}
function arrSig(arr, pick) {
    if (!arr || !arr.length) return '0';
    let s = String(arr.length);
    for (let i = 0; i < arr.length; i++) s += '#' + pick(arr[i], i);
    return s;
}
function cardSig(x) {
    return [x.id, x.icon || '', shash(x.title), shash(x.desc), imgSig(x.image)].join(',');
}
function getProduct(id) { return contentItems('products').find(p => p.id === id); }
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
    const page = (location.pathname.replace(/\/+$/, '').split('/').pop() || 'index').replace(/\.html$/, '') + '.html';
    const map = {'':'home','index.html':'home','shop.html':'shop','projects.html':'projects','about.html':'about','contact.html':'contact'};
    const section = map[page] || 'home';
    document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.getAttribute('data-section')===section));
    const menuBtn = document.getElementById('mobileMenuBtn'), nav = document.getElementById('navMenu');
    if (menuBtn && nav) {
        menuBtn.addEventListener('click', () => {
            nav.classList.toggle('active');
            menuBtn.setAttribute('aria-expanded', String(nav.classList.contains('active')));
            menuBtn.innerHTML = nav.classList.contains('active') ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });
        document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => {
            nav.classList.remove('active'); menuBtn.setAttribute('aria-expanded','false'); if (menuBtn) menuBtn.innerHTML='<i class="fas fa-bars"></i>';
        }));
    }
    const nb = document.getElementById('navbar');
    if (nb) {
        // Coalesced + passive: the raw listener forced style recalc on every
        // single scroll tick, which is a classic scroll-jank source.
        let nbTicking = false;
        window.addEventListener('scroll', () => {
            if (nbTicking) return;
            nbTicking = true;
            requestAnimationFrame(() => {
                nbTicking = false;
                nb.classList.toggle('scrolled', window.scrollY > 20);
            });
        }, { passive: true });
    }
    if (!isVisible('footer')) { const f=document.querySelector('.footer'); if(f) f.style.display='none'; }
}

// ============== Shop renderer ==============

function productCardHtml(p) {
    return `
        <div class="product-card" data-pid="${p.id}" data-item-list="products" data-item-id="${p.id}">
            ${p.badge ? `<span class="product-badge badge-${p.badge}">${uiText("badge_"+p.badge)}</span>` : ''}
            <div class="product-image${p.image?' has-photo':''}">${p.image?`<img src="${p.image}" alt="${escapeContent(p.name)}" loading="lazy">`:`<i class="${p.icon}"></i>`}</div>
            <div class="product-body">
                <div class="product-cat">${uiText('category_'+p.category)}</div>
                <h3 class="product-title">${escapeContent(p.name)}</h3>
                <p class="product-desc">${escapeContent(p.description||'')}</p>
                <ul class="product-features">${(p.features||[]).slice(0,3).map(f=>`<li><i class="fas fa-check-circle"></i> ${escapeContent(f)}</li>`).join('')}</ul>
                <div class="product-footer">
                    <div class="product-price"><span class="price-amount">${formatPrice(p.price)}</span><span class="price-unit">${uiText('currency')} / ${escapeContent(p.unit)}</span></div>
                    <button class="btn btn-primary btn-sm" data-quick="${p.id}"><i class="fas fa-cart-plus"></i> ${uiText('buy')}</button>
                </div>
            </div>
        </div>`;
}

function shopSignature(category, limit, showFilters, slider, list) {
    // The old code ran JSON.stringify over the whole product list — including
    // megabytes of base64 photos — on every render pass. Fingerprints are enough.
    return JSON.stringify([isEnglish(), SITE.texts, SITE.textsEn, SITE.visible]) + '|' + category + '|' + limit + '|' + (showFilters ? 1 : 0) + '|' + (slider ? 1 : 0) + '|' +
        arrSig(list, p => [p.id, p.category || '', p.price, p.unit || '', p.badge || '', p.icon || '',
            shash(p.name), shash(p.description), shash(p.longDescription),
            (p.features || []).map(shash).join('~'), imgSig(p.image)].join(','));
}

function renderShop(container, opts={}) {
    if (!container) return;
    const { category='all', limit=0, showFilters=true } = opts;
    if (!SITE.shopEnabled) {
        container.dataset.shopSig = 'disabled';
        container.innerHTML = `<div class="shop-disabled" role="status">
            <div class="maintenance-orbit" data-visible="shopDisabled_animation" aria-hidden="true">
                <span class="mo-ring mo-ring--outer"></span>
                <span class="mo-ring mo-ring--inner"></span>
                <span class="mo-glow"></span>
                <span class="mo-core"><i class="fas fa-screwdriver-wrench"></i></span>
                <span class="mo-spark mo-spark--1"></span><span class="mo-spark mo-spark--2"></span><span class="mo-spark mo-spark--3"></span>
            </div>
            <h3 data-text="shopDisabled_title">${escapeContent(txt('shopDisabled_title'))}</h3>
            <p data-text="shopDisabled_desc">${escapeContent(txt('shopDisabled_desc'))}</p>
            <p data-text="shopDisabled_extra">${escapeContent(txt('shopDisabled_extra'))}</p>
            <a class="btn btn-outline" data-visible="shopDisabled_support" data-content-link="shopDisabled_support" href="contact.html"><span data-text="support">${escapeContent(txt('support'))}</span></a>
        </div>`;
        if (typeof applyContentControls === 'function') applyContentControls();
        return;
    }
    const cats=['all','hosting','domain','server','vpn'].map(id=>({id,name:txt('category_'+id)}));
    let list = contentItems('products').filter(p=>category==='all' || p.category===category);
    if (limit>0) list=list.slice(0,limit);
    const slider = container.dataset.slider === 'true' && list.length > 0;

    // The public pages re-render from the live sync every few seconds. Only
    // rebuild when something real changed, so sliders/modals never restart.
    const signature = shopSignature(category, limit, showFilters, slider, list);
    if (container.dataset.shopSig === signature && container.firstElementChild) return;
    container.dataset.shopSig = signature;

    let html='';
    if (showFilters && limit===0) {
        html += `<div class="shop-categories">${cats.map(c=>`<button class="shop-cat-btn ${c.id===category?'active':''}" data-cat="${c.id}">${uiText('category_'+c.id)}</button>`).join('')}</div>`;
    }
    if (slider) {
        html += shopSliderHtml(list);
    } else {
        html += `<div class="products-grid">${list.map(productCardHtml).join('')}</div>`;
    }
    container.innerHTML = html;
    container.querySelectorAll('.shop-cat-btn').forEach(b=>b.addEventListener('click',()=>renderShop(container,{category:b.getAttribute('data-cat'),showFilters:true})));
    container.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', e => {
            if (e.target.closest('[data-quick]')) return;
            openProductDetail(+card.dataset.pid, card);
        });
    });
    container.querySelectorAll('[data-quick]').forEach(b=>b.addEventListener('click', e=>{
        e.stopPropagation();
        openProductDetail(+b.dataset.quick, b.closest('.product-card'));
    }));
    if (typeof applyContentControls === 'function') applyContentControls();
    if (slider) {
        // cloned slides are visual duplicates: keep them out of the tab order
        container.querySelectorAll('.slider-item[data-real="0"] a, .slider-item[data-real="0"] button').forEach(el => { el.tabIndex = -1; });
        initShopSlider(container);
    }
}

// ---- Best sellers slider: auto play, drag/swipe, arrows and dots ----
function shopSliderHtml(list) {
    const count = list.length;
    const clones = count >= 4 ? 3 : 0;
    const item = (p, real) => `<div class="slider-item${real?' is-real':''}" data-real="${real?1:0}"${real?'':' aria-hidden="true"'}>${productCardHtml(p)}</div>`;
    const slides = [
        ...(clones ? list.slice(-clones).map(p=>item(p,false)) : []),
        ...list.map(p=>item(p,true)),
        ...(clones ? list.slice(0,clones).map(p=>item(p,false)) : [])
    ].join('');
    const dots = count > 1
        ? `<div class="slider-dots" role="tablist">${list.map((p,i)=>`<button type="button" class="slider-dot${i===0?' is-active':''}" data-dot="${i}" role="tab" aria-label="${escapeContent(p.name)}"></button>`).join('')}</div>`
        : '';
    return `
    <div class="shop-slider${count<=3?` slider-count-${count}`:''}" data-slider-root role="region" aria-roledescription="carousel" aria-label="${escapeContent(txt('shopPreview_title'))}">
        <div class="slider-glow" aria-hidden="true"></div>
        <button type="button" class="slider-arrow slider-arrow--prev" data-slider-prev aria-label="${escapeContent(txt('previousSlide'))}"><i class="fas fa-chevron-right"></i></button>
        <button type="button" class="slider-arrow slider-arrow--next" data-slider-next aria-label="${escapeContent(txt('nextSlide'))}"><i class="fas fa-chevron-left"></i></button>
        <div class="slider-viewport" data-slider-viewport>
            <div class="slider-track" data-slider-track>${slides}</div>
        </div>
        ${dots}
        <div class="slider-progress" data-slider-progress><span></span></div>
    </div>`;
}

function initShopSlider(container) {
    const root = container.querySelector('.shop-slider');
    if (!root || root.dataset.sliderReady === '1') return;
    const viewport = root.querySelector('[data-slider-viewport]');
    const track = root.querySelector('[data-slider-track]');
    if (!viewport || !track) return;
    const items = Array.from(track.children);
    const count = items.filter(el => el.dataset.real === '1').length;
    if (!count) return;
    root.dataset.sliderReady = '1';

    const offset = Math.round((items.length - count) / 2);
    const loop = offset > 0 && count > 1;
    const AUTOPLAY_MS = 4600;
    // Must stay in sync with the .slider-track transition in styles.css.
    const MOVE_MS = 560;
    const reduce = prefersReducedMotion();

    const dots = Array.from(root.querySelectorAll('.slider-dot'));
    const progress = root.querySelector('[data-slider-progress]');
    const prevBtn = root.querySelector('[data-slider-prev]');
    const nextBtn = root.querySelector('[data-slider-next]');

    let index = Math.min(Math.max(parseInt(container.dataset.sliderIndex || '0', 10) || 0, 0), count - 1);
    let translate = 0, busy = false, queued = 0, queuedDot = -1;
    let timer = null, settleTimer = null, moveFrame = 0, progressFrame = 0;
    let hovering = false, dragging = false, visible = true, dragPointer = null;
    let dragStartX = 0, dragBase = 0, dragDelta = 0, dragLatestX = 0;
    let lastCenter = null;

    const normalize = i => ((i % count) + count) % count;
    const domIndex = i => offset + i;

    // ---- Cached geometry -------------------------------------------------
    // Every slide used to read offsetLeft/offsetWidth/clientWidth straight out
    // of the DOM, which forces a synchronous layout on each step (and on every
    // drag frame). Measuring once per layout change keeps the animation itself
    // free of layout work.
    const metrics = { view: 0, gap: 0, width: 0, centers: [] };
    function measure() {
        metrics.view = viewport.clientWidth;
        const styles = getComputedStyle(track);
        const gap = parseFloat(styles.columnGap || styles.gap);
        metrics.gap = isNaN(gap) ? 0 : gap;
        metrics.centers = items.map(el => el.offsetLeft + el.offsetWidth / 2);
        metrics.width = items[offset] ? items[offset].offsetWidth : 0;
        return metrics.view > 2;
    }
    function centerOf(domI) {
        const c = metrics.centers[domI];
        return c == null ? translate : metrics.view / 2 - c;
    }

    function applyTransform(animated, value) {
        if (!metrics.view && !measure()) return false;
        translate = typeof value === 'number' ? value : centerOf(domIndex(index));
        const css = `translate3d(${translate.toFixed(1)}px,0,0)`;
        // Nothing to animate (e.g. a drag that ended where it started): do not
        // leave the layer hint behind, no transitionend will ever fire.
        if (animated && track.style.transform === css) { track.classList.remove('is-moving'); return true; }
        if (!animated) {
            track.classList.add('no-anim');
            track.style.transform = css;
            // One forced flush so the jump is not animated, then drop the hint.
            void track.offsetWidth;
            track.classList.remove('no-anim', 'is-moving');
            return true;
        }
        track.classList.add('is-moving');
        track.style.transform = css;
        return true;
    }

    // Only the slides whose depth actually changed get touched: repainting the
    // class list of all 14 slides per step was pure style-recalc overhead.
    function paintDepth(force) {
        const center = domIndex(index);
        if (!force && lastCenter === center) return;
        let from, to;
        if (force || lastCenter == null) { from = 0; to = items.length - 1; }
        else { from = Math.min(lastCenter, center) - 2; to = Math.max(lastCenter, center) + 2; }
        lastCenter = center;
        for (let i = from; i <= to; i++) {
            const el = items[i];
            if (!el) continue;
            const d = i - center, a = Math.abs(d);
            el.classList.toggle('is-active', d === 0);
            el.classList.toggle('is-near', a === 1);
            el.classList.toggle('is-far', a > 1);
        }
        const active = normalize(index);
        dots.forEach((dot, i) => {
            const on = i === active;
            if (dot.classList.contains('is-active') !== on) dot.classList.toggle('is-active', on);
        });
        if (container.dataset) container.dataset.sliderIndex = String(active);
    }

    function restartProgress() {
        if (!progress || reduce || !loop) return;
        progress.style.setProperty('--slider-duration', `${AUTOPLAY_MS}ms`);
        progress.classList.remove('is-running');
        // rAF instead of the classic `void offsetWidth` reflow: no forced
        // layout on the main thread on every single slide.
        cancelAnimationFrame(progressFrame);
        progressFrame = requestAnimationFrame(() => {
            if (root.isConnected) progress.classList.add('is-running');
        });
    }
    function stopProgress() {
        cancelAnimationFrame(progressFrame);
        if (progress) progress.classList.remove('is-running');
    }
    function schedule() {
        clearTimeout(timer);
        // A re-render replaced this slider: stop everything instead of
        // accumulating listeners on detached nodes.
        if (!root.isConnected) { teardown(); return; }
        if (!loop || reduce || busy || dragging || hovering || !visible || document.hidden) { stopProgress(); return; }
        timer = setTimeout(() => step(1), AUTOPLAY_MS);
        restartProgress();
    }
    function onMoveEnd(e) {
        if (e.target !== track || e.propertyName !== 'transform') return;
        track.classList.remove('is-moving');
        if (busy) settle();
    }
    track.addEventListener('transitionend', onMoveEnd);
    function afterMotion() {
        clearTimeout(settleTimer);
        // Fallback only: transitionend above normally settles much sooner, so
        // a slide is never blocked for longer than the CSS transition.
        settleTimer = setTimeout(settle, reduce ? 40 : MOVE_MS + 120);
    }
    function settle() {
        clearTimeout(settleTimer);
        const canonical = normalize(index);
        if (canonical !== index) {
            index = canonical;
            applyTransform(false);
        }
        track.classList.remove('is-moving');
        busy = false;
        paintDepth();
        if (queued) { const dir = queued > 0 ? 1 : -1; queued -= dir; step(dir); return; }
        if (queuedDot >= 0) { const target = queuedDot; queuedDot = -1; goToSlide(target); return; }
        schedule();
    }
    function step(dir) {
        if (count < 2 || !loop) return;
        if (busy) { queued += dir; return; }
        index += dir;
        busy = true;
        if (!applyTransform(true)) { busy = false; index = normalize(index); return; }
        paintDepth();
        afterMotion();
    }
    function goToSlide(target) {
        if (count < 2) return;
        const canonical = normalize(index);
        let diff = ((target - canonical) % count + count) % count;
        if (diff > count / 2) diff -= count;
        if (busy) { queuedDot = target; return; }
        if (!diff) return;
        if (domIndex(canonical + diff) < 0 || domIndex(canonical + diff) >= items.length) {
            index = target;
            applyTransform(false);
            paintDepth();
            schedule();
            return;
        }
        busy = true;
        index = canonical + diff;
        if (!applyTransform(true)) { busy = false; index = canonical; return; }
        paintDepth();
        afterMotion();
    }

    // Controls
    if (prevBtn) prevBtn.addEventListener('click', () => { queued = 0; queuedDot = -1; step(-1); });
    if (nextBtn) nextBtn.addEventListener('click', () => { queued = 0; queuedDot = -1; step(1); });
    dots.forEach(dot => dot.addEventListener('click', () => { queued = 0; queuedDot = -1; goToSlide(+dot.dataset.dot); }));

    // Pause while the visitor is exploring the slider
    root.addEventListener('pointerenter', () => { hovering = true; schedule(); });
    root.addEventListener('pointerleave', () => { hovering = false; schedule(); });
    root.addEventListener('focusin', () => { hovering = true; schedule(); });
    root.addEventListener('focusout', () => { hovering = false; schedule(); });
    document.addEventListener('visibilitychange', schedule);
    root.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') { step(1); e.preventDefault(); }
        if (e.key === 'ArrowRight') { step(-1); e.preventDefault(); }
    });

    // ---- Drag / swipe (one style write per frame) ------------------------
    function paintDrag() {
        moveFrame = 0;
        if (!dragging) return;
        dragDelta = dragLatestX - dragStartX;
        track.classList.add('no-anim', 'is-moving');
        track.style.transform = `translate3d(${(dragBase + dragDelta * 0.92).toFixed(1)}px,0,0)`;
    }
    viewport.addEventListener('pointerdown', e => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        if (e.target.closest('.slider-arrow, .slider-dot, a, button[data-quick]')) return;
        dragging = true; dragPointer = e.pointerId; dragStartX = e.clientX; dragLatestX = e.clientX;
        dragDelta = 0; dragBase = translate;
        viewport.classList.add('is-dragging');
        clearTimeout(timer); stopProgress();
        try { viewport.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    });
    viewport.addEventListener('pointermove', e => {
        if (!dragging || e.pointerId !== dragPointer) return;
        dragLatestX = e.clientX;
        if (Math.abs(dragLatestX - dragStartX) > 6 && e.cancelable) e.preventDefault();
        if (moveFrame) return;
        moveFrame = requestAnimationFrame(paintDrag);
    });
    const endDrag = e => {
        if (!dragging || (e && e.pointerId !== dragPointer)) return;
        cancelAnimationFrame(moveFrame); moveFrame = 0;
        dragging = false;
        viewport.classList.remove('is-dragging');
        track.classList.remove('no-anim');
        try { viewport.releasePointerCapture(dragPointer); } catch (err) { /* ignore */ }
        dragPointer = null;
        const stride = metrics.width ? metrics.width + metrics.gap : 100;
        const moved = Math.abs(dragDelta);
        const steps = moved > Math.max(40, stride * 0.18) ? Math.max(1, Math.min(2, Math.round(moved / stride))) : 0;
        if (moved > 8) {
            // swallow the click that the browser fires right after a swipe
            const kill = ev => { ev.stopPropagation(); ev.preventDefault(); };
            viewport.addEventListener('click', kill, { capture: true, once: true });
            setTimeout(() => viewport.removeEventListener('click', kill, true), 260);
        }
        if (steps) {
            for (let i = 0; i < steps; i++) { if (i === 0) step(dragDelta > 0 ? 1 : -1); else queued += dragDelta > 0 ? 1 : -1; }
        } else {
            applyTransform(true, dragBase);
            schedule();
        }
        dragDelta = 0;
    };
    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);
    viewport.addEventListener('lostpointercapture', endDrag);
    viewport.addEventListener('dragstart', e => e.preventDefault());

    // ---- Layout changes --------------------------------------------------
    const relayout = () => { if (!measure()) return; if (!applyTransform(false)) return; paintDepth(true); };
    let ro = null, io = null, resizeQueued = false;
    function teardown() {
        window.removeEventListener('resize', onResize);
        document.removeEventListener('shop-slider-refresh', onRefresh);
        track.removeEventListener('transitionend', onMoveEnd);
        if (ro) ro.disconnect();
        if (io) io.disconnect();
        cancelAnimationFrame(moveFrame); cancelAnimationFrame(progressFrame);
        clearTimeout(timer); clearTimeout(settleTimer);
    }
    const onResize = () => {
        // A re-render replaces this slider's DOM; drop stale global listeners
        // instead of accumulating layout reads on detached nodes forever.
        if (!root.isConnected) { teardown(); return; }
        if (resizeQueued) return;
        resizeQueued = true;
        requestAnimationFrame(() => { resizeQueued = false; relayout(); });
    };
    const onRefresh = () => { if (root.isConnected) relayout(); };
    window.addEventListener('resize', onResize);
    document.addEventListener('shop-slider-refresh', onRefresh);
    if (typeof ResizeObserver === 'function') {
        ro = new ResizeObserver(onResize);
        ro.observe(viewport);
    }
    if (typeof IntersectionObserver === 'function') {
        io = new IntersectionObserver(entries => {
            visible = entries.some(en => en.isIntersecting);
            // Off-screen carousel: park every running animation with it.
            root.classList.toggle('slider-paused', !visible);
            if (visible) { relayout(); schedule(); } else { stopProgress(); clearTimeout(timer); }
        }, { threshold: 0.15 });
        io.observe(root);
    }

    requestAnimationFrame(() => { relayout(); paintDepth(true); schedule(); });
}

function refreshShopEverywhere() {
    document.querySelectorAll('[data-role="shop-grid"]').forEach(el => {
        renderShop(el, {category:'all', limit:parseInt(el.dataset.limit)||0, showFilters:el.dataset.showFilters!=='false'});
    });
    document.dispatchEvent(new Event('shop-slider-refresh'));
}

// ============== Full-site maintenance mode ==============
// When the admin enables SITE.maintenanceMode, every public page is replaced
// by a single animated «در حال بروزرسانی» screen and all other access is
// blocked. The admin panel never gets the overlay, so the switch can always
// be turned off again. maintenance-gate.js shows a minimal version of this
// screen before app.js even loads.
const MAINTENANCE_CACHE_KEY = 'amir_maintenance_v1';
function maintenanceScreenHtml() {
    const socials = contentItems('socials').slice(0, 6).map(s =>
        `<a href="${s.url || '#'}" ${s.url && s.url.startsWith('http') ? 'target="_blank" rel="noopener"' : ''} title="${escapeContent(s.name)}" style="--s-color:${s.color || 'var(--primary)'}"><i class="${s.icon}"></i></a>`).join('');
    return `
    <div class="maintenance-screen" id="maintenanceScreen" role="alert" aria-live="assertive">
        <div class="ms-bg" aria-hidden="true">
            <span class="ms-grid"></span>
            <span class="ms-glow ms-glow--1"></span>
            <span class="ms-glow ms-glow--2"></span>
            <span class="ms-particle ms-p1"></span><span class="ms-particle ms-p2"></span><span class="ms-particle ms-p3"></span>
            <span class="ms-particle ms-p4"></span><span class="ms-particle ms-p5"></span><span class="ms-particle ms-p6"></span>
        </div>
        <div class="ms-content">
            <div class="ms-visual" aria-hidden="true">
                <span class="ms-ring ms-ring--outer"></span>
                <span class="ms-ring ms-ring--mid"></span>
                <span class="ms-ring ms-ring--inner"></span>
                <i class="fas fa-gear ms-gear ms-gear--1"></i>
                <i class="fas fa-gear ms-gear ms-gear--2"></i>
                <i class="fas fa-gear ms-gear ms-gear--3"></i>
                <span class="ms-core"><i class="fas fa-screwdriver-wrench"></i></span>
            </div>
            <div class="ms-brand"><i class="fas fa-code"></i><span data-text="brand">${escapeContent(txt('brand'))}</span></div>
            <h1 class="ms-title" data-text="maintenance_title">${escapeContent(txt('maintenance_title'))}</h1>
            <p class="ms-desc" data-text="maintenance_desc">${escapeContent(txt('maintenance_desc'))}</p>
            <div class="ms-progress" aria-hidden="true"><span></span></div>
            ${socials ? `<div class="ms-socials" aria-label="${escapeContent(txt('footer_label_7'))}">${socials}</div>` : ''}
            <p class="ms-foot" dir="ltr">${escapeContent(txt('copyright'))}</p>
        </div>
    </div>`;
}
function applyMaintenanceMode() {
    if (!document.body.classList.contains('public-site')) return;
    const on = SITE.maintenanceMode === true;
    // The pre-paint gate adds these classes to <html>; once the real mode is
    // known they must go, otherwise a stale flag keeps body children hidden.
    document.documentElement.classList.remove('maintenance-gate', 'maintenance-checking');
    try { localStorage.setItem(MAINTENANCE_CACHE_KEY + '_brand', txt('brand')); } catch (e) { /* private mode */ }
    document.body.classList.toggle('maintenance-on', on);
    const screen = document.getElementById('maintenanceScreen');
    const gate = document.getElementById('maintenanceGate');
    if (gate) gate.remove();
    if (on) {
        if (!screen) {
            document.body.insertAdjacentHTML('beforeend', maintenanceScreenHtml());
            if (typeof applyContentControls === 'function') applyContentControls();
        }
        try { localStorage.setItem(MAINTENANCE_CACHE_KEY, '1'); } catch (e) { /* private mode */ }
    } else {
        if (screen) screen.remove();
        try { localStorage.setItem(MAINTENANCE_CACHE_KEY, '0'); } catch (e) { /* private mode */ }
    }
}

// ============== Animated overlays (shared by shop + projects) ==============
function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}
const OVERLAY_TIMING = { open: 640, close: 520 };

function overlayPanel(overlay) {
    return overlay ? overlay.querySelector('.modal-lg, .modal-md') : null;
}
// Opens an overlay with a "fly out of the card" animation (FLIP) when a
// source element is given, and a soft zoom otherwise.
function openAnimatedOverlay(overlay, sourceEl) {
    if (!overlay) return;
    const panel = overlayPanel(overlay);
    if (!panel) { overlay.classList.add('active', 'is-open'); document.body.style.overflow = 'hidden'; return; }
    const reduce = prefersReducedMotion();
    overlay.__source = sourceEl || null;
    overlay.classList.remove('is-open', 'is-closing');
    ['--m-from-x','--m-from-y','--m-from-sx','--m-from-sy','--m-from-rot',
     '--m-to-x','--m-to-y','--m-to-sx','--m-to-sy','--m-to-rot'].forEach(v => panel.style.removeProperty(v));
    panel.style.removeProperty('transform');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (panel.scrollTo) panel.scrollTop = 0;

    if (sourceEl && !reduce && sourceEl.isConnected) {
        panel.style.transform = 'none';
        const to = panel.getBoundingClientRect();
        panel.style.transform = '';
        const from = sourceEl.getBoundingClientRect();
        if (to.width > 4 && to.height > 4 && from.width > 4) {
            const sx = Math.min(1, Math.max(.14, from.width / to.width));
            const sy = Math.min(1, Math.max(.14, from.height / to.height));
            panel.style.setProperty('--m-from-x', `${((from.left + from.width/2) - (to.left + to.width/2)).toFixed(1)}px`);
            panel.style.setProperty('--m-from-y', `${((from.top + from.height/2) - (to.top + to.height/2)).toFixed(1)}px`);
            panel.style.setProperty('--m-from-sx', sx.toFixed(3));
            panel.style.setProperty('--m-from-sy', sy.toFixed(3));
            panel.style.setProperty('--m-from-rot', '-4deg');
        }
    }
    requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('is-open')));
}
// Closes it again: shrinks back onto the card it came from, then hides it.
function closeAnimatedOverlay(overlay, done) {
    if (!overlay || !overlay.classList.contains('active')) {
        if (overlay) { overlay.classList.remove('active', 'is-open', 'is-closing'); }
        document.body.style.overflow = '';
        if (done) done();
        return;
    }
    const panel = overlayPanel(overlay);
    const reduce = prefersReducedMotion();
    const finish = () => {
        overlay.classList.remove('active', 'is-open', 'is-closing');
        overlay.__source = null;
        if (panel) {
            ['--m-from-x','--m-from-y','--m-from-sx','--m-from-sy','--m-from-rot',
             '--m-to-x','--m-to-y','--m-to-sx','--m-to-sy','--m-to-rot'].forEach(v => panel.style.removeProperty(v));
        }
        document.body.style.overflow = '';
        if (done) done();
    };
    if (panel) {
        const source = overlay.__source;
        ['--m-to-x','--m-to-y','--m-to-sx','--m-to-sy','--m-to-rot'].forEach(v => panel.style.removeProperty(v));
        if (source && source.isConnected && !reduce) {
            const to = source.getBoundingClientRect();
            const from = panel.getBoundingClientRect();
            if (to.width > 4 && from.width > 4) {
                panel.style.setProperty('--m-to-x', `${((to.left + to.width/2) - (from.left + from.width/2)).toFixed(1)}px`);
                panel.style.setProperty('--m-to-y', `${((to.top + to.height/2) - (from.top + from.height/2)).toFixed(1)}px`);
                panel.style.setProperty('--m-to-sx', Math.min(1, Math.max(.14, to.width / from.width)).toFixed(3));
                panel.style.setProperty('--m-to-sy', Math.min(1, Math.max(.14, to.height / from.height)).toFixed(3));
                panel.style.setProperty('--m-to-rot', '3deg');
            }
        }
    }
    overlay.classList.remove('is-open');
    overlay.classList.add('is-closing');
    setTimeout(finish, reduce ? 40 : OVERLAY_TIMING.close);
}

document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const open = Array.from(document.querySelectorAll('.overlay.active')).pop();
    if (!open) return;
    if (open.id === 'productModal') closeProductModal();
    else if (open.id === 'projectModal') closeProjectDetail();
    else if (open.id === 'cartModal') closeCart();
    else closeAnimatedOverlay(open);
});

// ============== Product Detail Modal ==============
let currentDetailQty = 1;
let currentDetailPid = null;
function openProductDetail(pid, sourceEl) {
    const p = getProduct(pid); if (!p || !SITE.shopEnabled) return;
    currentDetailPid = pid; currentDetailQty = CART[pid] || 1;
    const badges={hot:txt('badge_hot'),new:txt('badge_new'),sale:txt('badge_sale')};
    const overlay = document.getElementById('productModal') || createProductModal();
    overlay.dataset.itemList='products'; overlay.dataset.itemId=String(pid);
    const icon = overlay.querySelector('.product-detail-icon');
    icon.classList.toggle('has-photo', !!p.image);
    icon.innerHTML = `${p.badge?`<span class="product-badge badge-${p.badge}">${badges[p.badge]}</span>`:''}${p.image?`<img src="${p.image}" alt="${escapeContent(p.name)}">`:`<i class="${p.icon}"></i>`}`;
    overlay.querySelector('.product-detail-cat').textContent = txt('category_'+p.category);
    overlay.querySelector('.product-detail-title').textContent = p.name;
    overlay.querySelector('.product-detail-desc').textContent = p.description||'';
    overlay.querySelector('.product-detail-long').textContent = p.longDescription||'';
    overlay.querySelector('.product-detail-long').style.display = p.longDescription ? 'block' : 'none';
    overlay.querySelector('.pd-price').textContent = formatPrice(p.price);
    overlay.querySelector('.pd-unit').textContent = `${txt('currency')} / ${p.unit}`;
    overlay.querySelector('.product-detail-features').innerHTML = (p.features||[]).map(f=>`<li><i class="fas fa-check-circle"></i> ${escapeContent(f)}</li>`).join('');
    const qtyInput = overlay.querySelector('.qty-input');
    qtyInput.value = currentDetailQty;
    updateDetailTotal();
    if (typeof applyContentControls === 'function') applyContentControls();
    openAnimatedOverlay(overlay, sourceEl || overlay.__source || document.querySelector(`.product-card[data-pid="${pid}"]`));
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
                            <span style="font-size:0.85rem;color:var(--text-secondary);">${uiText('quantity')}:</span>
                            <div class="qty-control">
                                <button type="button" data-qty="minus"><i class="fas fa-minus"></i></button>
                                <input type="number" class="qty-input" min="1" value="1">
                                <button type="button" data-qty="plus"><i class="fas fa-plus"></i></button>
                            </div>
                        </div>
                    </div>
                    <p style="font-size:0.9rem;margin-bottom:0.5rem;">${uiText('totalPrice')}: <span class="pd-total-qty" style="font-weight:700;color:var(--primary);">1</span> ${uiText('itemCount')} = <strong class="pd-total-price" style="color:var(--primary);">-</strong></p>
                    <div class="detail-actions">
                        <button class="btn btn-primary" id="addCartBtn"><i class="fas fa-cart-plus"></i> ${uiText('addToCart')}</button>
                        <button class="btn btn-outline" id="viewCartBtn" data-close><i class="fas fa-shopping-basket"></i> ${uiText('viewCart')}</button>
                    </div>
                </div>
            </div>
        </div>`;
    document.body.appendChild(div);
    if (typeof applyContentControls === 'function') applyContentControls();
    div.addEventListener('click', e => { if (e.target===div || e.target.closest('[data-close]')) { closeProductModal(); } });
    div.classList.add('overlay--product');
    const panel = div.querySelector('.modal-lg'); if (panel) panel.classList.add('modal-animated');
    div.querySelector('[data-qty="plus"]').addEventListener('click', () => { const i=div.querySelector('.qty-input'); i.value=Math.max(1,(parseInt(i.value)||1)+1); updateDetailTotal(); });
    div.querySelector('[data-qty="minus"]').addEventListener('click', () => { const i=div.querySelector('.qty-input'); i.value=Math.max(1,(parseInt(i.value)||1)-1); updateDetailTotal(); });
    div.querySelector('.qty-input').addEventListener('input', () => { const i=div.querySelector('.qty-input'); if(parseInt(i.value)<1)i.value=1; updateDetailTotal(); });
    div.querySelector('#addCartBtn').addEventListener('click', () => {
        const q = parseInt(div.querySelector('.qty-input').value)||1;
        addToCart(currentDetailPid, q);
        closeProductModal();
    });
    div.querySelector('#viewCartBtn').addEventListener('click', () => { closeProductModal(openCart); });
    return div;
}
function closeProductModal(done) {
    closeAnimatedOverlay(document.getElementById('productModal'), done);
}

// ============== Cart ==============
function addToCart(pid, qty=1) {
    if (!SITE.shopEnabled || !getProduct(pid)) return;
    CART[pid] = (CART[pid]||0) + qty;
    saveCart(CART);
}
function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    const floatBtn = document.getElementById('cartFloat');
    const count = cartCount();
    if (badge) badge.textContent = toPersianNum(count);
    if (floatBtn) {
        floatBtn.setAttribute('aria-label', `${txt('cartTitle')}, ${toPersianNum(count)} ${txt('itemCount')}`);
        if (count > 0 && SITE.shopEnabled) {
            const wasHidden = floatBtn.hidden;
            floatBtn.hidden = false;
            if (wasHidden) {
                floatBtn.classList.remove('cart-float--visible');
                requestAnimationFrame(() => floatBtn.classList.add('cart-float--visible'));
            }
        } else {
            floatBtn.hidden = true;
            floatBtn.classList.remove('cart-float--visible');
        }
    }
}
function createCartUI() {
    if (!document.body.classList.contains('public-site') || document.getElementById('cartFloat')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cart-float'; btn.id = 'cartFloat'; btn.title = txt('cartTitle');
    btn.innerHTML = `<i class="fas fa-shopping-cart" aria-hidden="true"></i><span class="cart-float-label">${uiText('cartTitle')}</span><span class="cart-badge" id="cartBadge">۰</span>`;
    btn.addEventListener('click', openCart);
    btn.hidden = true;
    document.body.appendChild(btn);
    updateCartBadge();
}
function openCart() {
    const overlay = document.getElementById('cartModal') || createCartModal();
    renderCartItems();
    openAnimatedOverlay(overlay, document.getElementById('cartFloat'));
}
function closeCart(done) { closeAnimatedOverlay(document.getElementById('cartModal'), done); }
function createCartModal() {
    const div = document.createElement('div');
    div.className='overlay'; div.id='cartModal';
    div.innerHTML = `
        <div class="modal-md">
            <button class="modal-close" data-close><i class="fas fa-times"></i></button>
            <div class="cart-header"><h2><i class="fas fa-shopping-basket"></i> ${uiText('cartTitle')}</h2></div>
            <div class="cart-body" id="cartBody"></div>
            <div class="cart-footer">
                <div class="cart-total"><span>${uiText('cartTotal')}:</span><span class="cart-total-price" id="cartTotal">0</span></div>
                <div class="cart-actions">
                    <button class="btn btn-outline btn-sm" data-close>${uiText('continueShopping')}</button>
                    <button class="btn btn-primary btn-sm" id="checkoutBtn"><i class="fas fa-credit-card"></i> ${uiText('completeOrder')}</button>
                </div>
            </div>
        </div>`;
    document.body.appendChild(div);
    if (typeof applyContentControls === 'function') applyContentControls();
    div.addEventListener('click', e => { if(e.target===div||e.target.closest('[data-close]')) closeCart(); });
    div.querySelector('#checkoutBtn').addEventListener('click', () => { closeCart(openCheckout); });
    return div;
}
function renderCartItems() {
    const body = document.getElementById('cartBody');
    const items = Object.entries(CART);
    if (!items.length) {
        body.innerHTML = `<div class="cart-empty"><i class="fas fa-shopping-cart"></i><p>${uiText('cartEmpty')}</p><a href="shop.html" class="btn btn-primary btn-sm" style="margin-top:1rem;display:inline-flex;" data-close><i class="fas fa-store"></i> ${uiText('goToShop')}</a></div>`;
        document.getElementById('cartTotal').textContent = toPersianNum(0);
        return;
    }
    body.innerHTML = items.map(([pid,qty]) => {
        const p = getProduct(+pid); if(!p) return '';
        return `<div class="cart-item">
            <div class="cart-item-icon${p.image?' has-photo':''}">${p.image?`<img src="${p.image}" alt="${escapeContent(p.name)}">`:`<i class="${p.icon}"></i>`}</div>
            <div class="cart-item-info">
                <h4>${escapeContent(p.name)}</h4>
                <span>${toPersianNum(qty)} × ${formatPrice(p.price)} ${escapeContent(txt('currency'))}</span>
            </div>
            <div class="cart-item-price">${formatPrice(p.price*qty)} ${escapeContent(txt('currency'))}</div>
            <button class="cart-item-remove" data-remove="${p.id}" title="${escapeContent(txt('remove'))}"><i class="fas fa-trash"></i></button>
        </div>`;
    }).join('');
    document.getElementById('cartTotal').textContent = formatPrice(cartTotal()) + ' ' + txt('currency');
    body.querySelectorAll('[data-remove]').forEach(b => b.addEventListener('click', () => {
        delete CART[b.dataset.remove]; saveCart(CART); renderCartItems(); updateCartBadge();
    }));
}

// ============== Checkout ==============
function openCheckout() {
    if (!SITE.shopEnabled) return;
    if (Object.keys(CART).length === 0) { showToast(txt('cartEmpty'),'error'); return; }
    const overlay = document.getElementById('checkoutModal') || createCheckoutModal();
    renderCheckoutSummary();
    openAnimatedOverlay(overlay, document.getElementById('cartFloat'));
}
function closeCheckout(done) { closeAnimatedOverlay(document.getElementById('checkoutModal'), done); }
function createCheckoutModal() {
    const div = document.createElement('div');
    div.className='overlay'; div.id='checkoutModal';
    div.innerHTML = `
        <div class="modal-md">
            <button class="modal-close" data-close><i class="fas fa-times"></i></button>
            <div class="checkout-header">
                <h2><i class="fas fa-file-invoice"></i> ${uiText('checkoutTitle')}</h2>
                <p>${uiText('checkoutDesc')}</p>
            </div>
            <form id="checkoutForm" class="checkout-body">
                <div class="order-summary" id="orderSummary"></div>
                <div class="checkout-fields-grid">
                    <div class="form-group"><label for="chName">${uiText('yourName')}</label><input type="text" id="chName" autocomplete="name" maxlength="80" required></div>
                    <div class="form-group"><label for="chPhone">${uiText('yourPhone')}</label><input type="tel" id="chPhone" autocomplete="tel" inputmode="tel" maxlength="20" required placeholder="${escapeContent(txt('contact_placeholder_cPhone'))}"></div>
                </div>
                <div class="form-group telegram-id-field">
                    <label for="chTelegram"><i class="fab fa-telegram" aria-hidden="true"></i> ${uiText('yourTelegramId')}</label>
                    <div class="telegram-input-wrap"><span aria-hidden="true">@</span><input type="text" id="chTelegram" dir="ltr" autocomplete="username" autocapitalize="none" spellcheck="false" minlength="5" maxlength="32" required placeholder="username"></div>
                    <small>${uiText('telegramIdHint')}</small>
                </div>
                <div class="form-group"><label for="chEmail">${uiText('yourEmail')}</label><input type="email" id="chEmail" autocomplete="email" maxlength="120"></div>
                <div class="form-group"><label for="chNote">${uiText('orderNote')}</label><textarea id="chNote" rows="3" maxlength="600"></textarea></div>
                <div id="checkoutMsg"></div>
                <button type="submit" class="btn btn-primary btn-block"><i class="fab fa-telegram"></i> ${uiText('sendOrder')}</button>
            </form>
        </div>`;
    document.body.appendChild(div);
    if (typeof applyContentControls === 'function') applyContentControls();
    div.addEventListener('click', e => { if(e.target===div||e.target.closest('[data-close]')) closeCheckout(); });
    div.querySelector('#checkoutForm').addEventListener('submit', handleCheckoutSubmit);
    return div;
}
function renderCheckoutSummary() {
    const items = Object.entries(CART);
    let total = 0;
    let html = `<h4>${uiText('orderSummary')}</h4>`;
    items.forEach(([pid,qty]) => {
        const p = getProduct(+pid); if(!p) return;
        total += p.price*qty;
        html += `<div class="order-item"><span>${escapeContent(p.name)} × ${toPersianNum(qty)}</span><span>${formatPrice(p.price*qty)} ${escapeContent(txt('currency'))}</span></div>`;
    });
    html += `<div class="order-item"><span>${uiText('cartTotal')}</span><span>${formatPrice(total)} ${escapeContent(txt('currency'))}</span></div>`;
    document.getElementById('orderSummary').innerHTML = html;
}
function normaliseTelegramUsername(value) {
    return String(value || '')
        .trim()
        .replace(/^https?:\/\/(?:www\.)?t\.me\//i, '')
        .replace(/^@+/, '')
        .replace(/\/$/, '');
}

async function handleCheckoutSubmit(e) {
    e.preventDefault();
    if (!SITE.shopEnabled) return;
    const form = e.currentTarget;
    const name = document.getElementById('chName').value.trim();
    const phone = document.getElementById('chPhone').value.trim();
    const telegramInput = document.getElementById('chTelegram');
    const telegramUsername = normaliseTelegramUsername(telegramInput.value);
    const email = document.getElementById('chEmail').value.trim();
    const note = document.getElementById('chNote').value.trim();
    const msgBox = document.getElementById('checkoutMsg');
    const btn = form.querySelector('button[type=submit]');

    // Telegram usernames are 5–32 characters and only contain Latin letters,
    // numbers and underscores. Keeping this strict gives the admin a working link.
    if (!/^[A-Za-z][A-Za-z0-9_]{4,31}$/.test(telegramUsername)) {
        telegramInput.setCustomValidity(txt('telegramInvalid'));
        telegramInput.reportValidity();
        telegramInput.addEventListener('input', () => telegramInput.setCustomValidity(''), { once: true });
        return;
    }

    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${escapeContent(txt('placingOrder'))}`;
    msgBox.className = '';
    msgBox.textContent = '';

    const invoiceId = 'ORD-' + Date.now().toString(36).toUpperCase();
    const items = Object.entries(CART).map(([pid,qty]) => {
        const p = getProduct(+pid);
        return p ? { pid: p.id, name: p.name, qty, price: p.price, icon: p.icon } : null;
    }).filter(Boolean);
    const total = cartTotal();
    const order = {
        id: invoiceId,
        name,
        phone,
        telegramId: `@${telegramUsername}`,
        email,
        note,
        items,
        total,
        date: new Date().toISOString()
    };

    try {
        const response = await fetch('/.netlify/functions/create-order', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(order)
        });
        const serverResp = await response.json().catch(() => ({}));
        if (!response.ok || !serverResp.ok) {
            throw new Error(serverResp.code === 'SITE_IN_MAINTENANCE' ? txt('maintenance_title')
                : serverResp.code === 'SHOP_UNAVAILABLE' ? txt('shopDisabled_title')
                : txt('orderError'));
        }
        // The server returns a deep link built only from the username obtained
        // from the bot token that the admin webhooked in the panel. Never fall
        // back to a social/profile link or to browser-side bot settings.
        if (!serverResp.telegramUrl || !/^https:\/\/t\.me\/[A-Za-z0-9_]+\?start=/.test(serverResp.telegramUrl)) {
            throw new Error(txt('botUnavailable'));
        }

        SITE.orders = SITE.orders || [];
        SITE.orders.push({...order, sent: true});
        saveData();
        CART = {};
        saveCart(CART);

        msgBox.className = 'form-message success';
        msgBox.textContent = txt('invoiceReady');
        setTimeout(() => window.location.assign(serverResp.telegramUrl), 850);
    } catch (error) {
        msgBox.className = 'form-message error';
        msgBox.textContent = error && error.message
            ? error.message
            : txt('orderError');
        btn.disabled = false;
        btn.innerHTML = `<i class="fab fa-telegram"></i> ${uiText('sendOrder')}`;
    }
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
    const sig = arrSig(contentItems('socials'), s => [s.id, s.icon || '', shash(s.name), shash(s.url), s.color || ''].join(','));
    document.querySelectorAll('[data-role="socials"]').forEach(c => {
        if (c.dataset.renderSig === sig && c.firstChild) return;
        c.dataset.renderSig = sig;
        c.innerHTML = contentItems('socials').map(s => `<a href="${s.url||'#'}" ${s.url&&s.url.startsWith('http')?'target="_blank"':''} title="${escapeContent(s.name)}"><i class="${s.icon}"></i></a>`).join('');
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
        if (msg) { msg.className='form-message success'; msg.textContent=txt('formSuccess'); msg.classList.toggle('content-text-hidden',!isVisible('text:formSuccess')); }
        form.reset();
        setTimeout(()=>{ if(msg){msg.className='form-message';msg.textContent='';} }, 5000);
    });
}
function initCounters() {
    const counters=document.querySelectorAll('.stat-number[data-target]'); if(!counters.length)return;
    const anim=el=>{const t=+el.getAttribute('data-target');let c=0;const s=t/50;const tk=()=>{c+=s;if(c<t){el.textContent=toPersianNum(Math.ceil(c));requestAnimationFrame(tk);}else el.textContent=toPersianNum(t);};tk();};
    if (typeof IntersectionObserver === 'undefined') { counters.forEach(anim); return; }
    const obs=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){anim(e.target);obs.unobserve(e.target);}});},{threshold:0.5});
    counters.forEach(c=>obs.observe(c));
}
function setYear() { const y=document.getElementById('currentYear'); if(y) y.textContent=toPersianNum(new Date().getFullYear()); }

// ============== Public content protection & motion ==============
function initContentProtection() {
    if (!document.body.classList.contains('public-site')) return;
    const isEditable = target => target && target.closest && target.closest('input, textarea, [contenteditable="true"]');
    document.addEventListener('copy', event => {
        if (!isEditable(event.target)) event.preventDefault();
    });
    document.addEventListener('dragstart', event => {
        if (event.target && event.target.closest('img')) event.preventDefault();
    });
}

let motionObserver = null;
function initMotionEffects() {
    if (!document.body.classList.contains('public-site')) return;
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targets = document.querySelectorAll(
        '.section-header, .page-title, .page-subtitle, .feature-card, .product-card, .project-card, .about-photo-wrapper, .about-header, .about-block, .skills-container, .contact-card, .contact-form, .cta-box'
    );

    if (reduceMotion || typeof IntersectionObserver === 'undefined') {
        targets.forEach(el => el.classList.add('motion-reveal', 'is-visible'));
        return;
    }

    if (!motionObserver) {
        motionObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                motionObserver.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    }

    targets.forEach((el, index) => {
        if (el.classList.contains('motion-reveal')) return;
        // Slides inside the best-sellers slider are clipped by the track, so
        // they must never wait for a scroll-reveal that cannot happen.
        if (el.closest('.shop-slider')) return;
        el.classList.add('motion-reveal');
        el.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 75}ms`);
        motionObserver.observe(el);
    });

    if (!document.querySelector('.neon-cursor-glow') && window.matchMedia('(pointer:fine)').matches) {
        const glow = document.createElement('div');
        glow.className = 'neon-cursor-glow';
        glow.setAttribute('aria-hidden', 'true');
        document.body.appendChild(glow);
        let glowX = 0, glowY = 0, glowQueued = false;
        window.addEventListener('pointermove', event => {
            // Coalesce to one style write per frame (was: every mousemove).
            glowX = event.clientX; glowY = event.clientY;
            if (glowQueued) return;
            glowQueued = true;
            requestAnimationFrame(() => {
                glowQueued = false;
                glow.style.setProperty('--pointer-x', `${glowX}px`);
                glow.style.setProperty('--pointer-y', `${glowY}px`);
                glow.classList.add('is-active');
            });
        }, { passive: true });
        document.documentElement.addEventListener('mouseleave', () => glow.classList.remove('is-active'));
    }
}

// ============== About page: typewriter intro ==============
function typeInto(el, text, speed, done) {
    if (!el) { if (done) done(); return; }
    const reduce = prefersReducedMotion();
    text = String(text == null ? '' : text);
    if (reduce || !text) { el.textContent = text; el.dataset.typed = 'done'; el.classList.remove('is-typing', 'typing-caret'); if (done) done(); return; }
    el.classList.add('is-typing', 'typing-caret');
    el.textContent = '';
    let i = 0, timer = null;
    const cleanup = () => {
        clearTimeout(timer);
        el.classList.remove('is-typing');
        el.classList.remove('typing-caret');
        el.dataset.typed = 'done';
        if (el.dataset.text) el.textContent = txt(el.dataset.text);
    };
    const tick = () => {
        // Two chars per tick: halves DOM writes + layouts on long paragraphs
        // while keeping the same visible speed (delay is doubled too).
        i = Math.min(text.length, i + 2);
        el.textContent = text.slice(0, i);
        if (i >= text.length) { cleanup(); if (done) done(); return; }
        const ch = text.charAt(i - 1);
        let delay = speed * 2;
        if (ch === ' ') delay = speed;
        else if ('.،؛:!?؟'.indexOf(ch) !== -1) delay = speed * 7;
        timer = setTimeout(tick, delay);
    };
    timer = setTimeout(tick, speed * 2);
}
function initTypewriter() {
    const nameEl = document.querySelector('.about-content .about-name') || document.querySelector('[data-text="about_name"]');
    const introEl = document.querySelector('[data-text="about_intro"]');
    if (!nameEl && !introEl) return;
    if ((nameEl && nameEl.dataset.typed === 'done') || (introEl && introEl.dataset.typed === 'done')) return;
    const target = introEl || nameEl;
    const run = () => {
        if (target.dataset.typingStarted === '1') return;
        target.dataset.typingStarted = '1';
        typeInto(nameEl, txt('about_name'), 62, () => {
            typeInto(introEl, txt('about_intro'), 15);
        });
    };
    if (typeof IntersectionObserver === 'undefined' || prefersReducedMotion()) { run(); return; }
    const io = new IntersectionObserver(entries => {
        if (!entries.some(en => en.isIntersecting)) return;
        io.disconnect();
        run();
    }, { threshold: 0.25 });
    io.observe(target.closest('.about-content') || target);
    // Safety net: if the section is already on screen (or never observed),
    // typing still starts on its own.
    setTimeout(() => {
        if (target.dataset.typingStarted === '1') return;
        const rect = target.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) { io.disconnect(); run(); }
    }, 900);
}

// ============== Section renderers shared by all pages ==============
function renderFeaturesGrid() {
    const fg = document.getElementById('featuresGrid');
    if (!fg) return;
    const sig = arrSig(contentItems('features'), cardSig);
    if (fg.dataset.renderSig === sig && fg.firstChild) return;
    fg.dataset.renderSig = sig;
    fg.innerHTML = contentItems('features').map(f => `
        <div class="feature-card" data-item-list="features" data-item-id="${f.id}">
            <div class="feature-icon${f.image?' has-photo':''}">${f.image?`<img src="${f.image}" alt="${escapeContent(f.title)}" loading="lazy">`:`<i class="${f.icon}"></i>`}</div>
            <h3>${escapeContent(f.title)}</h3>
            <p>${escapeContent(f.desc)}</p>
        </div>`).join('');
}
// ---- Media (gallery) slider: crossfade slides with dots, arrows and swipe ----
function mediaSlidesHtml(p, opts = {}) {
    const slides = (p.gallery && p.gallery.length) ? p.gallery : (p.image ? [p.image] : []);
    if (!slides.length) return '';
    const multiple = slides.length > 1;
    return `<div class="media-slider${multiple ? '' : ' is-single'}${opts.hero ? ' media-slider--hero' : ''}" data-media-slider${multiple && opts.autoplay ? ` data-autoplay="${opts.autoplay}"` : ''}>
        ${slides.map((src, i) => `<div class="media-slide${i === 0 ? ' is-active' : ''}"${i ? ' aria-hidden="true"' : ''}><img src="${src}" alt="${escapeContent(p.title || p.name || '')}" loading="lazy"><button type="button" class="media-zoom" data-media-zoom="${i}" aria-label="${escapeContent(txt('zoomImage'))}" title="${escapeContent(txt('zoomImage'))}"><i class="fas fa-magnifying-glass-plus"></i></button></div>`).join('')}
        ${multiple ? `
        <div class="media-dots">${slides.map((_, i) => `<button type="button" class="media-dot${i === 0 ? ' is-active' : ''}" data-media-dot="${i}" aria-label="اسلاید ${toPersianNum(i + 1)}"></button>`).join('')}</div>
        <span class="media-count" aria-hidden="true"><i class="fas fa-images"></i> ${toPersianNum(slides.length)}</span>
        ${opts.arrows ? `
        <button type="button" class="media-arrow media-arrow--prev" data-media-prev aria-label="${escapeContent(txt('previousSlide'))}"><i class="fas fa-chevron-right"></i></button>
        <button type="button" class="media-arrow media-arrow--next" data-media-next aria-label="${escapeContent(txt('nextSlide'))}"><i class="fas fa-chevron-left"></i></button>` : ''}` : ''}
    </div>`;
}
function initMediaSliders(scope) {
    (scope || document).querySelectorAll('[data-media-slider]').forEach(root => {
        if (root.dataset.mediaReady === '1') return;
        const slides = Array.from(root.querySelectorAll('.media-slide'));
        if (slides.length < 2) { root.dataset.mediaReady = '1'; return; }
        root.dataset.mediaReady = '1';
        const dots = Array.from(root.querySelectorAll('[data-media-dot]'));
        const prevBtn = root.querySelector('[data-media-prev]');
        const nextBtn = root.querySelector('[data-media-next]');
        const autoplayMs = parseInt(root.dataset.autoplay || '0', 10) || 0;
        const reduce = prefersReducedMotion();
        let index = 0, timer = null, hovering = false, visible = true;
        let pointerId = null, startX = 0, deltaX = 0;

        function show(next) {
            index = ((next % slides.length) + slides.length) % slides.length;
            slides.forEach((s, k) => {
                s.classList.toggle('is-active', k === index);
                if (k === index) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true');
            });
            dots.forEach((d, k) => d.classList.toggle('is-active', k === index));
        }
        function schedule() {
            clearTimeout(timer);
            if (!autoplayMs || reduce || hovering || !visible || document.hidden || !root.isConnected) return;
            timer = setTimeout(() => show(index + 1), autoplayMs);
        }
        if (prevBtn) prevBtn.addEventListener('click', e => { e.stopPropagation(); show(index - 1); schedule(); });
        if (nextBtn) nextBtn.addEventListener('click', e => { e.stopPropagation(); show(index + 1); schedule(); });
        dots.forEach(d => d.addEventListener('click', e => { e.stopPropagation(); show(+d.dataset.mediaDot); schedule(); }));
        root.addEventListener('pointerenter', () => { hovering = true; schedule(); });
        root.addEventListener('pointerleave', () => { hovering = false; schedule(); });
        root.addEventListener('pointerdown', e => { pointerId = e.pointerId; startX = e.clientX; deltaX = 0; });
        root.addEventListener('pointermove', e => { if (pointerId !== null && e.pointerId === pointerId) deltaX = e.clientX - startX; });
        const endDrag = e => {
            if (pointerId === null || (e && e.pointerId !== pointerId)) return;
            pointerId = null;
            const moved = deltaX;
            if (Math.abs(moved) > 42) {
                show(index + (moved < 0 ? 1 : -1));
                // Swallow the click a swipe would otherwise trigger (card open).
                const kill = ev => { ev.stopPropagation(); ev.preventDefault(); };
                root.addEventListener('click', kill, { capture: true, once: true });
                setTimeout(() => root.removeEventListener('click', kill, true), 260);
            }
            deltaX = 0;
            schedule();
        };
        root.addEventListener('pointerup', endDrag);
        root.addEventListener('pointercancel', endDrag);
        if (typeof IntersectionObserver === 'function') {
            new IntersectionObserver(entries => {
                visible = entries.some(en => en.isIntersecting);
                root.classList.toggle('slider-paused', !visible);
                schedule();
            }, { threshold: 0.15 }).observe(root);
        }
        document.addEventListener('visibilitychange', schedule);
        schedule();
    });
}

// ---- Fullscreen lightbox: every gallery slide can be opened at full size,
// zoomed (wheel / pinch / buttons / double-click) and panned while zoomed. ----
const MEDIA_LB = { list: [], index: 0, scale: 1, tx: 0, ty: 0, open: false, lastFocus: null };
function mediaLightboxEl() {
    let lb = document.getElementById('mediaLightbox');
    if (lb) return lb;
    lb = document.createElement('div');
    lb.id = 'mediaLightbox';
    lb.className = 'media-lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.innerHTML = `
        <div class="ml-backdrop" data-ml-close></div>
        <figure class="ml-stage"><img class="ml-img" alt=""></figure>
        <div class="ml-topbar">
            <span class="ml-title"></span>
            <span class="ml-count"></span>
            <div class="ml-actions">
                <button type="button" data-ml-zoom="out" title="-"><i class="fas fa-magnifying-glass-minus"></i></button>
                <button type="button" data-ml-zoom="reset" title="100%"><i class="fas fa-rotate-left"></i></button>
                <button type="button" data-ml-zoom="in" title="+"><i class="fas fa-magnifying-glass-plus"></i></button>
                <button type="button" class="ml-close" data-ml-close aria-label="${escapeContent(txt('close'))}"><i class="fas fa-xmark"></i></button>
            </div>
        </div>
        <button type="button" class="ml-arrow ml-arrow--prev" data-ml-prev aria-label="${escapeContent(txt('previousSlide'))}"><i class="fas fa-chevron-right"></i></button>
        <button type="button" class="ml-arrow ml-arrow--next" data-ml-next aria-label="${escapeContent(txt('nextSlide'))}"><i class="fas fa-chevron-left"></i></button>
        <p class="ml-hint" aria-hidden="true"><i class="fas fa-arrows-up-down-left-right"></i><span data-text="zoomHint">${escapeContent(txt('zoomHint'))}</span></p>`;
    document.body.appendChild(lb);
    if (typeof applyContentControls === 'function') applyContentControls();

    const img = lb.querySelector('.ml-img');
    const applyTransform = () => {
        img.style.transform = `translate(${MEDIA_LB.tx}px, ${MEDIA_LB.ty}px) scale(${MEDIA_LB.scale})`;
        img.classList.toggle('is-pannable', MEDIA_LB.scale > 1);
    };
    const clampPan = () => {
        const limit = Math.max(0, (MEDIA_LB.scale - 1) / 2) ;
        const rx = Math.max(60, img.clientWidth * limit), ry = Math.max(60, img.clientHeight * limit);
        MEDIA_LB.tx = Math.min(rx, Math.max(-rx, MEDIA_LB.tx));
        MEDIA_LB.ty = Math.min(ry, Math.max(-ry, MEDIA_LB.ty));
    };
    const setZoom = (scale, cx, cy) => {
        const old = MEDIA_LB.scale;
        const next = Math.min(6, Math.max(1, scale));
        if (cx != null && next !== old) {
            const r = img.getBoundingClientRect();
            const px = cx - (r.left + r.width / 2), py = cy - (r.top + r.height / 2);
            const k = next / old;
            MEDIA_LB.tx = px - (px - MEDIA_LB.tx) * k;
            MEDIA_LB.ty = py - (py - MEDIA_LB.ty) * k;
        }
        MEDIA_LB.scale = next;
        if (next === 1) { MEDIA_LB.tx = 0; MEDIA_LB.ty = 0; }
        clampPan(); applyTransform();
        lb.querySelector('[data-ml-zoom="reset"]').setAttribute('aria-label', `${Math.round(next * 100)}%`);
    };
    MEDIA_LB.setZoom = setZoom;
    MEDIA_LB.show = i => {
        const n = MEDIA_LB.list.length;
        MEDIA_LB.index = ((i % n) + n) % n;
        MEDIA_LB.scale = 1; MEDIA_LB.tx = 0; MEDIA_LB.ty = 0;
        img.src = MEDIA_LB.list[MEDIA_LB.index];
        applyTransform();
        lb.querySelector('.ml-count').textContent = `${toPersianNum(MEDIA_LB.index + 1)} / ${toPersianNum(n)}`;
        const multi = n > 1;
        lb.querySelectorAll('.ml-arrow').forEach(a => { a.style.display = multi ? '' : 'none'; });
    };
    lb.addEventListener('click', e => {
        if (e.target.closest('[data-ml-close]')) return closeMediaLightbox();
        const z = e.target.closest('[data-ml-zoom]');
        if (z) {
            const r = img.getBoundingClientRect();
            const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
            if (z.dataset.mlZoom === 'in') setZoom(MEDIA_LB.scale * 1.35, cx, cy);
            else if (z.dataset.mlZoom === 'out') setZoom(MEDIA_LB.scale / 1.35, cx, cy);
            else setZoom(1);
            return;
        }
        if (e.target.closest('[data-ml-prev]')) return MEDIA_LB.show(MEDIA_LB.index - 1);
        if (e.target.closest('[data-ml-next]')) return MEDIA_LB.show(MEDIA_LB.index + 1);
    });
    lb.addEventListener('wheel', e => {
        e.preventDefault();
        setZoom(MEDIA_LB.scale * (e.deltaY < 0 ? 1.12 : 1 / 1.12), e.clientX, e.clientY);
    }, { passive: false });
    lb.addEventListener('dblclick', e => {
        if (e.target.closest('.ml-topbar, .ml-arrow')) return;
        setZoom(MEDIA_LB.scale > 1 ? 1 : 2.6, e.clientX, e.clientY);
    });
    // drag to pan + two-finger pinch
    const pointers = new Map();
    let pinchDist = 0;
    lb.addEventListener('pointerdown', e => {
        if (e.target.closest('.ml-topbar, .ml-arrow')) return;
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pointers.size === 2) {
            const [a, b] = [...pointers.values()];
            pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
        }
        img.setPointerCapture && img.setPointerCapture(e.pointerId);
    });
    lb.addEventListener('pointermove', e => {
        if (!pointers.has(e.pointerId)) return;
        const prev = pointers.get(e.pointerId);
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pointers.size === 2) {
            const [a, b] = [...pointers.values()];
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (pinchDist > 0) setZoom(MEDIA_LB.scale * (d / pinchDist), (a.x + b.x) / 2, (a.y + b.y) / 2);
            pinchDist = d;
        } else if (MEDIA_LB.scale > 1) {
            MEDIA_LB.tx += e.clientX - prev.x;
            MEDIA_LB.ty += e.clientY - prev.y;
            clampPan(); applyTransform();
        }
    });
    const dropPointer = e => { pointers.delete(e.pointerId); pinchDist = 0; };
    lb.addEventListener('pointerup', dropPointer);
    lb.addEventListener('pointercancel', dropPointer);
    return lb;
}
function openMediaLightbox(srcs, index, title) {
    if (!srcs || !srcs.length) return;
    const lb = mediaLightboxEl();
    MEDIA_LB.list = srcs.slice();
    MEDIA_LB.lastFocus = document.activeElement;
    lb.querySelector('.ml-title').textContent = title || '';
    lb.querySelector('.ml-img').alt = title || '';
    MEDIA_LB.show(index || 0);
    lb.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    MEDIA_LB.open = true;
    lb.querySelector('.ml-close').focus({ preventScroll: true });
}
function closeMediaLightbox() {
    const lb = document.getElementById('mediaLightbox');
    if (!lb) return;
    lb.classList.remove('is-open');
    MEDIA_LB.open = false;
    if (!document.querySelector('.overlay.is-open')) document.body.style.overflow = '';
    if (MEDIA_LB.lastFocus && MEDIA_LB.lastFocus.focus) MEDIA_LB.lastFocus.focus({ preventScroll: true });
}
document.addEventListener('keydown', e => {
    if (!MEDIA_LB.open || !MEDIA_LB.setZoom) return;
    const rtl = (document.documentElement.getAttribute('dir') || 'rtl') === 'rtl';
    if (e.key === 'Escape') { e.stopImmediatePropagation(); closeMediaLightbox(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); MEDIA_LB.show(MEDIA_LB.index + (rtl ? 1 : -1)); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); MEDIA_LB.show(MEDIA_LB.index + (rtl ? -1 : 1)); }
    else if (e.key === '+' || e.key === '=') MEDIA_LB.setZoom(MEDIA_LB.scale * 1.3);
    else if (e.key === '-') MEDIA_LB.setZoom(MEDIA_LB.scale / 1.3);
    else if (e.key === '0') MEDIA_LB.setZoom(1);
});
// One delegated listener wires every zoom button (cards, hero sliders, shop).
document.addEventListener('click', e => {
    const z = e.target.closest('[data-media-zoom]');
    if (!z) return;
    e.preventDefault(); e.stopPropagation();
    const root = z.closest('[data-media-slider]');
    if (!root) return;
    const srcs = Array.from(root.querySelectorAll('.media-slide img')).map(im => im.getAttribute('src'));
    const scope = root.closest('.project-card, .product-card, .project-modal, .modal-lg, .modal-md');
    const title = scope ? (scope.querySelector('.project-detail-title, h3, .product-title') || {}).textContent || '' : '';
    openMediaLightbox(srcs, parseInt(z.dataset.mediaZoom, 10) || 0, String(title).trim());
}, true);
// Clicking the big hero image inside the project modal also opens full view.
document.addEventListener('click', e => {
    const im = e.target.closest('.overlay--project .media-slide img');
    if (!im || e.target.closest('[data-media-zoom]')) return;
    e.stopPropagation();
    const root = im.closest('[data-media-slider]');
    const srcs = Array.from(root.querySelectorAll('.media-slide img')).map(x => x.getAttribute('src'));
    const idx = Array.from(root.querySelectorAll('.media-slide img')).indexOf(im);
    openMediaLightbox(srcs, Math.max(0, idx), (document.querySelector('.project-detail-title') || {}).textContent || '');
});

function renderProjectsGrid() {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;
    const sig = arrSig(contentItems('projects'), p => [p.id, p.icon || '', shash(p.tag), shash(p.title), shash(p.desc), shash(p.tech), shash(p.longDescription), imgSig(p.image), (p.gallery || []).map(imgSig).join('~')].join(','));
    if (grid.dataset.renderSig === sig && grid.firstChild) return;
    grid.dataset.renderSig = sig;
    grid.innerHTML = contentItems('projects').map(p => {
        const slides = (p.gallery && p.gallery.length) ? p.gallery : (p.image ? [p.image] : []);
        const media = mediaSlidesHtml(p, { autoplay: 4300 });
        return `
        <div class="project-card" data-item-list="projects" data-item-id="${p.id}" data-project="${p.id}" tabindex="0" role="button" aria-label="${escapeContent(txt('more'))}: ${escapeContent(p.title || '')}">
            <div class="project-image${slides.length ? ' has-photo' : ''}">${media || `<i class="${p.icon}"></i>`}<span class="project-image-shine" aria-hidden="true"></span></div>
            <div class="project-content">
                <span class="project-tag">${escapeContent(p.tag||'')}</span>
                <h3>${escapeContent(p.title||'')}</h3>
                <p>${escapeContent(p.desc||'')}</p>
                <div class="project-tech">${(p.tech||'').split(',').filter(t=>t.trim()).map(t=>`<span>${escapeContent(t.trim())}</span>`).join('')}</div>
                <span class="project-more">${uiText('more')} <i class="fas fa-chevron-left"></i></span>
            </div>
        </div>`;
    }).join('');
    initMediaSliders(grid);
}

// ============== Project details (animated modal) ==============
let currentProjectId = null;
function techList(tech) {
    return (tech||'').split(',').map(t=>t.trim()).filter(Boolean);
}
function openProjectDetail(pid, sourceEl) {
    const p = contentItems('projects').find(x => x.id === pid);
    if (!p) return;
    currentProjectId = pid;
    const overlay = document.getElementById('projectModal') || createProjectModal();
    overlay.dataset.itemList='projects'; overlay.dataset.itemId=String(pid);
    const hero = overlay.querySelector('.project-detail-hero');
    const slides = (p.gallery && p.gallery.length) ? p.gallery : (p.image ? [p.image] : []);
    hero.classList.toggle('has-photo', slides.length > 0);
    const heroMedia = mediaSlidesHtml(p, { hero: true, arrows: true, autoplay: 5200 });
    hero.innerHTML = (heroMedia || `<i class="${p.icon||'fas fa-briefcase'}"></i>`) + `<span class="project-detail-hero-veil" aria-hidden="true"></span>`;
    initMediaSliders(hero);
    const tag = overlay.querySelector('.project-detail-tag');
    tag.textContent = p.tag || '';
    tag.style.display = p.tag ? '' : 'none';
    overlay.querySelector('.project-detail-title').textContent = p.title || '';
    overlay.querySelector('.project-detail-desc').textContent = p.desc || '';
    const longBox = overlay.querySelector('.project-detail-long');
    const long = (p.longDescription || '').trim();
    longBox.textContent = long;
    longBox.style.display = long ? 'block' : 'none';
    const tech = techList(p.tech);
    const techBox = overlay.querySelector('.project-detail-tech');
    techBox.innerHTML = tech.length
        ? `<h4><i class="fas fa-layer-group"></i> ${uiText('technologies')}</h4><div class="project-tech">${tech.map((t,i)=>`<span style="--i:${i}">${escapeContent(t)}</span>`).join('')}</div>`
        : '';
    overlay.querySelectorAll('[data-project-open-shop]').forEach(b => {
        b.style.display = SITE.shopEnabled ? '' : 'none';
    });
    // restart the staggered entrance of the modal content
    overlay.querySelectorAll('.reveal-item').forEach(el => {
        el.style.animation = 'none';
        void el.offsetWidth;
        el.style.animation = '';
    });
    if (typeof applyContentControls === 'function') applyContentControls();
    openAnimatedOverlay(overlay, sourceEl || overlay.__source);
}
function closeProjectDetail(done) {
    closeAnimatedOverlay(document.getElementById('projectModal'), done);
}
function createProjectModal() {
    const div = document.createElement('div');
    div.className = 'overlay overlay--project';
    div.id = 'projectModal';
    div.innerHTML = `
        <div class="modal-lg project-modal">
            <button class="modal-close" data-close aria-label="${escapeContent(txt('close'))}"><i class="fas fa-times"></i></button>
            <div class="project-detail-hero reveal-item" style="--i:0"></div>
            <div class="project-detail-body">
                <span class="project-detail-tag reveal-item" style="--i:1"></span>
                <h2 class="project-detail-title reveal-item" style="--i:2"></h2>
                <p class="project-detail-desc reveal-item" style="--i:3"></p>
                <div class="project-detail-long reveal-item" style="--i:4"></div>
                <div class="project-detail-tech reveal-item" style="--i:5"></div>
                <div class="project-detail-actions reveal-item" style="--i:6">
                    <a href="contact.html" class="btn btn-primary"><i class="fas fa-paper-plane"></i> ${uiText('similarProject')}</a>
                    <button type="button" class="btn btn-outline" data-project-open-shop><i class="fas fa-shopping-bag"></i> ${uiText('shopServices')}</button>
                    <button type="button" class="btn btn-outline" data-close><i class="fas fa-xmark"></i> ${uiText('close')}</button>
                </div>
            </div>
        </div>`;
    document.body.appendChild(div);
    if (typeof applyContentControls === 'function') applyContentControls();
    div.addEventListener('click', e => {
        if (e.target.closest('[data-project-open-shop]')) {
            closeProjectDetail(() => window.location.assign('shop.html'));
            return;
        }
        if (e.target === div || e.target.closest('[data-close]')) closeProjectDetail();
    });
    return div;
}
// One delegated listener keeps every project card (also the ones rendered
// later by the live sync) wired up.
document.addEventListener('click', e => {
    const card = e.target.closest('.project-card[data-project]');
    if (!card || e.target.closest('.overlay')) return;
    openProjectDetail(+card.dataset.project, card);
});
document.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest && e.target.closest('.project-card[data-project]');
    if (!card) return;
    e.preventDefault();
    openProjectDetail(+card.dataset.project, card);
});
function renderSkillsGrid() {
    const el = document.getElementById('skillsGrid');
    if (!el) return;
    const sig = arrSig(contentItems('skills'), s => [s.id, s.icon || '', shash(s.name)].join(','));
    if (el.dataset.renderSig === sig && el.firstChild) return;
    el.dataset.renderSig = sig;
    el.innerHTML = contentItems('skills').map(s => `<div class="skill-tag"><i class="${s.icon}"></i> ${escapeContent(s.name)}</div>`).join('');
}
function renderWhymeGrid() {
    const el = document.getElementById('whymeGrid');
    if (!el) return;
    const sig = arrSig(contentItems('whyme'), cardSig);
    if (el.dataset.renderSig === sig && el.firstChild) return;
    el.dataset.renderSig = sig;
    el.innerHTML = contentItems('whyme').map(w => `
        <div class="feature-card" data-item-list="whyme" data-item-id="${w.id}">
            <div class="feature-icon${w.image?' has-photo':''}">${w.image?`<img src="${w.image}" alt="${escapeContent(w.title)}" loading="lazy">`:`<i class="${w.icon}"></i>`}</div>
            <h3>${escapeContent(w.title)}</h3>
            <p>${escapeContent(w.desc)}</p>
        </div>`).join('');
}
function renderContactCards() {
    const el = document.getElementById('contactInfo');
    if (!el) return;
    const sig = arrSig(contentItems('contactCards'), c => [c.id, c.icon || '', shash(c.title), shash(c.value), shash(c.url), shash(c.hint)].join(','));
    if (el.dataset.renderSig === sig && el.firstChild) return;
    el.dataset.renderSig = sig;
    el.innerHTML = contentItems('contactCards').map(c => `
        <div class="contact-card" data-item-list="contactCards" data-item-id="${c.id}">
            <div class="contact-icon"><i class="${c.icon}"></i></div>
            <div class="contact-detail">
                <h4>${escapeContent(c.title)}</h4>
                ${c.url ? `<a href="${c.url}" ${c.url.startsWith('http')?'target="_blank"':''}>${escapeContent(c.value)}</a>` : `<span>${escapeContent(c.value)}</span>`}
                ${c.hint?`<p style="font-size:0.8rem;color:var(--text-muted);margin-top:0.3rem;">${escapeContent(c.hint)}</p>`:''}
            </div>
        </div>`).join('');
}
function renderPhotos() {
    const h = document.getElementById('heroAvatar');
    if (h) {
        const sig = imgSig(SITE.heroPhoto);
        if (h.dataset.photoSig !== sig || !h.firstChild) {
            h.dataset.photoSig = sig;
            h.innerHTML = SITE.heroPhoto
                ? `<img src="${SITE.heroPhoto}" alt="avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
                : '<i class="fas fa-user"></i>';
        }
    }
    const a = document.getElementById('aboutPhoto');
    if (a) {
        const sig = imgSig(SITE.aboutPhoto);
        if (a.dataset.photoSig !== sig || !a.firstChild) {
            a.dataset.photoSig = sig;
            a.innerHTML = SITE.aboutPhoto
                ? `<img src="${SITE.aboutPhoto}" alt="about" style="width:100%;height:100%;object-fit:cover;border-radius:1.5rem;">`
                : '<i class="fas fa-user-tie"></i>';
        }
    }
}
function applyTexts() {
    document.querySelectorAll('[data-text]').forEach(el => {
        const k = el.getAttribute('data-text');
        if (SITE.texts[k] === undefined && CONTENT_FA[k] === undefined) return;
        // Never wipe a half-typed headline while the typewriter is running.
        if (el.classList.contains('is-typing')) return;
        if (el.dataset.typingStarted === '1' && el.dataset.typed !== 'done') return;
        if (el.textContent !== txt(k)) el.textContent = txt(k);
    });
    document.querySelectorAll('[data-visible]').forEach(el => {
        el.style.display = isVisible(el.getAttribute('data-visible')) ? '' : 'none';
    });
}
// Re-render the entire public page from current SITE data.
function renderSitePage() {
    applyMaintenanceMode();
    applyTexts();
    renderPhotos();
    renderSocials();
    renderFeaturesGrid();
    renderProjectsGrid();
    renderSkillsGrid();
    renderWhymeGrid();
    renderContactCards();
    refreshShopEverywhere();
    initMotionEffects();
    decorateCards();
    if (typeof applyContentControls === 'function') applyContentControls();
}

// ============== Cards: staggered neon motion ==============
const CARD_SELECTOR = '.public-site .feature-card, .public-site .product-card, .public-site .project-card, .public-site .about-block, .public-site .contact-card, .public-site .contact-form';
// The neon pulse / border flow are CSS animations on ::after. Left free-running
// they repaint EVERY card on the page, forever — including the dozen cards
// inside the slider. They are parked until a card is actually on screen.
const CARD_FX_SELECTOR = CARD_SELECTOR + ', .public-site .skill-tag';
let cardFxObserver = null;
function observeCardFx() {
    const cards = document.querySelectorAll(CARD_FX_SELECTOR);
    if (typeof IntersectionObserver === 'undefined') {
        cards.forEach(el => el.classList.add('is-live'));
        return;
    }
    if (!cardFxObserver) {
        cardFxObserver = new IntersectionObserver(entries => {
            entries.forEach(en => {
                // Re-renders replace the DOM: forget nodes that are gone.
                if (!en.target.isConnected) { cardFxObserver.unobserve(en.target); return; }
                en.target.classList.toggle('is-live', en.isIntersecting);
            });
        }, { rootMargin: '140px 0px' });
    }
    cards.forEach(el => {
        if (el.dataset.fxObserved === '1') return;
        el.dataset.fxObserved = '1';
        cardFxObserver.observe(el);
    });
}
function decorateCards() {
    document.querySelectorAll(CARD_SELECTOR).forEach((card, i) => {
        const delay = `-${((i % 5) * 1.35).toFixed(2)}s`;
        // Skip the write when it is already correct: this runs on every sync
        // tick and touching inline style invalidates the card's style.
        if (card.style.getPropertyValue('--neon-delay') !== delay) card.style.setProperty('--neon-delay', delay);
    });
    observeCardFx();
}

// ============== Motion budget: go easy on low-power devices ==============
// Weak hardware gets the same design, minus the always-on animations that
// never stop repainting. Hover effects and slide transitions are untouched.
function initMotionBudget() {
    try {
        const nav = navigator || {};
        const weak = (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4) ||
                     (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4);
        if (weak) document.documentElement.classList.add('motion-lite');
    } catch (e) { /* ignore */ }
}

window.SITE=SITE; window.saveData=saveData;
window.refreshShopEverywhere=refreshShopEverywhere;
window.openProjectDetail=openProjectDetail; window.closeProjectDetail=closeProjectDetail;
window.initShopSlider=initShopSlider; window.decorateCards=decorateCards; window.observeCardFx=observeCardFx; window.initMotionBudget=initMotionBudget;
window.renderSitePage=renderSitePage; window.initSync=initSync;
window.applyMaintenanceMode=applyMaintenanceMode; window.initMediaSliders=initMediaSliders;
window.fetchRemoteData=fetchRemoteData; window.pushDataToServer=pushDataToServer;
window.siteSyncState=siteSyncState; window.emitSync=emitSync;

document.addEventListener('DOMContentLoaded', () => {
    // Each step is isolated so a single failure can never blank the whole page.
    [initTheme, initMotionBudget, initNavbar, initCounters, initContactForm, setYear, createCartUI, initContentProtection, renderSitePage, initTypewriter]
        .forEach(fn => { try { fn(); } catch (e) { console.error('[site] init failed:', fn.name, e); } });
    // Keep every visitor in sync with the admin panel's latest changes.
    if (!document.getElementById('adminPage')) {
        initSync(() => { try { renderSitePage(); } catch (e) { console.error('[site] re-render failed', e); } });
    }
});
