Object.assign(global,
  require("./module_requires"),
  require("./models"), require("./my_utils")
);

// Factor out commonalities
app.all("/*", (req, res, next) => {
  req.user = users[req.session.user_id];
  req.email = req.user && req.user.email;
  req.templateVars = {
    useremail: req.email,
    formType: undefined
  };
  next();
});

// Root Path
app.get("/", (req, res) => {
  req.user ? res.redirect("/urls") : res.redirect("/login");
});

// API - lists all urls in JSON
app.get("/api/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// SCRUD - Search
app.get("/urls", (req, res) => {
  req.templateVars.urls = filterUrlsByEmail(req.email, urlDatabase);
  if (!req.email) {
    renderError(401, res, req.templateVars);
  } else {
      res.render("urls_index", req.templateVars);
  }
});

// URLS => SCRUD - Create
app.get("/urls/new", (req, res) => {
  if (!req.email) {
    renderError(401, res, req.templateVars);
  } else {
      res.render("urls_new", req.templateVars);
  }
});

app.post("/urls", (req, res) => {
  let shortU = generateUniqueKey(urlDatabase);
  let longU = req.body.longURL;
  let useremail = req.body.useremail;
  longU = formatURL(longU);
  urlDatabase[shortU] = {
    long: longU,
    email: useremail
  };
  res.redirect(`/urls/${shortU}`);
});

// URLS => SCRUD - Read: shows individual urls
app.get("/urls/:shortURL", (req, res) => {
  let options = getRouteOptions(req, res);
  decideShow(options);
});

app.get("/u/:shortURL", (req, res) => { // public path for redirection to long url
  let longURL = urlDatabase[req.params.shortURL];
  if (longURL) {
    res.redirect(longURL.long);
  } else {
    renderError(404, res, req.templateVars);
  }
});

// URLS => SCRUD - Update
app.post("/urls/:shortURL", (req, res) => {
  let options = getRouteOptions(req, res);
  decideUpdate(options);
});

// URLS => SCRUD - Delete
app.post("/urls/:shortURL/delete", (req, res) => {
  let shortU = req.params.shortURL;
  delete urlDatabase[shortU];
  res.redirect("/urls");
});

// USERS => SCRUD - Create Users
app.get("/register", (req, res) => {
  req.templateVars.formType = 'register';
  if(req.email) { return res.redirect("/"); }
  res.render("register", req.templateVars);
});

app.post("/register", (req, res) => {
  if(validateRegistration(req)) {
    req.session.user_id = createUser(req, users);
    res.redirect("/");
  } else {
      renderError(400, res, req.templateVars);
  }
});

// USERS => Logging
app.get("/login", (req, res) => {
  req.templateVars.formType = 'login';
  if(req.email) { return res.redirect("/"); }
  res.render("register", req.templateVars);
});

app.post("/login", (req, res) => {
  if(validateLogin(req)) {
    req.session.user_id = findUserBy("email", req.body.email, users).id;
    res.redirect("/");
  } else {
      renderError(403, res, req.templateVars);
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/");
});

// SERVER => Listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});