-- CreateTable
CREATE TABLE "Dialogue" (
    "id" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "directions" TEXT NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "Dialogue_pkey" PRIMARY KEY ("id")
);
