import { pgTable, uuid, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    nameBn: text('name_bn'),
    slug: text('slug').notNull().unique(),
    sortOrder: integer('sort_order').default(0),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert