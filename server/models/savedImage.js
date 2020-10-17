const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema({
    name: String,
    imageURL: String,
});

module.exports = mongoose.model("image", ImageSchema);