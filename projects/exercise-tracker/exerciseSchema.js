const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const exerciseSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    min: [1, "Please set a number 1 or higher"],
    required: true
  },
  date: {
    type: Date,
    default: Date.now(),
    max: [Date.now(), 'You cannot set a date later than today']
  }
});

module.exports = mongoose.model("Exercise", exerciseSchema);
