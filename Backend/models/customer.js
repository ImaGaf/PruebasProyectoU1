const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Counter = require("./counter");

const customerSchema = new mongoose.Schema(
    {
        idCustomer: { type: Number, unique: true, index: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phone: { type: String, required: true },
        billingAddress: { type: String, required: true },
        shippingAddress: { type: String },
        role: { type: String, default: "customer" },
    },
    {
        collection: "customers",
        timestamps: true,
    }
);

// Auto-incrementar idCustomer al crear nuevo customer
customerSchema.pre("save", async function (next) {
    if (this.isNew) {
        const counter = await Counter.findByIdAndUpdate(
            { _id: "customerId" },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this.idCustomer = counter.seq;
    }
    next();
});

// Hashear contraseña antes de guardar
customerSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Método para comparar contraseña (login)
customerSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;