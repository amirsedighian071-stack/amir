# سایت شخصی امیر صدیقیان

سایت شخصی با فروشگاه و پنل مدیریت کامل.

## ویژگی‌ها
- صفحه اصلی معرفی با مود تاریک/روشن
- فروشگاه هاست، دامنه، سرور و کانفیگ VPN
- سبد خرید و تکمیل سفارش
- اتصال به ربات تلگرام برای دریافت فاکتور، تایید پرداخت و ارسال
- پنل مدیریت کامل در `/admin`
- کاملاً ریسپانسیو

## استقرار روی Netlify

### ۱. آپلود روی GitHub
1. یک ریپازیتوری جدید در GitHub بسازید
2. در پوشه پروژه:
```bash
git init
git add .
git commit -m "First commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### ۲. اتصال به Netlify
1. وارد netlify.com شوید
2. Add new site → Import an existing project → GitHub
3. ریپازیتوری خود را انتخاب کنید
4. Build command: خالی بگذارید
5. Publish directory: خالی بگذارید (یا `.`)
6. Deploy کنید

### ۳. تنظیم متغیرهای محیطی (Site Settings → Environment variables)
- `BOT_TOKEN`: توکن ربات تلگرام (از @BotFather)
- `ADMIN_CHAT_ID`: آیدی عددی ادمین (از @userinfobot)
- `PAYMENT_CARD`: شماره کارت برای پرداخت
- `PAYMENT_CARD_HOLDER`: نام صاحب کارت
- `BOT_USERNAME`: نام کاربری ربات شما (مثلاً amirshop_bot)
- `SITE_PASSWORD`: رمز پنل ادمین (پیش‌فرض admin123)

### ۴. تنظیم Webhook ربات تلگرام
بعد از استقرار در نتلی‌فای، این آدرس را در مرورگر باز کنید:
```
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://your-site.netlify.app/.netlify/functions/telegram-bot
```

## پنل مدیریت
- آدرس: `/admin`
- کاربر: `admin`
- رمز: `admin123` (از داخل پنل قابل تغییر)

## ساختار فایل‌ها
```
├── index.html           # صفحه اصلی
├── shop.html            # فروشگاه
├── projects.html        # نمونه‌کارها
├── about.html           # درباره من
├── contact.html         # تماس
├── admin.html           # پنل مدیریت
├── admin/               # آدرس مخفی /admin/
├── app.js               # منطق اصلی سایت
├── admin.js             # منطق پنل
├── styles.css           # استایل‌ها
├── netlify.toml         # تنظیمات نتلی‌فای
└── netlify/functions/   # توابع سرورلس (ربات تلگرام)
```
