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
- `/shop?ageGroup=girls&gender=girl` — Filtered shop by age/gender (used by navbar sidebar)
- `/product/:id` — Product detail page with main image

## Testing Product Images
1. **Database check**: Query products table to verify `image_url` contains expected Pexels IDs
   ```sql
   SELECT id, name, image_url FROM products WHERE name LIKE '%chinos%';
   ```
2. **Visual check**: Open product detail pages in browser, verify images show children/clothing content
3. **Fallback check**: The `onError` handler in `Product.jsx` shows a shirt emoji fallback if the image fails to load. Test by injecting a broken URL via browser console.
4. **Grid check**: Browse `/shop?category=<slug>` and visually verify no obviously unrelated images (cars, landscapes, etc.)

## Testing Responsive Navbar

### Desktop (>900px)
- The horizontal category bar (`.navbar-bottom`) should display 7 categories: Girl, Boy, Toddler Girl, Toddler Boy, Baby, Pajamas, Shoes & Accessories
- "New In"/"Novedades" and "Sale"/"Oferta" should NOT appear in the navbar
- The hamburger button (`.navbar-hamburger`) should have `display: none`

### Mobile (<=900px)
- The category bar (`.navbar-bottom`) should have `display: none`
- The hamburger button (`.navbar-hamburger`) should have `display: flex`
- Clicking hamburger opens the nav-drawer sidebar from the left
- Sidebar contains: "Shop By Age" heading, 7 category items with size ranges, "Create Account"/"Login" auth links, close button
- Clicking a category navigates to the filtered shop page and auto-closes the sidebar

### Mobile Viewport Testing with Playwright
**Important**: `page.setViewportSize()` only works on NEW pages created via `context.newPage()`. It does NOT work reliably on pages obtained via `chromium.connectOverCDP()` and then accessing existing tabs.

For programmatic tests (data/assertion gathering):
```javascript
const browser = await chromium.connectOverCDP('http://localhost:29229');
const context = browser.contexts()[0];
const page = await context.newPage(); // MUST be new page
await page.goto('http://localhost:3000');
await page.setViewportSize({ width: 768, height: 900 }); // Works on new pages
```

For visual tests on the existing visible browser tab (for screen recording):
```javascript
const page = context.pages()[0]; // Existing visible tab
const cdp = await page.context().newCDPSession(page);
await cdp.send('Emulation.setDeviceMetricsOverride', {
  width: 768, height: 900, deviceScaleFactor: 1, mobile: false,
});
// ... test ...
await cdp.send('Emulation.clearDeviceMetricsOverride'); // Reset after
```

## Testing Z-Index / Drawer Stacking

The app uses a shared `.drawer-backdrop` element for both the nav-drawer (sidebar) and cart-drawer. The correct z-index stacking is:
- `.nav-drawer` and `.cart-drawer`: z-index **400**
- `.drawer-backdrop`: z-index **399**

**Adversarial click test**: The best way to verify drawer z-index is correct is to attempt a normal Playwright click on a drawer item WITHOUT `force: true`. If the backdrop's z-index is higher than the drawer's, Playwright will throw a `TimeoutError` because the backdrop intercepts the click. A successful click without force proves the stacking is correct.

```javascript
// This will FAIL if z-index is wrong (backdrop intercepts click)
await page.click('.nav-drawer__item', { timeout: 5000 });
// If we get here without error, z-index stacking is correct
```

Watch out for duplicate CSS rules — if the same selector appears multiple times in a CSS file, the last one wins (CSS cascade). This was the root cause of a z-index bug where a duplicate `.drawer-backdrop` rule at the end of the file overrode the intended z-index.

## Devin Secrets Needed
No secrets required for local testing. PostgreSQL uses local `ubuntu` user with password `password`. Google OAuth uses dummy values.

## Common Issues
- **Google OAuth crash on startup**: If you don't set `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` env vars (even as dummy values), the server will crash because `passport-google-oauth20` validates the clientID at strategy construction time, before the conditional check in `index.js`.
- **Images not updating after code change**: Must re-run `npm run seed` to update the database with new photo IDs.
- **No .env file in repo**: The `.env` file is gitignored. Create it manually per the setup instructions above.
- **Port 4000 already in use**: If the backend fails with `EADDRINUSE`, kill the existing node process (`kill $(lsof -t -i:4000)` on Linux, or `taskkill /IM node.exe /F` on Windows) before restarting.
- **Viewport resize not working**: If `setViewportSize()` doesn't trigger CSS media queries, you may be using it on an attached/connected page instead of a new page. Create a new page via `context.newPage()` instead.
- **Sidebar items unclickable**: Check z-index values of `.nav-drawer` (should be 400) and `.drawer-backdrop` (should be 399). If backdrop z-index >= drawer z-index, the backdrop will intercept clicks.
