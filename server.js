require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const JWT_SECRET = process.env.JWT_SECRET; // Load JWT secret from .env
const PORT = process.env.PORT || 3000; // Load port from .env or default to 3000
const { adminUsername, adminPassword } = process.env; // Load admin credentials from .env

const app = express();

// Use EJS for the admin panel
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Add this line to parse cookies

// File upload settings
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/img");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Middleware to authenticate JWT and redirect to login if unauthorized
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.cookies.token;

  if (authHeader) {
    const token = authHeader.split(" ")[1] || authHeader; // Extract token from "Bearer <token>" or cookie

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.redirect("/login"); // Redirect to login if token is invalid
      }
      req.user = user; // Attach user info to the request object
      next(); // Proceed to the next middleware or route handler
    });
  } else {
    res.redirect("/login"); // Redirect to login if no token is provided
  }
};

app.get("/login", (req, res) => {
  res.render("login", { error: null }); // Pass 'error' as null initially
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === adminUsername && password === adminPassword) {
    // Generate a JWT token
    const token = jwt.sign({ username }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token", token, { httpOnly: true }); // Store token in a cookie
    res.redirect("/admin"); // Redirect to the admin page
  } else {
    res.render("login", { error: "Invalid credentials" }); // Pass error message to the template
  }
});

// Admin Panel
app.get("/admin", authenticateJWT, (req, res) => {
  const galleryFile = path.join(__dirname, "gallery.json");
  let gallery = [];

  // If gallery.json exists and has content, parse it
  if (fs.existsSync(galleryFile)) {
    const raw = fs.readFileSync(galleryFile, "utf-8");
    if (raw) {
      gallery = JSON.parse(raw);
    }
  }

  res.render("admin", { gallery }); // Pass gallery to EJS template
});

// home route
app.get("/", (req, res) => {
  const gallery = JSON.parse(fs.readFileSync("./gallery.json"));
  res.render("index", { gallery });
});

// Booking Route
app.get("/booking", (req, res) => {
  res.render("booking");
});
// PA Route
app.get("/pa", (req, res) => {
  res.render("PA");
});
// DJ Route
app.get("/dj", (req, res) => {
  res.render("DJ");
});
// MCEE Route
app.get("/mcee", (req, res) => {
  res.render("MCEE");
});

// Upload Route
app.post("/upload", upload.single("galleryImage"), (req, res) => {
  const { title, category } = req.body;
  const filename = req.file.filename;

  const galleryPath = path.join(__dirname, "gallery.json");
  const gallery = JSON.parse(fs.readFileSync(galleryPath));

  gallery.push({ filename, title, category });

  fs.writeFileSync(galleryPath, JSON.stringify(gallery, null, 2));
  res.redirect("/admin");
});

// Delete Route
app.post("/delete", (req, res) => {
  const filePath = path.join(__dirname, "public/img", req.body.filename);
  fs.unlinkSync(filePath);
  res.redirect("/admin");
});
// Update Route
app.post("/replace", upload.single("newImage"), (req, res) => {
  const oldFile = path.join(__dirname, "public/img", req.body.oldFilename);
  const newFile = req.file;

  // Delete the old image
  if (fs.existsSync(oldFile)) {
    fs.unlinkSync(oldFile);
  }

  // Rename the new file to match the old filename
  const newPath = path.join(__dirname, "public/img", req.body.oldFilename);
  fs.renameSync(newFile.path, newPath);

  res.redirect("/admin");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
