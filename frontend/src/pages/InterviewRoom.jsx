import { useEffect, useState, useRef, useCallback } from "react";
import api from "../services/api";

const DoodleCircle = ({ size = 120, opacity = 0.12, className = "", style = {} }) => (
  <svg className={`doodle ${className}`} width={size} height={size} viewBox="0 0 100 100" fill="none" style={style}>
    <circle cx="50" cy="50" r="44" stroke="white" strokeWidth="1" strokeDasharray="6 4" opacity={opacity} />
    <circle cx="50" cy="50" r="32" stroke="white" strokeWidth="0.6" opacity={opacity * 0.7} />
    <circle cx="50" cy="50" r="6" stroke="white" strokeWidth="1" opacity={opacity * 1.2} />
    <line x1="6" y1="50" x2="94" y2="50" stroke="white" strokeWidth="0.5" opacity={opacity * 0.5} />
    <line x1="50" y1="6" x2="50" y2="94" stroke="white" strokeWidth="0.5" opacity={opacity * 0.5} />
  </svg>
);
const DoodleCross = ({ size = 40, className = "", style = {} }) => (
  <svg className={`doodle ${className}`} width={size} height={size} viewBox="0 0 40 40" fill="none" style={style}>
    <line x1="0" y1="0" x2="40" y2="40" stroke="white" strokeWidth="0.7" opacity="0.18" />
    <line x1="40" y1="0" x2="0" y2="40" stroke="white" strokeWidth="0.7" opacity="0.18" />
    <circle cx="20" cy="20" r="3" stroke="white" strokeWidth="0.6" opacity="0.2" fill="none" />
  </svg>
);
const DoodleCorner = ({ className = "", style = {} }) => (
  <svg className={`doodle ${className}`} width="80" height="80" viewBox="0 0 80 80" fill="none" style={style}>
    <path d="M4 60 L4 4 L60 4" stroke="white" strokeWidth="1" opacity="0.15" fill="none" />
    <path d="M4 76 L4 4 L76 4" stroke="white" strokeWidth="0.4" opacity="0.07" fill="none" strokeDasharray="3 4" />
    <circle cx="4" cy="4" r="3" fill="white" opacity="0.18" />
  </svg>
);
const DoodleWave = ({ className = "", style = {} }) => (
  <svg className={`doodle ${className}`} width="300" height="60" viewBox="0 0 300 60" fill="none" style={style}>
    <path d="M0 30 Q37.5 5 75 30 Q112.5 55 150 30 Q187.5 5 225 30 Q262.5 55 300 30" stroke="white" strokeWidth="0.8" opacity="0.1" fill="none" />
    <path d="M0 30 Q37.5 10 75 30 Q112.5 50 150 30 Q187.5 10 225 30 Q262.5 50 300 30" stroke="white" strokeWidth="0.4" opacity="0.06" fill="none" strokeDasharray="3 4" />
  </svg>
);
const DoodleGrid = ({ className = "", style = {} }) => (
  <svg className={`doodle ${className}`} width="120" height="120" viewBox="0 0 120 120" fill="none" style={style}>
    {[0,1,2].map(row => [0,1,2].map(col => (
      <rect key={`${row}-${col}`} x={col*40+4} y={row*40+4} width="32" height="32" stroke="white" strokeWidth="0.5" opacity="0.08" rx="3" />
    )))}
    {[0,1,2].map(row => [0,1,2].map(col => (
      <circle key={`d-${row}-${col}`} cx={col*40+20} cy={row*40+20} r="1.5" fill="white" opacity="0.14" />
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

.ir-root::before {
  content: '';
  position: fixed; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-size: 180px 180px;
  pointer-events: none; z-index: 9999;
  opacity: 0.028; mix-blend-mode: overlay;
}

.ir-root {
  width: 100vw; height: 100vh;
  background: var(--bg);
  font-family: 'Bricolage Grotesque', sans-serif;
  color: var(--w);
  display: flex; flex-direction: column;
  overflow: hidden; position: relative;
}

.doodle { pointer-events: none; flex-shrink: 0; }

.ir-topbar {
  height: 52px;
  background: rgba(0,0,0,0.92);
  border-bottom: 1px solid var(--bdr);
  display: flex; align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  flex-shrink: 0; z-index: 100;
  backdrop-filter: blur(20px);
}
.ir-logo {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 20px; letter-spacing: 5px;
  color: var(--w); text-transform: uppercase;
}
.ir-topbar-center { display: flex; align-items: center; gap: 14px; }
.ir-rec-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #ef4444;
  animation: recPulse 1.5s ease-in-out infinite;
}
@keyframes recPulse {
  0%,100% { opacity: 1; box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
  50%      { opacity: 0.5; box-shadow: 0 0 0 4px rgba(239,68,68,0); }
}
.ir-timer {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 18px; letter-spacing: 3px; color: var(--m);
}
.ir-qbadge {
  font-size: 10px; font-weight: 700; letter-spacing: 2px;
  text-transform: uppercase; color: var(--a);
  background: rgba(125,249,194,0.08);
  border: 1px solid rgba(125,249,194,0.2);
  padding: 4px 12px; border-radius: 2px;
}
.ir-end-btn {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
  text-transform: uppercase;
  color: rgba(239,68,68,0.75);
  background: rgba(239,68,68,0.07);
  border: 1px solid rgba(239,68,68,0.18);
  border-radius: 2px; padding: 7px 18px;
  cursor: pointer; transition: all 0.2s;
}
.ir-end-btn:hover {
  background: rgba(239,68,68,0.14);
  border-color: rgba(239,68,68,0.35);
  color: #fca5a5;
}

.ir-body { flex: 1; display: flex; overflow: hidden; }

.ir-resizer {
  width: 4px; background: var(--bdr);
  cursor: col-resize; flex-shrink: 0;
  position: relative; transition: background 0.2s; z-index: 50;
}
.ir-resizer:hover, .ir-resizer.dragging { background: var(--a); }
.ir-resizer::after {
  content: ''; position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 2px; height: 40px;
  background: rgba(125,249,194,0.15); border-radius: 2px;
}

.ir-left {
  position: relative; background: var(--c1);
  display: flex; flex-direction: column;
  overflow: hidden; flex-shrink: 0;
}

.ir-payton-area {
  flex: 1; position: relative;
  display: flex; align-items: center;
  justify-content: center; overflow: hidden;
}

.ir-payton-glow {
  position: absolute; width: 500px; height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(125,249,194,0.04) 0%, transparent 65%);
  pointer-events: none;
  animation: glowPulse 5s ease-in-out infinite;
}
@keyframes glowPulse {
  0%,100% { transform: scale(1); opacity: 0.6; }
  50%      { transform: scale(1.12); opacity: 1; }
}

.ir-status-pill {
  position: absolute; top: 18px; left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.75); backdrop-filter: blur(16px);
  border: 1px solid var(--bdr); border-radius: 2px;
  padding: 6px 16px; font-size: 10px; font-weight: 600;
  letter-spacing: 2px; text-transform: uppercase;
  color: var(--d); z-index: 10; white-space: nowrap;
  display: flex; align-items: center; gap: 8px;
}
.ir-status-pill.active { border-color: rgba(125,249,194,0.25); color: var(--a); }
.ir-status-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: currentColor;
  animation: recPulse 1.2s ease-in-out infinite;
}

.ir-speaking {
  position: absolute; bottom: 82px; left: 50%;
  transform: translateX(-50%);
  display: flex; align-items: center; gap: 10px;
  background: rgba(0,0,0,0.75); backdrop-filter: blur(16px);
  border: 1px solid var(--bdr); border-radius: 2px;
  padding: 8px 18px; z-index: 10;
  opacity: 0; transition: opacity 0.3s;
}
.ir-speaking.active { opacity: 1; }
.ir-speaking-bars { display: flex; gap: 3px; align-items: center; }
.ir-speaking-bar {
  width: 2px; background: var(--a); border-radius: 2px;
  animation: barBounce 0.8s ease-in-out infinite;
}
.ir-speaking-bar:nth-child(1) { height: 8px;  animation-delay: 0s; }
.ir-speaking-bar:nth-child(2) { height: 16px; animation-delay: 0.1s; }
.ir-speaking-bar:nth-child(3) { height: 12px; animation-delay: 0.2s; }
.ir-speaking-bar:nth-child(4) { height: 20px; animation-delay: 0.05s; }
.ir-speaking-bar:nth-child(5) { height: 10px; animation-delay: 0.15s; }
@keyframes barBounce {
  0%,100% { transform: scaleY(0.4); }
  50%      { transform: scaleY(1); }
}
.ir-speaking-text {
  font-size: 11px; font-weight: 600; letter-spacing: 1.5px;
  text-transform: uppercase; color: var(--m);
}

.ir-nametag {
  position: absolute; bottom: 82px; left: 18px;
  background: rgba(0,0,0,0.72); backdrop-filter: blur(12px);
  border: 1px solid var(--bdr);
  border-left: 2px solid var(--a);
  border-radius: 0 2px 2px 0;
  padding: 8px 14px; z-index: 10;
}
.ir-nametag-name {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 16px; letter-spacing: 3px; color: var(--w);
}
.ir-nametag-sub {
  font-size: 10px; font-weight: 500; letter-spacing: 1.5px;
  text-transform: uppercase; color: var(--a); margin-top: 1px;
}

.ir-pip {
  position: absolute; top: 18px; right: 18px;
  width: 148px; height: 104px; border-radius: 2px;
  overflow: hidden; border: 1px solid var(--b2);
  background: var(--bg); z-index: 20;
  box-shadow: 0 8px 32px rgba(0,0,0,0.7);
}
.ir-pip video { width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); }
.ir-pip-off {
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 6px;
  background: var(--c1);
}
.ir-pip-off-icon { font-size: 20px; opacity: 0.25; }
.ir-pip-off-text {
  font-size: 9px; font-weight: 600; letter-spacing: 1.5px;
  text-transform: uppercase; color: var(--d);
}
.ir-pip-name {
  position: absolute; bottom: 6px; left: 8px;
  font-size: 10px; font-weight: 700; letter-spacing: 2px;
  text-transform: uppercase; color: var(--w);
  text-shadow: 0 1px 6px rgba(0,0,0,0.9);
}

/* ── CONTROLS BAR — expanded when countdown active ── */
.ir-controls {
  background: rgba(0,0,0,0.9);
  backdrop-filter: blur(20px);
  border-top: 1px solid var(--bdr);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 0; flex-shrink: 0;
}

.ir-controls-buttons {
  height: 70px; width: 100%;
  display: flex; align-items: center;
  justify-content: center; gap: 16px;
}

/* ── COUNTDOWN STRIP — below controls buttons ── */
.ir-countdown-strip {
  width: 100%;
  padding: 10px 24px 14px;
  border-top: 1px solid var(--bdr);
  display: flex; align-items: center; gap: 16px;
}

.ir-countdown-strip-num {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 28px; letter-spacing: 2px;
  color: var(--a); line-height: 1; flex-shrink: 0;
  min-width: 32px;
  animation: cdPulse 1s ease-in-out infinite;
}
@keyframes cdPulse {
  0%,100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.ir-countdown-strip-bar-wrap {
  flex: 1; height: 2px;
  background: rgba(255,255,255,0.07); border-radius: 2px;
  overflow: hidden;
}
.ir-countdown-strip-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--a2), var(--a));
  border-radius: 2px;
  transition: width 1s linear;
}

