# Attestify Backend

A backend service built on top of the Attestify SDK for managing mutual attestations and commitments. The Attestify SDK provides core functionality for handling mutual attestations, while this service exposes REST APIs for user management, commitment lifecycle, and cryptographic verification of digital signatures.

## Features

- 🔐 Secure authentication and authorization
- 📡 RESTful API endpoints
- 🏦 MongoDB integration for data persistence
- 🔑 HD wallet and cryptographic operations
- ✍️ Digital signature verification system
- 🔄 State management for commitments

## Architecture

```
┌──────────────┐     ┌─────────────┐     ┌────────────┐
│    Client    │ ←─→ │   Express   │ ←─→ │  MongoDB   │
│    (CLI)     │     │   Server    │     │ Database   │
└──────────────┘     └─────────────┘     └────────────┘
                           ↓
                    ┌─────────────┐
                    │  Attestify  │
                    │    SDK      │
                    └─────────────┘
                           ↓
                    ┌─────────────┐
                    │ Crypto & HD │
                    │   Wallet    │
                    └─────────────┘
```

The [Attestify SDK](https://github.com/STarLo-rd/Attestify) serves as the core engine handling all mutual attestation functionality, including:

- Commitment state management
- Digital signature generation and verification
- Cryptographic operations
- HD wallet integration
- Attestation payload formatting

The [Attestify CLI](https://github.com/STarLo-rd/attestify-cli) serves as a user-friendly interface to interact with the Attestify backend and Attestify SDK, providing functionalities such as:

- Seamless command-line management of attestation workflows
- Execution of mutual attestation operations
- Automation script to run full lifecyle for attestation

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB (v4.4 or higher)
- Git

## Installation

1. Clone the repository:

```bash
git clone https://github.com/STarLo-rd/attestify-backend.git
cd attestify-backend
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment:

```bash
cp .env.example .env
```

Edit `.env` with your configurations:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/attestify
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=1h
```

4. Start the service:

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### User Management

#### Register User

```http
POST /api/users/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string",
  "mnemonic": "string"
}
```

#### Login

```http
POST /api/users/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

### Commitment Management

#### Create Commitment

```http
POST /api/commitments
Content-Type: application/json
Authorization: Bearer <token>

{
  "committerId": "string",
  "assetName": "string",
  "quantity": number,
  "unit": "string"
}
```

#### Acknowledge Commitment

```http
POST /api/commitments/:commitmentId/acknowledge
Content-Type: application/json
Authorization: Bearer <token>

{
  "mnemonic": "string"
}
```

#### Accept Commitment

```http
POST /api/commitments/:commitmentId/accept
Content-Type: application/json
Authorization: Bearer <token>

{
  "mnemonic": "string"
}
```

#### Discharge Commitment

```http
POST /api/commitments/:commitmentId/discharge
Content-Type: application/json
Authorization: Bearer <token>

{
  "mnemonic": "string"
}
```

## Database Schema

### User Model

```typescript
{
  username: string;
  email: string;
  password: string; // hashed
  xpub: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Commitment Model

```typescript
{
  committeeId: ObjectId;
  committerId: ObjectId;
  committeeSignature: string;
  committerSignature: string;
  dischargeSignature: string;
  committeeXpub: string;
  committerXpub: string;
  attestationPayload: string;
  derivationPath: string;
  attestationId: string;
  committer: string;
  committee: string;
  commitmentState: enum['INITIATED', 'ACKNOWLEDGED', 'EFFECTIVE', 'DISCHARGED'];
  createdAt: Date;
  updatedAt: Date;
}
```

## Security Features

1. **Authentication & Authorization**

   - JWT-based authentication
   - Role-based access control
   - Secure password hashing using bcrypt

2. **Cryptographic Security**

   - HD wallet integration
   - Digital signature verification
   - Secure key derivation
   - Message integrity checks

3. **Data Security**
   - Input validation
     <!-- - XSS protection -->
     <!-- - Rate limiting -->
   - CORS configuration

## Error Handling

The API uses standard HTTP status codes:

- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

Error response format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

## Deployment

1. Build the application:

```bash
npm run build
```

2. Start in production:

```bash
NODE_ENV=production npm start
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
