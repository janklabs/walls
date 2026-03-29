-- Migration: NextAuth v5 -> better-auth
-- Restructure auth tables for better-auth compatibility

-- 1. walls_user: add createdAt, updatedAt; convert emailVerified
ALTER TABLE "walls_user" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "walls_user" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
UPDATE "walls_user" SET "created_at" = "joined_at" WHERE "joined_at" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "walls_user" ADD COLUMN "email_verified_new" boolean DEFAULT false NOT NULL;--> statement-breakpoint
UPDATE "walls_user" SET "email_verified_new" = true WHERE "email_verified" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "walls_user" DROP COLUMN "email_verified";--> statement-breakpoint
ALTER TABLE "walls_user" RENAME COLUMN "email_verified_new" TO "email_verified";--> statement-breakpoint

-- 2. walls_session: restructure PK, rename columns, add fields
ALTER TABLE "walls_session" ADD COLUMN "id" varchar(255);--> statement-breakpoint
UPDATE "walls_session" SET "id" = "session_token";--> statement-breakpoint
ALTER TABLE "walls_session" ALTER COLUMN "id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "walls_session" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "walls_session" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "walls_session" ADD COLUMN "ip_address" varchar(255);--> statement-breakpoint
ALTER TABLE "walls_session" ADD COLUMN "user_agent" text;--> statement-breakpoint
ALTER TABLE "walls_session" DROP CONSTRAINT IF EXISTS "walls_session_pkey";--> statement-breakpoint
ALTER TABLE "walls_session" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "walls_session" RENAME COLUMN "session_token" TO "token";--> statement-breakpoint
ALTER TABLE "walls_session" RENAME COLUMN "expires" TO "expires_at";--> statement-breakpoint
ALTER TABLE "walls_session" ADD CONSTRAINT "walls_session_token_unique" UNIQUE ("token");--> statement-breakpoint

-- 3. walls_account: restructure PK, rename columns, add fields
ALTER TABLE "walls_account" ADD COLUMN "id" varchar(255);--> statement-breakpoint
UPDATE "walls_account" SET "id" = gen_random_uuid()::text;--> statement-breakpoint
ALTER TABLE "walls_account" ALTER COLUMN "id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "walls_account" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "walls_account" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "walls_account" ADD COLUMN "access_token_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "walls_account" ADD COLUMN "refresh_token_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "walls_account" ADD COLUMN "password" text;--> statement-breakpoint
ALTER TABLE "walls_account" DROP CONSTRAINT IF EXISTS "walls_account_provider_provider_account_id_pk";--> statement-breakpoint
ALTER TABLE "walls_account" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "walls_account" RENAME COLUMN "provider" TO "provider_id";--> statement-breakpoint
ALTER TABLE "walls_account" RENAME COLUMN "provider_account_id" TO "account_id";--> statement-breakpoint
ALTER TABLE "walls_account" DROP COLUMN IF EXISTS "expires_at";--> statement-breakpoint
ALTER TABLE "walls_account" DROP COLUMN IF EXISTS "token_type";--> statement-breakpoint
ALTER TABLE "walls_account" DROP COLUMN IF EXISTS "session_state";--> statement-breakpoint
ALTER TABLE "walls_account" DROP COLUMN IF EXISTS "type";--> statement-breakpoint

-- 4. walls_verification_token -> walls_verification
ALTER TABLE "walls_verification_token" DROP CONSTRAINT IF EXISTS "walls_verification_token_identifier_token_pk";--> statement-breakpoint
ALTER TABLE "walls_verification_token" RENAME TO "walls_verification";--> statement-breakpoint
ALTER TABLE "walls_verification" ADD COLUMN "id" varchar(255);--> statement-breakpoint
UPDATE "walls_verification" SET "id" = gen_random_uuid()::text;--> statement-breakpoint
ALTER TABLE "walls_verification" ALTER COLUMN "id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "walls_verification" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "walls_verification" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "walls_verification" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "walls_verification" RENAME COLUMN "token" TO "value";--> statement-breakpoint
ALTER TABLE "walls_verification" RENAME COLUMN "expires" TO "expires_at";
