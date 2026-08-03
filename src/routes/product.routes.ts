import { getProductById, getProducts, getTopSellers } from "../controller/product.controller";
import { Router } from "express";

const router = Router()

router.get('/', getProducts)

router.get('/top-sellers', getTopSellers);

router.get('/:id', getProductById);

export default router;