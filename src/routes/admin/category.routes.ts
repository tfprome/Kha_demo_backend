import { createCategory, deleteCategory, listCategories, updateCategory } from '../../controller/admin/categories.controller'
import { Router } from "express";

const router = Router()

router.post('/', createCategory)

router.get('/', listCategories)

router.put("/:id", updateCategory)

router.delete("/:id", deleteCategory)

export default router
