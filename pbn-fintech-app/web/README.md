# PBN Fintech - Web Application

Web interface for the PBN Fintech peer-to-peer cash exchange platform.

## Features

- User authentication with phone verification
- Dashboard with user stats and trust score
- Create cash requests (Need Cash / Have Cash)
- Browse nearby cash requests
- Match with compatible users
- View matches and transactions
- Real-time notifications via Socket.io

## Prerequisites

- Node.js 18+ installed
- Backend API running on `http://localhost:3000`
- PostgreSQL database set up for backend

## Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3001` (if port 3000 is already taken by the backend).

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
src/
├── api/              # API client and service modules
├── components/       # React components
│   ├── auth/        # Authentication components
│   ├── common/      # Shared components (Layout, etc.)
│   └── ...
├── hooks/           # Custom React hooks
├── pages/           # Page components
├── store/           # Redux store and slices
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── App.tsx          # Main application component
```

## Test Users

When running locally, you can use these test phone numbers:

- `+31612345678` - Trust score: 4.5
- `+31687654321` - Trust score: 4.2
- `+31655555555` - Trust score: 3.8
- `+31644444444` - Trust score: 4.8

Verification code for test users: `123456`

## Technology Stack

- React 18 with TypeScript
- Redux Toolkit for state management
- React Router for routing
- Axios for API calls
- Socket.io client for real-time updates
- Tailwind CSS for styling

## API Integration

The web app connects to the backend API at `http://localhost:3000/api` by default. Make sure the backend is running before starting the web app.

## Building for Production

To create a production build:

```bash
npm run build
```

The build folder will contain optimized static files ready for deployment.

## Deployment

The web application can be deployed to any static hosting service:

- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

Make sure to configure the environment variables for the production API URL.

## Features Overview

### Authentication
- Phone number login with SMS verification
- Session management with JWT tokens
- Automatic token refresh

### Dashboard
- User statistics and trust score
- Quick actions for creating requests
- Navigation to all features

### Cash Requests
- Create NEED_CASH or HAVE_CASH requests
- Browse nearby requests on a map
- Filter by distance and amount
- Automatic location detection

### Matches & Transactions
- View and accept matches
- Track transaction status
- QR code verification (coming soon)
- Review and rating system (coming soon)

## Contributing

This is a private project. For questions or issues, contact the development team.
