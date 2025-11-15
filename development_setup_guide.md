# PBN Fintech - Development Setup Guide
## Pure P2P Cash Exchange App - Day 1 Setup

### 🚀 **Development Environment Setup**

#### **Prerequisites (Install in Order):**
1. **Node.js 18+**: https://nodejs.org/
2. **Git**: https://git-scm.com/
3. **VS Code**: https://code.visualstudio.com/
4. **Docker Desktop**: https://docker.com/products/docker-desktop
5. **React Native CLI**: `npm install -g react-native-cli`
6. **Expo CLI**: `npm install -g @expo/cli`

#### **For iOS Development (Mac only):**
- **Xcode**: Install from Mac App Store
- **iOS Simulator**: Included with Xcode

#### **For Android Development:**
- **Android Studio**: https://developer.android.com/studio
- **Java Development Kit (JDK) 11**: OpenJDK or Oracle JDK

---

## 📁 **Project Structure Setup**

### **1. Create Main Project Directory:**
```bash
cd "/Users/amir/My Projects/PBN Fintech"
mkdir pbn-fintech-app
cd pbn-fintech-app
```

### **2. Initialize Git Repository:**
```bash
git init
git branch -m main
echo "# PBN Fintech - Pure P2P Cash Exchange" > README.md
git add README.md
git commit -m "Initial commit: PBN Fintech project setup"
```

### **3. Project Structure:**
```
pbn-fintech-app/
├── mobile/                 # React Native app
├── backend/               # Node.js API server
├── shared/               # Shared types and utilities
├── docs/                 # Documentation
├── docker-compose.yml    # Local development setup
├── .env.example         # Environment variables template
├── .gitignore          # Git ignore rules
└── README.md           # Project documentation
```

---

## 📱 **Frontend Setup (React Native)**

### **Initialize React Native Project:**
```bash
# Create React Native app with TypeScript
npx react-native init PBNMobile --template react-native-template-typescript
mv PBNMobile mobile
cd mobile
```

### **Install Essential Dependencies:**
```bash
# Navigation
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install react-native-gesture-handler react-native-reanimated

# State Management
npm install @reduxjs/toolkit react-redux

# UI Components
npm install native-base react-native-svg
npm install react-native-vector-icons

# Maps & Location
npm install react-native-maps @react-native-community/geolocation

# Camera & QR Codes
npm install react-native-vision-camera
npm install react-native-qrcode-scanner react-native-qrcode-generator

# Security & Storage
npm install react-native-keychain @react-native-async-storage/async-storage
npm install crypto-js

# Notifications
npm install @react-native-firebase/app @react-native-firebase/messaging

# HTTP Client
npm install axios

# Development Dependencies
npm install --save-dev @types/react @types/react-native
npm install --save-dev eslint prettier @typescript-eslint/eslint-plugin
```

---

## ⚙️ **Backend Setup (Node.js)**

### **Initialize Backend Project:**
```bash
cd ..
mkdir backend
cd backend
npm init -y
```

### **Install Backend Dependencies:**
```bash
# Core Framework
npm install express cors helmet morgan
npm install socket.io

# Database & ORM
npm install pg @prisma/client prisma
npm install redis

# Authentication & Security
npm install jsonwebtoken bcrypt
npm install joi express-validator
npm install express-rate-limit

# Utilities
npm install uuid qrcode crypto
npm install geolib node-geocoder
npm install twilio

# Development Dependencies  
npm install --save-dev typescript @types/node @types/express
npm install --save-dev ts-node nodemon
npm install --save-dev jest @types/jest supertest @types/supertest
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install --save-dev prettier
```

### **TypeScript Configuration:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 🗄️ **Database Setup (PostgreSQL + Prisma)**

### **Initialize Prisma:**
```bash
cd backend
npx prisma init
```

