import express from "express";
import session from "express-session";
import FileStoreFactory from "session-file-store";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FileStore = FileStoreFactory(session);
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));

app.use(session({
  store: new FileStore({ path: path.join(__dirname, "sessions") }),
  secret: "supersecret",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 15 } // 15 min
}));

const USERS = [{ username: "tirth", password: "tirth123" }];

const requireAuth = (req, res, next) => {
  if (req.session.user) return next();
  res.redirect("/login");
};

app.get("/", (req, res) => res.redirect("/dashboard"));
app.get("/login", (req, res) => res.render("login", { error: null }));

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const found = USERS.find(u => u.username === username && u.password === password);
  if (!found) return res.status(401).render("login", { error: "Invalid credentials" });
  req.session.user = { username };
  res.redirect("/dashboard");
});

app.get("/dashboard", requireAuth, (req, res) => {
  res.render("dashboard", { user: req.session.user });
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Q2 running at http://localhost:${PORT}`));
