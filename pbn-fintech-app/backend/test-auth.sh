#!/bin/bash

echo "🧪 Testing PBN Fintech Authentication System"
echo "=========================================="

BASE_URL="http://localhost:3000"

# Test 1: Health Check
echo "Test 1: Health Check"
curl -s "$BASE_URL/health" | jq '.'
echo ""

# Test 2: Database Connection
echo "Test 2: Database Connection"
curl -s "$BASE_URL/db-test" | jq '.'
echo ""

# Test 3: Auth Health Check
echo "Test 3: Auth Service Health"
curl -s "$BASE_URL/api/auth/health" | jq '.'
echo ""

# Test 4: User Registration
echo "Test 4: User Registration"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+31612345678",
    "fullName": "Test User",
    "dateOfBirth": "1990-01-01"
  }')

echo "$REGISTER_RESPONSE" | jq '.'

# Extract verification code from response
VERIFICATION_CODE=$(echo "$REGISTER_RESPONSE" | jq -r '.data.verificationCode')
echo "Verification Code: $VERIFICATION_CODE"
echo ""

# Test 5: Phone Verification
echo "Test 5: Phone Verification"
VERIFY_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/verify-phone" \
  -H "Content-Type: application/json" \
  -d "{
    \"phoneNumber\": \"+31612345678\",
    \"code\": \"$VERIFICATION_CODE\"
  }")

echo "$VERIFY_RESPONSE" | jq '.'

# Extract token from response
TOKEN=$(echo "$VERIFY_RESPONSE" | jq -r '.data.token')
echo "JWT Token: $TOKEN"
echo ""

# Test 6: Get Profile (Protected Route)
echo "Test 6: Get User Profile (Protected)"
curl -s "$BASE_URL/api/auth/profile" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Test 7: Login User
echo "Test 7: User Login"
curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+31612345678"
  }' | jq '.'
echo ""

echo "✅ Authentication tests completed!"
echo "Check above for any errors or issues."