// Netlify Function: Telegram bot webhook.
// Handles order deep links, receipt uploads, admin payment approval, the main
// menu (support / website / my orders) and the customer<->admin support relay.
const fetch = require('node-fetch');
const { getTelegramConfig } = require('./lib/telegram-config');
const {
  findOrder,
  findPendingReceiptOrder,
  loadOrders,
  updateOrder
} = require('./lib/orders');
const {
  addPendingAdminReply,
  findPendingAdminReply,
  recentSupportSessions,
  touchSession
} = require('./lib/support');

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
function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function normaliseTelegramUsername(value) {
  const username = String(value || '').trim().replace(/^@+/, '');
  return /^[A-Za-z][A-Za-z0-9_]{4,31}$/.test(username) ? username : '';
}
function orderStatusText(status) {
  return {
    awaiting_payment: '⏳ در انتظار پرداخت',
    receipt_uploaded: '📸 فیش ارسال شده',
    approved: '✅ تایید شده',
    rejected: '❌ رد شده'
  }[status] || String(status || 'نامشخص');
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

// HTML-formatted messages (bot-authored content only).
function sendMessage(config, chatId, text, extra = {}) {
  return telegramApi(config, 'sendMessage', { chat_id: chatId, text, parse_mode: 'HTML', ...extra });
}
// Plain messages, used when relaying the admin's own words to a customer
// (no HTML parsing, so arbitrary text can never break the delivery).
function sendPlainMessage(config, chatId, text) {
  return telegramApi(config, 'sendMessage', { chat_id: chatId, text });
}

function invoiceText(order, config) {
  const items = order.items
    .map((item) => `▫️ ${escapeHtml(item.name)} × ${toPersian(item.qty)}: <b>${fmtPrice(item.price * item.qty)} ت</b>`)
    .join('\n');
  const cardNumber = escapeHtml(config.cardNumber || 'شماره کارت در تنظیمات وارد نشده');
  const cardHolder = escapeHtml(config.cardHolder || 'نام صاحب کارت در تنظیمات وارد نشده');

  return `👋 سلام ${escapeHtml(order.name)} عزیز\n` +
    `سفارش شما با موفقیت ثبت شد! 🎉\n\n` +
    `📦 <b>شماره فاکتور:</b> <code>${escapeHtml(order.id)}</code>\n` +
    `✈️ <b>آیدی ارتباطی:</b> ${escapeHtml(order.telegramId || '—')}\n` +
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
    .map((item) => `▫️ ${escapeHtml(item.name)} × ${toPersian(item.qty)}: <b>${fmtPrice(item.price * item.qty)} ت</b>`)
    .join('\n');
  const statusText = orderStatusText(order.status);

  const contactUsername = normaliseTelegramUsername(order.customerUsername || order.telegramId);
  const text = `📋 <b>سفارش ${escapeHtml(order.id)}</b>\n` +
    `وضعیت: ${statusText}\n\n` +
    `👤 ${escapeHtml(order.name)}\n📱 <code>${escapeHtml(order.phone)}</code>\n` +
    `✈️ ${escapeHtml(order.telegramId || 'آیدی ثبت نشده')}\n` +
    (order.email ? `📧 ${escapeHtml(order.email)}\n` : '') +
    `━━━━━━━━━━━━━━\n${items}\n` +
    `━━━━━━━━━━━━━━\n💰 <b>${fmtPrice(order.total)} تومان</b>`;
  const keyboard = [];
  if (order.status === 'receipt_uploaded' && order.uploadedReceipt) {
    keyboard.push([
      { text: '✅ تایید پرداخت', callback_data: `approve:${order.id}` },
      { text: '❌ رد پرداخت', callback_data: `reject:${order.id}` }
    ]);
  }
  if (contactUsername) {
    keyboard.push([{ text: '💬 تماس با مشتری', url: `https://t.me/${contactUsername}` }]);
  }
  return { order, text, reply_markup: { inline_keyboard: keyboard } };
}

// ---------------------------------------------------------------------------
// Main menu (shown on /start): support, website, my orders
// ---------------------------------------------------------------------------

// The public URL of this site: the value saved from the admin panel wins;
// otherwise it is derived from the host the webhook arrived on (Telegram
// calls https://<site>/.netlify/functions/telegram-bot, so the host header is
// exactly the site's public domain).
function resolveSiteUrl(config, event) {
  const stored = String(config.siteUrl || '').trim();
  if (stored) {
    return /^[a-z][a-z0-9+.-]*:\/\//i.test(stored)
      ? stored
      : `https://${stored.replace(/^\/+/, '')}`;
  }
  const headers = event.headers || {};
  const hostHeader = headers['x-forwarded-host'] || headers.host || '';
  const host = String(hostHeader).split(',')[0].trim();
  if (!host || /^(localhost|127\.0\.0\.1)(:|$)/i.test(host)) return '';
  const protocol = String(headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  return `${protocol}://${host}`;
}

function mainMenuMarkup(siteUrl) {
  const rows = [[{ text: '🆘 ارتباط با پشتیبانی', callback_data: 'support:start' }]];
  if (siteUrl) rows.push([{ text: '🌐 وبسایت', url: siteUrl }]);
  rows.push([{ text: '📦 سفارش‌های من', callback_data: 'orders:mine' }]);
  return { reply_markup: { inline_keyboard: rows } };
}

// The customer's own orders: matched by the chat that opened the order deep
// link (customerChatId) or by the Telegram username recorded on the order.
async function handleMyOrders(config, event, chatId, from) {
  const orders = await loadOrders();
  const username = String(from && from.username || '').replace(/^@+/, '').toLowerCase();
  const mine = orders.filter((order) => {
    if (String(order.customerChatId) === String(chatId)) return true;
    if (!username) return false;
    const a = String(order.customerUsername || '').replace(/^@+/, '').toLowerCase();
    const b = String(order.telegramId || '').replace(/^@+/, '').toLowerCase();
    return a === username || b === username;
  });
  mine.sort((a, b) => String(b.createdAt || b.date || '').localeCompare(String(a.createdAt || a.date || '')));

  const siteUrl = resolveSiteUrl(config, event);
  if (!mine.length) {
    const keyboard = siteUrl
      ? { reply_markup: { inline_keyboard: [[{ text: '🌐 مشاهده وبسایت', url: siteUrl }]] } }
      : {};
    await sendMessage(
      config,
      chatId,
      '📦 هنوز سفارشی ثبت نکرده‌اید.\nبرای خرید، به وبسایت سر بزنید:',
      keyboard
    );
    return;
  }

  const lines = mine.slice(0, 10).map((order) => {
    const items = (order.items || [])
      .slice(0, 3)
      .map((item) => `${escapeHtml(item.name)} × ${toPersian(item.qty)}`)
      .join('، ');
    const more = (order.items || []).length > 3 ? ' و …' : '';
    return `🧾 <code>${escapeHtml(order.id)}</code> — ${orderStatusText(order.status)}\n   ${items}${more} · 💰 <b>${fmtPrice(order.total)} ت</b>`;
  }).join('\n');

  const keyboard = [];
  mine.slice(0, 5).forEach((order) => {
    const row = [];
    if (order.status === 'awaiting_payment') {
      row.push({ text: `📸 فیش ${order.id}`, callback_data: `upload:${order.id}` });
    }
    row.push({ text: `📋 وضعیت ${order.id}`, callback_data: `status:${order.id}` });
    keyboard.push(row);
  });

  await sendMessage(
    config,
    chatId,
    `📦 <b>سفارش‌های شما</b> (${toPersian(mine.length)} عدد):\n\n${lines}`,
    { reply_markup: { inline_keyboard: keyboard } }
  );
}

// ---------------------------------------------------------------------------
// Support relay: customer -> admin, admin's reply -> customer
// ---------------------------------------------------------------------------

function supportHeader(from, chatId) {
  const name = [from && from.first_name, from && from.last_name].filter(Boolean).join(' ').trim() || 'کاربر';
  const handle = from && from.username ? `@${from.username}` : `id: ${chatId}`;
  return `🆘 <b>پشتیبانی</b> — ${escapeHtml(name)} (${escapeHtml(handle)})`;
}

// The customer's message reaching the admin is the whole point of the relay,
// so it happens first and unconditionally; the bookkeeping that lets the admin
// answer (reply-mapping) and the session record are best-effort afterwards.
// A direct-contact button is attached so the admin can always reach the
// customer even if the reply-mapping store is unavailable.
async function forwardToAdmin(config, event, chatId, from, content) {
  const header = supportHeader(from, chatId);
  const username = normaliseTelegramUsername(from && from.username);
  const markup = username
    ? { reply_markup: { inline_keyboard: [[{ text: '💬 تماس مستقیم با مشتری', url: `https://t.me/${username}` }]] } }
    : {};
  let adminMsg;
  if (content.kind === 'text') {
    adminMsg = await sendMessage(config, config.chatId, `${header}\n🗨 ${escapeHtml(content.value)}`, markup);
  } else if (content.kind === 'photo') {
    adminMsg = await telegramApi(config, 'sendPhoto', {
      chat_id: config.chatId,
      photo: content.value,
      caption: header + (content.caption ? `\n${content.caption}` : ''),
      ...markup
    });
  } else if (content.kind === 'video') {
    adminMsg = await telegramApi(config, 'sendVideo', {
      chat_id: config.chatId,
      video: content.value,
      caption: header + (content.caption ? `\n${content.caption}` : ''),
      ...markup
    });
  } else if (content.kind === 'document') {
    adminMsg = await telegramApi(config, 'sendDocument', {
      chat_id: config.chatId,
      document: content.value,
      caption: header + (content.caption ? `\n${content.caption}` : ''),
      ...markup
    });
  } else {
    adminMsg = await sendMessage(config, config.chatId, `${header}\n📎 [محتوای ${content.value}]`, markup);
  }
  const adminMsgId = adminMsg && adminMsg.message_id;
  if (adminMsgId) {
    try {
      await addPendingAdminReply(adminMsgId, chatId);
    } catch (error) {
      // The admin still got the message; answering via reply just won't route
      // until the store is back (the direct-contact button still works).
      console.log('support reply-mapping save failed:', error && error.message);
    }
  }
}

async function deliverToCustomer(config, message, userChatId) {
  if (message.text) {
    await sendPlainMessage(config, userChatId, message.text);
  } else if (message.photo) {
    const photo = message.photo[message.photo.length - 1];
    await telegramApi(config, 'sendPhoto', {
      chat_id: userChatId,
      photo: photo.file_id,
      caption: message.caption || ''
    });
  } else if (message.video) {
    await telegramApi(config, 'sendVideo', {
      chat_id: userChatId,
      video: message.video.file_id,
      caption: message.caption || ''
    });
  } else if (message.document) {
    await telegramApi(config, 'sendDocument', {
      chat_id: userChatId,
      document: message.document.file_id,
      caption: message.caption || ''
    });
  }
}

// The admin replies by answering the message the bot forwarded to them.
async function handleAdminReply(config, message) {
  const replyTo = message.reply_to_message;
  if (!replyTo || replyTo.message_id === undefined) return false;
  const pending = await findPendingAdminReply(replyTo.message_id);
  if (!pending) return false;
  await deliverToCustomer(config, message, pending.userChatId);
  try { await touchSession(pending.userChatId, {}); } catch (error) { /* best effort */ }
  return true;
}

// Admins naturally answer in the same chat without pressing «reply». When
// exactly one customer has been talking to support in the last few minutes,
// route the free message there so the relay never feels dead.
const ADMIN_FREE_ROUTE_WINDOW = 10 * 60 * 1000;
async function handleAdminFreeMessage(config, message) {
  const chatId = message.chat.id;
  let sessions = [];
  try { sessions = await recentSupportSessions(ADMIN_FREE_ROUTE_WINDOW); } catch (error) { return; }
  if (!sessions.length) return; // the admin's own note; nothing to route
  if (sessions.length > 1) {
    await sendMessage(config, chatId, '🤔 چند گفتگوی پشتیبانی هم‌زمان فعال است؛ پاسخ را روی پیام همان مشتری ریپلای کنید تا فقط به او برسد.').catch(() => {});
    return;
  }
  const target = sessions[0];
  const label = target.name || (target.username ? `@${target.username}` : target.chatId);
  try {
    await deliverToCustomer(config, message, target.chatId);
    await sendMessage(config, chatId, `✅ پاسخ شما برای ${escapeHtml(label)} ارسال شد.`).catch(() => {});
  } catch (error) {
    await sendMessage(config, chatId, '⚠️ ارسال پاسخ به مشتری ناموفق بود (احتمالاً ربات را مسدود کرده است).').catch(() => {});
  }
}

// Repairs a webhook registered by an older build (e.g. without callback_query
// in allowed_updates), which would silently kill every inline button such as
// «ارتباط با پشتیبانی». Cheap enough to run on each /start.
async function ensureWebhookHealth(config, event) {
  const siteUrl = resolveSiteUrl(config, event);
  if (!siteUrl) return;
  const desired = `${siteUrl}/.netlify/functions/telegram-bot`;
  try {
    const info = await telegramApi(config, 'getWebhookInfo', {});
    const updates = Array.isArray(info && info.allowed_updates) ? info.allowed_updates : [];
    const complete = !updates.length || (updates.includes('message') && updates.includes('callback_query'));
    if ((info && info.url) === desired && complete) return;
    await telegramApi(config, 'setWebhook', {
      url: desired,
      allowed_updates: ['message', 'callback_query'],
      drop_pending_updates: false
    });
    console.log('Telegram webhook self-healed (url/allowed_updates).');
  } catch (error) {
    console.log('webhook self-heal failed:', error && error.message);
  }
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
          const statusText = orderStatusText(order.status);
          await sendMessage(config, chatId, `📋 وضعیت سفارش <code>${orderId}</code>: ${statusText}`);
        }
      } else if (action === 'support') {
        await sendMessage(
          config,
          chatId,
          '🆘 <b>ارتباط با پشتیبانی</b>\n' +
          'سؤال یا پیام خود را همین‌جا بنویسید و ارسال کنید؛ پیام شما مستقیماً به ادمین ارجاع داده می‌شود و پاسخ ادمین همین‌جا به شما می‌رسد.'
        );
      } else if (action === 'orders') {
        await handleMyOrders(config, event, chatId, callback.from);
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
    const from = message.from || {};
    const text = message.text || '';
    const isAdmin = String(chatId) === String(config.chatId);

    if (text.startsWith('/start')) {
      const parts = text.split(/\s+/, 2);
      if (parts[1] && parts[1].length > 5) {
        try {
          const data = JSON.parse(base64Decode(parts[1]));
          const order = await findOrder(data.oid);
          if (order) {
            const connectedUsername = normaliseTelegramUsername(
              from.username || message.chat.username || ''
            );
            const updatedOrder = await updateOrder(order.id, {
              customerChatId: chatId,
              customerUsername: connectedUsername,
              // Once the customer opens the deep link, Telegram itself becomes
              // the source of truth for the contact username.
              telegramId: connectedUsername ? `@${connectedUsername}` : order.telegramId,
              botConnectedAt: new Date().toISOString()
            });
            await sendMessage(config, chatId, invoiceText(updatedOrder, config), mainKeyboard(updatedOrder));
            if (!order.customerChatId && config.chatId) {
              const contactButton = connectedUsername
                ? { reply_markup: { inline_keyboard: [[{ text: '💬 ارتباط با مشتری', url: `https://t.me/${connectedUsername}` }]] } }
                : {};
              await sendMessage(
                config,
                config.chatId,
                `🔗 مشتری سفارش <code>${escapeHtml(order.id)}</code> به ربات متصل شد.`,
                contactButton
              );
            }
            return { statusCode: 200, body: 'ok' };
          }
        } catch (error) {
          console.log('start parse error:', error.message);
        }
      }
      // Plain /start: welcome + main menu with the three sections.
      const siteUrl = resolveSiteUrl(config, event);
      await ensureWebhookHealth(config, event);
      await sendMessage(
        config,
        chatId,
        '👋 به ربات <b>امیر صدیقیان</b> خوش آمدید!\n' +
        'ثبت سفارش از طریق وب‌سایت انجام می‌شود و بعد از پرداخت، پیگیری از همین ربات انجام می‌گیرد.\n' +
        'برای ادامه یکی از دکمه‌های زیر را انتخاب کنید:',
        mainMenuMarkup(siteUrl)
      );
      return { statusCode: 200, body: 'ok' };
    }

    // Admin chat: relay replies that answer a forwarded customer message;
    // free (non-reply) answers go to the only recent customer session.
    if (isAdmin) {
      const hasContent = Boolean(message.text || message.photo || message.video || message.document);
      if (message.reply_to_message && hasContent) {
        try {
          await handleAdminReply(config, message);
        } catch (error) {
          await sendMessage(config, chatId, '⚠️ ارسال پاسخ به مشتری ناموفق بود (احتمالاً ربات را مسدود کرده است).').catch(() => {});
        }
      } else if (!text.startsWith('/') && hasContent) {
        await handleAdminFreeMessage(config, message);
      }
      return { statusCode: 200, body: 'ok' };
    }

    if (message.photo) {
      const pendingOrder = await findPendingReceiptOrder(chatId);
      if (pendingOrder) {
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
              caption: `📸 فیش پرداخت جدید برای ${escapeHtml(order.id)}\n👤 ${escapeHtml(order.name)} | ✈️ ${escapeHtml(order.telegramId || '—')} | 📱 ${escapeHtml(order.phone)}`,
              parse_mode: 'HTML',
              reply_markup: view.reply_markup
            });
          }
        }
        return { statusCode: 200, body: 'ok' };
      }
      // Not a receipt: treat it as a support message and relay it.
      if (!config.chatId) {
        await sendMessage(config, chatId, '🆘 پشتیبانی فعلاً فعال نیست؛ لطفاً از سایت با ما در ارتباط باشید.');
        return { statusCode: 200, body: 'ok' };
      }
      await forwardToAdmin(config, event, chatId, from, { kind: 'photo', value: message.photo[message.photo.length - 1].file_id, caption: String(message.caption || '').slice(0, 300) });
      touchSession(chatId, { username: from.username || '', name: [from.first_name, from.last_name].filter(Boolean).join(' ') }).catch(err => console.log('support session save failed:', err && err.message));
      await sendMessage(config, chatId, '✅ پیام شما به پشتیبانی ارسال شد؛ پاسخ به‌زودی همین‌جا ثبت می‌شود.');
      return { statusCode: 200, body: 'ok' };
    }

    if (text) {
      // Other bot commands: show the main menu again.
      if (text.startsWith('/')) {
        const siteUrl = resolveSiteUrl(config, event);
        await sendMessage(config, chatId, '🧭 منوی اصلی ربات:', mainMenuMarkup(siteUrl));
        return { statusCode: 200, body: 'ok' };
      }
      // Free text: support relay to the admin.
      if (!config.chatId) {
        await sendMessage(config, chatId, '🆘 پشتیبانی فعلاً فعال نیست؛ لطفاً از سایت با ما در ارتباط باشید.');
        return { statusCode: 200, body: 'ok' };
      }
      await forwardToAdmin(config, event, chatId, from, { kind: 'text', value: String(text).slice(0, 4000) });
      touchSession(chatId, { username: from.username || '', name: [from.first_name, from.last_name].filter(Boolean).join(' ') }).catch(err => console.log('support session save failed:', err && err.message));
      await sendMessage(config, chatId, '✅ پیام شما به پشتیبانی ارسال شد؛ پاسخ به‌زودی همین‌جا ثبت می‌شود.');
      return { statusCode: 200, body: 'ok' };
    }

    if (message.video || message.document) {
      // Media without a pending receipt: relay as a support message.
      if (config.chatId) {
        const kind = message.video ? 'video' : 'document';
        const file = (message.video || message.document).file_id;
        await forwardToAdmin(config, event, chatId, from, { kind, value: file, caption: String(message.caption || '').slice(0, 300) });
        touchSession(chatId, { username: from.username || '', name: [from.first_name, from.last_name].filter(Boolean).join(' ') }).catch(err => console.log('support session save failed:', err && err.message));
        await sendMessage(config, chatId, '✅ پیام شما به پشتیبانی ارسال شد؛ پاسخ به‌زودی همین‌جا ثبت می‌شود.');
        return { statusCode: 200, body: 'ok' };
      }
    }

    await sendMessage(config, chatId, 'لطفاً از طریق دکمه‌های منو استفاده کنید، متن پیام بنویسید و یا عکس فیش پرداخت را ارسال نمایید.');
    return { statusCode: 200, body: 'ok' };
  } catch (error) {
    console.log('Bot error:', error);
    return { statusCode: 500, body: error.message };
  }
};
