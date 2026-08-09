import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import adminProductRoutes from './product.routes'
import adminCategoryRoutes from './category.routes'

const router=Router()

router.use(authenticate,requireRole('admin'))

router.use('/products',adminProductRoutes)
router.use('/categories',adminCategoryRoutes)

export default router