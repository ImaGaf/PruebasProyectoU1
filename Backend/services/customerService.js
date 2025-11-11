const CartItem = require("../models/customer");

exports.findAll = () => CartItem.find();

exports.findById = async (id) => {
  const item = await CartItem.findById(id);
  if (!item) throw new Error("Item del carrito no encontrado");
  return item;
};

exports.create = (data) => CartItem.create(data);

exports.update = async (id, data) => {
  const updated = await CartItem.findByIdAndUpdate(id, data, { new: true });
  if (!updated) throw new Error("Item del carrito no encontrado");
  return updated;
};

exports.remove = async (id) => {
  const deleted = await CartItem.findByIdAndDelete(id);
  if (!deleted) throw new Error("Item del carrito no encontrado");
  return deleted;
};