const categoryService = require("../services/categoryService");

exports.getAll = async (req, res) => {
  try {
    const list = await categoryService.getAllCategories();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    res.json(category);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const created = await categoryService.createCategory(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updated = await categoryService.updateCategory(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await categoryService.deleteCategory(req.params.id);
    res.json({ message: "Category deleted", category: deleted });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};