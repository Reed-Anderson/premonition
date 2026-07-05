CREATE TYPE "public"."sport" AS ENUM('SOCCER', 'FOOTBALL', 'HOCKEY');--> statement-breakpoint
ALTER TABLE "competitions" ADD COLUMN "sport" "sport" NOT NULL;