import * as adminProductController from '../../controller/admin/products.controller'
import { Router } from "express";

const router=Router()

router.post('/',adminProductController.createProduct)

export default router