# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PBN Fintech** is a peer-to-peer cash exchange platform for the Netherlands. It connects users who need physical cash with users who have physical cash within a 5km radius. This is a pure P2P model with **no banking integration** - all transactions are hand-to-hand cash exchanges with built-in security through QR verification, GPS location checking, and a trust scoring system.

**Key differentiator**: This is NOT a digital payment platform. It's a marketplace for matching people who want to exchange physical cash safely.

## Development Commands

### Backend (Node.js + Express + Prisma)

Located in `backend/`:

```bash
# Development
npm run dev                # Start dev server with hot reload (nodemon)
npm run build             # Compile TypeScript to dist/
npm start                 # Run production build

# Database (Prisma)
npm run db:migrate        # Create and apply new migration
npm run db:generate       # Regenerate Prisma Client after schema changes
npm run db:seed           # Seed database with initial data
npm run db:reset          # Reset database (WARNING: deletes all data)

# Testing & Quality
npm test                  # Run Jest tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run tests with coverage report
npm run lint              # Lint TypeScript files
npm run lint:fix          # Auto-fix linting issues
npm run format            # Format code with Prettier
npm run type-check        # Check TypeScript types without emitting
```

### Mobile (React Native - Not Yet Implemented)

The `mobile/` directory exists but is currently empty. When implementing:
- Use React Native with TypeScript
- Follow the setup guide in `../development_setup_guide.md`

### Docker Development Environment

```bash
# Start all services (PostgreSQL + Redis)
docker-compose up -d

# Start specific services
docker-compose up postgres redis -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f backend
```

### Full Development Startup

```bash
# Terminal 1: Start infrastructure
docker-compose up postgres redis -d

# Terminal 2: Start backend
cd backend
npm run db:migrate  # First time only
npm run dev

# The backend will be available at http://localhost:3000
```

## Architecture Overview

### Pure P2P Transaction Flow

1. **User A** posts: "Need €200 cash in Amsterdam Central" (NEED_CASH request)
2. **User B** posts: "Have €200 cash in Amsterdam Central" (HAVE_CASH request)
3. **Matching Engine** finds compatible requests within 5km radius
4. Both users accept match → exchange contact info via in-app messaging
5. Users coordinate safe meeting location (verified public spaces only)
6. At meeting: Both scan each other's QR codes to verify identities
7. GPS verification confirms both users are at agreed location (±100m)
8. Hand-to-hand cash exchange occurs
9. Both users confirm transaction completion in app
10. Both users rate each other → updates trust scores
11. Platform collects €2 fee (€1 from each user)

### Backend Architecture

**Core Services** (`backend/src/services/`):
- `authService.ts` - Phone verification, JWT session management, user authentication
- `smsService.ts` - Twilio integration for SMS verification codes
- Additional services needed: matching, transaction, trust/reputation, location

**Route Structure** (`backend/src/routes/`):
- `/api/auth` - Registration, login, phone verification
- `/api/users` - User profiles, verification status
- `/api/cash-requests` - Post and browse cash exchange requests (placeholder)
- `/api/matches` - Match management and acceptance (placeholder)
- `/api/transactions` - QR generation, verification, completion (placeholder)
- `/api/locations` - Safe meeting locations database (placeholder)

**Real-Time Features** (Socket.io in `src/index.ts`):
- Match notifications when compatible users found
- In-app messaging between matched users
- Transaction status updates
- Meeting coordination

**Middleware** (`backend/src/middleware/`):
- `auth.ts` - JWT authentication, session validation
- `errorHandler.ts` - Centralized error handling with CustomError class
- `notFoundHandler.ts` - 404 handling

### Database Schema (Prisma)

Schema located at `backend/prisma/schema.prisma`. Key models:

**Users**:
- Phone verification with SMS codes (10min expiry)
- Dutch ID verification for trust
- Trust score (0-5, calculated from transaction history)
- Verification status progression: PENDING → PHONE_VERIFIED → ID_VERIFIED → FULLY_VERIFIED

**Cash Requests**:
- RequestType: NEED_CASH or HAVE_CASH
- Location (lat/lng) + search radius (default 5km)
- Amount, currency (EUR), special requirements
- Status: ACTIVE, MATCHED, EXPIRED, CANCELLED

**Matches**:
- Links two CashRequests (one NEED_CASH + one HAVE_CASH)
- Dual acceptance required (both users must accept)
- Meeting coordination: agreed location, scheduled time
- Status: PENDING → ACCEPTED → MEETING → COMPLETED

**Transactions**:
- Unique 6-digit transaction code
- QR code hashes for both parties (4hr expiry)
- Dual confirmation: both giver and receiver must confirm
- GPS location verification (±100m accuracy required)
- Platform fee: €2 total (€1 from each party)
- Status: PENDING → MEETING → EXCHANGING → COMPLETED
- Auto-timeout after 4 hours

**Safe Locations**:
- Pre-verified public meeting spots (banks, police stations, malls, cafes)
- Safety ratings based on usage and user feedback
- Operating hours, address, location type

**Trust System**:
- UserReview: 1-5 star ratings with optional text
- Detailed ratings: communication, reliability, safety
- Disputes: NO_SHOW, WRONG_AMOUNT, FAKE_MONEY, SAFETY_CONCERN
- Trust score calculation based on completed transactions and ratings

### Security & Trust Framework

