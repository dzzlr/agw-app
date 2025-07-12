# User Service

A microservice for user authentication and management, part of the AGW application.

## Overview

This service handles user authentication, providing secure login functionality with JWT token generation. It's built with Node.js, Express, and PostgreSQL.

## Features

- User authentication (login)
- JWT token generation
- Password hashing with bcrypt
- Audit logging
- Database migrations and seeding

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- JWT for authentication
- bcrypt for password hashing
- node-pg-migrate for database migrations

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd user-service
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   ```
   cp .env.example .env
   ```
   Edit the `.env` file with your database credentials and other configuration.

4. Run database migrations:
   ```
   npm run migrate up
   ```

5. Seed the database with initial users:
   ```
   npm run seed
   ```

## Running the Application

### Development mode
```
npm run dev
```

### Production mode
```
npm start
```

The service will be available at `http://localhost:5000` (or the port specified in your `.env` file).

## API Endpoints

### Authentication

- **POST /api/auth/login** - User login
  - Request body: `{ "username": "user", "password": "password" }`
  - Response: JWT token and user information

## Database Schema

### Users Table

| Column     | Type         | Description                    |
|------------|--------------|--------------------------------|
| id         | SERIAL       | Primary key                    |
| username   | VARCHAR(50)  | Unique username                |
| password   | VARCHAR(255) | Hashed password                |
| email      | VARCHAR(100) | User email                     |
| name       | VARCHAR(100) | Full name                      |
| division   | VARCHAR(50)  | User's division/department     |
| role       | VARCHAR(50)  | User role (admin, user, etc.)  |
| created_at | TEXT         | Creation timestamp             |
| updated_at | TEXT         | Last update timestamp          |

## Environment Variables

| Variable       | Description                      | Default        |
|----------------|----------------------------------|----------------|
| PGHOST         | PostgreSQL host                  | localhost      |
| PGPORT         | PostgreSQL port                  | 5432           |
| PGUSER         | PostgreSQL username              | -              |
| PGPASSWORD     | PostgreSQL password              | -              |
| PGDATABASE     | PostgreSQL database name         | -              |
| DATABASE_URL   | PostgreSQL connection string     | -              |
| APP_SECRET_KEY | Secret key for JWT generation    | supersecretkey |
| BACKEND_PORT   | Port for the service to run on   | 5000           |

## Scripts

- `npm start` - Start the application
- `npm run dev` - Start the application with nodemon (auto-reload)
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed the database with initial data

## Project Structure

```
user-service/
├── migrations/         # Database migrations
├── seeders/            # Database seed data
├── src/
│   ├── controllers/    # Request handlers
│   ├── middlewares/    # Express middlewares
│   ├── routes/         # API routes
│   ├── services/       # Business logic and external services
│   ├── utils/          # Utility functions
│   └── index.js        # Application entry point
├── .env                # Environment variables (not in version control)
├── .env.example        # Example environment variables
└── package.json        # Project dependencies and scripts
```

## License

[Add your license information here]
