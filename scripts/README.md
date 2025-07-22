# Job Posting API Test Suite

A comprehensive test suite that validates all job posting APIs, pagination, caching, and authentication functionality.

## 🧪 What It Tests

### **Infrastructure**
- ✅ Supabase database connection
- ✅ Redis caching connection (optional)
- ✅ Environment variable validation

### **Authentication**
- ✅ User signup functionality
- ✅ User signin functionality
- ✅ Session management

### **Job CRUD Operations**
- ✅ Create job postings
- ✅ Read individual and bulk job postings
- ✅ Update job posting details
- ✅ Delete job postings
- ✅ Toggle job status (Active/Inactive)

### **Pagination & Filtering**
- ✅ Pagination with different page sizes
- ✅ Multiple page navigation
- ✅ Status filtering (Active/Inactive)
- ✅ Job type filtering (Full-Time/Part-Time/Contract)
- ✅ Company name filtering
- ✅ Location filtering
- ✅ Search functionality across title/description/company

### **Redis Caching**
- ✅ Cache write operations
- ✅ Cache read operations with performance metrics
- ✅ Cache invalidation
- ✅ Cache key management

### **Error Handling**
- ✅ Invalid job ID handling
- ✅ Unauthorized access attempts
- ✅ Missing required fields validation
- ✅ Database constraint violations

## 🚀 How to Run

### **Prerequisites**
1. **Environment Variables**: Ensure your `.env.local` file contains:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   REDIS_URL=redis://localhost:6379  # Optional
   ```

2. **Dependencies**: Install required packages:
   ```bash
   npm install
   ```

3. **Redis** (Optional): For caching tests, ensure Redis is running:
   ```bash
   # Using Docker
   docker run -d -p 6379:6379 redis:alpine
   
   # Or install locally
   # Windows: Download from https://redis.io/download
   # Mac: brew install redis
   # Linux: sudo apt-get install redis-server
   ```

### **Running Tests**

#### **Method 1: NPM Script**
```bash
npm run test:api
```

#### **Method 2: Shell Script (Unix/Mac)**
```bash
chmod +x scripts/run-tests.sh
./scripts/run-tests.sh
```

#### **Method 3: Batch File (Windows)**
```cmd
scripts\run-tests.bat
```

#### **Method 4: Direct Execution**
```bash
npx tsx scripts/test-apis.ts
```

## 📊 Sample Output

```
🚀 Starting Job Posting API Test Suite
=====================================

🧪 Testing: Redis Connection
✅ Redis connected successfully (15ms)

🧪 Testing: Supabase Connection
✅ Supabase connected successfully (134ms)

🧪 Testing: User Authentication
✅ User signup successful (892ms)
✅ User signin successful (245ms)

🧪 Testing: Job Creation (CRUD - Create)
ℹ️  Created job 1/5: "Senior Frontend Developer" (156ms)
ℹ️  Created job 2/5: "Backend Engineer" (89ms)
ℹ️  Created job 3/5: "Data Scientist" (92ms)
ℹ️  Created job 4/5: "DevOps Engineer" (88ms)
ℹ️  Created job 5/5: "UI/UX Designer" (85ms)
✅ Created 5 jobs successfully (510ms total)

🧪 Testing: Pagination Functionality
ℹ️  Page 1, Limit 2: 2 items, Total: 5, Pages: 3
ℹ️  Page 1, Limit 3: 3 items, Total: 5, Pages: 2
ℹ️  Page 1, Limit 5: 5 items, Total: 5, Pages: 1
ℹ️  Page 2, Limit 2: 2 items
✅ Pagination testing successful (234ms total)

🧪 Testing: Redis Caching Performance
✅ Cache operations successful - Write: 2ms, Read: 1ms, Delete: 1ms

================================================================================
🧪 TEST SUMMARY
================================================================================

Results: 10 PASSED, 0 FAILED, 0 SKIPPED out of 10 tests

📊 PERFORMANCE METRICS:
   • Total execution time: 2,456ms
   • Redis Connection: 15ms
   • Supabase Connection: 134ms
   • User Authentication: 1,137ms
   • Job Creation: 510ms
   • Job Retrieval: 178ms
   • Pagination: 234ms
   • Filtering: 145ms
   • Caching: 4ms
   • Job Update: 67ms
   • Job Deletion: 32ms

================================================================================
🎉 ALL TESTS PASSED!
================================================================================
```

## 🔧 Test Configuration

### **Test Data**
The test suite creates 5 sample job postings with different:
- Job types (Full-Time, Part-Time, Contract)
- Job statuses (Active, Inactive)
- Companies and locations
- Start and end dates

### **Performance Benchmarks**
- **Database Operations**: < 200ms per operation
- **Cache Operations**: < 5ms per operation
- **Pagination**: < 100ms per page
- **Authentication**: < 1000ms for signup/signin

### **Cleanup**
The test suite automatically:
- Deletes all created test jobs
- Removes the test user account
- Closes database and Redis connections
- Clears any test cache entries

## 🛠️ Troubleshooting

### **Common Issues**

1. **"Redis connection failed"**
   - Ensure Redis is running on the configured port
   - Check REDIS_URL environment variable
   - Tests will continue without Redis (caching tests skipped)

2. **"Supabase connection failed"**
   - Verify NEXT_PUBLIC_SUPABASE_URL is correct
   - Check NEXT_SUPABASE_SERVICE_ROLE_KEY has proper permissions
   - Ensure Supabase project is active

3. **"Authentication required"**
   - Verify service role key has admin permissions
   - Check if email confirmations are disabled for testing

4. **Permission Errors**
   - Ensure the service role key has full database access
   - Check Row Level Security (RLS) policies if enabled

### **Debug Mode**
For verbose output, you can modify the test script to include more detailed logging by setting environment variables:

```bash
DEBUG=true npm run test:api
```

## 📈 Extending Tests

To add new tests:

1. **Add test function** in `scripts/test-apis.ts`
2. **Call function** in the `runTests()` main function
3. **Update documentation** with new test coverage

Example:
```typescript
async function testNewFeature(): Promise<boolean> {
  logTest('New Feature Testing')
  try {
    // Your test logic here
    logSuccess('New feature test passed')
    addTestResult('New Feature', 'PASS', duration)
    return true
  } catch (error) {
    logError(`New feature test failed: ${error}`)
    addTestResult('New Feature', 'FAIL', 0, String(error))
    return false
  }
}
```

## 🎯 Test Coverage

- **API Endpoints**: 100% of job posting endpoints
- **Authentication**: Complete signup/signin flow
- **Database Operations**: All CRUD operations
- **Caching**: Full Redis integration
- **Error Scenarios**: Common failure cases
- **Performance**: Response time validation

This test suite ensures your job posting application is production-ready! 🚀 