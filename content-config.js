// Shared content schema. All new settings are additive to existing saved data.
const CONTENT_SECTIONS = {
  "home": {
    "label": "بخش اصلی",
    "texts": {
      "home_label_1": "0",
      "home_label_2": "+",
      "home_label_3": "0",
      "home_label_4": "+",
      "home_label_5": "0",
      "home_label_6": "+",
      "home_label_7": "React",
      "home_label_8": "Python",
      "home_label_9": "Cloudflare",
      "home_label_10": "فروشگاه",
      "home_label_11": "تماس با من",
      "hero_badge": "برنامه‌نویس فول‌استک و مهندس زیرساخت",
      "hero_title_before": "امیر",
      "hero_title_grad": "صدیقیان",
      "hero_subtitle": "سلام 👋 امیر صدیقیان هستم، توسعه‌دهنده فول‌استک وب و متخصص ربات‌ها",
      "stats_projects": "پروژه موفق",
      "stats_years": "سال تجربه",
      "stats_clients": "مشتری راضی",
      "features_title": "خدمات من",
      "features_subtitle": "خدمات حرفه‌ای در حوزه توسعه و زیرساخت",
      "shopPreview_title": "محصولات پر فروش",
      "shopPreview_subtitle": "نمونه‌ای از سرویس‌های ارائه شده در فروشگاه",
      "shopPreview_btn": "مشاهده همه محصولات",
      "cta_home_title": "پروژه‌ای دارید که می‌خواهید بسازیم؟",
      "cta_home_desc": "همین حالا با من در ارتباط باشید تا درباره جزئیات پروژه صحبت کنیم.",
      "cta_home_btn": "شروع گفتگو",
      "home_stat_value_1": "مقدار آمار 1",
      "home_stat_value_2": "مقدار آمار 2",
      "home_stat_value_3": "مقدار آمار 3",
      "home_document_title": "عنوان تب مرورگر"
    },
    "visible": {
      "page_home": "نمایش کل محتوای صفحه",
      "home_heroimage_1": "تصویر اصلی 1",
      "home_floatingcard_1": "نشان فناوری 1",
      "home_floatingcard_2": "نشان فناوری 2",
      "home_floatingcard_3": "نشان فناوری 3",
      "home_stat_1": "آمار 1",
      "home_stat_2": "آمار 2",
      "home_stat_3": "آمار 3",
      "home_herobg_1": "پس‌زمینه متحرک 1",
      "home_sectionheader_1": "عنوان بخش 1",
      "home_sectionheader_2": "عنوان بخش 2",
      "home_button_12": "دکمه / لینک: فروشگاه",
      "home_button_13": "دکمه / لینک: تماس با من",
      "home_button_14": "دکمه / لینک: مشاهده همه محصولات",
      "home_button_15": "دکمه / لینک: شروع گفتگو",
      "hero": "معرفی اصلی",
      "stats": "آمار",
      "features": "خدمات",
      "shopPreview": "پیش‌نمایش فروشگاه",
      "cta_home": "کارت CTA صفحه اصلی",
      "cart_home": "دکمه شناور سبد خرید در این صفحه"
    }
  },
  "shop": {
    "label": "فروشگاه",
    "texts": {
      "shopCta_btn": "دکمه CTA فروشگاه",
      "shop_label_1": "خانه",
      "shop_label_2": "فروشگاه",
      "shopPage_title": "فروشگاه",
      "shopPage_subtitle": "خرید هاست، دامنه، سرور مجازی و کانفیگ‌های VPN پرسرعت با بهترین کی",
      "shopCta_title": "سرویس دلخواه خود را پیدا نکردید؟",
      "shopCta_desc": "برای سفارش کانفیگ اختصاصی یا مشاوره رایگان با من در تماس باشید.",
      "shop_document_title": "عنوان تب مرورگر",
      "shopDisabled_title": "در حال بروزرسانی هستیم",
      "shopDisabled_desc": "صبور باشید، به زودی با محصولات جدید برمی‌گردیم.",
      "shopDisabled_extra": "برای سفارش با پشتیبانی در ارتباط باشید.",
      "addToCart": "افزودن به سبد خرید",
      "viewCart": "مشاهده سبد خرید",
      "cartTitle": "سبد خرید",
      "cartEmpty": "سبد خرید شما خالی است",
      "goToShop": "بازدید از فروشگاه",
      "cartTotal": "مبلغ کل",
      "completeOrder": "تکمیل خرید",
      "continueShopping": "ادامه خرید",
      "checkoutTitle": "تکمیل سفارش",
      "checkoutDesc": "اطلاعات خود را وارد کنید؛ پس از ثبت، فاکتور در ربات متصل به سایت ",
      "yourName": "نام و نام خانوادگی *",
      "yourPhone": "شماره تماس *",
      "yourTelegramId": "آیدی تلگرام برای ارتباط ادمین *",
      "yourEmail": "ایمیل (اختیاری)",
      "telegramIdHint": "آیدی را به شکل @username وارد کنید؛ ادمین فقط از همین آیدی با شما",
      "orderNote": "یادداشت (اختیاری)",
      "sendOrder": "ثبت سفارش و دریافت فاکتور در ربات",
      "orderSuccess": "✓ سفارش شما با موفقیت ثبت شد! به زودی با شما تماس می‌گیریم.",
      "orderError": "خطا در ارسال سفارش. لطفاً دوباره تلاش کنید یا مستقیماً از تلگرام ",
      "detailsProduct": "مشاهده جزئیات"
    },
    "visible": {
      "shopCta": "نمایش کارت CTA",
      "page_shop": "نمایش کل محتوای صفحه",
      "shop_breadcrumb_1": "مسیر صفحه 1",
      "shop_button_3": "دکمه CTA فروشگاه",
      "shopPage": "محتوای فروشگاه",
      "shopFilters": "فیلتر دسته‌بندی",
      "productImage": "عکس محصول",
      "productBadge": "نشان محصول",
      "productCategory": "دسته محصول",
      "productName": "نام محصول",
      "productDescription": "توضیح محصول",
      "productFeatures": "ویژگی‌های محصول",
      "productPrice": "قیمت محصول",
      "productBuy": "دکمه خرید محصول",
      "shopDisabled_animation": "انیمیشن بروزرسانی",
      "shopDisabled_support": "دکمه پشتیبانی",
      "cart_shop": "دکمه شناور سبد خرید در این صفحه"
    }
  },
  "about": {
    "label": "درباره من",
    "texts": {
      "aboutCta_title": "عنوان کارت CTA درباره من",
      "aboutCta_desc": "توضیح کارت CTA درباره من",
      "aboutCta_btn": "دکمه CTA درباره من",
      "about_label_1": "خانه",
      "about_label_2": "درباره من",
      "about_label_3": "سال تجربه",
      "about_title": "درباره من",
      "about_subtitle": "آشنایی بیشتر با امیر صدیقیان.",
      "about_years": "۵+",
      "about_name": "امیر صدیقیان",
      "about_intro": "با بیش از ۵ سال تجربه در حوزه توسعه نرم‌افزار و مهندسی زیرساخت، د",
      "about_block1_title": "توسعه نرم‌افزار و وب",
      "about_block1_desc": "برنامه‌نویس فول‌استک وب و متخصص ربات‌های تلگرام (به‌ویژه ربات‌های",
      "about_block2_title": "مهندسی زیرساخت و شبکه",
      "about_block2_desc": "مهندس زیرساخت کلادفلر و علاقه‌مند به شبکه‌های امن و پروتکل‌های V2",
      "about_block3_title": "زبان‌های برنامه‌نویسی",
      "about_block3_desc": "مسلط به پایتون، جاوا اسکریپت، تایپ‌اسکریپت، HTML، CSS و PHP.",
      "skills_title": "مهارت‌ها",
      "whyme_title": "چرا همکاری با من؟",
      "whyme_subtitle": "چیزی که کار من رو متمایز می‌کنه",
      "about_document_title": "عنوان تب مرورگر"
    },
    "visible": {
      "aboutCta": "نمایش کارت CTA در بخش درباره من",
      "page_about": "نمایش کل محتوای صفحه",
      "about_breadcrumb_1": "مسیر صفحه 1",
      "about_aboutimage_1": "تصویر درباره من 1",
      "about_aboutblock_1": "کارت تخصص 1",
      "about_aboutblock_2": "کارت تخصص 2",
      "about_aboutblock_3": "کارت تخصص 3",
      "about_experiencebadge_1": "نشان تجربه 1",
      "about_sectionheader_1": "عنوان بخش 1",
      "about_button_4": "دکمه CTA درباره من",
      "about": "معرفی درباره من",
      "skills": "مهارت‌ها",
      "whyme": "چرا همکاری با من؟",
      "cart_about": "دکمه شناور سبد خرید در این صفحه"
    }
  },
  "contact": {
    "label": "تماس با من",
    "texts": {
      "contact_label_1": "خانه",
      "contact_label_2": "تماس با من",
      "contact_placeholder_cPhone": "مثلاً ۰۹۱۲۳۴۵۶۷۸۹",
      "contact_placeholder_cSubject": "موضوع پیام",
      "contact_title": "تماس با من",
      "contact_subtitle": "برای سفارش پروژه، مشاوره و یا سوالات خود از راه‌های زیر با من در ",
      "contactForm_title": "ارسال پیام",
      "contact_name": "نام و نام خانوادگی",
      "contact_phone": "شماره تماس",
      "contact_email": "ایمیل",
      "contact_subject": "موضوع",
      "contact_message": "پیام شما",
      "contact_send": "ارسال پیام",
      "contact_document_title": "عنوان تب مرورگر",
      "formSuccess": "✓ پیام شما با موفقیت ارسال شد. به زودی پاسخ خواهم داد."
    },
    "visible": {
      "page_contact": "نمایش کل محتوای صفحه",
      "contact_breadcrumb_1": "مسیر صفحه 1",
      "contact_pageheader_1": "سربرگ صفحه 1",
      "contact_button_3": "دکمه / لینک: ارسال پیام",
      "contact_field_cName": "فیلد: نام و نام خانوادگی *",
      "contact_field_cPhone": "فیلد: شماره تماس *",
      "contact_field_cEmail": "فیلد: ایمیل",
      "contact_field_cSubject": "فیلد: موضوع",
      "contact_field_cMessage": "فیلد: پیام *",
      "contactInfo": "اطلاعات تماس",
      "contactForm": "فرم تماس",
      "cart_contact": "دکمه شناور سبد خرید در این صفحه"
    }
  },
  "header": {
    "label": "هدر",
    "texts": {
      "header_label_1": "خانه",
      "header_label_2": "فروشگاه",
      "header_label_3": "نمونه‌کارها",
      "header_label_4": "درباره من",
      "header_label_5": "تماس با من",
      "header_label_6": "EN",
      "brand": "AmirSedighian"
    },
    "visible": {
      "header": "نمایش کل هدر",
      "header_logo_1": "نام و آیکون برند 1",
      "header_navmenu_1": "منوی اصلی 1",
      "header_themeToggle_1": "دکمه تغییر پوسته 1",
      "header_mobileMenuBtn_1": "دکمه منوی موبایل 1",
      "header_languageToggle_1": "دکمه تغییر زبان 1",
      "header_button_7": "دکمه / لینک: خانه",
      "header_button_8": "دکمه / لینک: فروشگاه",
      "header_button_9": "دکمه / لینک: نمونه‌کارها",
      "header_button_10": "دکمه / لینک: درباره من",
      "header_button_11": "دکمه / لینک: تماس با من"
    }
  },
  "footer": {
    "label": "فوتر",
    "texts": {
      "footer_brand": "نام مستقل فوتر",
      "copyright": "متن کامل کپی‌رایت",
      "footer_label_1": "دسترسی سریع",
      "footer_label_2": "خانه",
      "footer_label_3": "فروشگاه",
      "footer_label_4": "نمونه‌کارها",
      "footer_label_5": "درباره من",
      "footer_label_6": "تماس با من",
      "footer_label_7": "شبکه‌های اجتماعی",
      "footer_about": "توسعه‌دهنده فول‌استک و مهندس زیرساخت."
    },
    "visible": {
      "footer_logo_1": "نام و آیکون برند 1",
      "footer_footercol_1": "ستون فوتر 1",
      "footer_footercol_2": "ستون فوتر 2",
      "footer_footercol_3": "ستون فوتر 3",
      "footer_footerbottom_1": "کپی‌رایت 1",
      "footer_button_8": "دکمه / لینک: خانه",
      "footer_button_9": "دکمه / لینک: فروشگاه",
      "footer_button_10": "دکمه / لینک: نمونه‌کارها",
      "footer_button_11": "دکمه / لینک: درباره من",
      "footer_button_12": "دکمه / لینک: تماس با من",
      "footer": "نمایش کل فوتر"
    }
  },
  "projects": {
    "label": "نمونه‌کارها",
    "texts": {
      "projects_label_1": "خانه",
      "projects_label_2": "نمونه‌کارها",
      "projects_title": "نمونه‌کارها",
      "projects_subtitle": "برخی از پروژه‌های انجام شده.",
      "projectsCta_title": "پروژه مشابهی می‌خواهید؟",
      "projectsCta_desc": "با توضیح پروژه‌ی خود با من تماس بگیرید تا بهترین راهکار را ارائه ",
      "projectsCta_btn": "درخواست پروژه",
      "projects_document_title": "عنوان تب مرورگر"
    },
    "visible": {
      "projectsCta": "نمایش کارت CTA",
      "page_projects": "نمایش کل محتوای صفحه",
      "projects_breadcrumb_1": "مسیر صفحه 1",
      "projects_button_3": "دکمه / لینک: درخواست پروژه",
      "projects": "پروژه‌ها",
      "cart_projects": "دکمه شناور سبد خرید در این صفحه"
    }
  }
};
const CONTENT_FA = {
  "footer_brand": "Mr aMir",
  "copyright": "© 2026 Mr aMir. Built for the web.",
  "aboutCta_title": "آماده همکاری هستید؟",
  "aboutCta_desc": "اگر به دنبال همکار متخصص هستید، با من در ارتباط باشید.",
  "aboutCta_btn": "تماس با من",
  "shopCta_btn": "تماس با من",
  "header_label_1": "خانه",
  "header_label_2": "فروشگاه",
  "header_label_3": "نمونه‌کارها",
  "header_label_4": "درباره من",
  "header_label_5": "تماس با من",
  "header_label_6": "EN",
  "home_label_1": "0",
  "home_label_2": "+",
  "home_label_3": "0",
  "home_label_4": "+",
  "home_label_5": "0",
  "home_label_6": "+",
  "home_label_7": "React",
  "home_label_8": "Python",
  "home_label_9": "Cloudflare",
  "home_label_10": "فروشگاه",
  "home_label_11": "تماس با من",
  "footer_label_1": "دسترسی سریع",
  "footer_label_2": "خانه",
  "footer_label_3": "فروشگاه",
  "footer_label_4": "نمونه‌کارها",
  "footer_label_5": "درباره من",
  "footer_label_6": "تماس با من",
  "footer_label_7": "شبکه‌های اجتماعی",
  "brand": "AmirSedighian",
  "hero_badge": "برنامه‌نویس فول‌استک و مهندس زیرساخت",
  "hero_title_before": "امیر",
  "hero_title_grad": "صدیقیان",
  "hero_subtitle": "سلام 👋 امیر صدیقیان هستم، توسعه‌دهنده فول‌استک وب و متخصص ربات‌های تلگرام. طراحی و توسعه وب‌سایت‌های مدرن، ربات‌های دو زبانه با پنل ادمین و راهکارهای زیرساختی مبتنی بر کلادفلر رو انجام می‌دم.",
  "stats_projects": "پروژه موفق",
  "stats_years": "سال تجربه",
  "stats_clients": "مشتری راضی",
  "features_title": "خدمات من",
  "features_subtitle": "خدمات حرفه‌ای در حوزه توسعه و زیرساخت",
  "shopPreview_title": "محصولات پر فروش",
  "shopPreview_subtitle": "نمونه‌ای از سرویس‌های ارائه شده در فروشگاه",
  "shopPreview_btn": "مشاهده همه محصولات",
  "cta_home_title": "پروژه‌ای دارید که می‌خواهید بسازیم؟",
  "cta_home_desc": "همین حالا با من در ارتباط باشید تا درباره جزئیات پروژه صحبت کنیم.",
  "cta_home_btn": "شروع گفتگو",
  "footer_about": "توسعه‌دهنده فول‌استک و مهندس زیرساخت.",
  "home_stat_value_1": "50",
  "home_stat_value_2": "5",
  "home_stat_value_3": "30",
  "home_document_title": "امیر صدیقیان – فول‌استک دولوپر و مهندس زیرساخت",
  "shop_label_1": "خانه",
  "shop_label_2": "فروشگاه",
  "shopPage_title": "فروشگاه",
  "shopPage_subtitle": "خرید هاست، دامنه، سرور مجازی و کانفیگ‌های VPN پرسرعت با بهترین کیفیت و پشتیبانی.",
  "shopCta_title": "سرویس دلخواه خود را پیدا نکردید؟",
  "shopCta_desc": "برای سفارش کانفیگ اختصاصی یا مشاوره رایگان با من در تماس باشید.",
  "shop_document_title": "فروشگاه – امیر صدیقیان",
  "about_label_1": "خانه",
  "about_label_2": "درباره من",
  "about_label_3": "سال تجربه",
  "about_title": "درباره من",
  "about_subtitle": "آشنایی بیشتر با امیر صدیقیان.",
  "about_years": "۵+",
  "about_name": "امیر صدیقیان",
  "about_intro": "با بیش از ۵ سال تجربه در حوزه توسعه نرم‌افزار و مهندسی زیرساخت، در زمینه‌های زیر فعالیت و تخصص دارم:",
  "about_block1_title": "توسعه نرم‌افزار و وب",
  "about_block1_desc": "برنامه‌نویس فول‌استک وب و متخصص ربات‌های تلگرام (به‌ویژه ربات‌های دو زبانه با پنل ادمین تحت وب با استفاده از React، Tailwind CSS، Cloudflare Workers و Cloudflare KV).",
  "about_block2_title": "مهندسی زیرساخت و شبکه",
  "about_block2_desc": "مهندس زیرساخت کلادفلر و علاقه‌مند به شبکه‌های امن و پروتکل‌های V2Ray (مانند VLESS، VMess، Trojan با REALITY و gRPC) و ابزارهای مدیریت سرور.",
  "about_block3_title": "زبان‌های برنامه‌نویسی",
  "about_block3_desc": "مسلط به پایتون، جاوا اسکریپت، تایپ‌اسکریپت، HTML، CSS و PHP.",
  "skills_title": "مهارت‌ها",
  "whyme_title": "چرا همکاری با من؟",
  "whyme_subtitle": "چیزی که کار من رو متمایز می‌کنه",
  "about_document_title": "درباره من – امیر صدیقیان",
  "contact_label_1": "خانه",
  "contact_label_2": "تماس با من",
  "contact_placeholder_cPhone": "مثلاً ۰۹۱۲۳۴۵۶۷۸۹",
  "contact_placeholder_cSubject": "موضوع پیام",
  "contact_title": "تماس با من",
  "contact_subtitle": "برای سفارش پروژه، مشاوره و یا سوالات خود از راه‌های زیر با من در ارتباط باشید.",
  "contactForm_title": "ارسال پیام",
  "contact_name": "نام و نام خانوادگی",
  "contact_phone": "شماره تماس",
  "contact_email": "ایمیل",
  "contact_subject": "موضوع",
  "contact_message": "پیام شما",
  "contact_send": "ارسال پیام",
  "contact_document_title": "تماس با من – امیر صدیقیان",
  "projects_label_1": "خانه",
  "projects_label_2": "نمونه‌کارها",
  "projects_title": "نمونه‌کارها",
  "projects_subtitle": "برخی از پروژه‌های انجام شده.",
  "projectsCta_title": "پروژه مشابهی می‌خواهید؟",
  "projectsCta_desc": "با توضیح پروژه‌ی خود با من تماس بگیرید تا بهترین راهکار را ارائه دهم.",
  "projectsCta_btn": "درخواست پروژه",
  "projects_document_title": "نمونه‌کارها – امیر صدیقیان",
  "formSuccess": "✓ پیام شما با موفقیت ارسال شد. به زودی پاسخ خواهم داد.",
  "shopDisabled_title": "در حال بروزرسانی هستیم",
  "shopDisabled_desc": "صبور باشید، به زودی با محصولات جدید برمی‌گردیم.",
  "shopDisabled_extra": "برای سفارش با پشتیبانی در ارتباط باشید.",
  "addToCart": "افزودن به سبد خرید",
  "viewCart": "مشاهده سبد خرید",
  "cartTitle": "سبد خرید",
  "cartEmpty": "سبد خرید شما خالی است",
  "goToShop": "بازدید از فروشگاه",
  "cartTotal": "مبلغ کل",
  "completeOrder": "تکمیل خرید",
  "continueShopping": "ادامه خرید",
  "checkoutTitle": "تکمیل سفارش",
  "checkoutDesc": "اطلاعات خود را وارد کنید؛ پس از ثبت، فاکتور در ربات متصل به سایت برای شما نمایش داده می‌شود.",
  "yourName": "نام و نام خانوادگی *",
  "yourPhone": "شماره تماس *",
  "yourTelegramId": "آیدی تلگرام برای ارتباط ادمین *",
  "yourEmail": "ایمیل (اختیاری)",
  "telegramIdHint": "آیدی را به شکل @username وارد کنید؛ ادمین فقط از همین آیدی با شما در ارتباط خواهد بود.",
  "orderNote": "یادداشت (اختیاری)",
  "sendOrder": "ثبت سفارش و دریافت فاکتور در ربات",
  "orderSuccess": "✓ سفارش شما با موفقیت ثبت شد! به زودی با شما تماس می‌گیریم.",
  "orderError": "خطا در ارسال سفارش. لطفاً دوباره تلاش کنید یا مستقیماً از تلگرام با ما در ارتباط باشید.",
  "detailsProduct": "مشاهده جزئیات"
};
const CONTENT_EN = {
  "footer_brand": "Mr aMir",
  "copyright": "© 2026 Mr aMir. Built for the web.",
  "aboutCta_title": "Ready to work together?",
  "aboutCta_desc": "Looking for an experienced developer? Let’s talk.",
  "aboutCta_btn": "Contact me",
  "shopCta_btn": "Contact me",
  "header_label_1": "Home",
  "header_label_2": "Shop",
  "header_label_3": "Projects",
  "header_label_4": "About me",
  "header_label_5": "Contact me",
  "header_label_6": "EN",
  "home_label_1": "0",
  "home_label_2": "+",
  "home_label_3": "0",
  "home_label_4": "+",
  "home_label_5": "0",
  "home_label_6": "+",
  "home_label_7": "React",
  "home_label_8": "Python",
  "home_label_9": "Cloudflare",
  "home_label_10": "Shop",
  "home_label_11": "Contact me",
  "footer_label_1": "Quick links",
  "footer_label_2": "Home",
  "footer_label_3": "Shop",
  "footer_label_4": "Projects",
  "footer_label_5": "About me",
  "footer_label_6": "Contact me",
  "footer_label_7": "Social links",
  "brand": "AmirSedighian",
  "hero_badge": "برنامه‌نویس فول‌استک و مهندس زیرساخت",
  "hero_title_before": "امیر",
  "hero_title_grad": "صدیقیان",
  "hero_subtitle": "سلام 👋 امیر صدیقیان هستم، توسعه‌دهنده فول‌استک وب و متخصص ربات‌های تلگرام. طراحی و توسعه وب‌سایت‌های مدرن، ربات‌های دو زبانه با پنل ادمین و راهکارهای زیرساختی مبتنی بر کلادفلر رو انجام می‌دم.",
  "stats_projects": "پروژه موفق",
  "stats_years": "سال تجربه",
  "stats_clients": "مشتری راضی",
  "features_title": "خدمات من",
  "features_subtitle": "خدمات حرفه‌ای در حوزه توسعه و زیرساخت",
  "shopPreview_title": "محصولات پر فروش",
  "shopPreview_subtitle": "نمونه‌ای از سرویس‌های ارائه شده در فروشگاه",
  "shopPreview_btn": "مشاهده همه محصولات",
  "cta_home_title": "پروژه‌ای دارید که می‌خواهید بسازیم؟",
  "cta_home_desc": "همین حالا با من در ارتباط باشید تا درباره جزئیات پروژه صحبت کنیم.",
  "cta_home_btn": "شروع گفتگو",
  "footer_about": "توسعه‌دهنده فول‌استک و مهندس زیرساخت.",
  "home_stat_value_1": "50",
  "home_stat_value_2": "5",
  "home_stat_value_3": "30",
  "home_document_title": "Home — Mr aMir",
  "shop_label_1": "Home",
  "shop_label_2": "Shop",
  "shopPage_title": "فروشگاه",
  "shopPage_subtitle": "خرید هاست، دامنه، سرور مجازی و کانفیگ‌های VPN پرسرعت با بهترین کیفیت و پشتیبانی.",
  "shopCta_title": "سرویس دلخواه خود را پیدا نکردید؟",
  "shopCta_desc": "برای سفارش کانفیگ اختصاصی یا مشاوره رایگان با من در تماس باشید.",
  "shop_document_title": "Shop — Mr aMir",
  "about_label_1": "Home",
  "about_label_2": "About me",
  "about_label_3": "Years of experience",
  "about_title": "درباره من",
  "about_subtitle": "آشنایی بیشتر با امیر صدیقیان.",
  "about_years": "۵+",
  "about_name": "امیر صدیقیان",
  "about_intro": "با بیش از ۵ سال تجربه در حوزه توسعه نرم‌افزار و مهندسی زیرساخت، در زمینه‌های زیر فعالیت و تخصص دارم:",
  "about_block1_title": "توسعه نرم‌افزار و وب",
  "about_block1_desc": "برنامه‌نویس فول‌استک وب و متخصص ربات‌های تلگرام (به‌ویژه ربات‌های دو زبانه با پنل ادمین تحت وب با استفاده از React، Tailwind CSS، Cloudflare Workers و Cloudflare KV).",
  "about_block2_title": "مهندسی زیرساخت و شبکه",
  "about_block2_desc": "مهندس زیرساخت کلادفلر و علاقه‌مند به شبکه‌های امن و پروتکل‌های V2Ray (مانند VLESS، VMess، Trojan با REALITY و gRPC) و ابزارهای مدیریت سرور.",
  "about_block3_title": "زبان‌های برنامه‌نویسی",
  "about_block3_desc": "مسلط به پایتون، جاوا اسکریپت، تایپ‌اسکریپت، HTML، CSS و PHP.",
  "skills_title": "مهارت‌ها",
  "whyme_title": "چرا همکاری با من؟",
  "whyme_subtitle": "چیزی که کار من رو متمایز می‌کنه",
  "about_document_title": "About me — Mr aMir",
  "contact_label_1": "Home",
  "contact_label_2": "Contact me",
  "contact_placeholder_cPhone": "e.g. +98 912 345 6789",
  "contact_placeholder_cSubject": "Message subject",
  "contact_title": "تماس با من",
  "contact_subtitle": "برای سفارش پروژه، مشاوره و یا سوالات خود از راه‌های زیر با من در ارتباط باشید.",
  "contactForm_title": "ارسال پیام",
  "contact_name": "نام و نام خانوادگی",
  "contact_phone": "شماره تماس",
  "contact_email": "ایمیل",
  "contact_subject": "موضوع",
  "contact_message": "پیام شما",
  "contact_send": "ارسال پیام",
  "contact_document_title": "Contact me — Mr aMir",
  "projects_label_1": "Home",
  "projects_label_2": "Projects",
  "projects_title": "نمونه‌کارها",
  "projects_subtitle": "برخی از پروژه‌های انجام شده.",
  "projectsCta_title": "پروژه مشابهی می‌خواهید؟",
  "projectsCta_desc": "با توضیح پروژه‌ی خود با من تماس بگیرید تا بهترین راهکار را ارائه دهم.",
  "projectsCta_btn": "درخواست پروژه",
  "projects_document_title": "Projects — Mr aMir",
  "formSuccess": "✓ پیام شما با موفقیت ارسال شد. به زودی پاسخ خواهم داد.",
  "shopDisabled_title": "در حال بروزرسانی هستیم",
  "shopDisabled_desc": "صبور باشید، به زودی با محصولات جدید برمی‌گردیم.",
  "shopDisabled_extra": "برای سفارش با پشتیبانی در ارتباط باشید.",
  "addToCart": "افزودن به سبد خرید",
  "viewCart": "مشاهده سبد خرید",
  "cartTitle": "سبد خرید",
  "cartEmpty": "سبد خرید شما خالی است",
  "goToShop": "بازدید از فروشگاه",
  "cartTotal": "مبلغ کل",
  "completeOrder": "تکمیل خرید",
  "continueShopping": "ادامه خرید",
  "checkoutTitle": "تکمیل سفارش",
  "checkoutDesc": "اطلاعات خود را وارد کنید؛ پس از ثبت، فاکتور در ربات متصل به سایت برای شما نمایش داده می‌شود.",
  "yourName": "نام و نام خانوادگی *",
  "yourPhone": "شماره تماس *",
  "yourTelegramId": "آیدی تلگرام برای ارتباط ادمین *",
  "yourEmail": "ایمیل (اختیاری)",
  "telegramIdHint": "آیدی را به شکل @username وارد کنید؛ ادمین فقط از همین آیدی با شما در ارتباط خواهد بود.",
  "orderNote": "یادداشت (اختیاری)",
  "sendOrder": "ثبت سفارش و دریافت فاکتور در ربات",
  "orderSuccess": "✓ سفارش شما با موفقیت ثبت شد! به زودی با شما تماس می‌گیریم.",
  "orderError": "خطا در ارسال سفارش. لطفاً دوباره تلاش کنید یا مستقیماً از تلگرام با ما در ارتباط باشید.",
  "detailsProduct": "مشاهده جزئیات"
};

