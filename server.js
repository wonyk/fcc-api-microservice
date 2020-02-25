const express = require("express");
const moment = require("moment");
const app = express();

const cors = require("cors");

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});

mongoose.set("debug", true);
const Exercise = require("./exerciseSchema");
const User = require("./userSchema");

app.use(cors());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// Create a new user
app.post("/api/exercise/new-user", async (req, res, next) => {
  const { username } = req.body;
  try {
    const userExist = await User.findOne({ username });
    if (userExist) {
      return res.json({
        error: "Username already taken, please try another name"
      });
    }
    const userdata = await User.create({ username });
    res.json({ username: userdata.username, userId: userdata._id });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// Get all users
app.get("/api/exercise/users", async (req, res, next) => {
  try {
    const users = await User.find()
      .select("-__v")
      .lean();
    res.json({ users });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// // Add exercise
app.post("/api/exercise/add", async (req, res, next) => {
  const { userId, description, duration, date } = req.body;
  if (!userId || !description || !duration) {
    return res
      .status(400)
      .json({ error: "Please provide all the necessary fields " });
  }
  try {
    const details = await Exercise.create({
      userId,
      description,
      duration,
      date
    });
    const exerciseDetails = await Exercise.findById(details._id)
      .populate("userId")
      .lean();
    const resp = {
      username: exerciseDetails.userId.username,
      userId,
      description,
      duration,
      date: moment(exerciseDetails.date).format("Do MMMM YYYY")
    };
    res.json(resp);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// Get exercise log
app.get("/api/exercise/log", async (req, res, next) => {
  const { userId, from, to, limit } = req.query;
  //   Error handling
  if (!userId) {
    console.error("No userId provided");
    return res.status(400).json({ error: "Please provide a userId" });
  }
  let query = Exercise.find({ userId }).select("-_id -__v -userId").sort('-date');
  if (from) {
    if (!moment(from, "YYYY-MM-DD", true).isValid()) {
      return res
        .status(400)
        .json({
          error: "Please provide the 'from' date in format YYYY-MM-DD "
        });
    }
    query.where("date").gte(from);
  }
  if (to) {
    if (!moment(to, "YYYY-MM-DD", true).isValid()) {
      return res
        .status(400)
        .json({ error: "Please provide the 'to' date in format YYYY-MM-DD " });
    }
    query.where("date").lte(to);
  }
  if (limit) {
    if (!Number(limit)) {
      return res
        .status(400)
        .json({ error: "Please provide a valid limit number " });
    }
    query.limit(Number(limit));
  }
  try {
    const user = await User.findById(userId);
    const data = await query.exec();
    const resp = {
      _id: userId,
      username: user.username,
      count: data.length,
      log: data
    };
    res.json(resp);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// Not found middleware
app.use((req, res, next) => {
  return next({ status: 404, message: "not found" });
});

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage;

  if (err.errors) {
    // mongoose validation error
    errCode = 400; // bad request
    const keys = Object.keys(err.errors);
    // report the first validation error
    errMessage = err.errors[keys[0]].message;
  } else {
    // generic or custom error
    errCode = err.status || 500;
    errMessage = err.message || "Internal Server Error";
  }
  res
    .status(errCode)
    .type("txt")
    .send(errMessage);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
