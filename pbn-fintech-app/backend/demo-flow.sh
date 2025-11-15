#!/bin/bash

# PBN Fintech - Complete P2P Flow Demo
# This script demonstrates the entire user journey from cash request to transaction completion

API_URL="http://localhost:3000/api"
ALICE_PHONE="+31612345001"
BOB_PHONE="+31612345002"

echo "🚀 PBN Fintech - P2P Cash Exchange Demo"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Alice logs in (needs cash)
echo -e "${BLUE}📱 Step 1: Alice logs in${NC}"
echo "Alice needs €200 cash in Amsterdam"
ALICE_LOGIN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"$ALICE_PHONE\"}")

ALICE_TOKEN=$(echo $ALICE_LOGIN | grep -o '"token":"[^"]*' | cut -d'"' -f4)
ALICE_ID=$(echo $ALICE_LOGIN | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$ALICE_TOKEN" ]; then
  echo "❌ Alice login failed"
  exit 1
fi

echo -e "${GREEN}✅ Alice logged in successfully${NC}"
echo "   User ID: $ALICE_ID"
echo ""

# Step 2: Bob logs in (has cash)
echo -e "${BLUE}📱 Step 2: Bob logs in${NC}"
echo "Bob has €200 cash available"
BOB_LOGIN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"$BOB_PHONE\"}")

