# Feature 1: User Authentication - Testing Guide

## 🎯 **What We Built**

A simplified, working authentication system with:
- ✅ User registration with Dutch phone validation
- ✅ Phone verification with test codes (no SMS integration needed)
- ✅ JWT token authentication
- ✅ Protected routes
- ✅ User login for returning users

## 🚀 **Quick Start Testing**

### **1. Setup Environment**
```bash
cd "/Users/amir/My Projects/PBN Fintech/pbn-fintech-app/backend"

# Use simplified package.json
cp package-simple.json package.json

# Install dependencies
npm install
```

### **2. Database Setup**
```bash
# Start PostgreSQL
cd ..
docker-compose up postgres -d

# Setup database
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### **3. Start Server**
```bash
# Run simplified auth service
npm run dev

# Should see:
# 🚀 PBN Fintech Auth Service running on port 3000
# Health check: http://localhost:3000/health
# Database test: http://localhost:3000/db-test
```

### **4. Test Authentication Flow**

**Option A: Automated Testing**
```bash
# Make script executable
chmod +x test-auth.sh

# Run complete test suite
./test-auth.sh
```

**Option B: Manual Testing**

**Step 1: Health Check**
```bash
curl http://localhost:3000/health
# Expected: {"status":"OK","timestamp":"...","service":"PBN Fintech Auth Service"}
```

**Step 2: Database Test**
```bash
curl http://localhost:3000/db-test
# Expected: {"success":true,"message":"Database connection working"}
```

**Step 3: User Registration**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+31612345678",
    "fullName": "Test User",
    "dateOfBirth": "1990-01-01"
  }'

# Expected: 
# {
#   "success": true,
#   "message": "User registered successfully...",
#   "data": {
#     "userId": "...",
#     "verificationCode": "123456" // Check console logs
#   }
# }
```

**Step 4: Phone Verification**
```bash
# Use the verification code from Step 3 response
curl -X POST http://localhost:3000/api/auth/verify-phone \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+31612345678",
    "code": "123456"
  }'

# Expected:
# {
#   "success": true,
#   "message": "Phone number verified successfully",
#   "data": {
#     "token": "eyJ...", // JWT token
#     "user": { ... }
#   }
# }
```

**Step 5: Get Profile (Protected)**
```bash
# Use the token from Step 4
curl http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer eyJ..."

# Expected: User profile data
```

**Step 6: Login (Returning User)**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+31612345678"
  }'

# Expected: New JWT token and user data
```

## ✅ **Success Criteria**

The authentication system is working if:

- [x] Server starts without errors
- [x] Health endpoints respond correctly  
- [x] Database connection works
- [x] User registration validates Dutch phone numbers
- [x] Verification codes are generated and stored
- [x] Phone verification updates user status
- [x] JWT tokens are generated correctly
- [x] Protected routes require valid tokens
- [x] User login works for verified users

## 🐛 **Common Issues & Solutions**

### **Issue: "Cannot find module"**
```bash
npm install --save-dev @types/morgan
```

### **Issue: Database connection fails**
```bash
docker-compose up postgres -d
npx prisma generate
npx prisma migrate reset --force
```

### **Issue: Phone validation fails**
```bash
# Make sure phone number format is: +31XXXXXXXXX
# Example: +31612345678 (11 digits total)
```

### **Issue: JWT errors**
```bash
# Check that JWT_SECRET is set in environment
# For testing, it defaults to 'pbn-fintech-test-secret-key'
```

## 📊 **Test Results Checklist**

After running tests, verify:

- [ ] All 6 test endpoints return success responses
- [ ] User is created in database with correct data
- [ ] Phone verification status updates correctly
- [ ] JWT token can access protected routes
- [ ] Login works with existing users
- [ ] Error handling works for invalid inputs

## 🚀 **Next Steps**

Once Feature 1 is 100% working:
1. ✅ Mark authentication as complete
2. 🚀 Begin Feature 2: Cash Requests
3. 🔗 Integrate authentication with cash requests

## 💡 **Key Features of This Implementation**

**What Works:**
- ✅ Pure P2P focus (no unnecessary complexity)
- ✅ Dutch phone number validation
- ✅ Test mode (no SMS service required)
- ✅ JWT authentication
- ✅ Database integration
- ✅ Error handling
- ✅ Comprehensive testing

**What's Simplified:**
- 📱 SMS codes shown in logs (not sent via SMS)
- 🔐 Basic JWT (no session management yet)
- 📊 Minimal user data (focus on core auth)

This gives us a solid foundation to build Feature 2 on!