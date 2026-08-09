import { listCategories, getCategoryBySlug } from '../controller/category.controller'
import { Router } from "express";

const router = Router()

router.get('/', listCategories)

router.get('/:slug', getCategoryBySlug)

export default router