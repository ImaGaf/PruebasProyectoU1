
const ShoppingCart = require('../models/shoppingCart');


exports.create = async (req, res) => {
  try {
    console.log(req.body);
    const cart = new ShoppingCart(req.body);
    await cart.save();
    res.status(201).json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  const carts = await ShoppingCart.find();
  res.json(carts);
};

exports.getById = async (req, res) => {
  const cart = await ShoppingCart.findOne({ idShoppingCart: req.params.id });
  if (!cart) return res.status(404).json({ error: 'Not found' });
  res.json(cart);
};

exports.update = async (req, res) => {
  const cart = await ShoppingCart.findOneAndUpdate(
    { idShoppingCart: req.params.id },
    req.body,
    { new: true }
  );
  if (!cart) return res.status(404).json({ error: 'Not found' });
  res.json(cart);
};

exports.delete = async (req, res) => {
  const cart = await ShoppingCart.findOneAndDelete({ idShoppingCart: req.params.id });
  if (!cart) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Deleted' });
};

exports.getByCustomer = async (req, res) => {
  const customerId = req.params.customerId;
  const cart = await ShoppingCart.findOne({ customer: customerId });
  if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
  res.json(cart);
};
