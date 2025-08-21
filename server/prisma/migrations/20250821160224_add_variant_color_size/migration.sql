/*
  Warnings:

  - A unique constraint covering the columns `[productId,color,size]` on the table `ProductVariant` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."ProductKind" AS ENUM ('apparel', 'shoes', 'accessory');

-- CreateEnum
CREATE TYPE "public"."Target" AS ENUM ('men', 'women', 'unisex');

-- CreateEnum
CREATE TYPE "public"."SizeSystem" AS ENUM ('alpha', 'EU', 'US', 'UK');

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "kind" "public"."ProductKind" NOT NULL DEFAULT 'apparel',
ADD COLUMN     "sizeGuide" JSONB,
ADD COLUMN     "target" "public"."Target" NOT NULL DEFAULT 'unisex';

-- AlterTable
ALTER TABLE "public"."ProductVariant" ADD COLUMN     "color" TEXT,
ADD COLUMN     "size" TEXT,
ADD COLUMN     "sizeSystem" "public"."SizeSystem";

-- CreateTable
CREATE TABLE "public"."VariantImage" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "sort" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "VariantImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VariantImage_variantId_idx" ON "public"."VariantImage"("variantId");

-- CreateIndex
CREATE INDEX "Product_kind_idx" ON "public"."Product"("kind");

-- CreateIndex
CREATE INDEX "Product_target_idx" ON "public"."Product"("target");

-- CreateIndex
CREATE INDEX "ProductVariant_color_idx" ON "public"."ProductVariant"("color");

-- CreateIndex
CREATE INDEX "ProductVariant_size_idx" ON "public"."ProductVariant"("size");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_productId_color_size_key" ON "public"."ProductVariant"("productId", "color", "size");

-- AddForeignKey
ALTER TABLE "public"."VariantImage" ADD CONSTRAINT "VariantImage_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "public"."ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
