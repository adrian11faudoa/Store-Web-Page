const API = "http://localhost:3000";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

async function loadProduct() {
  const res = await fetch(`${API}/products/${id}`);
  const p = await res.json();

  document.getElementById("product").innerHTML = `
    <h1>${p.name}</h1>
    <img src="${p.image}">
    <p>$${p.price}</p>
    <button onclick="addToCart(${p.id})">Add to Cart</button>
  `;
}

function addToCart(id) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.push(id);
  localStorage.setItem("cart", JSON.stringify(cart));
}

loadProduct();