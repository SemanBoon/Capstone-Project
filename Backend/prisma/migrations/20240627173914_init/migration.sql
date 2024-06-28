-- CreateTable
CREATE TABLE "User" (
    "email" TEXT NOT NULL,
    "phoneNumber" INTEGER NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profilePhoto" TEXT NOT NULL,
    "userAddress" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "ServiceProvider" (
    "email" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "businessAddress" TEXT NOT NULL,
    "phoneNumber" INTEGER NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "services" TEXT NOT NULL,
    "profilePhoto" TEXT NOT NULL,
    "coverPhoto" TEXT NOT NULL,

    CONSTRAINT "ServiceProvider_pkey" PRIMARY KEY ("email")
);
