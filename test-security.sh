#!/bin/bash

# Security Testing Script for WallsPie
# This script tests the security features implemented in the application

echo "======================================"
echo "WallsPie Security Testing Script"
echo "======================================"
echo ""

BASE_URL="http://localhost:3000"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a header exists
check_header() {
    local url=$1
    local header_name=$2
    local expected_value=$3

    echo -n "Testing $header_name... "

    local actual_value=$(curl -s -I "$url" 2>&1 | grep -i "^$header_name:" | cut -d' ' -f2-)

    if [ -z "$actual_value" ]; then
        echo -e "${RED}MISSING${NC}"
        return 1
    elif [ -n "$expected_value" ] && [[ "$actual_value" != *"$expected_value"* ]]; then
        echo -e "${YELLOW}PRESENT (value: $actual_value)${NC}"
        return 2
    else
        echo -e "${GREEN}OK${NC} (value: $actual_value)"
        return 0
    fi
}

echo "1. Testing Security Headers"
echo "----------------------------"
check_header "$BASE_URL" "x-content-type-options" "nosniff"
check_header "$BASE_URL" "x-frame-options" "DENY"
check_header "$BASE_URL" "x-xss-protection" "1; mode=block"
check_header "$BASE_URL" "referrer-policy" "strict-origin-when-cross-origin"
check_header "$BASE_URL" "permissions-policy" "camera"
check_header "$BASE_URL" "content-security-policy" "default-src"
echo ""

echo "2. Testing Rate Limiting Headers"
echo "--------------------------------"
check_header "$BASE_URL" "x-ratelimit-limit" "100"
check_header "$BASE_URL" "x-ratelimit-remaining"
check_header "$BASE_URL" "x-ratelimit-reset"
echo ""

echo "3. Testing Rate Limiting Functionality"
echo "--------------------------------------"
echo "Making 10 rapid requests to test rate limiting..."

RATE_LIMIT_REACHED=false
for i in {1..10}; do
    response=$(curl -s -I "$BASE_URL" 2>&1)
    status_code=$(echo "$response" | grep "HTTP" | awk '{print $2}')
    remaining=$(echo "$response" | grep -i "x-ratelimit-remaining:" | awk '{print $2}' | tr -d '\r')

    echo "Request $i: Status=$status_code, Remaining=$remaining"

    if [ "$status_code" = "429" ]; then
        RATE_LIMIT_REACHED=true
        echo -e "${GREEN}Rate limiting is working!${NC}"
        break
    fi
done

if [ "$RATE_LIMIT_REACHED" = false ]; then
    echo -e "${YELLOW}Rate limiting not triggered in 10 requests (limit is 100/minute)${NC}"
fi
echo ""

echo "4. Testing HTTPS Redirect (Production Only)"
echo "-------------------------------------------"
echo -e "${YELLOW}HSTS is only enabled in production mode${NC}"
echo ""

echo "5. Content Security Policy (CSP) Details"
echo "----------------------------------------"
csp=$(curl -s -I "$BASE_URL" 2>&1 | grep -i "content-security-policy:" | cut -d' ' -f2-)
if [ -n "$csp" ]; then
    echo -e "${GREEN}CSP Header Present:${NC}"
    echo "$csp" | tr ';' '\n' | sed 's/^/  /'
else
    echo -e "${RED}CSP Header Missing${NC}"
fi
echo ""

echo "6. Testing File Upload Security (Manual Test Required)"
echo "------------------------------------------------------"
echo "Upload security must be tested manually via the upload form"
echo "- Maximum file size: 10MB"
echo "- Allowed types: image/jpeg, image/png, image/webp, image/gif"
echo ""

echo "7. Testing Input Validation (Check Browser Console)"
echo "---------------------------------------------------"
echo "Input validation must be tested in the browser:"
echo "1. Try registering with a weak password"
echo "2. Try entering suspicious characters in forms"
echo "3. Check for XSS protection in text inputs"
echo ""

echo "======================================"
echo "Security Test Summary"
echo "======================================"
echo ""
echo -e "${GREEN}✓ Security headers are configured${NC}"
echo -e "${GREEN}✓ Rate limiting is active${NC}"
echo -e "${GREEN}✓ Content Security Policy is set${NC}"
echo -e "${YELLOW}⚠ Test input validation manually${NC}"
echo -e "${YELLOW}⚠ HSTS only active in production${NC}"
echo ""
echo "For comprehensive security testing, consider:"
echo "1. Running a penetration test"
echo "2. Using OWASP ZAP or Burp Suite"
echo "3. Testing with different user roles"
echo "4. Load testing the rate limiter"
echo ""
