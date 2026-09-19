// Netlify Function: Telegram Bot Webhook
// Handles /start with order ID, receipt upload, admin approval
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const ORDERS_FILE = path.join('/tmp', 'orders.json');

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const PAYMENT_CARD = process.env.PAYMENT_CARD || 'شماره کارت در تنظیمات وارد نشده';
const PAYMENT_CARD_HOLDER = process.env.PAYMENT_CARD_HOLDER || 'نام صاحب کارت در تنظیمات وارد نشده';

function loadOrders() { try { return JSON.parse(fs.readFileSync(ORDERS_FILE,'utf8')); } catch(e){ return []; } }
function saveOrders(o) { fs.writeFileSync(ORDERS_FILE, JSON.stringify(o, null, 2)); }
function findOrder(oid) { return loadOrders().find(o => o.id === oid); }
function updateOrder(oid, patch) {
  const orders = loadOrders();
  const idx = orders.findIndex(o => o.id === oid);
  if (idx >= 0) { orders[idx] = {...orders[idx], ...patch}; saveOrders(orders); return orders[idx]; }
  return null;
}
function toPersian(n) { const p=['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹']; return String(n).replace(/\d/g,d=>p[d]); }
function fmtPrice(n) { return toPersian(Number(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g,',')); }
function base64Decode(s) { return Buffer.from(s.replace(/-/g,'+').replace(/_/g,'/'), 'base64').toString('utf8'); }

async function tgApi(method, body) {
  const resp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(body)
  });
  return resp.json();
}

function sendMessage(chat_id, text, extra={}) {
  return tgApi('sendMessage', { chat_id, text, parse_mode:'HTML', ...extra });
}

// Build invoice text for customer
function invoiceText(order) {
  const items = order.items.map(i => `▫️ ${i.name} × ${toPersian(i.qty)}: <b>${fmtPrice(i.price*i.qty)} ت</b>`).join('\n');
  return `👋 سلام ${order.name} عزیز\n` +
    `سفارش شما با موفقیت ثبت شد! 🎉\n\n` +
    `📦 <b>شماره فاکتور:</b> <code>${order.id}</code>\n` +
    `━━━━━━━━━━━━━━\n` +
    `<b>اقلام سفارش:</b>\n${items}\n` +
    `━━━━━━━━━━━━━━\n` +
    `💰 <b>مبلغ قابل پرداخت: ${fmtPrice(order.total)} تومان</b>\n\n` +
    `💳 <b>اطلاعات کارت جهت واریز:</b>\n` +
    `<code>${PAYMENT_CARD}</code>\n` +
    `به نام: <b>${PAYMENT_CARD_HOLDER}</b>\n\n` +
    `✅ پس از واریز، لطفاً عکس فیش پرداختی را همینجا ارسال کنید.\n` +
    `تا بررسی شده و سرویس شما فعال گردد.`;
}

function kbMain(order) {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: '📸 ارسال فیش پرداخت', callback_data: `upload:${order.id}` }],
        [{ text: '❓ پیگیری سفارش', callback_data: `status:${order.id}` }]
      ]
    }
  };
}

function adminView(oid) {
  const order = findOrder(oid); if (!order) return;
  const items = order.items.map(i => `▫️ ${i.name} × ${toPersian(i.qty)}: <b>${fmtPrice(i.price*i.qty)} ت</b>`).join('\n');
  const statusText = {
    awaiting_payment: '⏳ در انتظار پرداخت',
    receipt_uploaded: '📸 فیش ارسال شده',
    approved: '✅ تایید شده',
    rejected: '❌ رد شده'
  }[order.status] || order.status;
  let text = `📋 <b>سفارش ${order.id}</b>\n` +
    `وضعیت: ${statusText}\n\n` +
    `👤 ${order.name}\n📱 <code>${order.phone}</code>\n` +
    (order.email ? `📧 ${order.email}\n` : '') +
    `━━━━━━━━━━━━━━\n${items}\n` +
    `━━━━━━━━━━━━━━\n💰 <b>${fmtPrice(order.total)} تومان</b>`;
  let keyboard = [];
  if (order.status === 'receipt_uploaded' && order.uploadedReceipt) {
    keyboard.push([
      { text: '✅ تایید پرداخت', callback_data: `approve:${order.id}` },
      { text: '❌ رد پرداخت', callback_data: `reject:${order.id}` }
    ]);
  }
  keyboard.push([{ text: '💬 تماس با مشتری', url: `https://t.me/${String(order.phone).replace(/^0/,'')}` }]);
  return { text, reply_markup: { inline_keyboard: keyboard } };
}

// Pending receipt state per chat
const pendingUpload = {}; // { chatId: orderId }

