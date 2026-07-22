import { NextFunction,Request,Response } from "express"
import { createProductSchema } from "../../schema/admin.schema"
import * as productService from '../../services/admin/products.service'


export async function createProduct(req:Request,res:Response,next:NextFunction){
    try{
      const data=createProductSchema.parse(req.body)
      console.log('data',data)
      const product=await productService.createProduct(data)
      res.status(201).json({
        success:true,
        data:product
      })
    }
    catch(err){
      next(err)
    }
}