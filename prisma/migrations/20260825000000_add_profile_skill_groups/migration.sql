-- AlterTable
ALTER TABLE "profiles" ADD COLUMN "skillGroups" JSONB NOT NULL DEFAULT '[]'::jsonb;
