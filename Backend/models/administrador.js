const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Counter = require("./counter");

const administratorSchema = new mongoose.Schema({
    idAdministrator: { type: Number, unique: true, index: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "administrator" },
}, {
    collection: "administrator",
    timestamps: true,
});

administratorSchema.pre("save", async function (next) {
    if (this.isNew) {
        const counter = await Counter.findByIdAndUpdate(
            { _id: "administratorId" },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this.idAdministrator = counter.seq;
    }
    next();
});

administratorSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

administratorSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Administrator", administratorSchema);