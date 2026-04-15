# Store-Web-Page (Sahara Kids) — Local Testing Setup

## Overview
Children's clothing e-commerce app with React (Vite) frontend and Express + PostgreSQL backend.

## Prerequisites
- Node.js (v22+)
- PostgreSQL 14+

## Local Setup

### 1. Install PostgreSQL (if not present)
```bash
sudo apt-get install -y postgresql postgresql-client
sudo pg_ctlcluster 14 main start
sudo -u postgres psql -c "CREATE USER ubuntu WITH SUPERUSER PASSWORD 'password';"
sudo -u postgres psql -c "CREATE DATABASE tinyfits OWNER ubuntu;"
```

### 2. Create .env file at repo root
```
DATABASE_URL=postgresql://ubuntu:password@localhost:5432/tinyfits
JWT_SECRET=test-secret-for-local-dev
NODE_ENV=development
CLIENT_URL=http://localhost:3000
PORT=4000
```

### 3. Install dependencies
```bash
npm install
npm install --prefix client
npm install --prefix server
```

### 4. Run migrations and seed
```bash
export DATABASE_URL="postgresql://ubuntu:password@localhost:5432/tinyfits"
npm run migrate
npm run seed
```

### 5. Start the app
The server requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to be set (even as dummy values) because `server/routes/google.js` initializes the Google OAuth strategy at import time before the conditional check in `server/index.js`. Use dummy values for local testing:
```bash
GOOGLE_CLIENT_ID=dummy GOOGLE_CLIENT_SECRET=dummy \
  DATABASE_URL="postgresql://ubuntu:password@localhost:5432/tinyfits" \
  JWT_SECRET="test-secret-for-local-dev" \
  NODE_ENV=development CLIENT_URL=http://localhost:3000 PORT=4000 \
  node server/index.js
```

In a separate terminal, start the Vite dev server:
```bash
cd client && npx vite --host 0.0.0.0 --port 3000
```

## Architecture
- **Frontend**: React 18 + Vite on port 3000. Vite proxies `/api/*` to backend.
- **Backend**: Express on port 4000. Uses `pg` pool with `DATABASE_URL`.
- **Database**: PostgreSQL. Schema in `server/db/migrate.js`, seed data in `server/db/seed.js`.
- **Product images**: Hotlinked from Pexels CDN (`https://images.pexels.com/photos/{ID}/pexels-photo-{ID}.jpeg?...`). Photo IDs are defined in `PHOTO_IDS` arrays in `seed.js` and cycled via modulo in `pickPhotoId()`.

## Key Routes for Testing
- `/` — Home page
- `/shop` — Product listing with category filters (e.g., `/shop?category=bottoms`)
- `/product/:id` — Product detail page with main image

## Testing Product Images
1. **Database check**: Query products table to verify `image_url` contains expected Pexels IDs
   ```sql
   SELECT id, name, image_url FROM products WHERE name LIKE '%chinos%';
   ```
2. **Visual check**: Open product detail pages in browser, verify images show children/clothing content
3. **Fallback check**: The `onError` handler in `Product.jsx` shows a 👕 emoji fallback if the image fails to load. Test by injecting a broken URL via browser console.
4. **Grid check**: Browse `/shop?category=<slug>` and visually verify no obviously unrelated images (cars, landscapes, etc.)

## Devin Secrets Needed
No secrets required for local testing. PostgreSQL uses local `ubuntu` user with password `password`. Google OAuth uses dummy values.

## Common Issues
- **Google OAuth crash on startup**: If you don't set `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` env vars (even as dummy values), the server will crash because `passport-google-oauth20` validates the clientID at strategy construction time, before the conditional check in `index.js`.
- **Images not updating after code change**: Must re-run `npm run seed` to update the database with new photo IDs.
- **No .env file in repo**: The `.env` file is gitignored. Create it manually per the setup instructions above.
