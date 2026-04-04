import { useEffect, useState } from "react";
import api from "../services/api";

/* ── SVG DOODLES (matching StartInterview) ── */
const DoodleCircle = ({ size = 120, opacity = 0.12, className = "", style = {} }) => (
  <svg className={`doodle ${className}`} width={size} height={size} viewBox="0 0 100 100" fill="none" style={style}>
    <circle cx="50" cy="50" r="44" stroke="white" strokeWidth="1" strokeDasharray="6 4" opacity={opacity} />
    <circle cx="50" cy="50" r="32" stroke="white" strokeWidth="0.6" opacity={opacity * 0.7} />
    <circle cx="50" cy="50" r="6" stroke="white" strokeWidth="1" opacity={opacity * 1.2} />
    <line x1="6" y1="50" x2="94" y2="50" stroke="white" strokeWidth="0.5" opacity={opacity * 0.5} />
    <line x1="50" y1="6" x2="50" y2="94" stroke="white" strokeWidth="0.5" opacity={opacity * 0.5} />
  </svg>
);
const DoodleGrid = ({ className = "", style = {} }) => (
  <svg className={`doodle ${className}`} width="200" height="200" viewBox="0 0 200 200" fill="none" style={style}>
    {[0,1,2,3,4].map(row => [0,1,2,3,4].map(col => (
      <rect key={`${row}-${col}`} x={col*40+4} y={row*40+4} width="32" height="32"
        stroke="white" strokeWidth="0.5" opacity="0.07" rx="4" />
    )))}
    {[0,1,2,3,4].map(row => [0,1,2,3,4].map(col => (
      <circle key={`d-${row}-${col}`} cx={col*40+20} cy={row*40+20} r="1.5" fill="white" opacity="0.15" />
    )))}
  </svg>
);
const DoodleArrow = ({ className = "", style = {} }) => (
  <svg className={`doodle ${className}`} width="80" height="80" viewBox="0 0 80 80" fill="none" style={style}>
    <path d="M10 40 Q40 10 70 40" stroke="white" strokeWidth="1" strokeDasharray="4 3" opacity="0.2" fill="none" />
    <path d="M60 30 L70 40 L60 50" stroke="white" strokeWidth="1" opacity="0.2" fill="none" />
  </svg>
);
const DoodleCross = ({ size = 40, className = "", style = {} }) => (
  <svg className={`doodle ${className}`} width={size} height={size} viewBox="0 0 40 40" fill="none" style={style}>
    <line x1="0" y1="0" x2="40" y2="40" stroke="white" strokeWidth="0.7" opacity="0.18" />
    <line x1="40" y1="0" x2="0" y2="40" stroke="white" strokeWidth="0.7" opacity="0.18" />
    <circle cx="20" cy="20" r="3" stroke="white" strokeWidth="0.6" opacity="0.2" fill="none" />
  </svg>
);
const DoodleWave = ({ className = "", style = {} }) => (
  <svg className={`doodle ${className}`} width="300" height="60" viewBox="0 0 300 60" fill="none" style={style}>
    <path d="M0 30 Q37.5 5 75 30 Q112.5 55 150 30 Q187.5 5 225 30 Q262.5 55 300 30" stroke="white" strokeWidth="0.8" opacity="0.1" fill="none" />
    <path d="M0 30 Q37.5 10 75 30 Q112.5 50 150 30 Q187.5 10 225 30 Q262.5 50 300 30" stroke="white" strokeWidth="0.4" opacity="0.06" fill="none" strokeDasharray="3 4" />
  </svg>
);
const DoodleHex = ({ className = "", style = {} }) => (
  <svg className={`doodle ${className}`} width="90" height="100" viewBox="0 0 90 100" fill="none" style={style}>
    <polygon points="45,4 82,25 82,75 45,96 8,75 8,25" stroke="white" strokeWidth="0.8" opacity="0.12" fill="none" />
    <polygon points="45,18 70,32 70,68 45,82 20,68 20,32" stroke="white" strokeWidth="0.5" opacity="0.07" fill="none" />
    <circle cx="45" cy="50" r="8" stroke="white" strokeWidth="0.5" opacity="0.1" fill="none" />
  </svg>
);
const DoodleDots = ({ className = "", style = {} }) => (
  <svg className={`doodle ${className}`} width="120" height="60" viewBox="0 0 120 60" fill="none" style={style}>
    {[0,1,2,3,4,5].map(col => [0,1,2].map(row => (
      <circle key={`${col}-${row}`} cx={col*20+10} cy={row*20+10}
        r="1.5" fill="white" opacity={0.05 + (col+row)*0.02} />
    )))}
  </svg>
);

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,700;12..96,800&display=swap');

