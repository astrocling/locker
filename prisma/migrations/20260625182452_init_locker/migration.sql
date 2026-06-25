-- CreateEnum
CREATE TYPE "Category" AS ENUM ('MEDS', 'FOOD', 'GEAR', 'CLOTHING', 'TOILETRIES', 'OTHER');

-- CreateEnum
CREATE TYPE "QuantityType" AS ENUM ('COUNT', 'LEVEL');

-- CreateEnum
CREATE TYPE "Level" AS ENUM ('FULL', 'MEDIUM', 'LOW');

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "quantityType" "QuantityType" NOT NULL,
    "quantity" INTEGER,
    "level" "Level",
    "lowThreshold" INTEGER,
    "expirationDate" TIMESTAMP(3),
    "notes" TEXT,
    "updatedBy" TEXT NOT NULL,
    "updatedByEmail" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);
