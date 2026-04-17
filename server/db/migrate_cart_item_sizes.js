import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '..', '.env') })

const { default: pool } = await import('./pool.js')

const SQL = `
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS size VARCHAR(20);
ALTER TABLE cart_items ALTER COLUMN size SET DEFAULT '';
UPDATE cart_items SET size = '' WHERE size IS NULL;
ALTER TABLE cart_items ALTER COLUMN size SET NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'cart_items_cart_id_product_id_key'
  ) THEN
    ALTER TABLE cart_items DROP CONSTRAINT cart_items_cart_id_product_id_key;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'cart_items_cart_id_product_id_size_key'
  ) THEN
    ALTER TABLE cart_items
      ADD CONSTRAINT cart_items_cart_id_product_id_size_key
      UNIQUE (cart_id, product_id, size);
  END IF;
END $$;
`

async function migrate() {
  console.log('Running cart item size migration...')
  try {
    await pool.query(SQL)
    console.log('Cart item size migration complete')
  } catch (err) {
    console.error('Cart item size migration failed:', err.message)
    throw err
  } finally {
    await pool.end()
  }
}

migrate()
