const express = require("express");
const SendRequestService = require("./send-request-service");
const { requireAuth } = require("../middleware/jwt-auth");

const sendrequestRouter = express.Router();
const jsonBodyParser = express.json();

sendrequestRouter
  .route("/")
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    // get info from request body
    const { subject, message, item_id } = req.body;
    const newRequest = { subject, message, item_id };

    // check if anything is missing
    for (const [key, value] of Object.entries(newRequest))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`,
        });

    // get user_id fron jwt auth token
    newRequest.sender_id = req.user.id;
    // set item availibily to true by default
    newRequest.date_sent = new Date();

    SendRequestService.insertRequest(req.app.get("db"), newRequest)
      .then((request) => {
        res.status(201).send(request);
      })
      .catch(next);
  });

module.exports = sendrequestRouter;
