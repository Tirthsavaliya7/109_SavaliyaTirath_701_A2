const express = require("express");
const path = require("path");
const multer = require("multer");
const { body, validationResult } = require("express-validator");
const fs = require("fs");

const app = express();
const PORT = 3000;


app.use(express.urlencoded({ extended: true }));


app.use("/uploads", express.static(path.join(__dirname, "uploads")));


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

app.get("/", (req, res) => {
  res.send(`
    <h1>User Registration</h1>
    <form method="POST" action="/register" enctype="multipart/form-data">
      Username: <input type="text" name="username" /><br/><br/>
      Email: <input type="text" name="email" /><br/><br/>
      Password: <input type="password" name="password" /><br/><br/>
      Confirm Password: <input type="password" name="confirmPassword" /><br/><br/>
      Gender: 
        <input type="radio" name="gender" value="Male" /> Male
        <input type="radio" name="gender" value="Female" /> Female<br/><br/>
      Hobbies: 
        <input type="checkbox" name="hobbies" value="Reading" /> Reading
        <input type="checkbox" name="hobbies" value="Traveling" /> Traveling
        <input type="checkbox" name="hobbies" value="Gaming" /> Gaming<br/><br/>
      Upload Profile Pic: <input type="file" name="profilePic" /><br/><br/>
      Upload Other Pics: <input type="file" name="otherPics" multiple /><br/><br/>
      <button type="submit">Register</button>
    </form>
  `);
});


app.post(
  "/register",
  upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "otherPics", maxCount: 5 },
  ]),
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("email").isEmail().withMessage("Enter valid email"),
    body("password").isLength({ min: 5 }).withMessage("Password must be at least 5 chars long"),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) throw new Error("Passwords do not match");
      return true;
    }),
    body("gender").notEmpty().withMessage("Select gender"),
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.send(`<h3>Errors:</h3><ul>${errors.array().map(e => `<li>${e.msg}</li>`).join("")}</ul>
        <a href="/">Go Back</a>`);
    }

    const { username, email, gender, hobbies } = req.body;
    const profilePic = req.files["profilePic"] ? req.files["profilePic"][0].filename : null;
    const otherPics = req.files["otherPics"] ? req.files["otherPics"].map(f => f.filename) : [];


    const userData = {
      username,
      email,
      gender,
      hobbies,
      profilePic,
      otherPics,
    };
    fs.writeFileSync("userdata.json", JSON.stringify(userData, null, 2));

    res.send(`
      <h1>Registration Successful</h1>
      <table border="1" cellpadding="8">
        <tr><td>Username</td><td>${username}</td></tr>
        <tr><td>Email</td><td>${email}</td></tr>
        <tr><td>Gender</td><td>${gender}</td></tr>
        <tr><td>Hobbies</td><td>${Array.isArray(hobbies) ? hobbies.join(", ") : hobbies || "-"}</td></tr>
        <tr><td>Profile Pic</td><td>${profilePic ? `<img src="/uploads/${profilePic}" width="120">` : "No file"}</td></tr>
        <tr><td>Other Pics</td><td>${otherPics.map(f => `<img src="/uploads/${f}" width="100">`).join(" ")}</td></tr>
      </table>
      <br/>
      <a href="/download">Download User Data</a><br>
      <a href="/">Back</a>
    `);
  }
);


app.get("/download", (req, res) => {
  const filePath = path.join(__dirname, "userdata.json");
  res.download(filePath, "userdata.json");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
