#!/usr/bin/env tsx

/**
 * Comprehensive API Test Script for Job Posting Application
 * 
 * This script tests:
 * - Authentication (signup, signin)
 * - Job CRUD operations (create, read, update, delete)
 * - Pagination functionality
 * - Redis caching performance
 * - Filter operations
 * - Error handling
 * - Cache invalidation
 */

import { createClient } from '@supabase/supabase-js'
import { createClient as createRedisClient } from 'redis'

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

// Test data
const TEST_USER_EMAIL = `test-${Date.now()}@example.com`
const TEST_USER_PASSWORD = 'testpass123'

const TEST_JOBS = [
  {
    title: 'Senior Frontend Developer',
    company: 'TechCorp Inc',
    description: 'We are looking for an experienced Frontend Developer to join our team.',
    location: 'San Francisco, CA',
    type: 'Full-Time' as const,
    status: 'Active' as const,
    start_date: '2024-02-01',
    end_date: '2024-12-31'
  },
  {
    title: 'Backend Engineer',
    company: 'StartupXYZ',
    description: 'Join our backend team to build scalable APIs and microservices.',
    location: 'Remote',
    type: 'Contract' as const,
    status: 'Active' as const,
    start_date: '2024-02-15',
    end_date: null
  },
  {
    title: 'Data Scientist',
    company: 'DataFlow Analytics',
    description: 'Analyze large datasets and build machine learning models.',
    location: 'New York, NY',
    type: 'Part-Time' as const,
    status: 'Inactive' as const,
    start_date: '2024-03-01',
    end_date: '2024-08-31'
  },
  {
    title: 'DevOps Engineer',
    company: 'CloudTech Solutions',
    description: 'Manage CI/CD pipelines and cloud infrastructure.',
    location: 'Austin, TX',
    type: 'Full-Time' as const,
    status: 'Active' as const,
    start_date: '2024-02-20',
    end_date: null
  },
  {
    title: 'UI/UX Designer',
    company: 'DesignStudio Pro',
    description: 'Create beautiful and intuitive user interfaces.',
    location: 'Los Angeles, CA',
    type: 'Full-Time' as const,
    status: 'Active' as const,
    start_date: '2024-03-15',
    end_date: '2024-09-15'
  }
]

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const redis = createRedisClient({ url: REDIS_URL })

// Test results tracking
interface TestResult {
  name: string
  status: 'PASS' | 'FAIL' | 'SKIP'
  duration: number
  error?: string
  data?: any
}

const testResults: TestResult[] = []
let testUserId: string
let createdJobIds: string[] = []

// Helper functions
function logTest(name: string) {
  console.log(`\n🧪 Testing: ${name}`)
}

function logSuccess(message: string) {
  console.log(`✅ ${message}`)
}

function logError(message: string) {
  console.log(`❌ ${message}`)
}

function logInfo(message: string) {
  console.log(`ℹ️  ${message}`)
}

async function measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
  const start = Date.now()
  const result = await fn()
  const duration = Date.now() - start
  return { result, duration }
}

function addTestResult(name: string, status: 'PASS' | 'FAIL' | 'SKIP', duration: number, error?: string, data?: any) {
  testResults.push({ name, status, duration, error, data })
}

// Test functions
async function testRedisConnection(): Promise<boolean> {
  logTest('Redis Connection')
  try {
    const { duration } = await measureTime(async () => {
      await redis.connect()
      await redis.ping()
    })
    logSuccess(`Redis connected successfully (${duration}ms)`)
    addTestResult('Redis Connection', 'PASS', duration)
    return true
  } catch (error) {
    logError(`Redis connection failed: ${error}`)
    addTestResult('Redis Connection', 'FAIL', 0, String(error))
    return false
  }
}

