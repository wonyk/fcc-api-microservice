var mongoose = require("mongoose");

const Schema = mongoose.Schema;
const urlSchema = new Schema({
  originalUrl: {
    type: String,
    required: true,
    unique: true
  },
  shortUrl: {
    type: Number,
    required: true,
    unique: true
  }
});

module.exports = mongoose.model("urlList", urlSchema);
