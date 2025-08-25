const { getDb } = require("../db");
const { ObjectId } = require("mongodb"); // ✅ Импортируем ObjectId

module.exports = async (req, res, next) => {
  const sessionId = req.headers["x-session-id"] || req.query.sessionId;

  if (!sessionId) {
    return res.status(401).json({ error: "Session ID required" });
  }

  try {
    const db = getDb();
    const session = await db.collection("sessions").findOne({ sid: sessionId });

    if (!session || !session.sess?.userId) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    // ✅ Преобразуем строку в ObjectId
    const userId = new ObjectId(session.sess.userId);

    const user = await db.collection("users").findOne(
      { _id: userId },
      { projection: { password_hash: 0 } }
    );

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(500).json({ error: "Authentication failed" });
  }
};