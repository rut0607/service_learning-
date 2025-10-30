require('dotenv').config({ path: './.env' });
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const Event = require('../models/Event');
const connectDB = require('../config/db');

// Generate hashed password
const generateHashedPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Sample users data
const users = [
  {
    name: 'Radha Das',
    email: 'radha.das@iskcon.org',
    password: 'password123', // Will be hashed before saving
    interests: ['kirtan', 'festival', 'bhagavad-gita'],
    role: 'user'
  },
  {
    name: 'Krishna Kumar',
    email: 'krishna.kumar@iskcon.org',
    password: 'password123', // Will be hashed before saving
    interests: ['lecture', 'philosophy', 'bhagavad-gita'],
    role: 'user'
  },
  {
    name: 'Govinda Singh',
    email: 'govinda.singh@iskcon.org',
    password: 'password123', // Will be hashed before saving
    interests: ['festival', 'prasadam', 'service'],
    role: 'admin'
  },
  {
    name: 'Nityananda Prabhu',
    email: 'nityananda@iskcon.org',
    password: 'password123',
    interests: ['kirtan', 'outreach', 'book-distribution'],
    role: 'user'
  },
  {
    name: 'Gaura Devi',
    email: 'gaura.devi@iskcon.org',
    password: 'password123',
    interests: ['deity-worship', 'garland-making', 'temple-service'],
    role: 'user'
  },
  {
    name: 'Bhakti Sharma',
    email: 'bhakti.sharma@iskcon.org',
    password: 'password123',
    interests: ['book-distribution', 'preaching', 'youth-programs'],
    role: 'user'
  },
  {
    name: 'Madhava Das',
    email: 'madhava.das@iskcon.org',
    password: 'password123',
    interests: ['temple-management', 'fundraising', 'community-outreach'],
    role: 'admin'
  },
  {
    name: 'Tulsi Devi',
    email: 'tulsi.devi@iskcon.org',
    password: 'password123',
    interests: ['gardening', 'eco-farming', 'cow-protection'],
    role: 'user'
  }
];