:root {
  --bg:  #000;
  --c1:  #0d0d0d;
  --bdr: rgba(255,255,255,0.07);
  --b2:  rgba(255,255,255,0.13);
  --w:   #fff;
  --d:   rgba(255,255,255,0.36);
  --m:   rgba(255,255,255,0.60);
  --a:   #7DF9C2;
  --a2:  #4F8EF7;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

/* ── NOISE OVERLAY ── */
.sm-root::before {
  content: '';
  position: fixed; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-size: 180px 180px;
  pointer-events: none; z-index: 0;
  opacity: 0.028; mix-blend-mode: overlay;
}

.sm-root {
  min-height: 100vh;
  background: var(--bg);
  font-family: 'Bricolage Grotesque', sans-serif;
  color: var(--w);
  position: relative;
  overflow-x: hidden;
}

.doodle { pointer-events: none; flex-shrink: 0; }

/* ══════════════════════════════
   NAV
══════════════════════════════ */
.sm-nav {
  position: sticky; top: 0; z-index: 100;
  display: flex; align-items: center;
  justify-content: space-between;
  padding: 0 5vw; height: 52px;
  background: rgba(0,0,0,0.92);
  border-bottom: 1px solid var(--bdr);
  backdrop-filter: blur(20px);
}

.sm-logo {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 20px; letter-spacing: 5px;
  color: var(--w); text-transform: uppercase;
}

.sm-nav-right {
  display: flex; align-items: center;
  gap: 10px; font-size: 11px;
  font-weight: 700; letter-spacing: 2px;
  text-transform: uppercase; color: var(--d);
}

.sm-nav-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--a);
  box-shadow: 0 0 8px rgba(125,249,194,0.5);
  animation: navDotPulse 2s ease-in-out infinite;
}
@keyframes navDotPulse {
  0%,100% { opacity: 1; } 50% { opacity: 0.4; }
}

/* ══════════════════════════════
   MAIN
══════════════════════════════ */
.sm-main {
  position: relative; z-index: 1;
  max-width: 900px; margin: 0 auto;
  padding: 56px 5vw 96px;
  animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ══════════════════════════════
   HEADER
══════════════════════════════ */
.sm-header { margin-bottom: 48px; position: relative; }

.sm-eyebrow {
  font-size: 10px; font-weight: 700; letter-spacing: 4px;
  text-transform: uppercase; color: var(--a);
  margin-bottom: 14px;
  display: flex; align-items: center; gap: 12px;
}
.sm-eyebrow-line {
  width: 32px; height: 1px; background: var(--a);
}

.sm-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(52px,7vw,96px);
  letter-spacing: 1.5px; line-height: 0.91;
  color: var(--w); margin-bottom: 14px;
}

.sm-subtitle {
  font-size: 15px; font-weight: 300;
  line-height: 1.65; color: var(--m);
  font-style: italic;
}

/* Header doodle cluster */
.sm-header-doodles {
  position: absolute; right: 0; top: 0;
  display: flex; gap: 12px; align-items: center;
  opacity: 0.6;
}

/* ══════════════════════════════
   SCORE HERO — 3 bento cells
══════════════════════════════ */
.sm-score-hero {
  display: grid; grid-template-columns: 1fr 1fr 1fr;
  gap: 10px; margin-bottom: 40px;
}

.sm-score-cell {
  background: var(--c1);
  border: 1px solid var(--bdr);
  border-radius: 14px;
  padding: 32px 28px;
  display: flex; flex-direction: column; gap: 8px;
  position: relative; overflow: hidden;
  transition: border-color 0.25s;
}
.sm-score-cell:hover { border-color: var(--b2); }

