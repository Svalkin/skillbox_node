require("dotenv").config();
const express = require("express");
const nunjucks = require("nunjucks");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const { connect, getDb } = require("./db");
const authRoutes = require("./routes/auth");
const timersRoutes = require("./routes/timerRoutes");
const { isAuth } = require("./middleware/auth");

const app = express();

// Подключение к MongoDB при старте
connect();

// Настройка шаблонизатора Nunjucks
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

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

// Сессии в MongoDB
app.use(
  session({
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions",
      ttl: 14 * 24 * 60 * 60, // 14 дней
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 дней
  })
);

// Загрузка пользователя из БД по сессии
app.use(async (req, res, next) => {
  if (req.session.userId) {
    try {
      const db = getDb();
      req.user = await db.collection("users").findOne(
        { _id: req.session.userId },
        { projection: { password_hash: 0 } }
      );
    } catch (err) {
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
});

// Главная страница
app.get("/", isAuth(), (req, res) => {
  res.render("index", {
    user: req.user,
    authError: req.query.authError === "true" ? "Wrong username or password" : req.query.authError,
  });
});

// Роуты
app.use("/auth", authRoutes);
app.use("/api/timers", timersRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});