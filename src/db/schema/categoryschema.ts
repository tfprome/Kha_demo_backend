import { pgTable, uuid,text } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull().unique(),
})