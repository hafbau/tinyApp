function createUser(req, users) {
  let randomID = generateUniqueKey(users);
  users[randomID] = {
    id: randomID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };
  return randomID;
}

function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x100000).toString(16);
}

function generateUniqueKey(obj) {
  let key;
  do {
    key = generateRandomString();
  } while(obj[key]);
  return key;
}

function formatURL(longU) {
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
  let emails = getUsersProp("email", users);
  let email = reqObj.body.email;
  if(email) {
    if(!emails.includes(email)) {
      return action === "register" ? !!reqObj.body.password : false
    }
    if(action === "register") { return; }
    let pswd = findUserBy("email", email, users).password;
    return bcrypt.compareSync(reqObj.body.password, pswd);
  }
}

function findUserBy(propType, prop, users) {
  for (let user in users) {
    if (prop === users[user][propType]) {
      return users[user];
    }
  }
}

function validateRegistration(reqObj) {
  return validateUser("register", reqObj);
}

function validateLogin(reqObj) {
  return validateUser("login", reqObj);
}

function filterUrlsByEmail(email, urls) {
  let filtered = {};
  for(let item in urls) {
    urls[item].email === email && (filtered[item] = urls[item]);
  }
  return filtered;
}

function getRouteOptions(req, res, user = req.user) {
  let options = {};
  options.email = user ? user.email : undefined;
  options.short = req.params.shortURL;
  options.templateVars = {
    useremail: options.email,
    formType: undefined,
    shortURL: options.short
  };
  options.urlDatabase = urlDatabase;
  options.res = res; options.req = req;
  return options;
}

function show(req, res, templateVars) {
  let short = req.params.shortURL;
  templateVars.fullURL = urlDatabase[short].long;
  res.render("urls_show", templateVars);
}

function update(req, res, templateVars) {
  let shortU = req.params.shortURL;
  urlDatabase[shortU].long = formatURL(req.body.longURL);
  res.redirect(`/urls/${shortU}`)
}

function decideRoute(options, routefunc) {
  let email = options.email, urlDatabase = options.urlDatabase,
    short = options.short, templateVars = options.templateVars,
    res = options.res, req = options.req;
  if(email) {
    if(urlDatabase[short]) {
      if(urlDatabase[short].email === email) {
        routefunc(req, res, templateVars);
      } else {
          renderError(403, res, templateVars);
      }
    } else {
        renderError(404, res, templateVars);
    }
  } else {
      renderError(401, res, templateVars);
  }
}

function renderError (errno, res, templateVars) {
  templateVars.err_mesg = ERROR[errno];
  res.status(errno);
  res.render("error", templateVars);
}

function decideShow(options) {
  decideRoute(options, show);
}

function decideUpdate(options) {
  decideRoute(options, update);
}

const ERROR = {
  "400": "Error 400: Could not register with that email and password combination",
  "401": "Error 401: Access denied, login or register to continue.",
  "403": "Error 403: Wrong credentials :(",
  "404": "Error 404: Sorry we can't find that!",
  "500": ""
}

module.exports = {
  createUser: createUser,
  decideShow: decideShow,
  decideUpdate: decideUpdate,
  ERROR: ERROR,
  filterUrlsByEmail: filterUrlsByEmail,
  findUserBy: findUserBy,
  formatURL: formatURL,
  generateUniqueKey: generateUniqueKey,
  getRouteOptions: getRouteOptions,
  renderError: renderError,
  validateLogin: validateLogin,
  validateRegistration: validateRegistration
}