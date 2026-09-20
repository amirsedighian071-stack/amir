// Persistent order storage. /tmp is isolated per serverless invocation, so it
// is only a local-development fallback; production uses a Netlify Blob store.
const fs = require('fs');
const path = require('path');
const { isProductionRuntime } = require('./telegram-config');

const STORE_NAME = 'orders';
const KEY = 'orders.json';
const TMP_FILE = path.join('/tmp', KEY);

async function getOrdersStore() {
  try {
    const { getStore } = require('@netlify/blobs');
    return getStore(STORE_NAME);
  } catch (error) {
    return null;
  }
}

async function loadOrders() {
  const store = await getOrdersStore();
  if (store) {
    try {
      const raw = await store.get(KEY);
      if (raw) {
        const orders = JSON.parse(raw);
        return Array.isArray(orders) ? orders : [];
      }
    } catch (error) {
      // Fall back for local development.
    }
  }

  try {
    const orders = JSON.parse(fs.readFileSync(TMP_FILE, 'utf8'));
    return Array.isArray(orders) ? orders : [];
  } catch (error) {
    return [];
  }
}

async function saveOrders(orders) {
  const safeOrders = Array.isArray(orders) ? orders : [];
  const store = await getOrdersStore();
  if (store) {
    try {
      await store.set(KEY, JSON.stringify(safeOrders));
      return safeOrders;
    } catch (error) {
      // Fall back for local development. In production the fallback must not
      // be used silently: /tmp disappears between invocations and orders
      // placed by customers would vanish without any visible error.
      if (isProductionRuntime()) {
        throw new Error(
          'سفارش در فضای دائمی Netlify Blobs ذخیره نشد؛ سایت را دوباره Deploy کنید یا اتصال Blobs را بررسی کنید'
        );
      }
    }
  }

  fs.writeFileSync(TMP_FILE, JSON.stringify(safeOrders, null, 2));
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
