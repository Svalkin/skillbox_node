const { getDb } = require("../db");

module.exports.isAuth = () => {
  return (req, res, next) => {
    if (!req.user) {
      // Для API — 401, для страниц — редирект
      if (req.path.startsWith("/api")) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      return res.redirect("/auth/login");
    }
    next();
  };
};