.sm-score-cell.main {
  background: linear-gradient(135deg, rgba(125,249,194,0.04) 0%, var(--c1) 100%);
  border-color: rgba(125,249,194,0.15);
}
.sm-score-cell.main::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(circle at 25% 50%, rgba(125,249,194,0.06), transparent 65%);
  pointer-events: none;
}

.sm-cell-label {
  font-size: 10px; font-weight: 700; letter-spacing: 3px;
  text-transform: uppercase; color: var(--d);
}

.sm-cell-value {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(48px,5.5vw,72px);
  letter-spacing: -1px; line-height: 1;
}
.sm-cell-value.pass   { color: var(--a); }
.sm-cell-value.fail   { color: #fca5a5; }
.sm-cell-value.neutral { color: var(--w); }

.sm-cell-sub {
  font-size: 12px; font-weight: 300;
  color: var(--d); line-height: 1.5;
}

.sm-verdict-badge {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 11px; font-weight: 700;
  letter-spacing: 1.5px; text-transform: uppercase;
  padding: 5px 13px; border-radius: 2px;
  margin-top: 4px; width: fit-content;
}
.sm-verdict-badge.pass {
  background: rgba(125,249,194,0.08);
  border: 1px solid rgba(125,249,194,0.2);
  color: var(--a);
}
.sm-verdict-badge.fail {
  background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.2);
  color: #fca5a5;
}

/* ══════════════════════════════
   SECTIONS
══════════════════════════════ */
.sm-section { margin-bottom: 32px; }

.sm-section-title {
  font-size: 10px; font-weight: 700; letter-spacing: 4px;
  text-transform: uppercase; color: var(--d);
  margin-bottom: 16px;
  display: flex; align-items: center; gap: 14px;
}
.sm-section-title::after {
  content: ''; flex: 1; height: 1px; background: var(--bdr);
}

/* Weak topics box */
.sm-weak-box {
  background: rgba(125,249,194,0.03);
  border: 1px solid rgba(125,249,194,0.12);
  border-left: 2px solid var(--a);
  border-radius: 0 2px 2px 0;
  padding: 18px 20px;
  display: flex; align-items: center;
  gap: 16px; flex-wrap: wrap;
}
.sm-weak-label {
  font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
  text-transform: uppercase; color: var(--a);
  white-space: nowrap;
}
.sm-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.sm-tag {
  font-size: 11px; font-weight: 600; letter-spacing: 1px;
  padding: 4px 13px; border-radius: 2px;
  background: rgba(125,249,194,0.06);
  color: var(--a);
  border: 1px solid rgba(125,249,194,0.18);
}

/* ══════════════════════════════
   QUESTION BREAKDOWN CARDS
══════════════════════════════ */
.sm-breakdown { display: flex; flex-direction: column; gap: 10px; }

.sm-card {
  background: var(--c1);
  border: 1px solid var(--bdr);
  border-radius: 14px; overflow: hidden;
  transition: border-color 0.2s;
}
.sm-card:hover { border-color: var(--b2); }
.sm-card.pass { border-left: 2px solid rgba(125,249,194,0.4); }
.sm-card.fail { border-left: 2px solid rgba(239,68,68,0.35); }

.sm-card-header {
  display: flex; align-items: center;
  justify-content: space-between;
  padding: 16px 22px;
  border-bottom: 1px solid transparent;
  cursor: pointer; user-select: none;
  transition: background 0.15s;
}
.sm-card-header:hover { background: rgba(255,255,255,0.02); }
.sm-card-header.open  { border-bottom-color: var(--bdr); }

.sm-card-header-left {
  display: flex; align-items: center; gap: 14px;
}
.sm-q-num {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 13px; letter-spacing: 2px;
  color: var(--d); text-transform: uppercase;
  flex-shrink: 0;
}
.sm-q-preview {
  font-size: 14px; color: var(--m); font-weight: 400;
  max-width: 480px; overflow: hidden;
  text-overflow: ellipsis; white-space: nowrap;
}

.sm-card-header-right {
  display: flex; align-items: center; gap: 10px; flex-shrink: 0;
}
.sm-result-badge {
  font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
  text-transform: uppercase; padding: 4px 11px; border-radius: 2px;
}
.sm-result-badge.pass {
  background: rgba(125,249,194,0.08); color: var(--a);
  border: 1px solid rgba(125,249,194,0.2);
}
.sm-result-badge.fail {
  background: rgba(239,68,68,0.08); color: #fca5a5;
  border: 1px solid rgba(239,68,68,0.2);
}

