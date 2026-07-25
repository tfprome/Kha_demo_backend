import { NextFunction, Request, Response } from "express"
import { createProductSchema, listAdminProductsQuerySchema, updateProductSchema } from "../../schema/admin.schema"
import * as productService from '../../services/admin/products.service'
import { AuthRequest } from "../../types"


export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createProductSchema.parse(req.body)
    //console.log('data',data)
    const product = await productService.createProduct(data)
    res.status(201).json({
      success: true,
      data: product
    })
  }
  catch (err) {
    next(err)
  }
}

export async function listPoducts(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listAdminProductsQuerySchema.parse(req.body)
    const result = await productService.listProducts(query)
    res.json({
      success: true,
      ...result
    })
  }
  catch (err) {
    next(err)
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const input = req.body
    const updated = await productService.updateProduct(req.params.id as string, input)
    res.json({
      success: true,
      data: updated
    })
  }
  catch (err) {
    next(err)
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const updated = await productService.deleteProduct(req.params.id as string)
    res.json({
      success: true,
      data: updated
    })
  }
  catch (err) {
    next(err)
  }
}

export async function adjustQty(req: Request, res: Response, next: NextFunction) {
  try {
    const input = req.body
    const updated = await productService.updateProduct(req.params.id as string, input)
    res.json({
      success: true,
      data: updated
    })
  }
  catch (err) {
    next(err)
  }
}