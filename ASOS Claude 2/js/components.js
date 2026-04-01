// =========================================
// tiny.fits — UI Components
// =========================================

import cart from './cart.js';

// ---- SVG Icons ----
export const Icons = {
  search: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  heart: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  heartFill: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#e84393" stroke="#e84393" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  bag: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  plus: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  arrow: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  chevronDown: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
};

// ---- Toast ----
let toastTimer = null;

export function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  clearTimeout(toastTimer);
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ---- Navbar ----
export function renderNavbar() {
  const nav = document.createElement('nav');
  nav.className = 'navbar';
  nav.innerHTML = `
    <a href="index.html" class="navbar__logo">tiny<span>.</span>fits</a>
    <ul class="navbar__links">
      <li><a href="index.html" class="active">New in</a></li>
      <li><a href="shop.html">Boys</a></li>
      <li><a href="shop.html">Girls</a></li>
      <li><a href="shop.html">Baby</a></li>
      <li><a href="shop.html" style="color:#D85A30">Sale</a></li>
    </ul>
    <div class="navbar__actions">
      <button class="nav-icon-btn" id="search-btn">${Icons.search} Search</button>
      <button class="nav-icon-btn" id="wishlist-btn">${Icons.heart} Wishlist</button>
      <button class="cart-btn" id="cart-btn">
        ${Icons.bag}
        Bag
        <span class="cart-count" id="cart-count">0</span>
      </button>
    </div>
  `;

  // Keep cart count updated
  cart.subscribe(({ count }) => {
    const badge = nav.querySelector('#cart-count');
    if (badge) badge.textContent = count;
  });

  return nav;
}

// ---- Product Card ----
export function renderProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card animate-fade-up';
  card.dataset.id = product.id;

  const badgeHTML = product.badge
    ? `<span class="badge badge--${product.badge}">${product.badge === 'new' ? 'New' : `−${Math.round((1 - product.price / product.oldPrice) * 100)}%`}</span>`
    : '';

  const priceHTML = product.oldPrice
    ? `$${product.price} <span class="price__old">$${product.oldPrice}</span>`
    : `$${product.price}`;

  const sizesHTML = product.sizes
    .map(s => `<span class="size-tag">${s}</span>`)
    .join('');

  card.innerHTML = `
    <div class="product-card__img" style="background:${product.bg}">
      ${badgeHTML}
      <button class="product-card__wishlist" data-id="${product.id}" aria-label="Add to wishlist">
        ${Icons.heart}
      </button>
      <span style="font-size:64px">${product.emoji}</span>
    </div>
    <div class="product-card__body">
      <div class="product-card__name">${product.name}</div>
      <div class="product-card__meta">${product.ages}</div>
      <div class="size-row">${sizesHTML}</div>
      <div class="product-card__footer">
        <span class="price">${priceHTML}</span>
        <button class="add-to-cart" data-id="${product.id}">
          ${Icons.plus} Add
        </button>
      </div>
    </div>
  `;

  // Wishlist toggle
  const wishBtn = card.querySelector('.product-card__wishlist');
  let wished = false;
  wishBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    wished = !wished;
    wishBtn.classList.toggle('active', wished);
    wishBtn.innerHTML = wished ? Icons.heartFill : Icons.heart;
    showToast(wished ? `❤️ Added to wishlist` : `Removed from wishlist`);
  });

  // Add to cart
  const addBtn = card.querySelector('.add-to-cart');
  addBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    cart.add(product);
    addBtn.classList.add('added');
    addBtn.innerHTML = `${Icons.check} Added`;
    showToast(`🛍 ${product.name} added to bag!`);
    setTimeout(() => {
      addBtn.classList.remove('added');
      addBtn.innerHTML = `${Icons.plus} Add`;
    }, 1800);
  });

  return card;
}

// ---- Product Grid ----
export function renderProductGrid(products, container) {
  container.innerHTML = '';
  if (products.length === 0) {
    container.innerHTML = `<p style="color:var(--color-text-muted);grid-column:1/-1;padding:2rem 0;">No products found.</p>`;
    return;
  }
  products.forEach((p, i) => {
    const card = renderProductCard(p);
    card.style.animationDelay = `${i * 0.06}s`;
    container.appendChild(card);
  });
}

