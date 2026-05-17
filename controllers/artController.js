const api = require('../services/artInstituteAPI');
const Favorite = require('../models/Favorite');

// predefined colors available in the sidebar filter
const PRESET_COLORS = [
  { name: 'Red', hue: 0, hex: '#e63946' },
  { name: 'Orange', hue: 25, hex: '#e07c39' },
  { name: 'Yellow', hue: 50, hex: '#e9c46a' },
  { name: 'Green', hue: 120, hex: '#2a9d8f' },
  { name: 'Blue', hue: 210, hex: '#457b9d' },
  { name: 'Purple', hue: 275, hex: '#6a4c93' },
  { name: 'Pink', hue: 330, hex: '#d4769a' },
  { name: 'Brown', hue: 30, hex: '#8b5e3c' },
];

// featured artwork types for sidebar navigation
const SIDEBAR_TYPES = [
  { id: 1, label: 'Painting' },
  { id: 14, label: 'Drawing' },
  { id: 18, label: 'Print' },
  { id: 3, label: 'Sculpture' },
  { id: 4, label: 'Photograph' },
  { id: 23, label: 'Vessel' },
  { id: 26, label: 'Textile' },
];

// get set of artwork IDs favorited by the current user
async function getSavedIds(userId) {
  if (!userId) return new Set();
  const favs = await Favorite.find({ user: userId }).select('artworkId');
  return new Set(favs.map(f => f.artworkId));
}

// search artworks with filters
exports.search = async (req, res) => {
  const { q = '', page = 1, dateStart, dateEnd, colorHue, typeId } = req.query;
  const currentPage = parseInt(page) || 1;

  const activeColor = colorHue !== undefined && colorHue !== ''
    ? PRESET_COLORS.find(c => String(c.hue) === String(colorHue)) || null
    : null;

  const activeType = typeId
    ? SIDEBAR_TYPES.find(t => String(t.id) === String(typeId)) || null
    : null;

  try {
    const result = await api.searchArtworks({
      query: q,
      page: currentPage,
      limit: 12,
      dateStart,
      dateEnd,
      colorHue: colorHue !== '' ? colorHue : undefined,
      colorTolerance: 30,
      typeId
    });

    const savedIds = await getSavedIds(req.session.user?.id);

    res.render('art/results', {
      title: q ? `Search: "${q}"` : 'Browse Art',
      artworks: result.artworks,
      pagination: result.pagination,
      total: result.total,
      currentPage,
      query: q,
      dateStart: dateStart || '',
      dateEnd: dateEnd || '',
      colorHue: colorHue || '',
      typeId: typeId || '',
      activeColor,
      activeType,
      presetColors: PRESET_COLORS,
      sidebarTypes: SIDEBAR_TYPES,
      savedIds,
      error: result.error || null
    });
  } catch (err) {
    res.render('art/results', {
      title: 'Search',
      artworks: [],
      pagination: {},
      total: 0,
      currentPage: 1,
      query: q,
      dateStart: '',
      dateEnd: '',
      colorHue: '',
      typeId: '',
      activeColor: null,
      activeType: null,
      presetColors: PRESET_COLORS,
      sidebarTypes: SIDEBAR_TYPES,
      savedIds: new Set(),
      error: 'Failed to fetch artworks. Please try again.'
    });
  }
};

// display single artwork detail page
exports.detail = async (req, res) => {
  const { id } = req.params;

  try {
    const artwork = await api.getArtworkById(id);
    if (!artwork) {
      return res.status(404).render('error', {
        title: 'Artwork Not Found',
        message: 'This artwork could not be found.',
        status: 404
      });
    }

    let isFavorited = false;
    let favorite = null;
    if (req.session.user) {
      favorite = await Favorite.findOne({ user: req.session.user.id, artworkId: artwork.id });
      isFavorited = !!favorite;
    }

    res.render('art/detail', {
      title: artwork.title || 'Artwork Detail',
      artwork,
      isFavorited,
      favorite,
      error: null
    });
  } catch (err) {
    res.status(500).render('error', { title: 'Error', message: err.message, status: 500 });
  }
};

// redirect legacy color search URLs to filtered results
exports.colorSearchRedirect = (req, res) => {
  const { hue } = req.query;
  if (hue) return res.redirect(`/art/search?colorHue=${hue}`);
  res.redirect('/art/search');
};

// browse artworks by type
exports.getArtworksByType = async (req, res) => {
  const { typeId } = req.params;
  const { page = 1, q = '' } = req.query;
  const currentPage = parseInt(page) || 1;

  const allTypes = await api.getArtworkTypes().catch(() => []);
  const typeInfo = allTypes.find(t => String(t.id) === String(typeId)) || { title: 'Artworks' };

  try {
    const result = await api.searchArtworks({
      query: q,
      page: currentPage,
      limit: 20,
      typeId
    });

    const savedIds = await getSavedIds(req.session.user?.id);

    res.render('art/results', {
      title: `${typeInfo.title}`,
      artworks: result.artworks,
      pagination: result.pagination,
      total: result.total,
      currentPage,
      query: q,
      dateStart: '',
      dateEnd: '',
      colorHue: '',
      typeId,
      activeColor: null,
      activeType: { id: parseInt(typeId), label: typeInfo.title },
      presetColors: PRESET_COLORS,
      sidebarTypes: SIDEBAR_TYPES,
      savedIds,
      error: result.error || null
    });
  } catch (err) {
    res.status(500).render('error', { title: 'Error', message: err.message, status: 500 });
  }
};