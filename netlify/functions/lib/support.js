// Support relay state for the Telegram bot.
//
// When a customer messages the bot, the message is forwarded to the admin
// chat. The admin's reply (sent as a reply to that forwarded message) is
// routed back to the customer. This module keeps the small mapping that makes
// that routing possible:
//
//   replies: { [adminMessageId]: { userChatId, at } }
//     - adminMessageId: message_id of the message the bot sent to the admin
//     - userChatId:     chat the admin's reply should go back to
//
//   sessions: { [userChatId]: { username, name, activeAt } }
//     - lightweight record of customers currently talking to support
//
// Like the orders store, it uses Netlify Blobs when available and /tmp only
// for local development.
const fs = require('fs');
const path = require('path');
const {
  isProductionRuntime,
  openBlobStore,
  productionPersistError
} = require('./blob-store');

const STORE_NAME = 'support';
const KEY = 'support.json';
const TMP_FILE = path.join('/tmp', KEY);
const MAX_AGE_MS = 48 * 60 * 60 * 1000; // drop mapping entries after 2 days

function emptyState() {
  return { sessions: {}, replies: {} };
}

function normaliseState(state) {
  return {
    sessions: state && typeof state.sessions === 'object' && state.sessions ? state.sessions : {},
    replies: state && typeof state.replies === 'object' && state.replies ? state.replies : {}
  };
}

function prune(state) {
  const now = Date.now();
  Object.keys(state.replies).forEach((k) => {
    const entry = state.replies[k];
    if (!entry || !entry.userChatId || now - (entry.at || 0) > MAX_AGE_MS) delete state.replies[k];
  });
  Object.keys(state.sessions).forEach((k) => {
    const entry = state.sessions[k];
    if (!entry || now - (entry.activeAt || 0) > MAX_AGE_MS) delete state.sessions[k];
  });
  return state;
}

async function loadSupportState() {
  const { store } = await openBlobStore(STORE_NAME);
  if (store) {
    try {
      const raw = await store.get(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return normaliseState(parsed);
      }
    } catch (error) {
      // Fall back to /tmp (local development) below.
    }
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(TMP_FILE, 'utf8'));
    return normaliseState(parsed);
  } catch (error) {
    return emptyState();
  }
}

async function saveSupportState(state) {
  const safe = prune(normaliseState(state));
  const { store, error } = await openBlobStore(STORE_NAME);
  let blobError = error;

  if (store) {
    try {
      await store.set(KEY, JSON.stringify(safe));
      return safe;
    } catch (setError) {
      blobError = setError;
    }
  }

  if (isProductionRuntime()) {
    throw productionPersistError('وضعیت پشتیبانی در فضای دائمی ذخیره نشد', blobError);
  }

  fs.writeFileSync(TMP_FILE, JSON.stringify(safe));
  return safe;
}

async function touchSession(chatId, info = {}) {
  const state = await loadSupportState();
  const key = String(chatId);
  const previous = state.sessions[key] || {};
  state.sessions[key] = {
    username: info.username || previous.username || '',
    name: info.name || previous.name || '',
    activeAt: Date.now()
  };
  return saveSupportState(state);
}

async function addPendingAdminReply(adminMessageId, userChatId) {
  if (adminMessageId === undefined || adminMessageId === null) return;
  const state = await loadSupportState();
  state.replies[String(adminMessageId)] = { userChatId: String(userChatId), at: Date.now() };
  return saveSupportState(state);
}

async function findPendingAdminReply(adminMessageId) {
  const state = await loadSupportState();
  const entry = state.replies[String(adminMessageId)];
  return entry && entry.userChatId ? { userChatId: entry.userChatId } : null;
}

// Customers who talked to support inside the given window, most recent first.
// Used to route an admin's free (non-reply) message to the right customer.
async function recentSupportSessions(windowMs) {
  const state = await loadSupportState();
  const now = Date.now();
  return Object.entries(state.sessions)
    .filter(([, s]) => s && now - (s.activeAt || 0) <= windowMs)
    .map(([chatId, s]) => ({ chatId, username: s.username || '', name: s.name || '', activeAt: s.activeAt || 0 }))
    .sort((a, b) => b.activeAt - a.activeAt);
}

module.exports = {
  addPendingAdminReply,
  findPendingAdminReply,
  loadSupportState,
  recentSupportSessions,
  saveSupportState,
  touchSession
};
