-- Add parentId and remixConfig columns to file table
ALTER TABLE "walls_file" ADD COLUMN "parent_id" integer;--> statement-breakpoint
ALTER TABLE "walls_file" ADD COLUMN "remix_config" jsonb;--> statement-breakpoint
ALTER TABLE "walls_file" ADD CONSTRAINT "walls_file_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "walls_file"("id") ON DELETE RESTRICT;--> statement-breakpoint
CREATE INDEX "file_parent_id_idx" ON "walls_file" ("parent_id");
