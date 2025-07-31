/*
  Warnings:

  - You are about to drop the column `Department` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `FullName` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "Department",
DROP COLUMN "FullName";
