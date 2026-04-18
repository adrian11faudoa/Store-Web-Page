CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(255) PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(64) UNIQUE NOT NULL,
  label VARCHAR(128) NOT NULL,
  icon VARCHAR(16),
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS age_groups (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(64) UNIQUE NOT NULL,
  label VARCHAR(128) NOT NULL,
  range VARCHAR(64) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  age_group_id INTEGER REFERENCES age_groups(id) ON DELETE SET NULL,
  gender VARCHAR(32) NOT NULL DEFAULT 'unisex',
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  old_price NUMERIC(10, 2),
  badge VARCHAR(64),
  image_url TEXT,
  fallback_bg VARCHAR(32) DEFAULT '#EEEDFE',
  sizes TEXT[] NOT NULL DEFAULT '{}',
  in_stock BOOLEAN NOT NULL DEFAULT TRUE,
  rating NUMERIC(3, 1) NOT NULL DEFAULT 4.0,
  reviews INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(name, ''))
  ) STORED
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT,
  name VARCHAR(200) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'customer',
  google_id VARCHAR(128) UNIQUE,
  avatar_url TEXT,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_id UUID NOT NULL UNIQUE,
  token_hash TEXT NOT NULL,
  user_agent TEXT,
  ip_address TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS carts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(128),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size VARCHAR(32) NOT NULL DEFAULT '',
  qty INTEGER NOT NULL DEFAULT 1 CHECK (qty > 0),
  UNIQUE (cart_id, product_id, size)
);

ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS age_group_id INTEGER REFERENCES age_groups(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS gender VARCHAR(32) DEFAULT 'unisex';
ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2);
ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS old_price NUMERIC(10, 2);
ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS badge VARCHAR(64);
ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS fallback_bg VARCHAR(32) DEFAULT '#EEEDFE';
ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS sizes TEXT[] DEFAULT '{}';
ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS in_stock BOOLEAN DEFAULT TRUE;
ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 1) DEFAULT 4.0;
ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS reviews INTEGER DEFAULT 0;
ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS search_vector tsvector GENERATED ALWAYS AS (
  to_tsvector('english', coalesce(name, ''))
) STORED;

UPDATE products SET
  gender = COALESCE(gender, 'unisex'),
  fallback_bg = COALESCE(fallback_bg, '#EEEDFE'),
  sizes = COALESCE(sizes, '{}'),
  in_stock = COALESCE(in_stock, TRUE),
  rating = COALESCE(rating, 4.0),
  reviews = COALESCE(reviews, 0),
  created_at = COALESCE(created_at, NOW()),
  updated_at = COALESCE(updated_at, NOW())
WHERE
  gender IS NULL
  OR fallback_bg IS NULL
  OR sizes IS NULL
  OR in_stock IS NULL
  OR rating IS NULL
  OR reviews IS NULL
  OR created_at IS NULL
  OR updated_at IS NULL;

ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS name VARCHAR(200);
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS role VARCHAR(32) DEFAULT 'customer';
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS google_id VARCHAR(128);
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

UPDATE users SET
  name = COALESCE(name, split_part(email, '@', 1)),
  role = COALESCE(role, 'customer'),
  email_verified = COALESCE(email_verified, FALSE),
  created_at = COALESCE(created_at, NOW()),
  updated_at = COALESCE(updated_at, NOW())
WHERE
  name IS NULL
  OR role IS NULL
  OR email_verified IS NULL
  OR created_at IS NULL
  OR updated_at IS NULL;

ALTER TABLE IF EXISTS carts ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS carts ADD COLUMN IF NOT EXISTS session_id VARCHAR(128);
ALTER TABLE IF EXISTS carts ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS carts ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE IF EXISTS carts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

UPDATE carts SET
  created_at = COALESCE(created_at, NOW()),
  updated_at = COALESCE(updated_at, NOW())
WHERE created_at IS NULL OR updated_at IS NULL;

ALTER TABLE IF EXISTS cart_items ADD COLUMN IF NOT EXISTS size VARCHAR(32) DEFAULT '';
ALTER TABLE IF EXISTS cart_items ADD COLUMN IF NOT EXISTS qty INTEGER DEFAULT 1;

UPDATE cart_items SET
  size = COALESCE(size, ''),
  qty = COALESCE(qty, 1)
WHERE size IS NULL OR qty IS NULL;

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_age_group_id ON products(age_group_id);
CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender);
CREATE INDEX IF NOT EXISTS idx_products_badge ON products(badge);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_search_vector ON products USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);
CREATE INDEX IF NOT EXISTS idx_carts_session_id ON carts(session_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_items_unique_key ON cart_items(cart_id, product_id, size);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS carts_updated_at ON carts;
CREATE TRIGGER carts_updated_at BEFORE UPDATE ON carts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
