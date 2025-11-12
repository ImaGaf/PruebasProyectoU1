const shoppingCartService = require("../services/shoppingCartService");

exports.create = async (req, res) => {
  try {
    const cart = await shoppingCartService.createShoppingCart(req.body);
    res.status(201).json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const carts = await shoppingCartService.getAllShoppingCarts();
    res.status(200).json(carts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const cart = await shoppingCartService.getShoppingCartById(req.params.id);
    if (!cart) return res.status(404).json({ error: 'Not found' });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const cart = await shoppingCartService.updateShoppingCart(req.params.id, req.body);
    if (!cart) return res.status(404).json({ error: 'Not found' });
    res.json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const cart = await shoppingCartService.deleteShoppingCart(req.params.id);
    if (!cart) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getByCustomer = async (req, res) => {
  try {
    const cart = await shoppingCartService.getShoppingCartByCustomer(req.params.customerId);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};