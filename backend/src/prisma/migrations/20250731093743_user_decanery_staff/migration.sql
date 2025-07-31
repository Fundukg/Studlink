/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Dialogue" DROP CONSTRAINT "Dialogue_authorId_fkey";

-- DropTable
DROP TABLE "public"."User";

-- CreateTable
CREATE TABLE "public"."DecaneryStaff" (
    "id" TEXT NOT NULL,
    "nick" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DecaneryStaff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DecaneryStaff_nick_key" ON "public"."DecaneryStaff"("nick");

-- AddForeignKey
ALTER TABLE "public"."Dialogue" ADD CONSTRAINT "Dialogue_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."DecaneryStaff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
