// Private Telegram configuration shared by the serverless functions.
// The browser never reads this store, so the bot token is not exposed in site data.
const fs = require('fs');
const path = require('path');

const STORE_NAME = 'private-settings';
const KEY = 'telegram-config.json';
const TMP_FILE = path.join('/tmp', KEY);

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normaliseTelegramConfig(value = {}) {
  return {
    botToken: clean(value.botToken),
    chatId: clean(value.chatId),
    botUsername: clean(value.botUsername).replace(/^@+/, ''),
    cardNumber: clean(value.cardNumber),
    cardHolder: clean(value.cardHolder)
  };
}

// True when the code runs on a real Netlify Functions host. The /tmp storage
// fallback is only acceptable for local development; on production it would
// silently lose the bot configuration between invocations (each invocation can
// run in a fresh container), which broke checkout even though the settings
// panel had reported success.
function isProductionRuntime() {
  if (process.env.NETLIFY_DEV === 'true') return false;
  return Boolean(
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NETLIFY === 'true' ||
    process.env.CONTEXT ||
    process.env.SITE_ID
  );
}

async function getPrivateStore() {
  try {
    const { getStore } = require('@netlify/blobs');
    return getStore(STORE_NAME);
  } catch (error) {
    return null;
  }
}

async function readStoredTelegramConfig() {
  const store = await getPrivateStore();
  if (store) {
    try {
      const raw = await store.get(KEY);
      if (raw) return normaliseTelegramConfig(JSON.parse(raw));
    } catch (error) {
      // Local development and unavailable blob storage use the /tmp fallback below.
    }
  }

  try {
    return normaliseTelegramConfig(JSON.parse(fs.readFileSync(TMP_FILE, 'utf8')));
  } catch (error) {
    return null;
  }
}

async function saveTelegramConfig(value) {
  const config = normaliseTelegramConfig(value);
  const store = await getPrivateStore();
  let blobError = null;
  if (store) {
    try {
      await store.set(KEY, JSON.stringify(config));
      return config;
    } catch (error) {
      // Keep local Netlify dev usable when Blobs are unavailable, but never
      // pretend a production save succeeded when it only went to ephemeral
      // /tmp — the next order would see an empty configuration again.
      blobError = error;
    }
  }

  if (isProductionRuntime()) {
    const reason = blobError && blobError.message ? ` (${blobError.message})` : '';
    throw new Error(
      'تنظیمات در فضای دائمی Netlify Blobs ذخیره نشد؛ سایت را دوباره Deploy کنید یا اتصال Blobs را بررسی کنید' + reason
    );
  }

  fs.writeFileSync(TMP_FILE, JSON.stringify(config, null, 2));
  return config;
}

function environmentConfig() {
  return normaliseTelegramConfig({
    botToken: process.env.BOT_TOKEN,
    chatId: process.env.ADMIN_CHAT_ID,
    botUsername: process.env.BOT_USERNAME,
    cardNumber: process.env.PAYMENT_CARD,
    cardHolder: process.env.PAYMENT_CARD_HOLDER
  });
}

async function getTelegramConfig() {
  const saved = await readStoredTelegramConfig();
  const fallback = environmentConfig();
  // Values set from the panel take precedence; environment variables remain
  // fully supported for existing Netlify installations.
  return normaliseTelegramConfig({
    botToken: (saved && saved.botToken) || fallback.botToken,
    chatId: (saved && saved.chatId) || fallback.chatId,
    botUsername: (saved && saved.botUsername) || fallback.botUsername,
    cardNumber: (saved && saved.cardNumber) || fallback.cardNumber,
    cardHolder: (saved && saved.cardHolder) || fallback.cardHolder
  });
}

module.exports = {
  getTelegramConfig,
  isProductionRuntime,
  normaliseTelegramConfig,
  readStoredTelegramConfig,
  saveTelegramConfig
};
