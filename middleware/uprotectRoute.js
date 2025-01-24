// middleware/protectRoute.js
const jwt = require('jsonwebtoken');
const User = require('../User'); // Adjust the path as needed

const uprotectRoute = async (req, res, next) => {
    try {
        const token = req.body.token;
        if (!token) {
            return res.status(401).send('Unauthorized');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).send('Unauthorized');
        }

        req.user = user;
        req.userID = user._id;
        next();
    } catch (error) {
        console.log(error);
        res.status(401).send('Unauthorized');
    }
};

module.exports = uprotectRoute;