### **Database Schema (Prisma):**
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                    String   @id @default(uuid())
  phoneNumber          String   @unique
  fullName             String
  dutchIdNumber        String?  @unique
  profilePhotoUrl      String?
  verificationStatus   String   @default("pending")
  trustScore           Decimal  @default(0.00)
  totalTransactions    Int      @default(0)
  successfulTransactions Int    @default(0)
  locationLat          Decimal?
  locationLng          Decimal?
  isActive             Boolean  @default(true)
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  // Relations
  cashRequests         CashRequest[]
  givenTransactions    Transaction[] @relation("CashGiver")
  receivedTransactions Transaction[] @relation("CashReceiver")
  reviewsGiven         UserReview[] @relation("Reviewer")
  reviewsReceived      UserReview[] @relation("ReviewedUser")
  disputes             Dispute[]

  @@map("users")
}

model CashRequest {
  id                  String   @id @default(uuid())
  userId              String
  requestType         String   // 'need_cash', 'have_cash'
  amount              Decimal
  currency            String   @default("EUR")
  locationLat         Decimal
  locationLng         Decimal
  locationDescription String?
  radiusKm            Int      @default(5)
  specialRequirements String?
  status              String   @default("active")
  expiresAt           DateTime?
  createdAt           DateTime @default(now())

  // Relations
  user                User     @relation(fields: [userId], references: [id])
  matches1            Match[]  @relation("Request1")
  matches2            Match[]  @relation("Request2")

  @@map("cash_requests")
}

model Match {
  id               String    @id @default(uuid())
  requestId1       String    // need_cash request
  requestId2       String    // have_cash request
  user1Id          String
  user2Id          String
  matchStatus      String    @default("pending")
  agreedLocation   String?
  agreedLocationLat Decimal?
  agreedLocationLng Decimal?
  scheduledTime    DateTime?
  createdAt        DateTime  @default(now())

  // Relations
  request1         CashRequest @relation("Request1", fields: [requestId1], references: [id])
  request2         CashRequest @relation("Request2", fields: [requestId2], references: [id])
  transactions     Transaction[]

  @@map("matches")
}

model Transaction {
  id                    String    @id @default(uuid())
  matchId               String
  amount                Decimal
  transactionCode       String    @unique
  qrCodeHashUser1       String?
  qrCodeHashUser2       String?
  cashGiverId           String
  cashReceiverId        String
  
  // Confirmation System
  giverConfirmed        Boolean   @default(false)
  receiverConfirmed     Boolean   @default(false)
  giverConfirmedAt      DateTime?
  receiverConfirmedAt   DateTime?
  
  // Location Verification
  locationVerified      Boolean   @default(false)
  actualMeetingLat      Decimal?
  actualMeetingLng      Decimal?
  locationAccuracyMeters Int?
  
  // Status
  status                String    @default("pending")
  platformFeeCollected  Boolean   @default(false)
  completedAt           DateTime?
  createdAt             DateTime  @default(now())

  // Relations
  match                 Match     @relation(fields: [matchId], references: [id])
  cashGiver             User      @relation("CashGiver", fields: [cashGiverId], references: [id])
  cashReceiver          User      @relation("CashReceiver", fields: [cashReceiverId], references: [id])
  reviews               UserReview[]
  disputes              Dispute[]

  @@map("transactions")
}

model SafeLocation {
  id             String   @id @default(uuid())
  name           String
  address        String
  latitude       Decimal
  longitude      Decimal
  locationType   String   // 'bank', 'police_station', 'mall', 'cafe'
  description    String?
  operatingHours String?
  verified       Boolean  @default(false)
  safetyRating   Decimal  @default(0.00)
  usageCount     Int      @default(0)
  city           String
  createdAt      DateTime @default(now())

  @@map("safe_locations")
}

model Dispute {
  id               String    @id @default(uuid())
  transactionId    String
  reportedBy       String
  reportedAgainst  String
  disputeType      String    // 'no_show', 'wrong_amount', 'safety_concern'
  description      String
  evidenceUrls     String[]
  status           String    @default("open")
  resolution       String?
  resolvedBy       String?
  resolvedAt       DateTime?
  createdAt        DateTime  @default(now())

  // Relations
  transaction      Transaction @relation(fields: [transactionId], references: [id])
  reporter         User        @relation(fields: [reportedBy], references: [id])

  @@map("disputes")
}

