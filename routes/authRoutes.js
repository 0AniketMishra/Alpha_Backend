const Seller = require("../Seller");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const express = require('express');
const User = require("../User");
const router = express.Router();
const app = express()

//Seller Login Route.
router.post('/sellerlogin', async (req, res) => {
    try {
        const { sellerName, password } = req.body;
        const seller = await Seller.findOne({ sellerName });
        console.log(seller)
        if (seller == null)
            return res.status(401).send('Invalid credentials');
        else {
            const isMatch = await bcrypt.compare(password, seller.password);
            if (isMatch == false)
                return res.status(401).send('Invalid credentials');
            else {
                const token = jwt.sign({ id: seller._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
                res.json({ token });
            }
        }
    } catch (error) {
        console.log(error.message);
    }
});


//Register route: for Sellers
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = new User({ username, password: password });
        await user.save(); res.status(201).send('User registered successfully');
    } catch (error) {
        res.status(500).send(error.message);
    }
})


//protected route for buyers: takes the token and verifies it.
router.get('/protected', async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        res.send(user._id);
    }
    catch (error) {
        console.log(error)
        res.status(401).send('Unauthorized');
    }
});


//Seller Protected Route: takes the token from the seller and verifies it.
router.get('/sprotected', async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await Seller.findById(decoded.id);
        res.send(user._id);
    }
    catch (error) {
        console.log(error)
        res.status(401).send('Unauthorized');
    }
});


//Login Route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (user == null)
            return res.status(401).send('Invalid credentials');
        else {
            const isMatch = await user.comparePassword(password);
            if (isMatch == false)
                return res.status(401).send('Invalid credentials');
            else {
                const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
                res.json({ token });
            }
        }
    } catch (error) {
        console.log(error.message);
    }
});


// Registration Route
router.post('/registerseller', async (req, res) => {
    const { sellerName, shippingRange, email, agencyFulfilled, sellerFulfilled, registrationFee, password } = req.body;
    const newSeller = new Seller({ sellerName, email, shippingRange, agencyFulfilled, sellerFulfilled, registrationFee, password });
    try {
        await newSeller.save(); res.status(201).send('Seller registered successfully');
    }
    catch (error) {
        res.status(500).send(error)
    }
})


module.exports = router
