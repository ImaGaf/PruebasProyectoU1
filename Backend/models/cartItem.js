const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    subtotal: {
        type: Number,
        required: true
    }
}, {
    collection: "cartItems",
    timestamps: true
});

const CartItem = mongoose.model("CartItem", cartItemSchema);

module.exports = CartItem;
