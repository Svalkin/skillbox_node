const WebSocket = require("ws");
const { getDb } = require("./db");

// Храним подключённых клиентов: map<sessionId, ws>
const clients = new Map();

// Основная функция для подключения WebSocket к серверу
function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", async (ws, req) => {
    let sessionId = null;
    let userId = null;

    // 1. Аутентификация: извлекаем sessionId
    const url = new URL(req.url, `http://${req.headers.host}`);
    sessionId = url.searchParams.get("sessionId");

    if (!sessionId) {
      const authHeader = req.headers["sec-websocket-protocol"];
      if (authHeader) {
        sessionId = authHeader;
      }
    }

    if (!sessionId) {
      ws.close(1008, "Authentication required");
      return;
    }

    // 2. Проверяем сессию в БД
    try {
      const db = getDb();
      const session = await db.collection("sessions").findOne({ sid: sessionId });
      if (!session || !session.sess?.userId) {
        ws.close(1008, "Invalid session");
        return;
      }

      userId = session.sess.userId.toString();
    } catch (err) {
      ws.close(1008, "Auth failed");
      return;
    }

    // 3. Сохраняем клиента
    ws.sessionId = sessionId;
    ws.userId = userId;

    if (clients.has(sessionId)) {
      clients.get(sessionId).close();
    }
    clients.set(sessionId, ws);

    console.log(`✅ WebSocket client connected: ${sessionId}`);

    // 4. Отправляем полный список таймеров
    await sendAllTimers(ws, userId);

    // 5. Обработчик сообщений
    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data);
        // Можно добавить обработку start/stop через сокет
      } catch (e) {}
    });

    ws.on("close", () => {
      clients.delete(sessionId);
      console.log(`❌ WebSocket client disconnected: ${sessionId}`);
    });
  });

  return clients;
}

// Отправляем клиенту все таймеры (активные + завершённые)
async function sendAllTimers(ws, userId) {
  try {
    const db = getDb();
    const timers = await db.collection("timers")
      .find({ userId: new require("mongodb").ObjectId(userId) })
      .sort({ startedAt: -1 })
      .toArray();

    const formatted = timers.map(t => ({
      id: t._id.toString(),
      name: t.name,
      duration: Math.floor((t.stoppedAt ? t.stoppedAt : new Date()) - t.startedAt) / 1000,
      active: !t.stoppedAt,
    }));

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "all_timers", data: formatted }));
    }
  } catch (err) {
    console.error("sendAllTimers error:", err);
  }
}

// Рассылка активных таймеров (каждую секунду)
setInterval(async () => {
  for (const [sessionId, ws] of clients) {
    if (ws.readyState !== WebSocket.OPEN) continue;

    try {
      const db = getDb();
      const activeTimers = await db.collection("timers")
        .find({ userId: ws.userId, stoppedAt: null })
        .toArray();

      const now = Date.now();
      const formatted = activeTimers.map(t => ({
        id: t._id.toString(),
        name: t.name,
        time: Math.floor((now - t.startedAt.getTime()) / 1000),
      }));

      ws.send(JSON.stringify({ type: "active_timers", data: formatted }));
    } catch (err) {
      console.error("active_timers error:", err);
    }
  }
}, 1000);

// Обновить всех клиентов после операции
async function broadcastTimers(userId) {
  for (const [sessionId, ws] of clients) {
    if (ws.userId === userId) {
      await sendAllTimers(ws, userId);
    }
  }
}

// ✅ Единый экспорт
module.exports = {
  setupWebSocket,
  broadcastTimers,
  clients,
};