.ir-countdown-strip-label {
  font-size: 9px; font-weight: 700; letter-spacing: 2px;
  text-transform: uppercase; color: var(--d);
  flex-shrink: 0;
}

.ir-countdown-strip-skip {
  font-size: 9px; font-weight: 700; letter-spacing: 1.5px;
  text-transform: uppercase; color: var(--d);
  background: none; border: 1px solid rgba(255,255,255,0.1);
  padding: 5px 12px; border-radius: 2px; cursor: pointer;
  transition: all 0.2s; flex-shrink: 0;
}
.ir-countdown-strip-skip:hover {
  color: var(--w); border-color: rgba(255,255,255,0.25);
  background: rgba(255,255,255,0.04);
}

.ctrl-btn {
  width: 42px; height: 42px; border-radius: 2px;
  border: 1px solid var(--bdr);
  background: rgba(255,255,255,0.03);
  color: var(--w); font-size: 15px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; position: relative;
}
.ctrl-btn:hover {
  background: rgba(125,249,194,0.07);
  border-color: rgba(125,249,194,0.2);
  transform: translateY(-1px);
}
.ctrl-btn.off {
  background: rgba(239,68,68,0.08);
  border-color: rgba(239,68,68,0.2);
}
.ctrl-btn.off:hover { background: rgba(239,68,68,0.15); }
.ctrl-btn-label {
  position: absolute; bottom: -18px; left: 50%;
  transform: translateX(-50%);
  font-size: 9px; font-weight: 600; letter-spacing: 1px;
  text-transform: uppercase; color: var(--d); white-space: nowrap;
}

