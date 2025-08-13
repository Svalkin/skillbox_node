// server/routes/timerRoutes.js
const express = require("express");
const { getDb } = require("../db");
const auth = require("../middleware/auth");
const { nanoid } = require("nanoid"); 

const router = express.Router();

// Получить все активные таймеры
router.get("/", auth, async (req, res) => {
  const db = getDb();
  const timers = await db.collection("timers")
    .find({ userId: req.user._id, stoppedAt: null })
    .toArray();
  res.json(timers);
});

// Запустить новый таймер
router.post("/start", auth, async (req, res) => {
  const { name } = req.body;
  const db = getDb();

  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  try {
    const timer = {
      _id: nanoid(),
      userId: req.user._id,
      name,
      startedAt: new Date(),
      stoppedAt: null,
    };
    await db.collection("timers").insertOne(timer);
    res.status(201).json({ id: timer._id });
  } catch (err) {
    console.error("Start timer error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Остановить таймер
router.post("/stop/:id", auth, async (req, res) => {
  const { id } = req.params;
  const db = getDb();

  try {
    const result = await db.collection("timers").updateOne(
      { _id: id, userId: req.user._id, stoppedAt: null },
      { $set: { stoppedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Timer not found or already stopped" });
    }

    res.json({});
  } catch (err) {
    console.error("Stop timer error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Экспортируем роутер
module.exports = router;