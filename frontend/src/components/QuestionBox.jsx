function QuestionBox({ question }) {
  if (!question) return null;

  return (
    <div
      style={{
        padding: 20,
        borderRadius: 8,
        background: "#f4f4f4",
        marginBottom: 20
      }}
    >
      <h3>Interview Question</h3>
      <p style={{ fontSize: 18 }}>{question}</p>
    </div>
  );
}

export default QuestionBox;
