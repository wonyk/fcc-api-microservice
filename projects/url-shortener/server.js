"use strict";

var express = require("express");
var mongoose = require("mongoose");

var cors = require("cors");
var dns = require("dns");

var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;

/** this project needs a db !! **/

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true }, err => {
  if (err) console.log(err);
});

app.use(cors());
let URL = require("./urlSchema");
/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use("/public", express.static(process.cwd() + "/public"));
app.use("/api", express.urlencoded({ extended: true }));

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// your first API endpoint...
app.get("/api/hello", function(req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl/new", async (req, res) => {
  const { url } = req.body;
  //   Self made regex
  const regex = /^(http)(s?)(:\/\/)(.+\.)?(.+\.)([a-zA-Z0-9]+)(\/.?)?$/;
  if (!regex.test(url)) {
    return res.json({ error: "invalid URL" });
  } else {
    let urlNoTrailingSlash = url.replace(/\/$/, '') 
    let split = urlNoTrailingSlash.split("://");
    //     Obtain the second half of the URL to exclude the protocol
    try {
      const address = await dns.promises.lookup(split[1], { family: 4 });
    } catch (err) {
      console.log(err);
      return res.json({ error: "invalid URLs" });
    }
    try {
      const count = await URL.countDocuments({});
      const resp = await URL.findOne({ originalUrl: urlNoTrailingSlash });
      if (resp) {
        return res.json({
          original_url: resp.originalUrl,
          short_url: resp.shortUrl
        });
      } else {
        const newShort = new URL({ originalUrl: urlNoTrailingSlash, shortUrl: count + 1 });
        const data = await newShort.save();
        return res.json({
          original_url: data.originalUrl,
          short_url: data.shortUrl
        });
      }
    } catch (err) {
      console.log(err);
      return res.json({ error: "Database error" });
    }
  }
});

app.get("/api/shorturl/:short", async (req, res) => {
  const { short } = req.params;
  if (!/^\d+$/.test(short)) {
    return res.json({ error: "invalid URL" });
  }
  const data = await URL.findOne({ shortUrl: short })
    .select("originalUrl")
    .lean();
  if (data) return res.redirect(data.originalUrl);
  else return res.json({ error: "invalid URL" });
});

app.listen(port, function() {
  console.log("Node.js listening ...");
});