.ctrl-btn-end {
  width: 46px; height: 46px; border-radius: 2px;
  border: none; background: #ef4444; color: white;
  font-size: 17px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 4px 20px rgba(239,68,68,0.35);
}
.ctrl-btn-end:hover {
  background: #dc2626; transform: translateY(-1px);
  box-shadow: 0 6px 28px rgba(239,68,68,0.5);
}

.ir-right {
  flex: 1; display: flex; flex-direction: column;
  background: #070605;
  border-left: 1px solid var(--bdr); overflow: hidden;
}
.ir-right-header {
  padding: 18px 26px 14px;
  border-bottom: 1px solid var(--bdr);
  flex-shrink: 0; display: flex;
  align-items: center; justify-content: space-between;
}
.ir-right-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 13px; letter-spacing: 4px;
  text-transform: uppercase; color: var(--d);
}

.ir-question-wrap {
  padding: 22px 26px;
  border-bottom: 1px solid var(--bdr);
  flex-shrink: 0; position: relative;
  background: linear-gradient(180deg, rgba(125,249,194,0.02) 0%, transparent 100%);
}
.ir-question-wrap::before {
  content: ''; position: absolute;
  left: 0; top: 0; bottom: 0; width: 2px;
  background: linear-gradient(180deg, var(--a) 0%, transparent 100%);
}
.ir-question-label {
  font-size: 10px; font-weight: 700; letter-spacing: 3px;
  text-transform: uppercase; color: var(--a);
  margin-bottom: 12px;
  display: flex; align-items: center; gap: 10px;
}
.ir-question-label::after { content: ''; flex: 1; height: 1px; background: var(--bdr); }
.ir-question-text {
  font-size: 16px; line-height: 1.7; color: var(--w); font-weight: 400;
}

