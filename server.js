const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Use EJS for the admin panel
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

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

// Admin Panel
app.get("/admin", (req, res) => {
  const galleryFile = path.join(__dirname, "gallery.json");
  let gallery = [];

  // If gallery.json exists and has content, parse it
  if (fs.existsSync(galleryFile)) {
    const raw = fs.readFileSync(galleryFile, "utf-8");
    if (raw) {
      gallery = JSON.parse(raw);
    }
  }

  res.render("admin", { gallery }); // ✅ Pass gallery to EJS template
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

// home route
app.get("/", (req, res) => {
  const gallery = JSON.parse(fs.readFileSync("./gallery.json"));
  res.render("index", { gallery });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/admin`);
});
