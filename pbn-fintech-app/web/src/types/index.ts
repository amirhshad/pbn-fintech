export interface User {
  id: string;
  phoneNumber: string;
  fullName: string;
  phoneVerified: boolean;
  verificationStatus: 'PENDING' | 'PHONE_VERIFIED' | 'ID_VERIFIED' | 'FULLY_VERIFIED' | 'REJECTED';
  trustScore: number;
  totalTransactions: number;
  successfulTransactions: number;
  locationLat?: number;
  locationLng?: number;
  profilePhotoUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CashRequest {
  id: string;
  userId: string;
  requestType: 'NEED_CASH' | 'HAVE_CASH';
  amount: number;
  currency: string;
  locationLat: number;
  locationLng: number;
  locationDescription?: string;
  radiusKm: number;
  specialRequirements?: string;
  minUserRating?: number;
  status: 'ACTIVE' | 'MATCHED' | 'EXPIRED' | 'CANCELLED';
  expiresAt: string;
  createdAt: string;
  user?: User;
}

export interface Match {
  id: string;
  requestId1: string;
  requestId2: string;
  user1Id: string;
  user2Id: string;
  matchedAmount: number;
  matchScore: number;
  status: 'PENDING' | 'ACCEPTED' | 'MEETING' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  agreedLocation?: string;
  agreedLocationLat?: number;
  agreedLocationLng?: number;
  scheduledTime?: string;
  user1Accepted: boolean;
  user2Accepted: boolean;
  createdAt: string;
  request1?: CashRequest;
  request2?: CashRequest;
  user1?: User;
  user2?: User;
}

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
  giverQRScanned: boolean;
  receiverQRScanned: boolean;
  locationVerified: boolean;
  status: 'PENDING' | 'MEETING' | 'EXCHANGING' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED' | 'TIMEOUT';
  qrCodeExpiresAt: string;
  createdAt: string;
  completedAt?: string;
  match?: Match;
  cashGiver?: User;
  cashReceiver?: User;
}

export interface UserStats {
  totalTransactions: number;
  successfulTransactions: number;
  trustScore: number;
  averageRating: number;
  completionRate: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ApiError {
  message: string;
  status?: number;
}
