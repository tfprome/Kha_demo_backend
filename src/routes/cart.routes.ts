import { Router } from "express";
import { getCart, addItem, updateItem, removeItem } from "../controller/cart.controller";
import { ensuresession } from "../middleware/session.middleware";
import { authenticateOptional } from "../middleware/auth.middleware";


const router = Router()

router.use(ensuresession, authenticateOptional)

router.get('/', getCart)

router.post('/items', addItem)

router.patch('/items/:productId', updateItem)

router.delete('/items/:productId', removeItem)

export default router