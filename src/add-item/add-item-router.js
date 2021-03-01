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
