// server/db/migrate.js
// Run with: npm run migrate
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '..', '.env') })

const { default: pool } = await import('./pool.js')

const SQL = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS categories (
  id         SERIAL PRIMARY KEY,
  slug       VARCHAR(50)  UNIQUE NOT NULL,
  label      VARCHAR(100) NOT NULL,
  icon       VARCHAR(10),
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS age_groups (
  id       SERIAL PRIMARY KEY,
  slug     VARCHAR(50)  UNIQUE NOT NULL,
  label    VARCHAR(100) NOT NULL,
  range    VARCHAR(50)  NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(200) NOT NULL,
  category_id  INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  age_group_id INTEGER REFERENCES age_groups(id) ON DELETE SET NULL,
  gender       VARCHAR(10) DEFAULT 'unisex' CHECK (gender IN ('boy','girl','unisex')),
  price        NUMERIC(8,2) NOT NULL CHECK (price >= 0),
  old_price    NUMERIC(8,2) CHECK (old_price >= 0),
  badge        VARCHAR(20) CHECK (badge IN ('new','sale') OR badge IS NULL),
  image_url    TEXT,
  fallback_bg  VARCHAR(20) DEFAULT '#EEEDFE',
  sizes        TEXT[]  DEFAULT '{}',
  in_stock     BOOLEAN DEFAULT TRUE,
  rating       NUMERIC(3,1) DEFAULT 4.0 CHECK (rating BETWEEN 0 AND 5),
  reviews      INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE products ADD COLUMN IF NOT EXISTS gender VARCHAR(10) DEFAULT 'unisex';

CREATE INDEX IF NOT EXISTS idx_products_category  ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_age_group ON products(age_group_id);
CREATE INDEX IF NOT EXISTS idx_products_badge     ON products(badge);
CREATE INDEX IF NOT EXISTS idx_products_price     ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_in_stock  ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_gender    ON products(gender);

ALTER TABLE products ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(name,''))
  ) STORED;
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(search_vector);

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name          VARCHAR(200),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS password_reset_codes (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  code       VARCHAR(6) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS carts (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(100),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE carts ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS cart_items (
  id         SERIAL PRIMARY KEY,
  cart_id    INTEGER REFERENCES carts(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  qty        INTEGER NOT NULL DEFAULT 1 CHECK (qty > 0),
  UNIQUE (cart_id, product_id)
);

CREATE TABLE IF NOT EXISTS wishlists (
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  added_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, product_id)
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS \$func\$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
\$func\$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
`

async function migrate() {
  console.log('Running migrations...')
  try {
    await pool.query(SQL)
    console.log('✓ Migrations complete')
  } catch (err) {
    console.error('✗ Migration failed:', err.message)
    throw err
  } finally {
    await pool.end()
  }
}

migrate()