exports.handler = async (event) => {
  if (!BOT_TOKEN) return { statusCode: 500, body: 'BOT_TOKEN not set' };
  try {
    const body = JSON.parse(event.body || '{}');
    // Handle callback_query
    if (body.callback_query) {
      const cb = body.callback_query;
      const [action, oid] = cb.data.split(':');
      const chatId = cb.from.id;
      const msgId = cb.message.message_id;
      await tgApi('answerCallbackQuery', { callback_query_id: cb.id });

      if (action === 'upload') {
        pendingUpload[chatId] = oid;
        await sendMessage(chatId, '📸 لطفاً عکس/رسید پرداخت را به صورت عکس در این چت ارسال کنید.');
      } else if (action === 'status') {
        const order = findOrder(oid);
        if (order) {
          const statusText = {awaiting_payment:'⏳ در انتظار پرداخت',receipt_uploaded:'📸 فیش دریافت شده، در حال بررسی',approved:'✅ تایید شده - سرویس فعال شد',rejected:'❌ پرداخت تایید نشد'}[order.status]||order.status;
          await sendMessage(chatId, `📋 وضعیت سفارش <code>${oid}</code>: ${statusText}`);
        }
      } else if (action === 'approve' && String(chatId) === String(ADMIN_CHAT_ID)) {
        const order = updateOrder(oid, { status:'approved', approvedAt: new Date().toISOString() });
        if (order) {
          await sendMessage(chatId, `✅ سفارش <code>${oid}</code> تایید شد.`);
          // Notify customer
          await sendMessage(order.customerChatId, `🎉 <b>پرداخت شما تایید شد!</b>\nسرویس شما به زودی فعال می‌گردد.\nشماره پیگیری: <code>${order.id}</code>`);
          // Update admin message
          const updated = adminView(oid);
          await tgApi('editMessageText', { chat_id: chatId, message_id: msgId, text: updated.text, parse_mode:'HTML', reply_markup: updated.reply_markup });
        }
      } else if (action === 'reject' && String(chatId) === String(ADMIN_CHAT_ID)) {
        const order = updateOrder(oid, { status:'rejected', rejectedAt: new Date().toISOString() });
        if (order) {
          await sendMessage(chatId, `❌ سفارش <code>${oid}</code> رد شد.`);
          await sendMessage(order.customerChatId, `⚠️ متاسفانه پرداخت شما تایید نشد.\nلطفاً از طریق پشتیبانی پیگیری نمایید.`);
          const updated = adminView(oid);
          await tgApi('editMessageText', { chat_id: chatId, message_id: msgId, text: updated.text, parse_mode:'HTML', reply_markup: updated.reply_markup });
        }
      } else if (action === 'view' && String(chatId) === String(ADMIN_CHAT_ID)) {
        const av = adminView(oid);
        if (av) {
          if (order && order.uploadedReceipt) {
            await tgApi('sendPhoto', { chat_id: chatId, photo: order.uploadedReceipt, caption: av.text, parse_mode:'HTML', reply_markup: av.reply_markup });
          } else {
            await sendMessage(chatId, av.text, av);
          }
        }
      }
      return { statusCode: 200, body: 'ok' };
    }

    // Handle message
    const msg = body.message; if (!msg) return { statusCode:200, body:'ok' };
    const chatId = msg.chat.id;
    const text = msg.text || '';

    // /start command
    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      if (parts.length > 1 && parts[1].length > 5) {
        try {
          const data = JSON.parse(base64Decode(parts[1]));
          const order = findOrder(data.oid);
          if (order) {
            // Associate this telegram chat with the order
            updateOrder(order.id, { customerChatId: chatId, customerUsername: msg.chat.username || '' });
            await sendMessage(chatId, invoiceText(order), kbMain(order));
            return { statusCode: 200, body: 'ok' };
          }
        } catch(e) { console.log('start parse error:', e); }
      }
      // Default welcome
      await sendMessage(chatId, '👋 به ربات پشتیبانی امیر صدیقیان خوش آمدید.\nثبت سفارش از طریق وب‌سایت انجام می‌شود. 🌐');
      return { statusCode:200, body:'ok' };
    }

    // Photo = receipt upload
    if (msg.photo) {
      const oid = pendingUpload[chatId];
      if (!oid) {
        await sendMessage(chatId, 'برای ارسال فیش، ابتدا از طریق سایت سفارش خود را ثبت کنید یا از دکمه «ارسال فیش پرداخت» استفاده کنید.');
        return { statusCode:200, body:'ok' };
      }
      const photo = msg.photo[msg.photo.length-1]; // highest resolution
      const fileId = photo.file_id;
      const order = updateOrder(oid, {
        status:'receipt_uploaded',
        uploadedReceipt: fileId,
        customerChatId: chatId,
        receiptAt: new Date().toISOString()
      });
      if (order) {
        delete pendingUpload[chatId];
        await sendMessage(chatId, '✅ فیش شما دریافت شد.\nپس از بررسی، نتیجه از طریق همین ربات به شما اعلام خواهد شد.');
        // Forward to admin
        if (ADMIN_CHAT_ID) {
          const av = adminView(oid);
          await tgApi('sendPhoto', {
            chat_id: ADMIN_CHAT_ID,
            photo: fileId,
            caption: `📸 فیش پرداخت جدید برای ${oid}\n👤 ${order.name} | 📱 ${order.phone}`,
            parse_mode: 'HTML',
            reply_markup: av.reply_markup
          });
        }
      }
      return { statusCode:200, body:'ok' };
    }

    // Default response
    await sendMessage(chatId, 'لطفاً از طریق دکمه‌های راهنما استفاده کنید و یا عکس فیش پرداخت را ارسال نمایید.');
    return { statusCode:200, body:'ok' };
  } catch(err) {
    console.log('Bot error:', err);
    return { statusCode:500, body:err.message };
  }
};
