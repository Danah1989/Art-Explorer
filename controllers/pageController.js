const api = require('../services/artInstituteAPI');

exports.home = async (req, res) => {
  try {
    const featured = await api.getRandomArtwork();
    res.render('index', { title: 'Chroma', featured });
  } catch (err) {
    res.render('index', { title: 'Chroma', featured: null });
  }
};
