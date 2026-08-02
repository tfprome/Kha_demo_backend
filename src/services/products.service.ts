import { listProductsQuerySchema } from "../schema/product.schema";
import { z } from "zod"
import { products } from "../db/schema/productschema";
import { categories } from "../db/schema/categoryschema";
import { and, count, desc, eq, ilike, or, asc, sql } from "drizzle-orm";
import { db } from "../config/db";
import { getCache, setCache } from "./cache.service";

type listProductType = z.infer<typeof listProductsQuerySchema>

const listcacheKey = (params: listProductType) => {
    return `cache:products:list:${Buffer.from(JSON.stringify(params)).toString('base64')}`
}

const TTL = { list: 300, topSellers: 600, product: 600, category: 1800 }

export async function listProducts(params: listProductType) {
    const cacheKey = listcacheKey(params)
    const cached = await getCache(cacheKey)
    if (cached) return cached

    const { q, page, limit, category, sort } = params
    console.log('params', params)
    const offset = (page - 1) * limit

    const condition = []
    if (q) {
        const search = or(
            ilike(products.name, `%${q}%`), ilike(products.description, `%${q}%`))
        if (search)
            condition.push(search)
    }

    condition.push(eq(products.isActive, true));
    if (category != undefined) condition.push(eq(categories.slug, category))

    const orderBy = {
        newest: desc(products.createdAt),
        price_asc: asc(sql`${products.price}::numeric`),
        price_desc: desc(sql`${products.price}::numeric`),
        name_asc: asc(products.name),
    }[sort];

    const where = condition.length ? and(...condition) : undefined;

    const [countResult, rows] = await Promise.all([
        db.select({ total: count() })
            .from(products).leftJoin(categories, eq(products.categoryId, categories.id))
            .where(where),
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
            .from(products).leftJoin(categories, eq(products.categoryId, categories.id)).where(where).orderBy(orderBy).limit(limit).offset(offset)
    ])

    const total = Number(countResult[0]?.total ?? 0)

    const result = {
        data: rows,
        meta: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };

    setCache(cacheKey, result, TTL.list)
    return result
}