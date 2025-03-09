import { Redis } from "@upstash/redis"

export const redis = new Redis({
  url: process.env.KV_URL || "",
  token: process.env.KV_REST_API_TOKEN || "",
})

// Helper functions for Redis operations
export async function incrementUserWatchCount(userId: string) {
  return redis.hincrby(`user:${userId}`, "adsWatched", 1)
}

export async function incrementUserBalance(userId: string, amount: number) {
  return redis.hincrbyfloat(`user:${userId}`, "balance", amount)
}

export async function trackAdAnalytics(adId: string) {
  return redis.hincrby(`ad:${adId}:analytics`, "views", 1)
}

export async function cacheAdData(adId: string, data: any) {
  return redis.set(`ad:${adId}:data`, JSON.stringify(data), { ex: 3600 }) // Cache for 1 hour
}

export async function getCachedAdData(adId: string) {
  const data = await redis.get(`ad:${adId}:data`)
  return data ? JSON.parse(data as string) : null
}

