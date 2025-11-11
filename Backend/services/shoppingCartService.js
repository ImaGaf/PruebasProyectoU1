const ShoppingCart = require('../models/shoppingCart');


exports.createShoppingCart = async (data) => {
  const cart = new ShoppingCart(data);
  return await cart.save();
};

exports.getAllShoppingCarts = async () => {
  return await ShoppingCart.find();
};

exports.getShoppingCartById = async (id) => {
  return await ShoppingCart.findOne({ idShoppingCart: id });
};

exports.updateShoppingCart = async (id, data) => {
  return await ShoppingCart.findOneAndUpdate({ idShoppingCart: id }, data, { new: true });
};

exports.deleteShoppingCart = async (id) => {
  return await ShoppingCart.findOneAndDelete({ idShoppingCart: id });
};

exports.getShoppingCartByCustomer = async (customerId) => {
  return await ShoppingCart.findOne({ customer: customerId });
};