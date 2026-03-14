import { useEffect, useState } from "react";
import api from "../services/api";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .sm-root {
    min-height: 100vh;
    background: #07070a;
    font-family: 'DM Sans', sans-serif;
    color: #e8e6f0;
    position: relative;
    overflow-x: hidden;
  }

  .sm-root::before {
    content: '';
    position: fixed;
    width: 700px;
    height: 700px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(99,57,210,0.1) 0%, transparent 70%);
    top: -200px;
    left: -200px;
    pointer-events: none;
    z-index: 0;
  }

  .sm-root::after {
    content: '';
    position: fixed;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%);
    bottom: -100px;
    right: -100px;
    pointer-events: none;
    z-index: 0;
  }

  .grid-lines {
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
    z-index: 0;
  }

  /* NAV */
  .sm-nav {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 48px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    backdrop-filter: blur(10px);
  }

  .sm-logo {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 20px;
    background: linear-gradient(135deg, #a78bfa, #60a5fa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .sm-nav-right {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: rgba(255,255,255,0.3);
  }

  .sm-nav-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #a78bfa;
  }

  /* MAIN */
  .sm-main {
    position: relative;
    z-index: 10;
    max-width: 860px;
    margin: 0 auto;
    padding: 48px 24px 80px;
    animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* HEADER */
  .sm-header {
    margin-bottom: 40px;
  }

  .sm-eyebrow {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: #a78bfa;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .sm-eyebrow-line {
    width: 24px;
    height: 1px;
    background: #a78bfa;
  }

  .sm-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(32px, 4vw, 48px);
    font-weight: 800;
    letter-spacing: -1.5px;
    color: #f0eeff;
    margin-bottom: 6px;
    line-height: 1.1;
  }

  .sm-subtitle {
    font-size: 15px;
    color: rgba(232,230,240,0.35);
    font-weight: 300;
    font-style: italic;
  }

  /* SCORE HERO */
  .sm-score-hero {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1px;
    background: rgba(255,255,255,0.07);
    border-radius: 20px;
    overflow: hidden;
    margin-bottom: 32px;
    border: 1px solid rgba(255,255,255,0.07);
  }

  .sm-score-cell {
    background: rgba(255,255,255,0.025);
    padding: 32px 28px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(10px);
  }

  .sm-score-cell.main {
    background: rgba(124,58,237,0.08);
    border-right: 1px solid rgba(255,255,255,0.06);
  }

  .sm-score-cell.main::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 30% 50%, rgba(167,139,250,0.08), transparent 70%);
    pointer-events: none;
  }

  .sm-cell-label {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
  }

  .sm-cell-value {
    font-family: 'Syne', sans-serif;
    font-size: 52px;
    font-weight: 800;
    letter-spacing: -2px;
    line-height: 1;
  }

  .sm-cell-value.pass { color: #86efac; }
  .sm-cell-value.fail { color: #fca5a5; }
  .sm-cell-value.neutral {
    background: linear-gradient(135deg, #a78bfa, #60a5fa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .sm-cell-sub {
    font-size: 13px;
    color: rgba(255,255,255,0.4);
    font-weight: 300;
  }

  .sm-verdict-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 500;
    padding: 5px 14px;
    border-radius: 20px;
    margin-top: 4px;
    width: fit-content;
  }

  .sm-verdict-badge.pass {
    background: rgba(34,197,94,0.1);
    border: 1px solid rgba(34,197,94,0.25);
    color: #86efac;
  }

  .sm-verdict-badge.fail {
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.25);
    color: #fca5a5;
  }

  /* WEAK TOPICS */
  .sm-section {
    margin-bottom: 28px;
  }

  .sm-section-title {
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.35);
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .sm-section-title::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,0.06);
  }

  .sm-weak-box {
    background: rgba(251,146,60,0.05);
    border: 1px solid rgba(251,146,60,0.15);
    border-radius: 14px;
    padding: 18px 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .sm-weak-label {
    font-size: 13px;
    color: rgba(251,146,60,0.7);
    font-weight: 500;
    white-space: nowrap;
  }

  .sm-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .sm-tag {
    font-size: 12px;
    padding: 4px 14px;
    border-radius: 20px;
    background: rgba(251,146,60,0.12);
    color: #fdba74;
    border: 1px solid rgba(251,146,60,0.2);
    font-weight: 500;
  }

  /* BREAKDOWN */
  .sm-breakdown {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .sm-card {
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    overflow: hidden;
    transition: border-color 0.2s;
  }

  .sm-card:hover { border-color: rgba(255,255,255,0.12); }

  .sm-card.pass { border-left: 3px solid rgba(34,197,94,0.5); }
  .sm-card.fail { border-left: 3px solid rgba(239,68,68,0.4); }

  .sm-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    cursor: pointer;
    user-select: none;
  }

  .sm-card-header:hover { background: rgba(255,255,255,0.02); }

  .sm-card-header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .sm-q-num {
    font-family: 'Syne', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    color: rgba(255,255,255,0.3);
    text-transform: uppercase;
  }

  .sm-q-preview {
    font-size: 14px;
    color: rgba(232,230,240,0.75);
    font-weight: 400;
    max-width: 480px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sm-card-header-right {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  .sm-result-badge {
    font-size: 12px;
    font-weight: 500;
    padding: 3px 10px;
    border-radius: 20px;
  }

  .sm-result-badge.pass {
    background: rgba(34,197,94,0.1);
    color: #86efac;
    border: 1px solid rgba(34,197,94,0.2);
  }

  .sm-result-badge.fail {
    background: rgba(239,68,68,0.1);
    color: #fca5a5;
    border: 1px solid rgba(239,68,68,0.2);
  }

  .sm-chevron {
    font-size: 12px;
    color: rgba(255,255,255,0.2);
    transition: transform 0.2s;
  }

  .sm-chevron.open { transform: rotate(180deg); }

  .sm-card-body {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    animation: fadeUp 0.25s ease both;
  }

  .sm-field-label {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.25);
    margin-bottom: 5px;
  }

  .sm-field-text {
    font-size: 14px;
    color: rgba(232,230,240,0.7);
    line-height: 1.6;
  }

  .sm-field-text.question {
    color: rgba(232,230,240,0.9);
    font-weight: 500;
    font-size: 15px;
  }

  .sm-field-text.feedback {
    color: rgba(232,230,240,0.65);
  }

  .sm-card-footer {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    padding-top: 4px;
  }

  .sm-footer-tag {
    font-size: 11px;
    padding: 3px 10px;
    border-radius: 20px;
    background: rgba(167,139,250,0.08);
    color: #c4b5fd;
    border: 1px solid rgba(167,139,250,0.15);
  }

  /* CTA */
  .sm-cta {
    margin-top: 40px;
    display: flex;
    gap: 14px;
    align-items: center;
  }

  .sm-btn-primary {
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    padding: 14px 32px;
    border: none;
    border-radius: 12px;
    background: linear-gradient(135deg, #7c3aed, #3b82f6);
    color: white;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 20px rgba(99,57,210,0.35);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .sm-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(99,57,210,0.5);
  }

  .sm-btn-secondary {
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    padding: 14px 24px;
    border-radius: 12px;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.4);
    cursor: pointer;
    transition: all 0.2s;
  }

  .sm-btn-secondary:hover {
    border-color: rgba(255,255,255,0.2);
    color: rgba(255,255,255,0.6);
    background: rgba(255,255,255,0.03);
  }

  /* Loading / error */
  .sm-loading {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #07070a;
    font-family: 'DM Sans', sans-serif;
    flex-direction: column;
    gap: 16px;
  }

  .sm-loading-spinner {
    width: 36px;
    height: 36px;
    border: 2px solid rgba(167,139,250,0.2);
    border-top-color: #a78bfa;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .sm-loading-text {
    font-size: 14px;
    color: rgba(255,255,255,0.3);
    letter-spacing: 0.5px;
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
`;

function QuestionCard({ item, index }) {
  const [open, setOpen] = useState(false);
  const isPassed = item.isCorrect;

  return (
    <div className={`sm-card ${isPassed ? "pass" : "fail"}`}>
      <div className="sm-card-header" onClick={() => setOpen(o => !o)}>
        <div className="sm-card-header-left">
          <span className="sm-q-num">Q{item.number}</span>
          <span className="sm-q-preview">{item.question}</span>
        </div>
        <div className="sm-card-header-right">
          <span className={`sm-result-badge ${isPassed ? "pass" : "fail"}`}>
            {isPassed ? "✓ Correct" : "✗ Improve"}
          </span>
          <span className={`sm-chevron ${open ? "open" : ""}`}>▼</span>
        </div>
      </div>

      {open && (
        <div className="sm-card-body">
          <div>
            <div className="sm-field-label">Question</div>
            <div className="sm-field-text question">{item.question}</div>
          </div>
          <div>
            <div className="sm-field-label">Your Answer</div>
            <div className="sm-field-text">{item.answer}</div>
          </div>
          <div>
            <div className="sm-field-label">AI Feedback</div>
            <div className="sm-field-text feedback">{item.feedback}</div>
          </div>
          {(item.weakTopic || item.emotion) && (
            <div className="sm-card-footer">
              {item.weakTopic && <span className="sm-footer-tag">⚠ {item.weakTopic}</span>}
              {item.emotion && <span className="sm-footer-tag">🎭 {item.emotion}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Summary({ interviewId, onRestart }) {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getSummary(interviewId)
      .then(setSummary)
      .catch(err => setError(err.message));
  }, []);

  if (error) return (
    <div className="sm-loading">
      <style>{styles}</style>
      <div style={{color:"#fca5a5", fontSize:14}}>⚠ {error}</div>
    </div>
  );

  if (!summary) return (
    <div className="sm-loading">
      <style>{styles}</style>
      <div className="sm-loading-spinner" />
      <div className="sm-loading-text">Loading your results...</div>
    </div>
  );

  const isPassed = summary.score >= 60;

  return (
    <>
      <style>{styles}</style>
      <div className="sm-root">
        <div className="grid-lines" />

        {/* NAV */}
        <nav className="sm-nav">
          <div className="sm-logo">persona.ai</div>
          <div className="sm-nav-right">
            <div className="sm-nav-dot" />
            Interview Complete
          </div>
        </nav>

        <main className="sm-main">

          {/* HEADER */}
          <div className="sm-header">
            <div className="sm-eyebrow">
              <span className="sm-eyebrow-line" />
              Session Report
            </div>
            <h1 className="sm-title">Your Results</h1>
            <p className="sm-subtitle">Here's a full breakdown of your interview performance</p>
          </div>

          {/* SCORE HERO */}
          <div className="sm-score-hero">
            <div className="sm-score-cell main">
              <div className="sm-cell-label">Overall Score</div>
              <div className={`sm-cell-value ${isPassed ? "pass" : "fail"}`}>
                {summary.score}%
              </div>
              <div className={`sm-verdict-badge ${isPassed ? "pass" : "fail"}`}>
                {isPassed ? "✓ Pass" : "✗ Needs Improvement"}
              </div>
            </div>

            <div className="sm-score-cell" style={{borderRight:"1px solid rgba(255,255,255,0.06)"}}>
              <div className="sm-cell-label">Correct Answers</div>
              <div className="sm-cell-value neutral">
                {summary.correctAnswers}/{summary.totalQuestions}
              </div>
              <div className="sm-cell-sub">questions answered correctly</div>
            </div>

            <div className="sm-score-cell">
              <div className="sm-cell-label">Weak Areas</div>
              <div className="sm-cell-value neutral">
                {summary.weakTopics.length}
              </div>
              <div className="sm-cell-sub">
                {summary.weakTopics.length === 0 ? "No weak areas found!" : "topics to review"}
              </div>
            </div>
          </div>

          {/* WEAK TOPICS */}
          {summary.weakTopics.length > 0 && (
            <div className="sm-section">
              <div className="sm-section-title">Topics to Improve</div>
              <div className="sm-weak-box">
                <span className="sm-weak-label">⚠ Focus on:</span>
                <div className="sm-tags">
                  {summary.weakTopics.map((t, i) => (
                    <span key={i} className="sm-tag">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* BREAKDOWN */}
          <div className="sm-section">
            <div className="sm-section-title">Question Breakdown</div>
            <div className="sm-breakdown">
              {summary.breakdown.map((item, i) => (
                <QuestionCard key={i} item={item} index={i} />
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="sm-cta">
            <button className="sm-btn-primary" onClick={onRestart}>
              Start New Interview →
            </button>
            <button className="sm-btn-secondary" onClick={() => window.print()}>
              Export Report
            </button>
          </div>

        </main>
      </div>
    </>
  );
}
