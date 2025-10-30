const mongoose = require('mongoose');
const { sendEmail } = require('../utils/emailService');
const User = require('../models/User');
const Event = require('../models/Event');
const { connectDB } = require('../config/db');
require('dotenv').config();

// Format date for display
const formatDate = (dateString) => {
  const options = { weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Generate HTML content for email
const generateEmailHTML = (user, matchedEvents) => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  
  // Email header
  let htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h1 style="color: #FF6347; text-align: center; margin-bottom: 30px; border-bottom: 2px solid #FFD700; padding-bottom: 10px;">Your Upcoming Festival Events!</h1>
      <p style="font-size: 16px; line-height: 1.5;">Hello ${user.name || 'Devotee'},</p>
      <p style="font-size: 16px; line-height: 1.5;">We're excited for you to join us for your matched events!</p>
  `;
  
  // Display matched events
  if (matchedEvents.length > 0) {
    matchedEvents.forEach(event => {
      const formattedDate = formatDate(event.date);
      
      // Create visually distinct block for each event
      htmlContent += `
        <div style="margin: 25px 0; padding: 15px; border-radius: 8px; border-left: 5px solid #FF6347; background-color: #FFF8F6; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          <div style="background-color: #FF6347; color: white; display: inline-block; padding: 5px 10px; border-radius: 4px; font-weight: bold; margin-bottom: 10px;">
            ${formattedDate}
          </div>
          
          <h2 style="color: #333; margin: 10px 0; font-size: 20px;">${event.title}</h2>
          
          <p style="color: #555; margin: 10px 0; line-height: 1.5;">
            ${event.description}
          </p>
          
          <a href="${baseUrl}${event.link}" style="display: inline-block; background-color: #FFD700; color: #333; text-decoration: none; padding: 8px 15px; border-radius: 4px; margin-top: 10px; font-weight: bold;">
            View Details
          </a>
        </div>
      `;
    });
  } else {
    htmlContent += `<p style="font-style: italic; color: #666;">No upcoming events match your interests at this time.</p>`;
  }
  
  // Email footer
  htmlContent += `
      <p style="margin-top: 20px; font-weight: bold;">Hare Krishna!</p>
      <p style="color: #666;">ISKCON Events Team</p>
    </div>
  `;
  
  return htmlContent;
};

// Main function to send notifications
const sendNotifications = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Fetch all users and events
    const users = await User.find({});
    const events = await Event.find({ date: { $gte: new Date() } }).sort('date');
    
    console.log(`Found ${users.length} users and ${events.length} upcoming events.\n`);
    
    // Process each user
    for (const user of users) {
      // Match events with user interests
      const matchedEvents = events.filter(event => 
        user.interests.includes(event.category)
      );
      
      // Generate email content and send
      const htmlContent = generateEmailHTML(user, matchedEvents);
      const subject = 'Your Upcoming Festival Events!';
      
      try {
        // Send test email to specified address from environment variable
        await sendEmail(process.env.EMAIL_USER, subject, htmlContent);
        console.log(`Test email sent successfully to ${process.env.EMAIL_USER}`);
      } catch (error) {
        console.error(`Failed to send test email to ${process.env.EMAIL_USER}:`, error.message);
      }
    }
    
    // Disconnect from database
    await mongoose.disconnect();
    console.log('Notifications process completed.');
    
  } catch (error) {
    console.error(`Error sending notifications: ${error.message}`);
    process.exit(1);
  }
};

// Run the notification function
sendNotifications();
