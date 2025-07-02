const mongoose = require('mongoose');

// Get Mongo URI from env or fallback to local
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/imageenhancer";

const connectToMongo = async () => {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1); // Exit process if connection fails
    }
};

module.exports = connectToMongo;
