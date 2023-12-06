-- CreateTable
CREATE TABLE "SavedNumbers" (
    "id" TEXT NOT NULL,
    "numbers" TEXT[],
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedNumbers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SavedNumbers" ADD CONSTRAINT "SavedNumbers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
