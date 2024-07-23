/*
  Warnings:

  - Added the required column `description` to the `appointment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "appointment" ADD COLUMN     "description" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
