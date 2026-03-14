import { useEffect, useState, useRef, useCallback } from "react";
import api from "../services/api";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,700;12..96,800&display=swap');

  :root {
    --cream: #f0ece3;
    --warm-white: #faf8f4;
    --brown-dark: #1a1410;
    --brown-mid: #2e2118;
    --brown-muted: #4a3728;
    --gold: #c9a96e;
    --gold-light: #e8d5a3;
    --gold-dim: rgba(201,169,110,0.18);
    --sky-blue: #7ab8d4;
    --sky-light: #b8d9ea;
    --text-dim: rgba(240,236,227,0.45);
    --text-mid: rgba(240,236,227,0.7);
    --border: rgba(201,169,110,0.15);
    --border-strong: rgba(201,169,110,0.3);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .ir-root {
    width: 100vw;
    height: 100vh;
    background: var(--brown-dark);
    font-family: 'Bricolage Grotesque', sans-serif;
    color: var(--cream);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
  }

  /* Subtle grain overlay */
  .ir-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 9999;
    opacity: 0.4;
  }

  /* TOP BAR */
  .ir-topbar {
    height: 58px;
    background: rgba(26,20,16,0.92);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 28px;
    flex-shrink: 0;
    z-index: 100;
    backdrop-filter: blur(20px);
  }

  .ir-logo {
    font-family: 'Bebas Neue', sans-serif;
    font-weight: 400;
    font-size: 22px;
    letter-spacing: 3px;
    color: var(--gold);
    text-transform: uppercase;
  }

  .ir-topbar-center {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .ir-rec-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #ef4444;
    animation: recPulse 1.5s ease-in-out infinite;
  }

  @keyframes recPulse {
    0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
    50% { opacity: 0.5; box-shadow: 0 0 0 4px rgba(239,68,68,0); }
  }

  .ir-timer {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 18px;
    letter-spacing: 3px;
    color: var(--text-mid);
  }

  .ir-qbadge {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--gold);
    background: var(--gold-dim);
    border: 1px solid var(--border-strong);
    padding: 4px 12px;
    border-radius: 2px;
  }

  .ir-end-btn {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: rgba(239,68,68,0.8);
    background: rgba(239,68,68,0.07);
    border: 1px solid rgba(239,68,68,0.2);
    border-radius: 2px;
    padding: 8px 18px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .ir-end-btn:hover {
    background: rgba(239,68,68,0.15);
    border-color: rgba(239,68,68,0.4);
    color: #fca5a5;
  }

  /* MAIN BODY */
  .ir-body {
    flex: 1;
    display: flex;
    overflow: hidden;
    position: relative;
  }

  /* RESIZE HANDLE */
  .ir-resizer {
    width: 4px;
    background: var(--border);
    cursor: col-resize;
    flex-shrink: 0;
    position: relative;
    transition: background 0.2s;
    z-index: 50;
  }

  .ir-resizer:hover, .ir-resizer.dragging {
    background: var(--gold);
  }

  .ir-resizer::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 2px;
    height: 40px;
    background: var(--gold-dim);
    border-radius: 2px;
  }

  /* LEFT — VIDEO CALL */
  .ir-left {
    position: relative;
    background: var(--brown-mid);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex-shrink: 0;
  }

  /* Payton video area */
  .ir-payton-area {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  /* Warm ambient glow */
  .ir-payton-glow {
    position: absolute;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(201,169,110,0.06) 0%, transparent 65%);
    pointer-events: none;
    animation: glowPulse 5s ease-in-out infinite;
  }

  @keyframes glowPulse {
    0%, 100% { transform: scale(1); opacity: 0.6; }
    50% { transform: scale(1.1); opacity: 1; }
  }

  /* Payton placeholder */
  .ir-payton-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    position: relative;
    z-index: 2;
  }

  .ir-payton-avatar {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(201,169,110,0.15), rgba(122,184,212,0.1));
    border: 1px solid var(--border-strong);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48px;
    position: relative;
  }

  .ir-payton-avatar::before {
    content: '';
    position: absolute;
    inset: -6px;
    border-radius: 50%;
    border: 1px solid var(--border);
    animation: avatarRing 4s linear infinite;
  }

  @keyframes avatarRing {
    from { transform: rotate(0deg); opacity: 0.3; }
    50% { opacity: 0.8; }
    to { transform: rotate(360deg); opacity: 0.3; }
  }

  .ir-payton-name {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 24px;
    letter-spacing: 4px;
    color: var(--cream);
  }

  .ir-payton-role {
    font-size: 12px;
    font-weight: 400;
    color: var(--text-dim);
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .ir-pixel-badge {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--gold);
    background: var(--gold-dim);
    border: 1px solid var(--border-strong);
    border-radius: 2px;
    padding: 5px 14px;
  }

  /* Speaking indicator */
  .ir-speaking {
    position: absolute;
    bottom: 88px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(26,20,16,0.75);
    backdrop-filter: blur(16px);
    border: 1px solid var(--border-strong);
    border-radius: 2px;
    padding: 8px 18px;
    z-index: 10;
    opacity: 0;
    transition: opacity 0.3s;
  }

  .ir-speaking.active { opacity: 1; }

  .ir-speaking-bars {
    display: flex;
    gap: 3px;
    align-items: center;
  }

  .ir-speaking-bar {
    width: 2px;
    background: var(--gold);
    border-radius: 2px;
    animation: barBounce 0.8s ease-in-out infinite;
  }

  .ir-speaking-bar:nth-child(1) { height: 8px; animation-delay: 0s; }
  .ir-speaking-bar:nth-child(2) { height: 16px; animation-delay: 0.1s; }
  .ir-speaking-bar:nth-child(3) { height: 12px; animation-delay: 0.2s; }
  .ir-speaking-bar:nth-child(4) { height: 20px; animation-delay: 0.05s; }
  .ir-speaking-bar:nth-child(5) { height: 10px; animation-delay: 0.15s; }

  @keyframes barBounce {
    0%, 100% { transform: scaleY(0.4); }
    50% { transform: scaleY(1); }
  }

  .ir-speaking-text {
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--text-mid);
  }

  /* Name tag overlay */
  .ir-nametag {
    position: absolute;
    bottom: 88px;
    left: 20px;
    background: rgba(26,20,16,0.7);
    backdrop-filter: blur(12px);
    border-radius: 2px;
    padding: 8px 14px;
    z-index: 10;
    border: 1px solid var(--border);
    border-left: 2px solid var(--gold);
  }

  .ir-nametag-name {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 16px;
    letter-spacing: 3px;
    color: var(--cream);
  }

  .ir-nametag-sub {
    font-size: 10px;
    font-weight: 400;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--gold);
    margin-top: 1px;
  }

  /* Controls bar */
  .ir-controls {
    height: 72px;
    background: rgba(26,20,16,0.9);
    backdrop-filter: blur(20px);
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    flex-shrink: 0;
  }

  .ctrl-btn {
    width: 44px;
    height: 44px;
    border-radius: 2px;
    border: 1px solid var(--border);
    background: rgba(201,169,110,0.05);
    color: var(--cream);
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    position: relative;
  }

  .ctrl-btn:hover {
    background: var(--gold-dim);
    border-color: var(--border-strong);
    transform: translateY(-1px);
  }

  .ctrl-btn.off {
    background: rgba(239,68,68,0.1);
    border-color: rgba(239,68,68,0.25);
  }

  .ctrl-btn.off:hover { background: rgba(239,68,68,0.2); }

  .ctrl-btn-label {
    position: absolute;
    bottom: -18px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--text-dim);
    white-space: nowrap;
  }

  .ctrl-btn-end {
    width: 48px;
    height: 48px;
    border-radius: 2px;
    border: none;
    background: #ef4444;
    color: white;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    box-shadow: 0 4px 20px rgba(239,68,68,0.35);
  }

  .ctrl-btn-end:hover {
    background: #dc2626;
    transform: translateY(-1px);
    box-shadow: 0 6px 24px rgba(239,68,68,0.5);
  }

  /* User camera PiP */
  .ir-pip {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 148px;
    height: 104px;
    border-radius: 2px;
    overflow: hidden;
    border: 1px solid var(--border-strong);
    background: var(--brown-dark);
    z-index: 20;
    cursor: grab;
    box-shadow: 0 8px 32px rgba(0,0,0,0.6);
  }

  .ir-pip video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scaleX(-1);
  }

  .ir-pip-off {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background: var(--brown-mid);
  }

  .ir-pip-off-icon { font-size: 22px; opacity: 0.3; }
  .ir-pip-off-text {
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--text-dim);
  }

  .ir-pip-name {
    position: absolute;
    bottom: 6px;
    left: 8px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--gold-light);
    text-shadow: 0 1px 4px rgba(0,0,0,0.8);
  }

  /* RIGHT PANEL */
  .ir-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #0f0c09;
    border-left: 1px solid var(--border);
    overflow: hidden;
  }

  .ir-right-header {
    padding: 20px 28px 16px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .ir-right-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 14px;
    font-weight: 400;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--text-dim);
  }

  /* Question box */
  .ir-question-wrap {
    padding: 24px 28px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
    position: relative;
    background: linear-gradient(180deg, rgba(201,169,110,0.03) 0%, transparent 100%);
  }

  .ir-question-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .ir-question-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  .ir-question-text {
    font-size: 16px;
    line-height: 1.7;
    color: var(--cream);
    font-weight: 400;
  }

  /* Answer area */
  .ir-answer-wrap {
    flex: 1;
    padding: 24px 28px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow-y: auto;
  }

  .ir-answer-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--text-dim);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .ir-answer-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  .ir-textarea {
    flex: 1;
    min-height: 140px;
    background: rgba(201,169,110,0.03);
    border: 1px solid var(--border);
    border-radius: 2px;
    padding: 16px 18px;
    font-size: 14px;
    font-family: 'Bricolage Grotesque', sans-serif;
    font-weight: 400;
    color: var(--cream);
    resize: none;
    outline: none;
    line-height: 1.65;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  }

  .ir-textarea::placeholder {
    color: var(--text-dim);
    font-style: italic;
  }

  .ir-textarea:focus {
    border-color: var(--border-strong);
    box-shadow: 0 0 0 3px rgba(201,169,110,0.06), inset 0 1px 0 rgba(201,169,110,0.05);
    background: rgba(201,169,110,0.05);
  }

  .ir-textarea:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .ir-submit-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .ir-char-count {
    font-size: 11px;
    font-weight: 400;
    letter-spacing: 0.5px;
    color: var(--text-dim);
  }

  .ir-submit-btn {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 15px;
    letter-spacing: 3px;
    padding: 12px 28px;
    border: none;
    border-radius: 2px;
    background: var(--gold);
    color: var(--brown-dark);
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 4px 20px rgba(201,169,110,0.2);
  }

  .ir-submit-btn:hover:not(:disabled) {
    background: var(--gold-light);
    transform: translateY(-1px);
    box-shadow: 0 6px 28px rgba(201,169,110,0.35);
  }

  .ir-submit-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
    transform: none;
  }

  .ir-spinner {
    width: 13px;
    height: 13px;
    border: 2px solid rgba(26,20,16,0.3);
    border-top-color: var(--brown-dark);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  /* Feedback */
  .ir-feedback {
    margin: 0 28px 20px;
    background: rgba(201,169,110,0.04);
    border: 1px solid var(--border-strong);
    border-radius: 2px;
    padding: 20px 22px;
    flex-shrink: 0;
    border-top: 2px solid var(--gold);
  }

  .ir-feedback-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .ir-feedback-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 14px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--gold);
  }

  .ir-feedback-status {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    padding: 4px 12px;
    border-radius: 2px;
  }

  .ir-feedback-status.pass {
    background: rgba(34,197,94,0.08);
    color: #86efac;
    border: 1px solid rgba(34,197,94,0.2);
  }

  .ir-feedback-status.fail {
    background: rgba(239,68,68,0.08);
    color: #fca5a5;
    border: 1px solid rgba(239,68,68,0.2);
  }

  .ir-feedback-text {
    font-size: 13px;
    font-weight: 400;
    color: var(--text-mid);
    line-height: 1.65;
    margin-bottom: 12px;
  }

  .ir-feedback-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .ir-tag {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    padding: 4px 12px;
    border-radius: 2px;
    background: var(--gold-dim);
    color: var(--gold);
    border: 1px solid var(--border-strong);
  }

  .ir-view-summary-btn {
    margin: 0 28px 24px;
    width: calc(100% - 56px);
    font-family: 'Bebas Neue', sans-serif;
    font-size: 16px;
    letter-spacing: 4px;
    padding: 16px;
    border: none;
    border-radius: 2px;
    background: var(--gold);
    color: var(--brown-dark);
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 24px rgba(201,169,110,0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .ir-view-summary-btn:hover {
    background: var(--gold-light);
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(201,169,110,0.4);
  }

  /* Status pill */
  .ir-status-pill {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(26,20,16,0.8);
    backdrop-filter: blur(16px);
    border: 1px solid var(--border);
    border-radius: 2px;
    padding: 7px 16px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--text-dim);
    z-index: 10;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ir-status-pill.listening {
    border-color: var(--border-strong);
    color: var(--gold);
  }

  .ir-status-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: currentColor;
    animation: recPulse 1.2s ease-in-out infinite;
  }

  /* Scrollbar */
  .ir-answer-wrap::-webkit-scrollbar { width: 3px; }
  .ir-answer-wrap::-webkit-scrollbar-track { background: transparent; }
  .ir-answer-wrap::-webkit-scrollbar-thumb {
    background: var(--border-strong);
    border-radius: 2px;
  }

  /* Divider line accent */
  .ir-question-wrap::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(180deg, var(--gold) 0%, transparent 100%);
  }