// ---- Category Tabs ----
export function renderCategoryTabs(tabs, activeTab, onSelect) {
  const bar = document.createElement('div');
  bar.className = 'cat-bar';
  tabs.forEach(tab => {
    const btn = document.createElement('button');
    btn.className = 'cat-tab' + (tab.value === activeTab ? ' active' : '');
    btn.textContent = tab.label;
    btn.addEventListener('click', () => {
      bar.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      onSelect(tab.value);
    });
    bar.appendChild(btn);
  });
  return bar;
}

// ---- Filter Chips ----
export function renderFilterBar(filters, activeFilters, onToggle) {
  const bar = document.createElement('div');
  bar.className = 'filter-bar';
  filters.forEach(f => {
    const btn = document.createElement('button');
    btn.className = 'filter-chip' + (activeFilters.includes(f.value) ? ' active' : '');
    btn.innerHTML = `${Icons.chevronDown} ${f.label}`;
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      onToggle(f.value);
    });
    bar.appendChild(btn);
  });
  return bar;
}

// ---- Trust Strip ----
export function renderTrustStrip() {
  const strip = document.createElement('div');
  strip.className = 'trust-strip';
  const items = [
    { icon: '🚚', title: 'Free next-day delivery', sub: 'On orders over $50' },
    { icon: '↩️', title: 'Free returns', sub: 'No questions asked' },
    { icon: '🌱', title: 'Sustainable materials', sub: 'GOTS certified cotton' },
    { icon: '📦', title: 'Tracked shipping', sub: 'Know exactly where it is' },
  ];
  items.forEach(item => {
    strip.innerHTML += `
      <div class="trust-item">
        <div class="trust-item__icon">${item.icon}</div>
        <div class="trust-item__text">
          <strong>${item.title}</strong>
          <span>${item.sub}</span>
        </div>
      </div>
    `;
  });
  return strip;
}

// ---- Promo Banner ----
export function renderPromoBanner() {
  const banner = document.createElement('div');
  banner.className = 'promo-banner';
  banner.innerHTML = `
    <div class="promo-banner__icon">🚚</div>
    <div class="promo-banner__content">
      <h3>Free next-day delivery on orders over $50</h3>
      <p>Plus free, no-hassle returns on every order — always.</p>
    </div>
    <button class="btn btn--teal">Learn more ${Icons.arrow}</button>
  `;
  return banner;
}

// ---- Footer ----
export function renderFooter() {
  const footer = document.createElement('footer');
  footer.className = 'footer';
  footer.innerHTML = `
    <div class="footer__grid">
      <div>
        <div class="footer__brand-logo">tiny<span>.</span>fits</div>
        <p class="footer__tagline">Clothes kids love,<br>prices parents don't hate.</p>
        <div class="footer__social">
          <button class="social-btn">📸</button>
          <button class="social-btn">🐦</button>
          <button class="social-btn">📌</button>
          <button class="social-btn">▶️</button>
        </div>
      </div>
      <div class="footer__col">
        <h4>Shop</h4>
        <ul>
          <li><a href="shop.html">New in</a></li>
          <li><a href="shop.html">Boys</a></li>
          <li><a href="shop.html">Girls</a></li>
          <li><a href="shop.html">Baby</a></li>
          <li><a href="shop.html">Sale</a></li>
        </ul>
      </div>
      <div class="footer__col">
        <h4>Help</h4>
        <ul>
          <li><a href="#">Size guide</a></li>
          <li><a href="#">Returns</a></li>
          <li><a href="#">Delivery info</a></li>
          <li><a href="#">Track order</a></li>
          <li><a href="#">FAQs</a></li>
        </ul>
      </div>
      <div class="footer__col">
        <h4>About</h4>
        <ul>
          <li><a href="#">Our story</a></li>
          <li><a href="#">Sustainability</a></li>
          <li><a href="#">Press</a></li>
          <li><a href="#">Careers</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </div>
    </div>
    <div class="footer__bottom">
      <p class="footer__copy">© 2026 tiny.fits Ltd. All rights reserved.</p>
      <div class="footer__legal">
        <a href="#">Privacy policy</a>
        <a href="#">Terms of use</a>
        <a href="#">Cookie settings</a>
      </div>
    </div>
  `;
  return footer;
}
