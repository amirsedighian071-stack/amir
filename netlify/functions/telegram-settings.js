// Configures Telegram through the server rather than browser-to-Telegram calls.
// It validates the token, sends a test message and registers the bot webhook.
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const {
  getTelegramConfig,
  normaliseTelegramConfig,
  readStoredTelegramConfig,
  saveTelegramConfig
} = require('./lib/telegram-config');

const SITE_STORE_NAME = 'site';
const SITE_KEY = 'site-data.json';
const SITE_TMP_FILE = path.join('/tmp', SITE_KEY);

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store'
};

function response(statusCode, body) {
  return { statusCode, headers, body: JSON.stringify(body) };
}

async function getSiteData() {
  try {
    const { getStore } = require('@netlify/blobs');
    const store = getStore(SITE_STORE_NAME);
    const raw = await store.get(SITE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (error) {
    // Local development uses the same fallback as site-data.js.
  }

  try {
    return JSON.parse(fs.readFileSync(SITE_TMP_FILE, 'utf8'));
  } catch (error) {
    return null;
  }
}

async function isPanelAdmin(credentials = {}) {
  const siteData = await getSiteData();
  const expected = (siteData && siteData.auth) || {
    username: process.env.SITE_ADMIN_USERNAME || 'admin',
    password: process.env.SITE_PASSWORD || 'admin123'
  };

  return Boolean(
    credentials &&
    credentials.username === expected.username &&
    credentials.password === expected.password
  );
}

async function telegramApi(token, method, body) {
  const apiResponse = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {})
  });

  let payload;
  try {
    payload = await apiResponse.json();
  } catch (error) {
    throw new Error('پاسخ نامعتبر از تلگرام دریافت شد.');
  }

  if (!apiResponse.ok || !payload.ok) {
    throw new Error(payload.description || 'ارتباط با تلگرام ناموفق بود.');
  }
  return payload.result;
}

function webhookUrl(event) {
  const incomingHeaders = event.headers || {};
  const hostHeader = incomingHeaders['x-forwarded-host'] || incomingHeaders.host || '';
  const host = String(hostHeader).split(',')[0].trim();
  if (!host || /^(localhost|127\.0\.0\.1)(:|$)/i.test(host)) return null;
  const protocol = (incomingHeaders['x-forwarded-proto'] || 'https').split(',')[0].trim();
  return `${protocol}://${host}/.netlify/functions/telegram-bot`;
}

function publicStatus(config) {
  return {
    configured: Boolean(config.botToken && config.chatId),
    botUsername: config.botUsername || '',
    chatIdHint: config.chatId ? `…${config.chatId.slice(-4)}` : '',
    cardConfigured: Boolean(config.cardNumber)
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };

  if (event.httpMethod === 'GET') {
    const config = await getTelegramConfig();
    return response(200, { ok: true, ...publicStatus(config) });
  }

  if (event.httpMethod !== 'POST') {
    return response(405, { ok: false, error: 'Method not allowed' });
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    if (!(await isPanelAdmin(payload.admin))) {
      return response(401, { ok: false, error: 'اجازه ذخیره تنظیمات ندارید. دوباره وارد پنل شوید.' });
    }

    const config = normaliseTelegramConfig(payload.config || {});
    if (!config.botToken || !config.chatId) {
      return response(400, { ok: false, error: 'توکن ربات و آیدی چت ادمین الزامی هستند.' });
    }

    // Validate the token before storing anything.
    const bot = await telegramApi(config.botToken, 'getMe');
    // Always derive the destination from the validated token. A manually typed
    // username could point customers to another bot even though this token was
    // the one webhooked by the panel.
    config.botUsername = (bot && bot.username ? bot.username : '').replace(/^@+/, '');
    if (!config.botUsername) {
      throw new Error('نام کاربری ربات از تلگرام دریافت نشد.');
    }

    const url = webhookUrl(event);
    if (url) {
      await telegramApi(config.botToken, 'setWebhook', {
        url,
        allowed_updates: ['message', 'callback_query'],
        drop_pending_updates: false
      });
    }

    await telegramApi(config.botToken, 'sendMessage', {
      chat_id: config.chatId,
      text: '✅ <b>اتصال ربات موفقیت‌آمیز بود!</b>\nتنظیمات ذخیره و وب‌هوک ربات فعال شد. سفارش‌های جدید به این چت ارسال می‌شوند.',
      parse_mode: 'HTML'
    });

    await saveTelegramConfig(config);

    // Read the configuration back through the same loader the order/checkout
    // functions use. If it does not round-trip (e.g. Blobs unavailable and
    // only ephemeral /tmp was written), tell the admin now instead of letting
    // every customer order fail later with "bot is not configured".
    const stored = await readStoredTelegramConfig();
    if (!stored || stored.botToken !== config.botToken || stored.chatId !== config.chatId) {
      return response(500, {
        ok: false,
        error: 'تنظیمات ذخیره نشد؛ فضای ذخیره‌سازی سایت در دسترس نیست. سایت را دوباره Deploy کنید و سپس تنظیمات را مجدداً ذخیره کنید.'
      });
    }

    return response(200, {
      ok: true,
      message: url
        ? 'پیام تست ارسال شد و ربات با موفقیت تنظیم گردید.'
        : 'پیام تست ارسال شد. در محیط محلی، وب‌هوک پس از استقرار روی دامنه سایت تنظیم می‌شود.',
      botUsername: config.botUsername,
      webhookUrl: url
    });
  } catch (error) {
    return response(400, {
      ok: false,
      error: error && error.message ? error.message : 'ذخیره تنظیمات تلگرام ناموفق بود.'
    });
  }
};
