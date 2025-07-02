// Import the axios library for making HTTP requests
const axios = require('axios');

// Import the configured Cloudinary instance
const cloudinary = require('../Utils/cloudinary');
// This function takes a public image URL (e.g., from TechHK),
// downloads the image, and uploads it to Cloudinary.
const uploadImageFromURL = async (url) => {
  // Step 1: Download the image data from the provided URL
  // We use `responseType: 'arraybuffer'` to get raw binary data
  const response = await axios.get(url, { responseType: 'arraybuffer' });

  // Step 2: Convert the binary data to a Base64 string
  const base64 = Buffer.from(response.data).toString('base64');

  // Step 3: Format it into a valid Data URI (used by Cloudinary)
  const dataURI = `data:image/jpeg;base64,${base64}`;

  // Step 4: Upload the Base64 Data URI to Cloudinary
  const result = await cloudinary.uploader.upload(dataURI, {
    folder: 'imageenhancer', // This stores the image inside a "imageenhancer/" folder in your Cloudinary account
  });

  // Step 5: Return the public URL of the uploaded image
  return result.secure_url;
};
// Export the function so it can be used in your routes or controllers
module.exports = uploadImageFromURL;