.sm-chevron {
  font-size: 11px; color: var(--d);
  transition: transform 0.2s;
}
.sm-chevron.open { transform: rotate(180deg); }

.sm-card-body {
  padding: 22px; display: flex; flex-direction: column; gap: 16px;
  animation: fadeUp 0.22s ease both;
}

.sm-field-label {
  font-size: 10px; font-weight: 700; letter-spacing: 3px;
  text-transform: uppercase; color: var(--d); margin-bottom: 6px;
}
.sm-field-text {
  font-size: 14px; color: var(--m); line-height: 1.65; font-weight: 300;
}
.sm-field-text.question {
  color: var(--w); font-weight: 500; font-size: 15px;
}
.sm-field-text.feedback { color: var(--d); }

.sm-card-footer {
  display: flex; gap: 8px; flex-wrap: wrap; padding-top: 4px;
  border-top: 1px solid var(--bdr); padding-top: 12px;
}
.sm-footer-tag {
  font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
  text-transform: uppercase; padding: 4px 11px; border-radius: 2px;
  background: rgba(125,249,194,0.06); color: var(--a);
  border: 1px solid rgba(125,249,194,0.15);
}

/* ══════════════════════════════
   DRAW LINE
══════════════════════════════ */
.sm-draw-line {
  height: 1px; margin: 40px 0;
  background: linear-gradient(90deg, var(--a) 0%, rgba(79,142,247,0.4) 50%, transparent 100%);
  opacity: 0.4;
}

/* ══════════════════════════════
   CTA
══════════════════════════════ */
.sm-cta {
  margin-top: 48px; display: flex; gap: 14px; align-items: center;
}

.sm-btn-primary {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 16px; letter-spacing: 4px;
  padding: 14px 36px; border: none; border-radius: 2px;
  background: var(--w); color: var(--bg);
  cursor: pointer; transition: all 0.2s;
  box-shadow: 0 4px 24px rgba(255,255,255,0.08);
  display: flex; align-items: center; gap: 8px;
}
.sm-btn-primary:hover {
  background: var(--a); color: var(--bg);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(125,249,194,0.35);
}

.sm-btn-secondary {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 13px; font-weight: 600; letter-spacing: 1px;
  text-transform: uppercase;
  padding: 14px 24px; border-radius: 2px;
  background: transparent;
  border: 1px solid var(--bdr); color: var(--d);
  cursor: pointer; transition: all 0.2s;
}
.sm-btn-secondary:hover {
  border-color: var(--b2); color: var(--m);
  background: rgba(255,255,255,0.03);
}

