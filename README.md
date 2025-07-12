# Memo Service API

A RESTful API service for managing memos and letters built with Express.js. Data is stored in JSON document format.

## Project Structure

```
memo-service/
├── data/            # JSON document storage
├── src/
│   ├── config/      # Configuration files
│   ├── controllers/ # Route controllers
│   ├── middleware/  # Custom middleware
│   ├── models/      # Data models
│   ├── routes/      # API routes
│   ├── utils/       # Utility functions
│   └── index.js     # Application entry point
├── tests/           # Test files
├── .env             # Environment variables
├── package.json     # Project dependencies
└── README.md        # Project documentation
```

## Document Schema

Each memo or letter document contains the following fields:

| Field       | Type     | Description                                |
|-------------|----------|--------------------------------------------|
| id          | Number   | Unique identifier                          |
| type        | String   | Document type ('memo' or 'surat')          |
| memo_number | String   | Document reference number (auto-generated) |
| to          | String   | Recipient(s) of the document               |
| cc          | String   | Carbon copy recipient(s) (optional)        |
| reason      | String   | Purpose or subject of the document         |
| created_by  | String   | Author or creator of the document          |
| created_at  | Date     | Timestamp when the document was created    |

## Memo Number Format

The memo_number is automatically generated based on the document type:

- For 'memo' type: `0001/ITE-IAG/M/2024`
  - Format: `{counter}/ITE-IAG/M/{year}`
  - The counter is auto-incremented for each memo
  - 'M' indicates it's a memo
  - Year is based on the creation date

- For 'surat' type: `0001/ITE-IAG/2024`
  - Format: `{counter}/ITE-IAG/{year}`
  - The counter is auto-incremented for each surat
  - Year is based on the creation date

## Authentication

All API endpoints are protected and require authentication using JWT Bearer tokens. The token must include a `role` claim with one of the following values:

- `master`
- `it_management`
- `it_governance`
- `it_architecture`

### Authentication Header Format

```
Authorization: Bearer <your_jwt_token>
```

### JWT Token Structure

The JWT token payload should include:

```json
{
  "userId": "user_id",
  "username": "username",
  "role": "one_of_allowed_roles"
}
```

### Generating Test Tokens (Development Only)

In development mode, you can generate test tokens using the following endpoint:

```
POST /api/auth/token
Content-Type: application/json

{
  "role": "master"
}
```

Response:

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "master",
  "expiresIn": "1 hour"
}
```

## API Endpoints

- `GET /api/memo` - Get all memos and letters sorted by latest creation date (Protected)
  - Query Parameters:
    - `reason` - Optional search term to filter memos by reason/subject
    - `type` - Optional filter for document type ('memo' or 'surat')
- `GET /api/memo/:id` - Get a memo or letter by ID (Protected)
- `POST /api/memo` - Create a new memo or letter (Protected)

### Example Requests for Filtering Memos

**Filter by reason:**
```
GET /api/memo?reason=budget
Authorization: Bearer <your_jwt_token>
```

**Filter by type:**
```
GET /api/memo?type=memo
Authorization: Bearer <your_jwt_token>
```

**Filter by both reason and type:**
```
GET /api/memo?reason=budget&type=memo
Authorization: Bearer <your_jwt_token>
```

This will return all memos that contain the word "budget" in their reason/subject field, sorted by latest creation date.

### Example Request for Creating a Document

```
POST /api/memo
Content-Type: application/json
Authorization: Bearer <your_jwt_token>

{
  "type": "memo",
  "to": "Department of Finance",
  "cc": "CEO Office",
  "reason": "Budget Approval Request",
  "created_by": "John Doe"
}
```

Note: The `memo_number` is automatically generated based on the document type.

### Example Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "type": "memo",
    "memo_number": "0001/ITE-IAG/M/2024",
    "to": "Department of Finance",
    "cc": "CEO Office",
    "reason": "Budget Approval Request",
    "created_by": "John Doe",
    "created_at": "2024-07-12T04:00:00.000Z"
  }
}
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   NODE_ENV=development
   PORT=3000
   APP_SECRET_KEY=your_secret_key_here
   ```

### Running the Application

Development mode:
```
npm run dev
```

Production mode:
```
npm start
```

### Testing

```
npm test
```
