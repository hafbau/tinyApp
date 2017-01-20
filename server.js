Object.assign(global,
  require("./module_requires"),
  require("./models"), require("./my_utils")
);

// Root Path
app.get("/", (req, res) => {
  let user = users[req.session.user_id];
  user ? res.redirect("/urls") : res.redirect("/login");
});

// API - lists all urls in JSON
app.get("/api/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// SCRUD - Search
app.get("/urls", (req, res) => {
  let user = users[req.session.user_id];
  let email = user ? user.email : undefined;
  let templateVars = {
    useremail: email,
    formType: undefined,
    err_mesg: ERROR[401],
    urls: filterUrlsByEmail(email, urlDatabase)
  };
  if (!email) {
    res.status(401);
    res.render("error", templateVars);
  } else {
      res.render("urls_index", templateVars);
  }
});

// URLS => SCRUD - Create
app.get("/urls/new", (req, res) => {
  let user = users[req.session.user_id];
  let email = user ? user.email : undefined;
  let templateVars = {
    useremail: email,
    err_mesg: ERROR[401],
    formType: undefined
  };
  if (!email) {
    res.status(401);
    res.render("error", templateVars);
  } else {
      res.render("urls_new", templateVars);
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
app.get("/urls/:id", (req, res) => {
  let user = users[req.session.user_id];
  let options = {};
  options.email = user ? user.email : undefined;
  options.short = req.params.id;
  options.templateVars = {
    useremail: options.email,
    formType: undefined,
    shortURL: options.short
  };
  options.urlDatabase = urlDatabase;
  options.res = res;
  decideRoute(options);
});

app.get("/u/:shortURL", (req, res) => { // public path for redirection to long url
  let longURL = urlDatabase[req.params.shortURL];
  if (longURL) {
    res.redirect(longURL.long);
  } else {
    let templateVars = {
      useremail: undefined,
      formType: undefined,
      err_mesg: ERROR[404]
    };
    res.status(404);
    res.render('error', templateVars);
  }
});

// URLS => SCRUD - Update
app.post("/urls/:shortURL", (req, res) => {
  let shortU = req.params.shortURL;

  urlDatabase[shortU].long = formatURL(req.body.longURL);
  res.redirect(`/urls/${shortU}`);
});

// URLS => SCRUD - Delete
app.post("/urls/:shortURL/delete", (req, res) => {
  let shortU = req.params.shortURL;
  delete urlDatabase[shortU];
  res.redirect("/urls");
});

// USERS => SCRUD - Create Users
app.get("/register", (req, res) => {
  let user = users[req.session.user_id];
  let email = user ? user.email : undefined;
  let templateVars = {
    useremail: email,
    formType: 'register'
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  if(validateRegistration(req)) {
    let randomID = generateUniqueKey(users);
    users[randomID] = {
      id: randomID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    req.session.user_id = randomID;
    res.redirect("/");
  } else {
      let templateVars = {
        useremail: undefined,
        formType: undefined,
        err_mesg: ERROR[400]
      };
      res.status(400);
      res.render('error', templateVars);
  }
});

// USERS => Logging
app.get("/login", (req, res) => {
  let user = users[req.session.user_id];
  let email = user ? user.email : undefined;
  let templateVars = {
    useremail: email,
    formType: 'login'
  };
  res.render("register", templateVars);
});

app.post("/login", (req, res) => {
  if(validateLogin(req)) {
    req.session.user_id = findUserBy("email", req.body.email, users).id;
    res.redirect("/");
  } else {
      let templateVars = {
        useremail: undefined,
        formType: undefined,
        err_mesg: ERROR[403]
      };
      res.status(403);
      res.render('error', templateVars);
  }
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/");
});

// SERVER => Listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});