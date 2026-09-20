// Netlify Blobs store resolution shared by all serverless functions.
// Netlify normally injects the Blobs context, but production deployments can
// occasionally lack it. In that case retry with explicit site credentials.

function getErrorMessage(error) {
  if (error && error.message) return String(error.message);
  if (error) return String(error);
  return 'خطای نامشخص در اتصال به Netlify Blobs';
}

function getBlobStore(name) {
  let getStore;

  try {
    ({ getStore } = require('@netlify/blobs'));
  } catch (error) {
    return { store: null, error };
  }

  try {
    return { store: getStore(name), error: null };
  } catch (firstError) {
    try {
      return {
        store: getStore({
          name,
          siteID: process.env.NETLIFY_BLOBS_SITE_ID || process.env.SITE_ID,
          token: process.env.NETLIFY_BLOBS_TOKEN
        }),
        error: null
      };
    } catch (secondError) {
      // The explicit attempt is the most useful explanation when both forms
      // fail, while the first error is retained as a fallback for unusual
      // libraries that throw a falsy value on the second attempt.
      return { store: null, error: secondError || firstError };
    }
  }
}

function isProductionRuntime() {
  const runningOnNetlify = Boolean(
    process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY
  );
  const runningNetlifyDev = process.env.NETLIFY_DEV === 'true' || process.env.NETLIFY_DEV === '1';
  return runningOnNetlify && !runningNetlifyDev;
}

function createBlobStorageError(prefix, cause) {
  const error = new Error(`${prefix}; دلیل: ${getErrorMessage(cause)}`);
  error.code = 'BLOB_STORAGE_ERROR';
  error.cause = cause;
  return error;
}

// Keep getStore as an alias so callers can use the helper without importing
// @netlify/blobs directly. It deliberately never throws.
module.exports = {
  createBlobStorageError,
  getBlobStore,
  getErrorMessage,
  getStore: getBlobStore,
  isProductionRuntime
};
