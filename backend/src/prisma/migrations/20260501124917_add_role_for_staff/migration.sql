/*
  Warnings:

  - Added the required column `firstName` to the `Staff` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Staff` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `course` on the `Student` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "RoleStaff" AS ENUM ('ADMIN', 'DEANERY', 'TEACHER');

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_parentId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_recipientStaffId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_recipientStudentId_fkey";

-- DropForeignKey
ALTER TABLE "bot_users" DROP CONSTRAINT "bot_users_botId_fkey";

-- DropForeignKey
ALTER TABLE "bot_users" DROP CONSTRAINT "bot_users_studentId_fkey";

-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "middleName" TEXT,
ADD COLUMN     "role" "RoleStaff" NOT NULL DEFAULT 'TEACHER';

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "course",
ADD COLUMN     "course" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Department_facultyId_idx" ON "Department"("facultyId");

-- CreateIndex
CREATE INDEX "Group_departmentId_idx" ON "Group"("departmentId");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- CreateIndex
CREATE INDEX "Message_groupId_idx" ON "Message"("groupId");

-- CreateIndex
CREATE INDEX "Message_staffId_idx" ON "Message"("staffId");

-- CreateIndex
CREATE INDEX "Message_studentId_idx" ON "Message"("studentId");

-- CreateIndex
CREATE INDEX "Staff_role_idx" ON "Staff"("role");

-- CreateIndex
CREATE INDEX "Staff_lastName_firstName_idx" ON "Staff"("lastName", "firstName");

-- CreateIndex
CREATE INDEX "Student_groupId_idx" ON "Student"("groupId");

-- CreateIndex
CREATE INDEX "Student_course_idx" ON "Student"("course");

-- AddForeignKey
ALTER TABLE "bot_users" ADD CONSTRAINT "bot_users_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bot_users" ADD CONSTRAINT "bot_users_botId_fkey" FOREIGN KEY ("botId") REFERENCES "bots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_recipientStudentId_fkey" FOREIGN KEY ("recipientStudentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_recipientStaffId_fkey" FOREIGN KEY ("recipientStaffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
