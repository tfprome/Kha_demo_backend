import Redis from 'ioredis'
import { config } from './index'

export const redis = new Redis(config.redisUrl, {
    maxRetriesPerRequest: 3,
    lazyConnect: true
})

redis.on('error', (error) => {
    console.log('redis connection error:', error)
})