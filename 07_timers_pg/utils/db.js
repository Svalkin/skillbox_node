// utils/db.js
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Получение таймеров
exports.getTimers = async (userId, isActive) => {
  const client = await pool.connect();
  try {
    let query = "SELECT * FROM timers WHERE user_id = $1";
    const params = [userId];

    if (isActive !== undefined) {
      query += ` AND is_active = $${params.length + 1}`;
      params.push(isActive);
    }

    query += " ORDER BY created_at DESC";
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
};

// Создание таймера
exports.createTimer = async (userId, description) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO timers (user_id, description, is_active, duration)
       VALUES ($1, $2, true, 0)
       RETURNING id`,
      [userId, description]
    );
    return result.rows[0].id;
  } finally {
    client.release();
  }
};

// Остановка таймера
exports.stopTimer = async (userId, timerId) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE timers
       SET is_active = false, stopped_at = NOW(), duration = EXTRACT(EPOCH FROM (NOW() - created_at)) * 1000
       WHERE id = $1 AND user_id = $2 AND is_active = true
       RETURNING id`,
      [timerId, userId]
    );
    return result.rowCount > 0;
  } finally {
    client.release();
  }
};
