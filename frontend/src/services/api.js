const API = "http://localhost:8000/api/interview";

async function request(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
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

  nextQuestion(interviewId) {
    return request(`${API}/next`, { interviewId });
  },

  getSummary(interviewId) {
    return request(`${API}/summary`, { interviewId });
  },
  getReaction(interviewId, isCorrect, userAnswer) {
  return request(`${API}/react`, { interviewId, isCorrect, userAnswer });
},
};