require("dotenv").config();
const inquirer = require("inquirer");
const fs = require("fs").promises;
const path = require("path");
const auth = require("./auth");
const timers = require("./timers");

const SESSION_FILE = process.env.SESSION_FILE;

async function getSessionId() {
  try {
    const data = await fs.readFile(SESSION_FILE, "utf-8");
    const session = JSON.parse(data);
    return session.sessionId;
  } catch {
    return null;
  }
}

async function saveSessionId(sessionId) {
  await fs.writeFile(SESSION_FILE, JSON.stringify({ sessionId }), "utf-8");
}

async function clearSession() {
  try {
    await fs.unlink(SESSION_FILE);
  } catch {}
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === "signup") {
    const { username, password } = await inquirer.prompt([
      { name: "username", message: "Username:" },
      { name: "password", message: "Password:", type: "password" },
    ]);
    const result = await auth.signup(username, password);
    if (result.sessionId) {
      await saveSessionId(result.sessionId);
      console.log("Signed up successfully!\n");
    } else {
      console.log(result.error);
    }
  }

  else if (command === "login") {
    const { username, password } = await inquirer.prompt([
      { name: "username", message: "Username:" },
      { name: "password", message: "Password:", type: "password" },
    ]);
    const result = await auth.login(username, password);
    if (result.sessionId) {
      await saveSessionId(result.sessionId);
      console.log("Logged in successfully!\n");
    } else {
      console.log(result.error);
    }
  }

  else if (command === "logout") {
    const sessionId = await getSessionId();
    if (sessionId) {
      await auth.logout(sessionId);
      await clearSession();
      console.log("Logged out successfully!\n");
    } else {
      console.log("You are not logged in.\n");
    }
  }

  else if (command === "start") {
    const name = args[1];
    if (!name) {
      console.log("Usage: node index.js start <description>\n");
      return;
    }
    const sessionId = await getSessionId();
    if (!sessionId) {
      console.log("You must be logged in.\n");
      return;
    }
    const result = await timers.start(sessionId, name);
    if (result.id) {
      console.log(`Started timer "${name}", ID: ${result.id}.\n`);
    } else {
      console.log(result.error);
    }
  }

  else if (command === "stop") {
    const id = args[1];
    if (!id) {
      console.log("Usage: node index.js stop <id>\n");
      return;
    }
    const sessionId = await getSessionId();
    if (!sessionId) {
      console.log("You must be logged in.\n");
      return;
    }
    const result = await timers.stop(sessionId, id);
    if (result.success) {
      console.log(`Timer ${id} stopped.\n`);
    } else {
      console.log(result.error);
    }
  }

  else if (command === "status") {
    const id = args[1];
    const sessionId = await getSessionId();
    if (!sessionId) {
      console.log("You must be logged in.\n");
      return;
    }

    if (id === "old") {
      const timersList = await timers.getOldTimers(sessionId);
      printTimers(timersList);
    } else if (id) {
      const timer = await timers.getTimer(sessionId, id);
      if (timer) {
        console.log(`ID\tTask\tTime`);
        console.log(`${timer._id}\t${timer.name}\t${formatTime(timer)}`);
      } else {
        console.log(`Unknown timer ID ${id}.\n`);
      }
    } else {
      const timersList = await timers.getActiveTimers(sessionId);
      printTimers(timersList);
    }
  }

  else {
    console.log("Unknown command. Use: signup, login, logout, start, stop, status\n");
  }
}

function printTimers(timersList) {
  if (!timersList || timersList.length === 0) {
    console.log("You have no timers.\n");
    return;
  }
  console.log("ID\tTask\tTime");
  timersList.forEach(t => {
    console.log(`${t._id}\t${t.name}\t${formatTime(t)}`);
  });
  console.log("");
}

function formatTime(timer) {
  const now = Date.now();
  const start = new Date(timer.startedAt).getTime();
  const end = timer.stoppedAt ? new Date(timer.stoppedAt).getTime() : now;
  const seconds = Math.floor((end - start) / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

main().catch(console.error);