// Private Telegram configuration shared by the serverless functions.
// The browser never reads this store, so the bot token is not exposed in site data.
const fs = require('fs');
const path = require('path');
const {
  isProductionRuntime,
  openBlobStore,
  productionPersistError
} = require('./blob-store');

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

async function readStoredTelegramConfig() {
  const { store } = await openBlobStore(STORE_NAME);
  if (store) {
    try {
      const raw = await store.get(KEY);
      if (raw) return normaliseTelegramConfig(JSON.parse(raw));
    } catch (error) {
      // Reads stay best-effort: local development and unavailable blob
      // storage use the /tmp fallback below, and getTelegramConfig merges
      // environment values. Save failures are the ones surfaced loudly.
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
  const { store, error } = await openBlobStore(STORE_NAME);
  let blobError = error;
  if (store) {
    try {
      await store.set(KEY, JSON.stringify(config));
      return config;
    } catch (setError) {
      // Keep local Netlify dev usable when Blobs are unavailable, but never
      // pretend a production save succeeded when it only went to ephemeral
      // /tmp — the next order would see an empty configuration again.
      blobError = setError;
    }
  }

  if (isProductionRuntime()) {
    // Throws with the real reason (e.g. MissingBlobsEnvironmentError) inside
    // the message and logs it via console.error, so the admin panel can show
    // why persistent storage failed instead of a generic message.
    throw productionPersistError('تنظیمات در فضای دائمی Netlify Blobs ذخیره نشد', blobError);
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
