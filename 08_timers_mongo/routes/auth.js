const express = require("express");
const bcrypt = require("bcryptjs");
const { getDb } = require("../db");

const router = express.Router();

// Регистрация — форма
router.get("/register", (req, res) => {
  res.render("register");
});

// Регистрация — обработка
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const db = getDb();

  try {
    const existing = await db.collection("users").findOne({ username });
    if (existing) {
      return res.render("register", { error: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 12);
    const result = await db.collection("users").insertOne({ username, password_hash: hashed });
    res.redirect("/auth/login");
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Логин — форма
router.get("/login", (req, res) => {
  res.render("login");
});

// Логин — обработка
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const db = getDb();

  try {
    const user = await db.collection("users").findOne({ username });
    if (user && await bcrypt.compare(password, user.password_hash)) {
      req.session.userId = user._id;
      return res.redirect("/");
    }
    res.redirect("/auth/login?authError=true");
  } catch (err) {
    res.redirect("/auth/login?authError=true");
  }
});

// Логаут
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/auth/login");
  });
});

module.exports = router;