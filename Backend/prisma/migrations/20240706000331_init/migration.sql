-- AlterTable
ALTER TABLE "ServiceProvider" ALTER COLUMN "businessAddress" DROP NOT NULL,
ALTER COLUMN "services" DROP NOT NULL,
ALTER COLUMN "profilePhoto" DROP NOT NULL,
ALTER COLUMN "coverPhoto" DROP NOT NULL;
