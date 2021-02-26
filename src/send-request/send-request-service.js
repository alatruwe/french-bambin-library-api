const nodemailer = require("nodemailer");

const SendRequestService = {
  insertRequest(db, newRequest) {
    return db
      .insert(newRequest)
      .into("requests")
      .returning("*")
      .then(([request]) => request);
  },

  getSenderEmail(db, sender_id) {
    return db
      .from("users")
      .select("first_name", "email")
      .where("id", sender_id)
      .first();
  },

  // with item_id, get from items => user_id
  getReceiverId(db, item_id) {
    return db.from("items").select("user_id").where("id", item_id).first();
  },
  // with user_id, get from users => email/first_name
  getReceiverEmail(db, user_id) {
    return db.from("users").select("email").where("id", user_id).first();
  },

  // send email via Mailtrap for testing and debugging
  sendEmail(email) {
    const transporter = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "72f2d0d5718ee1",
        pass: "0e2182e1ef430b",
      },
    });

    const mailOptions = {
      from: "french.bambin.library@gmail.com",
      to: email.receiverEmail,
      subject: email.subject,
      text: "That was easy!",
      html:
        "<b>Hey there! </b><br>" +
        email.userMessage +
        "<br /><br>To get in touch with " +
        email.first_name +
        ", reply to: " +
        email.senderEmail +
        "<br />",
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  },
};

module.exports = SendRequestService;
