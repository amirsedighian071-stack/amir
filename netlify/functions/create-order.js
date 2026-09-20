// Netlify Function: persist an order, notify the admin bot and return its deep link.
const fetch = require('node-fetch');
const { getTelegramConfig } = require('./lib/telegram-config');
const { loadOrders, saveOrders } = require('./lib/orders');

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
    const orderId = clean(payload.id, 80);
    const telegramUsername = normaliseTelegramUsername(payload.telegramId);
    const rawItems = Array.isArray(payload.items) ? payload.items : [];

    if (!/^ORD-[A-Z0-9]{4,36}$/.test(orderId) || !clean(payload.name, 80) || !clean(payload.phone, 30) || !rawItems.length) {
      return respond(400, { ok: false, error: 'اطلاعات ضروری سفارش کامل نیست.' });
    }
    if (!telegramUsernameIsValid(telegramUsername)) {
      return respond(400, { ok: false, error: 'آیدی تلگرام واردشده معتبر نیست.' });
    }

    // This is the private bot configuration created by the admin panel. The
    // browser-supplied payload can never choose a different Telegram account.
    const telegram = await getTelegramConfig();
    if (!telegram.botToken || !telegram.chatId) {
      return respond(503, {
        ok: false,
        error: 'ربات سفارش‌ها هنوز توسط ادمین فعال و وب‌هوک نشده است.'
      });
    }

    // Re-check Telegram at order time. This makes the validated token—not a
    // stored/manual username—the only source for the customer destination and
    // also prevents checkout when that bot no longer points to this webhook.
    const [botInfo, webhookInfo] = await Promise.all([
      telegramApi(telegram.botToken, 'getMe', {}),
      telegramApi(telegram.botToken, 'getWebhookInfo', {})
    ]);
    const configuredBotUsername = normaliseTelegramUsername(botInfo && botInfo.username);
    let registeredWebhook = null;
    try {
      registeredWebhook = new URL(webhookInfo && webhookInfo.url ? webhookInfo.url : '');
    } catch (error) {
      registeredWebhook = null;
    }
    const incomingHeaders = event.headers || {};
    const requestHost = String(incomingHeaders['x-forwarded-host'] || incomingHeaders.host || '').split(',')[0].trim();
    const isLocalRequest = /^(localhost|127\.0\.0\.1)(:|$)/i.test(requestHost);
    const webhookMatchesSite = Boolean(
      registeredWebhook &&
      registeredWebhook.pathname === '/.netlify/functions/telegram-bot' &&
      (!requestHost || isLocalRequest || registeredWebhook.host === requestHost)
    );
    if (!telegramUsernameIsValid(configuredBotUsername) || !webhookMatchesSite) {
      return respond(503, {
        ok: false,
        error: 'وب‌هوک ربات سفارش‌ها فعال نیست؛ لطفاً ادمین تنظیمات تلگرام را دوباره ذخیره کند.'
      });
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
      name: clean(payload.name, 80),
      phone: clean(payload.phone, 30),
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
