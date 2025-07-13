# Audit Service

A comprehensive backend service for managing audit findings, reports, and related information. This service provides secure RESTful APIs for creating, retrieving, updating, and deleting audit data with role-based access control.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Authentication & Authorization](#authentication--authorization)
- [Database Schema](#database-schema)
- [Setup & Installation](#setup--installation)
- [Development](#development)
- [Production](#production)
- [Database Migration](#database-migration)

## Features

- **Comprehensive Audit Management**
  - Track audit findings with detailed information
  - Manage different audit types (internal, external, regulatory)
  - Document root causes and recommendations
  - Monitor commitment dates and responsible persons

- **Security & Access Control**
  - JWT-based authentication
  - Role-based access control
  - Protected API endpoints
  - Audit logging for security events

- **Data Persistence**
  - PostgreSQL database for reliable storage
  - Structured schema for audit data
  - Database migration support

## Tech Stack

- **Backend Framework**
  - Node.js: JavaScript runtime environment
  - Express: Web application framework

- **Database**
  - PostgreSQL: Relational database
  - node-pg-migrate: Database migration tool

- **Authentication & Security**
  - JSON Web Tokens (JWT): Secure authentication
  - bcrypt: Password hashing

- **Development Tools**
  - Docker: Container for PostgreSQL
  - nodemon: Development server with hot reload

## Project Structure

```
audit-service/
├── migrations/            # Database migration files
├── src/
│   ├── config/            # Configuration files
│   │   └── db.js          # Database connection setup
│   ├── controllers/       # Request handlers
│   │   ├── auditsController.js
│   │   └── findingsController.js
│   ├── middlewares/       # Express middlewares
│   │   └── authMiddleware.js
│   ├── repositories/      # Database access layer
│   │   ├── auditRepository.js
│   │   └── findingRepository.js
│   ├── routes/            # API routes
│   │   ├── auditsRoutes.js
│   │   └── findingsRoutes.js
│   ├── services/          # Business logic
│   │   ├── auditService.js
│   │   └── findingService.js
│   ├── utils/             # Utility functions
│   │   ├── helpers.js
│   │   └── logger.js
│   └── index.js           # Application entry point
├── .env                   # Environment variables
├── package.json           # Project dependencies
└── README.md              # Project documentation
```

## API Endpoints

### Findings API

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|--------------|
| GET | `/api/findings` | Get all audit findings | it_governance |
| POST | `/api/findings` | Create a new audit finding | it_governance |
| GET | `/api/findings/:id` | Get an audit finding by ID | it_governance |
| PUT | `/api/findings/:id` | Update an audit finding by ID | it_governance |
| DELETE | `/api/findings/:id` | Delete an audit finding by ID | it_governance |

### Audits API

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|--------------|
| GET | `/api/audits` | Get all audits | it_governance |
| POST | `/api/audits` | Create a new audit | it_governance |
| GET | `/api/audits/:id` | Get an audit by ID | it_governance |
| PUT | `/api/audits/:id` | Update an audit by ID | it_governance |
| DELETE | `/api/audits/:id` | Delete an audit by ID | it_governance |

## Authentication & Authorization

The API uses JWT (JSON Web Token) for authentication. All endpoints are protected and require a valid token with the appropriate role.

### Authentication Flow

1. Client obtains a JWT token from the authentication service
2. Client includes the token in the Authorization header: `Authorization: Bearer <token>`
3. Server validates the token and checks the user's role
4. If authorized, the request is processed; otherwise, an error is returned

### Required Roles

- `it_governance`: Required for all audit and finding operations

## Database Schema

### Findings Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| name | VARCHAR(255) | Finding name |
| category | VARCHAR(255) | Audit category |
| root_cause | TEXT | Root cause description |
| recommendation | TEXT | Recommendation text |
| commitment | TEXT | Commitment for follow-up |
| commitment_date | TEXT | Deadline for commitment |
| person_in_charge | VARCHAR(100) | Person responsible |
| created_at | TEXT | Creation timestamp |
| updated_at | TEXT | Last update timestamp |

### Audits Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| name | VARCHAR(255) | Audit name |
| category | VARCHAR(255) | Audit category (internal, external, regulatory) |
| scope | TEXT | Audit scope |
| auditor | TEXT | Auditor name |
| date | TEXT | Audit date |
| created_at | TEXT | Creation timestamp |
| updated_at | TEXT | Last update timestamp |

## Setup & Installation

### Prerequisites

- Node.js (v14 or higher)
- Docker (for PostgreSQL)

### Database Setup with Docker

1. **Pull and run PostgreSQL Docker image**
   ```bash
   docker pull postgres
   docker run --name postgres -e POSTGRES_PASSWORD=supersecretpassword -p 5432:5432 -d postgres
   ```

2. **Access PostgreSQL container**
   ```bash
   docker exec -it postgres bash
   psql -U postgres
   ```

3. **Create database user**
   ```sql
   CREATE USER developer WITH ENCRYPTED PASSWORD 'supersecretpassword';
   ```

4. **Create database**
   ```sql
   CREATE DATABASE agw_db;
   ```

5. **Configure user permissions**
   ```sql
   GRANT ALL ON DATABASE agw_db TO developer;
   ALTER DATABASE agw_db OWNER TO developer;
   ```

### Application Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd audit-service
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   Create a `.env` file in the root directory (see [Environment Variables](#environment-variables))

4. **Run database migrations**
   ```bash
   npm run migrate up
   ```

5. **Start the application**
   ```bash
   npm run dev
   ```

## Development

To start the development server with hot reload:

```bash
npm run dev
```

The server will restart automatically when changes are detected.

## Production

To start the production server:

```bash
npm run start-prod
```

## Database Migration

The application uses `node-pg-migrate` for database migrations.

### Migration Commands

- **Create a new migration**
  ```bash
  npm run migrate create '<migration name>'
  ```

- **Run pending migrations**
  ```bash
  npm run migrate up
  ```

- **Revert the last migration**
  ```bash
  npm run migrate down
  ```

- **Redo the last migration**
  ```bash
  npm run migrate redo
  ```

## API Request Examples

### Create a new audit

```bash
curl -X POST http://localhost:5002/api/audits \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "name": "Annual Security Audit 2025",
    "category": "internal",
    "scope": "Information Security Controls",
    "auditor": "Security Team",
    "date": "2025-07-15"
  }'
```

### Get all findings

```bash
curl -X GET http://localhost:5002/api/findings \
  -H "Authorization: Bearer <your-token>"
```
