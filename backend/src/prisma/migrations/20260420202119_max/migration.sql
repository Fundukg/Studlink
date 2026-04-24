/*
  Warnings:

  - The values [WHATSAPP] on the enum `BotPlatform` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BotPlatform_new" AS ENUM ('TELEGRAM', 'VK', 'MAX');
ALTER TABLE "bots" ALTER COLUMN "platform" TYPE "BotPlatform_new" USING ("platform"::text::"BotPlatform_new");
ALTER TYPE "BotPlatform" RENAME TO "BotPlatform_old";
ALTER TYPE "BotPlatform_new" RENAME TO "BotPlatform";
DROP TYPE "public"."BotPlatform_old";
COMMIT;
