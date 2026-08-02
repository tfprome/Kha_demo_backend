import { getProducts } from "../controller/product.controller";
import { Router } from "express";

const router = Router()

router.get('/', getProducts)

export default router;