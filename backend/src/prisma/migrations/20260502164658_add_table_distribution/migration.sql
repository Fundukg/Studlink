-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "distributionId" TEXT;

-- CreateTable
CREATE TABLE "Distribution" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "staffId" TEXT NOT NULL,
    "targetType" "TargetType" NOT NULL,
    "targetId" TEXT,
    "course" INTEGER,
    "platform" "BotPlatform" NOT NULL,

    CONSTRAINT "Distribution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Distribution_createdAt_idx" ON "Distribution"("createdAt");

-- CreateIndex
CREATE INDEX "Message_distributionId_idx" ON "Message"("distributionId");

-- AddForeignKey
ALTER TABLE "Distribution" ADD CONSTRAINT "Distribution_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_distributionId_fkey" FOREIGN KEY ("distributionId") REFERENCES "Distribution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