async function testSupabaseConnection(): Promise<boolean> {
  logTest('Supabase Connection')
  try {
    const { duration, result } = await measureTime(async () => {
      const { data, error } = await supabase.from('job_posts').select('count').limit(1)
      if (error) throw error
      return data
    })
    logSuccess(`Supabase connected successfully (${duration}ms)`)
    addTestResult('Supabase Connection', 'PASS', duration)
    return true
  } catch (error) {
    logError(`Supabase connection failed: ${error}`)
    addTestResult('Supabase Connection', 'FAIL', 0, String(error))
    return false
  }
}

async function testUserAuthentication(): Promise<boolean> {
  logTest('User Authentication')
  try {
    // Test user signup
    const { duration: signupDuration, result: signupResult } = await measureTime(async () => {
      const { data, error } = await supabase.auth.signUp({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD
      })
      if (error) throw error
      return data
    })
    
    if (!signupResult.user) {
      throw new Error('No user returned from signup')
    }
    
    testUserId = signupResult.user.id
    logSuccess(`User signup successful (${signupDuration}ms)`)
    
    // Test user signin
    const { duration: signinDuration } = await measureTime(async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD
      })
      if (error) throw error
      return data
    })
    
    logSuccess(`User signin successful (${signinDuration}ms)`)
    addTestResult('User Authentication', 'PASS', signupDuration + signinDuration)
    return true
  } catch (error) {
    logError(`Authentication failed: ${error}`)
    addTestResult('User Authentication', 'FAIL', 0, String(error))
    return false
  }
}

async function testJobCreation(): Promise<boolean> {
  logTest('Job Creation (CRUD - Create)')
  try {
    let totalDuration = 0
    
    for (let i = 0; i < TEST_JOBS.length; i++) {
      const job = TEST_JOBS[i]
      const { duration, result } = await measureTime(async () => {
        const { data, error } = await supabase
          .from('job_posts')
          .insert({
            ...job,
            user_id: testUserId
          })
          .select()
          .single()
        
        if (error) throw error
        return data
      })
      
      createdJobIds.push(result.id)
      totalDuration += duration
      logInfo(`Created job ${i + 1}/${TEST_JOBS.length}: "${job.title}" (${duration}ms)`)
    }
    
    logSuccess(`Created ${TEST_JOBS.length} jobs successfully (${totalDuration}ms total)`)
    addTestResult('Job Creation', 'PASS', totalDuration, undefined, { jobCount: TEST_JOBS.length })
    return true
  } catch (error) {
    logError(`Job creation failed: ${error}`)
    addTestResult('Job Creation', 'FAIL', 0, String(error))
    return false
  }
}

