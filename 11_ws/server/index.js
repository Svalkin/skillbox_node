require("dotenv").config();
const express = require("express");
const { connect, getDb } = require("./db");
const authRoutes = require("./routes/auth");
const timersRoutes = require("./routes/timerRoutes");

const app = express();

// Подключаемся к MongoDB
connect();

// Парсинг JSON
app.use(express.json());

// Роуты
app.use("/auth", authRoutes);
app.use("/api/timers", timersRoutes);

// Порт
const port = process.env.PORT || 3000;

// Запускаем HTTP-сервер
const server = app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});

// Подключаем WebSocket
const { setupWebSocket } = require("./ws-server");
setupWebSocket(server);
