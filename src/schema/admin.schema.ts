import { z } from "zod";

export const createProductSchema = z.object({
    categoryId: z.string().uuid().optional(),
    ratePlanId: z.string().uuid().optional(),
    name: z.string().min(2),
    slug: z
        .string()
        .min(2)
        .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
    description: z.string().optional(),
    unit: z.string().min(1),
    sourceRegion: z.string().optional(),
    price: z.number().positive(),
    originalPrice: z.number().positive().optional(),
    stockQty: z.number().int().min(0).default(0),
    lowStockThreshold: z.number().int().min(0).default(5),
    isBestSelling: z.boolean().default(false),
    isActive: z.boolean().default(true),
});

export const listAdminProductsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    q: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    isActive: z.coerce.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial()