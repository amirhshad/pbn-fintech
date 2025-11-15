# PBN Fintech Mobile App

React Native application for the PBN Fintech P2P cash exchange platform.

## ✅ What's Been Built (Phase 1 & 2 Complete)

### Working Features
- ✅ **Authentication System**
  - Phone number login screen
  - Token-based authentication with AsyncStorage
  - Auto-login on app restart
  - Logout functionality

- ✅ **Home Dashboard**
  - User stats (trust score, transactions, verification status)
  - Action buttons for creating requests
  - Quick links navigation

- ✅ **API Integration**
  - Complete API client with Axios
  - Auto-token injection on requests
  - Global error handling
  - Services for auth, cash requests, matches, transactions

- ✅ **State Management**
  - Redux Toolkit configured
  - Auth slice with async thunks
  - Typed hooks (useAppDispatch, useAppSelector)

- ✅ **Navigation**
  - React Navigation setup
  - Auth stack vs Main stack
  - Conditional navigation based on auth state

## 🚀 Running the App

### Prerequisites
- Node.js 18+ installed
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- Backend server running at `http://localhost:3000`

### Installation

```bash
# Install dependencies
npm install

# iOS only: Install pods
cd ios && pod install && cd ..
```

### Running on Android

```bash
# Start Metro bundler
npm start

# In a new terminal, run on Android
npm run android
```

**Note**: Make sure you have:
1. Android emulator running, OR
2. Android device connected via USB with USB debugging enabled

### Running on iOS (macOS only)

```bash
# Run on iOS simulator
npm run ios

# Or open in Xcode
open ios/PBNFintech.xcodeproj
```

### Backend Server

**Important**: The backend must be running for the app to work.

```bash
# In a separate terminal
cd ../backend
npm run dev
```

The backend should be running at `http://localhost:3000`

## 📱 Testing the App

### Test Users
Use these phone numbers to login (dev mode shows them on the login screen):

- `+31612345001` - Alice (Trust: 4.5⭐, 10 transactions)
- `+31612345002` - Bob (Trust: 4.2⭐, 8 transactions)
- `+31612345003` - Charlie (New user, 0⭐)
- `+31612345004` - Diana (Trust: 4.8⭐, 15 transactions)

### Current Flow
1. Enter phone number → Tap "Continue"
2. App authenticates and saves token
3. Navigates to Home screen
4. View user stats
5. Tap "Logout" to return to login

## 📂 Project Structure

```
mobile/src/
├── api/                  # API client and services
│   ├── client.ts         # Axios instance with interceptors
│   ├── auth.ts           # Authentication endpoints
│   ├── cashRequests.ts   # Cash request endpoints
│   ├── matches.ts        # Matching endpoints
│   ├── transactions.ts   # Transaction endpoints
│   └── index.ts          # Export all APIs
│
├── components/           # Reusable UI components (to be built)
│
├── screens/              # All app screens
│   ├── Auth/
│   │   └── LoginScreen.tsx       # ✅ Phone login
│   └── Home/
│       └── HomeScreen.tsx        # ✅ User dashboard
│
├── navigation/
│   └── RootNavigator.tsx # ✅ Navigation config
│
├── store/                # Redux store
│   ├── authSlice.ts      # ✅ Auth state management
│   └── index.ts          # ✅ Store configuration
│
├── types/                # TypeScript definitions
│   └── index.ts          # ✅ All type definitions
│
├── constants/            # App constants
│   └── index.ts          # ✅ API URLs, colors, limits
│
└── utils/                # Utility functions (empty)
```

## 🎨 UI/UX

### Color Scheme
- Primary: #2563EB (Blue)
- Success/Have Cash: #10B981 (Green)
- Danger/Need Cash: #EF4444 (Red)
- Background: #FFFFFF
- Text: #111827

### Screens Built
1. **LoginScreen** - Clean phone input with brand colors
2. **HomeScreen** - Stats cards, action buttons, quick links

## 🔧 Configuration

### API Base URL
Located in `src/constants/index.ts`:

```typescript
export const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api'  // Development
  : 'https://api.pbnfintech.com/api';  // Production
```

### Android Network Configuration
For Android to connect to localhost backend, the app is configured to allow cleartext traffic in development.

## 📦 Dependencies

### Core
- react-native: 0.70.0
- react: 18.1.0
- typescript: 4.8.2

### Navigation
- @react-navigation/native: 6.1.6
- @react-navigation/native-stack: 6.9.12
- react-native-screens: 3.20.0
- react-native-safe-area-context: 4.5.0

### State Management
- @reduxjs/toolkit: 1.9.5
- react-redux: 8.0.5

### Networking & Storage
- axios: 1.4.0
- @react-native-async-storage/async-storage: 1.18.1

### UI & Graphics
- react-native-svg: 13.9.0
- react-native-qrcode-svg: 6.2.0

## 🐛 Troubleshooting

### Metro Bundler Issues
```bash
# Clear cache and restart
npm start -- --reset-cache
```

### Android Build Errors
```bash
# Clean Android build
cd android
./gradlew clean
cd ..
npm run android
```

### iOS Build Errors
```bash
# Clean iOS build
cd ios
pod install
cd ..
npm run ios
```

### Cannot Connect to Backend
- Verify backend is running: `curl http://localhost:3000/health`
- Check API_BASE_URL in `src/constants/index.ts`
- For Android emulator, backend should be at `http://10.0.2.2:3000`
- For physical device, use your computer's IP address

## 📋 Next Steps (Phase 3)

The following features are planned for Phase 3:

1. **Cash Request Creation**
   - Screen to create NEED_CASH or HAVE_CASH requests
   - Location picker
   - Amount input with validation

2. **Browse Requests**
   - Map view of nearby requests
   - List view with filters
   - Distance calculation

3. **Matching System**
   - View potential matches
   - Accept/reject matches
   - Match details screen

4. **Transaction Flow**
   - Create transaction from match
   - QR code display
   - Confirmation interface
   - Transaction history

## 📝 Development Progress

See `MOBILE_APP_PROGRESS.md` for detailed development log and architecture notes.

## 🔗 Related Documentation

- **Backend API**: `../backend/README.md`
- **Backend Prototype Summary**: `../PROTOTYPE_SUMMARY.md`
- **Project Setup**: `../development_setup_guide.md`

---

**Status**: Phase 1 & 2 Complete ✅
**Next**: Phase 3 - Cash Requests & Matching System
**Last Updated**: November 13, 2025
