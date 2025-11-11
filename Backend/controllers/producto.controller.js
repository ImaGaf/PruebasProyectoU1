const productService = require("../services/productService");

exports.getAll = async (req, res) => {
    try {
        const products = await productService.getAllProducts();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        res.json(product);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const created = await productService.createProduct(req.body);
        res.status(201).json(created);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const updated = await productService.updateProduct(req.params.id, req.body);
        res.json(updated);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

exports.remove = async (req, res) => {
    try {
        const deleted = await productService.deleteProduct(req.params.id);
        res.json({ message: "Producto eliminado", product: deleted });
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};


exports.getAvailable = async (req, res) => {
    try {
        const products = await productService.getAvailableProducts();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getCustomDiscounted = async (req, res) => {
    try {
        const products = await productService.getCustomDiscountedProducts();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.purchase = async (req, res) => {
    try {
        const { idProduct } = req.params;
        const { quantity } = req.body;
        const result = await productService.purchaseProduct(idProduct, quantity);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};