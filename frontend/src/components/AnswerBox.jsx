import { useState } from "react";

function AnswerBox({ onSubmit, loading }) {
  const [answer, setAnswer] = useState("");

  const handleSubmit = () => {
    if (!answer.trim()) return;
    onSubmit(answer);
    setAnswer("");
  };

  return (
    <div style={{ marginTop: 20 }}>
      <textarea
        rows="6"
        style={{ width: "100%", padding: 10 }}
        placeholder="Type your answer here..."
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{ marginTop: 10 }}
      >
        {loading ? "Evaluating..." : "Submit Answer"}
      </button>
    </div>
  );
}

export default AnswerBox;