const CONTENT_LINKS = {
  "header": {
    "header_logo_1": {
      "label": "AmirSedighian",
      "url": "index.html"
    },
    "header_button_7": {
      "label": "خانه",
      "url": "index.html"
    },
    "header_button_8": {
      "label": "فروشگاه",
      "url": "shop.html"
    },
    "header_button_9": {
      "label": "نمونه‌کارها",
      "url": "projects.html"
    },
    "header_button_10": {
      "label": "درباره من",
      "url": "about.html"
    },
    "header_button_11": {
      "label": "تماس با من",
      "url": "contact.html"
    }
  },
  "home": {
    "home_button_12": {
      "label": "فروشگاه",
      "url": "shop.html"
    },
    "home_button_13": {
      "label": "تماس با من",
      "url": "contact.html"
    },
    "home_button_14": {
      "label": "مشاهده همه محصولات",
      "url": "shop.html"
    },
    "home_button_15": {
      "label": "شروع گفتگو",
      "url": "contact.html"
    }
  },
  "footer": {
    "footer_logo_1": {
      "label": "AmirSedighian",
      "url": "index.html"
    },
    "footer_button_8": {
      "label": "خانه",
      "url": "index.html"
    },
    "footer_button_9": {
      "label": "فروشگاه",
      "url": "shop.html"
    },
    "footer_button_10": {
      "label": "نمونه‌کارها",
      "url": "projects.html"
    },
    "footer_button_11": {
      "label": "درباره من",
      "url": "about.html"
    },
    "footer_button_12": {
      "label": "تماس با من",
      "url": "contact.html"
    }
  },
  "shop": {
    "shop_button_3": {
      "label": "مقصد لینک",
      "url": "contact.html"
    }
  },
  "about": {
    "about_button_4": {
      "label": "مقصد لینک",
      "url": "contact.html"
    }
  },
  "projects": {
    "projects_button_3": {
      "label": "درخواست پروژه",
      "url": "contact.html"
    }
  }
};

