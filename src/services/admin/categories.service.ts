import { createCategorySchema, updateCategorySchema } from "../../schema/admin.schema";
import z from "zod";
import { AppError } from "../../utils/errors";
import { categories } from "../../db/schema";
import { db } from "../../config/db";
import { eq, asc } from "drizzle-orm";
import { invalidateCache, invalidateCachePattern, setCache, getCache } from "../cache.service";

type createCategoryType = z.infer<typeof createCategorySchema>
type updateCategoryType = z.infer<typeof updateCategorySchema>

async function invalidateAll(slug?: string) {
    await Promise.all([
        invalidateCache('cache:categories:all'),
        invalidateCachePattern('cache:products:list:*'),
        slug ? invalidateCache(`cache:categories:slug:${slug}`) : Promise.resolve(),
    ]);
}

const TTL = {
    categories: 1800, // 30 minutes
};

export async function createCategory(input: createCategoryType) {
    const existing = await db.query.categories.findFirst({
        where: eq(categories.slug, input.slug),
        columns: { id: true }
    })
    if (existing) throw new AppError(409, 'SLUG_TAKEN', 'category already exists')

    const [category] = await db.insert(categories).values(input).returning()
    await invalidateAll()
    return category
}



export async function listCategories() {
    const cacheKey = 'cache:admin:categories:all';

    const cached = await getCache(cacheKey);
    if (cached) return cached;

    const rows = await db
        .select().from(categories).orderBy(asc(categories.sortOrder));

    await setCache(cacheKey, rows, TTL.categories);

    return rows;
}

export async function updateCategory(id: string, input: updateCategoryType) {
    const category = await db.query.categories.findFirst({ where: eq(categories.id, id) })
    if (!category) throw new AppError(404, 'CATEGORY_NOT_FOUND', 'category not found')

    if (input.slug && input.slug !== category.slug) {
        const slugExists = await db.query.categories.findFirst({ where: eq(categories.slug, input.slug) })
        if (slugExists) throw new AppError(409, 'SLUG_TAKEN', 'category slug already exists')
    }

    const [updated] = await db.update(categories).set({ ...input, updatedAt: new Date() }).where(eq(categories.id, id)).returning()
    await invalidateAll(category.slug)
    return updated
}

export async function deleteCategory(id: string) {
    const category = await db.query.categories.findFirst({ where: eq(categories.id, id) })
    if (!category) throw new AppError(404, 'CATEGORY_NOT_FOUND', 'category not found')

    await db.update(categories).set({ isActive: false }).where(eq(categories.id, id))
    await invalidateAll(category.slug)
}