`;

function useTimer() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export default function InterviewRoom({ interviewData, onFinish }) {
  const [question, setQuestion] = useState(interviewData.question);
  const [audioUrl, setAudioUrl] = useState(interviewData.audioUrl || null);
  const [lipSync, setLipSync] = useState(null);
  const [userTurn, setUserTurn] = useState(false);
  const lipSyncTimeouts = useRef([]);
  const recognitionRef = useRef(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [questionNumber, setQuestionNumber] = useState(1);
  const nodIntervalRef = useRef(null);
  // Resize state
  const [leftWidth, setLeftWidth] = useState(62);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  // Camera
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timer = useTimer();

  // Camera setup
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

  // Audio playback
  // Play initial question on load
useEffect(() => {
  if (interviewData.audioUrl && interviewData.lipSyncTimes) {
    playAudioWithLipSync(interviewData.audioUrl, interviewData.lipSyncTimes, interviewData.lipSyncVisemes);
  }
}, []);

// Cleanup timeouts on unmount
useEffect(() => {
  return () => lipSyncTimeouts.current.forEach(t => clearTimeout(t));
}, []);

  // Resize logic
  const onMouseDown = useCallback((e) => {
    isDragging.current = true;
    startX.current = e.clientX;
    startWidth.current = leftWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [leftWidth]);

  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging.current) return;
      const delta = e.clientX - startX.current;
      const newW = startWidth.current + (delta / window.innerWidth) * 100;
      setLeftWidth(Math.min(80, Math.max(30, newW)));
    };
    const onUp = () => {
      isDragging.current = false;
      document.body.style.cursor = "";
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
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  let nodTimeout = null;

  
  let lastNodTime = 0;

recognition.onresult = (event) => {
  let transcript = '';
  for (let i = 0; i < event.results.length; i++) {
    transcript += event.results[i][0].transcript;
  }
  setAnswer(transcript);

  const now = Date.now();
  if (now - lastNodTime > 4000) {
    if (Math.random() < 0.4) {
      sendPaytonState("talking");
      lastNodTime = now;
      // stop nodding after 1.5 seconds regardless
      if (nodTimeout) clearTimeout(nodTimeout);
      nodTimeout = setTimeout(() => {
        sendPaytonState("idle");
      }, 1500);
    }
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
    try {
      recognitionRef.current.start();
    } catch (e) {
      // already started
    }
  }
}, [isSpeaking, loading, userTurn]);
  function sendPaytonState(state) {
  console.log("sendPaytonState:", state);  
  const iframe = document.querySelector('iframe');
  if (iframe) iframe.contentWindow.postMessage({ type: "state", value: state }, '*');
  }

  function playAudioWithLipSync(url, times, visemes) {
  lipSyncTimeouts.current.forEach(t => clearTimeout(t));
  lipSyncTimeouts.current = [];
  if (nodIntervalRef.current) clearInterval(nodIntervalRef.current);
  

  const fullUrl = url.startsWith('http') ? url : `http://localhost:8000${url}`;
  const audio = new Audio(fullUrl);
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
    console.log("isCorrect:", res.isCorrect);

    // Send expression immediately on submit
    if (res.isCorrect) {
      sendPaytonState("happy");
    } else {
      sendPaytonState("concerned");
    }

    // 1. Get Payton's reaction
    const reaction = await api.getReaction(
      interviewData.interviewId,
      res.isCorrect,
      submittedAnswer
    );

    // 2. Play reaction audio, wait for it to finish
    await new Promise((resolve) => {
      const audio = playAudioWithLipSync(reaction.audioUrl, reaction.lipSyncTimes, reaction.lipSyncVisemes);
      audio.onended = () => { setIsSpeaking(false); resolve(); };
      audio.onerror = () => { setIsSpeaking(false); resolve(); };
    });

    // 3. If completed, show feedback
    if (res.isCompleted) {
      setFeedback(res);
      setCompleted(true);
      setLoading(false);
      return;
    }

    // 4. Load next question
    const next = await api.nextQuestion(interviewData.interviewId);
    setQuestion(next.question);
    setQuestionNumber(q => q + 1);
    playAudioWithLipSync(next.audioUrl, next.lipSyncTimes, next.lipSyncVisemes);

  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
}

  return (
    <>
      <style>{styles}</style>
      <div className="ir-root">

        {/* TOP BAR */}
        <div className="ir-topbar">
          <div className="ir-logo">persona.ai</div>
          <div className="ir-topbar-center">
            <div className="ir-rec-dot" />
            <span className="ir-timer">{timer}</span>
            <span className="ir-qbadge">
              Q{questionNumber} / {interviewData.questionLimit}
            </span>
          </div>
          <button className="ir-end-btn" onClick={() => onFinish(interviewData.interviewId)}>
            End Interview
          </button>
        </div>

        {/* BODY */}
        <div className="ir-body">

          {/* LEFT — PAYTON VIDEO */}
          <div className="ir-left" style={{ width: `${leftWidth}%` }}>

            <div className="ir-payton-area">
              

              {/* Status pill */}
              <div className={`ir-status-pill ${loading ? "listening" : ""}`}>
                {loading ? (
                  <><span className="ir-status-dot" /> Processing answer...</>
                ) : isSpeaking ? (
                  <><span className="ir-status-dot" style={{background:"var(--gold)"}} /> Payton is speaking</>
                ) : (
                  "Waiting for your answer"
                )}
              </div>

              {/* Payton via Pixel Streaming */}
<iframe
  src="http://localhost"
  title="Payton"
  style={{
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    border: "none",
    background: "#0d0c09"
  }}
  allow="microphone; camera; autoplay; clipboard-write"
/>

              {/* Speaking bars */}
              <div className={`ir-speaking ${isSpeaking ? "active" : ""}`}>
                <div className="ir-speaking-bars">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="ir-speaking-bar" />
                  ))}
                </div>
                <span className="ir-speaking-text">Payton is speaking</span>
              </div>

              {/* Name tag */}
              <div className="ir-nametag">
                <div className="ir-nametag-name">Payton</div>
                <div className="ir-nametag-sub">AI Interviewer · persona.ai</div>
              </div>

              {/* User PiP */}
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

            {/* CONTROLS */}
            <div className="ir-controls">
              <div style={{position:"relative"}}>
                <button
                  className={`ctrl-btn ${micOn ? "" : "off"}`}
                  onClick={() => setMicOn(m => !m)}
                  title={micOn ? "Mute mic" : "Unmute mic"}
                >
                  {micOn ? "🎙️" : "🔇"}
                </button>
                <span className="ctrl-btn-label">{micOn ? "Mute" : "Unmuted"}</span>
              </div>

              <div style={{position:"relative"}}>
                <button
                  className={`ctrl-btn ${camOn ? "" : "off"}`}
                  onClick={() => setCamOn(c => !c)}
                  title={camOn ? "Turn off camera" : "Turn on camera"}
                >
                  {camOn ? "📹" : "🚫"}
                </button>
                <span className="ctrl-btn-label">{camOn ? "Camera" : "Cam off"}</span>
              </div>

              <div style={{position:"relative"}}>
                <button className="ctrl-btn" title="Settings">⚙️</button>
                <span className="ctrl-btn-label">Settings</span>
              </div>

              <div style={{position:"relative", margin: "0 8px"}}>
                <button
                  className="ctrl-btn-end"
                  onClick={() => onFinish(interviewData.interviewId)}
                  title="End interview"
                >
                  📵
                </button>
                <span className="ctrl-btn-label" style={{color:"#fca5a5"}}>End</span>
              </div>

              <div style={{position:"relative"}}>
                <button className="ctrl-btn" title="Fullscreen">⛶</button>
                <span className="ctrl-btn-label">Fullscreen</span>
              </div>
            </div>
          </div>

          {/* RESIZER */}
          <div
            className="ir-resizer"
            onMouseDown={onMouseDown}
          />

          {/* RIGHT — INTERACTION */}
          <div className="ir-right">
            <div className="ir-right-header">
              <div className="ir-right-title">Interview Panel</div>
            </div>

            {/* Question */}
            <div className="ir-question-wrap">
              <div className="ir-question-label">Question {questionNumber}</div>
              <p className="ir-question-text">{question}</p>
            </div>

            {/* Answer / Feedback */}
            <div className="ir-answer-wrap">
              {!completed && (
                <>
                  <div className="ir-answer-label">Your Answer</div>
                  <textarea
                    className="ir-textarea"
                    placeholder="Type your answer here... Be specific and structured."
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
                      {answer.length > 0 ? `${answer.length} chars · Ctrl+Enter to submit` : "Ctrl+Enter to submit"}
                    </span>
                    <button
                      className="ir-submit-btn"
                      onClick={submitAnswer}
                      disabled={loading || !answer.trim()}
                    >
                      {loading ? (
                        <><div className="ir-spinner" /> Processing</>
                      ) : (
                        <>Submit →</>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Feedback card */}
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
                  {feedback.emotion && <span className="ir-tag">🎭 {feedback.emotion}</span>}
                </div>
              </div>
            )}

            {completed && (
              <button
                className="ir-view-summary-btn"
                onClick={() => onFinish(interviewData.interviewId)}
              >
                View Full Summary →
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
