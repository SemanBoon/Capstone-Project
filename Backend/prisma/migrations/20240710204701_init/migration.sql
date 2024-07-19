/*
  Warnings:

  - The `profilePhoto` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `businessAddress` on table `ServiceProvider` required. This step will fail if there are existing NULL values in that column.
  - Made the column `services` on table `ServiceProvider` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bio` on table `ServiceProvider` required. This step will fail if there are existing NULL values in that column.
  - Made the column `priceRange` on table `ServiceProvider` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ServiceProvider" ALTER COLUMN "businessAddress" SET NOT NULL,
ALTER COLUMN "phoneNumber" SET DATA TYPE TEXT,
ALTER COLUMN "services" SET NOT NULL,
ALTER COLUMN "bio" SET NOT NULL,
ALTER COLUMN "priceRange" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "phoneNumber" SET DATA TYPE TEXT,
DROP COLUMN "profilePhoto",
ADD COLUMN     "profilePhoto" BYTEA;
