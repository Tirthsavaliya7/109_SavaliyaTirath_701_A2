import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";
import Emp from "./models/Employee.js";
import cors from "cors";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/employee_site");

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || "verysecret");
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}




app.post("/api/register", async (req, res) => {
  const { name, email, password, department } = req.body;
  const empid = "EMP" + Date.now().toString().slice(-6);
  const passwordHash = await bcrypt.hash(password, 10);
  const emp = await Emp.create({ empid, name, email, department, passwordHash, leaves: [] });
  res.json({ empid: emp.empid });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const emp = await Emp.findOne({ email });
  if (!emp) return res.status(401).json({ error: "User not found" });
  const ok = await bcrypt.compare(password, emp.passwordHash);
  if (!ok) return res.status(401).json({ error: "Wrong password" });
  const token = jwt.sign({ id: emp._id, empid: emp.empid, email: emp.email }, process.env.JWT_SECRET || "verysecret", { expiresIn: "1h" });
  res.json({ token });
});

app.get("/api/profile", auth, async (req, res) => {
  const emp = await Emp.findById(req.user.id).select("-passwordHash");
  res.json(emp);
});

app.post("/api/leaves", auth, async (req, res) => {
  const { date, reason, granted } = req.body;
  const emp = await Emp.findById(req.user.id);
  emp.leaves.push({ date, reason, granted: !!granted });
  await emp.save();
  res.json({ ok: true });
});

app.get("/api/leaves", auth, async (req, res) => {
  const emp = await Emp.findById(req.user.id);
  res.json(emp.leaves);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`Q5 running at http://localhost:${PORT}`));
