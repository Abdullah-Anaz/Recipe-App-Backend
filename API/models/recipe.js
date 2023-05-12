const Mongoose = require("mongoose");

const dbSchema = Mongoose.Schema({
  category: String,
  recipeName: String,
  ingredients: Array,
  description: String,
  image: {
    name: String,
    data: Buffer,
    contentType: String,
  },
});

module.exports = Mongoose.model("recipeModel", dbSchema);
