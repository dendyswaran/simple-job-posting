import { createClient } from 'redis'

class RedisClient {
  private client: ReturnType<typeof createClient> | null = null
  private isConnecting = false

  private async connect() {
    if (this.client?.isOpen) return this.client
    if (this.isConnecting) {
      // Wait for existing connection attempt
      while (this.isConnecting) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      return this.client
    }

    this.isConnecting = true
    try {
      // Use Redis URL from environment or default to localhost
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

      console.log('Redis URL:', redisUrl)
      
      this.client = createClient({
        url: redisUrl,
        
        socket: {
          connectTimeout: 10000,
        }
      })

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err)
      })

      this.client.on('connect', () => {
        console.log('Redis Client Connected')
      })

      this.client.on('ready', () => {
        console.log('Redis Client Ready')
      })

      this.client.on('end', () => {
        console.log('Redis Client Disconnected')
      })

      await this.client.connect()
      return this.client
    } catch (error) {
      console.error('Failed to connect to Redis:', error)
      this.client = null
      throw error
    } finally {
      this.isConnecting = false
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      const client = await this.connect()
      return await client?.get(key) || null
    } catch (error) {
      console.error('Redis GET error:', error)
      return null
    }
  }

  async set(key: string, value: string, ttlSeconds = 300): Promise<boolean> {
    try {
      const client = await this.connect()
      await client?.setEx(key, ttlSeconds, value)
      return true
    } catch (error) {
      console.error('Redis SET error:', error)
      return false
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      const client = await this.connect()
      await client?.del(key)
      return true
    } catch (error) {
      console.error('Redis DEL error:', error)
      return false
    }
  }

  async invalidatePattern(pattern: string): Promise<boolean> {
    try {
      const client = await this.connect()
      if (!client) return false
      
      const keys = await client.keys(pattern)
      if (keys.length > 0) {
        await client.del(keys)
      }
      return true
    } catch (error) {
      console.error('Redis invalidatePattern error:', error)
      return false
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.client?.isOpen) {
        await this.client.disconnect()
      }
    } catch (error) {
      console.error('Redis disconnect error:', error)
    } finally {
      this.client = null
    }
  }
}

// Singleton instance
const redisClient = new RedisClient()

export { redisClient }

// Cache key generators
export const cacheKeys = {
  jobPosts: (page: number, limit: number, filters?: string) => 
    `jobs:page:${page}:limit:${limit}:filters:${filters || 'none'}`,
  userJobPosts: (userId: string, page: number, limit: number, filters?: string) => 
    `user:${userId}:jobs:page:${page}:limit:${limit}:filters:${filters || 'none'}`,
  jobPost: (id: string) => `job:${id}`,
  jobPostsCount: (filters?: string) => `jobs:count:filters:${filters || 'none'}`,
  userJobPostsCount: (userId: string, filters?: string) => `user:${userId}:jobs:count:filters:${filters || 'none'}`,
}

// Cache TTL constants (in seconds)
export const cacheTTL = {
  jobPosts: 300, // 5 minutes for job listings
  jobPost: 600, // 10 minutes for individual job posts
  jobPostsCount: 300, // 5 minutes for counts
} as const 