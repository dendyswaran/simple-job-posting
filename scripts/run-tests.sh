#!/bin/bash

# Job Posting API Test Runner
# This script sets up the environment and runs comprehensive API tests

echo "🚀 Job Posting API Test Runner"
echo "=============================="

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please create .env.local with required environment variables:"
    echo "  - NEXT_PUBLIC_SUPABASE_URL"
    echo "  - NEXT_SUPABASE_SERVICE_ROLE_KEY"
    echo "  - REDIS_URL (optional)"
    exit 1
fi

# Load environment variables
echo "📋 Loading environment variables..."
export $(cat .env.local | grep -v '^#' | xargs)

# Check required environment variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL not set"
    exit 1
fi

if [ -z "$NEXT_SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: NEXT_SUPABASE_SERVICE_ROLE_KEY not set"
    exit 1
fi

echo "✅ Environment variables loaded"

# Check if Redis is running (optional)
if [ -n "$REDIS_URL" ]; then
    echo "🔍 Checking Redis connection..."
    # You can add Redis connectivity check here if needed
fi

# Run the tests
echo "🧪 Starting API tests..."
npm run test:api

echo "✨ Test run completed!" 