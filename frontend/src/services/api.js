const API = "https://persona-ai-production-ac95.up.railway.app/api/interview";
const AUTH = "https://persona-ai-production-ac95.up.railway.app/api/auth";

async function request(url, body) {
  const headers = { "Content-Type": "application/json" };

  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
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
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, {
    method: "GET",
    headers
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Server error");
  }

  return res.json();
}

export default {
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