/* ══════════════════════════════
   LOADING / ERROR
══════════════════════════════ */
.sm-loading {
  min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  background: var(--bg);
  font-family: 'Bricolage Grotesque', sans-serif;
  flex-direction: column; gap: 16px;
}
.sm-loading-spinner {
  width: 32px; height: 32px;
  border: 2px solid rgba(125,249,194,0.15);
  border-top-color: var(--a);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.sm-loading-text {
  font-size: 13px; font-weight: 500;
  letter-spacing: 2px; text-transform: uppercase;
  color: var(--d);
}

/* Scrollbar */
::-webkit-scrollbar { width: 3px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--bdr); border-radius: 2px; }
`;

function QuestionCard({ item, index }) {
  const [open, setOpen] = useState(false);
  const isPassed = item.isCorrect;

  return (
    <div className={`sm-card ${isPassed ? "pass" : "fail"}`}>
      <div
        className={`sm-card-header ${open ? "open" : ""}`}
        onClick={() => setOpen(o => !o)}
      >
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
              {item.emotion   && <span className="sm-footer-tag">🎭 {item.emotion}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Summary({ interviewId, onRestart }) {
  const [summary, setSummary] = useState(null);
  const [error, setError]     = useState(null);

  useEffect(() => {
    api.getSummary(interviewId)
      .then(setSummary)
      .catch(err => setError(err.message));
  }, []);

  if (error) return (
    <div className="sm-loading">
      <style>{CSS}</style>
      <div style={{ color:"#fca5a5", fontSize:13, letterSpacing:"1px", textTransform:"uppercase" }}>
        ⚠ {error}
      </div>
    </div>
  );

  if (!summary) return (
    <div className="sm-loading">
      <style>{CSS}</style>
      <div className="sm-loading-spinner" />
      <div className="sm-loading-text">Loading your results...</div>
    </div>
  );

  const isPassed = summary.score >= 60;

  return (
    <>
      <style>{CSS}</style>
      <div className="sm-root">

        {/* ── NAV ── */}
        <nav className="sm-nav">
          <div className="sm-logo">persona.ai</div>
          <div className="sm-nav-right">
            <div className="sm-nav-dot" />
            Interview Complete
          </div>
        </nav>

        <main className="sm-main">

          {/* ── HEADER ── */}
          <div className="sm-header">
            <div className="sm-eyebrow">
              <span className="sm-eyebrow-line" />
              Session Report
            </div>
            <h1 className="sm-title">Your Results.</h1>
            <p className="sm-subtitle">Full breakdown of your interview performance with Payton.</p>

            {/* Header doodle cluster */}
            <div className="sm-header-doodles">
              <DoodleCircle size={80} opacity={0.1} />
              <DoodleHex style={{ opacity:0.5 }} />
              <DoodleCross size={32} />
            </div>
          </div>

          {/* ── SCORE HERO — 3 bento cells ── */}
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

            <div className="sm-score-cell">
              <div className="sm-cell-label">Correct Answers</div>
              <div className="sm-cell-value neutral">
                {summary.correctAnswers}/{summary.totalQuestions}
              </div>
              <div className="sm-cell-sub">questions answered correctly</div>
              {/* subtle doodle */}
              <DoodleDots style={{ position:"absolute", bottom:8, right:8, opacity:0.5 }} />
            </div>

            <div className="sm-score-cell">
              <div className="sm-cell-label">Weak Areas</div>
              <div className="sm-cell-value neutral">{summary.weakTopics.length}</div>
              <div className="sm-cell-sub">
                {summary.weakTopics.length === 0 ? "No weak areas found!" : "topics to review"}
              </div>
              <DoodleCircle size={60} opacity={0.08}
                style={{ position:"absolute", bottom:-10, right:-10 }} />
            </div>

          </div>

          {/* ── WEAK TOPICS ── */}
          {summary.weakTopics.length > 0 && (
            <div className="sm-section">
              <div className="sm-section-title">Topics to Improve</div>
              <div className="sm-weak-box">
                <span className="sm-weak-label">⚠ Focus on</span>
                <div className="sm-tags">
                  {summary.weakTopics.map((t, i) => (
                    <span key={i} className="sm-tag">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Doodle row between sections */}
          <div style={{ display:"flex", gap:20, alignItems:"center", marginBottom:32, opacity:0.35 }}>
            <DoodleWave style={{ width:200, height:30 }} />
            <DoodleDots />
            <DoodleArrow />
          </div>

          {/* ── QUESTION BREAKDOWN ── */}
          <div className="sm-section">
            <div className="sm-section-title">Question Breakdown</div>
            <div className="sm-breakdown">
              {summary.breakdown.map((item, i) => (
                <QuestionCard key={i} item={item} index={i} />
              ))}
            </div>
          </div>

          {/* Draw line */}
          <div className="sm-draw-line" />

          {/* ── CTA ── */}
          <div className="sm-cta">
            <button className="sm-btn-primary" onClick={onRestart}>
              Start New Interview →
            </button>
            <button className="sm-btn-secondary" onClick={() => window.print()}>
              Export Report
            </button>
          </div>

          {/* Bottom doodle row */}
          <div style={{ display:"flex", gap:20, alignItems:"center", marginTop:56, opacity:0.25 }}>
            <DoodleGrid style={{ width:80, height:80 }} />
            <DoodleCircle size={56} opacity={0.5} />
            <DoodleCross size={30} />
            <DoodleHex style={{ opacity:0.7 }} />
            <DoodleDots />
          </div>

        </main>
      </div>
    </>
  );
}
