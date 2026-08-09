import { Router } from "express";
import { getCart,addItem } from "../controller/cart.controller";
import { ensuresession } from "../middleware/session.middleware";
import { authenticateOptional } from "../middleware/auth.middleware";


const router = Router()

router.use(ensuresession, authenticateOptional)

router.get('/', getCart)

router.post('/items', addItem)

export default router