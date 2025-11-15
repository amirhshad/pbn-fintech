-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phoneNumber" TEXT NOT NULL,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerificationCode" TEXT,
    "phoneVerificationExpiry" DATETIME,
    "fullName" TEXT NOT NULL,
    "dutchIdNumber" TEXT,
    "profilePhotoUrl" TEXT,
    "dateOfBirth" DATETIME,
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "verificationDocuments" TEXT,
    "verifiedAt" DATETIME,
    "trustScore" REAL NOT NULL DEFAULT 0.00,
    "totalTransactions" INTEGER NOT NULL DEFAULT 0,
    "successfulTransactions" INTEGER NOT NULL DEFAULT 0,
    "locationLat" REAL,
    "locationLng" REAL,
    "locationUpdatedAt" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "banReason" TEXT,
    "bannedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastLoginAt" DATETIME
);

-- CreateTable
CREATE TABLE "cash_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "requestType" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "locationLat" REAL NOT NULL,
    "locationLng" REAL NOT NULL,
    "locationDescription" TEXT,
    "radiusKm" INTEGER NOT NULL DEFAULT 5,
    "specialRequirements" TEXT,
    "minUserRating" REAL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cash_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId1" TEXT NOT NULL,
    "requestId2" TEXT NOT NULL,
    "user1Id" TEXT NOT NULL,
    "user2Id" TEXT NOT NULL,
    "matchedAmount" REAL NOT NULL,
    "matchScore" REAL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "agreedLocation" TEXT,
    "agreedLocationLat" REAL,
    "agreedLocationLng" REAL,
    "scheduledTime" DATETIME,
    "user1Accepted" BOOLEAN NOT NULL DEFAULT false,
    "user2Accepted" BOOLEAN NOT NULL DEFAULT false,
    "user1AcceptedAt" DATETIME,
    "user2AcceptedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "expiredAt" DATETIME,
    CONSTRAINT "matches_requestId1_fkey" FOREIGN KEY ("requestId1") REFERENCES "cash_requests" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "matches_requestId2_fkey" FOREIGN KEY ("requestId2") REFERENCES "cash_requests" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matchId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "platformFee" REAL NOT NULL DEFAULT 2.00,
    "transactionCode" TEXT NOT NULL,
    "qrCodeHashGiver" TEXT,
    "qrCodeHashReceiver" TEXT,
    "qrCodeExpiresAt" DATETIME,
    "cashGiverId" TEXT NOT NULL,
    "cashReceiverId" TEXT NOT NULL,
    "giverConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "receiverConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "giverConfirmedAt" DATETIME,
    "receiverConfirmedAt" DATETIME,
    "giverQRScanned" BOOLEAN NOT NULL DEFAULT false,
    "receiverQRScanned" BOOLEAN NOT NULL DEFAULT false,
    "locationVerified" BOOLEAN NOT NULL DEFAULT false,
    "actualMeetingLat" REAL,
    "actualMeetingLng" REAL,
    "locationAccuracyMeters" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "timeoutAt" DATETIME,
    "platformFeeCollected" BOOLEAN NOT NULL DEFAULT false,
    "feeCollectedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "transactions_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "transactions_cashGiverId_fkey" FOREIGN KEY ("cashGiverId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "transactions_cashReceiverId_fkey" FOREIGN KEY ("cashReceiverId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "safe_locations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "locationType" TEXT NOT NULL,
    "description" TEXT,
    "operatingHours" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "safetyRating" REAL NOT NULL DEFAULT 0.00,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "city" TEXT NOT NULL,
    "postalCode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Netherlands',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "disputes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transactionId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reportedAgainstId" TEXT NOT NULL,
    "disputeType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "evidenceUrls" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "priority" INTEGER NOT NULL DEFAULT 1,
    "resolution" TEXT,
    "resolvedBy" TEXT,
    "compensationAmount" REAL,
    "compensationPaid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "resolvedAt" DATETIME,
    CONSTRAINT "disputes_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "disputes_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "disputes_reportedAgainstId_fkey" FOREIGN KEY ("reportedAgainstId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_reviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transactionId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "reviewedUserId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "reviewText" TEXT,
    "reviewType" TEXT NOT NULL,
    "communicationRating" INTEGER,
    "reliabilityRating" INTEGER,
    "safetyRating" INTEGER,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "user_reviews_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_reviews_reviewedUserId_fkey" FOREIGN KEY ("reviewedUserId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matchId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "messageType" TEXT NOT NULL DEFAULT 'text',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chat_messages_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "fee_payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "transactionId" TEXT,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "paymentType" TEXT NOT NULL,
    "paymentMethod" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "dueDate" DATETIME,
    "paidAt" DATETIME,
    "collectedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "fee_payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "fee_payments_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "deviceInfo" TEXT,
    "ipAddress" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phoneNumber_key" ON "users"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "users_dutchIdNumber_key" ON "users"("dutchIdNumber");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_transactionCode_key" ON "transactions"("transactionCode");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_sessionToken_key" ON "user_sessions"("sessionToken");
