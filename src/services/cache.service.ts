import { redis } from "../config/redis";

export async function getCache<T>(key: string) {
    const val = await redis.get(key)
    if (!val) return null;
    return JSON.parse(val) as T;
}

export async function setCache(key: string, data: unknown, ttl: number) {
    await redis.set(key, JSON.stringify(data), "EX", ttl)
}

export async function invalidateCache(...keys: string[]) {
    if (keys.length > 0)
        await redis.del(...keys)
}

export async function invalidateCachePattern(pattern: string) {
    let cursor = '0';
    let keystoDelete: string[] = []
    do {
        const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, "COUNT", 100)
        cursor = nextCursor
        keystoDelete.push(...keys);
    } while (cursor != '0')
    if (keystoDelete.length > 0)
        await redis.del(...keystoDelete)
}