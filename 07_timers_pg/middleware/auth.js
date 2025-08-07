const { findBySession } = require("../utils/db");

const isAuth = () => (req, res, next) => {
  if (!req.cookies["sessionId"]) return next();

  const user = findBySession(req.cookies["sessionId"]);
  if (user) {
    req.user = user;
    req.sessionId = req.cookies["sessionId"];
  }
  next();
};

module.exports = {
  isAuth,
};
