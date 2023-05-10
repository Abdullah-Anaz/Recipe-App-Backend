//Importing necessary modules for the application
const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 4000;
const mongoose = require("mongoose");
const multer = require("multer");
const Recipe = require("./API/models/recipe");

//Establishing a connection to the MongoDB database.
mongoose.connect(process.env.MONGODB_URL);

// Configuring Multer for handling file uploads.
// specifies where to save the uploaded files and how to name them.
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${getExt(file.mimetype)}`);
  },
});

// returns the file extension based on the MIME type.
const getExt = (mimeType) => {
  switch (mimeType) {
    case "image/png":
      return ".png";
    case "image/jpeg":
      return ".jpeg";
  }
};

// handle file uploads.
let upload = multer({ storage: storage });

//handle CORS (Cross-Origin Resource Sharing) requests
const cors = require("cors");
const corsOptions = {
  origin: "my-recipe-application.netlify.app",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

//parse incoming requests with JSON or URL-encoded payloads
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//static files (images) from the uploads directory
app.use("/uploads", express.static("uploads"));

// GET request to retrieve all recipes from the database
app.get("/retrieve/:category", (req, res) => {
  Recipe.find({ category: req.params.category })
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

// GET request to retrieve all recipes from the database
app.get("/recipe/:id", (req, res) => {
  Recipe.findOne({ _id: req.params.id })
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

// POST request to add a new recipe to the database
app.post("/add", upload.single("image"), (req, res) => {
  const recipe = req.body;

  if (req.file) {
    fileUrl = req.file.path.replace(/\\/g, "/");
  } else {
    //else use the previous image
    fileUrl = "uploads/default.jpg";
  }

  // const fileUrl = req.file.path.replace(/\\/g, "/");

  let dbRecipe = {
    recipeName: recipe.name,
    category: recipe.category,
    ingredients: recipe.ingredients,
    description: recipe.description,
    image: fileUrl,
  };

  // Insert the new recipe into the database
  Recipe.create(dbRecipe)
    .then(() => {
      res.status(200).send("added");
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

// Set up a DELETE endpoint to remove a recipe from the database
app.delete("/delete/:id", (req, res) => {
  const id = req.params.id;

  // Remove the recipe with the provided ID from the database
  Recipe.deleteOne({ _id: id })
    .then(() => {
      res.status(200).send("deleted");
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

// Set up a POST endpoint to update an existing recipe in the database
app.post("/update", upload.single("image"), (req, res) => {
  const recipe = req.body;
  console.log(recipe);
  let fileUrl;
  // If a new image file was uploaded, use its URL for the updated recipe
  if (req.file) {
    fileUrl = req.file.path.replace(/\\/g, "/");
  } else {
    //else use the previous image
    fileUrl = recipe.image;
  }

  //upadate the recipe with the provided ID from the database
  Recipe.updateOne(
    { _id: recipe.id },
    {
      $set: {
        recipeName: recipe.name,
        category: recipe.category,
        ingredients: recipe.ingredients,
        description: recipe.description,
        image: fileUrl,
      },
    }
  )
    .then(() => {
      res.status(200).send("updated");
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.get("/", (req, res) => {
  res.send("Hello");
});

app.listen(port, () => {
  console.log("Example app listening on port");
});
