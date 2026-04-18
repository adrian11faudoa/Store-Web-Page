ALTER TABLE products DROP CONSTRAINT IF EXISTS products_badge_check;

ALTER TABLE products
ADD CONSTRAINT products_badge_check
CHECK (
  badge IS NULL
  OR badge IN ('', 'new', 'featured', 'best seller', 'sale')
);
