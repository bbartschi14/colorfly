const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema({
  creator_name: String,
  creator_id: String,
  content: String,
  animation: [Array],
  animMode: String,
  imageTitle: String,
  likedBy: Array,
});

// compile model from schema
module.exports = mongoose.model("image", ImageSchema);