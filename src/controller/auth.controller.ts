import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";
import { AppError } from "../utils/errors";
import { AuthRequest } from "../types";

function refreshCookieOptions() {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: '/api/auth',
    };
}

const REFRESH_COOKIE = 'kha_refresh'

export async function register(req: Request, res: Response, next: NextFunction) {
    try {
        const { fullName, email, password } = req.body;
        //console.log(email)
        const { AccessToken, RefreshToken, user } = await authService.register(fullName, email, password);
        res.cookie(REFRESH_COOKIE, RefreshToken, refreshCookieOptions())
        res.status(201).json({
            success: true,
            message: "User registered in successfully",
            data: { token: AccessToken, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } }
        });
    }

    catch (error) {
        next(error);
    }
}

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, password } = req.body;
        //console.log(email)
        const { AccessToken, RefreshToken, user } = await authService.login(email, password);
        res.cookie(REFRESH_COOKIE, RefreshToken, refreshCookieOptions())
        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            data: { token: AccessToken, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } }
        });
    }

    catch (error) {
        next(error);
    }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.cookies?.[REFRESH_COOKIE];
        //console.log('token',token)
        if (!token) {
            throw new AppError(401, "INVALID", "no refresh token was provided")
        }
        const { AccessToken, RefreshToken, user } = await authService.refresh(token)
        res.cookie(REFRESH_COOKIE, RefreshToken, refreshCookieOptions())
        res.status(201).json({
            success: true,
            data: {
                newToken: AccessToken,
                user
            }
        })
    }
    catch (error) {
        next(error);
    }
}

export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.id;

        const user = await authService.getMe(userId!)
        res.status(200).json({
            success: true, data: user
        })
    }
    catch (error) {
        next(error)
    }
}

export async function logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const refreshToken = req.cookies?.[REFRESH_COOKIE];
        const accessToken = req.headers.authorization?.split(" ")[1]
        const accessJti = req.user?.jti

        if (refreshToken) {
            await authService.logout(refreshToken, accessJti!, accessToken!)
        }
        res.clearCookie(REFRESH_COOKIE)
        res.status(200).json({
            success: true, message: "user has been logged out"
        })
    }
    catch (err) {
        next(err)
    }
}