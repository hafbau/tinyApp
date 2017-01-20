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

function decideRoute(options) {
  let email = options.email, urlDatabase = options.urlDatabase,
    short = options.short, templateVars = options.templateVars,
    res = options.res;
  if(email) {
    if(urlDatabase[short]) {
      if(urlDatabase[short].email === email) {
        templateVars.fullURL = urlDatabase[short].long
        res.render("urls_show", templateVars);
      } else {
          templateVars.err_mesg = ERROR[403];
          res.status(403);
          res.render("error", templateVars);
      }
    } else {
        templateVars.err_mesg = ERROR[404];
        res.status(404);
        res.render("error", templateVars);
    }
  } else {
      templateVars.err_mesg = ERROR[401];
      res.status(401);
      res.render("error", templateVars);
  }
}

const ERROR = {
  "400": "Error 400: Could not register with that email and password combination",
  "401": "Error 401: Access denied, login or register to continue.",
  "403": "Error 403: Wrong credentials :(",
  "404": "Error 404: Sorry we can't find that!",
  "500": ""
}

module.exports = {
  decideRoute: decideRoute,
  ERROR: ERROR,
  filterUrlsByEmail: filterUrlsByEmail,
  findUserBy: findUserBy,
  formatURL: formatURL,
  generateUniqueKey: generateUniqueKey,
  validateLogin: validateLogin,
  validateRegistration: validateRegistration
}