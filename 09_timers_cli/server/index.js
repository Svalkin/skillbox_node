require("dotenv").config();
const express = require("express");
const { connect, getDb } = require("./db");
const authRoutes = require("./routes/auth");
const timersRoutes = require("./routes/timerRoutes");

const app = express();

// Подключаемся к MongoDB при старте
connect();

// Парсинг JSON тел запросов
app.use(express.json());

// Роуты
app.use("/auth", authRoutes);
app.use("/api/timers", timersRoutes);

// Порт
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});