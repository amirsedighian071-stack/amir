// Netlify Function: create a persistent order and return a Telegram deep link.
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

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    const order = JSON.parse(event.body || '{}');
    if (!order.id || !order.name || !order.phone || !Array.isArray(order.items) || !order.items.length) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing fields' }) };
    }

    order.status = 'awaiting_payment';
    order.uploadedReceipt = null;
    order.pendingReceiptChatId = null;
    order.createdAt = new Date().toISOString();

    const orders = await loadOrders();
    orders.push(order);
    await saveOrders(orders);

    const telegram = await getTelegramConfig();
    let adminNotified = false;

    if (telegram.botToken && telegram.chatId) {
      try {
        const items = order.items
          .map((item) => `▫️ ${item.name} × ${toPersian(item.qty)}: <b>${fmtPrice(item.price * item.qty)} ت</b>`)
          .join('\n');
        const adminMessage = `🛒 <b>سفارش جدید</b>\n` +
          `━━━━━━━━━━━━━━\n` +
          `📦 فاکتور: <code>${order.id}</code>\n` +
          `👤 نام: ${order.name}\n` +
          `📱 شماره: <code>${order.phone}</code>\n` +
          (order.email ? `📧 ایمیل: ${order.email}\n` : '') +
          `━━━━━━━━━━━━━━\n` +
          `<b>اقلام:</b>\n${items}\n` +
          `━━━━━━━━━━━━━━\n` +
          `💰 <b>جمع کل: ${fmtPrice(order.total)} تومان</b>` +
          (order.note ? `\n📝 یادداشت: ${order.note}` : '');

        await telegramApi(telegram.botToken, 'sendMessage', {
          chat_id: telegram.chatId,
          text: adminMessage,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [[{ text: '📋 مشاهده سفارش', callback_data: `view:${order.id}` }]]
          }
        });
        adminNotified = true;
      } catch (error) {
        // The order is already persisted. The customer can still use the bot link.
        console.log('Admin notify error:', error.message);
      }
    }

    // Telegram only allows a limited, URL-safe start parameter. Keeping the
    // payload to the order ID makes the deep link reliable for all names.
    let telegramUrl = null;
    if (telegram.botUsername) {
      const param = Buffer.from(JSON.stringify({ oid: order.id }))
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
      telegramUrl = `https://t.me/${telegram.botUsername}?start=${param}`;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, orderId: order.id, telegramUrl, adminNotified })
    };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
