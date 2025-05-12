const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Seller Schema
const sellerSchema = new mongoose.Schema({
    sellerName: { type: String, required: true },
    shippingRange: { type: Number, required: true },
    agencyFulfilled: {type: Boolean, required: true},
    sellerFulfilled: {type: Boolean, required: true},
    email: {type: String},
    registrationFee: { type: Boolean, required: true },
    password: { type: String, required: true },
});


sellerSchema.pre('save', async function (next) {
    if (this.isModified('password') || this.isNew) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});


const Seller = mongoose.model('Seller', sellerSchema);

module.exports = Seller;
