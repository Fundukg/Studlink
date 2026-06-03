/*
  Warnings:

  - The values [USER] on the enum `SenderType` will be removed. If these variants are still used in the database, this will fail.
  - The values [STUDENT,SAFF,TEACHER] on the enum `TargetType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SenderType_new" AS ENUM ('SYSTEM', 'ADMIN', 'DEANERY', 'TEACHER', 'STUDENT');
ALTER TABLE "Message" ALTER COLUMN "senderType" TYPE "SenderType_new" USING ("senderType"::text::"SenderType_new");
ALTER TYPE "SenderType" RENAME TO "SenderType_old";
ALTER TYPE "SenderType_new" RENAME TO "SenderType";
DROP TYPE "public"."SenderType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TargetType_new" AS ENUM ('USER', 'GROUP', 'DEPARTMENT', 'FACULTY', 'COURSE', 'ALL');
ALTER TABLE "Distribution" ALTER COLUMN "targetType" TYPE "TargetType_new" USING ("targetType"::text::"TargetType_new");
ALTER TABLE "Message" ALTER COLUMN "targetType" TYPE "TargetType_new" USING ("targetType"::text::"TargetType_new");
ALTER TYPE "TargetType" RENAME TO "TargetType_old";
ALTER TYPE "TargetType_new" RENAME TO "TargetType";
DROP TYPE "public"."TargetType_old";
COMMIT;
