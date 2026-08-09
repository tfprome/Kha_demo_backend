ALTER TABLE "categories" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "name_bn" text;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "sort_order" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "created_at" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "updated_at" timestamp with time zone NOT NULL;