// Sample events data
const events = [
  {
    title: 'Janmashtami Festival',
    category: 'festival',
    date: new Date(new Date().setDate(new Date().getDate() + 5)),
    description: 'Celebration of Lord Krishna\'s appearance day with kirtan, abhishek, and feast.',
    location: 'ISKCON Temple Main Hall',
    link: '/events/123'
  },
  {
    title: 'Evening Kirtan',
    category: 'kirtan',
    date: new Date(new Date().setDate(new Date().getDate() + 7)),
    description: 'Blissful evening kirtan led by renowned kirtaniyas.',
    location: 'ISKCON Temple Kirtan Hall',
    link: '/events/124'
  },
  {
    title: 'Bhagavad Gita Study Group',
    category: 'bhagavad-gita',
    date: new Date(new Date().setDate(new Date().getDate() + 10)),
    description: 'Weekly study group discussing chapters of Bhagavad Gita.',
    location: 'ISKCON Temple Library',
    link: '/events/125'
  },
  {
    title: 'Philosophy Workshop',
    category: 'philosophy',
    date: new Date(new Date().setDate(new Date().getDate() + 12)),
    description: 'Deep dive into Vaishnava philosophy and its practical applications.',
    location: 'ISKCON Temple Conference Room',
    link: '/events/126'
  },
  {
    title: 'Prasadam Cooking Class',
    category: 'prasadam',
    date: new Date(new Date().setDate(new Date().getDate() + 15)),
    description: 'Learn to cook delicious prasadam dishes with traditional recipes.',
    location: 'ISKCON Temple Kitchen',
    link: '/events/127'
  },
  {
    title: 'Ratha Yatra Festival',
    category: 'festival',
    date: new Date(new Date().setDate(new Date().getDate() + 20)),
    description: 'Annual chariot festival celebrating Lord Jagannath, Baladeva, and Subhadra Devi.',
    location: 'City Center Park',
    link: '/events/128'
  },
  {
    title: 'Deity Worship Workshop',
    category: 'deity-worship',
    date: new Date(new Date().setDate(new Date().getDate() + 8)),
    description: 'Learn the principles and practices of deity worship according to Vaishnava tradition.',
    location: 'ISKCON Temple Deity Room',
    link: '/events/129'
  },
  {
    title: 'Harinama Sankirtana',
    category: 'outreach',
    date: new Date(new Date().setDate(new Date().getDate() + 3)),
    description: 'Public chanting of the holy names in the city center to spread Krishna consciousness.',
    location: 'Downtown Main Street',
    link: '/events/130'
  },
  {
    title: 'Govardhan Puja',
    category: 'festival',
    date: new Date(new Date().setDate(new Date().getDate() + 25)),
    description: 'Celebration of Lord Krishna lifting Govardhan Hill, with a feast and hill made of prasadam.',
    location: 'ISKCON Temple Courtyard',
    link: '/events/131'
  },
  {
    title: 'Tulsi Puja Workshop',
    category: 'gardening',
    date: new Date(new Date().setDate(new Date().getDate() + 9)),
    description: 'Learn about the importance of Tulsi Devi and how to care for Tulsi plants.',
    location: 'ISKCON Temple Garden',
    link: '/events/132'
  },
  {
    title: 'Book Distribution Training',
    category: 'book-distribution',
    date: new Date(new Date().setDate(new Date().getDate() + 6)),
    description: 'Training session for distributing Srila Prabhupada\'s books to the public.',
    location: 'ISKCON Temple Training Room',
    link: '/events/133'
  },
  {
    title: 'Youth Empowerment Retreat',
    category: 'youth-programs',
    date: new Date(new Date().setDate(new Date().getDate() + 18)),
    description: 'Weekend retreat for youth to learn leadership skills and spiritual principles.',
    location: 'ISKCON Retreat Center',
    link: '/events/134'
  },
  {
    title: 'Goshala Visit & Cow Protection Talk',
    category: 'cow-protection',
    date: new Date(new Date().setDate(new Date().getDate() + 14)),
    description: 'Visit the temple\'s cow protection facility and learn about the importance of cow protection in Vedic culture.',
    location: 'ISKCON Goshala',
    link: '/events/135'
  },
  {
    title: 'Community Fundraising Dinner',
    category: 'fundraising',
    date: new Date(new Date().setDate(new Date().getDate() + 22)),
    description: 'Elegant dinner event to raise funds for temple expansion projects.',
    location: 'ISKCON Temple Banquet Hall',
    link: '/events/136'
  },
  {
    title: 'Eco-Farming Workshop',
    category: 'eco-farming',
    date: new Date(new Date().setDate(new Date().getDate() + 16)),
    description: 'Learn sustainable farming techniques based on Vedic principles of land stewardship.',
    location: 'ISKCON Farm Community',
    link: '/events/137'
  }
];

// Seed function
const seedDatabase = async () => {
  let connection;
  try {
    // Connect to database
    connection = await connectDB();
    console.log('Connected to database successfully');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Event.deleteMany({});
    console.log('Existing data cleared');
    
    // Hash passwords for users
    console.log('Preparing user data with hashed passwords...');
    const usersWithHashedPasswords = await Promise.all(
      users.map(async (user) => {
        return {
          ...user,
          password: await generateHashedPassword(user.password)
        };
      })
    );
    
    // Insert new data
    console.log('Inserting users...');
    const createdUsers = await User.insertMany(usersWithHashedPasswords);
    console.log(`${createdUsers.length} users created successfully`);
    
    console.log('Inserting events...');
    const createdEvents = await Event.insertMany(events);
    console.log(`${createdEvents.length} events created successfully`);
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:');
    console.error(`Message: ${error.message}`);
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    if (error.stack) {
      console.error('Stack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    // Close the connection if it was established
    if (connection) {
      try {
        await mongoose.disconnect();
        console.log('Database connection closed');
      } catch (err) {
        console.error('Error closing database connection:', err.message);
      }
    }
  }
};

/**
 * Displays helpful information about MongoDB connection issues
 */
const displayMongoDBHelp = () => {
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
};

// Run the seed function
try {
  seedDatabase();
} catch (error) {
  console.error('Fatal error starting the seeding process:', error.message);
  displayMongoDBHelp();
  process.exit(1);
}