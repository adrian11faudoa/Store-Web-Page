# Sahara Kids Storefront

Sahara Kids is a production-ready frontend storefront rebuilt from a basic demo into a cleaner, portfolio-ready React application. The project now uses a local JSON data layer, dynamic product rendering, a persistent shopping cart, responsive layouts, and GitHub Pages-friendly deployment settings.

## Features

- Dynamic catalog rendered from [`client/public/data/products.json`](./client/public/data/products.json)
- Product search, category filtering, gender filtering, age-group filtering, and sorting
- Product detail pages with size selection and quantity controls
- Cart drawer with add, remove, quantity updates, totals, and `localStorage` persistence
- Empty-state handling for the cart and no-results searches
- Mobile-first responsive layout with dark mode support
- Semantic HTML, accessible form labels, descriptive alt text, and keyboard-safe interactions
- Relative build paths and hash-based routing for GitHub Pages deployment

## Tech Stack

- React 18
- Vite 5
- React Router
- Vanilla CSS
- JSON for mock product data
- `localStorage` for cart persistence

## Project Structure

```text
client/
  public/
    assets/
      images/
        catalog-hero.svg
        product-placeholder.svg
    data/
      products.json
  src/
    assets/
      css/
        app.css
      js/
        api/
          products.js
        utils/
          cart.js
          format.js
          products.js
    components/
      CartDrawer.jsx
      CartLineItem.jsx
      Footer.jsx
      Header.jsx
      ProductCard.jsx
      ProductFilters.jsx
    hooks/
      useCart.js
      useProducts.js
      useTheme.js
    pages/
      Checkout.jsx
      Home.jsx
      Product.jsx
      Shop.jsx
    App.jsx
    main.jsx
```

## Screenshots

Place final screenshots here when publishing the project:

- `docs/screenshots/homepage.png`
- `docs/screenshots/catalog.png`
- `docs/screenshots/cart-drawer.png`

## Installation

```bash
npm install
npm run dev
```

To run only the frontend:

```bash
npm run dev --prefix client
```

## Production Build

```bash
npm run build --prefix client
```

The production files are generated in [`client/dist`](./client/dist).

## GitHub Pages Deployment

This project is already configured for GitHub Pages:

- Vite uses relative asset paths with `base: './'`
- Routing uses `HashRouter`, so deep links work on static hosting

Deployment steps:

1. Run `npm run build --prefix client`
2. Push the contents of `client/dist`
3. In GitHub, enable Pages for the branch/folder you publish
4. Use the generated `client/dist/index.html` as the deployed entry point

If you deploy with `gh-pages`, publish the `client/dist` folder.

## Live Demo

Add your GitHub Pages URL here after deployment:

- `https://your-username.github.io/your-repo-name/`

## Quality Notes

- Replaced hardcoded storefront rendering with a reusable data layer
- Removed the old dependency on the backend product API for the frontend demo
- Reduced visual and structural duplication across the app
- Replaced oversized styling sprawl with a smaller, organized CSS system
- Verified the production build with `npm run build --prefix client`
