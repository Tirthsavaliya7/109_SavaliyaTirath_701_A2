import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import Employee from "./models/Employee.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  secret: process.env.SESSION_SECRET || "erp-secret",
  resave: false,
  saveUninitialized: false
}));

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/erp_demo")
  .then(() => console.log("Mongo connected"))
  .catch(err => console.error("Mongo error", err));

const admin = { username: "admin", password: "admin123" };

const requireAuth = (req, res, next) => req.session.user ? next() : res.redirect("/login");

function calcSalary(baseSalary) {
  const hra = baseSalary * 0.4;
  const da  = baseSalary * 0.1;
  const gross = baseSalary + hra + da;
  return { hra, da, gross };
}

async function sendNewEmployeeEmail(emp, plainPassword) {
  if (!process.env.SMTP_HOST) return;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  const info = await transporter.sendMail({
    from: process.env.FROM_EMAIL || "no-reply@example.com",
    to: emp.email,
    subject: "Welcome to ERP - Your Credentials",
    html: `<p>Dear ${emp.name},</p>
           <p>Your Employee ID: <b>${emp.empid}</b><br/>
           Temporary Password: <b>${plainPassword}</b></p>
           <p>Please login and change your password.</p>`
  });
  console.log("Email sent:", info.messageId);
}

app.get("/", (req, res) => res.redirect("/employees"));
app.get("/login", (req, res) => res.render("login", { error: null }));
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === admin.username && password === admin.password) {
    req.session.user = { username };
    return res.redirect("/employees");
  }
  res.status(401).render("login", { error: "Invalid credentials" });
});
app.post("/logout", (req, res) => req.session.destroy(() => res.redirect("/login")));

app.get("/employees", requireAuth, async (req, res) => {
  const employees = await Employee.find().sort({ createdAt: -1 });
  res.render("employees/list", { employees, user: req.session.user });
});

app.get("/employees/new", requireAuth, (req, res) => {
  res.render("employees/new", { error: null });
});

app.post("/employees", requireAuth, async (req, res) => {
  try {
    const { name, email, department, baseSalary } = req.body;
    const empid = "EMP" + Date.now().toString().slice(-6);
    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const { hra, da, gross } = calcSalary(Number(baseSalary));
    const emp = await Employee.create({ empid, name, email, department, baseSalary, hra, da, gross, passwordHash });
    await sendNewEmployeeEmail(emp, tempPassword);
    res.redirect("/employees");
  } catch (err) {
    console.error(err);
    res.status(400).render("employees/new", { error: "Error creating employee. Maybe duplicate email?" });
  }
});

app.get("/employees/:id/edit", requireAuth, async (req, res) => {
  const emp = await Employee.findById(req.params.id);
  if (!emp) return res.redirect("/employees");
  res.render("employees/edit", { emp, error: null });
});

app.post("/employees/:id", requireAuth, async (req, res) => {
  try {
    const { name, email, department, baseSalary } = req.body;
    const calc = calcSalary(Number(baseSalary));
    await Employee.findByIdAndUpdate(req.params.id, { name, email, department, baseSalary, ...calc });
    res.redirect("/employees");
  } catch (e) {
    const emp = await Employee.findById(req.params.id);
    res.status(400).render("employees/edit", { emp, error: "Update failed" });
  }
});

app.post("/employees/:id/delete", requireAuth, async (req, res) => {
  await Employee.findByIdAndDelete(req.params.id);
  res.redirect("/employees");
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`Q4 running at http://localhost:${PORT}`));
