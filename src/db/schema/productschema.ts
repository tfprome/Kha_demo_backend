import { pgTable, uuid, text, numeric, integer, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { categories } from "./categoryschema";

export const products = pgTable("products", {
    id: uuid("id").primaryKey().defaultRandom(),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: 'set null' }),
    //ratePlanId:uuid("rate_plan_id").references(()=>rateplans.id,{onDelete:'set null'}),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description'),
    unit: text('unit').notNull(),
    sourceRegion: text('source_region'),
    price: numeric('price', { precision: 10, scale: 2 }).notNull(),
    originalPrice: numeric('original_price', { precision: 10, scale: 2 }),
    stockQty: integer('stock_qty').notNull().default(0),
    lowStockThreshold: integer('low_stock_threshold').notNull().default(5),
    isBestSelling: boolean('is_best_selling').notNull().default(false),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
    index("idx_products_category").on(table.categoryId),
    index("idx_products_slug").on(table.slug),
    index("idx_products_best_selling").on(table.isBestSelling),
    index("idx_products_stock").on(table.stockQty),
]
);

export type Product = typeof products.$inferSelect
export type newProduct = typeof products.$inferInsert