['home_label_1','home_label_3','home_label_5'].forEach(key=>{delete CONTENT_SECTIONS.home.texts[key]; delete CONTENT_FA[key]; delete CONTENT_EN[key];});
Object.keys(CONTENT_SECTIONS.header.texts).forEach(key=>{if(CONTENT_FA[key]==='EN'){delete CONTENT_SECTIONS.header.texts[key];delete CONTENT_FA[key];delete CONTENT_EN[key];}});

Object.assign(CONTENT_SECTIONS.shop.visible, {
    productDetailImage:'تصویر جزئیات محصول', productDetailCategory:'دسته‌بندی جزئیات محصول', productDetailTitle:'عنوان جزئیات محصول', productDetailDesc:'توضیح کوتاه جزئیات محصول', productDetailLong:'توضیحات کامل محصول', productDetailFeatures:'ویژگی‌های جزئیات محصول', productDetailPrice:'قیمت و تعداد در جزئیات محصول', productDetailAdd:'دکمه افزودن به سبد', productDetailCart:'دکمه مشاهده سبد', cartCheckout:'دکمه تکمیل خرید', checkoutName:'فیلد نام سفارش', checkoutPhone:'فیلد تلفن سفارش', checkoutEmail:'فیلد ایمیل سفارش', checkoutNote:'فیلد یادداشت سفارش', checkoutSubmit:'دکمه ثبت سفارش'
});
Object.assign(CONTENT_SECTIONS.projects.visible, {projectDetailImage:'تصویر جزئیات پروژه',projectDetailTitle:'عنوان جزئیات پروژه',projectDetailTag:'برچسب جزئیات پروژه',projectDetailDesc:'توضیح کوتاه جزئیات پروژه',projectDetailLong:'توضیح کامل جزئیات پروژه',projectDetailTech:'فناوری‌های جزئیات پروژه',projectDetailContact:'دکمه درخواست پروژه مشابه',projectDetailShop:'دکمه فروشگاه در جزئیات پروژه'});

