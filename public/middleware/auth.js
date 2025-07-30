const jwt = require('jsonwebtoken'); // Import jsonwebtoken to verify tokens

module.exports = function (req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token'); // Conventionally, tokens are sent in an 'x-auth-token' header

    // Check if not token
    if (!token) {
        // console.log('No token, authorization denied'); // For debugging
        return res.status(401).json({ msg: 'No token, authorization denied' }); // 401 Unauthorized
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify using your secret key

        // Attach user from token payload to the request object
        req.user = decoded.user; // The payload (decoded.user) contains { id, userType } from login
        // console.log('Token decoded, user:', req.user); // For debugging
        next(); // Pass control to the next middleware/route handler
    } catch (err) {
        // Token is not valid
        // console.log('Token is not valid:', err.message); // For debugging
        res.status(401).json({ msg: 'Token is not valid' }); // 401 Unauthorized
    }
};