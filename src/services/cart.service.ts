import { products, carts, cartItems } from "../db/schema";
import { db } from "../config/db";
import { eq, and } from "drizzle-orm";
import { AppError } from "../utils/errors";

async function getOrCreateCart(userId?: string, sessionId?: string) {
    if (userId) {
        const existing = await db.query.carts.findFirst({
            where: eq(carts.userId, userId),
        });
        if (existing) return existing;
        const [cart] = await db.insert(carts).values({ userId }).returning();
        return cart;
    }
    if (sessionId) {
        const existing = await db.query.carts.findFirst({
            where: eq(carts.sessionId, sessionId),
        });
        if (existing) return existing;
        const [cart] = await db.insert(carts).values({ sessionId }).returning();
        return cart;
    }
    throw new AppError(500, "CART_IDENTITY_MISSING", "Cannot identify cart");
}

async function fetchCartItems(cartId: string) {
    const rows = await db
        .select({
            id: cartItems.id,
            quantity: cartItems.quantity,
            productId: products.id,
            name: products.name,
            slug: products.slug,
            unit: products.unit,
            price: products.price,
            originalPrice: products.originalPrice,
            stockQty: products.stockQty,
        })
        .from(cartItems)
        .innerJoin(products, eq(cartItems.productId, products.id))
        .where(eq(cartItems.cartId, cartId));

    return rows;
}

function formatItems(rows: Awaited<ReturnType<typeof fetchCartItems>>) {
    //console.log(rows)
    return rows.map((row) => ({
        id: row.id,
        quantity: row.quantity,
        product: {
            id: row.productId,
            name: row.name,
            slug: row.slug,
            unit: row.unit,
            price: parseFloat(row.price),
            originalPrice: row.originalPrice ? parseFloat(row.originalPrice) : null,
            stockQty: row.stockQty,
        },
    }));
}

function computeSummary(items: ReturnType<typeof formatItems>) {
    const itemCount = items.reduce((s, i) => s + i.quantity, 0);
    const subTotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
    return { itemCount, subTotal };
}

export async function getCart(userId?: string, sessionId?: string) {
    const cart = await getOrCreateCart(userId, sessionId);
    const fetchItems = await fetchCartItems(cart.id);
    const items = formatItems(fetchItems);
    return { id: cart.id, items, ...computeSummary(items) };
}

export async function addItem(
    userId: string | undefined,
    sessionId: string | undefined,
    productId: string,
    quantity: number,
) {
    const product = await db.query.products.findFirst({
        where: and(eq(products.id, productId), eq(products.isActive, true)),
        columns: { id: true, stockQty: true },
    });
    if (!product)
        throw new AppError(404, "PRODUCT_NOT_FOUND", "product not found");

    const cart = await getOrCreateCart(userId, sessionId);

    const existing = await db.query.cartItems.findFirst({
        where: and(
            eq(cartItems.cartId, cart.id),
            eq(cartItems.productId, productId),
        ),
    });

    const newQty = (existing?.quantity ?? 0) + quantity;
    if (newQty > product.stockQty)
        throw new AppError(
            400,
            "INSUFFICIENT_STOCK",
            `only ${product.stockQty} items left`,
        );

    if (existing) {
        await db
            .update(cartItems)
            .set({ quantity: newQty })
            .where(eq(cartItems.id, existing.id));
    } else {
        await db.insert(cartItems).values({ cartId: cart.id, productId, quantity });
    }
    return getCart(userId, sessionId);
}

export async function updateItem(
    userId: string | undefined,
    sessionId: string | undefined,
    productId: string,
    quantity: number,
) {
    if (quantity <= 0) return removeItem(userId, sessionId, productId);

    const product = await db.query.products.findFirst({
        where: eq(products.id, productId),
        columns: { stockQty: true },
    });
    if (!product)
        throw new AppError(404, "PRODUCT_NOT_FOUND", "no product with this id");

    if (quantity > product.stockQty)
        throw new AppError(
            400,
            "INSUFFICIENT_STOCK",
            `only ${product.stockQty} items available`,
        );

    const cart = await getOrCreateCart(userId, sessionId);

    const existing = await db.query.cartItems.findFirst({
        where: and(
            eq(cartItems.cartId, cart.id),
            eq(cartItems.productId, productId),
        ),
    });
    if (!existing)
        throw new AppError(404, "CART_ITEM_NOT_FOUND", "Item not in cart");

    await db
        .update(cartItems)
        .set({ quantity })
        .where(eq(cartItems.id, existing.id));

    return getCart(userId, sessionId);
}

export async function removeItem(
    userId: string | undefined,
    sessionId: string | undefined,
    productId: string,
) {

    const cart = await getOrCreateCart(userId, sessionId);

    await db
        .delete(cartItems)
        .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId)));

    // console.log(result)

    return getCart(userId, sessionId);
}
