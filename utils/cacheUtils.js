const Cache = require('../models/Cache');

// get a cached value by key
async function getCache(key) {
  try {
    const entry = await Cache.findOne({ key });
    if (!entry) return null;
    return entry.data;
  } catch (err) {
    console.error('Cache get error:', err.message);
    return null;
  }
}

// set a cache value with optional TTL in seconds
async function setCache(key, data, ttlSeconds = 3600) {
  try {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    await Cache.findOneAndUpdate(
      { key },
      { key, data, createdAt: expiresAt },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error('Cache set error:', err.message);
  }
}

// delete a cached value by key
async function deleteCache(key) {
  try {
    await Cache.deleteOne({ key });
  } catch (err) {
    console.error('Cache delete error:', err.message);
  }
}

// build a standardized cache key from prefix and parameters
function buildCacheKey(prefix, params) {
  const sorted = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&');
  return `${prefix}:${sorted}`;
}

module.exports = { getCache, setCache, deleteCache, buildCacheKey };