.ir-answer-wrap {
  flex: 1; padding: 22px 26px;
  display: flex; flex-direction: column; gap: 14px;
  overflow-y: auto;
}
.ir-answer-wrap::-webkit-scrollbar { width: 3px; }
.ir-answer-wrap::-webkit-scrollbar-track { background: transparent; }
.ir-answer-wrap::-webkit-scrollbar-thumb { background: var(--bdr); border-radius: 2px; }

.ir-answer-label {
  font-size: 10px; font-weight: 700; letter-spacing: 3px;
  text-transform: uppercase; color: var(--d);
  display: flex; align-items: center; gap: 10px;
}
.ir-answer-label::after { content: ''; flex: 1; height: 1px; background: var(--bdr); }

.ir-textarea {
  flex: 1; min-height: 140px;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--bdr); border-radius: 2px;
  padding: 14px 16px;
  font-size: 14px; font-family: 'Bricolage Grotesque', sans-serif;
  font-weight: 400; color: var(--w);
  resize: none; outline: none; line-height: 1.65;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}
.ir-textarea::placeholder { color: var(--d); font-style: italic; }
.ir-textarea:focus {
  border-color: var(--b2);
  box-shadow: 0 0 0 3px rgba(125,249,194,0.05),
              inset 0 1px 0 rgba(125,249,194,0.04);
  background: rgba(125,249,194,0.03);
}
.ir-textarea:disabled { opacity: 0.35; cursor: not-allowed; }

.ir-submit-row {
  display: flex; align-items: center;
  justify-content: space-between; gap: 12px;
}
.ir-char-count {
  font-size: 11px; font-weight: 400;
  letter-spacing: 0.5px; color: var(--d);
}
.ir-submit-btn {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 15px; letter-spacing: 3px;
  padding: 12px 28px; border: none; border-radius: 2px;
  background: var(--w); color: var(--bg);
  cursor: pointer; transition: all 0.2s;
  display: flex; align-items: center; gap: 10px;
  box-shadow: 0 4px 20px rgba(255,255,255,0.08);
}
.ir-submit-btn:hover:not(:disabled) {
  background: var(--a); color: var(--bg);
  transform: translateY(-1px);
  box-shadow: 0 6px 28px rgba(125,249,194,0.3);
}
.ir-submit-btn:disabled { opacity: 0.3; cursor: not-allowed; transform: none; }

