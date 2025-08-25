const axios = require("axios");
const API_URL = process.env.API_URL;

exports.signup = async (username, password) => {
  try {
    const res = await axios.post(`${API_URL}/auth/signup`, { username, password });
    return { sessionId: res.data.sessionId };
  } catch (err) {
    return { error: err.response?.data?.error || "Signup failed" };
  }
};

exports.login = async (username, password) => {
  try {
    const res = await axios.post(`${API_URL}/auth/login`, { username, password });
    return { sessionId: res.data.sessionId };
  } catch (err) {
    return { error: err.response?.data?.error || "Wrong username or password!" };
  }
};

exports.logout = async (sessionId) => {
  try {
    await axios.post(`${API_URL}/auth/logout`, {}, {
      headers: { "x-session-id": sessionId }
    });
  } catch {}
};