/*
  Warnings:

  - You are about to drop the column `password` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the `Dialogue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Dialogue" DROP CONSTRAINT "Dialogue_authorId_fkey";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "password";

-- DropTable
DROP TABLE "Dialogue";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "DecaneryStaff" (
    "id" TEXT NOT NULL,
    "nick" TEXT NOT NULL,
    "FullName" TEXT NOT NULL,
    "Department" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DecaneryStaff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "directions" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DecaneryStaff_nick_key" ON "DecaneryStaff"("nick");

-- CreateIndex
CREATE UNIQUE INDEX "Message_group_key" ON "Message"("group");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "DecaneryStaff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
