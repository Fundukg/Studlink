/*
  Warnings:

  - The values [STAFF,STUDENT] on the enum `SenderType` will be removed. If these variants are still used in the database, this will fail.
  - The values [STUDENT,STAFF] on the enum `TargetType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `staffId` on the `Distribution` table. All the data in the column will be lost.
  - You are about to drop the column `recipientStaffId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `recipientStudentId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `staffId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `bot_users` table. All the data in the column will be lost.
  - You are about to drop the `Staff` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Student` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,botId]` on the table `bot_users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `senderId` to the `Distribution` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `course` on the `Group` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `userId` to the `bot_users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'DEANERY', 'TEACHER', 'STUDENT');

-- AlterEnum
BEGIN;
CREATE TYPE "SenderType_new" AS ENUM ('USER', 'SYSTEM');
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

-- DropForeignKey
ALTER TABLE "Distribution" DROP CONSTRAINT "Distribution_staffId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_recipientStaffId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_recipientStudentId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_staffId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_groupId_fkey";

-- DropForeignKey
ALTER TABLE "bot_users" DROP CONSTRAINT "bot_users_studentId_fkey";

-- DropIndex
DROP INDEX "Message_staffId_idx";

-- DropIndex
DROP INDEX "Message_studentId_idx";

-- DropIndex
DROP INDEX "bot_users_studentId_botId_key";

-- AlterTable
ALTER TABLE "Distribution" DROP COLUMN "staffId",
ADD COLUMN     "senderId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "course",
ADD COLUMN     "course" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "recipientStaffId",
DROP COLUMN "recipientStudentId",
DROP COLUMN "staffId",
DROP COLUMN "studentId",
ADD COLUMN     "recipientId" TEXT,
ADD COLUMN     "senderId" TEXT;

-- AlterTable
ALTER TABLE "bot_users" DROP COLUMN "studentId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Staff";

-- DropTable
DROP TABLE "Student";

-- DropEnum
DROP TYPE "RoleStaff";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nick" TEXT,
    "password" TEXT,
    "lastName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "course" INTEGER NOT NULL,
    "isLeader" BOOLEAN NOT NULL DEFAULT false,
    "groupId" TEXT,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "departmentId" TEXT,
    "subjects" JSONB,

    CONSTRAINT "TeacherProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_nick_key" ON "User"("nick");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_lastName_firstName_idx" ON "User"("lastName", "firstName");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_student_id_key" ON "StudentProfile"("student_id");

-- CreateIndex
CREATE INDEX "StudentProfile_groupId_idx" ON "StudentProfile"("groupId");

-- CreateIndex
CREATE INDEX "StudentProfile_course_idx" ON "StudentProfile"("course");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherProfile_userId_key" ON "TeacherProfile"("userId");

-- CreateIndex
CREATE INDEX "TeacherProfile_departmentId_idx" ON "TeacherProfile"("departmentId");

-- CreateIndex
CREATE INDEX "Distribution_senderId_idx" ON "Distribution"("senderId");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE UNIQUE INDEX "bot_users_userId_botId_key" ON "bot_users"("userId", "botId");

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherProfile" ADD CONSTRAINT "TeacherProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherProfile" ADD CONSTRAINT "TeacherProfile_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bot_users" ADD CONSTRAINT "bot_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Distribution" ADD CONSTRAINT "Distribution_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
