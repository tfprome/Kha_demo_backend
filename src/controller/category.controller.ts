import { Request, Response, NextFunction } from 'express'
import * as productService from '../services/products.service'


export async function listCategories(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await productService.listCategories()
        res.json({
            success: true,
            data: result
        })
    }
    catch (err) {
        next(err)
    }
}

export async function getCategoryBySlug(req: Request, res: Response, next: NextFunction) {
    try {
        const slug = req.params.slug
        const result = await productService.getCategoryBySlug(slug as string)
        res.json({
            success: true,
            data: result
        })
    }
    catch (err) {
        next(err)
    }
}

