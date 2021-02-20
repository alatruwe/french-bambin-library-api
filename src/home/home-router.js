const express = require("express");
const HomeService = require("./home-service");
const { requireAuth } = require("../middleware/basic-auth");

const homeRouter = express.Router();

homeRouter
  .route("/")
  //.all(requireAuth)
  .get((req, res, next) => {
    HomeService.getItems(req.app.get("db"))
      .then((items) => {
        res.json(items);
      })
      .catch(next);
  });

module.exports = homeRouter;
