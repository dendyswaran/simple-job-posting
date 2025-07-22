@echo off
echo 🚀 Job Posting API Test Runner
echo ==============================

REM Check if .env.local exists
if not exist .env.local (
    echo ❌ Error: .env.local file not found!
    echo Please create .env.local with required environment variables:
    echo   - NEXT_PUBLIC_SUPABASE_URL
    echo   - NEXT_SUPABASE_SERVICE_ROLE_KEY
    echo   - REDIS_URL ^(optional^)
    exit /b 1
)

echo 📋 Loading environment variables...

REM Load environment variables from .env.local
for /f "usebackq tokens=1,2 delims==" %%i in (.env.local) do (
    if not "%%i"=="" if not "%%i:~0,1%"=="#" (
        set "%%i=%%j"
    )
)

REM Check required environment variables
if not defined NEXT_PUBLIC_SUPABASE_URL (
    echo ❌ Error: NEXT_PUBLIC_SUPABASE_URL not set
    exit /b 1
)

if not defined NEXT_SUPABASE_SERVICE_ROLE_KEY (
    echo ❌ Error: NEXT_SUPABASE_SERVICE_ROLE_KEY not set
    exit /b 1
)

echo ✅ Environment variables loaded

REM Check if Redis is configured
if defined REDIS_URL (
    echo 🔍 Redis URL configured: %REDIS_URL%
) else (
    echo ⚠️ Redis URL not configured - caching tests will be skipped
)

REM Run the tests
echo 🧪 Starting API tests...
npm run test:api

echo ✨ Test run completed!
pause 