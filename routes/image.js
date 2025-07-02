const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Middleware to authenticate user
const fetchUser = require('../Middleware/fetchUser');

// Mongoose model for storing image information
const Image = require('../modules/IMAGE');

// Utility function that uploads an image to Cloudinary from a given URL
const uploadImageFromURL = require('../Utils/uploadImageFromURL');


// Route 1: Fetch all images saved by the currently authenticated user
// Method: GET
// Endpoint: /api/images/fetchallimages
router.get('/fetchallimages', fetchUser, async (req, res) => {
    try {
        // Find all images uploaded by this user, sorted by most recent
        const images = await Image.find({ user: req.user.id }).sort({ uploadedAt: -1 });
        res.json(images);
    } catch (error) {
        console.error(error.message);
         res.status(500).json({ error: "Internal error occurred" });
    }
});


// Route 2: Add a new image by uploading a TechHK image URL to Cloudinary
// Method: POST
// Endpoint: /api/images/addimage
router.post('/addimage', fetchUser, [
    // Validate that imageUrl is a valid URL
    body('imageUrl', 'Image URL cannot be empty or invalid').isURL()
], async (req, res) => {
    const errors = validationResult(req);

    // If validation fails, return error response
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { imageUrl } = req.body;

        // Upload the image from the provided URL to Cloudinary
        const cloudUrl = await uploadImageFromURL(imageUrl);

        // Create a new image document with the permanent Cloudinary URL
        const newImage = new Image({
            user: req.user.id,
            url: cloudUrl,
            uploadedAt: new Date()
        });

        // Save the image record to the database
        const savedImage = await newImage.save();

        // Send back the saved image as response
        res.json({ message: 'Image saved successfully', image: savedImage });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Cloudinary error occurred" });
    }
});


// Route 3: Delete an image that belongs to the authenticated user
// Method: DELETE
// Endpoint: /api/images/deleteimage/:id
router.delete('/deleteimage/:id', fetchUser, async (req, res) => {
    try {
        // Find the image by ID from the database
        const image = await Image.findById(req.params.id);

        // If the image is not found, return 404 error
        if (!image) {
            return res.status(404).send("Image not found");
        }

        // Ensure the image belongs to the logged-in user
        if (image.user.toString() !== req.user.id) {
            return res.status(401).send("Not allowed");
        }

        // Delete the image document from the database
        await Image.findByIdAndDelete(req.params.id);

        // Return success response
        res.json({ Success: "Image has been deleted", image });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal error occurred");
    }
});


// Export the router so it can be used in the main server file
module.exports = router;
