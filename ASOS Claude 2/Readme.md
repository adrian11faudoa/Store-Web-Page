
Structure:
tinyfits/
├── index.html          ← Homepage (hero, carousel, featured grid)
├── shop.html           ← Full shop page (sidebar + grid)
├── css/
│   └── styles.css      ← All styles with CSS variables
└── js/
    ├── data.js         ← Product data (ES module)
    ├── cart.js         ← Cart store (pub/sub pattern)
    └── components.js   ← Reusable UI components
Libraries used:

Google Fonts — Nunito + Playfair Display
Animate.css — Hero entry animations
Splide.js — Auto-playing banner carousel on the homepage
Fuse.js — Fuzzy search on the shop page

Features included:

Live fuzzy search with debounce
Sidebar filters: category, age range, price slider, sale/new toggles
Sort by price or name
Cart state with pub/sub (count updates in navbar)
Wishlist toggle per card
Toast notifications on add to cart
URL params (?filter=sale, ?cat=footwear) for deep linking
Fully responsive
