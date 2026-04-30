/*
  Warnings:

  - You are about to drop the column `paltform` on the `Message` table. All the data in the column will be lost.
  - Added the required column `platform` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "paltform",
ADD COLUMN     "platform" "BotPlatform" NOT NULL;
