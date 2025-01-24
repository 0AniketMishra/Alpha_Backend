const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const express = require('express');
const cors = require('cors');
const app = express()
const port = 3001
const authRoutes = require('./routes/authRoutes')
const listingsRoutes = require('./routes/listingsRoutes')
const paymentRoutes = require('./routes/paymentRoutes')


dotenv.config();
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () { console.log('Connected to MongoDB'); });


app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true, }));
app.use(listingsRoutes)
app.use(authRoutes)
app.use(paymentRoutes)

// app.use(cors({
//     origin: 'http://shadowi5jhpezl3f7euatqpr4virojhygtphv7gn74ymeugi7srxkkyd.onion',
//      methods: 'GET, POST, OPTIONS,PUT',
//       allowedHeaders: ['DNT', 'User-Agent', 'X-Requested-With', 'If-Modified-Since', 'Cache-Control', 'Content-Type'], credentials: true }));

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})