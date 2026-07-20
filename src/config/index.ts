export const config = {
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'change_me',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'change_me',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

    redisUrl : process.env.REDIS_URL || 'redis://localhost:6380'
}