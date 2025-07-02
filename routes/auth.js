const express = require('express');
const bcrypt = require("bcryptjs");
const { body, validationResult } = require('express-validator');
const router = express.Router();
const User = require('../modules/USER');
var jwt = require('jsonwebtoken');
var fetchUser = require('../Middleware/fetchUser');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// Route 1: Creating a new user using: POST "/api/auth/Createuser"
router.post('/Createuser', [
    body('Name', "Enter a valid name").isLength({ min: 3 }),
    body('EmailID', "Enter a valid email").isEmail(),
    body('Password', "Password must be at least 5 characters").isLength({ min: 5 }),
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    try {
        let user = await User.findOne({ EmailID: req.body.EmailID });
        if (user) {
            return res.status(400).json({ success, error: "Sorry, a user with this email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.Password, salt);

        user = await User.create({
            Name: req.body.Name,
            Password: secPass,
            EmailID: req.body.EmailID,
            images: [] // ✅ initialize empty image array
        });

        const data = {
            user: {
                id: user.id
            }
        };

        const authToken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authToken });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success, error: "Some error occurred" });
    }
});

// Route 2: Authenticating a user using: POST "/api/auth/login"
router.post('/login', [
    body('EmailID', "Enter a valid email").isEmail(),
    body('Password', 'Password cannot be blank').exists()
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    const { EmailID, Password } = req.body;

    try {
        let user = await User.findOne({ EmailID });
        if (!user) {
            return res.status(400).json({ success, error: "Enter correct information" });
        }

        const passwordCompare = await bcrypt.compare(Password, user.Password);
        if (!passwordCompare) {
            return res.status(400).json({ success, error: "Enter correct information" });
        }

        const data = {
            user: {
                id: user.id
            }
        };

        const authToken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authToken });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success, error: "Some error occurred" });
    }
});

// Route 3: Getting logged in user details using: POST "/api/auth/getuser"
router.post('/getuser', fetchUser, async (req, res) => {
    try {
        let userID = req.user.id;
        const user = await User.findById(userID).select("-Password");
        res.send(user);
    } catch (error) {
        console.log(error);
   res.status(500).json({ error: "Internal error occurred" });
    }
});

module.exports = router;
