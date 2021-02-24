const xss = require("xss");

const SendRequestService = {
  insertRequest(db, newRequest) {
    return db
      .insert(newRequest)
      .into("requests")
      .returning("*")
      .then(([request]) => request);
  },
};

module.exports = SendRequestService;
