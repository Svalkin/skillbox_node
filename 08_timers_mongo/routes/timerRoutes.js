const express = require("express");
const { getDb } = require("../db");
const { isAuth } = require("../middleware/auth"); // ✅ правильно: подключаем middleware

const router = express.Router();

router.get("/", isAuth(), async (req, res) => {
  const db = getDb();
  const timers = await db.collection("timers")
    .find({ userId: req.user._id })
    .toArray();
  res.json(timers);
});

// ... другие роуты: POST, DELETE

module.exports = router;