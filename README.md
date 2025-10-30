# ISKCON NGO Web Application

A web application for ISKCON NGO to manage events, users, and matches.

## Features

- User authentication (register, login, profile management)
- Event management
- Interest-based event matching
- Admin dashboard

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env` (or create a new `.env` file)
   - Update the MongoDB connection string and other variables as needed

### Database Configuration

#### Local MongoDB

1. Make sure MongoDB is installed and running on your system
2. Update the `.env` file with your local MongoDB connection string:
   ```
   MONGODB_URI=mongodb://localhost:27017/iskcon_ngo
   ```

#### MongoDB Atlas

1. Create a MongoDB Atlas account and set up a cluster
2. Get your connection string from MongoDB Atlas
3. Update the `.env` file with your Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/iskcon_ngo?retryWrites=true&w=majority
   ```
   (Replace `<username>`, `<password>`, and `<cluster>` with your actual credentials)

### Seeding the Database

To populate the database with sample data:

```
node scripts/seedData.js
```

This will create sample users and events in the database.

### Running the Application

```
npm start
```

The application will be available at http://localhost:3000

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user profile

### Users

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Events

- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create new event (admin only)
- `PUT /api/events/:id` - Update event (admin only)
- `DELETE /api/events/:id` - Delete event (admin only)

### Matches

- `GET /api/matches` - Get events matching user interests

## License

MIT