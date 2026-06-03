/*
  Warnings:

  - You are about to drop the column `departmentId` on the `TeacherProfile` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "TeacherProfile" DROP CONSTRAINT "TeacherProfile_departmentId_fkey";

-- DropIndex
DROP INDEX "TeacherProfile_departmentId_idx";

-- AlterTable
ALTER TABLE "TeacherProfile" DROP COLUMN "departmentId";

-- CreateTable
CREATE TABLE "DeaneryProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,

    CONSTRAINT "DeaneryProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherAssignment" (
    "id" TEXT NOT NULL,
    "teacherProfileId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "roleInGroup" TEXT,

    CONSTRAINT "TeacherAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeaneryProfile_userId_key" ON "DeaneryProfile"("userId");

-- CreateIndex
CREATE INDEX "DeaneryProfile_facultyId_idx" ON "DeaneryProfile"("facultyId");

-- CreateIndex
CREATE INDEX "TeacherAssignment_groupId_idx" ON "TeacherAssignment"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherAssignment_teacherProfileId_groupId_key" ON "TeacherAssignment"("teacherProfileId", "groupId");

-- AddForeignKey
ALTER TABLE "DeaneryProfile" ADD CONSTRAINT "DeaneryProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeaneryProfile" ADD CONSTRAINT "DeaneryProfile_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAssignment" ADD CONSTRAINT "TeacherAssignment_teacherProfileId_fkey" FOREIGN KEY ("teacherProfileId") REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAssignment" ADD CONSTRAINT "TeacherAssignment_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
