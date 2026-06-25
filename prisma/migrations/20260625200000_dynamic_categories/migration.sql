-- CreateTable
CREATE TABLE "ItemCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "colorClass" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ItemCategory_name_key" ON "ItemCategory"("name");

-- Seed default categories
INSERT INTO "ItemCategory" ("id", "name", "colorClass", "sortOrder") VALUES
('cat_meds', 'Meds', 'bg-red-100 text-red-800', 0),
('cat_food', 'Food', 'bg-orange-100 text-orange-800', 1),
('cat_gear', 'Gear', 'bg-blue-100 text-blue-800', 2),
('cat_clothing', 'Clothing', 'bg-purple-100 text-purple-800', 3),
('cat_toiletries', 'Toiletries', 'bg-teal-100 text-teal-800', 4),
('cat_other', 'Other', 'bg-gray-100 text-gray-800', 5);

-- Add categoryId column
ALTER TABLE "Item" ADD COLUMN "categoryId" TEXT;

-- Backfill from enum
UPDATE "Item" SET "categoryId" = 'cat_meds' WHERE "category" = 'MEDS';
UPDATE "Item" SET "categoryId" = 'cat_food' WHERE "category" = 'FOOD';
UPDATE "Item" SET "categoryId" = 'cat_gear' WHERE "category" = 'GEAR';
UPDATE "Item" SET "categoryId" = 'cat_clothing' WHERE "category" = 'CLOTHING';
UPDATE "Item" SET "categoryId" = 'cat_toiletries' WHERE "category" = 'TOILETRIES';
UPDATE "Item" SET "categoryId" = 'cat_other' WHERE "category" = 'OTHER';

-- Drop old category column
ALTER TABLE "Item" DROP COLUMN "category";

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ItemCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- DropEnum
DROP TYPE "Category";
