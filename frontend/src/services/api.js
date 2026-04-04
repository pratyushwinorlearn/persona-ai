const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api/interview";
const AUTH = import.meta.env.VITE_AUTH_URL || "http://localhost:8000/api/auth";

async function request(url, body) {
  const headers = { "Content-Type": "application/json" };

  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      credentials: "include", 
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Server error");
    }

    return await res.json();
  } catch (error) {
    // 🚨 DEBUG TRAP: Forces the phone to show the silent error
    alert(`FETCH POST FAILED!\nURL: ${url}\nError: ${error.message}`);
    throw error;
  }
}

async function get(url) {
  const headers = {};
  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, { 
      method: "GET",
      headers,
      credentials: "include" 
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Server error");
    }
    
    return await res.json();
  } catch (error) {
    // 🚨 DEBUG TRAP: Forces the phone to show the silent error
    alert(`FETCH GET FAILED!\nURL: ${url}\nError: ${error.message}`);
    throw error;
  }
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