const cartItemService = require("../services/cartItemService");

exports.getAll = async (req, res) => {
  try {
    const items = await cartItemService.findAll();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los items", error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await cartItemService.findById(req.params.id);
    res.json(item);
  } catch (error) {
    res.status(404).json({ message: "Item no encontrado", error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const newItem = await cartItemService.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: "Error al crear el item", error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updatedItem = await cartItemService.update(req.params.id, req.body);
    res.json(updatedItem);
  } catch (error) {
    res.status(404).json({ message: "Error al actualizar el item", error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const deletedItem = await cartItemService.remove(req.params.id);
    res.json({ message: "Item eliminado correctamente", item: deletedItem });
  } catch (error) {
    res.status(404).json({ message: "Error al eliminar el item", error: error.message });
  }
};
