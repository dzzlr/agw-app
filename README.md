# Policy Document Service

A microservice for policy document management, part of the AGW application.

## Overview

This service handles policy document management, providing functionality to create and retrieve policy documents. It's built with Node.js, Express, and uses file-based JSON storage.

## Features

- Policy document creation
- Policy document retrieval
- Filtering by category and name
- Authentication with JWT
- Role-based access control

## Tech Stack

- Node.js
- Express.js
- JWT for authentication
- File-based JSON storage

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd policy-doc-service
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   ```
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration.

## Running the Application

### Development mode
```
npm run dev
```

### Production mode
```
npm start
```

The service will be available at `http://localhost:3001` (or the port specified in your `.env` file).

## Authentication

This API uses JWT (JSON Web Token) for authentication. All endpoints require a valid Bearer token in the Authorization header.

```
Authorization: Bearer <your_jwt_token>
```

The JWT token should contain a `role` claim that determines the user's access level.

### Role-Based Access Control

- **Read Operations** (GET endpoints): Accessible to users with roles: 'master', 'it_management', 'it_governance', 'it_architecture'
- **Write Operations** (POST, PUT, DELETE endpoints): Accessible only to users with role: 'it_governance'

## API Endpoints

### Policy Document Management

- **GET /api/policy** - Get all policy documents
  - Access: Requires authentication with roles 'master', 'it_management', 'it_governance', 'it_architecture'
  - Query parameters:
    - `category`: Filter by category ('kebijakan', 'sop', 'pedoman', 'petunjuk_teknis')
    - `name`: Search by name
  - Response: List of policy documents

- **GET /api/policy/:id** - Get a policy document by ID
  - Access: Requires authentication with roles 'master', 'it_management', 'it_governance', 'it_architecture'
  - Response: Policy document details

- **POST /api/policy** - Create a new policy document
  - Access: Requires authentication with role 'it_governance'
  - Request body:
    ```json
    {
      "name": "Information Security Policy",
      "category": "kebijakan",
      "doc_no": "KBJ-2025-001",
      "created_at": "2025-07-12T14:00:00Z"  // Optional, defaults to current date
    }
    ```
  - Response: Created policy document

- **PUT /api/policy/:id** - Update a policy document
  - Access: Requires authentication with role 'it_governance'
  - Request body (all fields optional):
    ```json
    {
      "name": "Updated Security Policy",
      "category": "sop",
      "doc_no": "SOP-0002-2025",
      "created_at": "2025-07-12T14:00:00Z"
    }
    ```
  - Response: Updated policy document

- **DELETE /api/policy/:id** - Delete a policy document
  - Access: Requires authentication with role 'it_governance'
  - Response: Empty object with success status

## Policy Document Schema

| Field       | Type     | Description                                                |
|-------------|----------|------------------------------------------------------------|
| id          | Number   | Unique identifier                                          |
| doc_no      | String   | Document number/reference (user-provided)                  |
| name        | String   | Name of the policy                                         |
| category    | String   | Category ('kebijakan', 'sop', 'pedoman', 'petunjuk_teknis')|
| created_at  | Date     | Creation timestamp                                         |

## Environment Variables

| Variable       | Description                      | Default        |
|----------------|----------------------------------|----------------|
| PORT           | Port for the service to run on   | 3001           |
| NODE_ENV       | Environment (development/production) | development |
| APP_SECRET_KEY | Secret key for JWT verification (must match the key used to sign tokens) | supersecretkey |

> **Important**: For production use, always change the default APP_SECRET_KEY to a strong, unique value and keep it secure.

## Project Structure

```
policy-doc-service/
├── data/              # JSON data storage
├── src/
│   ├── controllers/   # Request handlers
│   ├── middleware/    # Express middlewares
│   ├── models/        # Data models
│   ├── routes/        # API routes
│   ├── utils/         # Utility functions
│   └── index.js       # Application entry point
├── .env               # Environment variables (not in version control)
├── .env.example       # Example environment variables
└── package.json       # Project dependencies and scripts
```
