// English defaults; administrator overrides are stored separately in textsEn.
Object.assign(CONTENT_EN, {
    brand: 'AmirSedighian', hero_badge: 'Full-stack developer & infrastructure engineer',
    hero_title_before: 'Amir', hero_title_grad: 'Sedighian',
    hero_subtitle: 'Hi, I’m Amir Sedighian, a full-stack web developer and Telegram bot specialist. I build modern websites, bilingual bots with admin dashboards, and infrastructure solutions on Cloudflare.',
    stats_projects: 'Projects delivered', stats_years: 'Years of experience', stats_clients: 'Happy clients',
    features_title: 'My services', features_subtitle: 'Professional development and infrastructure services',
    shopPreview_title: 'Best sellers', shopPreview_subtitle: 'Explore a selection of services from the shop', shopPreview_btn: 'View all products',
    cta_home_title: 'Have a project in mind?', cta_home_desc: 'Get in touch and let’s discuss your next project.', cta_home_btn: 'Start a conversation',
    shopPage_title: 'Shop', shopPage_subtitle: 'Quality hosting, domains, virtual servers and high-speed VPN configurations, backed by reliable support.',
    shopCta_title: 'Can’t find the service you need?', shopCta_desc: 'Contact me for a custom configuration or a free consultation.',
    projects_title: 'Projects', projects_subtitle: 'A selection of projects I have delivered.',
    projectsCta_title: 'Have a similar project?', projectsCta_desc: 'Tell me about your project and we’ll find the right solution.', projectsCta_btn: 'Discuss a project',
    about_title: 'About me', about_subtitle: 'Get to know Amir Sedighian.', about_name: 'Amir Sedighian', about_years: '5+',
    about_intro: 'With over five years of experience in software development and infrastructure engineering, I specialize in the following areas:',
    about_block1_title: 'Software & web development', about_block1_desc: 'Full-stack web development and bilingual Telegram bots with web admin panels, built with React, Tailwind CSS, Cloudflare Workers and KV.',
    about_block2_title: 'Infrastructure & networking', about_block2_desc: 'Cloudflare infrastructure, secure networking, V2Ray protocols including VLESS, VMess and Trojan with REALITY and gRPC, and server management.',
    about_block3_title: 'Programming languages', about_block3_desc: 'Python, JavaScript, TypeScript, HTML, CSS and PHP.',
    skills_title: 'Skills', whyme_title: 'Why work with me?', whyme_subtitle: 'What makes my work different',
    contact_title: 'Contact me', contact_subtitle: 'Get in touch for projects, advice or any questions using the options below.',
    contactForm_title: 'Send a message', contact_name: 'Full name', contact_email: 'Email', contact_phone: 'Phone number', contact_subject: 'Subject', contact_message: 'Your message', contact_send: 'Send message',
    formSuccess: '✓ Your message has been sent. I’ll get back to you soon.',
    shopDisabled_title: 'We’re updating the shop', shopDisabled_desc: 'We’ll be back soon with new products. Thank you for your patience.', shopDisabled_extra: 'Contact support if you need to place an order.',
    footer_about: 'Full-stack developer & infrastructure engineer.',
    addToCart: 'Add to cart', viewCart: 'View cart', cartTitle: 'Shopping cart', cartEmpty: 'Your cart is empty',
    goToShop: 'Visit the shop', cartTotal: 'Total', completeOrder: 'Checkout', continueShopping: 'Continue shopping',
    checkoutTitle: 'Complete your order', checkoutDesc: 'Enter your details. After placing your order, your invoice will appear in the connected Telegram bot.',
    yourName: 'Full name *', yourPhone: 'Phone number *', yourTelegramId: 'Telegram username *', yourEmail: 'Email (optional)',
    telegramIdHint: 'Use @username. The administrator will contact you using this Telegram account.', orderNote: 'Note (optional)',
    sendOrder: 'Place order & receive invoice in Telegram', orderSuccess: '✓ Your order has been placed. We’ll contact you soon.',
    orderError: 'Could not place your order. Please try again or contact us on Telegram.', detailsProduct: 'View details'
});
const CONTENT_ITEMS_EN = {
    features: [
        {title:'Web development',desc:'Modern full-stack websites built with React, Tailwind and current web technologies.'},
        {title:'Telegram bots',desc:'Bilingual Telegram bots with web admin panels, powered by Cloudflare Workers and KV.'},
        {title:'Server management',desc:'Server configuration, management and optimization with a focus on security and reliability.'},
        {title:'Secure networks',desc:'V2Ray configurations including VLESS, VMess and Trojan with REALITY and gRPC.'},
        {title:'Cloud infrastructure',desc:'Infrastructure deployment and management on Cloudflare Workers, KV and R2.'},
        {title:'24/7 support',desc:'Ongoing technical support and advice throughout your project and after delivery.'}
    ],
    whyme: [
        {title:'Quality first',desc:'Every project is delivered with attention to quality and professional standards.'},
        {title:'On-time delivery',desc:'A commitment to the agreed project timeline.'},
        {title:'Clear communication',desc:'Stay informed about progress throughout your project.'},
        {title:'Scalability',desc:'Code designed to grow and evolve with your needs.'},
        {title:'Documentation',desc:'Technical documentation and usage guides delivered with every project.'},
        {title:'After-launch support',desc:'Continued support after your project goes live.'}
    ],
    products: [
        {name:'Professional Linux hosting',unit:'month',description:'Fast SSD hosting with 24/7 support',longDescription:'Reliable SSD hosting with modern hardware and optimized caching. Includes a free control panel, daily backups, SSL, Telegram support and a seven-day money-back guarantee.',features:['5 GB SSD storage','Unlimited bandwidth','Free SSL certificate','24/7 support']},
        {name:'.ir domain',unit:'year',description:'Affordable .ir domain registration',longDescription:'Register your .ir domain with instant delivery and full DNS management access.',features:['Instant registration','Full DNS management','Transfer lock','Easy renewal']},
        {name:'Iran virtual server',unit:'month',description:'Low-latency VPS with high uptime',longDescription:'An Iran-based VPS with a static IP and low latency for local users. Suitable for websites, Telegram bots and domestic services.',features:['1 CPU core','2 GB RAM','20 GB SSD','Static IP']},
        {name:'V2Ray configuration — 1 month',unit:'month',description:'High-speed VLESS with REALITY',longDescription:'A fast and secure VLESS configuration using REALITY, designed for everyday use.',features:['VLESS + REALITY','Unlimited traffic','Custom setup','All operators']},
        {name:'WordPress hosting',unit:'month',description:'Hosting optimized for WordPress',longDescription:'WordPress hosting with LiteSpeed Cache, optimized settings, automatic installation, daily backups and malware protection.',features:['Automatic WordPress installation','LiteSpeed Cache','Daily backups','Malware protection']},
        {name:'.com domain',unit:'year',description:'International .com domain registration',longDescription:'Register a .com domain for your international business or global project.',features:['International registration','WHOIS privacy','Full management','Transferable']},
        {name:'Germany virtual server',unit:'month',description:'A high-quality Germany-based VPS',longDescription:'A Germany-based VPS with a 1 Gbps port for trading, VPN configurations and international services.',features:['2 CPU cores','4 GB RAM','50 GB NVMe','1 Gbps port']},
        {name:'Trojan configuration — 3 months',unit:'3 months',description:'Trojan configuration with gRPC',longDescription:'A fast and stable Trojan configuration with gRPC. Save with a three-month subscription.',features:['Trojan + gRPC','Clean IP','Multiple users','Anti-filtering']}
    ],
    contactCards: [
        {title:'Telegram',hint:'The fastest way to reach me'}, {title:'Email',hint:'For formal correspondence'},
        {title:'GitHub',hint:'Explore open-source projects'}, {title:'Phone',value:'Arrange a call via Telegram',hint:'By appointment only'},
        {title:'Availability',value:'Every day, 9 AM to midnight',hint:'I’ll reply as soon as possible'}
    ],
    socials:[{name:'Telegram'},{name:'GitHub'},{name:'Email'}],
    projects:[
        {title:'Bilingual Telegram shop bot',tag:'Telegram bot',desc:'A Telegram shop with a web dashboard, payments and Persian and English support.',longDescription:'A complete Telegram shop on Cloudflare Workers and KV. Includes multilingual categories and products, cart and payments, automated invoices, delivery and sales reports.'},
        {title:'Modern corporate website',tag:'Website',desc:'A responsive corporate website with content management and optimized SEO.',longDescription:'A fast, responsive business website with an editable CMS, technical SEO, schema and sitemap, deployed on cloud infrastructure with SSL.'},
        {title:'VPN management panel',tag:'Infrastructure',desc:'User and configuration management for VLESS, VMess and Trojan.',longDescription:'Centralized management for multiple servers and users. Supports automatic configuration delivery, traffic limits, expiration dates and usage reports. Built with Docker and gRPC.'},
        {title:'Analytics dashboard',tag:'Dashboard',desc:'Real-time analytics with interactive charts and automated reports.',longDescription:'Key business metrics in one dashboard, with sales and traffic charts, date filters, period comparisons, reports and alerts. Built with React, Chart.js and REST APIs.'},
        {title:'Powerful backend API',tag:'API',desc:'REST API with JWT authentication, caching and Swagger documentation.',longDescription:'A scalable FastAPI backend with JWT access control, Redis caching, Swagger documentation, automated tests and CI, deployed using Docker and Nginx.'},
        {title:'Cloudflare deployment',tag:'Cloudflare',desc:'Infrastructure migration to Cloudflare Pages, Workers and R2.',longDescription:'Migration from shared hosting to Cloudflare: DNS, security settings, automatic deployments, serverless functions, storage and smart caching.'},
        {title:'Online store',tag:'Full stack',desc:'An online store with cart, payments, administration and order management.',longDescription:'An online shopping experience with search, filters, secure checkout, order tracking, inventory management, pricing, coupons and notifications. Built with Next.js and PostgreSQL.'},
        {title:'Progressive web app',tag:'PWA',desc:'An installable mobile web app with offline support.',longDescription:'A React PWA with direct installation, offline IndexedDB storage, synchronization, notifications and custom icons.'},
        {title:'AI chatbot',tag:'AI',desc:'An AI-powered chatbot with multilingual support and conversation memory.',longDescription:'A chatbot with AI responses, per-user conversation memory, Persian and English support and handoff to a human operator for customer service.'}
    ]
};
// Dynamic UI strings share the same bilingual editor as page content.
const CONTENT_UI = {
    previousSlide:['اسلاید قبلی','Previous slide'], nextSlide:['اسلاید بعدی','Next slide'],
    orderSummary:['خلاصه سفارش','Order summary'], itemCount:['عدد','items'],
    telegramInvalid:['آیدی تلگرام معتبر نیست. نمونه صحیح: username یا @username','Enter a valid Telegram username, such as username or @username.'],
    placingOrder:['در حال ثبت و اتصال به ربات...','Placing your order and connecting to Telegram…'],
    invoiceReady:['✓ فاکتور ثبت شد؛ در حال انتقال به ربات متصل به سایت...','✓ Invoice created. Opening the connected Telegram bot…'],
    botUnavailable:['ربات سفارش‌ها هنوز توسط ادمین فعال نشده است.','The ordering bot has not been enabled yet.'],
    technologies:['تکنولوژی‌های استفاده شده','Technologies used'], similarProject:['درخواست پروژه مشابه','Request a similar project'], shopServices:['دیدن سرویس‌های فروشگاه','Explore shop services'],

    buy:['خرید','Buy'], currency:['تومان','toman'], support:['تماس با پشتیبانی','Contact support'],
    category_all:['همه','All'], category_hosting:['هاست','Hosting'], category_domain:['دامنه','Domains'], category_server:['سرور','Servers'], category_vpn:['VPN','VPN'],
    badge_hot:['داغ','Popular'], badge_new:['جدید','New'], badge_sale:['تخفیف','Sale'],
    more:['توضیحات بیشتر','More details'], remove:['حذف','Remove'], close:['بستن','Close'],
    quantity:['تعداد','Quantity'], totalPrice:['قیمت کل','Total price'], productFeaturesTitle:['ویژگی‌ها','Features']
};
Object.entries(CONTENT_UI).forEach(([key,values]) => {
    CONTENT_FA[key]=values[0]; CONTENT_EN[key]=values[1];
    CONTENT_SECTIONS[['more','technologies','similarProject','shopServices'].includes(key)?'projects':'shop'].texts[key]=values[0];
});
