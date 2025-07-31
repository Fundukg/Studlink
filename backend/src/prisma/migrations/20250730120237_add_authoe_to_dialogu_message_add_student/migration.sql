/*
  Warnings:

  - Added the required column `authorId` to the `Dialogue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Dialogue" ADD COLUMN     "authorId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "directions" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_student_id_key" ON "Student"("student_id");

-- AddForeignKey
ALTER TABLE "Dialogue" ADD CONSTRAINT "Dialogue_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
