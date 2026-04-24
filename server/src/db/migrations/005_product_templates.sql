ALTER TABLE products ADD COLUMN IF NOT EXISTS temporada VARCHAR(128);
ALTER TABLE products ADD COLUMN IF NOT EXISTS nombre VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS genero VARCHAR(64);
ALTER TABLE products ADD COLUMN IF NOT EXISTS color_primario VARCHAR(64);
ALTER TABLE products ADD COLUMN IF NOT EXISTS color_secundario VARCHAR(64);
ALTER TABLE products ADD COLUMN IF NOT EXISTS estampado VARCHAR(128);
ALTER TABLE products ADD COLUMN IF NOT EXISTS talla TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS precio NUMERIC(10, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS existencia INTEGER NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tipo_prenda VARCHAR(128);
ALTER TABLE products ADD COLUMN IF NOT EXISTS imagenes TEXT[] NOT NULL DEFAULT '{}';

UPDATE products
SET
  nombre = COALESCE(NULLIF(nombre, ''), name),
  genero = COALESCE(NULLIF(genero, ''), gender, 'unisex'),
  talla = CASE
    WHEN talla = '{}'::TEXT[] THEN COALESCE(sizes, ARRAY['One Size'])
    ELSE talla
  END,
  precio = COALESCE(precio, price, 0),
  tipo_prenda = COALESCE(
    NULLIF(tipo_prenda, ''),
    (SELECT COALESCE(label, slug) FROM categories WHERE categories.id = products.category_id),
    'general'
  ),
  temporada = COALESCE(NULLIF(temporada, ''), 'general'),
  color_primario = COALESCE(NULLIF(color_primario, ''), fallback_bg, '#EEEDFE'),
  color_secundario = COALESCE(
    NULLIF(color_secundario, ''),
    CASE
      WHEN array_length(palette, 1) >= 2 THEN palette[2]
      ELSE '#FFFFFF'
    END,
    '#FFFFFF'
  ),
  estampado = COALESCE(NULLIF(estampado, ''), 'sin estampado'),
  imagenes = CASE
    WHEN array_length(imagenes, 1) IS NULL OR array_length(imagenes, 1) = 0
      THEN ARRAY[COALESCE(NULLIF(image_url, ''), 'https://placehold.co/600x800?text=Product')]
    ELSE imagenes
  END,
  existencia = CASE
    WHEN existencia = 0 AND in_stock = TRUE THEN GREATEST(COALESCE(array_length(sizes, 1), 1), 1) * 5
    ELSE existencia
  END;
