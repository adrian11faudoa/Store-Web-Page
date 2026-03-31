const express = require("express");
const cors = require("cors");
const products = require("./products.json");

const app = express();
app.use(cors());
app.use(express.json());

// GET ALL PRODUCTS
app.get("/products", (req, res) => {
  res.json(products);
});

// GET SINGLE PRODUCT
app.get("/products/:id", (req, res) => {
  const product = products.find(p => p.id == req.params.id);
  res.json(product);
});

// FILTER
app.get("/filter", (req, res) => {
  const { category } = req.query;
  const filtered = products.filter(p => p.category === category);
  res.json(filtered);
});

app.listen(3000, () => console.log("Server running on port 3000"));
