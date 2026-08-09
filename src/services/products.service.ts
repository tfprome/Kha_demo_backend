import { getTopSellersQuerySchema, listProductsQuerySchema } from "../schema/product.schema";
import { z } from "zod"
import { products } from "../db/schema/productschema";
import { categories } from "../db/schema/categoryschema";
import { and, count, desc, eq, ilike, or, asc, sql } from "drizzle-orm";
import { db } from "../config/db";
import { getCache, setCache } from "./cache.service";
import { AppError } from "../utils/errors";

type listProductType = z.infer<typeof listProductsQuerySchema>
type getTopSellersType = z.infer<typeof getTopSellersQuerySchema>

const listcacheKey = (params: listProductType) => {
    return `cache:products:list:${Buffer.from(JSON.stringify(params)).toString('base64')}`
}

const TTL = { list: 300, topSellers: 600, product: 600, category: 1800 }

const transformProduct = (p: { price: string, originalPrice: string | null, [key: string]: unknown }) => {
    return {
        ...p,
        price: parseFloat(p.price),
        originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : null
    }
}

export async function listProducts(params: listProductType) {
    const cacheKey = listcacheKey(params)
    const cached = await getCache(cacheKey)
    if (cached) return cached

    const { q, page, limit, category, sort } = params
    //console.log('params', params)
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
            .from(products)
            .leftJoin(categories, eq(products.categoryId, categories.id))
            .where(where)
            .orderBy(orderBy)
            .limit(limit)
            .offset(offset)
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

    await setCache(cacheKey, result, TTL.list)
    return result
}

export async function getTopSellers(params: getTopSellersType) {
    const cacheKey = `cache:products:topsellers:${params.page}:${params.limit}`
    const cached = await getCache(cacheKey)
    if (cached) return cached

    const { page, limit } = params

    const offset = (page - 1) * limit;

    const [countResult, rows] = await Promise.all([
        db.select({ total: count() })
            .from(products)
            .where(and(eq(products.isBestSelling, true), eq(products.isActive, true))),
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
        }).from(products)
            .where(and(eq(products.isBestSelling, true), eq(products.isActive, true)))
            .limit(limit)
            .offset(offset)
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

    await setCache(cacheKey, result, TTL.topSellers)
    return result
}

export async function getProductById(id: string) {
    const cacheKey = `cache:products:id:${id}`
    const cached = await getCache(cacheKey)
    if (cached) return cached

    const product = await db.query.products.findFirst({
        where: and(eq(products.id, id), eq(products.isActive, true)),
    })

    if (!product) throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found');

    await setCache(cacheKey, product, TTL.product)
    const result = transformProduct(product)
    return result
}

export async function listCategories() {
    const cacheKey = 'cache:categories:all'
    const cached = await getCache(cacheKey)
    if (cached) return cached

    const categorylist = await db.select({
        id: categories.id,
        name: categories.name,
        nameBn: categories.nameBn,
        sortOrder: categories.sortOrder,
        slug: categories.slug,
        productCount: sql<number>`count(${products.id})::int`
    }).from(categories).where(eq(categories.isActive, true))
        .leftJoin(products, and(eq(categories.id, products.categoryId), eq(products.isActive, true)))
        .groupBy(categories.id)
        .orderBy(asc(categories.sortOrder))

    await setCache(cacheKey, categorylist, TTL.category)
    return categorylist
}

export async function getCategoryBySlug(slug: string) {
    const cacheKey = `cache:categories:slug:${slug}`
    const cached = await getCache(cacheKey)
    if (cached) return cached

    const category = await db.query.categories.findFirst({
        where: and(eq(categories.slug, slug), eq(categories.isActive, true))
    })
    if (!category) throw new AppError(404, 'CATEGORY_NOT_FOUND', 'Category not found')

    await setCache(cacheKey, category, TTL.category)
    return category
}