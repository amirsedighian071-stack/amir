// Persistent order storage. /tmp is isolated per serverless invocation, so it
// is only a local-development fallback; production uses a Netlify Blob store.
const fs = require('fs');
const path = require('path');
const {
  createBlobStorageError,
  getBlobStore,
  isProductionRuntime
} = require('./blob-store');

const STORE_NAME = 'orders';
const KEY = 'orders.json';
const TMP_FILE = path.join('/tmp', KEY);

async function loadOrders() {
  const { store } = getBlobStore(STORE_NAME);
  if (store) {
    try {
      const raw = await store.get(KEY);
      if (raw) {
        const orders = JSON.parse(raw);
        return Array.isArray(orders) ? orders : [];
      }
    } catch (error) {
      if (isProductionRuntime()) {
        console.error('[orders] خواندن سفارش‌ها از Netlify Blobs ناموفق بود:', error);
      }
    }
  }

  if (isProductionRuntime()) return [];

  try {
    const orders = JSON.parse(fs.readFileSync(TMP_FILE, 'utf8'));
    return Array.isArray(orders) ? orders : [];
  } catch (error) {
    return [];
  }
}

async function saveOrders(orders) {
  const safeOrders = Array.isArray(orders) ? orders : [];
  const { store, error: storeError } = getBlobStore(STORE_NAME);
  let blobError = storeError;

  if (store) {
    try {
      await store.set(KEY, JSON.stringify(safeOrders));
      return safeOrders;
    } catch (error) {
      blobError = error;
    }
  }

  if (isProductionRuntime()) {
    const storageError = createBlobStorageError(
      'سفارش در فضای دائمی Netlify Blobs ذخیره نشد',
      blobError
    );
    console.error('[orders] خطا در ذخیره سفارش‌ها:', storageError);
    throw storageError;
  }

  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(safeOrders, null, 2));
  } catch (error) {
    console.error('[orders] خطا در ذخیره سفارش‌ها در محیط محلی:', error);
    throw error;
  }
  return safeOrders;
}

async function findOrder(orderId) {
  const orders = await loadOrders();
  return orders.find((order) => order.id === orderId) || null;
}

async function updateOrder(orderId, patch) {
  const orders = await loadOrders();
  const index = orders.findIndex((order) => order.id === orderId);
  if (index < 0) return null;

  orders[index] = { ...orders[index], ...patch };
  await saveOrders(orders);
  return orders[index];
}

async function findPendingReceiptOrder(chatId) {
  const orders = await loadOrders();
  return orders.find((order) => String(order.pendingReceiptChatId) === String(chatId)) || null;
}

module.exports = {
  findOrder,
  findPendingReceiptOrder,
  loadOrders,
  saveOrders,
  updateOrder
};
