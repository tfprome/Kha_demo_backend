import { Request, Response, NextFunction } from 'express'
import { createCategorySchema, updateCategorySchema } from '../../schema/admin.schema'
import * as categoryService from '../../services/admin/categories.service'

export async function createCategory(req: Request, res: Response, next: NextFunction) {
    try {
        const input = createCategorySchema.parse(req.body)
        const result = await categoryService.createCategory(input)
        res.json({
            success: true,
            data: result
        })
    }
    catch (err) {
        next(err)
    }
}

export async function listCategories(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await categoryService.listCategories()
        res.json({
            success: true,
            data: result
        })
    }
    catch (err) {
        next(err)
    }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.params.id
        const input = updateCategorySchema.parse(req.body)
        const result = await categoryService.updateCategory(id as string, input)
        res.json({
            success: true,
            data: result
        })
    }
    catch (err) {
        next(err)
    }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.params.id
        await categoryService.deleteCategory(id as string)
        res.json({
            success: true,
            message: 'Category deleted successfully'
        })
    }
    catch (err) {
        next(err)
    }
}