model UserReview {
  id               String    @id @default(uuid())
  transactionId    String
  reviewerId       String
  reviewedUserId   String
  rating           Int       // 1-5 stars
  reviewText       String?
  reviewType       String    // 'giver_review', 'receiver_review'
  createdAt        DateTime  @default(now())

  // Relations
  transaction      Transaction @relation(fields: [transactionId], references: [id])
  reviewer         User        @relation("Reviewer", fields: [reviewerId], references: [id])
  reviewedUser     User        @relation("ReviewedUser", fields: [reviewedUserId], references: [id])

  @@map("user_reviews")
}
```

---

## 🐳 **Docker Development Environment**

### **docker-compose.yml:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    container_name: pbn-postgres
    environment:
      POSTGRES_DB: pbn_fintech
      POSTGRES_USER: pbn_user
      POSTGRES_PASSWORD: pbn_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/prisma/init.sql:/docker-entrypoint-initdb.d/init.sql

  redis:
    image: redis:7-alpine
    container_name: pbn-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build: ./backend
    container_name: pbn-backend
    depends_on:
      - postgres
      - redis
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://pbn_user:pbn_password@postgres:5432/pbn_fintech
      - REDIS_URL=redis://redis:6379
    ports:
      - "3000:3000"
    volumes:
      - ./backend:/app
      - /app/node_modules
    command: npm run dev

volumes:
  postgres_data:
  redis_data:
```

---

## 📝 **Initial Code Structure**

### **Backend Entry Point (`backend/src/index.ts`):**
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Server } from 'socket.io';
import http from 'http';
import { PrismaClient } from '@prisma/client';

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Initialize Prisma
const prisma = new PrismaClient();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/requests', require('./routes/cashRequests'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/transactions', require('./routes/transactions'));

// Socket.io for real-time features
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join user to their personal room for notifications
  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
  });

  // Handle match notifications
  socket.on('new_match', (data) => {
    io.to(`user_${data.userId}`).emit('match_found', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 PBN Fintech API server running on port ${PORT}`);
});

export default app;
```

### **React Native App Entry Point (`mobile/App.tsx`):**
```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { NativeBaseProvider } from 'native-base';
import { store } from './src/store/store';
import { AppNavigator } from './src/navigation/AppNavigator';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <NativeBaseProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </NativeBaseProvider>
    </Provider>
  );
};

export default App;
```

---

## 🛠️ **Development Commands**

### **Backend Commands (`backend/package.json`):**
```json
{
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:migrate": "npx prisma migrate dev",
    "db:generate": "npx prisma generate",
    "db:seed": "ts-node prisma/seed.ts",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix"
  }
}
```

### **Mobile Commands (`mobile/package.json`):**
```json
{
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "start": "react-native start",
    "test": "jest",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix"
  }
}
```

---

## 🚀 **Quick Start Commands**

### **1. Start Development Environment:**
```bash
# Start database services
docker-compose up postgres redis -d

# Start backend
cd backend
npm run db:migrate
npm run dev

# Start mobile app (in another terminal)
cd mobile
npm start
# Then press 'i' for iOS or 'a' for Android
```

### **2. First-Time Setup:**
```bash
# Clone and setup
git clone [your-repo-url]
cd pbn-fintech-app

# Backend setup
cd backend
npm install
npm run db:migrate
npm run db:seed

# Mobile setup
cd ../mobile
npm install
cd ios && pod install && cd .. # iOS only

# Start development
docker-compose up -d
npm run dev
```

---

## 📋 **Next Development Steps (Day 1-2)**

### **Backend Priority:**
1. Set up authentication endpoints (`/api/auth/register`, `/api/auth/login`)
2. Implement phone verification with Twilio
3. Create user profile management
4. Build cash request CRUD operations
5. Basic matching algorithm implementation

### **Mobile Priority:**
1. Set up navigation structure
2. Create welcome/onboarding screens
3. Build registration and phone verification flow
4. Design main dashboard layout
5. Implement location services

### **Database:**
1. Run initial migrations
2. Seed safe locations data
3. Create test user accounts
4. Set up development data

This setup gives you a solid foundation to start building PBN Fintech. Everything is configured for TypeScript, includes all necessary dependencies, and follows best practices for scalable development.

Ready to start coding! 🚀