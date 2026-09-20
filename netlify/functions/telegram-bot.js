// Netlify Function: Telegram bot webhook.
// Handles order deep links, receipt uploads and admin payment approval.
const fetch = require('node-fetch');
const { getTelegramConfig } = require('./lib/telegram-config');
const {
  findOrder,
  findPendingReceiptOrder,
  updateOrder
} = require('./lib/orders');

function toPersian(n) {
  const p = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  return String(n).replace(/\d/g, (d) => p[d]);
}
function fmtPrice(n) {
  return toPersian(Number(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));
}
function base64Decode(value) {
  return Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}

async function telegramApi(config, method, body) {
  const response = await fetch(`https://api.telegram.org/bot${config.botToken}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const payload = await response.json();
  if (!response.ok || !payload.ok) {
    throw new Error(payload.description || `Telegram ${method} failed`);
  }
  return payload.result;
}

function sendMessage(config, chatId, text, extra = {}) {
  return telegramApi(config, 'sendMessage', { chat_id: chatId, text, parse_mode: 'HTML', ...extra });
}

function invoiceText(order, config) {
  const items = order.items
    .map((item) => `▫️ ${item.name} × ${toPersian(item.qty)}: <b>${fmtPrice(item.price * item.qty)} ت</b>`)
    .join('\n');
  const cardNumber = config.cardNumber || 'شماره کارت در تنظیمات وارد نشده';
  const cardHolder = config.cardHolder || 'نام صاحب کارت در تنظیمات وارد نشده';

  return `👋 سلام ${order.name} عزیز\n` +
    `سفارش شما با موفقیت ثبت شد! 🎉\n\n` +
    `📦 <b>شماره فاکتور:</b> <code>${order.id}</code>\n` +
    `━━━━━━━━━━━━━━\n` +
    `<b>اقلام سفارش:</b>\n${items}\n` +
    `━━━━━━━━━━━━━━\n` +
    `💰 <b>مبلغ قابل پرداخت: ${fmtPrice(order.total)} تومان</b>\n\n` +
    `💳 <b>اطلاعات کارت جهت واریز:</b>\n` +
    `<code>${cardNumber}</code>\n` +
    `به نام: <b>${cardHolder}</b>\n\n` +
    `✅ پس از واریز، لطفاً عکس فیش پرداختی را همینجا ارسال کنید.\n` +
    `تا بررسی شده و سرویس شما فعال گردد.`;
}

function mainKeyboard(order) {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: '📸 ارسال فیش پرداخت', callback_data: `upload:${order.id}` }],
        [{ text: '❓ پیگیری سفارش', callback_data: `status:${order.id}` }]
      ]
    }
  };
}

async function adminView(orderId) {
  const order = await findOrder(orderId);
  if (!order) return null;

  const items = order.items
    .map((item) => `▫️ ${item.name} × ${toPersian(item.qty)}: <b>${fmtPrice(item.price * item.qty)} ت</b>`)
    .join('\n');
  const statusText = {
    awaiting_payment: '⏳ در انتظار پرداخت',
    receipt_uploaded: '📸 فیش ارسال شده',
    approved: '✅ تایید شده',
    rejected: '❌ رد شده'
  }[order.status] || order.status;

  const text = `📋 <b>سفارش ${order.id}</b>\n` +
    `وضعیت: ${statusText}\n\n` +
    `👤 ${order.name}\n📱 <code>${order.phone}</code>\n` +
    (order.email ? `📧 ${order.email}\n` : '') +
    `━━━━━━━━━━━━━━\n${items}\n` +
    `━━━━━━━━━━━━━━\n💰 <b>${fmtPrice(order.total)} تومان</b>`;
  const keyboard = [];
  if (order.status === 'receipt_uploaded' && order.uploadedReceipt) {
    keyboard.push([
      { text: '✅ تایید پرداخت', callback_data: `approve:${order.id}` },
      { text: '❌ رد پرداخت', callback_data: `reject:${order.id}` }
    ]);
  }
  keyboard.push([{ text: '💬 تماس با مشتری', url: `https://t.me/${String(order.phone).replace(/^0/, '')}` }]);
  return { order, text, reply_markup: { inline_keyboard: keyboard } };
}

exports.handler = async (event) => {
  const config = await getTelegramConfig();
  if (!config.botToken) return { statusCode: 500, body: 'BOT_TOKEN not set' };

  try {
    const body = JSON.parse(event.body || '{}');

    if (body.callback_query) {
      const callback = body.callback_query;
      const [action, orderId] = String(callback.data || '').split(':');
      const chatId = callback.from.id;
      const messageId = callback.message && callback.message.message_id;
      await telegramApi(config, 'answerCallbackQuery', { callback_query_id: callback.id });

      if (action === 'upload') {
        const order = await findOrder(orderId);
        if (order) {
          await updateOrder(orderId, {
            pendingReceiptChatId: chatId,
            pendingReceiptAt: new Date().toISOString()
          });
          await sendMessage(config, chatId, '📸 لطفاً عکس/رسید پرداخت را به صورت عکس در این چت ارسال کنید.');
        }
      } else if (action === 'status') {
        const order = await findOrder(orderId);
        if (order) {
          const statusText = {
            awaiting_payment: '⏳ در انتظار پرداخت',
            receipt_uploaded: '📸 فیش دریافت شده، در حال بررسی',
            approved: '✅ تایید شده - سرویس فعال شد',
            rejected: '❌ پرداخت تایید نشد'
          }[order.status] || order.status;
          await sendMessage(config, chatId, `📋 وضعیت سفارش <code>${orderId}</code>: ${statusText}`);
        }
      } else if (action === 'approve' && String(chatId) === String(config.chatId)) {
        const order = await updateOrder(orderId, { status: 'approved', approvedAt: new Date().toISOString() });
        if (order) {
          await sendMessage(config, chatId, `✅ سفارش <code>${orderId}</code> تایید شد.`);
          if (order.customerChatId) {
            await sendMessage(config, order.customerChatId, `🎉 <b>پرداخت شما تایید شد!</b>\nسرویس شما به زودی فعال می‌گردد.\nشماره پیگیری: <code>${order.id}</code>`);
          }
          const updated = await adminView(orderId);
          if (updated && messageId) {
            await telegramApi(config, 'editMessageText', {
              chat_id: chatId,
              message_id: messageId,
              text: updated.text,
              parse_mode: 'HTML',
              reply_markup: updated.reply_markup
            });
          }
        }
      } else if (action === 'reject' && String(chatId) === String(config.chatId)) {
        const order = await updateOrder(orderId, { status: 'rejected', rejectedAt: new Date().toISOString() });
        if (order) {
          await sendMessage(config, chatId, `❌ سفارش <code>${orderId}</code> رد شد.`);
          if (order.customerChatId) {
            await sendMessage(config, order.customerChatId, '⚠️ متاسفانه پرداخت شما تایید نشد.\nلطفاً از طریق پشتیبانی پیگیری نمایید.');
          }
          const updated = await adminView(orderId);
          if (updated && messageId) {
            await telegramApi(config, 'editMessageText', {
              chat_id: chatId,
              message_id: messageId,
              text: updated.text,
              parse_mode: 'HTML',
              reply_markup: updated.reply_markup
            });
          }
        }
      } else if (action === 'view' && String(chatId) === String(config.chatId)) {
        const view = await adminView(orderId);
        if (view) {
          if (view.order.uploadedReceipt) {
            await telegramApi(config, 'sendPhoto', {
              chat_id: chatId,
              photo: view.order.uploadedReceipt,
              caption: view.text,
              parse_mode: 'HTML',
              reply_markup: view.reply_markup
            });
          } else {
            await sendMessage(config, chatId, view.text, { reply_markup: view.reply_markup });
          }
        }
      }
      return { statusCode: 200, body: 'ok' };
    }

    const message = body.message;
    if (!message) return { statusCode: 200, body: 'ok' };

    const chatId = message.chat.id;
    const text = message.text || '';
    if (text.startsWith('/start')) {
      const parts = text.split(/\s+/, 2);
      if (parts[1] && parts[1].length > 5) {
        try {
          const data = JSON.parse(base64Decode(parts[1]));
          const order = await findOrder(data.oid);
          if (order) {
            const updatedOrder = await updateOrder(order.id, {
              customerChatId: chatId,
              customerUsername: message.chat.username || ''
            });
            await sendMessage(config, chatId, invoiceText(updatedOrder, config), mainKeyboard(updatedOrder));
            return { statusCode: 200, body: 'ok' };
          }
        } catch (error) {
          console.log('start parse error:', error.message);
        }
      }
      await sendMessage(config, chatId, '👋 به ربات پشتیبانی امیر صدیقیان خوش آمدید.\nثبت سفارش از طریق وب‌سایت انجام می‌شود. 🌐');
      return { statusCode: 200, body: 'ok' };
    }

    if (message.photo) {
      const pendingOrder = await findPendingReceiptOrder(chatId);
      if (!pendingOrder) {
        await sendMessage(config, chatId, 'برای ارسال فیش، ابتدا از طریق سایت سفارش خود را ثبت کنید یا از دکمه «ارسال فیش پرداخت» استفاده کنید.');
        return { statusCode: 200, body: 'ok' };
      }

      const receipt = message.photo[message.photo.length - 1];
      const order = await updateOrder(pendingOrder.id, {
        status: 'receipt_uploaded',
        uploadedReceipt: receipt.file_id,
        customerChatId: chatId,
        pendingReceiptChatId: null,
        receiptAt: new Date().toISOString()
      });
      await sendMessage(config, chatId, '✅ فیش شما دریافت شد.\nپس از بررسی، نتیجه از طریق همین ربات به شما اعلام خواهد شد.');

      if (order && config.chatId) {
        const view = await adminView(order.id);
        if (view) {
          await telegramApi(config, 'sendPhoto', {
            chat_id: config.chatId,
            photo: receipt.file_id,
            caption: `📸 فیش پرداخت جدید برای ${order.id}\n👤 ${order.name} | 📱 ${order.phone}`,
            parse_mode: 'HTML',
            reply_markup: view.reply_markup
          });
        }
      }
      return { statusCode: 200, body: 'ok' };
    }

    await sendMessage(config, chatId, 'لطفاً از طریق دکمه‌های راهنما استفاده کنید و یا عکس فیش پرداخت را ارسال نمایید.');
    return { statusCode: 200, body: 'ok' };
  } catch (error) {
    console.log('Bot error:', error);
    return { statusCode: 500, body: error.message };
  }
};
