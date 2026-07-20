import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: varchar("full_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  phone: varchar("phone_no", { length: 11 }),
  role: varchar("role", { enum: ['customer', 'admin'] }).notNull().default('customer'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});