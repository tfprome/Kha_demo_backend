import { NextFunction, Response } from "express"
import { AuthRequest } from "../types"
import { randomUUID } from "node:crypto"

const SESSION_COOKIE = 'kha_session'

export function ensuresession(req: AuthRequest, res: Response, next: NextFunction) {
    let sessionId = req.cookies?.[SESSION_COOKIE] as string | undefined
    if (!sessionId) {
        sessionId = randomUUID()
        res.cookie(SESSION_COOKIE, sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000,
            path: '/',
        })
    }
    req.sessionId = sessionId;
    next();
}

export {SESSION_COOKIE}