import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import Category from "./models/Category.js";
import Product from "./models/Product.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "cart-secret", resave: false, saveUninitialized: true }));

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cart_demo");

function ensureCart(req, res, next) {
  if (!req.session.cart) req.session.cart = [];
  next();
}

// Admin routes
app.get("/", (req, res) => res.redirect("/shop"));
app.get("/admin", async (req, res) => {
  const cats = await Category.find();
  const prods = await Product.find().populate("category subcategory");
  res.render("admin/dashboard", { cats, prods });
});

app.post("/admin/category", async (req, res) => {
  const { name, parent } = req.body;
  await Category.create({ name, parent: parent || null });
  res.redirect("/admin");
});

app.post("/admin/product", async (req, res) => {
  const { name, price, category, subcategory } = req.body;
  await Product.create({ name, price: Number(price), category, subcategory });
  res.redirect("/admin");
});

// Shop (user) routes
app.get("/shop", ensureCart, async (req, res) => {
  const parents = await Category.find({ parent: null });
  const subs = await Category.find({ parent: { $ne: null } });
  const prods = await Product.find().populate("category subcategory");
  res.render("shop/index", { parents, subs, prods, cart: req.session.cart });
});

app.post("/cart/add/:id", ensureCart, async (req, res) => {
  const prod = await Product.findById(req.params.id);
  const item = req.session.cart.find(i => i.id === prod.id);
  if (item) item.qty += 1;
  else req.session.cart.push({ id: prod.id, name: prod.name, price: prod.price, qty: 1 });
  res.redirect("/shop");
});

app.get("/cart", ensureCart, (req, res) => {
  const total = req.session.cart.reduce((s, i) => s + i.price * i.qty, 0);
  res.render("shop/cart", { cart: req.session.cart, total });
});

app.post("/cart/clear", ensureCart, (req, res) => {
  req.session.cart = [];
  res.redirect("/cart");
});

const PORT = process.env.PORT || 3007;
app.listen(PORT, () => console.log(`Q7 running at http://localhost:${PORT}`));
