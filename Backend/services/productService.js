const Product = require("../models/product");

exports.getAllProducts = async () => {
    return await Product.find({});
};

exports.getProductById = async (id) => {
    const product = await Product.findById(id);
    if (!product) throw new Error("Producto no encontrado");
    return product;
};

exports.createProduct = async (data) => {
    const newProduct = new Product(data);
    return await newProduct.save();
};

exports.updateProduct = async (id, data) => {
    const updated = await Product.findByIdAndUpdate(id, data, { new: true });
    if (!updated) throw new Error("Producto no encontrado");
    return updated;
};

exports.deleteProduct = async (id) => {
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) throw new Error("Producto no encontrado");
    return deleted;
};

exports.getAvailableProducts = async () => {
    return await Product.find({ stock: { $gt: 0 } });
};

exports.getCustomDiscountedProducts = async () => {
    const customProducts = await Product.find({ custom: true });
    return customProducts.map(p => ({
        idProduct: p.idProduct,
        name: p.name,
        description: p.description,
        originalPrice: p.price,
        discountedPrice: +(p.price * 0.9).toFixed(2),
        stock: p.stock,
        cathegory: p.cathegory,
        custom: p.custom
    }));
};

exports.purchaseProduct = async (idProduct, quantity) => {
    if (!quantity || quantity <= 0) {
        throw new Error("Cantidad inválida");
    }

    const product = await Product.findOne({ idProduct });
    if (!product) {
        throw new Error("Producto no encontrado");
    }

    if (product.stock < quantity) {
        throw new Error("Stock insuficiente");
    }

    product.stock -= quantity;
    await product.save();

    const totalPrice = +(product.price * quantity).toFixed(2);

    return {
        message: "Compra realizada con éxito",
        product: product.name,
        quantity,
        totalPrice
    };
};