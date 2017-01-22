const express = require("express");
const app = express();
const methodOverride = require("method-override");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const PORT = process.env.PORT || 3000;
const bodyParser = require("body-parser");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({signed: false}));
app.use(methodOverride("_method"));

module.exports = {
  app: app,
  bcrypt: bcrypt,
  PORT: PORT
}