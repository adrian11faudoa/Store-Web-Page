CREATE TYPE "UserRole" AS ENUM ('admin', 'user');
CREATE TYPE "AuthProvider" AS ENUM ('local', 'google');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "passwordHash" TEXT,
  "role" "UserRole" NOT NULL DEFAULT 'user',
  "avatarUrl" TEXT,
  "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuthAccount" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "provider" "AuthProvider" NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AuthAccount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RefreshToken" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tokenId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "userAgent" TEXT,
  "ipAddress" TEXT,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Category" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Product" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "badge" TEXT,
  "gender" TEXT NOT NULL,
  "ageGroup" TEXT NOT NULL,
  "price" DECIMAL(10,2) NOT NULL,
  "rating" DECIMAL(3,2) NOT NULL DEFAULT 4.5,
  "releaseDate" TIMESTAMP(3) NOT NULL,
  "imageUrl" TEXT,
  "paletteStart" TEXT NOT NULL DEFAULT '#f5ead8',
  "paletteEnd" TEXT NOT NULL DEFAULT '#ffffff',
  "isFeatured" BOOLEAN NOT NULL DEFAULT false,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "categoryId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductVariant" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "size" TEXT NOT NULL,
  "sku" TEXT NOT NULL,
  "stock" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Cart" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "guestCartId" TEXT,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CartItem" (
  "id" TEXT NOT NULL,
  "cartId" TEXT NOT NULL,
  "variantId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "AuthAccount_provider_providerAccountId_key" ON "AuthAccount"("provider", "providerAccountId");
CREATE INDEX "AuthAccount_userId_idx" ON "AuthAccount"("userId");
CREATE UNIQUE INDEX "RefreshToken_tokenId_key" ON "RefreshToken"("tokenId");
CREATE INDEX "RefreshToken_userId_expiresAt_idx" ON "RefreshToken"("userId", "expiresAt");
CREATE INDEX "RefreshToken_tokenId_idx" ON "RefreshToken"("tokenId");
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX "Product_createdAt_idx" ON "Product"("createdAt" DESC);
CREATE INDEX "Product_price_idx" ON "Product"("price");
CREATE INDEX "Product_isFeatured_isActive_idx" ON "Product"("isFeatured", "isActive");
CREATE UNIQUE INDEX "ProductVariant_sku_key" ON "ProductVariant"("sku");
CREATE UNIQUE INDEX "ProductVariant_productId_size_key" ON "ProductVariant"("productId", "size");
CREATE INDEX "ProductVariant_productId_idx" ON "ProductVariant"("productId");
CREATE UNIQUE INDEX "Cart_guestCartId_key" ON "Cart"("guestCartId");
CREATE INDEX "Cart_userId_idx" ON "Cart"("userId");
CREATE UNIQUE INDEX "CartItem_cartId_variantId_key" ON "CartItem"("cartId", "variantId");
CREATE INDEX "CartItem_variantId_idx" ON "CartItem"("variantId");

ALTER TABLE "AuthAccount" ADD CONSTRAINT "AuthAccount_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey"
FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey"
FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_variantId_fkey"
FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
