const API = "http://localhost:3000";

async function loadProducts() {
  const res = await fetch(`${API}/products`);
  const data = await res.json();
  displayProducts(data);
}

function displayProducts(products) {
  const container = document.getElementById("products");
  container.innerHTML = "";

  products.forEach(p => {
    container.innerHTML += `
      <div class="card" onclick="goToProduct(${p.id})">
        <img src="${p.image}">
        <h3>${p.name}</h3>
        <p>$${p.price}</p>
        <button onclick="addToCart(event, ${p.id})">Add</button>
      </div>
    `;
  });
}

function goToProduct(id) {
  window.location = `product.html?id=${id}`;
}

async function filter(category) {
  if (category === "all") return loadProducts();

  const res = await fetch(`${API}/filter?category=${category}`);
  const data = await res.json();
  displayProducts(data);
}

function addToCart(e, id) {
  e.stopPropagation();
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.push(id);
  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Added to cart");
}

loadProducts();