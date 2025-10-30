require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const { body } = require('express-validator');
const { validateRequest } = require('./middleware/validators');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB()
  .then(() => {
    console.log('MongoDB connection successful');
  })
  .catch(err => {
    console.error('MongoDB connection failed in app.js:', err);
  });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

// Mount routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/events', require('./routes/events'));
app.use('/api/matches', require('./routes/matches'));

// Basic route
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: './public' });
});

// API routes are now modularized in separate route files

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});