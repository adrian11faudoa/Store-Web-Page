// =========================================
// tiny.fits — Cart Store
// Simple pub/sub state management
// =========================================

const subscribers = [];

const cart = {
  items: [], // { productId, name, price, emoji, qty }

  subscribe(fn) {
    subscribers.push(fn);
    return () => {
      const i = subscribers.indexOf(fn);
      if (i > -1) subscribers.splice(i, 1);
    };
  },

  _notify() {
    subscribers.forEach(fn => fn(this.getState()));
  },

  getState() {
    return {
      items: [...this.items],
      count: this.items.reduce((sum, i) => sum + i.qty, 0),
      total: this.items.reduce((sum, i) => sum + i.price * i.qty, 0),
    };
  },

  add(product) {
    const existing = this.items.find(i => i.productId === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      this.items.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        emoji: product.emoji,
        qty: 1,
      });
    }
    this._notify();
  },

  remove(productId) {
    this.items = this.items.filter(i => i.productId !== productId);
    this._notify();
  },

  clear() {
    this.items = [];
    this._notify();
  },
};

export default cart;
