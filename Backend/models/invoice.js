const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
    idInvoice: { type: String, required: true, unique: true },
    order: { type: String, required: true },
    issueDate: { type: Date, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, required: true },
    totalAmount: { type: Number, required: true }
}, {
    timestamps: true,
    collection: "invoices"
});

module.exports = mongoose.model('invoice', InvoiceSchema);