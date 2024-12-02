const mongoose = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const express = require('express');
const cors = require('cors');
const User = require('./User');
const Seller = require('./Seller');
const Listing = require('./Listing');
const app = express()
const protectRoute = require('./middleware/sprotectRoute')

dotenv.config();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () { console.log('Connected to MongoDB'); });

app.use(express.json());
app.use(cookieParser());


// app.use(cors({
//     origin: 'http://shadowi5jhpezl3f7euatqpr4virojhygtphv7gn74ymeugi7srxkkyd.onion',
//      methods: 'GET, POST, OPTIONS',
//       allowedHeaders: ['DNT', 'User-Agent', 'X-Requested-With', 'If-Modified-Since', 'Cache-Control', 'Content-Type'], credentials: true }));


app.use(cors({
    origin: true, credentials: true,
}));

app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = new User({ username, password: password });
        await user.save(); res.status(201).send('User registered successfully');
    } catch (error) {
        res.status(500).send(error.message);
    }
})

app.get('/protected', async (req, res) => {
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
app.get('/sprotected', async (req, res) => {
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


app.post('/login', async (req, res) => {
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
app.post('/registerseller', async (req, res) => {
    console.log("I ran")
    const { sellerName, shippingRange,email, agencyFulfilled, sellerFulfilled, registrationFee, password } = req.body;
    const collection = db.collection('sellers');
     const sellerNumber = await collection.countDocuments()+1;
    const newSeller = new Seller({ sellerName,sellerNumber,email, shippingRange, agencyFulfilled, sellerFulfilled, registrationFee, password });
    try {
        await newSeller.save(); res.status(201).send('Seller registered successfully');
    }
    catch (error) {
        console.log(error)

    }
})


app.post('/sellerlogin', async (req, res) => {
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

// Create Listing Route
app.post('/createlisting',protectRoute, async (req, res) => {
    const { image, title, price, rating, originalPrice, badge, description, stock, reviews, sellerId,variants,highlightFeatures } = req.body;
    const newListing = new Listing({ image, title, price, rating, originalPrice, badge, description, stock, reviews, sellerId,variants,highlightFeatures });
    try {
        await newListing.save(); res.status(201).send('Listing created successfully');
    } catch (error) {
        res.status(400).send(error);
    }
})

app.get('/listings', async (req, res) => {
    try {
        const listings = await Listing.find();
        res.status(200).json(listings);
    } catch (error) {
        res.status(500).send('Error fetching listings');
    }
})

app.get('/listing/:id', async (req, res) => {
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

const port = 3001

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})