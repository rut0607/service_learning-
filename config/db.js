const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if MongoDB URI is defined
    if (!process.env.MONGO_URI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }
    
    console.log('Attempting to connect to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('MongoDB Connection Error:');
    console.error(`Message: ${error.message}`);
    
    if (error.name === 'MongoParseError') {
      console.error('Invalid MongoDB connection string format');
    } else if (error.name === 'MongoServerSelectionError') {
      console.error('Could not connect to any MongoDB server');
      console.error('Please check if MongoDB is running and the connection string is correct');
      
      // Display more detailed troubleshooting information
      console.log('\n=== MongoDB Connection Troubleshooting ===');
      console.log('1. Make sure MongoDB is installed and running on your system');
      console.log('   - For local MongoDB: Run "mongod" in a terminal');
      console.log('   - For Docker: Check if MongoDB container is running');
      console.log('\n2. Check your connection string in .env file:');
      console.log('   - For local MongoDB: MONGODB_URI=mongodb://localhost:27017/iskcon_ngo');
      console.log('   - For MongoDB Atlas: MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/iskcon_ngo');
      console.log('\n3. If using MongoDB Atlas:');
      console.log('   - Ensure you have replaced <username>, <password>, and <cluster> with your actual credentials');
      console.log('   - Verify your IP address is whitelisted in Atlas');
      console.log('   - Check if your network allows connections to MongoDB Atlas');
      console.log('\n4. For more help, visit: https://docs.mongodb.com/manual/administration/troubleshooting-connections/');
      console.log('===========================================\n');
    }
    
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    
    // Only log stack trace in development environment
    if (process.env.NODE_ENV !== 'production' && error.stack) {
      console.error('Stack trace:');
      console.error(error.stack);
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;