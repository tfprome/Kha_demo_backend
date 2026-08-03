import z from "zod";

export const listProductsQuerySchema = z.object({
    q: z.string().optional(),
    category: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).default(20),
    sort: z.enum(['price_asc', 'price_desc', 'name_asc', 'newest']).default('newest'),
})

export const getTopSellersQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).default(10),
})