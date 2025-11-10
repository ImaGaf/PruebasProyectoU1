const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true
    },
    products: {
        product: String,
        quantity: Number
    },
    total: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    deliveryAddress: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "En proceso"
    }
},
    {
        collection: "orders"
    });

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;