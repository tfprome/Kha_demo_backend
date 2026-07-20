import { NextFunction, Response } from "express";
import { AppError } from "../utils/errors";
import { verifyAccessToken } from "../utils/jwt";
import { redis } from '../config/redis'

export async function authenticate(req: any, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token)
        throw new AppError(401, "INVALID", 'invalid or expired token')

    let payload;
    try {
        payload = verifyAccessToken(token);
    } catch {
        throw new AppError(401, "INVALID_TOKEN", "Invalid or expired token");
    }
    const blocked = await redis.get(`blocklist:${payload.jti}`);
    if (blocked) {
        res.status(401).json({
            success: false,
            error: { code: 'TOKEN_REVOKED', message: 'Token has been revoked' },
        });
        return;
    }

    req.user = { id: payload.sub, role: payload.role, jti: payload.jti, email: payload.email }
    next()
}