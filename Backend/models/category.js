const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  categoryID: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  description: String
}, {
  collection: 'categories'
});

module.exports = mongoose.model('Category', categorySchema);
