const shoppingCartService = require('../services/shoppingCartService');


exports.create = async (req, res) => {
  try {
    console.log(req.body);
    const cart = await shoppingCartService.createShoppingCart(req.body);
    res.status(201).json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  const carts = await shoppingCartService.getAllShoppingCarts();
  res.json(carts);
};

exports.getById = async (req, res) => {
  const cart = await shoppingCartService.getShoppingCartById(req.params.id);
  if (!cart) return res.status(404).json({ error: 'Not found' });
  res.json(cart);
};

exports.update = async (req, res) => {
  const cart = await shoppingCartService.updateShoppingCart(req.params.id, req.body);
  if (!cart) return res.status(404).json({ error: 'Not found' });
  res.json(cart);
};

exports.delete = async (req, res) => {
  const cart = await shoppingCartService.deleteShoppingCart(req.params.id);
  if (!cart) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Deleted' });
};

exports.getByCustomer = async (req, res) => {
  const customerId = req.params.customerId;
  const cart = await shoppingCartService.getShoppingCartByCustomer(customerId);
  if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
  res.json(cart);
};