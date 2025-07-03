const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables

// JWT secret — now coming from .env, fallback included
const JWT_SECRET = process.env.JWT_SECRET || 'Iamagoodboy$';

// Middleware function to fetch user from JWT token
const fetchUser = (req, res, next) => {
    // Get the token from the request header
    // Add the header "auth-token" with its value as the token you get on logging in
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send({ error: "Please authenticate using a valid token" });
    }

    try {
        // Verify the token using JWT_SECRET
        // 'data' will store the payload that was used while signing the token
        const data = jwt.verify(token, JWT_SECRET);

        // 'data.user' contains the user info (e.g., user ID)
        // Attach it to req so we can access it later
        req.user = { id: data.id };

        // Proceed to the next middleware/route handler
        next();
    } catch (error) {
        return res.status(401).send({ error: "Invalid token" });
    }
};

module.exports = fetchUser;
