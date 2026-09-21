// Netlify Function: shared site data store (read by everyone, written by admin)
// Uses Netlify Blobs when available, falls back to /tmp for local dev only.
const fs = require('fs');
const path = require('path');
const {
  isProductionRuntime,
  openBlobStore,
  productionPersistError
} = require('./lib/blob-store');

const TMP_FILE = path.join('/tmp', 'site-data.json');
const STORE_NAME = 'site';
const KEY = 'site-data.json';

async function readData() {
  const { store } = await openBlobStore(STORE_NAME);
  if (store) {
    try {
      const raw = await store.get(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* fall through */ }
  }
  try { return JSON.parse(fs.readFileSync(TMP_FILE, 'utf8')); } catch (e) { return null; }
}

async function writeData(data) {
  const { store, error } = await openBlobStore(STORE_NAME);
  let blobError = error;
  if (store) {
    try {
      await store.set(KEY, JSON.stringify(data));
      return true;
    } catch (e) { blobError = e; }
  }

  // In production a silent /tmp fallback would lose admin edits between
  // invocations, so the failure is thrown (and logged) with the real reason.
  if (isProductionRuntime()) {
    throw productionPersistError('داده‌های سایت در فضای دائمی Netlify Blobs ذخیره نشد', blobError);
  }

  try { fs.writeFileSync(TMP_FILE, JSON.stringify(data)); return true; } catch (e) { return false; }
}

// Shared reader lets checkout respect published shop/form settings.
exports.readData = readData;

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
    const params = (event.queryStringParameters) || {};
    const data = await readData();
    const updatedAt = (data && data._updatedAt) || null;
    // Lightweight stamp check (?meta=1) so visitors poll bytes, not megabytes:
    // the full payload (with base64 photos) is only downloaded when it changed.
    if (params.meta === '1') {
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, updatedAt }) };
    }
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, data: data || null, updatedAt })
    };
  }

  if (event.httpMethod === 'POST' || event.httpMethod === 'PUT') {
    let incoming;
    try {
      const body = JSON.parse(event.body || '{}');
      incoming = body.data || body;
    } catch (e) {
      return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: String(e && e.message || e) }) };
    }
    if (!incoming || typeof incoming !== 'object') {
      return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'invalid payload' }) };
    }
    incoming._updatedAt = Date.now();
    try {
      const ok = await writeData(incoming);
      return {
        statusCode: ok ? 200 : 500,
        headers,
        body: JSON.stringify({ ok, updatedAt: incoming._updatedAt })
      };
    } catch (e) {
      // Storage failure in production: report 500 with the real reason.
      return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: String(e && e.message || e) }) };
    }
  }

  return { statusCode: 405, headers, body: JSON.stringify({ ok: false, error: 'Method not allowed' }) };
};
