// middleware/protectRoute.js
const jwt = require('jsonwebtoken');
const Seller = require('../Seller'); // Adjust the path as needed

const protectRoute = async (req, res, next) => {
    try {
        const token = req.body.token;
        if (!token) {
            return res.status(401).send('Unauthorized');

        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await Seller.findById(decoded.id);

        if (!user) {
            return res.status(401).send('Unauthorized');
        }

        req.user = user;
         req.sellerId = user._id;
         console.log(req.sellerId)
        next();
    } catch (error) {
        console.log(error);
        res.status(401).send('Unauthorized');
    }
};

module.exports = protectRoute;
