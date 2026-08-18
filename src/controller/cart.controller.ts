import { NextFunction, Response } from "express";
import { AuthRequest } from "../types";
import * as cartService from "../services/cart.service";
import { AppError } from "../utils/errors";

function identity(req: AuthRequest) {
    return { userId: req.user?.id, sessionId: req.sessionId };
}

export async function getCart(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) {
    try {
        const { userId, sessionId } = identity(req);
        const data = await cartService.getCart(userId, sessionId);
        res.json({ success: true, cart: data });
    } catch (err) {
        next(err);
    }
}

export async function addItem(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) {
    try {
        const { userId, sessionId } = identity(req);
        const { productId, quantity = 1 } = req.body;
        if (!productId)
            throw new AppError(400, "PRODUCT_MISSING", "productID is required");
        if (quantity < 1)
            throw new AppError(
                400,
                "INVALID_QUANTITY",
                "quantity must be a positive integer",
            );

        const data = await cartService.addItem(
            userId,
            sessionId,
            productId,
            quantity,
        );
        res.json({ success: true, cart: data });
    } catch (err) {
        next(err);
    }
}

export async function updateItem(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) {
    try {
        const { userId, sessionId } = identity(req);
        const { productId } = req.params;
        const { quantity } = req.body;
        if (!productId)
            throw new AppError(400, "PRODUCT_MISSING", "productID is required");
        if (quantity < 1)
            throw new AppError(
                400,
                "INVALID_QUANTITY",
                "quantity must be a positive integer",
            );

        const data = await cartService.updateItem(
            userId,
            sessionId,
            productId as string,
            quantity,
        );
        res.json({ success: true, cart: data });
    } catch (err) {
        next(err);
    }
}

export async function removeItem(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { userId, sessionId } = identity(req);
    const data = await cartService.removeItem(userId, sessionId, req.params.productId as string);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}