const axios = require("axios");
const API_URL = process.env.API_URL;

const config = (sessionId) => ({
  headers: { "x-session-id": sessionId }
});

exports.start = async (sessionId, name) => {
  try {
    const res = await axios.post(`${API_URL}/api/timers/start`, { name }, config(sessionId));
    return { id: res.data.id };
  } catch (err) {
    return { error: err.response?.data?.error || "Failed to start timer" };
  }
};

exports.stop = async (sessionId, id) => {
  try {
    await axios.post(`${API_URL}/api/timers/stop/${id}`, {}, config(sessionId));
    return { success: true };
  } catch (err) {
    return { error: err.response?.data?.error || "Failed to stop timer" };
  }
};

exports.getActiveTimers = async (sessionId) => {
  try {
    const res = await axios.get(`${API_URL}/api/timers`, config(sessionId));
    return res.data;
  } catch {
    return [];
  }
};

exports.getOldTimers = async (sessionId) => {
  try {
    const res = await axios.get(`${API_URL}/api/timers/old`, config(sessionId));
    return res.data;
  } catch {
    return [];
  }
};

exports.getTimer = async (sessionId, id) => {
  try {
    const res = await axios.get(`${API_URL}/api/timers/${id}`, config(sessionId));
    return res.data;
  } catch {
    return null;
  }
};