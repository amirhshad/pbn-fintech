// API Configuration
export const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api'  // Development - connects to local backend
  : 'https://api.pbnfintech.com/api';  // Production (placeholder)

// App Constants
export const APP_NAME = 'PBN Fintech';
export const CURRENCY = 'EUR';
export const CURRENCY_SYMBOL = '€';

// Limits for new users
export const NEW_USER_DAILY_LIMIT = 2;
export const NEW_USER_AMOUNT_LIMIT = 200;
export const MIN_TRUST_SCORE_FOR_UNLIMITED = 1.0;

// Transaction
export const PLATFORM_FEE = 2.0;
export const TRANSACTION_TIMEOUT_HOURS = 4;

// Location
export const DEFAULT_SEARCH_RADIUS_KM = 5;
export const MAX_SEARCH_RADIUS_KM = 50;
export const GPS_ACCURACY_METERS = 100;

// Amsterdam center coordinates (default)
export const DEFAULT_LOCATION = {
  latitude: 52.3676,
  longitude: 4.9041,
};

// Colors
export const COLORS = {
  primary: '#2563EB',      // Blue
  secondary: '#10B981',    // Green
  danger: '#EF4444',       // Red
  warning: '#F59E0B',      // Orange
  success: '#10B981',      // Green

  background: '#FFFFFF',
  backgroundSecondary: '#F3F4F6',

  text: '#111827',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',

  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  card: '#FFFFFF',
  cardShadow: '#00000010',

  // Request types
  needCash: '#EF4444',     // Red for NEED_CASH
  haveCash: '#10B981',     // Green for HAVE_CASH

  // Status colors
  pending: '#F59E0B',
  accepted: '#10B981',
  completed: '#2563EB',
  cancelled: '#6B7280',
};

// Request Types
export const REQUEST_TYPES = {
  NEED_CASH: 'NEED_CASH',
  HAVE_CASH: 'HAVE_CASH',
} as const;

// Match Status
export const MATCH_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  MEETING: 'MEETING',
  COMPLETED: 'COMPLETED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
} as const;

// Transaction Status
export const TRANSACTION_STATUS = {
  PENDING: 'PENDING',
  EXCHANGING: 'EXCHANGING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  TIMED_OUT: 'TIMED_OUT',
  DISPUTED: 'DISPUTED',
} as const;

// Verification Status
export const VERIFICATION_STATUS = {
  PENDING: 'PENDING',
  PHONE_VERIFIED: 'PHONE_VERIFIED',
  ID_VERIFIED: 'ID_VERIFIED',
  FULLY_VERIFIED: 'FULLY_VERIFIED',
  REJECTED: 'REJECTED',
} as const;
