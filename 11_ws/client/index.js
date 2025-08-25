require("dotenv").config();
const inquirer = require("inquirer");
const WebSocket = require("ws");
const axios = require("axios");

const API_URL = process.env.API_URL;
const WS_URL = process.env.WS_URL || API_URL.replace("http", "ws");
const SESSION_FILE = process.env.SESSION_FILE;

let sessionId = null;
let ws = null;
let timers = { all: [], active: [] };

// Загрузка сессии
async function loadSession() {
  try {
    const data = await require("fs").promises.readFile(SESSION_FILE, "utf-8");
    const session = JSON.parse(data);
    sessionId = session.sessionId;
  } catch (e) {}
}

// Сохранение сессии
async function saveSession(id) {
  await require("fs").promises.writeFile(SESSION_FILE, JSON.stringify({ sessionId: id }), "utf-8");
  sessionId = id;
}

// Удаление сессии
async function clearSession() {
  try {
    await require("fs").promises.unlink(SESSION_FILE);
  } catch (e) {}
  sessionId = null;
}

// Подключение WebSocket
function connectWebSocket() {
  if (!sessionId) return;

  const url = `${WS_URL}/ws?sessionId=${sessionId}`;
  ws = new WebSocket(url);

  ws.on("open", () => {
    console.log("🔗 WebSocket connected");
  });

  ws.on("message", (data) => {
    const msg = JSON.parse(data);
    if (msg.type === "all_timers") {
      timers.all = msg.data;
    } else if (msg.type === "active_timers") {
      timers.active = msg.data;
    }
  });

  ws.on("close", () => {
    console.log("⚠️ WebSocket disconnected");
    setTimeout(connectWebSocket, 3000);
  });
}

// Вывод таймеров
function printTimers(list, header = "Timers") {
  if (!list.length) {
    console.log("You have no timers.\n");
    return;
  }
  console.log(header);
  console.log("ID\tTask\tTime");
  list.forEach(t => {
    const time = formatTime(t.time || t.duration);
    console.log(`${t.id}\t${t.name}\t${time}`);
  });
  console.log("");
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Основной цикл
async function main() {
  await loadSession();

  console.log("Welcome to Timer CLI! Type 'help' for commands.\n");

  const loop = async () => {
    const { command } = await inquirer.prompt([
      { name: "command", message: "Enter command:" }
    ]);

    const args = command.trim().split(" ");
    const cmd = args[0].toLowerCase();

    if (!sessionId && cmd !== "signup" && cmd !== "login" && cmd !== "exit") {
      console.log("You need to login first.\n");
      return loop();
    }

    if (cmd === "signup") {
      const { username, password } = await inquirer.prompt([
        { name: "username", message: "Username:" },
        { name: "password", message: "Password:", type: "password" }
      ]);
      try {
        const res = await axios.post(`${API_URL}/auth/signup`, { username, password });
        await saveSession(res.data.sessionId);
        console.log("Signed up successfully!\n");
        connectWebSocket();
      } catch (err) {
        console.log(err.response?.data?.error || "Signup failed\n");
      }
    }

    else if (cmd === "login") {
      const { username, password } = await inquirer.prompt([
        { name: "username", message: "Username:" },
        { name: "password", message: "Password:", type: "password" }
      ]);
      try {
        const res = await axios.post(`${API_URL}/auth/login`, { username, password });
        await saveSession(res.data.sessionId);
        console.log("Logged in successfully!\n");
        connectWebSocket();
      } catch (err) {
        console.log("Wrong username or password!\n");
      }
    }

    else if (cmd === "logout") {
      try {
        await axios.post(`${API_URL}/auth/logout`, {}, {
          headers: { "x-session-id": sessionId }
        });
        if (ws) ws.close();
        await clearSession();
        console.log("Logged out successfully!\n");
      } catch {}
    }

    else if (cmd === "status") {
      if (args[1] === "old") {
        const old = timers.all.filter(t => !t.active);
        printTimers(old, "Old timers");
      } else {
        printTimers(timers.all, "All timers");
      }
    }

    else if (cmd === "start") {
      const name = args.slice(1).join(" ");
      if (!name) {
        console.log("Usage: start <description>\n");
        return loop();
      }
      try {
        await axios.post(`${API_URL}/api/timers/start`, { name }, {
          headers: { "x-session-id": sessionId }
        });
        console.log(`Started timer "${name}"\n`);
      } catch (err) {
        console.log("Failed to start timer\n");
      }
    }

    else if (cmd === "stop") {
      const id = args[1];
      if (!id) {
        console.log("Usage: stop <id>\n");
        return loop();
      }
      try {
        await axios.post(`${API_URL}/api/timers/stop/${id}`, {}, {
          headers: { "x-session-id": sessionId }
        });
        console.log(`Timer ${id} stopped\n`);
      } catch (err) {
        console.log("Failed to stop timer\n");
      }
    }

    else if (cmd === "exit") {
      if (ws) ws.close();
      console.log("Goodbye!");
      process.exit(0);
    }

    else if (cmd === "help") {
      console.log(`
Available commands:
  signup
  login
  logout
  status
  status old
  start <description>
  stop <id>
  exit
`);
    }

    else {
      console.log("Unknown command. Type 'help'.\n");
    }

    loop();
  };

  loop();
}

main().catch(console.error);