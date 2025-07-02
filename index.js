require('dotenv').config(); // must be first


const connectToMongo = require('./db');

const express = require('express');
const cors = require('cors'); // <== ✅ Import cors

const app = express();
const port = 5000;

connectToMongo();

// Middleware
app.use(cors()); // <== ✅ Enable CORS
app.use(express.json());
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.originalUrl}`);
  next();
});


// Routes which are available
app.use('/api/auth', require('./routes/auth'));
app.use('/api/images', require('./routes/image'));

app.listen(port, () => {
  console.log(`Imageenhancer listening on port http://localhost:${port}`);
});
