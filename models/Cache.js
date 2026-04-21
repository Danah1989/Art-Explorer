const mongoose = require('mongoose');

const cacheSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  data: mongoose.Schema.Types.Mixed,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // auto-delete after 1 hour
  }
});

module.exports = mongoose.model('Cache', cacheSchema);