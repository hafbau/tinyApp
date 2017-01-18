var express = require("express");
var app = express();
cookieParser = require('cookie-parser');
var PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x100000).toString(16);
}

function formatURL (longU) {
  if (!longU.includes("http")) { return "http://" + longU }
  return longU;
}

app.get("/", (req, res) => {
  res.end("<html><body>Hello urls <a href='/urls'>urls list</a></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello\n <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.id,
    fullURL: urlDatabase[req.params.id] };

  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let shortU = generateRandomString();
  let longU = req.body.longURL;

  longU = formatURL(longU);

  urlDatabase[shortU] = longU;
  res.redirect(`/urls/${shortU}`);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  if (longURL) {
  res.redirect(longURL);
  } else  {
    res.render('error', {err_mesg: 'Error 404: We cant find that!'});
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let shortU = req.params.shortURL;
  delete urlDatabase[shortU];
  res.redirect("/urls");
});


app.post("/urls/:shortURL", (req, res) => {
  let shortU = req.params.shortURL;

  urlDatabase[shortU] = formatURL(req.body.longURL);
  res.redirect(`/urls/${shortU}`);
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});