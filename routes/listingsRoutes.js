const Seller = require("../Seller");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const express = require('express');
const User = require("../User");
const Listing = require("../Listing");
const router = express.Router();
const app = express()
const protectRoute = require('../middleware/sprotectRoute')

//listings route: Fetches All the listings available.
router.get('/listings', async (req, res) => {
    try {
        const listings = await Listing.find();
        res.status(200).json(listings);
    } catch (error) {
        res.status(500).send('Error fetching listings');
    }
})


//sellerlistings: Route allows to get listings by particular sellers.
router.post('/sellerlistings', protectRoute, async (req, res) => {
    const sellerId = req.sellerId; 
    try {
        const listings = await Listing.find({ sellerId });
        if (!listings || listings.length === 0) {
            return res.status(404).send('No listings found for this seller');
        }
        res.status(200).json(listings);
    }
    catch (error) {
        res.status(400).send(error);
    }
});


///listing/:id: Route allows to get one particular listing data.
router.get('/listing/:id', async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).send('Listing not found');
        }
        res.status(200).json(listing);
    } catch (error) {
        res.status(500).send('Error fetching listing');
    }
});


//Edit Listings Route: Used for editing listings. 
router.put('/editlisting', protectRoute, async (req, res) => {
    const { sellerId } = req.params;
    const { image, title, price, rating, originalPrice, badge, id, description, stock, reviews, variants, highlightFeatures } = req.body;

    try {
        const updatedListing = await Listing.findByIdAndUpdate(id, 
            { image, title, price, rating, originalPrice, badge, description, stock, reviews, variants, highlightFeatures }, { new: true });
        if (!updatedListing) {
            return res.status(404).send('Listing not found');
        }

        res.status(200).send('Listing updated successfully');
    } catch (error) {
        res.status(400).send(error);
    }
});


// Create Listing Route
router.post('/createlisting', protectRoute, async (req, res) => {
    const { image, title, price, rating, originalPrice, badge, description, stock, reviews, variants, highlightFeatures } = req.body;
    const sellerId = req.sellerId;
    const newListing = new Listing({ image, title, price, rating, originalPrice, badge, description, stock, reviews, sellerId, variants, highlightFeatures });
    try {
        await newListing.save(); res.status(201).send('Listing created successfully');
    } catch (error) {
        res.status(400).send(error);
    }
})


//deletelisting: Allows to delete listings by sellers.
router.delete('/deletelisting/:id', protectRoute, async (req, res) => {
    const { id } = req.params;
    const sellerId = req.sellerId;
    try {
        const listing = await Listing.findOneAndDelete({ _id: id, sellerId });
        if (!listing) {
            return res.status(404).send('Listing not found');
        }
        res.status(200).send('Listing deleted successfully');
    } catch (error) {
        res.status(400).send(error);
    }
})

module.exports = router


