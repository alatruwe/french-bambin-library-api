const express = require("express");
const SendRequestService = require("./send-request-service");
const { requireAuth } = require("../middleware/jwt-auth");

const sendrequestRouter = express.Router();
const jsonBodyParser = express.json();

sendrequestRouter
  .route("/")
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    // ----- updating database -----
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
    // set date
    newRequest.date_sent = new Date();

    // update database
    SendRequestService.insertRequest(req.app.get("db"), newRequest)
      .then((request) => {
        res.status(201).send(request);
      })
      .catch(next);

    // ----- sending email -----
    // get sender first_name and email
    let senderInfo = SendRequestService.getSenderEmail(
      req.app.get("db"),
      req.user.id
    ).then((res) => {
      return res;
    });

    // get receiver email
    let receiverInfo = SendRequestService.getReceiverId(
      req.app.get("db"),
      item_id
    ).then((res) =>
      SendRequestService.getReceiverEmail(req.app.get("db"), res.user_id).then(
        (res) => {
          return res;
        }
      )
    );

    Promise.all([senderInfo, receiverInfo])
      .then((res) => {
        //build email object
        let newEmail = {
          receiverEmail: res[1].email,
          first_name: res[0].first_name,
          senderEmail: res[0].email,
          subject: req.body.subject,
          userMessage: req.body.message,
        };

        // send email
        SendRequestService.sendEmail(newEmail);
      })
      .then(() => {
        res.status(204).end();
      });
  });

module.exports = sendrequestRouter;
