#!/bin/sh

# Test script for all entity endpoints
# This script tests GET requests to all registered entities in entities.module.ts

# Backend URL - default to localhost:3000 (inside the server container)
BACKEND_URL="${BACKEND_URL:-http://localhost:3000}"

# Admin credentials (from ADMIN_USER env var, format: username:password)
USERNAME="${ADMIN_USER%%:*}"
PASSWORD="${ADMIN_USER#*:}"

# Fallback to defaults if ADMIN_USER is not set
if [ -z "$USERNAME" ]; then
  USERNAME="admin_user"
  PASSWORD="admin_password"
fi

echo "============================================"
echo "API Endpoints Test - $(date)"
echo "Backend: $BACKEND_URL"
echo "============================================"
echo ""

# Login and get cookies
echo "Logging in as '$USERNAME'..."
LOGIN_RESPONSE=$(curl -X POST -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}" \
  -c /tmp/cookies.txt -s "$BACKEND_URL/auth/login")

if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
  echo "✓ Login successful"
else
  echo "✗ Login failed: $LOGIN_RESPONSE"
  exit 1
fi

echo ""
echo "Testing entity endpoints..."
echo ""

# All entity endpoints registered in entities.module.ts
# Route names are snake_case of the entity class name
ENDPOINTS="event event_type event_note gift event_gift class student teacher level_type family_status_type student_class student_by_year family tatnikit unreported_event text audit_log import_file yemot_call mail_address recieved_mail page text_by_user image payment_track user"

# Track results
PASSED=0
FAILED=0
ERRORS=""

# Test each endpoint
for ENDPOINT in $ENDPOINTS; do
  printf "Testing %-35s ... " "$ENDPOINT"

  HTTP_CODE=$(curl -b /tmp/cookies.txt -s -o /tmp/response.json -w "%{http_code}" "$BACKEND_URL/$ENDPOINT")

  if [ "$HTTP_CODE" = "200" ]; then
    echo "✓ OK (HTTP $HTTP_CODE)"
    PASSED=$((PASSED + 1))
  else
    echo "✗ FAILED (HTTP $HTTP_CODE)"
    FAILED=$((FAILED + 1))

    ERRORS="$ERRORS
========================================
Endpoint: $ENDPOINT
HTTP Code: $HTTP_CODE
Response: $(cat /tmp/response.json)
"
  fi
done

echo ""
echo "============================================"
echo "Summary:"
echo "  Passed: $PASSED"
echo "  Failed: $FAILED"
echo "============================================"

if [ $FAILED -gt 0 ]; then
  echo ""
  echo "Error details:"
  echo "$ERRORS"
fi

exit $FAILED
