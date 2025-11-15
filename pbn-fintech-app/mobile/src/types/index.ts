export type RequestType = 'NEED_CASH' | 'HAVE_CASH';
export type MatchStatus = 'PENDING' | 'ACCEPTED' | 'MEETING' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';
export type TransactionStatus = 'PENDING' | 'EXCHANGING' | 'COMPLETED' | 'CANCELLED' | 'TIMED_OUT' | 'DISPUTED';
export type VerificationStatus = 'PENDING' | 'PHONE_VERIFIED' | 'ID_VERIFIED' | 'FULLY_VERIFIED' | 'REJECTED';

// User
export interface User {
  id: string;
  phoneNumber: string;
  fullName: string | null;
  profilePhotoUrl: string | null;
  verificationStatus: VerificationStatus;
  trustScore: number;
  totalTransactions: number;
  successfulTransactions: number;
  locationLat: number | null;
  locationLng: number | null;
  isActive: boolean;
  isBanned: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

// Auth Response
export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

// Cash Request
export interface CashRequest {
  id: string;
  userId: string;
  requestType: RequestType;
  amount: number;
  currency: string;
  locationLat: number;
  locationLng: number;
  locationDescription: string | null;
  radiusKm: number;
  specialRequirements: string | null;
  minUserRating: number | null;
  status: string;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    fullName: string;
    trustScore: number;
    phoneNumber: string;
  };
  distance?: number; // Calculated distance for nearby requests
}

// Match
export interface Match {
  id: string;
  requestId1: string;
  requestId2: string;
  user1Id: string;
  user2Id: string;
  matchedAmount: number;
  matchScore: number;
  status: MatchStatus;
  agreedLocation: string | null;
  agreedLocationLat: number | null;
  agreedLocationLng: number | null;
  scheduledTime: string | null;
  user1Accepted: boolean;
  user2Accepted: boolean;
  user1AcceptedAt: string | null;
  user2AcceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
  request1?: CashRequest;
  request2?: CashRequest;
  transactions?: Transaction[];
}

// Transaction
export interface Transaction {
  id: string;
  matchId: string;
  amount: number;
  platformFee: number;
  transactionCode: string;
  cashGiverId: string;
  cashReceiverId: string;
  giverConfirmed: boolean;
  receiverConfirmed: boolean;
  giverConfirmedAt: string | null;
  receiverConfirmedAt: string | null;
  status: TransactionStatus;
  startedAt: string | null;
  completedAt: string | null;
  timeoutAt: string;
  createdAt: string;
  updatedAt: string;
  match?: Match;
  cashGiver?: {
    id: string;
    fullName: string;
    phoneNumber: string;
  };
  cashReceiver?: {
    id: string;
    fullName: string;
    phoneNumber: string;
  };
}

// Safe Location
export interface SafeLocation {
  id: string;
  name: string;
  address: string;
  locationLat: number;
  locationLng: number;
  locationType: string;
  safetyRating: number;
  isVerified: boolean;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  error?: string;
}

// Location coordinates
export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Create Cash Request payload
export interface CreateCashRequestPayload {
  requestType: RequestType;
  amount: number;
  locationLat: number;
  locationLng: number;
  locationDescription?: string;
  radiusKm?: number;
  specialRequirements?: string;
  minUserRating?: number;
}

// Login payload
export interface LoginPayload {
  phoneNumber: string;
}

// Verify SMS payload
export interface VerifySMSPayload {
  phoneNumber: string;
  code: string;
}
