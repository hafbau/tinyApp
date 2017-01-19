Object.assign(global,
  require("./module_requires"),
  require("./models"), require("./my_utils")
);

app.get("/", (req, res) => {
  res.end("<html><body>Hello urls <a href='/urls'>urls list</a></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
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
  let templateVars = {
    useremail: email,
    formType: undefined
  };
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
  urlDatabase[shortU] = {
    long: longU,
    email: useremail
  };

  res.redirect(`/urls/${shortU}`);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  if (longURL) {
    res.redirect(longURL.long);
  } else {
    res.render('error', {err_mesg: 'Error 404: We cant find that!'});
  }
});

app.get("/register", (req, res) => {
  let user = users[req.session.user_id];
  let email = user ? user.email : undefined;
  let templateVars = {
    useremail: email,
    formType: 'register'
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  let user = users[req.session.user_id];
  let email = user ? user.email : undefined;
  let templateVars = {
    useremail: email,
    formType: 'login'
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  let randomID;
  
  if(validateUserRegistration(req, res)) {
    do {
      randomID = generateRandomString();
    } while(users[randomID])

    users[randomID] = {
      id: randomID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    req.session.user_id = randomID;
    res.redirect("/");
  } else {
    res.render('error', {err_mesg: 'Error 400: Those aint valid!'});
  }
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