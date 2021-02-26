const express = require("express");
const ItemHistoryService = require("./item-history-service");
const { requireAuth } = require("../middleware/jwt-auth");

const itemhistoryRouter = express.Router();

itemhistoryRouter
  .route("/")
  .all(requireAuth)
  .get((req, res, next) => {
    const user_id = req.user.id;
    ItemHistoryService.getItemHistory(req.app.get("db"), user_id)
      .then((items) => {
        res.json(items);
      })
      .catch(next);
  });

itemhistoryRouter
  .route("/item/:item_id")
  .all(requireAuth)
  .delete((req, res, next) => {
    const { item_id } = req.params;
    ItemHistoryService.getItemById(req.app.get("db"), item_id).then((item) => {
      if (!item)
        return res.status(404).json({
          error: { message: `Item doesn't exist` },
        });

      return ItemHistoryService.deleteItem(req.app.get("db"), item_id)
        .then(() => {
          res.status(204).end();
        })
        .catch(next);
    });
  });

module.exports = itemhistoryRouter;
