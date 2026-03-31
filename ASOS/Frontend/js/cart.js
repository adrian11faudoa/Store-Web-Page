const API = "http://localhost:3000";

async function loadCart() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const res = await fetch(`${API}/products`);
  const products = await res.json();

  const container = document.getElementById("cart");
  container.innerHTML = "";

  cart.forEach(id => {
    const p = products.find(x => x.id == id);
    if (p) {
      container.innerHTML += `<p>${p.name} - $${p.price}</p>`;
    }
  });
}

loadCart();