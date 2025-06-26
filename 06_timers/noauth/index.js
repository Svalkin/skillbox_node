const express = require("express");
const nunjucks = require("nunjucks");
const { nanoid } = require("nanoid");
const cors = require("cors"); // Добавляем CORS

const app = express();

// Включаем CORS для всех запросов
app.use(cors());

nunjucks.configure("views", {
  autoescape: true,
  express: app,
  tags: {
    blockStart: "[%",
    blockEnd: "%]",
    variableStart: "[[",
    variableEnd: "]]",
    commentStart: "[#",
    commentEnd: "#]",
  },
});

app.set("view engine", "njk");
app.use(express.json());
app.use(express.static("public"));

// Хранилище данных
const DB = {
  timers: [],
};

// Главная страница
app.get("/", (req, res) => {
  res.render("index");
});

// Получение таймеров
app.get("/api/timers", (req, res) => {
  const { isActive } = req.query;

  // Если параметр не передан, возвращаем все таймеры
  if (isActive === undefined) {
    return res.json(DB.timers);
  }

  // Фильтрация по статусу активности
  const filteredTimers = DB.timers
    .filter((timer) => timer.isActive.toString() === isActive)
    .map((timer) => {
      if (timer.isActive) {
        return {
          ...timer,
          progress: Date.now() - timer.start,
        };
      }
      return timer;
    });

  res.json(filteredTimers);
});

// Создание нового таймера
app.post("/api/timers", (req, res) => {
  const { description } = req.body;

  if (!description) {
    return res.status(400).json({ error: "Description is required" });
  }

  const newTimer = {
    id: nanoid(),
    start: Date.now(),
    description,
    isActive: true,
  };

  DB.timers.push(newTimer);
  res.status(201).json({ id: newTimer.id });
});

// Остановка таймера
app.post("/api/timers/:id/stop", (req, res) => {
  const { id } = req.params;
  const timerIndex = DB.timers.findIndex((t) => t.id === id);

  if (timerIndex === -1) {
    return res.status(404).json({ error: "Timer not found" });
  }

  const now = Date.now();
  DB.timers[timerIndex] = {
    ...DB.timers[timerIndex],
    end: now,
    duration: now - DB.timers[timerIndex].start,
    isActive: false,
  };

  res.json({ id });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
