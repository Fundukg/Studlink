/*
  Warnings:

  - You are about to drop the `DecaneryStaff` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_authorId_fkey";

-- DropTable
DROP TABLE "DecaneryStaff";

-- DropTable
DROP TABLE "Message";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nick" TEXT NOT NULL,
    "FullName" TEXT NOT NULL,
    "Department" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dialogue" (
    "id" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "directions" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "Dialogue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_nick_key" ON "User"("nick");

-- CreateIndex
CREATE UNIQUE INDEX "Dialogue_group_key" ON "Dialogue"("group");

-- AddForeignKey
ALTER TABLE "Dialogue" ADD CONSTRAINT "Dialogue_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
