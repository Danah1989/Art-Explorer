const axios = require('axios');
const { getCache, setCache, buildCacheKey } = require('../utils/cacheUtils');
const { filterByColor, hslToHex } = require('../utils/colorUtils');

const BASE_URL = process.env.API_BASE_URL || 'https://api.artic.edu/api/v1';
const IIIF_BASE = 'https://www.artic.edu/iiif/2';

// fields to retrieve from the art institute api
const ARTWORK_FIELDS = [
  'id', 'title', 'artist_display', 'artist_title', 'date_display',
  'date_start', 'date_end', 'medium_display', 'image_id', 'color',
  'description', 'place_of_origin', 'dimensions', 'artwork_type_title',
  'artwork_type_id', 'style_title', 'classification_title', 'thumbnail'
].join(',');

// curated metadata for common artwork types
const ARTWORK_TYPE_META = {
  1: { label: 'Painting', description: 'Oil, acrylic, watercolor, and other painted works' },
  14: { label: 'Drawing', description: 'Sketches, charcoal, ink, and pencil works' },
  18: { label: 'Print', description: 'Etchings, lithographs, woodblocks, and engravings' },
  23: { label: 'Vessel', description: 'Pottery, ceramics, glass, and containers' },
  3: { label: 'Sculpture', description: 'Three-dimensional works in stone, metal, and more' },
  4: { label: 'Photograph', description: 'Photographic prints and negatives' },
  26: { label: 'Textile', description: 'Woven, embroidered, and decorative fabric works' },
  11: { label: 'Architectural Drawing', description: 'Plans, elevations, and architectural studies' },
  5: { label: 'Furniture', description: 'Chairs, tables, cabinets, and decorative furniture' },
  25: { label: 'Decorative Art', description: 'Metalwork, enamel, and ornamental objects' },
};

// color pool configuration - fetch up to 3 pages of 100 candidates each
const COLOR_POOL_PAGES = 5;
const COLOR_POOL_PER_PAGE = 100;

// generate iiif image url for a given image id
function getImageUrl(imageId, width = 843) {
  if (!imageId) return null;
  return `${IIIF_BASE}/${imageId}/full/${width},/0/default.jpg`;
}

// add computed fields to artwork object
function enrichArtwork(artwork) {
  if (!artwork) return null;
  return {
    ...artwork,
    imageUrl: getImageUrl(artwork.image_id),
    thumbnailUrl: getImageUrl(artwork.image_id, 400),
    dominantHex: artwork.color
      ? hslToHex(artwork.color.h, artwork.color.s, artwork.color.l)
      : null
  };
}

// build elasticsearch must-clauses for api queries
function buildMustClauses({ dateStart, dateEnd, typeId, requireColor = false }) {
  const must = [{ term: { is_public_domain: true } }];

  if (dateStart || dateEnd) {
    must.push({
      range: {
        date_start: {
          ...(dateStart ? { gte: parseInt(dateStart) } : {}),
          ...(dateEnd ? { lte: parseInt(dateEnd) } : {})
        }
      }
    });
  }

  if (typeId) {
    must.push({ term: { artwork_type_id: parseInt(typeId) } });
  }

  if (requireColor) {
    must.push({ exists: { field: 'color' } });
  }

  return must;
}

// fetch a pool of color-tagged artworks and filter client-side by hue
async function fetchColorPool({ query, dateStart, dateEnd, typeId, colorHue, colorTolerance }) {
  const poolKey = buildCacheKey('colorpool', {
    query: query || '',
    dateStart: dateStart || '',
    dateEnd: dateEnd || '',
    typeId: typeId || '',
    colorHue,
    colorTolerance
  });

  const cached = await getCache(poolKey);
  if (cached) return cached;

  const must = buildMustClauses({ dateStart, dateEnd, typeId, requireColor: true });
  const allArtworks = [];

  // fetch multiple pages in parallel
  const pageNums = Array.from({ length: COLOR_POOL_PAGES }, (_, i) => i + 1);
  const requests = pageNums.map(p =>
    axios.post(`${BASE_URL}/artworks/search`, {
      q: query || undefined,
      query: { bool: { must } },
      fields: ARTWORK_FIELDS.split(','),
      limit: COLOR_POOL_PER_PAGE,
      page: p
    }, {
      headers: { 'Content-Type': 'application/json', 'AIC-User-Agent': 'ArtExplorer/1.0 (edu)' },
      timeout: 15000
    }).catch(() => null)
  );

  const responses = await Promise.all(requests);
  const seen = new Set();

  for (const resp of responses) {
    if (!resp) continue;
    for (const artwork of resp.data.data || []) {
      if (!seen.has(artwork.id)) {
        seen.add(artwork.id);
        allArtworks.push(enrichArtwork(artwork));
      }
    }
  }

  // apply client-side color filtering
  const filtered = filterByColor(allArtworks, parseInt(colorHue), parseInt(colorTolerance));

  const pool = { all: filtered, total: filtered.length };
  await setCache(poolKey, pool, 3600);
  return pool;
}

