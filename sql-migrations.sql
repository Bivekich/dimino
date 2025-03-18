-- Добавление полей address, phone и workingHours в таблицу Seller
ALTER TABLE "Seller" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "Seller" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "Seller" ADD COLUMN IF NOT EXISTS "workingHours" TEXT;

-- Create enum types
CREATE TYPE "Role" AS ENUM ('USER', 'SELLER', 'ADMIN');
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE');
CREATE TYPE "EntityType" AS ENUM ('USER', 'SELLER', 'CITY', 'FISH', 'PRODUCT', 'MEDIA', 'ORDER');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED');

-- Create Order table
CREATE TABLE "Order" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "comment" TEXT,
  "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
  "cityId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- Create OrderItem table
CREATE TABLE "OrderItem" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,

  CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "Order" ADD CONSTRAINT "Order_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
