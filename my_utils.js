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
  let emails = getUsersProp("email", users);
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

module.exports = {
  filterUrlsByEmail: filterUrlsByEmail,
  findUserBy: findUserBy,
  formatURL: formatURL,
  generateRandomString: generateRandomString,
  validateUser: validateUser,
  validateUserRegistration: validateUserRegistration
}