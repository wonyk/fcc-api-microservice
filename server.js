"use strict";

let express = require("express");
let cors = require("cors");
let multer = require("multer");
let upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: "10MB",
    fields: 0,
    files: 1
  }
});

let app = express();

app.use(cors());
app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.get("/hello", function(req, res) {
  res.json({ greetings: "Hello, API" });
});

app.post("/api/fileanalyse", upload.single("upfile"), (req, res) => {
  // req.file is the `file`
  // req.body will hold the text fields, if there were any
  if (!req.file) {
    return res.json({ error: "No file uploaded" });
  }
  const { originalname, mimetype, size } = req.file;
  res.json({ name: originalname, type: mimetype, size });
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Node.js listening ...");
});
