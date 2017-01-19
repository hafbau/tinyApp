var express = require("express");
var cookieSession = require("cookie-session");
var app = express();

const bcrypt = require('bcrypt');
var PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({signed: false}));

var urlDatabase = {
  // "b2xVn2": "http://www.lighthouselabs.ca",
  // "9sm5xK": "http://www.google.com"
};

var users = {

}

function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x100000).toString(16);
}

function formatURL (longU) {
  if (!longU.includes("http")) { return "http://" + longU }
  return longU;
}

function getUsersProp(prop, usrs) {
  let props = [];
  for(let usr in usrs) {
    props.push(usrs[usr][prop]);
  }
  return props;
}

function validateUser(action, reqObj) {
  let emails = getUsersProp('email', users);
  let email = reqObj.body.email;
  
  if(email) {
    let truth = emails.includes(email);
    if(!truth) return;
    let pswd = findUserBy("email", email, users).password;
    return truth && bcrypt.compareSync(reqObj.body.password, pswd);
  }
}

function findUserBy(propType, prop, users) {
  for (let user in users) {
    if (prop === users[user][propType]) {
      return users[user];
    }
  }
}

function validateUserRegistration(reqObj, resObj) {
  let emails = getUsersProp('email', users);
  let email = reqObj.body.email;
  let truth;
  truth = truth || (email && !emails.includes(email));
  return truth && !!reqObj.body.password;
}

function filterUrlsByEmail(email, urls) {
  let filtered = {};
  for(let item in urls) {
    urls[item].email === email && (filtered[item] = urls[item]);
  }
  return filtered;
}

// for debugging - remember to delete!!!
app.get("/links", (req, res) => { res.send(urlDatabase) });

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
  let user = users[req.session.user_id];
  let email = user ? user.email : undefined;
  let templateVars = {
    useremail: email,
    formType: undefined,
    urls: filterUrlsByEmail(email, urlDatabase)
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let user = users[req.session.user_id];
  let email = user ? user.email : undefined;
  let templateVars = { useremail: email, formType: undefined };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let user = users[req.session.user_id];
  let email = user ? user.email : undefined;
  let templateVars = {
    useremail: email,
    formType: undefined,
    shortURL: req.params.id,
    fullURL: urlDatabase[req.params.id].long
  };

  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let shortU = generateRandomString();
  let longU = req.body.longURL;
  let useremail = req.body.useremail;
  longU = formatURL(longU);

  urlDatabase[shortU] = { long: longU, email: useremail};
  res.redirect(`/urls/${shortU}`);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  if (longURL) {
    res.redirect(longURL.long);
  } else  {
    res.render('error', {err_mesg: 'Error 404: We cant find that!'});
  }
});

app.get("/register", (req, res) => {
  let user = users[req.session.user_id];
  let email = user ? user.email : undefined;
  let templateVars = { useremail: email, formType: 'register' };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  let user = users[req.session.user_id];
  let email = user ? user.email : undefined;
  let templateVars = { useremail: email, formType: 'login' };
  res.render("register", templateVars);
})

app.post("/register", (req, res) => {
  let randomID;
  
  if(validateUserRegistration(req, res)) {
    do {
      randomID = generateRandomString();
    } while(users[randomID])

    users[randomID] = {};
    users[randomID].id = randomID;
    users[randomID].email = req.body.email;
    users[randomID].password = bcrypt.hashSync(req.body.password, 10);
    req.session.user_id = randomID;
    res.redirect("/");
  } else { res.render('error', {err_mesg: 'Error 400: Those aint valid!'}); }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let shortU = req.params.shortURL;
  delete urlDatabase[shortU];
  res.redirect("/urls");
});


app.post("/urls/:shortURL", (req, res) => {
  let shortU = req.params.shortURL;

  urlDatabase[shortU].long = formatURL(req.body.longURL);
  res.redirect(`/urls/${shortU}`);
});

app.post("/login", (req, res) => {
  if(validateUser('login', req)) {
    req.session.user_id = findUserBy("email", req.body.email, users).id;
    res.redirect("/");
  } else {
    res.render('error', {err_mesg: 'Error 403: Bad credentials :('})
  }
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});