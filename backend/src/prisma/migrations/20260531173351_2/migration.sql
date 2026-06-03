/*
  Warnings:

  - You are about to drop the column `course` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `departmentId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `facultyId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `groupId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `targetType` on the `Message` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_facultyId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_groupId_fkey";

-- DropIndex
DROP INDEX "Message_groupId_idx";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "course",
DROP COLUMN "departmentId",
DROP COLUMN "facultyId",
DROP COLUMN "groupId",
DROP COLUMN "targetType";

-- CreateIndex
CREATE INDEX "Message_recipientId_idx" ON "Message"("recipientId");
