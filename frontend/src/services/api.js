const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api/interview";
const AUTH = import.meta.env.VITE_AUTH_URL || "http://localhost:8000/api/auth";

async function request(url, body) {
  const headers = { "Content-Type": "application/json" };

  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    credentials: "include", // 👈 FIX: Tells mobile browsers this is a secure, authenticated request
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Server error");
  }

  return res.json();
}

async function get(url) {
  const headers = {};
  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, { 
    method: "GET",
    headers,
    credentials: "include" // 👈 FIX: Added here as well for GET requests
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Server error");
  }
  return res.json();
}

export default {
  // Interview
  startInterview(jobRole, experienceLevel, questionLimit) {
    return request(`${API}/start`, { jobRole, experienceLevel, questionLimit });
  },

  submitAnswer(interviewId, userAnswer) {
    return request(`${API}/answer`, { interviewId, userAnswer });
  },

  getReaction(interviewId, isCorrect, userAnswer, introCompleted) {
    return request(`${API}/react`, { interviewId, isCorrect, userAnswer, introCompleted });
  },

  nextQuestion(interviewId) {
    return request(`${API}/next`, { interviewId });
  },

  getSummary(interviewId) {
    return request(`${API}/summary`, { interviewId });
  },

  getPixelStreamingUrl() {
    return get(`${API}/ps-url`);
  },

  // Auth
  login(email, password) {
    return request(`${AUTH}/login`, { email, password });
  },

  register(email, password) {
    return request(`${AUTH}/register`, { email, password });
  },

  verifyCode(email, code) {
    return request(`${AUTH}/verify`, { email, code });
  }
};