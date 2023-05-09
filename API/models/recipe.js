const Mongoose = require("mongoose");

const dbSchema = Mongoose.Schema({
  category: String,
  recipeName: String,
  ingredients: Array,
  description: String,
  image: String,
});

module.exports = Mongoose.model("recipe", dbSchema);
