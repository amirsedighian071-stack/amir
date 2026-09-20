// Private Telegram configuration shared by the serverless functions.
// The browser never reads this store, so the bot token is not exposed in site data.
const fs = require('fs');
const path = require('path');
const {
  createBlobStorageError,
  getBlobStore,
  isProductionRuntime
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

function getPrivateStore() {
  return getBlobStore(STORE_NAME);
}

// Read the durable store when it is available. /tmp is intentionally limited
// to local development because it can disappear between production invocations.
async function readStoredTelegramConfig() {
  const { store } = getPrivateStore();
  if (store) {
    try {
      const raw = await store.get(KEY);
      if (raw) return normaliseTelegramConfig(JSON.parse(raw));
    } catch (error) {
      if (isProductionRuntime()) {
        console.error('[telegram-config] خواندن تنظیمات از Netlify Blobs ناموفق بود:', error);
      }
    }
  }

  if (isProductionRuntime()) return null;

  try {
    return normaliseTelegramConfig(JSON.parse(fs.readFileSync(TMP_FILE, 'utf8')));
  } catch (error) {
    return null;
  }
}

async function saveTelegramConfig(value) {
  const config = normaliseTelegramConfig(value);
  const { store, error: storeError } = getPrivateStore();
  let blobError = storeError;

  if (store) {
    try {
      await store.set(KEY, JSON.stringify(config));
      return config;
    } catch (error) {
      blobError = error;
    }
  }

  if (isProductionRuntime()) {
    const storageError = createBlobStorageError(
      'تنظیمات در فضای دائمی Netlify Blobs ذخیره نشد',
      blobError
    );
    console.error('[telegram-config] خطا در ذخیره تنظیمات:', storageError);
    throw storageError;
  }

  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('[telegram-config] خطا در ذخیره تنظیمات محلی:', error);
    throw error;
  }
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
