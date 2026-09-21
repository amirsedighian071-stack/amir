// Netlify Function: persist an order, notify the admin bot and return its deep link.
const fetch = require('node-fetch');
const { getTelegramConfig } = require('./lib/telegram-config');
const { loadOrders, saveOrders } = require('./lib/orders');
const { readData } = require('./site-data');

function toPersian(n) {
  const p = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  return String(n).replace(/\d/g, d => p[d]);
}
function fmtPrice(n) {
  return toPersian(Number(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));
}
function clean(value, maxLength = 500) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}
function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function normaliseTelegramUsername(value) {
  return clean(value, 80)
    .replace(/^https?:\/\/(?:www\.)?t\.me\//i, '')
    .replace(/^@+/, '')
    .replace(/\/$/, '');
}
function telegramUsernameIsValid(value) {
  return /^[A-Za-z][A-Za-z0-9_]{4,31}$/.test(value);
}

async function telegramApi(token, method, body) {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const result = await response.json();
  if (!response.ok || !result.ok) {
    throw new Error(result.description || 'Telegram API error');
  }
  return result.result;
}

function deepLink(botUsername, orderId) {
  const param = Buffer.from(JSON.stringify({ oid: orderId }))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
  return `https://t.me/${botUsername}?start=${param}`;
}

// Same builder as telegram-settings.js: the public URL of this site's bot
// function, derived from the request that is currently placing the order.
// Returns null for local development where Telegram cannot reach the site.
function webhookUrl(event) {
  const incomingHeaders = event.headers || {};
  const hostHeader = incomingHeaders['x-forwarded-host'] || incomingHeaders.host || '';
  const host = String(hostHeader).split(',')[0].trim();
  if (!host || /^(localhost|127\.0\.0\.1)(:|$)/i.test(host)) return null;
  const protocol = (incomingHeaders['x-forwarded-proto'] || 'https').split(',')[0].trim();
  return `${protocol}://${host}/.netlify/functions/telegram-bot`;
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };
  const respond = (statusCode, body) => ({ statusCode, headers, body: JSON.stringify(body) });

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return respond(405, { ok: false, error: 'Method not allowed' });

  try {
    const payload = JSON.parse(event.body || '{}');
    const site = await readData();
    if (site?.maintenanceMode === true) {
      return respond(503, {ok:false, code:'SITE_IN_MAINTENANCE', error:'سایت در حال بروزرسانی است.'});
    }
    if (site?.shopEnabled === false || site?.visible?.checkoutForm === false || site?.visible?.checkoutSubmit === false) {
      return respond(503, {ok:false, code:'SHOP_UNAVAILABLE', error:'فروشگاه در حال بروزرسانی است.'});
    }
    // Hidden optional identity fields may be omitted, but the Telegram ID
    // remains required for invoice delivery and customer communication.
    const nameRequired = site?.visible?.checkoutName !== false;
    const phoneRequired = site?.visible?.checkoutPhone !== false;
    if (!nameRequired) payload.name = '';
    if (!phoneRequired) payload.phone = '';
    const orderId = clean(payload.id, 80);
    const telegramUsername = normaliseTelegramUsername(payload.telegramId);
    const rawItems = Array.isArray(payload.items) ? payload.items : [];

    if (!/^ORD-[A-Z0-9]{4,36}$/.test(orderId) || (nameRequired && !clean(payload.name, 80)) || (phoneRequired && !clean(payload.phone, 30)) || !rawItems.length) {
      return respond(400, { ok: false, error: 'اطلاعات ضروری سفارش کامل نیست.' });
    }
    if (!telegramUsernameIsValid(telegramUsername)) {
      return respond(400, { ok: false, error: 'آیدی تلگرام واردشده معتبر نیست.' });
    }

    // This is the private bot configuration created by the admin panel. The
    // browser-supplied payload can never choose a different Telegram account.
    const telegram = await getTelegramConfig();
    if (!telegram.botToken || !telegram.chatId) {
      console.log('Order blocked: no stored Telegram configuration (botToken/chatId missing).');
      return respond(503, {
        ok: false,
        error: 'ربات سفارش‌ها هنوز توسط ادمین فعال و وب‌هوک نشده است.'
      });
    }

    // Re-check Telegram at order time. This makes the validated token—not a
    // stored/manual username—the only source for the customer destination.
    const [botInfo, webhookInfo] = await Promise.all([
      telegramApi(telegram.botToken, 'getMe', {}),
      telegramApi(telegram.botToken, 'getWebhookInfo', {})
    ]);
    const configuredBotUsername = normaliseTelegramUsername(botInfo && botInfo.username);
    if (!telegramUsernameIsValid(configuredBotUsername)) {
      console.log('Order blocked: getMe did not return a valid bot username.');
      return respond(503, {
        ok: false,
        error: 'ربات سفارش‌ها هنوز توسط ادمین فعال و وب‌هوک نشده است.'
      });
    }

    // The webhook must point at this site's telegram-bot function, otherwise
    // the customer could be redirected to a bot that can never receive their
    // payment receipt. The registered webhook legitimately drifts though —
    // e.g. it was registered on the netlify.app subdomain while orders now
    // arrive on the custom domain (or the inverse, or a stale deploy preview).
    // Because the admin owns the bot (we hold its token), repair the webhook
    // in place instead of rejecting every order, and only refuse the order
    // when the repair itself fails. Local development skips this gate because
    // Telegram cannot reach localhost anyway.
    const desiredWebhookUrl = webhookUrl(event);
    if (desiredWebhookUrl) {
      let currentWebhookUrl = webhookInfo && webhookInfo.url ? webhookInfo.url : '';
      if (currentWebhookUrl !== desiredWebhookUrl) {
        console.log(`Webhook drift detected (${currentWebhookUrl || 'empty'} -> ${desiredWebhookUrl}); re-registering.`);
        try {
          await telegramApi(telegram.botToken, 'setWebhook', {
            url: desiredWebhookUrl,
            allowed_updates: ['message', 'callback_query'],
            drop_pending_updates: false
          });
          const verified = await telegramApi(telegram.botToken, 'getWebhookInfo', {});
          currentWebhookUrl = verified && verified.url ? verified.url : '';
        } catch (webhookError) {
          console.log('Webhook self-repair failed:', webhookError);
          currentWebhookUrl = '';
        }
      }
      if (currentWebhookUrl !== desiredWebhookUrl) {
        console.log('Order blocked: webhook could not be pointed to this site.');
        return respond(503, {
          ok: false,
          error: 'وب‌هوک ربات سفارش‌ها فعال نیست؛ لطفاً ادمین تنظیمات تلگرام را دوباره ذخیره کند.'
        });
      }
    }

    const items = rawItems.slice(0, 50).map((item, index) => ({
      pid: Number(item.pid) || index + 1,
      name: clean(item.name, 120) || `محصول ${index + 1}`,
      qty: Math.max(1, Math.min(999, Number(item.qty) || 1)),
      price: Math.max(0, Number(item.price) || 0),
      icon: clean(item.icon, 80)
    }));
    const calculatedTotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const order = {
      id: orderId,
      name: clean(payload.name, 80) || '—',
      phone: clean(payload.phone, 30) || '—',
      telegramId: `@${telegramUsername}`,
      email: clean(payload.email, 120),
      note: clean(payload.note, 600),
      items,
      total: calculatedTotal,
      date: clean(payload.date, 50) || new Date().toISOString(),
      status: 'awaiting_payment',
      uploadedReceipt: null,
      pendingReceiptChatId: null,
      createdAt: new Date().toISOString()
    };

    const orders = await loadOrders();
    const existing = orders.find(item => item.id === order.id);
    const telegramUrl = deepLink(configuredBotUsername, order.id);
    if (existing) {
      return respond(200, { ok: true, orderId: order.id, telegramUrl, adminNotified: true });
    }

    const itemLines = order.items
      .map(item => `▫️ ${escapeHtml(item.name)} × ${toPersian(item.qty)}: <b>${fmtPrice(item.price * item.qty)} ت</b>`)
      .join('\n');
    const adminMessage = `🛒 <b>سفارش جدید</b>\n` +
      `━━━━━━━━━━━━━━\n` +
      `📦 فاکتور: <code>${escapeHtml(order.id)}</code>\n` +
      `👤 نام: ${escapeHtml(order.name)}\n` +
      `📱 شماره: <code>${escapeHtml(order.phone)}</code>\n` +
      `✈️ آیدی تلگرام: <b>@${escapeHtml(telegramUsername)}</b>\n` +
      (order.email ? `📧 ایمیل: ${escapeHtml(order.email)}\n` : '') +
      `━━━━━━━━━━━━━━\n` +
      `<b>اقلام:</b>\n${itemLines}\n` +
      `━━━━━━━━━━━━━━\n` +
      `💰 <b>جمع کل: ${fmtPrice(order.total)} تومان</b>` +
      (order.note ? `\n📝 یادداشت: ${escapeHtml(order.note)}` : '');

    // Deliver the invoice to the exact bot/chat configured by the admin before
    // reporting success to the storefront.
    await telegramApi(telegram.botToken, 'sendMessage', {
      chat_id: telegram.chatId,
      text: adminMessage,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📋 مشاهده سفارش', callback_data: `view:${order.id}` }],
          [{ text: '💬 ارتباط با مشتری', url: `https://t.me/${telegramUsername}` }]
        ]
      }
    });

    orders.push(order);
    await saveOrders(orders);

    return respond(200, {
      ok: true,
      orderId: order.id,
      telegramUrl,
      adminNotified: true
    });
  } catch (error) {
    console.log('Create order error:', error);
    return respond(502, {
      ok: false,
      error: 'ارسال فاکتور به ربات انجام نشد. لطفاً دوباره تلاش کنید.'
    });
  }
};