// main search function - handles both color-filtered and normal searches
async function searchArtworks({ query = '', page = 1, limit = 18, dateStart, dateEnd, colorHue, colorTolerance = 30, typeId } = {}) {
  const hasColor = colorHue !== undefined && colorHue !== null && colorHue !== '';

  if (hasColor) {
    // color-filtered path: fetch pool and paginate locally
    const pool = await fetchColorPool({
      query, dateStart, dateEnd, typeId,
      colorHue: parseInt(colorHue),
      colorTolerance: parseInt(colorTolerance)
    });

    const total = pool.total;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const offset = (safePage - 1) * limit;
    const artworks = pool.all.slice(offset, offset + limit);

    return {
      artworks,
      total,
      pagination: {
        total,
        limit,
        offset,
        total_pages: totalPages,
        current_page: safePage
      }
    };
  }

  // normal path: paginate via api
  const cacheKey = buildCacheKey('search', {
    query, page, limit,
    dateStart: dateStart || '',
    dateEnd: dateEnd || '',
    typeId: typeId || ''
  });

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  try {
    const must = buildMustClauses({ dateStart, dateEnd, typeId });

    const body = {
      q: query || undefined,
      query: { bool: { must } },
      fields: ARTWORK_FIELDS.split(','),
      page,
      limit
    };

    const response = await axios.post(`${BASE_URL}/artworks/search`, body, {
      headers: { 'Content-Type': 'application/json', 'AIC-User-Agent': 'ArtExplorer/1.0 (edu)' },
      timeout: 12000
    });

    const artworks = (response.data.data || []).map(enrichArtwork);
    const pagination = response.data.pagination || {};
    const total = pagination.total || 0;

    const result = { artworks, pagination, total };
    await setCache(cacheKey, result, 3600);
    return result;
  } catch (err) {
    console.error('api search artworks error:', err.message);
    return { artworks: [], pagination: {}, total: 0, error: err.message };
  }
}

// get a single artwork by id
async function getArtworkById(id) {
  const cacheKey = `artwork:${id}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(`${BASE_URL}/artworks/${id}`, {
      params: { fields: ARTWORK_FIELDS },
      headers: { 'AIC-User-Agent': 'ArtExplorer/1.0 (edu)' },
      timeout: 10000
    });

    const artwork = enrichArtwork(response.data.data);
    await setCache(cacheKey, artwork, 86400);
    return artwork;
  } catch (err) {
    console.error(`api get artwork by id (${id}) error:`, err.message);
    return null;
  }
}

// fetch artwork types with curated metadata
async function getArtworkTypes() {
  const cacheKey = 'artwork-types';
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(`${BASE_URL}/artwork-types`, {
      params: { limit: 50, fields: 'id,title' },
      headers: { 'AIC-User-Agent': 'ArtExplorer/1.0 (edu)' },
      timeout: 10000
    });

    const types = (response.data.data || []).map(t => ({
      id: t.id,
      title: t.title,
      description: ARTWORK_TYPE_META[t.id]?.description || `Browse ${t.title.toLowerCase()} works`,
      featured: !!ARTWORK_TYPE_META[t.id]
    }));

    // sort featured types first, then alphabetically
    types.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return a.title.localeCompare(b.title);
    });

    await setCache(cacheKey, types, 86400);
    return types;
  } catch (err) {
    console.error('api get artwork types error:', err.message);
    return Object.entries(ARTWORK_TYPE_META).map(([id, meta]) => ({
      id: parseInt(id),
      title: meta.label,
      description: meta.description,
      featured: true
    }));
  }
}

// cache for random paintings - refresh pool every hour
let paintingsPool = [];
let poolLastUpdated = 0;
const POOL_REFRESH_INTERVAL = 10 * 60 * 1000;  
const POOL_SIZE = 100; 

// fetch a fresh pool of paintings
async function fetchPaintingsPool() {
  try {
    const allPaintings = [];
    
    // fetch multiple pages 
    for (let page = 1; page <= 5; page++) {
      const body = {
        query: {
          bool: {
            must: [
              { term: { is_public_domain: true } },
              { exists: { field: 'image_id' } },
              { term: { artwork_type_id: 1 } } 
            ]
          }
        },
        fields: ARTWORK_FIELDS.split(','),
        limit: 20,
        page: page
      };

      const response = await axios.post(`${BASE_URL}/artworks/search`, body, {
        headers: { 'Content-Type': 'application/json', 'AIC-User-Agent': 'ArtExplorer/1.0 (edu)' },
        timeout: 10000
      });

      const artworks = (response.data.data || [])
        .map(enrichArtwork)
        .filter(a => a && a.imageUrl);
      
      allPaintings.push(...artworks);
    }

    console.log(`paintings pool refreshed: ${allPaintings.length} artworks`);
    return allPaintings;
  } catch (err) {
    console.error('error fetching paintings pool:', err.message);
    return [];
  }
}

// get a random painting from the pool 
async function getRandomArtwork() {
  const now = Date.now();
  
  // refresh pool if empty or expired
  if (paintingsPool.length === 0 || (now - poolLastUpdated) > POOL_REFRESH_INTERVAL) {
    paintingsPool = await fetchPaintingsPool();
    poolLastUpdated = now;
  }
  
  // if pool is still empty, return null
  if (paintingsPool.length === 0) {
    return null;
  }
  
  // pick a random painting from the pool
  const randomIndex = Math.floor(Math.random() * paintingsPool.length);
  return paintingsPool[randomIndex];
}

module.exports = { searchArtworks, getArtworkById, getArtworkTypes, getImageUrl, getRandomArtwork };