require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const { CLIENT_ORIGIN } = require("./config");
const homeRouter = require("./home/home-router");
const loginRouter = require("./login/login-router");
const signupRouter = require("./signup/signup-router");
const additemRouter = require("./add-item/add-item-router");

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.use("/api/home", homeRouter);
app.use("/api/login", loginRouter);
app.use("/api/signup", signupRouter);
app.use("/api/add-item", additemRouter);

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
