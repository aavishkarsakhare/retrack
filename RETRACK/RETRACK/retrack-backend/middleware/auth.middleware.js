
const jwt = require('jsonwebtoken');

// Middleware to authenticate users
function authenticateToken(req, res, next) {

    // Get token from request headers
    const authHeader = req.headers['authorization'];

    // Extract the token
    const token = authHeader && authHeader.split(' ')[1];

    // If token is missing
    if (!token) {
        return res.status(401).json({
            message: 'Access denied. Token required.'
        });
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {

        if (err) {
            return res.status(403).json({
                message: 'Invalid or expired token.'
            });
        }

        // Store user information in request
        req.user = user;

        // Allow request to continue
        next();
    });
}

module.exports = authenticateToken;
