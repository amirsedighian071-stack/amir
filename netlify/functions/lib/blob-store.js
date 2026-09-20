// Shared Netlify Blobs helper for every serverless function.
//
// On a deployed Netlify function `getStore(name)` normally works because
// Netlify injects the blob context (internal API URL, site ID and token)
// automatically. Some production invocations still fail with
// MissingBlobsEnvironmentError because that context is not injected. In that
// case we retry with an explicit connection built from environment
// variables: NETLIFY_BLOBS_SITE_ID (or SITE_ID) and NETLIFY_BLOBS_TOKEN.
//
// openBlobStore() never throws — it resolves to { store, error } so each
// caller decides how to react: throw in production (persistent storage is
// mandatory there) or fall back to /tmp in local development.

// True when the code runs on a real Netlify Functions host. The /tmp storage
// fallback is only acceptable for local development; on production it would
// silently lose data between invocations (each invocation can run in a fresh
// container). `netlify dev` sets NETLIFY_DEV=true and stays "local".
function isProductionRuntime() {
  if (process.env.NETLIFY_DEV === 'true') return false;
  return Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY);
}

// Guidance appended to production storage failures and returned by the
// settings endpoint; matches the troubleshooting section of the README.
const BLOB_ENV_HINT =
  'متغیرهای محیطی NETLIFY_BLOBS_SITE_ID و NETLIFY_BLOBS_TOKEN را در Netlify تنظیم کنید (Site configuration → Environment variables) و سپس سایت را دوباره Deploy کنید.';

function errorMessage(error) {
  if (!error) return '';
  return String(error.message || error);
}

// Combines the failures of both connection attempts into a single error so
// the admin sees the real reason (e.g. MissingBlobsEnvironmentError details)
// instead of a generic "storage unavailable" message.
function combineErrors(first, second) {
  const messages = [...new Set([errorMessage(first), errorMessage(second)].filter(Boolean))];
  const combined = new Error(messages.join(' | ') || 'اتصال به Netlify Blobs ناموفق بود.');
  combined.errors = [first, second].filter(Boolean);
  return combined;
}

// Opens a blob store without ever throwing.
// Resolves to { store, error }:
//   - { store, error: null }  when either connection attempt succeeded;
//   - { store: null, error }  when both failed — error carries the reason.
async function openBlobStore(name) {
  let getStore;
  try {
    ({ getStore } = require('@netlify/blobs'));
  } catch (error) {
    // Package unavailable (e.g. plain local preview): callers fall back.
    return { store: null, error };
  }

  // 1) Preferred path: Netlify injects the blob context automatically.
  let firstError = null;
  try {
    const store = await getStore(name);
    return { store, error: null };
  } catch (error) {
    firstError = error;
  }

  // 2) Retry with explicit credentials (MissingBlobsEnvironmentError case).
  try {
    const store = await getStore({
      name,
      siteID: process.env.NETLIFY_BLOBS_SITE_ID || process.env.SITE_ID,
      token: process.env.NETLIFY_BLOBS_TOKEN
    });
    return { store, error: null };
  } catch (secondError) {
    return { store: null, error: combineErrors(firstError, secondError) };
  }
}

// Builds the error thrown when a production save cannot reach persistent
// storage: logs the real reason for operators and includes it (plus the
// env-var guidance) in the message that reaches the admin panel.
function productionPersistError(message, error) {
  console.error(`[blob-store] ${message}:`, errorMessage(error) || 'unknown error');
  const reason = errorMessage(error) ? ` — دلیل خطا: ${errorMessage(error)}` : '';
  return new Error(`${message}${reason}. ${BLOB_ENV_HINT}`);
}

// Round-trip health check used by the admin panel: opens the store, writes a
// probe value, reads it back and removes it again. Returns a
// JSON-serialisable { ready, error } and never throws.
async function checkBlobStorage(name = 'private-settings') {
  const { store, error } = await openBlobStore(name);
  if (!store) return { ready: false, error: errorMessage(error) };

  const probeKey = 'storage-check.json';
  const probeValue = JSON.stringify({ ok: true, at: Date.now() });
  try {
    await store.set(probeKey, probeValue);
    const raw = await store.get(probeKey);
    if (raw !== probeValue) {
      return {
        ready: false,
        error: 'دادهٔ آزمایشی پس از ذخیره در Netlify Blobs بازخوانی نشد (round-trip failed).'
      };
    }
    return { ready: true, error: null };
  } catch (probeError) {
    return { ready: false, error: errorMessage(probeError) };
  } finally {
    try {
      await store.delete(probeKey);
    } catch (cleanupError) {
      // Best effort: a leftover probe key is harmless.
    }
  }
}

module.exports = {
  BLOB_ENV_HINT,
  checkBlobStorage,
  isProductionRuntime,
  openBlobStore,
  productionPersistError
};
