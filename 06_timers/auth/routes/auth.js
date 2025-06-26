const express = require("express");
const router = express.Router();
const { findByUserName, createSession, createUser, deleteSession } = require("../utils/db");
const { verify } = require("../utils/hash");
const { isAuth } = require("../middleware/auth");

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = findByUserName(username);
  if (user) {
    const checkPassword = await verify(password, user.password);
    if (checkPassword) {
      const sessionId = createSession(user._id);
      res
        .cookie("sessionId", sessionId, {
          httpOnly: true,
        })
        .status(302)
        .redirect("/");
    }
  } else {
    res.status(302).redirect("/?authError=true");
  }
});

router.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  const user = await createUser(username, password);
  if (!user) {
    res.status(302).redirect("/?authError=true");
  } else {
    const sessionId = createSession(user._id);
    res
      .cookie("sessionId", sessionId, {
        httpOnly: true,
      })
      .status(302)
      .redirect("/");
  }
});

router.get("/logout", isAuth(), (req, res) => {
  if (!req.user) res.status(302).redirect("/");
  deleteSession(req.sessionId);
  res.clearCookie("sessionId").status(302).redirect("/");
});

module.exports = router;
