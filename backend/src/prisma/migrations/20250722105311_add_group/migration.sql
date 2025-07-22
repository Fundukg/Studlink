/*
  Warnings:

  - A unique constraint covering the columns `[group]` on the table `Dialogue` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `group` to the `Dialogue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Dialogue" ADD COLUMN     "group" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Dialogue_group_key" ON "Dialogue"("group");