.ir-spinner {
  width: 13px; height: 13px;
  border: 2px solid rgba(0,0,0,0.2);
  border-top-color: var(--bg);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.ir-feedback {
  margin: 0 26px 18px;
  background: rgba(125,249,194,0.03);
  border: 1px solid var(--b2);
  border-top: 2px solid var(--a);
  border-radius: 0 0 2px 2px;
  padding: 20px 22px; flex-shrink: 0;
}
.ir-feedback-header {
  display: flex; align-items: center;
  justify-content: space-between; margin-bottom: 12px;
}
.ir-feedback-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 13px; letter-spacing: 3px;
  text-transform: uppercase; color: var(--a);
}
.ir-feedback-status {
  font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
  text-transform: uppercase; padding: 4px 12px; border-radius: 2px;
}
.ir-feedback-status.pass {
  background: rgba(34,197,94,0.08); color: #86efac;
  border: 1px solid rgba(34,197,94,0.2);
}
.ir-feedback-status.fail {
  background: rgba(239,68,68,0.08); color: #fca5a5;
  border: 1px solid rgba(239,68,68,0.2);
}
.ir-feedback-text {
  font-size: 13px; font-weight: 300;
  color: var(--m); line-height: 1.65; margin-bottom: 12px;
}
.ir-feedback-tags { display: flex; gap: 8px; flex-wrap: wrap; }
.ir-tag {
  font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
  text-transform: uppercase; padding: 4px 12px; border-radius: 2px;
  background: rgba(125,249,194,0.06);
  color: var(--a); border: 1px solid rgba(125,249,194,0.18);
}

.ir-view-summary-btn {
  margin: 0 26px 22px; width: calc(100% - 52px);
  font-family: 'Bebas Neue', sans-serif;
  font-size: 16px; letter-spacing: 4px;
  padding: 15px; border: none; border-radius: 2px;
  background: var(--w); color: var(--bg);
  cursor: pointer; transition: all 0.2s;
  box-shadow: 0 4px 24px rgba(255,255,255,0.08);
  display: flex; align-items: center; justify-content: center; gap: 10px;
}
.ir-view-summary-btn:hover {
  background: var(--a); color: var(--bg);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(125,249,194,0.35);
}

