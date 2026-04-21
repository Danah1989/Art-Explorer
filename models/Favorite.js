const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  artworkId: {
    type: Number,
    required: true
  },
  title: String,
  artist: String,
  imageId: String,
  dateDisplay: String,
  medium: String,
  dominantColor: {
    hue: Number,
    saturation: Number,
    lightness: Number,
    hex: String
  },
  notes: {
    type: String,
    default: ''
  },
  colorTags: {
    type: [String],
    default: []
  },
  savedAt: {
    type: Date,
    default: Date.now
  }
});

// ensure each user can only favorite an artwork once
favoriteSchema.index({ user: 1, artworkId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);