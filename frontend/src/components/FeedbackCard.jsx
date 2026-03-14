function FeedbackCard({ feedback, isCorrect, weakTopic, emotion }) {
  if (!feedback) return null;

  return (
    <div
      style={{
        padding: 20,
        marginTop: 20,
        borderRadius: 8,
        background: isCorrect ? "#e6fffa" : "#fff5f5",
        border: `1px solid ${isCorrect ? "#38b2ac" : "#e53e3e"}`
      }}
    >
      <h3>AI Feedback</h3>

      <p>
        <strong>Status:</strong>{" "}
        {isCorrect ? "Correct ✅" : "Needs Improvement ❌"}
      </p>

      <p>
        <strong>Feedback:</strong> {feedback}
      </p>

      {weakTopic && (
        <p>
          <strong>Weak Topic:</strong> {weakTopic}
        </p>
      )}

      {emotion && (
        <p>
          <strong>Emotion:</strong> {emotion}
        </p>
      )}
    </div>
  );
}

export default FeedbackCard;
