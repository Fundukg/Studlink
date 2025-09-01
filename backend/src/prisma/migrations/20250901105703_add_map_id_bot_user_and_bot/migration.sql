/*
  Warnings:

  - You are about to drop the `Bot` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BotUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."BotUser" DROP CONSTRAINT "BotUser_botId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BotUser" DROP CONSTRAINT "BotUser_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_botId_fkey";

-- DropTable
DROP TABLE "public"."Bot";

-- DropTable
DROP TABLE "public"."BotUser";

-- CreateTable
CREATE TABLE "public"."bots" (
    "id" TEXT NOT NULL,
    "platform" "public"."BotPlatform" NOT NULL,
    "token" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "bots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bot_users" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "bot_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bots_platform_key" ON "public"."bots"("platform");

-- CreateIndex
CREATE UNIQUE INDEX "bots_token_key" ON "public"."bots"("token");

-- CreateIndex
CREATE INDEX "bot_users_externalId_idx" ON "public"."bot_users"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "bot_users_studentId_botId_key" ON "public"."bot_users"("studentId", "botId");

-- AddForeignKey
ALTER TABLE "public"."bot_users" ADD CONSTRAINT "bot_users_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bot_users" ADD CONSTRAINT "bot_users_botId_fkey" FOREIGN KEY ("botId") REFERENCES "public"."bots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_botId_fkey" FOREIGN KEY ("botId") REFERENCES "public"."bots"("id") ON DELETE SET NULL ON UPDATE CASCADE;
