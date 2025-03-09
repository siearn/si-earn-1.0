import { Redis } from "@upstash/redis"

// Create Redis client with proper URL format
let redis: Redis

try {
  // Get the environment variables
  const url = process.env.KV_URL || ""
  const token = process.env.KV_REST_API_TOKEN || ""

  // Create the Redis client
  redis = new Redis({
    url: "https://fast-vulture-59091.upstash.io",
    token: token,
  })

  console.log("Redis client initialized successfully")
} catch (error) {
  console.error("Failed to initialize Redis client:", error)
  // Provide a fallback implementation
  redis = {
    hincrby: async () => 0,
    hincrbyfloat: async () => 0,
    set: async () => null,
    get: async () => null,
  } as unknown as Redis
}

export { redis }

// Helper functions for Redis operations
export async function incrementUserWatchCount(userId: string) {
  try {
    return await redis.hincrby(`user:${userId}`, "adsWatched", 1)
  } catch (error) {
    console.error("Redis error in incrementUserWatchCount:", error)
    return 0
  }
}

export async function incrementUserBalance(userId: string, amount: number) {
  try {
    return await redis.hincrbyfloat(`user:${userId}`, "balance", amount)
  } catch (error) {
    console.error("Redis error in incrementUserBalance:", error)
    return 0
  }
}

export async function trackAdAnalytics(adId: string) {
  try {
    return await redis.hincrby(`ad:${adId}:analytics`, "views", 1)
  } catch (error) {
    console.error("Redis error in trackAdAnalytics:", error)
    return 0
  }
}

export async function cacheAdData(adId: string, data: any) {
  try {
    if (data === null) {
      // If data is null, we're invalidating the cache
      return null
    }
    return await redis.set(`ad:${adId}:data`, JSON.stringify(data), { ex: 3600 }) // Cache for 1 hour
  } catch (error) {
    console.error("Redis error in cacheAdData:", error)
    return null
  }
}

export async function getCachedAdData(adId: string) {
  try {
    const data = await redis.get(`ad:${adId}:data`)
    return data ? JSON.parse(data as string) : null
  } catch (error) {
    console.error("Redis error in getCachedAdData:", error)
    return null
  }
}

