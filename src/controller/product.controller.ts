import {listProductsQuerySchema} from "../schema/product.schema";
import {Request, Response, NextFunction} from "express";
import * as productService from '../services/products.service'

export async function getProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const params = listProductsQuerySchema.parse(req.query)
    const result = await productService.listProducts(params)
    res.json({
      success: true,
      ...result
    })
  }
  catch (err) {
    next(err)
  }}