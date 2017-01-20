const express = require("express");
const app = express();
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const PORT = process.env.PORT || 3000;
const bodyParser = require("body-parser");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({signed: false}));

module.exports = {
  app: app,
  bcrypt: bcrypt,
  PORT: PORT
}