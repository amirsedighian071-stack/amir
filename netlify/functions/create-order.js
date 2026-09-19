// Netlify Function: Create order and return Telegram bot deep link
const fs = require('fs');
const path = require('path');
const ORDERS_FILE = path.join('/tmp', 'orders.json');

function loadOrders() {
  try { return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8')); } catch(e) { return []; }
}
function saveOrders(orders) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

function toPersian(n) {
  const p = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  return String(n).replace(/\d/g, d => p[d]);
}
function fmtPrice(n) {
  return toPersian(Number(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g,','));
}

exports.handler = async (event, context) => {
  // CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({error:'Method not allowed'}) };

  try {
    const order = JSON.parse(event.body || '{}');
    if (!order.id || !order.name || !order.phone) {
      return { statusCode: 400, headers, body: JSON.stringify({error:'Missing fields'}) };
    }
    order.status = 'awaiting_payment';
    order.uploadedReceipt = null;
    order.createdAt = new Date().toISOString();

    const orders = loadOrders();
    orders.push(order);
    saveOrders(orders);

    // Notify admin
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
    const BOT_USERNAME = process.env.BOT_USERNAME || '';

    if (BOT_TOKEN && ADMIN_CHAT_ID) {
      try {
        const items = order.items.map(i => `▫️ ${i.name} × ${toPersian(i.qty)}: <b>${fmtPrice(i.price*i.qty)} ت</b>`).join('\n');
        const adminMsg = `🛒 <b>سفارش جدید</b>\n` +
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

        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({
            chat_id: ADMIN_CHAT_ID,
            text: adminMsg,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [[
                { text: '📋 مشاهده سفارش', callback_data: `view:${order.id}` }
              ]]
            }
          })
        });
      } catch(e) { console.log('Admin notify error:', e.message); }
    }

    // Return Telegram deep link so user is redirected to the bot with order ID
    let telegramUrl = null;
    if (BOT_USERNAME) {
      const param = Buffer.from(JSON.stringify({ oid: order.id, n: order.name })).toString('base64').replace(/=/g, '');
      telegramUrl = `https://t.me/${BOT_USERNAME}?start=${param}`;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, orderId: order.id, telegramUrl })
    };
  } catch(err) {
    return { statusCode: 500, headers, body: JSON.stringify({error:err.message}) };
  }
};
