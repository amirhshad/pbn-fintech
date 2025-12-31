// Demo data for preview mode (when backend is not available)

export const DEMO_USER = {
  id: 'demo-user-123',
  fullName: 'Alex Johnson',
  phoneNumber: '+31612345678',
  email: 'demo@pbn-fintech.app',
  trustScore: 4.2,
  totalTransactions: 24,
  successfulTransactions: 23,
  verificationStatus: 'FULLY_VERIFIED',
  isActive: true,
  isBanned: false,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-12-30T15:30:00Z',
};

export const DEMO_TOKEN = 'demo-jwt-token-for-preview-mode';

export const DEMO_STATS = {
  totalTransactions: 24,
  successfulTransactions: 23,
  totalAmount: 4850.0,
  trustScore: 4.2,
  activeCashRequests: 2,
  pendingMatches: 1,
  completedThisMonth: 8,
};

export const DEMO_CASH_REQUESTS = [
  {
    id: 'req-1',
    userId: 'user-456',
    requestType: 'HAVE_CASH',
    amount: 150.0,
    currency: 'EUR',
    locationLat: 52.3702,
    locationLng: 4.8952,
    locationDescription: 'Amsterdam Central Station area',
    radiusKm: 5,
    status: 'ACTIVE',
    createdAt: '2024-12-31T09:00:00Z',
    distance: 2.3,
    user: {
      id: 'user-456',
      fullName: 'Maria van Berg',
      trustScore: 4.5,
      totalTransactions: 18,
      verificationStatus: 'FULLY_VERIFIED',
    },
  },
  {
    id: 'req-2',
    userId: 'user-789',
    requestType: 'NEED_CASH',
    amount: 200.0,
    currency: 'EUR',
    locationLat: 52.3676,
    locationLng: 4.9041,
    locationDescription: 'Amsterdam, Waterlooplein',
    radiusKm: 3,
    status: 'ACTIVE',
    createdAt: '2024-12-31T08:30:00Z',
    distance: 1.8,
    user: {
      id: 'user-789',
      fullName: 'Jan de Vries',
      trustScore: 4.8,
      totalTransactions: 32,
      verificationStatus: 'FULLY_VERIFIED',
    },
  },
  {
    id: 'req-3',
    userId: 'user-101',
    requestType: 'HAVE_CASH',
    amount: 300.0,
    currency: 'EUR',
    locationLat: 52.3730,
    locationLng: 4.8920,
    locationDescription: 'Amsterdam, Dam Square',
    radiusKm: 2,
    status: 'ACTIVE',
    createdAt: '2024-12-31T07:45:00Z',
    distance: 0.5,
    user: {
      id: 'user-101',
      fullName: 'Sophie Bakker',
      trustScore: 4.3,
      totalTransactions: 15,
      verificationStatus: 'PHONE_VERIFIED',
    },
  },
];

export const DEMO_MATCHES = [
  {
    id: 'match-1',
    requestId1: 'req-demo-1',
    requestId2: 'req-demo-2',
    user1Id: 'demo-user-123',
    user2Id: 'user-456',
    matchedAmount: 150.0,
    matchScore: 87.5,
    status: 'ACCEPTED',
    user1Accepted: true,
    user2Accepted: true,
    createdAt: '2024-12-30T14:00:00Z',
    request1: {
      id: 'req-demo-1',
      requestType: 'NEED_CASH',
      amount: 150.0,
      locationDescription: 'Amsterdam, near Central Station',
      user: {
        id: 'demo-user-123',
        fullName: 'Alex Johnson',
        trustScore: 4.2,
      },
    },
    request2: {
      id: 'req-demo-2',
      requestType: 'HAVE_CASH',
      amount: 150.0,
      locationDescription: 'Amsterdam Central area',
      user: {
        id: 'user-456',
        fullName: 'Maria van Berg',
        trustScore: 4.5,
        phoneNumber: '+31687654321',
      },
    },
  },
];

export const DEMO_TRANSACTIONS = [
  {
    id: 'tx-1',
    matchId: 'match-completed-1',
    amount: 200.0,
    platformFee: 2.0,
    transactionCode: '742891',
    cashGiverId: 'user-555',
    cashReceiverId: 'demo-user-123',
    giverConfirmed: true,
    receiverConfirmed: true,
    status: 'COMPLETED',
    completedAt: '2024-12-28T16:30:00Z',
    createdAt: '2024-12-28T15:00:00Z',
    cashGiver: {
      id: 'user-555',
      fullName: 'Peter Jansen',
      phoneNumber: '+31698765432',
    },
    cashReceiver: {
      id: 'demo-user-123',
      fullName: 'Alex Johnson',
      phoneNumber: '+31612345678',
    },
  },
  {
    id: 'tx-2',
    matchId: 'match-completed-2',
    amount: 150.0,
    platformFee: 2.0,
    transactionCode: '531267',
    cashGiverId: 'demo-user-123',
    cashReceiverId: 'user-777',
    giverConfirmed: true,
    receiverConfirmed: true,
    status: 'COMPLETED',
    completedAt: '2024-12-25T11:20:00Z',
    createdAt: '2024-12-25T10:00:00Z',
    cashGiver: {
      id: 'demo-user-123',
      fullName: 'Alex Johnson',
      phoneNumber: '+31612345678',
    },
    cashReceiver: {
      id: 'user-777',
      fullName: 'Emma Visser',
      phoneNumber: '+31687651234',
    },
  },
  {
    id: 'tx-3',
    matchId: 'match-1',
    amount: 150.0,
    platformFee: 2.0,
    transactionCode: '892134',
    cashGiverId: 'user-456',
    cashReceiverId: 'demo-user-123',
    giverConfirmed: true,
    receiverConfirmed: false,
    status: 'EXCHANGING',
    createdAt: '2024-12-30T14:30:00Z',
    cashGiver: {
      id: 'user-456',
      fullName: 'Maria van Berg',
      phoneNumber: '+31687654321',
    },
    cashReceiver: {
      id: 'demo-user-123',
      fullName: 'Alex Johnson',
      phoneNumber: '+31612345678',
    },
  },
];

export const isDemoMode = () => {
  return process.env.REACT_APP_DEMO_MODE === 'true';
};