.ir-doodle-strip {
  padding: 0 26px 18px;
  display: flex; gap: 16px;
  opacity: 0.2; flex-shrink: 0;
}
`;

const COUNTDOWN_TOTAL = 18;

const TimerDisplay = () => {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return <span className="ir-timer">{m}:{s}</span>;
};

export default function InterviewRoom({ interviewData, onFinish }) {
  const [question, setQuestion]             = useState(interviewData.question);
  const [userTurn, setUserTurn]             = useState(false);
  const lipSyncTimeouts                     = useRef([]);
  const recognitionRef                      = useRef(null);
  const [answer, setAnswer]                 = useState("");
  const [feedback, setFeedback]             = useState(null);
  const [completed, setCompleted]           = useState(false);
  const [loading, setLoading]               = useState(false);
  const [isSpeaking, setIsSpeaking]         = useState(false);
  const [micOn, setMicOn]                   = useState(true);
  const [camOn, setCamOn]                   = useState(true);
  const [questionNumber, setQuestionNumber] = useState(1);
  const nodIntervalRef                      = useRef(null);
  const [streamUrl, setStreamUrl]           = useState(null);
  const [countdown, setCountdown]           = useState(COUNTDOWN_TOTAL);
  const [isReady, setIsReady]               = useState(false);
  const [leftWidth, setLeftWidth]           = useState(62);
  const isDragging  = useRef(false);
  const startX      = useRef(0);
  const startWidth  = useRef(0);
  const videoRef    = useRef(null);
  const streamRef   = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setCamOn(false));
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(t => t.enabled = camOn);
    }
  }, [camOn]);

  useEffect(() => {
    api.getPixelStreamingUrl()
      .then(data => { if (data?.url) setStreamUrl(data.url); })
      .catch(() => {});
  }, []);

  // Countdown
  useEffect(() => {
    if (isReady) return;
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    } else {
      setIsReady(true);
    }
  }, [countdown, isReady]);

  // Play audio only when ready
  useEffect(() => {
    if (isReady && interviewData.audioUrl && interviewData.lipSyncTimes) {
      playAudioWithLipSync(
        interviewData.audioUrl,
        interviewData.lipSyncTimes,
        interviewData.lipSyncVisemes
      );
    }
  }, [isReady]);

  useEffect(() => {
    return () => lipSyncTimeouts.current.forEach(t => clearTimeout(t));
  }, []);

  const onMouseDown = useCallback((e) => {
    isDragging.current = true;
    startX.current     = e.clientX;
    startWidth.current = leftWidth;
    document.body.style.cursor     = "col-resize";
    document.body.style.userSelect = "none";
  }, [leftWidth]);

  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging.current) return;
      const delta = e.clientX - startX.current;
      const newW  = startWidth.current + (delta / window.innerWidth) * 100;
      setLeftWidth(Math.min(80, Math.max(30, newW)));
    };
    const onUp = () => {
      isDragging.current             = false;
      document.body.style.cursor     = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous     = true;
    recognition.interimResults = true;
    recognition.lang           = 'en-US';
    let nodTimeout  = null;
    let lastNodTime = 0;
    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setAnswer(transcript);
      const now = Date.now();
      if (now - lastNodTime > 4000 && Math.random() < 0.4) {
        sendPaytonState("talking");
        lastNodTime = now;
        if (nodTimeout) clearTimeout(nodTimeout);
        nodTimeout = setTimeout(() => sendPaytonState("idle"), 1500);
      }
    };
    recognition.onerror = (e) => console.error('Speech error:', e.error);
    recognitionRef.current = recognition;
    return () => {
      recognition.stop();
      if (nodTimeout) clearTimeout(nodTimeout);
    };
  }, []);

  useEffect(() => {
    if (!recognitionRef.current) return;
    if (isSpeaking || loading || !userTurn) {
      recognitionRef.current.stop();
    } else {
      try { recognitionRef.current.start(); } catch (e) {}
    }
  }, [isSpeaking, loading, userTurn]);

  function sendPaytonState(state) {
    const iframe = document.querySelector('iframe');
    if (iframe) iframe.contentWindow.postMessage({ type: "state", value: state }, '*');
  }

  function playAudioWithLipSync(url, times, visemes) {
    lipSyncTimeouts.current.forEach(t => clearTimeout(t));
    lipSyncTimeouts.current = [];
    if (nodIntervalRef.current) clearInterval(nodIntervalRef.current);
    const fullUrl = url.startsWith('http') ? url : `https://persona-ai-production-ac95.up.railway.app${url}`;
    const audio   = new Audio(fullUrl);
    setIsSpeaking(true);
    setUserTurn(false);
    sendPaytonState("speaking");
    if (times && visemes) {
      times.forEach((t, i) => {
        const timeout = setTimeout(() => {
          const iframe = document.querySelector('iframe');
          if (iframe) iframe.contentWindow.postMessage({ type: "viseme", value: visemes[i] }, '*');
        }, t * 1000);
        lipSyncTimeouts.current.push(timeout);
      });
    }
    audio.play().catch(() => {});
    audio.onended = () => {
      setIsSpeaking(false);
      setUserTurn(true);
      sendPaytonState("idle");
      const iframe = document.querySelector('iframe');
      if (iframe) iframe.contentWindow.postMessage({ type: "viseme", value: "X" }, '*');
    };
    audio.onerror = () => setIsSpeaking(false);
    return audio;
  }

  async function submitAnswer() {
    if (!answer.trim() || loading) return;
    setLoading(true);
    if (nodIntervalRef.current) clearInterval(nodIntervalRef.current);
    const submittedAnswer = answer;
    setAnswer("");
    try {
      const res = await api.submitAnswer(interviewData.interviewId, submittedAnswer);
      if (res.introCompleted) {
        if (res.isCorrect) sendPaytonState("happy");
        else sendPaytonState("concerned");
      }
      const reaction = await api.getReaction(
        interviewData.interviewId,
        res.isCorrect,
        submittedAnswer,
        res.introCompleted
      );
      await new Promise((resolve) => {
        const audio = playAudioWithLipSync(
          reaction.audioUrl,
          reaction.lipSyncTimes,
          reaction.lipSyncVisemes
        );
        audio.onended = () => { setIsSpeaking(false); resolve(); };
        audio.onerror = () => { setIsSpeaking(false); resolve(); };
      });
      if (res.isCompleted) {
        setFeedback(res);
        setCompleted(true);
        setLoading(false);
        return;
      }
      const next = await api.nextQuestion(interviewData.interviewId);
      setQuestion(next.question);
      if (next.questionNumber !== null && next.questionNumber !== undefined) {
        setQuestionNumber(next.questionNumber);
      }
      playAudioWithLipSync(next.audioUrl, next.lipSyncTimes, next.lipSyncVisemes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const progress = ((COUNTDOWN_TOTAL - countdown) / COUNTDOWN_TOTAL) * 100;

  return (
    <>
      <style>{CSS}</style>
      <div className="ir-root">

        <div className="ir-topbar">
          <div className="ir-logo">persona.ai</div>
          <div className="ir-topbar-center">
            <div className="ir-rec-dot" />
            <TimerDisplay />
            <span className="ir-qbadge">Q{questionNumber} / {interviewData.questionLimit}</span>
          </div>
          <button className="ir-end-btn" onClick={() => onFinish(interviewData.interviewId)}>
            End Interview
          </button>
        </div>

        <div className="ir-body">

          <div className="ir-left" style={{ width: `${leftWidth}%` }}>
            <div className="ir-payton-area">
              <div className="ir-payton-glow" />

              <div className={`ir-status-pill ${loading || isSpeaking ? "active" : ""}`}>
                {loading ? (
                  <><span className="ir-status-dot" /> Processing answer...</>
                ) : isSpeaking ? (
                  <><span className="ir-status-dot" /> Payton is speaking</>
                ) : (
                  "Waiting for your answer"
                )}
              </div>

              {streamUrl ? (
                <iframe
                  src={streamUrl}
                  title="Payton"
                  style={{
                    position: "absolute", inset: 0,
                    width: "100%", height: "100%",
                    border: "none", background: "#000"
                  }}
                  allow="autoplay; fullscreen; display-capture; microphone; camera; clipboard-read; clipboard-write"
                />
              ) : (
                <div style={{
                  color: "var(--d)", fontSize: "11px", zIndex: 10,
                  fontFamily: "Bricolage Grotesque", letterSpacing: "2px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  height: "100%", width: "100%", position: "absolute",
                  flexDirection: "column", gap: "12px"
                }}>
                  <div className="ir-spinner" style={{ borderColor: "rgba(255,255,255,0.2)", borderTopColor: "var(--a)", width: "20px", height: "20px" }} />
                  <span>Avatar offline — interview audio active</span>
                </div>
              )}

              <div className={`ir-speaking ${isSpeaking ? "active" : ""}`}>
                <div className="ir-speaking-bars">
                  {[1,2,3,4,5].map(i => <div key={i} className="ir-speaking-bar" />)}
                </div>
                <span className="ir-speaking-text">Payton is speaking</span>
              </div>

              <div className="ir-nametag">
                <div className="ir-nametag-name">Payton</div>
                <div className="ir-nametag-sub">AI Interviewer · persona.ai</div>
              </div>

              <DoodleCorner style={{ position:"absolute", top:60, left:14, opacity:0.4, pointerEvents:"none" }} />
              <DoodleCross  size={28} style={{ position:"absolute", bottom:80, right:170, opacity:0.25, pointerEvents:"none" }} />

              <div className="ir-pip">
                {camOn ? (
                  <video ref={videoRef} autoPlay muted playsInline />
                ) : (
                  <div className="ir-pip-off">
                    <div className="ir-pip-off-icon">📷</div>
                    <div className="ir-pip-off-text">Camera off</div>
                  </div>
                )}
                <div className="ir-pip-name">You</div>
              </div>
            </div>

            {/* ── CONTROLS — with countdown strip below buttons ── */}
            <div className="ir-controls">
              <div className="ir-controls-buttons">
                <div style={{ position:"relative" }}>
                  <button className={`ctrl-btn ${micOn ? "" : "off"}`} onClick={() => setMicOn(m => !m)}>
                    {micOn ? "🎙️" : "🔇"}
                  </button>
                  <span className="ctrl-btn-label">{micOn ? "Mute" : "Unmuted"}</span>
                </div>
                <div style={{ position:"relative" }}>
                  <button className={`ctrl-btn ${camOn ? "" : "off"}`} onClick={() => setCamOn(c => !c)}>
                    {camOn ? "📹" : "🚫"}
                  </button>
                  <span className="ctrl-btn-label">{camOn ? "Camera" : "Cam off"}</span>
                </div>
                <div style={{ position:"relative" }}>
                  <button className="ctrl-btn">⚙️</button>
                  <span className="ctrl-btn-label">Settings</span>
                </div>
                <div style={{ position:"relative", margin:"0 8px" }}>
                  <button className="ctrl-btn-end" onClick={() => onFinish(interviewData.interviewId)}>📵</button>
                  <span className="ctrl-btn-label" style={{ color:"#fca5a5" }}>End</span>
                </div>
                <div style={{ position:"relative" }}>
                  <button className="ctrl-btn">⛶</button>
                  <span className="ctrl-btn-label">Fullscreen</span>
                </div>
              </div>

              {/* Countdown strip — only shown while waiting */}
              {!isReady && (
                <div className="ir-countdown-strip">
                  <div className="ir-countdown-strip-num">{countdown}</div>
                  <div className="ir-countdown-strip-bar-wrap">
                    <div className="ir-countdown-strip-bar" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="ir-countdown-strip-label">Payton loading…</div>
                  <button
                    className="ir-countdown-strip-skip"
                    onClick={() => setIsReady(true)}
                  >
                    Skip
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="ir-resizer" onMouseDown={onMouseDown} />

          <div className="ir-right">
            <div className="ir-right-header">
              <div className="ir-right-title">Interview Panel</div>
              <DoodleWave style={{ opacity:0.1, width:120, height:24 }} />
            </div>

            <div className="ir-question-wrap">
              <div className="ir-question-label">Question {questionNumber}</div>
              <p className="ir-question-text">{question}</p>
            </div>

            <div className="ir-answer-wrap">
              {!completed && (
                <>
                  <div className="ir-answer-label">Your Answer</div>
                  <textarea
                    className="ir-textarea"
                    placeholder="Type your answer here… Be specific and structured."
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    disabled={loading}
                    onKeyDown={e => {
                      if (e.key === "Enter" && e.ctrlKey) submitAnswer();
                      if (Math.random() < 0.4) sendPaytonState("talking");
                    }}
                  />
                  <div className="ir-submit-row">
                    <span className="ir-char-count">
                      {answer.length > 0
                        ? `${answer.length} chars · Ctrl+Enter to submit`
                        : "Ctrl+Enter to submit"}
                    </span>
                    <button className="ir-submit-btn"
                      onClick={submitAnswer} disabled={loading || !answer.trim()}>
                      {loading
                        ? <><div className="ir-spinner" /> Processing</>
                        : <>Submit →</>}
                    </button>
                  </div>
                </>
              )}
            </div>

            {feedback && (
              <div className="ir-feedback">
                <div className="ir-feedback-header">
                  <span className="ir-feedback-title">AI Feedback</span>
                  <span className={`ir-feedback-status ${feedback.isCorrect ? "pass" : "fail"}`}>
                    {feedback.isCorrect ? "✓ Good answer" : "✗ Needs improvement"}
                  </span>
                </div>
                <p className="ir-feedback-text">{feedback.feedback}</p>
                <div className="ir-feedback-tags">
                  {feedback.weakTopic && <span className="ir-tag">⚠ {feedback.weakTopic}</span>}
                  {feedback.emotion   && <span className="ir-tag">🎭 {feedback.emotion}</span>}
                </div>
              </div>
            )}

            {completed && (
              <button className="ir-view-summary-btn"
                onClick={() => onFinish(interviewData.interviewId)}>
                View Full Summary →
              </button>
            )}

            <div className="ir-doodle-strip">
              <DoodleGrid  style={{ width:60, height:60 }} />
              <DoodleCircle size={44} opacity={0.5} />
              <DoodleCross  size={28} />
              <DoodleCircle size={32} opacity={0.4} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}