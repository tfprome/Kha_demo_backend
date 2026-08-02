import { db } from "../../config/db";
import { eq, ilike, or, count, and, desc } from "drizzle-orm";
import { products } from "../../db/schema/productschema";
import { createProductSchema, listAdminProductsQuerySchema, updateProductSchema } from "../../schema/admin.schema";
import type { z } from "zod";
import { AppError } from "../../utils/errors";
import { invalidateCache, invalidateCachePattern } from "../cache.service";

type createProductTypes = z.infer<typeof createProductSchema>
type listProductTypes = z.infer<typeof listAdminProductsQuerySchema>
type updateProductTypes = z.infer<typeof updateProductSchema>


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

export async function listProducts(query: listProductTypes) {
    const { q, page, limit, categoryId, isActive } = query
    const offset = (page - 1) * limit

    const condition = []
    if (q) {
        const search = or(
            ilike(products.name, `%${q}%`), ilike(products.description, `%${q}%`))
        if (search)
            condition.push(search)
    }
    if (categoryId != undefined) condition.push(eq(products.categoryId, categoryId))
    if (isActive != undefined) condition.push(eq(products.isActive, isActive))
    condition.push(eq(products.isActive, true));

    const where = condition.length ? and(...condition) : undefined;

    const [countResult, rows] = await Promise.all([
        db.select({ total: count() }).from(products).where(where),
        db.select({
            id: products.id,
            name: products.name,
            slug: products.slug,
            unit: products.unit,
            price: products.price,
            originalPrice: products.originalPrice,
            stockQty: products.stockQty,
            lowStockThreshold: products.lowStockThreshold,
            isBestSelling: products.isBestSelling,
            isActive: products.isActive,
            categoryId: products.categoryId,
            createdAt: products.createdAt,
        })
            .from(products).where(where).orderBy(desc(products.createdAt)).limit(limit).offset(offset)
    ])

    const total = Number(countResult[0]?.total ?? 0)

    return {
        data: rows,
        meta: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
}

export async function updateProduct(id: string, input: updateProductTypes) {
    const product = await db.query.products.findFirst({ where: eq(products.id, id) })
    if (!product) throw new AppError(404, "NOT_FOUND", 'product not found')

    if (input.slug && input.slug != product.slug) {
        const clash = await db.query.products.findFirst({ where: eq(products.slug, input.slug), columns: { id: true } })
        if (clash) throw new AppError(409, "SLUG_TAKEN", "product with this slug already exists")
    }

    const values: Record<string, unknown> = { ...input, updatedAt: new Date() }
    if (input.price != undefined) values.price = String(input.price)
    if (input.originalPrice != undefined) values.originalPrice = input.originalPrice ? String(input.originalPrice) : null;

    const [updated] = await db.update(products).set(values).where(eq(products.id, id)).returning()

    await invalidateAll(id)
    return updated;
}

export async function adjustQty(id:string,Qty:number){
    const product = await db.query.products.findFirst({ where: eq(products.id, id) })
    if (!product) throw new AppError(404, "NOT_FOUND", 'product not found') 

    const [updated] = await db.update(products).set({stockQty:Qty,updatedAt:new Date()})
    .where(eq(products.id, id)).returning({id:products.id,stockQty:products.stockQty})

    await invalidateAll(id)
    return updated;
}

export async function deleteProduct(id:string){
    const product = await db.query.products.findFirst({ where: eq(products.id, id) })
    if (!product) throw new AppError(404, "NOT_FOUND", 'product not found') 

    const [updated] = await db.update(products).set({isActive:false,updatedAt:new Date()})
    .where(eq(products.id, id)).returning({id:products.id})

    await invalidateAll(id)
    return updated;
}
