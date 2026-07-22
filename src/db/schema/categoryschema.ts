import { pgTable, uuid } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
    id: uuid('id').primaryKey().defaultRandom(),
})