// The home-page product preview has its own controls; hiding a shop button
// must not silently hide the equivalent action in a different section.
['productImage','productBadge','productCategory','productName','productDescription','productFeatures','productPrice','productBuy'].forEach(key=>{
    CONTENT_SECTIONS.home.visible['home_'+key]='پیش‌نمایش فروشگاه: '+CONTENT_SECTIONS.shop.visible[key];
});
Object.assign(CONTENT_SECTIONS.home.visible, {home_sliderArrows:'دکمه‌های قبلی و بعدی اسلایدر',home_sliderDots:'نقطه‌های اسلایدر',home_sliderProgress:'نوار پیشرفت اسلایدر'});
Object.assign(CONTENT_SECTIONS.shop.visible, {checkoutForm:'فرم تکمیل سفارش'});

CONTENT_SECTIONS.header.texts.brand='نام لوگوی هدر';
CONTENT_SECTIONS.footer.visible.footer_footercol_1='ستون معرفی و برند';
CONTENT_SECTIONS.footer.visible.footer_footercol_2='ستون دسترسی سریع';
CONTENT_SECTIONS.footer.visible.footer_footercol_3='ستون شبکه‌های اجتماعی';
CONTENT_LINKS.shop.shopDisabled_support={label:'مقصد دکمه پشتیبانی فروشگاه غیرفعال',url:'contact.html'};
