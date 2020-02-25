// server.js
// where your node app starts

// init project
var express = require("express");
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require("cors");
app.use(cors({ optionSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/api/timestamp/:date_string?", (req, res) => {
  let { date_string } = req.params;
  let unix, utc;
  if (!date_string) {
    let now = new Date();
    unix = now.getTime();
    utc = now.toUTCString();
  }
  //   If the date_string is not empty, the following will run:
  //   First a regex that match a whole string of numbers only
  else {
    const unixRegex = /^\d+$/;
    if (unixRegex.test(date_string)) {
      let parsedDate = new Date(Number(date_string) * 1000);
      unix = date_string;
      utc = parsedDate.toUTCString();
    } else {
      let parsedDate = new Date(date_string);
      if (parsedDate == "Invalid Date") {
        return res.json({ error: "Invalid Date" });
        //         return res.json({ unix: null, utc: "Invalid Date" })
      } else {
        unix = parsedDate.getTime();
        utc = parsedDate.toUTCString();
      }
    }
  }
  res.json({ unix, utc });
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