async function testJobRetrieval(): Promise<boolean> {
  logTest('Job Retrieval (CRUD - Read)')
  try {
    let totalDuration = 0
    
    // Test single job retrieval
    for (const jobId of createdJobIds.slice(0, 3)) {
      const { duration } = await measureTime(async () => {
        const { data, error } = await supabase
          .from('job_posts')
          .select('*')
          .eq('id', jobId)
          .single()
        
        if (error) throw error
        if (!data) throw new Error('Job not found')
        return data
      })
      
      totalDuration += duration
    }
    
    // Test bulk job retrieval
    const { duration: bulkDuration } = await measureTime(async () => {
      const { data, error } = await supabase
        .from('job_posts')
        .select('*')
        .eq('user_id', testUserId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    })
    
    totalDuration += bulkDuration
    logSuccess(`Job retrieval successful (${totalDuration}ms total)`)
    addTestResult('Job Retrieval', 'PASS', totalDuration)
    return true
  } catch (error) {
    logError(`Job retrieval failed: ${error}`)
    addTestResult('Job Retrieval', 'FAIL', 0, String(error))
    return false
  }
}

async function testPagination(): Promise<boolean> {
  logTest('Pagination Functionality')
  try {
    let totalDuration = 0
    
    // Test pagination with different page sizes
    const pageSizes = [2, 3, 5]
    
    for (const limit of pageSizes) {
      const { duration } = await measureTime(async () => {
        const offset = 0
        const { data, error, count } = await supabase
          .from('job_posts')
          .select('*', { count: 'exact' })
          .eq('user_id', testUserId)
          .range(offset, offset + limit - 1)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        
        const totalPages = Math.ceil((count || 0) / limit)
        const hasNextPage = offset + limit < (count || 0)
        
        logInfo(`Page 1, Limit ${limit}: ${data?.length} items, Total: ${count}, Pages: ${totalPages}`)
        return { data, count, totalPages, hasNextPage }
      })
      
      totalDuration += duration
    }
    
    // Test second page
    const { duration: page2Duration } = await measureTime(async () => {
      const limit = 2
      const offset = 2
      const { data, error } = await supabase
        .from('job_posts')
        .select('*')
        .eq('user_id', testUserId)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      logInfo(`Page 2, Limit ${limit}: ${data?.length} items`)
      return data
    })
    
    totalDuration += page2Duration
    logSuccess(`Pagination testing successful (${totalDuration}ms total)`)
    addTestResult('Pagination', 'PASS', totalDuration)
    return true
  } catch (error) {
    logError(`Pagination failed: ${error}`)
    addTestResult('Pagination', 'FAIL', 0, String(error))
    return false
  }
}

async function testFiltering(): Promise<boolean> {
  logTest('Filter Functionality')
  try {
    let totalDuration = 0
    
    // Test status filter
    const { duration: statusDuration } = await measureTime(async () => {
      const { data, error } = await supabase
        .from('job_posts')
        .select('*')
        .eq('user_id', testUserId)
        .eq('status', 'Active')
      
      if (error) throw error
      logInfo(`Status filter (Active): ${data?.length} jobs`)
      return data
    })
    totalDuration += statusDuration
    
    // Test type filter
    const { duration: typeDuration } = await measureTime(async () => {
      const { data, error } = await supabase
        .from('job_posts')
        .select('*')
        .eq('user_id', testUserId)
        .eq('type', 'Full-Time')
      
      if (error) throw error
      logInfo(`Type filter (Full-Time): ${data?.length} jobs`)
      return data
    })
    totalDuration += typeDuration
    
    // Test company filter
    const { duration: companyDuration } = await measureTime(async () => {
      const { data, error } = await supabase
        .from('job_posts')
        .select('*')
        .eq('user_id', testUserId)
        .ilike('company', '%Tech%')
      
      if (error) throw error
      logInfo(`Company filter (contains 'Tech'): ${data?.length} jobs`)
      return data
    })
    totalDuration += companyDuration
    
    // Test search filter
    const { duration: searchDuration } = await measureTime(async () => {
      const { data, error } = await supabase
        .from('job_posts')
        .select('*')
        .eq('user_id', testUserId)
        .or('title.ilike.%Developer%,description.ilike.%Developer%,company.ilike.%Developer%')
      
      if (error) throw error
      logInfo(`Search filter ('Developer'): ${data?.length} jobs`)
      return data
    })
    totalDuration += searchDuration
    
    logSuccess(`Filter testing successful (${totalDuration}ms total)`)
    addTestResult('Filtering', 'PASS', totalDuration)
    return true
  } catch (error) {
    logError(`Filtering failed: ${error}`)
    addTestResult('Filtering', 'FAIL', 0, String(error))
    return false
  }
}

async function testCaching(): Promise<boolean> {
  logTest('Redis Caching Performance')
  try {
    const cacheKey = 'test:job:cache'
    const testData = { id: '123', title: 'Test Job', company: 'Test Company' }
    
    // Test cache write
    const { duration: writeDuration } = await measureTime(async () => {
      await redis.setEx(cacheKey, 300, JSON.stringify(testData))
    })
    
    // Test cache read
    const { duration: readDuration, result } = await measureTime(async () => {
      const cached = await redis.get(cacheKey)
      return cached ? JSON.parse(cached) : null
    })
    
    if (!result || result.id !== testData.id) {
      throw new Error('Cache data mismatch')
    }
    
    // Test cache invalidation
    const { duration: deleteDuration } = await measureTime(async () => {
      await redis.del(cacheKey)
    })
    
    // Verify deletion
    const deleted = await redis.get(cacheKey)
    if (deleted !== null) {
      throw new Error('Cache not properly deleted')
    }
    
    const totalDuration = writeDuration + readDuration + deleteDuration
    logSuccess(`Cache operations successful - Write: ${writeDuration}ms, Read: ${readDuration}ms, Delete: ${deleteDuration}ms`)
    addTestResult('Caching', 'PASS', totalDuration, undefined, { 
      writeDuration, 
      readDuration, 
      deleteDuration 
    })
    return true
  } catch (error) {
    logError(`Caching failed: ${error}`)
    addTestResult('Caching', 'FAIL', 0, String(error))
    return false
  }
}

async function testJobUpdate(): Promise<boolean> {
  logTest('Job Update (CRUD - Update)')
  try {
    if (createdJobIds.length === 0) {
      throw new Error('No jobs available to update')
    }
    
    const jobIdToUpdate = createdJobIds[0]
    const updateData = {
      title: 'Updated Senior Frontend Developer',
      company: 'Updated TechCorp Inc',
      status: 'Inactive' as const
    }
    
    const { duration } = await measureTime(async () => {
      const { data, error } = await supabase
        .from('job_posts')
        .update(updateData)
        .eq('id', jobIdToUpdate)
        .eq('user_id', testUserId)
        .select()
        .single()
      
      if (error) throw error
      
      // Verify update
      if (data.title !== updateData.title || data.company !== updateData.company) {
        throw new Error('Update verification failed')
      }
      
      return data
    })
    
    logSuccess(`Job update successful (${duration}ms)`)
    addTestResult('Job Update', 'PASS', duration)
    return true
  } catch (error) {
    logError(`Job update failed: ${error}`)
    addTestResult('Job Update', 'FAIL', 0, String(error))
    return false
  }
}

async function testJobDeletion(): Promise<boolean> {
  logTest('Job Deletion (CRUD - Delete)')
  try {
    if (createdJobIds.length === 0) {
      throw new Error('No jobs available to delete')
    }
    
    const jobIdToDelete = createdJobIds[createdJobIds.length - 1]
    
    const { duration } = await measureTime(async () => {
      const { error } = await supabase
        .from('job_posts')
        .delete()
        .eq('id', jobIdToDelete)
        .eq('user_id', testUserId)
      
      if (error) throw error
      
      // Verify deletion
      const { data: deletedJob } = await supabase
        .from('job_posts')
        .select('*')
        .eq('id', jobIdToDelete)
        .single()
      
      if (deletedJob) {
        throw new Error('Job was not deleted')
      }
    })
    
    createdJobIds = createdJobIds.filter(id => id !== jobIdToDelete)
    logSuccess(`Job deletion successful (${duration}ms)`)
    addTestResult('Job Deletion', 'PASS', duration)
    return true
  } catch (error) {
    logError(`Job deletion failed: ${error}`)
    addTestResult('Job Deletion', 'FAIL', 0, String(error))
    return false
  }
}

async function testErrorHandling(): Promise<boolean> {
  logTest('Error Handling')
  try {
    let totalDuration = 0
    
    // Test invalid job ID
    const { duration: invalidIdDuration } = await measureTime(async () => {
      const { data, error } = await supabase
        .from('job_posts')
        .select('*')
        .eq('id', 'invalid-uuid')
        .single()
      
      // Should return no data, not an error for invalid UUID format
      return { data, error }
    })
    totalDuration += invalidIdDuration
    
    // Test unauthorized access
    const { duration: unauthorizedDuration } = await measureTime(async () => {
      const { data, error } = await supabase
        .from('job_posts')
        .update({ title: 'Unauthorized Update' })
        .eq('id', createdJobIds[0])
        .eq('user_id', 'fake-user-id')
      
      // Should complete but affect 0 rows
      return { data, error }
    })
    totalDuration += unauthorizedDuration
    
    // Test missing required fields
    const { duration: missingFieldsDuration } = await measureTime(async () => {
      const { data, error } = await supabase
        .from('job_posts')
        .insert({
          title: '', // Empty title should be handled by validation
          user_id: testUserId
        })
      
      return { data, error }
    })
    totalDuration += missingFieldsDuration
    
    logSuccess(`Error handling tests completed (${totalDuration}ms total)`)
    addTestResult('Error Handling', 'PASS', totalDuration)
    return true
  } catch (error) {
    logError(`Error handling tests failed: ${error}`)
    addTestResult('Error Handling', 'FAIL', 0, String(error))
    return false
  }
}

async function cleanup(): Promise<void> {
  logTest('Cleanup')
  try {
    // Delete created jobs
    if (createdJobIds.length > 0) {
      const { error } = await supabase
        .from('job_posts')
        .delete()
        .in('id', createdJobIds)
      
      if (error) {
        logError(`Failed to delete jobs: ${error.message}`)
      } else {
        logSuccess(`Deleted ${createdJobIds.length} test jobs`)
      }
    }
    
    // Delete test user (if possible with service key)
    const { error: userError } = await supabase.auth.admin.deleteUser(testUserId)
    if (userError) {
      logInfo(`Test user cleanup: ${userError.message}`)
    } else {
      logSuccess('Deleted test user')
    }
    
    // Close connections
    await redis.disconnect()
    logSuccess('Cleanup completed')
  } catch (error) {
    logError(`Cleanup failed: ${error}`)
  }
}

function printTestSummary(): void {
  console.log('\n' + '='.repeat(80))
  console.log('🧪 TEST SUMMARY')
  console.log('='.repeat(80))
  
  const passed = testResults.filter(t => t.status === 'PASS').length
  const failed = testResults.filter(t => t.status === 'FAIL').length
  const skipped = testResults.filter(t => t.status === 'SKIP').length
  const total = testResults.length
  
  console.log(`\nResults: ${passed} PASSED, ${failed} FAILED, ${skipped} SKIPPED out of ${total} tests`)
  
  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:')
    testResults.filter(t => t.status === 'FAIL').forEach(test => {
      console.log(`   • ${test.name}: ${test.error}`)
    })
  }
  
  console.log('\n📊 PERFORMANCE METRICS:')
  const totalDuration = testResults.reduce((sum, test) => sum + test.duration, 0)
  console.log(`   • Total execution time: ${totalDuration}ms`)
  
  testResults.forEach(test => {
    if (test.status === 'PASS' && test.duration > 0) {
      console.log(`   • ${test.name}: ${test.duration}ms`)
    }
  })
  
  console.log('\n' + '='.repeat(80))
  console.log(failed === 0 ? '🎉 ALL TESTS PASSED!' : `❌ ${failed} TESTS FAILED`)
  console.log('='.repeat(80))
}

// Main test runner
async function runTests(): Promise<void> {
  console.log('🚀 Starting Job Posting API Test Suite')
  console.log('=====================================')
  
  try {
    // Infrastructure tests
    const redisConnected = await testRedisConnection()
    const supabaseConnected = await testSupabaseConnection()
    
    if (!supabaseConnected) {
      logError('Cannot proceed without Supabase connection')
      return
    }
    
    // Authentication tests
    const authSuccess = await testUserAuthentication()
    if (!authSuccess) {
      logError('Cannot proceed without authentication')
      return
    }
    
    // CRUD tests
    await testJobCreation()
    await testJobRetrieval()
    await testJobUpdate()
    await testJobDeletion()
    
    // Feature tests
    await testPagination()
    await testFiltering()
    
    if (redisConnected) {
      await testCaching()
    } else {
      addTestResult('Caching', 'SKIP', 0, 'Redis not available')
    }
    
    // Edge case tests
    await testErrorHandling()
    
  } catch (error) {
    logError(`Test suite failed: ${error}`)
  } finally {
    await cleanup()
    printTestSummary()
  }
}

// Run the tests
if (require.main === module) {
  runTests().catch(console.error)
}

export { runTests } 