**Transaction Security**:
- Dual QR verification (both parties scan each other)
- Time-limited QR codes (4hr expiry)
- GPS location matching (±100m tolerance)
- Dual confirmation required (both must confirm completion)
- Safe location requirements (meetings only at verified public spaces)

**User Trust Limits**:
- New users: Max 2 transactions/day, €200 max amount
- Trust score 0-5 calculated from: completed transactions, ratings, disputes
- Minimum 4.0 rating required to continue using platform
- Trusted users get higher limits and priority matching

**Fraud Prevention**:
- Session-based authentication (7-day sessions)
- Rate limiting: 100 requests per 15min per IP
- Phone verification required (SMS codes)
- Dutch ID upload for full verification
- Duplicate prevention: same users can't transact same amount same day

## Technology Stack

**Backend**:
- Node.js 18+ with TypeScript (strict mode enabled)
- Express.js for REST API
- Socket.io for real-time features
- Prisma ORM with PostgreSQL 14
- Redis for caching/sessions
- JWT for authentication
- Twilio for SMS verification
- Winston for logging

**Frontend** (planned):
- React Native with TypeScript
- Redux Toolkit for state management
- React Navigation
- Native camera for QR scanning
- Geolocation services

**DevOps**:
- Docker Compose for local development
- PostgreSQL 14 + Redis 7

## Environment Configuration

Copy `.env.example` to `.env` and configure:

**Required for development**:
- `DATABASE_URL` - PostgreSQL connection (Docker default: `postgresql://pbn_user:pbn_password@localhost:5432/pbn_fintech`)
- `REDIS_URL` - Redis connection (Docker default: `redis://localhost:6379`)
- `JWT_SECRET` - Secret key for JWT tokens
- `TWILIO_*` - Twilio credentials for SMS (phone verification won't work without these)

**Optional but recommended**:
- `GOOGLE_MAPS_API_KEY` - For location services and safe location database
- `DUTCH_ID_OCR_API_KEY` - For Dutch ID verification

## Important Implementation Notes

### When Working with Prisma:

1. **After any schema changes**, always run:
   ```bash
   npm run db:generate  # Regenerate Prisma Client
   npm run db:migrate   # Create and apply migration
   ```

2. **Prisma Client must be regenerated** whenever you modify `prisma/schema.prisma`

3. **Don't query the database directly** - always use Prisma Client for type safety

### When Implementing New Features:

1. **Authentication is session-based**:
   - JWT tokens contain `userId` and `sessionId`
   - Sessions stored in `UserSession` table, expire after 7 days
   - Use `auth` middleware to protect routes

2. **All monetary values use Decimal**:
   - Amounts stored as `Decimal` in database
   - Convert to `Number` when sending to frontend: `Number(user.trustScore)`
   - Platform fee is fixed: `€2.00` per transaction

3. **Real-time features via Socket.io**:
   - User rooms: `user_${userId}`
   - Events: `match_found`, `transaction_status`, `new_message`
   - Socket.io server attached to HTTP server (see `src/index.ts:88-129`)

4. **Error handling**:
   - Use `CustomError` class from `middleware/errorHandler.ts`
   - Throw errors with HTTP status codes: `throw new CustomError('Message', 400)`
   - Centralized error handler catches all errors

5. **Location data**:
   - Latitude: `Decimal(10,8)` - e.g., 52.37403840
   - Longitude: `Decimal(11,8)` - e.g., 4.88969090
   - Radius in kilometers (integer)
   - GPS accuracy in meters (integer)

### Current Implementation Status:

**Completed**:
- ✅ Project structure and configuration
- ✅ Database schema (complete Prisma schema)
- ✅ Authentication service (registration, login, phone verification)
- ✅ User session management
- ✅ Socket.io real-time infrastructure
- ✅ Error handling middleware
- ✅ Logging (Winston)
- ✅ Docker development environment

**Placeholder/Incomplete** (routes exist but need implementation):
- ⚠️ Cash request CRUD operations
- ⚠️ Matching engine algorithm
- ⚠️ Transaction QR code generation/verification
- ⚠️ Location services and safe locations database
- ⚠️ Trust score calculation
- ⚠️ Review and dispute handling
- ⚠️ Fee collection system

**Not Started**:
- ❌ Mobile app (directory is empty)
- ❌ Dutch ID OCR verification
- ❌ Payment integration for fee collection

## Testing

Currently using Jest with Supertest for API testing. Test files use `.test.ts` or `.spec.ts` extensions and are excluded from compilation.

To run tests for a single file:
```bash
npm test -- path/to/test.test.ts
```

## Code Style

TypeScript strict mode is enabled with additional strict checks:
- `noImplicitAny`, `noImplicitReturns`, `noImplicitThis`
- `noUnusedLocals`, `noUnusedParameters`
- `exactOptionalPropertyTypes`
- `noUncheckedIndexedAccess` - arrays/objects may be undefined

Use ESLint and Prettier for consistent formatting:
```bash
npm run lint:fix && npm run format
```

## Business Context

**Target Market**: Netherlands only (MVP)
- Major cities: Amsterdam, Rotterdam, The Hague
- English language app (98% Dutch English proficiency)
- €2 flat fee per transaction (€1 from each party)

**Target Metrics** (Month 3):
- 100+ transactions per week
- 80%+ meetup completion rate
- 85%+ transaction completion rate
- <5% dispute rate
- Average trust score 4.2+

**Revenue Model**: Transaction fees only - no payment processing overhead since this is pure cash-to-cash exchange.
