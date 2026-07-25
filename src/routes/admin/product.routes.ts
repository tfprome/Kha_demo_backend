import * as adminProductController from '../../controller/admin/products.controller'
import { Router } from "express";

const router=Router()

router.post('/',adminProductController.createProduct)

router.get('/',adminProductController.listPoducts)

router.patch('/:id',adminProductController.updateProduct)

router.patch('/:id/stock',adminProductController.adjustQty)

router.delete('/:id',adminProductController.deleteProduct)

export default router