// Netlify Function: shared site data store (read by everyone, written by admin)
// Uses Netlify Blobs when available, falls back to /tmp for local dev.
const fs = require('fs');
const path = require('path');

const TMP_FILE = path.join('/tmp', 'site-data.json');
const STORE_NAME = 'site';
const KEY = 'site-data.json';

async function getStore() {
  try {
    const { getStore } = require('@netlify/blobs');
    return getStore(STORE_NAME);
  } catch (e) {
    return null;
  }
}

async function readData() {
  const store = await getStore();
  if (store) {
    try {
      const raw = await store.get(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* fall through */ }
  }
  try { return JSON.parse(fs.readFileSync(TMP_FILE, 'utf8')); } catch (e) { return null; }
}

async function writeData(data) {
  const store = await getStore();
  if (store) {
    try {
      await store.set(KEY, JSON.stringify(data));
      return true;
    } catch (e) { /* fall through */ }
  }
  try { fs.writeFileSync(TMP_FILE, JSON.stringify(data)); return true; } catch (e) { return false; }
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
    try {
      const body = JSON.parse(event.body || '{}');
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
    } catch (e) {
      return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: String(e && e.message || e) }) };
    }
  }

  return { statusCode: 405, headers, body: JSON.stringify({ ok: false, error: 'Method not allowed' }) };
};
