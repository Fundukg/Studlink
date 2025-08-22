/*
  Warnings:

  - Added the required column `course` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "public"."TargetType" ADD VALUE 'COURSE';

-- AlterTable
ALTER TABLE "public"."Message" ADD COLUMN     "coures" INTEGER;

-- AlterTable
ALTER TABLE "public"."Student" ADD COLUMN     "course" INTEGER NOT NULL;
