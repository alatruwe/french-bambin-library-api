const express = require("express");
const AddItemService = require("./add-item-service");
const { requireAuth } = require("../middleware/jwt-auth");

const additemRouter = express.Router();
const jsonBodyParser = express.json();

additemRouter.route("/").post(requireAuth, jsonBodyParser, (req, res, next) => {
  // get info from request body
  const { title, description } = req.body;
  const newItem = { title, description };

  // check if anything is missing
  for (const [key, value] of Object.entries(newItem))
    if (value == null)
      return res.status(400).json({
        error: `Missing '${key}' in request body`,
      });

  //Use the name of the input field (i.e. "image") to retrieve the uploaded file
  let image = req.files.image;

  //Use the mv() method to place the file in upload directory (i.e. "uploads")
  let uploadPath = "./uploads/" + image.name;
  image.mv(uploadPath);

  newItem.image = image.name;
  // get user_id fron jwt auth token
  newItem.user_id = req.user.id;
  // set item availibily to true by default
  newItem.available = true;

  AddItemService.insertItem(req.app.get("db"), newItem)
    .then((item) => {
      res.status(201).send(item);
    })
    .catch(next);
});

module.exports = additemRouter;
