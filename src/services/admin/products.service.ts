import { db } from "../../config/db";
import { eq } from "drizzle-orm";
import { products } from "../../db/schema/productschema";
import { createProductSchema } from "../../schema/admin.schema";
import type { z } from "zod";
import { AppError } from "../../utils/errors";
import { invalidateCache, invalidateCachePattern } from "../cache.service";

type createProductTypes = z.infer<typeof createProductSchema>

async function invalidateAll(productId?: string) {
    const ops = [
        invalidateCachePattern('cache:products:list:*'),
        invalidateCache('cache:products:top-sellers'),
        invalidateCache('cache:categories:all'),
    ];
    if (productId) ops.push(invalidateCache(`cache:products:id:${productId}`));
    await Promise.all(ops);
}

export async function createProduct(data: createProductTypes) {
    const existing = await db.query.products.findFirst({
        where: eq(products.slug, data.slug),
        columns: { id: true }
    })
    if (existing) throw new AppError(409, 'SLUG_TAKEN', 'product already exists')

    const newProduct = await db.insert(products)
        .values({ ...data, price: String(data.price), originalPrice: String(data.originalPrice) })
        .returning()

    await invalidateAll()
    return newProduct
}