BOB_TOKEN=$(echo $BOB_LOGIN | grep -o '"token":"[^"]*' | cut -d'"' -f4)
BOB_ID=$(echo $BOB_LOGIN | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$BOB_TOKEN" ]; then
  echo "❌ Bob login failed"
  exit 1
fi

echo -e "${GREEN}✅ Bob logged in successfully${NC}"
echo "   User ID: $BOB_ID"
echo ""

# Step 3: Alice posts a NEED_CASH request
echo -e "${BLUE}💰 Step 3: Alice posts cash request (NEED €200)${NC}"
ALICE_REQUEST=$(curl -s -X POST "$API_URL/cash-requests" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -d '{
    "requestType": "NEED_CASH",
    "amount": 200,
    "locationLat": 52.3676,
    "locationLng": 4.9041,
    "locationDescription": "Amsterdam Central Station",
    "radiusKm": 5
  }')

ALICE_REQUEST_ID=$(echo $ALICE_REQUEST | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$ALICE_REQUEST_ID" ]; then
  echo "❌ Alice request creation failed"
  echo "$ALICE_REQUEST"
  exit 1
fi

echo -e "${GREEN}✅ Alice's request created${NC}"
echo "   Request ID: $ALICE_REQUEST_ID"
echo ""

# Step 4: Bob posts a HAVE_CASH request
echo -e "${BLUE}💵 Step 4: Bob posts cash request (HAVE €200)${NC}"
BOB_REQUEST=$(curl -s -X POST "$API_URL/cash-requests" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BOB_TOKEN" \
  -d '{
    "requestType": "HAVE_CASH",
    "amount": 200,
    "locationLat": 52.3702,
    "locationLng": 4.8952,
    "locationDescription": "Dam Square",
    "radiusKm": 5
  }')

BOB_REQUEST_ID=$(echo $BOB_REQUEST | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$BOB_REQUEST_ID" ]; then
  echo "❌ Bob request creation failed"
  echo "$BOB_REQUEST"
  exit 1
fi

echo -e "${GREEN}✅ Bob's request created${NC}"
echo "   Request ID: $BOB_REQUEST_ID"
echo ""

# Step 5: Alice finds potential matches
echo -e "${BLUE}🔍 Step 5: Alice searches for matches${NC}"
MATCHES=$(curl -s -X GET "$API_URL/matches/find/$ALICE_REQUEST_ID" \
  -H "Authorization: Bearer $ALICE_TOKEN")

echo "$MATCHES" | grep -q "$BOB_REQUEST_ID"
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Bob's request found as a potential match!${NC}"
  MATCH_COUNT=$(echo $MATCHES | grep -o '"count":[0-9]*' | cut -d':' -f2)
  echo "   Found $MATCH_COUNT potential match(es)"
else
  echo -e "${YELLOW}⚠️ No matches found. They might be too far apart.${NC}"
fi
echo ""

# Step 6: Alice creates a match
echo -e "${BLUE}🤝 Step 6: Alice creates a match with Bob${NC}"
CREATE_MATCH=$(curl -s -X POST "$API_URL/matches" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -d "{
    \"requestId1\": \"$ALICE_REQUEST_ID\",
    \"requestId2\": \"$BOB_REQUEST_ID\"
  }")

MATCH_ID=$(echo $CREATE_MATCH | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$MATCH_ID" ]; then
  echo "❌ Match creation failed"
  echo "$CREATE_MATCH"
  exit 1
fi

echo -e "${GREEN}✅ Match created!${NC}"
echo "   Match ID: $MATCH_ID"
echo "   Status: PENDING (waiting for Bob to accept)"
echo ""

# Step 7: Alice accepts the match
echo -e "${BLUE}✓ Step 7: Alice accepts the match${NC}"
ALICE_ACCEPT=$(curl -s -X POST "$API_URL/matches/$MATCH_ID/accept" \
  -H "Authorization: Bearer $ALICE_TOKEN")

echo -e "${GREEN}✅ Alice accepted the match${NC}"
echo ""

# Step 8: Bob accepts the match
echo -e "${BLUE}✓ Step 8: Bob accepts the match${NC}"
BOB_ACCEPT=$(curl -s -X POST "$API_URL/matches/$MATCH_ID/accept" \
  -H "Authorization: Bearer $BOB_TOKEN")

MATCH_STATUS=$(echo $BOB_ACCEPT | grep -o '"status":"[^"]*' | cut -d'"' -f4)

if [ "$MATCH_STATUS" = "ACCEPTED" ]; then
  echo -e "${GREEN}✅ Both parties accepted! Match is now ACCEPTED${NC}"
  echo "   Ready to create transaction"
else
  echo "❌ Match acceptance failed"
  exit 1
fi
echo ""

# Step 9: Create transaction
echo -e "${BLUE}💳 Step 9: Creating transaction${NC}"
CREATE_TRANSACTION=$(curl -s -X POST "$API_URL/transactions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -d "{\"matchId\": \"$MATCH_ID\"}")

TRANSACTION_ID=$(echo $CREATE_TRANSACTION | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
TRANSACTION_CODE=$(echo $CREATE_TRANSACTION | grep -o '"transactionCode":"[^"]*' | cut -d'"' -f4)

if [ -z "$TRANSACTION_ID" ]; then
  echo "❌ Transaction creation failed"
  echo "$CREATE_TRANSACTION"
  exit 1
fi

echo -e "${GREEN}✅ Transaction created!${NC}"
echo "   Transaction ID: $TRANSACTION_ID"
echo "   Verification Code: $TRANSACTION_CODE"
echo "   Status: PENDING"
echo ""

# Step 10: Bob confirms (cash giver)
echo -e "${BLUE}✓ Step 10: Bob confirms transaction (as cash giver)${NC}"
BOB_CONFIRM=$(curl -s -X POST "$API_URL/transactions/$TRANSACTION_ID/confirm" \
  -H "Authorization: Bearer $BOB_TOKEN")

echo -e "${GREEN}✅ Bob confirmed (gave €200 cash)${NC}"
echo ""

# Step 11: Alice confirms (cash receiver)
echo -e "${BLUE}✓ Step 11: Alice confirms transaction (as cash receiver)${NC}"
ALICE_CONFIRM=$(curl -s -X POST "$API_URL/transactions/$TRANSACTION_ID/confirm" \
  -H "Authorization: Bearer $ALICE_TOKEN")

TRANSACTION_STATUS=$(echo $ALICE_CONFIRM | grep -o '"status":"[^"]*' | cut -d'"' -f4)

if [ "$TRANSACTION_STATUS" = "COMPLETED" ]; then
  echo -e "${GREEN}✅ Transaction COMPLETED!${NC}"
  echo ""
  echo -e "${GREEN}🎉 Success! P2P cash exchange complete!${NC}"
  echo ""
  echo "Summary:"
  echo "  - Alice received €200 cash from Bob"
  echo "  - Bob gave €200 cash to Alice"
  echo "  - Both users' transaction counts updated"
  echo "  - Platform fee: €2 (€1 from each user)"
else
  echo "❌ Transaction completion failed"
  echo "Status: $TRANSACTION_STATUS"
  exit 1
fi
echo ""

# Step 12: View final transaction
echo -e "${BLUE}📊 Step 12: View final transaction details${NC}"
FINAL_TRANSACTION=$(curl -s -X GET "$API_URL/transactions/$TRANSACTION_ID" \
  -H "Authorization: Bearer $ALICE_TOKEN")

echo "$FINAL_TRANSACTION" | python3 -m json.tool 2>/dev/null || echo "$FINAL_TRANSACTION"
echo ""

echo "=========================================="
echo -e "${GREEN}✨ Demo completed successfully!${NC}"
echo ""
echo "What just happened:"
echo "  1. ✅ Alice posted NEED_CASH request (€200)"
echo "  2. ✅ Bob posted HAVE_CASH request (€200)"
echo "  3. ✅ System matched them (within 5km)"
echo "  4. ✅ Both accepted the match"
echo "  5. ✅ Transaction created with verification code"
echo "  6. ✅ Both confirmed cash exchange"
echo "  7. ✅ Transaction completed successfully!"
echo ""
echo "🎯 This demonstrates the core P2P cash matching flow!"
