const express = require("express");
const bcrypt = require("bcryptjs");
const { getDb } = require("../db");
const { nanoid } = require("nanoid"); 
const auth = require("../middleware/auth"); 

const router = express.Router();

// Регистрация
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  const db = getDb();

  try {
    const existing = await db.collection("users").findOne({ username });
    if (existing) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const hashed = await bcrypt.hash(password, 12);
    const result = await db.collection("users").insertOne({ username, password_hash: hashed });

    const sessionId = nanoid(); // ✅ Работает, если nanoid@^3.3.7
    await db.collection("sessions").insertOne({
      sid: sessionId,
      sess: { userId: result.insertedId },
      expire: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    res.json({ sessionId });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Логин
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const db = getDb();

  try {
    const user = await db.collection("users").findOne({ username });
    if (user && await bcrypt.compare(password, user.password_hash)) {
      const sessionId = nanoid();
      await db.collection("sessions").insertOne({
        sid: sessionId,
        sess: { userId: user._id },
        expire: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      return res.json({ sessionId });
    }
    res.status(401).json({ error: "Wrong username or password" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Логаут
router.post("/logout", auth, async (req, res) => {
  // auth уже проверил сессию, req.user доступен
  const sessionId = req.headers["x-session-id"] || req.query.sessionId;
  const db = getDb();

  try {
    await db.collection("sessions").deleteOne({ sid: sessionId });
    res.json({});
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;