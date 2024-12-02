const mongoose = require('mongoose');

// Listing Schema
const listingSchema = new mongoose.Schema({
    image: { type: [], required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    rating: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    badge: { type: String },
    description: { type: String, required: true },
    stock: { type: Number, required: true },
    reviews: { type: [String] },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
    variants: { type: [], required: true }, // Array for product variations 
    highlightFeatures: { type: [], required: true }
});

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;
