import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            error: { code: err.code, message: err.message }
        })
    }
    console.log('err in midddleware',err)

    return res.status(500).json({
            success: false,
            error: { code: "INTERNAL_ERROR", message: "internal server error" }
        })
}