const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    paymentID: { type: Number, required: true, unique: true },
    order: { type: String, required: true }, // referenciar ID de Order si se implementa
    amount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    status: { type: String, required: true }
}, {
    collection: "payments"
});

module.exports = mongoose.model("Payment", paymentSchema);