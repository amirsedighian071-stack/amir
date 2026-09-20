// Netlify Function: shared site data store (read by everyone, written by admin).
// Uses Netlify Blobs in production and /tmp only during local development.
const fs = require('fs');
const path = require('path');
const {
  createBlobStorageError,
  getBlobStore,
  isProductionRuntime
} = require('./lib/blob-store');

const TMP_FILE = path.join('/tmp', 'site-data.json');
const STORE_NAME = 'site';
const KEY = 'site-data.json';

async function readData() {
  const { store } = getBlobStore(STORE_NAME);
  if (store) {
    try {
      const raw = await store.get(KEY);
      if (raw) return JSON.parse(raw);
    } catch (error) {
      if (isProductionRuntime()) {
        console.error('[site-data] خواندن اطلاعات سایت از Netlify Blobs ناموفق بود:', error);
      }
    }
  }

  if (isProductionRuntime()) return null;

  try {
    return JSON.parse(fs.readFileSync(TMP_FILE, 'utf8'));
  } catch (error) {
    return null;
  }
}

async function writeData(data) {
  const { store, error: storeError } = getBlobStore(STORE_NAME);
  let blobError = storeError;

  if (store) {
    try {
      await store.set(KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      blobError = error;
    }
  }

  if (isProductionRuntime()) {
    const storageError = createBlobStorageError(
      'اطلاعات سایت در فضای دائمی Netlify Blobs ذخیره نشد',
      blobError
    );
    console.error('[site-data] خطا در ذخیره اطلاعات سایت:', storageError);
    throw storageError;
  }

  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('[site-data] خطا در ذخیره اطلاعات سایت در محیط محلی:', error);
    return false;
  }
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  if (event.httpMethod === 'GET') {
    const data = await readData();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, data: data || null, updatedAt: data && data._updatedAt || null })
    };
  }

  if (event.httpMethod === 'POST' || event.httpMethod === 'PUT') {
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch (error) {
      return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: String(error && error.message || error) }) };
    }

    try {
      const incoming = body.data || body;
      if (!incoming || typeof incoming !== 'object') {
        return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'invalid payload' }) };
      }
      incoming._updatedAt = Date.now();
      const ok = await writeData(incoming);
      return {
        statusCode: ok ? 200 : 500,
        headers,
        body: JSON.stringify({ ok, updatedAt: incoming._updatedAt })
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ ok: false, error: String(error && error.message || error) })
      };
    }
  }

  return { statusCode: 405, headers, body: JSON.stringify({ ok: false, error: 'Method not allowed' }) };
};

// Exporting these keeps the storage behavior easy to exercise without changing
// the Netlify Functions handler contract.
exports.readData = readData;
exports.writeData = writeData;
