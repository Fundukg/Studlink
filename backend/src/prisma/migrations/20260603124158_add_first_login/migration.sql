/*
  Warnings:

  - Added the required column `firstLogin` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "firstLogin" BOOLEAN NOT NULL;
