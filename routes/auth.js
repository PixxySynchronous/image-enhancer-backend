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
router.post('/login', async (req, res) => {
  try {
    console.log("✅ LOGIN HIT");
    console.log("Request Body:", req.body);

    const user = await User.findOne({ EmailID: req.body.EmailID });
    console.log("User found:", user);

    if (!user) return res.status(400).json({ error: "User not found" });

    const passwordMatch = await bcrypt.compare(req.body.Password, user.Password);
    console.log("Password match:", passwordMatch);

    if (!passwordMatch) return res.status(400).json({ error: "Incorrect password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Server error");
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
