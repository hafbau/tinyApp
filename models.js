module.exports = {
  /* Structure of the url database is
  /* urlDatabase = {
  /*   shortURL: {
  /*     long: original long url,
  /*     email: email of user that created this link,
  /*     totalVisits: number of visits through the short link,
  /*     totalVisitors: number of unique visitors,
  /*     visits: {
  /*       visitor_id0: [timestamp0, timestamp1, timestamp],
  /*       visitor_id1: [timestamp0, timestamp1, timestamp],
  /*       visitor_id2: [timestamp0, timestamp1, timestamp]
  /*     }
  /*   };
  /* }
  */
  urlDatabase: {},

  /* Structure of the user database is
  /* user = {
  /*   userID: random key,
  /*   email: email,
  /*   password: bcrypt password
  /* }
  */
  users: {}
}