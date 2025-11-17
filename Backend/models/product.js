const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  idProduct: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  price: Number,
  stock: Number,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },  
  custom: Boolean,
  updatedAt: Date,
  url: String 
}, {
  collection: 'products'
});

module.exports = mongoose.model('Product', productSchema);
