const Seller = require("../Seller");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const express = require('express');
const User = require("../User");
const Listing = require("../Listing");
const Order = require("../Order");
const router = express.Router();
const app = express()
const protectRoute = require('../middleware/sprotectRoute');
const { default: mongoose } = require("mongoose");

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


router.get('/featuredPosts', async (req, res) => {
    try {
        const count = await Listing.countDocuments();
        const listings = await Listing.find().skip(count - 4).limit(4);
        res.json(listings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching listings', error });
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

router.post('/pendingOrders',protectRoute, async (req, res) => {

    const sellerId = req.sellerId.toString();
    console.log(sellerId)
    if (!sellerId) {
        return res.status(400).send('sellerID parameter is required');
    }

    try {
        const query = { sellerID: sellerId, status: "pending" };
        const orders = await Order.find(query);
console.log(orders)
        res.status(200).json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching orders');
    }
});

router.post('/ongoingOrders', protectRoute, async (req, res) => {

    const sellerId = req.sellerId.toString();
    if (!sellerId) {
        return res.status(400).send('sellerID parameter is required');
    }

    try {
        const query = { sellerID: sellerId, status: "Accepted", status: "Sent To Ship", status: "Packaging"  };
        const orders = await Order.find(query);
        console.log(orders)
        res.status(200).json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching orders');
    }
});


router.put('/acceptOrder', protectRoute, async (req, res) => {
    try {
      const { orderID } = req.body;
      const update = { $set: { status: 'Accepted' } };
      const sid = req.sellerId.toString()
      const result = await Order.updateOne({status: "pending", sellerID: req.sellerId.toString()}, update);

      if (result.matchedCount === 0) {
        return res.status(404).send('Order not found or unauthorized access');
      }

      res.send('Order status updated to Accepted');
    } catch (err) {
      res.status(500).send(err);
    }
  });

router.put('/rejectOrder', protectRoute, async (req, res) => {
    try {
        const { orderID } = req.body;
        const update = { $set: { status: 'Rejected' } };
        const sid = req.sellerId.toString()
        const result = await Order.updateOne({ status: "pending", sellerID: req.sellerId.toString() }, update);

        if (result.matchedCount === 0) {
            return res.status(404).send('Order not found or unauthorized access');
        }

        res.send('Order status updated to Rejected');
    } catch (err) {
        res.status(500).send(err);
    }
});
module.exports = router


