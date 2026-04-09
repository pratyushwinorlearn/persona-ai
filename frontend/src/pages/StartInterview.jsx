import { useState, useEffect, useRef, useCallback } from "react";
import api from "../services/api";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const IMGS = {
  cosmos:    "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=2400&q=95",
  nebula:    "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=2400&q=95",
  face:      "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=1200&q=90",
  ai:        "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&q=90",
  neural:    "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=90",
  circuit:   "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=90",
  interview: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&q=90",
  voice:     "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=90",
  brain:     "https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=1200&q=90",
};

const NAV = ["Payton", "Intelligence", "Voice", "Feedback", "Roles", "Start"];

// ── SCRAMBLE TEXT UTIL ─────────────────────────────────────────
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";
function scrambleText(el, finalText, duration = 900) {
  if (!el) return;
  let frame = 0;
  const totalFrames = Math.floor(duration / 16);
  const orig = finalText.toUpperCase();
  const id = setInterval(() => {
    el.textContent = orig
      .split("")
      .map((ch, i) => {
        if (ch === " ") return " ";
        const progress = frame / totalFrames;
        const threshold = i / orig.length;
        if (progress > threshold + 0.25) return ch;
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      })
      .join("");
    frame++;
    if (frame >= totalFrames) {
      el.textContent = orig;
      clearInterval(id);
    }
  }, 16);
  return id;
}

// ── SVG DOODLES ────────────────────────────────────────────────
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
      <rect key={`${row}-${col}`} x={col*40+4} y={row*40+4} width="32" height="32" stroke="white" strokeWidth="0.5" opacity="0.07" rx="4" />
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
const DoodleBracket = ({ className = "", style = {} }) => (
  <svg className={`doodle ${className}`} width="60" height="100" viewBox="0 0 60 100" fill="none" style={style}>
    <path d="M40 5 L15 5 Q8 5 8 12 L8 45 Q8 50 4 50 Q8 50 8 55 L8 88 Q8 95 15 95 L40 95" stroke="white" strokeWidth="1" opacity="0.15" fill="none" />
  </svg>
);
const DoodleWave = ({ className = "", style = {} }) => (
  <svg className={`doodle ${className}`} width="300" height="60" viewBox="0 0 300 60" fill="none" style={style}>
    <path d="M0 30 Q37.5 5 75 30 Q112.5 55 150 30 Q187.5 5 225 30 Q262.5 55 300 30" stroke="white" strokeWidth="0.8" opacity="0.1" fill="none" />
    <path d="M0 30 Q37.5 10 75 30 Q112.5 50 150 30 Q187.5 10 225 30 Q262.5 50 300 30" stroke="white" strokeWidth="0.4" opacity="0.06" fill="none" strokeDasharray="3 4" />
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
      <circle key={`${col}-${row}`} cx={col*20+10} cy={row*20+10} r="1.5" fill="white" opacity={0.05+(col+row)*0.02} />
    )))}
  </svg>
);
const DoodleSpiral = ({ className = "", style = {} }) => (
  <svg className={`doodle ${className}`} width="120" height="120" viewBox="0 0 120 120" fill="none" style={style}>
    <path d="M60 60 Q60 30 90 60 Q120 90 60 90 Q0 90 0 60 Q0 15 60 15 Q120 15 120 60" stroke="white" strokeWidth="0.7" opacity="0.1" fill="none" />
  </svg>
);

export default function StartInterview({ onStart }) {
  const formRef    = useRef(null);
  
  // App States
  const [jobRole,         setJobRole]   = useState("");
  const [experienceLevel, setLevel]     = useState("Fresher");
  const [questionLimit,   setQLimit]    = useState(3);
  const [loading,         setLoading]   = useState(false);
  const [error,           setError]     = useState("");
  const [activeNav,       setActiveNav] = useState(0);

  // Auth & OTP States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState(null); 
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);

  // History States
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  const [authEmail, setAuthEmail] = useState("");
  const [authPass, setAuthPass] = useState("");
  const [authName, setAuthName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const wrapRef      = useRef(null);
  const secRefs      = useRef([]);
  const spotlightRef = useRef(null);
  
  // Canvas Sequence Refs
  const canvasRef = useRef(null);
  const FRAME_COUNT = 147; 

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    const scroller = wrapRef.current;
    if (!scroller) return;

    const ctxGSAP = gsap.context(() => {
      ScrollTrigger.defaults({ scroller });

      // ── OPTIMIZED CANVAS IMAGE SEQUENCE LOGIC ─────────────────────────────────
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      let resizeTimeout;
      window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          render(images[Math.round(playhead.frame)]);
        }, 100);
      });

      const images = [];
      const playhead = { frame: 0 };

      // Preload images
      for (let i = 0; i < FRAME_COUNT; i++) {
        const img = new Image();
        img.src = `/sequence/ezgif-frame-${String(i + 1).padStart(3, "0")}.jpg`;
        images.push(img);
      }

      function render(img) {
        if (!img || !img.complete) return;
        const hRatio = canvas.width / img.width;
        const vRatio = canvas.height / img.height;
        const ratio = Math.max(hRatio, vRatio);
        const centerShift_x = (canvas.width - img.width * ratio) / 2;
        const centerShift_y = (canvas.height - img.height * ratio) / 2;
        
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.drawImage(
          img, 0, 0, img.width, img.height,
          centerShift_x, centerShift_y, img.width * ratio, img.height * ratio
        );
      }

      images[0].onload = () => render(images[0]);

      gsap.to(playhead, {
        frame: FRAME_COUNT - 1,
        ease: "none",
        scrollTrigger: {
          trigger: "#hero-container",
          scroller: scroller,
          start: "top top",
          end: "+=1500", 
          pin: true,
          pinType: "transform", // Crucial fix for lag in custom scroll containers
          scrub: 0.5, // Smoother scrubbing
        },
        onUpdate: () => {
          const frameIndex = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(playhead.frame)));
          render(images[frameIndex]);
        }
      });

      // Cursor spotlight (background highlight effect)
      const spotlight = spotlightRef.current;
      const onMouseMove = (e) => {
        if (spotlight) {
          gsap.to(spotlight, {
            x: e.clientX - 300, y: e.clientY - 300,
            duration: 0.8, ease: "power2.out",
          });
        }
      };
      window.addEventListener("mousemove", onMouseMove);

      secRefs.current.forEach((sec, i) => {
        if (!sec) return;
        ScrollTrigger.create({
          trigger: sec, scroller,
          start: "top 52%", end: "bottom 52%",
          onEnter: () => setActiveNav(i),
          onEnterBack: () => setActiveNav(i),
        });
      });

      // Optimized Sticky Nav Update
      ScrollTrigger.create({
        trigger: "#main-wrap", scroller, start: "top top", end: "+=600", scrub: true,
        onUpdate: self => {
          const p = self.progress;
          gsap.set("#sticky-nav", {
            backgroundColor: `rgba(0,0,0,${0.2 + p * 0.7})`,
            borderBottomColor: `rgba(255,255,255,${0.04 + p * 0.1})`,
          });
        },
      });

      // (Rest of the GSAP animations remain the same)
      gsap.utils.toArray(".sec-hl").forEach(el => {
        el.querySelectorAll(".hw").forEach(word => {
          const text = word.textContent;
          word.innerHTML = text.split("").map(ch =>
            ch === " " ? " " : `<span class="sc" style="display:inline-block">${ch}</span>`
          ).join("");
        });

        gsap.fromTo(el.querySelectorAll(".sc"),
          { y: 80, opacity: 0, rotationX: -60, transformPerspective: 600, filter: "blur(6px)" },
          {
            y: 0, opacity: 1, rotationX: 0, filter: "blur(0px)",
            stagger: { each: 0.018, from: "start" }, duration: 0.55, ease: "power3.out",
            scrollTrigger: { trigger: el, scroller, start: "top 85%", end: "top 35%", scrub: 0.6 },
          }
        );
      });

      gsap.utils.toArray(".sec-label").forEach(el => {
        const original = el.childNodes[0]?.textContent?.trim() || "";
        gsap.fromTo(el, { x: -55, opacity: 0 }, {
          x: 0, opacity: 1,
          scrollTrigger: {
            trigger: el, sc scroller, start: "top 88%", end: "top 60%", scrub: 0.5,
            onEnter: () => setTimeout(() => scrambleText(el.childNodes[0] || el, original, 800), 100),
          },
        });
      });

      gsap.utils.toArray(".sec-sub").forEach(el => {
        gsap.fromTo(el, { y: 38, opacity: 0, filter: "blur(8px)" }, {
          y: 0, opacity: 1, filter: "blur(0px)", scrollTrigger: { trigger: el, scroller, start: "top 88%", end: "top 56%", scrub: 0.5 },
        });
      });

      gsap.utils.toArray(".bg-grid").forEach(grid => {
        const cards = grid.querySelectorAll(".bc");
        cards.forEach((card, i) => {
          gsap.fromTo(card,
            { clipPath: "inset(100% 0% 0% 0%)", opacity: 0, y: 40 },
            {
              clipPath: "inset(0% 0% 0% 0%)", opacity: 1, y: 0, duration: 0.7, ease: "power3.out",
              scrollTrigger: { trigger: card, scroller, start: "top 90%", end: "top 55%", scrub: 0.7 }, delay: i * 0.04,
            }
          );
        });
      });

      gsap.utils.toArray(".bc").forEach(card => {
        const onMove = (e) => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width  - 0.5;
          const y = (e.clientY - r.top)  / r.height - 0.5;
          gsap.to(card, { rotationY: x * 12, rotationX: -y * 10, transformPerspective: 900, duration: 0.35, ease: "power2.out" });
          const spotlight = card.querySelector(".card-spotlight");
          if (spotlight) { gsap.to(spotlight, { opacity: 1, x: e.clientX - r.left - 150, y: e.clientY - r.top  - 150, duration: 0.3, ease: "power2.out" }); }
        };
        const onLeave = () => {
          gsap.to(card, { rotationY: 0, rotationX: 0, duration: 0.6, ease: "elastic.out(1, 0.5)" });
          const spotlight = card.querySelector(".card-spotlight");
          if (spotlight) gsap.to(spotlight, { opacity: 0, duration: 0.3 });
        };
        card.addEventListener("mousemove", onMove); card.addEventListener("mouseleave", onLeave);
      });

      gsap.utils.toArray(".sec-doodle").forEach((el, i) => {
        gsap.fromTo(el, { opacity: 0, scale: 0.7, rotation: -15 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.6, ease: "back.out(1.6)", scrollTrigger: { trigger: el, scroller, start: "top 88%", end: "top 55%", scrub: 0.5 } });
        ScrollTrigger.create({
          trigger: el, scroller, start: "top 88%", once: true,
          onEnter: () => { gsap.to(el, { y: -10 - (i % 3) * 6, rotation: i % 2 === 0 ? 6 : -5, duration: 2.2 + i * 0.3, ease: "sine.inOut", yoyo: true, repeat: -1, delay: i * 0.2 }); },
        });
      });

      gsap.utils.toArray(".draw-line").forEach(el => {
        gsap.set(el, { transformOrigin: "left center" });
        gsap.fromTo(el, { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.8, ease: "power2.inOut", scrollTrigger: { trigger: el, scroller, start: "top 88%", end: "top 60%", scrub: 0.6 } });
      });

      gsap.utils.toArray(".sbfill").forEach(bar => {
        const w = bar.dataset.w;
        const tl = gsap.timeline({ scrollTrigger: { trigger: bar, scroller, start: "top 85%", toggleActions: "play none none none" } });
        tl.fromTo(bar, { width: "0%" }, { width: w, duration: 1.1, ease: "power3.out" })
          .to(bar, { backgroundPosition: "200% center", duration: 1.2, ease: "power1.inOut", repeat: -1 }, "-=0.3");
      });

      gsap.fromTo(".pdbar", { scaleY: 0, transformOrigin: "bottom" }, { scaleY: 1, stagger: 0.07, duration: 0.8, ease: "elastic.out(1.2, 0.5)", scrollTrigger: { trigger: ".pd-wrap", scroller, start: "top 85%", toggleActions: "play none none none" } });
      gsap.fromTo(".wbar", { scaleY: 0, opacity: 0, transformOrigin: "center" }, { scaleY: 1, opacity: 0.75, stagger: 0.011, duration: 0.25, ease: "back.out(2)", scrollTrigger: { trigger: ".wavef", scroller, start: "top 85%", toggleActions: "play none none none" } });
      gsap.fromTo(".rcat", { x: -60, opacity: 0, rotationY: -25 }, { x: 0, opacity: 1, rotationY: 0, stagger: 0.1, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: ".rcat-wrap", scroller, start: "top 82%", end: "top 36%", scrub: 0.8 } });

      gsap.utils.toArray(".rcat").forEach((cat, ci) => {
        const chips = cat.querySelectorAll(".rcri");
        gsap.fromTo(chips, { scale: 0.5, opacity: 0, y: 20 }, { scale: 1, opacity: 1, y: 0, stagger: 0.06, duration: 0.5, ease: "back.out(2.5)", scrollTrigger: { trigger: cat, scroller, start: "top 78%", toggleActions: "play none none none" }, delay: ci * 0.1 });
      });

      gsap.fromTo(".rbanner", { scale: 0.88, opacity: 0, y: 30, clipPath: "inset(0% 100% 0% 0%)" }, { scale: 1, opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)", scrollTrigger: { trigger: ".rbanner", scroller, start: "top 87%", end: "top 50%", scrub: 0.65 } });
      gsap.fromTo(".start-hl", { y: 85, opacity: 0, skewX: -4 }, { y: 0, opacity: 1, skewX: 0, scrollTrigger: { trigger: ".start-hl", scroller, start: "top 86%", end: "top 40%", scrub: 0.9 } });
      gsap.fromTo(".form-card", { x: 75, opacity: 0, rotationY: 15, transformPerspective: 800 }, { x: 0, opacity: 1, rotationY: 0, scrollTrigger: { trigger: ".form-card", scroller, start: "top 87%", end: "top 42%", scrub: 0.85 } });

      gsap.utils.toArray(".sfi").forEach((el, i) => {
        gsap.fromTo(el, { y: 48, opacity: 0, x: -20 }, { y: 0, opacity: 1, x: 0, duration: 0.6, ease: "power2.out", scrollTrigger: { trigger: ".sfi-wrap", scroller, start: "top 83%", toggleActions: "play none none none" }, delay: i * 0.15 });
      });

      gsap.utils.toArray(".bimg").forEach(img => {
        gsap.fromTo(img, { y: -28 }, { y: 28, ease: "none", scrollTrigger: { trigger: img.parentElement, sc scroller, start: "top bottom", end: "bottom top", scrub: true } });
      });

      gsap.fromTo(".mq-wrap", { opacity: 0, y: 20 }, { opacity: 1, y: 0, scrollTrigger: { trigger: ".mq-wrap", scroller, start: "top 86%", toggleActions: "play none none none" } });

      gsap.utils.toArray(".count-num").forEach(el => {
        const target  = parseFloat(el.dataset.target);
        const isFloat = el.dataset.float === "true";
        const suffix  = el.dataset.suffix || "";
        const proxy   = { val: 0 };
        ScrollTrigger.create({
          trigger: el, scroller, start: "top 85%", once: true,
          onEnter: () => {
            gsap.fromTo(el, { filter: "blur(12px)", opacity: 0.3 }, { filter: "blur(0px)", opacity: 1, duration: 0.8 });
            gsap.fromTo(proxy, { val: 0 }, { val: target, duration: 2.2, ease: "power3.out", onUpdate: () => { el.textContent = isFloat ? proxy.val.toFixed(1) : Math.round(proxy.val) + suffix; } });
          },
        });
      });

      gsap.to("#noise", { backgroundPosition: "100% 100%", ease: "none", scrollTrigger: { trigger: "#main-wrap", scroller, start: "top top", end: "bottom bottom", scrub: true } });
      gsap.utils.toArray(".sec").forEach(sec => { gsap.fromTo(sec, { borderBottomColor: "rgba(255,255,255,0)" }, { borderBottomColor: "rgba(255,255,255,0.07)", scrollTrigger: { trigger: sec, scroller, start: "top 80%", toggleActions: "play none none none" } }); });
      gsap.utils.toArray(".vert-label").forEach(el => { gsap.fromTo(el, { opacity: 0, x: el.classList.contains("vert-right") ? 20 : -20 }, { opacity: 1, x: 0, duration: 0.6, scrollTrigger: { trigger: el, scroller, start: "top 85%", end: "top 55%", scrub: 0.6 } }); });

      const footerLogo = document.querySelector(".ft-logo");
      if (footerLogo) {
        const text = footerLogo.textContent;
        footerLogo.innerHTML = text.split("").map(ch => `<span style="display:inline-block;will-change:transform,opacity">${ch}</span>`).join("");
        gsap.fromTo(footerLogo.querySelectorAll("span"), { y: 40, opacity: 0, rotationX: -50 }, { y: 0, opacity: 1, rotationX: 0, stagger: 0.06, duration: 0.5, ease: "back.out(1.8)", scrollTrigger: { trigger: "#footer", scroller, start: "top 88%", toggleActions: "play none none none" } });
      }

      gsap.fromTo("#footer", { opacity: 0, y: 40 }, { opacity: 1, y: 0, scrollTrigger: { trigger: "#footer", scroller, start: "top 90%", end: "top 60%", scrub: 0.6 } });
      gsap.fromTo(".stat-block", { y: 50, opacity: 0, scale: 0.85 }, { y: 0, opacity: 1, scale: 1, stagger: { each: 0.12, from: "start" }, duration: 0.65, ease: "back.out(1.8)", scrollTrigger: { trigger: ".stats-strip", scroller, start: "top 86%", toggleActions: "play none none none" } });

      ScrollTrigger.create({
        trigger: ".mq-wrap", scroller, start: "top bottom", end: "bottom top", scrub: true,
        onUpdate: self => { const speed = 32 - self.getVelocity() / 400; gsap.to(".mq", { duration: 0.5, "--mq-duration": `${Math.max(8, Math.min(80, speed))}s` }); },
      });

      secRefs.current.forEach((sec, i) => {
        if (!sec) return;
        const colors = [
          "radial-gradient(ellipse at 20% 50%, rgba(79,142,247,0.04) 0%, transparent 65%)",
          "radial-gradient(ellipse at 80% 20%, rgba(125,249,194,0.04) 0%, transparent 65%)",
          "radial-gradient(ellipse at 50% 80%, rgba(79,142,247,0.05) 0%, transparent 65%)",
          "radial-gradient(ellipse at 10% 30%, rgba(125,249,194,0.04) 0%, transparent 65%)",
          "radial-gradient(ellipse at 90% 60%, rgba(79,142,247,0.04) 0%, transparent 65%)",
          "radial-gradient(ellipse at 40% 50%, rgba(125,249,194,0.05) 0%, transparent 65%)",
        ];
        gsap.fromTo(sec, { background: "transparent" }, { background: colors[i] || "transparent", scrollTrigger: { trigger: sec, scroller, start: "top 60%", end: "bottom 60%", scrub: 1 } });
      });

      gsap.fromTo(".chip", { scale: 0, opacity: 0, rotation: -10 }, { scale: 1, opacity: 1, rotation: 0, stagger: { each: 0.04, from: "random" }, duration: 0.45, ease: "back.out(2.2)", scrollTrigger: { trigger: ".chip-row", scroller, start: "top 85%", toggleActions: "play none none none" } });
      gsap.fromTo(".vst", { y: 30, opacity: 0, scale: 0.8 }, { y: 0, opacity: 1, scale: 1, stagger: 0.1, duration: 0.5, ease: "back.out(1.7)", scrollTrigger: { trigger: ".vstats", scroller, start: "top 88%", toggleActions: "play none none none" } });

      ScrollTrigger.create({
        trigger: ".form-card", scroller, start: "top 70%", once: true,
        onEnter: () => {
          const fields = document.querySelectorAll(".field input, .field select");
          fields.forEach((field, i) => {
            setTimeout(() => {
              gsap.fromTo(field, { boxShadow: "0 0 0 0px rgba(125,249,194,0)", borderColor: "rgba(255,255,255,0.07)" }, { boxShadow: "0 0 0 4px rgba(125,249,194,0.08)", borderColor: "rgba(125,249,194,0.35)", duration: 0.4, yoyo: true, repeat: 1, onComplete: () => gsap.set(field, { boxShadow: "", borderColor: "" }) });
            }, i * 180);
          });
        },
      });

      gsap.fromTo(".fquote", { clipPath: "inset(0% 100% 0% 0%)", opacity: 0 }, { clipPath: "inset(0% 0% 0% 0%)", opacity: 1, duration: 1.2, ease: "power2.inOut", scrollTrigger: { trigger: ".fquote", scroller, start: "top 85%", toggleActions: "play none none none" } });
      ScrollTrigger.create({ trigger: ".rbanner", scroller, start: "top 80%", once: true, onEnter: () => { gsap.fromTo(".rb-n", { scale: 3, opacity: 0, rotation: -90, filter: "blur(20px)" }, { scale: 1, opacity: 1, rotation: 0, filter: "blur(0px)", duration: 1.1, ease: "power4.out" }); } });

      secRefs.current.forEach((sec, i) => {
        if (!sec) return;
        const wm = sec.querySelector(".sec-watermark");
        if (!wm) return;
        gsap.fromTo(wm, { x: 80, opacity: 0 }, { x: 0, opacity: 1, scrollTrigger: { trigger: sec, scroller, start: "top 70%", end: "top 20%", scrub: 1 } });
      });

    }, wrapRef);

    return () => {
      ctxGSAP.revert();
      window.removeEventListener("resize", () => {});
      window.removeEventListener("mousemove", () => {});
    };
  }, []);

  const scrollTo = i => {
    const el = secRefs.current[i];
    if (el) wrapRef.current.scrollTo({ top: el.offsetTop - 52, behavior: "smooth" });
  };

  async function handleStart() {
    if (!isAuthenticated) {
      setAuthMode('login');
      return; 
    }

    if (!jobRole.trim()) { setError("Please enter a job role."); return; }
    setError(""); setLoading(true);
    try {
      const d = await api.startInterview(jobRole.trim(), experienceLevel, questionLimit);
      onStart(d);
    } catch (e) {
      console.error(e);
      setError("Failed to start. Check backend.");
    } finally { setLoading(false); }
  }

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      if (showOtpInput) {
        const res = await fetch(`https://persona-ai-production-ac95.up.railway.app/api/auth/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: authEmail, otp })
        }); 
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error);
        
        localStorage.setItem('token', data.token);
        setIsAuthenticated(true);
        setAuthMode(null);
        setShowOtpInput(false);
        return;
      }

      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = { email: authEmail, password: authPass };
      if (authMode === 'register') payload.name = authName;

      const res = await fetch(`https://persona-ai-production-ac95.up.railway.app${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Authentication failed");
      } else {
        if (authMode === 'login') {
          localStorage.setItem('token', data.token);
          setIsAuthenticated(true);
          setAuthMode(null); 
        } else {
          setShowOtpInput(true);
        }
      }
    } catch (err) {
      alert(err.message || "Network error.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOpenHistory = async () => {
    setShowHistory(true);
    setHistoryLoading(true);
    setSelectedInterview(null); 
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://persona-ai-production-ac95.up.railway.app/api/auth/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if(res.ok) {
        const data = await res.json();
        setHistoryData(data);
      } else {
        throw new Error("Failed to fetch");
      }
    } catch(e) {
      console.error("Error fetching history list", e);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleHistoryClick = async (id) => {
    setDetailsLoading(true);
    setSelectedInterview({ id }); 
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://persona-ai-production-ac95.up.railway.app/api/auth/history/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if(res.ok) {
        const data = await res.json();
        setSelectedInterview(data);
      } else {
        setSelectedInterview(null);
      }
    } catch(e) {
      console.error(e);
      setSelectedInterview(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  }

  const Hl = ({ text }) => (
    <h2 className="sec-hl" style={{ perspective: "700px" }}>
      {text.split("\n").map((line, li) => (
        <span key={li} style={{ display: "block" }}>
          {line.split(" ").map((w, wi) => (
            <span key={wi} className="hw" style={{ display: "inline-block", marginRight: "0.2em" }}>{w}</span>
          ))}
        </span>
      ))}
    </h2>
  );

  return (
    <>
      <style>{CSS}</style>
      <div id="main-wrap" ref={wrapRef}>

        {/* Global spotlight */}
        <div id="global-spotlight" ref={spotlightRef} />
        {/* Noise overlay */}
        <div id="noise" />

        {/* ═══════════════════════════════════
            AUTH MODAL
        ═══════════════════════════════════ */}
        {authMode && (
          <div className="auth-overlay">
            <div className="auth-backdrop" onClick={() => { setAuthMode(null); setShowOtpInput(false); }} />
            <div className="bc form-card auth-card">
              <button className="auth-close" onClick={() => { setAuthMode(null); setShowOtpInput(false); }}>✕</button>
              <div className="card-spotlight" />
              <DoodleCorner style={{ position:"absolute", top:14, left:14, opacity:0.4, pointerEvents:"none" }} />
              <DoodleCorner style={{ position:"absolute", bottom:14, right:14, opacity:0.4, transform:"rotate(180deg)", pointerEvents:"none" }} />
              
              <div className="fh">
                <div className="ftt">{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</div>
                <div className="fdot" />
              </div>

              <form onSubmit={handleAuthSubmit}>
                {showOtpInput ? (
                  <div className="field field-full">
                    <label>Verification Code</label>
                    <input
                      type="text"
                      maxLength="6"
                      placeholder="000000"
                      style={{ textAlign: 'center', fontSize: '28px', letterSpacing: '8px', fontFamily: 'monospace' }}
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                      required
                    />
                    <p className="bdesc" style={{ marginTop: '12px', textAlign: 'center' }}>
                      Enter the 6-digit code sent to <br/> <strong style={{ color: 'var(--w)' }}>{authEmail}</strong>
                    </p>
                  </div>
                ) : (
                  <>
                    {authMode === 'register' && (
                      <div className="field field-full">
                        <label>Full Name</label>
                        <input type="text" placeholder="Jane Doe" value={authName} onChange={e => setAuthName(e.target.value)} required />
                      </div>
                    )}
                    <div className="field field-full">
                      <label>Email Address</label>
                      <input type="email" placeholder="name@company.com" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required />
                    </div>
                    <div className="field field-full">
                      <label>Password</label>
                      <input type="password" placeholder="••••••••" value={authPass} onChange={e => setAuthPass(e.target.value)} required />
                    </div>
                  </>
                )}

                <div className="divider" />
                
                <button type="submit" className="btn-go" disabled={authLoading}>
                  <div className="btn-in">
                    {authLoading ? (
                      <><div className="spin" />Processing...</>
                    ) : (
                      <>{showOtpInput ? 'Verify Code →' : (authMode === 'login' ? 'Sign In →' : 'Send Code →')}</>
                    )}
                  </div>
                </button>
              </form>

              {!showOtpInput && (
                <button type="button" className="auth-switch" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
                  {authMode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════
            HISTORY MODAL
        ═══════════════════════════════════ */}
        {showHistory && (
          <div className="auth-overlay">
            <div className="auth-backdrop" onClick={() => setShowHistory(false)} />
            <div className="bc form-card auth-card history-card" style={{ maxWidth: selectedInterview ? '600px' : '500px' }}>
              <button className="auth-close" onClick={() => setShowHistory(false)}>✕</button>
              
              {selectedInterview ? (
                <>
                  <div className="fh" style={{ marginBottom: '16px' }}>
                    <div className="ftt">
                      <button className="history-back" onClick={() => setSelectedInterview(null)}>← Back</button> 
                      Session Details
                    </div>
                  </div>

                  {detailsLoading || !selectedInterview.answers ? (
                     <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--d)' }}><div className="spin" style={{ margin: '0 auto 12px' }}/>Fetching answers...</div>
                  ) : (
                    <>
                      <div className="history-detail-header">
                        <div className="history-role">{selectedInterview.jobRole}</div>
                        <div className="history-lvl">Score: {selectedInterview.overallScore || 'N/A'}% · {selectedInterview.answers.length} Questions</div>
                      </div>
                      
                      <div className="history-list history-detail-list">
                        {selectedInterview.answers.map((ans, idx) => (
                          <div key={idx} className="history-qa-card">
                            <div className="qa-q"><span>Q{idx+1}:</span> {ans.question}</div>
                            <div className="qa-a"><span>Your Answer:</span> {ans.answer || "(No answer provided)"}</div>
                            <div className="qa-f"><span>Payton's Feedback:</span> {ans.feedback}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="fh" style={{ marginBottom: '16px' }}>
                    <div className="ftt">Interview History</div>
                    <div className="fdot" />
                  </div>
                  <p className="bdesc" style={{ marginBottom: '24px' }}>Review your past training sessions and scores.</p>

                  {historyLoading ? (
                    <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--d)' }}><div className="spin" style={{ margin: '0 auto 12px' }}/>Loading history...</div>
                  ) : historyData.length === 0 ? (
                    <div className="history-empty">No interviews taken yet. Time to start training!</div>
                  ) : (
                    <div className="history-list">
                      {historyData.map(h => (
                        <div key={h.id} className="history-item" onClick={() => handleHistoryClick(h.id)}>
                          <div className="history-item-left">
                            <div className="history-role">{h.jobRole} <span className="history-lvl">· {h.experienceLevel}</span></div>
                            <div className="history-date">{h.date} · {h.questionLimit} Questions</div>
                          </div>
                          <div className={`history-score ${h.score >= 60 ? 'pass' : 'fail'}`}>
                            {h.score ? `${h.score}%` : 'N/A'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════
            NEW HERO — CANVAS SEQUENCE
        ═══════════════════════════════════ */}
        <div id="hero-container">
          <canvas ref={canvasRef} id="hero-canvas" />
          
          <nav id="pill-nav">
            <span id="pill-logo">persona.ai</span>
            <div id="pill-links">
              {NAV.map((s, i) => (
                <button key={s} className={`pl ${activeNav === i ? "pl-on" : ""}`} onClick={() => scrollTo(i)}>{s}</button>
              ))}
            </div>
            {isAuthenticated ? (
               <div style={{ display: 'flex', marginLeft: '12px', gap: '4px' }}>
                 <button className="pl" style={{ border: '1px solid rgba(255,255,255,0.15)' }} onClick={handleOpenHistory}>History</button>
                 <button className="pl" style={{ border: '1px solid rgba(255,255,255,0.15)' }} onClick={handleSignOut}>Sign Out</button>
               </div>
            ) : (
               <button className="pl" style={{ marginLeft: '12px', border: '1px solid rgba(255,255,255,0.2)' }} onClick={() => setAuthMode('login')}>Sign In</button>
            )}
          </nav>

          <div id="scroll-hint" style={{ bottom: 30 }}>
            <span>scroll to explore</span>
            <div id="sh-line" />
          </div>
        </div>

        {/* ═══════════════════════════════════
            STICKY NAV
        ═══════════════════════════════════ */}
        <nav id="sticky-nav">
          <span id="sn-logo">persona.ai</span>
          <div id="sn-links">
            {NAV.map((s, i) => (
              <button key={s} className={`snl ${activeNav === i ? "snl-on" : ""}`} onClick={() => scrollTo(i)}>{s}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {isAuthenticated ? (
              <>
                <button className="snl" style={{ border: '1px solid var(--bdr)' }} onClick={handleOpenHistory}>History</button>
                <button className="snl" style={{ border: '1px solid var(--bdr)' }} onClick={handleSignOut}>Sign Out</button>
              </>
            ) : (
              <button className="snl" style={{ border: '1px solid var(--bdr)' }} onClick={() => setAuthMode('login')}>Sign In</button>
            )}
            <button id="sn-cta" onClick={() => scrollTo(5)}>Start free →</button>
          </div>
        </nav>

        {/* ═══════════════════════════════════
            S0 — PAYTON
        ═══════════════════════════════════ */}
        <section className="sec" ref={el => secRefs.current[0] = el}>
          <div className="sec-watermark">01</div>
          <div className="vert-label vert-left">01 — AVATAR</div>

          <div className="sec-label">Payton</div>
          <div className="sec-intro" style={{ position:"relative" }}>
            <Hl text={"Your AI interviewer.\nJust as obsessed\nas you are."} />
            <DoodleBracket className="sec-doodle" style={{ position:"absolute", right:"-60px", top:"10px", opacity:0 }} />
            <p className="sec-sub">Payton is a photorealistic 3D AI interviewer that listens, reacts, and pushes you — exactly like a real panel.</p>
          </div>

          <div className="bg-grid">
            <div className="bc" style={{ gridColumn:"span 8", gridRow:"span 2", minHeight:460 }}>
              <div className="card-spotlight" />
              <div className="bimg" style={{ backgroundImage:`url(${IMGS.face})` }} />
              <div className="bov" />
              <div className="bct">
                <div className="btag">Payton · 3D AI Interviewer</div>
                <div className="bbig">Lifelike.<br />Relentless.</div>
              </div>
              <div className="bglow" style={{ background:"radial-gradient(circle,rgba(79,142,247,0.4),transparent 70%)", bottom:-100, right:-60, width:400, height:400 }} />
              <DoodleCorner style={{ position:"absolute", top:16, left:16, opacity:0.6, transform:"none", pointerEvents:"none" }} />
              <DoodleCorner style={{ position:"absolute", bottom:16, right:16, opacity:0.6, transform:"rotate(180deg)", pointerEvents:"none" }} />
            </div>

            <div className="bc" style={{ gridColumn:"span 4" }}>
              <div className="card-spotlight" />
              <DoodleSpiral style={{ position:"absolute", top:-10, right:-10, opacity:0.5, pointerEvents:"none" }} />
              <div className="bnum count-num" data-target="3" data-suffix="D">0D</div>
              <div className="blabel">Photorealistic Avatar</div>
              <div className="bdesc">MetaHuman-grade rendering — expressions, gaze, and microreactions in real time.</div>
            </div>

            <div className="bc" style={{ gridColumn:"span 4" }}>
              <div className="card-spotlight" />
              <div className="bimg" style={{ backgroundImage:`url(${IMGS.neural})`, opacity:0.3 }} />
              <div className="bct" style={{ position:"relative", zIndex:2 }}>
                <div className="btag">Neural Engine</div>
                <div className="btitle">Real-time emotion<br />&amp; tone analysis</div>
              </div>
            </div>

            <div className="bc mq-card" style={{ gridColumn:"span 12", minHeight:"auto", padding:0 }}>
              <div className="mq-wrap">
                <div className="mq">
                  {[...Array(2)].flatMap(() =>
                    ["Tell me about yourself","Why should we hire you?","Describe a challenge","Where do you see yourself in 5 years?","Walk me through your resume","What's your greatest weakness?","Why this role?"]
                      .map((q, i) => <span key={`${q}${i}`} className="mqi">"{q}" <span className="mqd">·</span></span>)
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="doodle-row">
            <DoodleWave className="sec-doodle" style={{ opacity:0 }} />
            <DoodleDots className="sec-doodle" style={{ opacity:0 }} />
            <DoodleCross className="sec-doodle" style={{ opacity:0 }} size={30} />
          </div>
        </section>

        {/* ═══════════════════════════════════
            S1 — INTELLIGENCE
        ═══════════════════════════════════ */}
        <section className="sec" ref={el => secRefs.current[1] = el}>
          <div className="sec-watermark">02</div>
          <div className="vert-label vert-right">02 — INTELLIGENCE</div>
          <div className="sec-label">Intelligence</div>
          <div className="sec-intro" style={{ position:"relative" }}>
            <Hl text={"AI that knows\nwhat you need\nbefore you do."} />
            <DoodleCircle size={100} opacity={0.09} className="sec-doodle" style={{ position:"absolute", right:"-20px", bottom:"0px", opacity:0 }} />
            <p className="sec-sub">Every question is generated fresh. Every session adapts to your level, role, and gaps in real time.</p>
          </div>

          <div className="stats-strip">
            {[
              { num:"98%",  label:"Relevance",  note:"vs actual interview Qs" },
              { num:"10K+", label:"Hours trained",note:"on real interview data" },
              { num:"∞",    label:"Roles",        note:"any job title supported" },
              { num:"3s",   label:"Warm-up",      note:"from config to live Payton" },
            ].map(({ num, label, note }) => (
              <div key={label} className="stat-block">
                <div className="sb-num">{num}</div>
                <div className="sb-label">{label}</div>
                <div className="sb-note">{note}</div>
              </div>
            ))}
          </div>
          <div className="draw-line" />

          <div className="bg-grid" style={{ marginTop:40 }}>
            <div className="bc" style={{ gridColumn:"span 5", gridRow:"span 2", minHeight:380 }}>
              <div className="card-spotlight" />
              <div className="bimg" style={{ backgroundImage:`url(${IMGS.ai})`, opacity:0.45 }} />
              <div className="bov" />
              <div className="bct" style={{ position:"relative", zIndex:2 }}>
                <div className="btag">Generative Questions</div>
                <div className="btitle">No two interviews<br />are the same.</div>
                <p className="bdesc" style={{ marginTop:10 }}>GPT-powered generation tailored to your exact job title, seniority, and previous answers.</p>
              </div>
            </div>

            <div className="bc" style={{ gridColumn:"span 7" }}>
              <div className="card-spotlight" />
              <div className="bct">
                <div className="btag">Role Intelligence</div>
                <div className="btitle">∞ job roles supported</div>
              </div>
              <div className="chip-row">
                {["Backend Engineer","Product Manager","Data Scientist","UX Designer","DevOps","ML Engineer","Frontend Dev","Sales Lead","Finance Analyst","CTO","Founder","HR Manager"].map(r => (
                  <div key={r} className="chip">{r}</div>
                ))}
              </div>
            </div>

            <div className="bc" style={{ gridColumn:"span 4" }}>
              <div className="card-spotlight" />
              <DoodleDots style={{ position:"absolute", bottom:12, right:8, opacity:0.8, pointerEvents:"none" }} />
              <div className="bnum" style={{ fontSize:"clamp(48px,5.5vw,84px)" }}>98%</div>
              <div className="blabel">Question relevance</div>
              <div className="bdesc">Rated by beta users vs. real questions at top companies.</div>
            </div>

            <div className="bc" style={{ gridColumn:"span 3" }}>
              <div className="card-spotlight" />
              <div className="bimg" style={{ backgroundImage:`url(${IMGS.circuit})`, opacity:0.2 }} />
              <div className="bct" style={{ position:"relative", zIndex:2 }}>
                <div className="btag">Adaptive</div>
                <div className="btitle">Gets harder<br />as you improve.</div>
              </div>
            </div>
          </div>

          <div className="doodle-row" style={{ justifyContent:"flex-end" }}>
            <DoodleArrow className="sec-doodle" style={{ opacity:0 }} />
            <DoodleHex   className="sec-doodle" style={{ opacity:0 }} />
          </div>
        </section>

        {/* ═══════════════════════════════════
            S2 — VOICE
        ═══════════════════════════════════ */}
        <section className="sec" ref={el => secRefs.current[2] = el}>
          <div className="sec-watermark">03</div>
          <div className="vert-label vert-left">03 — VOICE</div>
          <div className="sec-label">Voice</div>
          <div className="sec-intro">
            <Hl text={"Speak naturally.\nWe hear everything."} />
            <p className="sec-sub">Real-time speech analysis — filler words, pacing, tone, and confidence, all measured live.</p>
          </div>

          <div className="bg-grid">
            <div className="bc voice-main" style={{ gridColumn:"span 12" }}>
              <div className="card-spotlight" />
              <div className="bimg" style={{ backgroundImage:`url(${IMGS.voice})`, opacity:0.14 }} />
              <div className="wavef">
                {Array.from({ length: 74 }, (_, i) => {
                  const h = 6 + Math.abs(Math.sin(i * 0.63) * Math.cos(i * 0.27) * 60);
                  return <div key={i} className="wbar" style={{ height:h, animationDelay:`${(i*0.035).toFixed(2)}s` }} />;
                })}
              </div>
              <div className="bct" style={{ position:"relative", zIndex:2 }}>
                <div className="btag">Live Transcription</div>
                <div className="bbig">Every word.<br />Every pause.<br />Analyzed.</div>
              </div>
              <div className="vstats">
                {[["Pace","142 WPM"],["Filler Words","3 detected"],["Confidence","87%"],["Clarity","A+"]].map(([k,v]) => (
                  <div key={k} className="vst"><div className="vsv">{v}</div><div className="vsk">{k}</div></div>
                ))}
              </div>
              <DoodleWave style={{ position:"absolute", top:20, right:0, width:"40%", opacity:0.3, pointerEvents:"none" }} />
            </div>

            <div className="bc" style={{ gridColumn:"span 6" }}>
              <div className="card-spotlight" />
              <DoodleCross size={30} style={{ position:"absolute", top:14, right:14, opacity:0.5, pointerEvents:"none" }} />
              <div className="btag">Detection</div>
              <div className="btitle">Catches "um", "uh", "like"<br />in real time.</div>
              <p className="bdesc" style={{ marginTop:10 }}>Trained on 10,000+ hours of interview recordings from top companies.</p>
            </div>

            <div className="bc" style={{ gridColumn:"span 6" }}>
              <div className="card-spotlight" />
              <div className="bimg" style={{ backgroundImage:`url(${IMGS.brain})`, opacity:0.2 }} />
              <div className="bct" style={{ position:"relative", zIndex:2 }}>
                <div className="btag">Multilingual ASR</div>
                <div className="btitle">Understands accents.<br />Globally trained.</div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            S3 — FEEDBACK
        ═══════════════════════════════════ */}
        <section className="sec" ref={el => secRefs.current[3] = el}>
          <div className="sec-watermark">04</div>
          <div className="vert-label vert-right">04 — FEEDBACK</div>
          <div className="sec-label">Feedback</div>
          <div className="sec-intro" style={{ position:"relative" }}>
            <Hl text={"Not just scores.\nA full debrief."} />
            <DoodleGrid className="sec-doodle" style={{ position:"absolute", right:"-30px", top:0, opacity:0 }} />
            <p className="sec-sub">After every session — a complete breakdown of what landed, what didn't, and exactly how to fix it.</p>
          </div>

          <div className="bg-grid">
            <div className="bc" style={{ gridColumn:"span 4", gridRow:"span 2" }}>
              <div className="card-spotlight" />
              <DoodleCorner style={{ position:"absolute", top:12, right:12, opacity:0.5, transform:"rotate(90deg)", pointerEvents:"none" }} />
              <div className="btag">Score Report</div>
              <div className="btitle" style={{ marginBottom:22 }}>Performance<br />at a glance.</div>
              <div className="sbars">
                {[["Technical Depth",82],["Communication",91],["Structure",76],["Confidence",88],["Relevance",95]].map(([k,v]) => (
                  <div key={k} className="sbr">
                    <div className="sbrl">{k}</div>
                    <div className="sbrt"><div className="sbfill" data-w={`${v}%`} /></div>
                    <div className="sbrv">{v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bc" style={{ gridColumn:"span 8", minHeight:260 }}>
              <div className="card-spotlight" />
              <div className="bimg" style={{ backgroundImage:`url(${IMGS.interview})`, opacity:0.28 }} />
              <div className="bov" />
              <div className="bct" style={{ position:"relative", zIndex:2 }}>
                <div className="btag">AI Commentary</div>
                <div className="btitle">Payton gives you<br />the honest truth.</div>
                <div className="fquote">"Your answer showed strong knowledge but lacked a concrete outcome. Try structuring with STAR next time."</div>
              </div>
            </div>

            <div className="bc" style={{ gridColumn:"span 4" }}>
              <div className="card-spotlight" />
              <div className="bnum" style={{ color:"#fff" }}>A+</div>
              <div className="blabel">Avg grade after 5 sessions</div>
            </div>

            <div className="bc" style={{ gridColumn:"span 4" }}>
              <div className="card-spotlight" />
              <DoodleSpiral style={{ position:"absolute", bottom:8, right:8, opacity:0.5, pointerEvents:"none" }} />
              <div className="btag">Growth Tracking</div>
              <div className="btitle">Progress across<br />every session.</div>
              <div className="pd-wrap">
                {[40,55,62,70,78,82,91].map((v, i) => (
                  <div key={i} className="pdbar" style={{ height:`${v}%` }} />
                ))}
              </div>
            </div>
          </div>

          <div className="doodle-row">
            <DoodleDots className="sec-doodle" style={{ opacity:0 }} />
            <DoodleWave className="sec-doodle" style={{ opacity:0 }} />
          </div>
        </section>

        {/* ═══════════════════════════════════
            S4 — ROLES
        ═══════════════════════════════════ */}
        <section className="sec" ref={el => secRefs.current[4] = el}>
          <div className="sec-watermark">05</div>
          <div className="vert-label vert-left">05 — ROLES</div>
          <div className="sec-label">Roles</div>
          <div className="sec-intro">
            <Hl text={"Every industry.\nEvery level.\nEvery role."} />
            <p className="sec-sub">From fresh graduates to C-suite — Payton is trained on thousands of real interview formats.</p>
          </div>

          <div className="rcat-wrap">
            {[
              { title:"Engineering",      roles:["Backend Engineer","Frontend Dev","Full-Stack","DevOps","ML Engineer","Mobile Dev"] },
              { title:"Product & Design", roles:["Product Manager","UX Designer","UI Designer","Product Designer","Research","Design Lead"] },
              { title:"Business",         roles:["Sales","Marketing","Finance","HR","Operations","Strategy"] },
              { title:"Leadership",       roles:["CTO","VP Eng","Director","Team Lead","Founder","COO"] },
            ].map(({ title, roles }) => (
              <div key={title} className="rcat">
                <div className="rct">{title}</div>
                <div className="rcr">
                  {roles.map(r => <div key={r} className="rcri">{r}</div>)}
                </div>
              </div>
            ))}
          </div>

          <div className="rbanner">
            <DoodleHex style={{ position:"absolute", left:24, top:"50%", transform:"translateY(-50%)", opacity:0.4, pointerEvents:"none" }} />
            <div className="rb-n">∞</div>
            <div className="rb-t">More roles added every week based on user demand.</div>
            <div className="rb-s">Can't find yours? Type any job title — Payton figures it out.</div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            S5 — START
        ═══════════════════════════════════ */}
        <section className="sec start-sec" ref={el => secRefs.current[5] = el}>
          <div className="sec-watermark">06</div>
          <div className="vert-label vert-right">06 — START</div>
          <div className="sec-label">Start</div>
          <div className="start-layout">
            <div className="start-l">
              <DoodleCircle size={180} opacity={0.07} className="sec-doodle" style={{ position:"absolute", top:-40, left:-60, opacity:0 }} />
              <h2 className="start-hl">Your next<br />interview<br />starts here.</h2>
              <p className="start-sub">Configure your session. Payton will be ready in seconds.</p>
              <div className="sfi-wrap">
                {[
                  ["01","Instant Setup","Pick your role and level. Payton generates the interview on the fly."],
                  ["02","Real-time AI","Live 3D avatar. Real voice. Real reactions. No scripts."],
                  ["03","Full Debrief","Detailed scoring, feedback, and improvement plan after every session."],
                ].map(([n,t,d]) => (
                  <div key={n} className="sfi">
                    <div className="sfin">{n}</div>
                    <div><div className="sfit">{t}</div><div className="sfid">{d}</div></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="start-r">
              <div className="bc form-card" ref={formRef}>
                <div className="card-spotlight" />
                <DoodleCorner style={{ position:"absolute", top:14, left:14, opacity:0.4, pointerEvents:"none" }} />
                <DoodleCorner style={{ position:"absolute", bottom:14, right:14, opacity:0.4, transform:"rotate(180deg)", pointerEvents:"none" }} />
                <div className="fh">
                  <div className="ftt">Configure Interview</div>
                  <div className="fdot" />
                </div>

                <div className="field field-full">
                  <label>Job Role</label>
                  <input
                    placeholder="e.g. Backend Developer, Product Manager..."
                    value={jobRole} onChange={e => setJobRole(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleStart()}
                  />
                </div>

                <div className="form-row">
                  <div className="field">
                    <label>Experience Level</label>
                    <div className="sel-wrap">
                      <select value={experienceLevel} onChange={e => setLevel(e.target.value)}>
                        <option>Fresher</option><option>Junior</option><option>Mid</option><option>Senior</option>
                      </select>
                    </div>
                  </div>
                  <div className="field">
                    <label>Questions</label>
                    <div className="sel-wrap">
                      <select value={questionLimit} onChange={e => setQLimit(Number(e.target.value))}>
                        <option value={3}>3 Questions</option>
                        <option value={5}>5 Questions</option>
                        <option value={10}>10 Questions</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="divider" />
                <button className="btn-go" onClick={handleStart} disabled={loading}>
                  <div className="btn-in">
                    {loading ? <><div className="spin" />Preparing Payton...</> : <>Start Interview →</>}
                  </div>
                </button>

                {error && <div className="err">⚠ {error}</div>}
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer id="footer">
          <div className="ft-doodle-row">
            <DoodleWave />
            <DoodleDots />
            <DoodleCross size={28} />
            <DoodleHex />
          </div>
          <div className="draw-line" style={{ marginBottom:40 }} />
          <div className="ft-top">
            <div className="ft-logo">persona.ai</div>
            <div className="ft-links">
              {["Privacy","Terms","About","Contact"].map(l => <span key={l} className="ftl">{l}</span>)}
            </div>
          </div>
          <div className="ft-bot">
            <span className="ft-copy">© 2026 persona.ai · All rights reserved</span>
            <span className="ft-tag">The Intelligence Edition · Winter 2026</span>
          </div>
        </footer>

      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CSS
═══════════════════════════════════════════════════════════════ */
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

* { box-sizing:border-box; margin:0; padding:0; }

/* ── SCROLLABLE WRAP ── */
#main-wrap {
  width:100vw; height:100vh;
  overflow-y:scroll; overflow-x:hidden;
  background:var(--bg);
  font-family:'Bricolage Grotesque',sans-serif;
  color:var(--w);
  -webkit-font-smoothing:antialiased;
}

/* ── GLOBAL SPOTLIGHT ── */
#global-spotlight {
  position:fixed; inset:0;
  pointer-events:none; z-index:1;
  width:600px; height:600px;
  border-radius:50%;
  background:radial-gradient(circle, rgba(125,249,194,0.03) 0%, transparent 70%);
  will-change:transform;
  mix-blend-mode:screen;
}

/* ── NOISE OVERLAY ── */
#noise {
  position:fixed; inset:0;
  pointer-events:none; z-index:9999;
  opacity:0.028;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-size:180px 180px;
  mix-blend-mode:overlay;
}

/* ── CARD SPOTLIGHT ── */
.card-spotlight {
  position:absolute;
  width:300px; height:300px;
  border-radius:50%;
  background:radial-gradient(circle, rgba(125,249,194,0.09) 0%, transparent 70%);
  pointer-events:none; z-index:1;
  opacity:0;
  will-change:transform,opacity;
  transform:translate(-150px,-150px);
}

/* ── DOODLES ── */
.doodle { pointer-events:none; flex-shrink:0; }
.sec-doodle { will-change:transform,opacity; }
.doodle-row { display:flex; align-items:center; gap:24px; margin-top:48px; opacity:0.65; }
.ft-doodle-row { display:flex; align-items:center; gap:24px; margin-bottom:32px; opacity:0.5; }

/* ── SECTION WATERMARK ── */
.sec-watermark {
  position:absolute; top:50%; right:5vw; transform:translateY(-50%);
  font-family:'Bebas Neue',sans-serif; font-size:clamp(120px,16vw,240px);
  color:rgba(255,255,255,0.018); line-height:1; pointer-events:none; user-select:none;
  will-change:transform,opacity; z-index:0;
}

/* ── VERTICAL LABELS ── */
.vert-label {
  position:absolute; font-size:9px; font-weight:700; letter-spacing:4px;
  text-transform:uppercase; color:rgba(255,255,255,0.18);
  writing-mode:vertical-rl; text-orientation:mixed; will-change:transform,opacity; top:50%;
}
.vert-left  { left:-44px; transform:translateY(-50%) rotate(180deg); }
.vert-right { right:-44px; transform:translateY(-50%); }

/* ── DRAW LINE ── */
.draw-line {
  height:1px; background:linear-gradient(90deg, var(--a) 0%, rgba(79,142,247,0.4) 50%, transparent 100%);
  margin-bottom:56px; will-change:transform;
}

/* ── STATS STRIP ── */
.stats-strip {
  display:grid; grid-template-columns:repeat(4,1fr); gap:1px; background:var(--bdr);
  border:1px solid var(--bdr); border-radius:12px; overflow:hidden; margin-bottom:24px;
}
.stat-block { background:var(--c1); padding:28px 24px; position:relative; transition:background 0.3s; will-change:transform,opacity; }
.stat-block:hover { background:#141414; }
.stat-block::after {
  content:''; position:absolute; inset:0;
  background:linear-gradient(135deg,rgba(125,249,194,0.04),transparent 60%); opacity:0; transition:opacity 0.3s;
}
.stat-block:hover::after { opacity:1; }
.sb-num { font-family:'Bebas Neue',sans-serif; font-size:clamp(36px,4vw,60px); color:var(--w); line-height:1; margin-bottom:6px; }
.sb-label { font-size:10px; font-weight:700; letter-spacing:3px; text-transform:uppercase; color:var(--a); margin-bottom:6px; }
.sb-note { font-size:12px; font-weight:300; color:var(--d); }

/* ════════════════════════════════════
   NEW CANVAS HERO (CLEANED)
════════════════════════════════════ */
#hero-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #000;
  overflow: hidden;
}
#hero-canvas {
  display: block;
  width: 100%;
  height: 100vh;
}

#pill-nav { position:absolute; top:26px; left:50%; transform:translateX(-50%); display:flex; align-items:center; background:rgba(0,0,0,0.55); backdrop-filter:blur(18px); border:1px solid rgba(255,255,255,0.1); border-radius:50px; padding:7px 8px 7px 22px; z-index:50; white-space:nowrap; }
#pill-logo { font-family:'Bebas Neue',sans-serif; font-size:17px; letter-spacing:5px; color:rgba(255,255,255,0.88); margin-right:18px; }
#pill-links { display:flex; gap:2px; }
.pl { background:none; border:none; cursor:pointer; padding:5px 13px; border-radius:40px; font-size:12px; font-weight:600; color:rgba(255,255,255,0.45); transition:all 0.2s; font-family:'Bricolage Grotesque',sans-serif; }
.pl:hover { color:rgba(255,255,255,0.88); background:rgba(255,255,255,0.07); }
.pl-on { color:#000!important; background:#fff!important; }

#scroll-hint { position:absolute; bottom:34px; left:50%; transform:translateX(-50%); display:flex; flex-direction:column; align-items:center; gap:10px; opacity:0.4; pointer-events:none; z-index:20; will-change:opacity,transform; }
#scroll-hint span { font-size:9px; font-weight:700; letter-spacing:4px; text-transform:uppercase; color:rgba(255,255,255,0.38); }
#sh-line { width:1px; height:46px; background:linear-gradient(180deg,rgba(255,255,255,0.5),transparent); animation:shp 2.2s ease-in-out infinite; }
@keyframes shp { 0%,100%{opacity:0.5;transform:scaleY(1)} 50%{opacity:0.12;transform:scaleY(0.4)} }

/* ════════════════════════════════════
   STICKY NAV
════════════════════════════════════ */
#sticky-nav { 
  position:sticky; top:0; z-index:100; 
  background:rgba(0,0,0,0.2); backdrop-filter:blur(20px); 
  border-bottom:1px solid rgba(255,255,255,0.04); 
  display:flex; align-items:center; justify-content:space-between; 
  padding:0 5vw; height:52px; 
}
#sn-logo { font-family:'Bebas Neue',sans-serif; font-size:18px; letter-spacing:5px; color:rgba(255,255,255,0.78); }
#sn-links { display:flex; }
.snl { background:none; border:none; cursor:pointer; padding:6px 16px; font-size:12px; font-weight:500; color:var(--d); transition:color 0.2s; font-family:'Bricolage Grotesque',sans-serif; border-radius:4px; }
.snl:hover { color:rgba(255,255,255,0.85); }
.snl-on { color:var(--w)!important; background:rgba(255,255,255,0.07); }
#sn-cta { background:var(--w); color:var(--bg); border:none; padding:7px 18px; border-radius:6px; font-size:12px; font-weight:700; cursor:pointer; transition:background 0.2s,transform 0.15s; font-family:'Bricolage Grotesque',sans-serif; position:relative; overflow:hidden; }
#sn-cta::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent); transform:translateX(-100%); transition:transform 0.4s; }
#sn-cta:hover::after { transform:translateX(100%); }
#sn-cta:hover { background:var(--a); transform:translateY(-1px); }

/* ════════════════════════════════════
   SECTIONS
════════════════════════════════════ */
.sec { padding:96px 5vw 64px; border-bottom:1px solid transparent; position:relative; overflow:hidden; }
.sec-label { font-size:11px; font-weight:700; letter-spacing:4px; text-transform:uppercase; color:var(--d); margin-bottom:48px; display:flex; align-items:center; gap:14px; will-change:transform,opacity; }
.sec-label::after { content:''; flex:0 0 48px; height:1px; background:rgba(255,255,255,0.13); }
.sec-intro { max-width:700px; margin-bottom:58px; position:relative; }
.sec-hl { font-family:'Bebas Neue',sans-serif; font-size:clamp(52px,6.5vw,96px); line-height:0.91; letter-spacing:1.5px; color:var(--w); margin-bottom:22px; }
.hw { will-change:transform,opacity; }
.sc { will-change:transform,opacity,filter; display:inline-block!important; }
.sec-sub { font-size:16px; font-weight:300; line-height:1.75; color:var(--m); max-width:520px; will-change:transform,opacity,filter; }

/* ════════════════════════════════════
   BENTO
════════════════════════════════════ */
.bg-grid { display:grid; grid-template-columns:repeat(12,1fr); gap:10px; }
.bc {
  background:var(--c1); border:1px solid var(--bdr); border-radius:14px; padding:26px;
  position:relative; overflow:hidden; min-height:192px;
  transition:border-color 0.3s,box-shadow 0.3s;
  will-change:transform,opacity;
  transform-style:preserve-3d;
}
.bc:hover { border-color:var(--b2); box-shadow:0 0 0 1px rgba(255,255,255,0.04),0 20px 60px rgba(0,0,0,0.6); }
.bimg { position:absolute; inset:0; background-size:cover; background-position:center; border-radius:14px; will-change:transform; }
.bov  { position:absolute; inset:0; background:linear-gradient(155deg,rgba(0,0,0,0.12),rgba(0,0,0,0.82)); border-radius:14px; }
.bct  { position:relative; z-index:2; height:100%; display:flex; flex-direction:column; justify-content:flex-end; }
.btag { font-size:10px; font-weight:700; letter-spacing:3px; text-transform:uppercase; color:var(--d); margin-bottom:9px; }
.btitle { font-family:'Bebas Neue',sans-serif; font-size:clamp(22px,2.4vw,36px); line-height:1; letter-spacing:1px; color:var(--w); margin-bottom:9px; }
.bbig { font-family:'Bebas Neue',sans-serif; font-size:clamp(38px,4.5vw,70px); line-height:0.88; letter-spacing:1.5px; color:var(--w); }
.bdesc { font-size:13px; font-weight:300; line-height:1.65; color:var(--m); max-width:340px; }
.bnum { font-family:'Bebas Neue',sans-serif; font-size:clamp(52px,6vw,90px); line-height:1; color:var(--a); margin-bottom:6px; }
.blabel { font-size:10px; font-weight:700; letter-spacing:2.5px; text-transform:uppercase; color:var(--d); margin-bottom:10px; }
.bglow { position:absolute; border-radius:50%; filter:blur(80px); pointer-events:none; }

/* Marquee */
.mq-card { padding:0!important; min-height:auto!important; }
.mq-wrap { padding:22px 28px; overflow:hidden; will-change:opacity,transform; }
.mq { display:flex; white-space:nowrap; animation:mqa 32s linear infinite; }
.mqi { font-family:'Bebas Neue',sans-serif; font-size:clamp(18px,2.2vw,30px); letter-spacing:1px; color:rgba(255,255,255,0.12); padding:0 22px; transition:color 0.3s; }
.mqi:hover { color:rgba(255,255,255,0.35); }
.mqd { color:var(--a); opacity:0.55; }
@keyframes mqa { from{transform:translateX(0)} to{transform:translateX(-50%)} }

/* Chips */
.chip-row { display:flex; flex-wrap:wrap; gap:7px; margin-top:16px; }
.chip {
  font-size:11px; font-weight:600; color:var(--m);
  background:rgba(255,255,255,0.04); border:1px solid var(--bdr);
  padding:6px 13px; border-radius:40px;
  transition:all 0.25s; cursor:pointer;
  will-change:transform,opacity;
}
.chip:hover { background:rgba(255,255,255,0.1); color:var(--w); border-color:rgba(125,249,194,0.35); transform:translateY(-2px) scale(1.04); }

/* Voice */
.voice-main { min-height:360px; display:flex; flex-direction:column; gap:16px; }
.wavef { display:flex; align-items:center; gap:2.5px; padding:20px 0 12px; position:relative; z-index:2; flex-shrink:0; }
.wbar { width:3px; background:var(--a); border-radius:2px; min-height:4px; opacity:0; will-change:transform,opacity; animation:wa 1.3s ease-in-out infinite alternate; }
@keyframes wa { from{transform:scaleY(0.2);opacity:0.25} to{transform:scaleY(1);opacity:0.88} }
.vstats { display:flex; gap:28px; padding-top:18px; border-top:1px solid rgba(255,255,255,0.06); margin-top:auto; position:relative; z-index:2; }
.vst { display:flex; flex-direction:column; gap:4px; will-change:transform,opacity; }
.vsv { font-family:'Bebas Neue',sans-serif; font-size:22px; letter-spacing:1px; color:var(--w); }
.vsk { font-size:10px; font-weight:600; letter-spacing:2px; text-transform:uppercase; color:var(--d); }

/* Score bars */
.sbars { display:flex; flex-direction:column; gap:12px; margin-top:18px; }
.sbr { display:flex; align-items:center; gap:10px; }
.sbrl { font-size:11px; font-weight:500; color:var(--m); width:128px; flex-shrink:0; }
.sbrt { flex:1; height:3px; background:rgba(255,255,255,0.07); border-radius:2px; overflow:hidden; }
.sbfill {
  height:100%;
  background:linear-gradient(90deg, var(--a2), var(--a), var(--a2));
  background-size:200% 100%;
  border-radius:2px; width:0%;
}
.sbrv { font-size:12px; font-weight:700; color:var(--a); width:26px; text-align:right; }
.fquote { margin-top:14px; font-size:14px; font-weight:300; line-height:1.7; color:rgba(255,255,255,0.6); font-style:italic; border-left:2px solid var(--a); padding-left:14px; will-change:clip-path,opacity; }

/* Progress bars */
.pd-wrap { display:flex; align-items:flex-end; gap:7px; height:66px; margin-top:18px; }
.pdbar { flex:1; background:linear-gradient(180deg,var(--a2),var(--a)); border-radius:3px 3px 0 0; will-change:transform; }

/* Roles */
.rcat-wrap { display:grid; grid-template-columns:repeat(4,1fr); gap:1px; background:var(--bdr); border:1px solid var(--bdr); border-radius:12px; overflow:hidden; margin-bottom:48px; }
.rcat { background:var(--c1); padding:30px 26px; will-change:transform,opacity; transition:background 0.3s; }
.rcat:hover { background:#141414; }
.rct { font-family:'Bebas Neue',sans-serif; font-size:20px; letter-spacing:2px; color:var(--w); margin-bottom:18px; padding-bottom:14px; border-bottom:1px solid var(--bdr); }
.rcr { display:flex; flex-direction:column; gap:8px; }
.rcri { font-size:13px; font-weight:400; color:var(--m); padding:7px 0; border-bottom:1px solid rgba(255,255,255,0.04); cursor:pointer; transition:color 0.2s,padding-left 0.2s; will-change:transform,opacity; }
.rcri:hover { color:var(--w); padding-left:6px; }
.rbanner { display:flex; align-items:center; gap:28px; background:var(--c1); border:1px solid var(--bdr); border-radius:12px; padding:32px 36px; will-change:transform,opacity,clip-path; position:relative; overflow:hidden; }
.rb-n { font-family:'Bebas Neue',sans-serif; font-size:68px; color:var(--a); line-height:1; flex-shrink:0; position:relative; z-index:2; will-change:transform,opacity,filter; }
.rb-t { font-family:'Bebas Neue',sans-serif; font-size:24px; letter-spacing:1px; color:var(--w); line-height:1.1; position:relative; z-index:2; }
.rb-s { font-size:14px; font-weight:300; color:var(--d); margin-left:auto; max-width:260px; text-align:right; position:relative; z-index:2; }

/* Start */
.start-sec { border-bottom:none; }
.start-layout { display:grid; grid-template-columns:1fr 1fr; gap:80px; align-items:start; }
.start-l { position:relative; }
.start-hl { font-family:'Bebas Neue',sans-serif; font-size:clamp(58px,7.5vw,108px); line-height:0.89; letter-spacing:1.5px; color:var(--w); margin-bottom:22px; will-change:transform,opacity; }
.start-sub { font-size:15px; font-weight:300; line-height:1.75; color:var(--m); margin-bottom:42px; }
.sfi-wrap { display:flex; flex-direction:column; border-top:1px solid var(--bdr); }
.sfi { display:flex; gap:18px; padding:20px 0; border-bottom:1px solid var(--bdr); align-items:flex-start; will-change:transform,opacity; }
.sfin { font-family:'Bebas Neue',sans-serif; font-size:13px; letter-spacing:2px; color:var(--a); opacity:0.65; flex-shrink:0; padding-top:2px; }
.sfit { font-size:14px; font-weight:700; color:var(--w); margin-bottom:4px; }
.sfid { font-size:13px; font-weight:300; line-height:1.6; color:var(--d); }

/* Form card */
.form-card { padding:34px; border-color:var(--b2)!important; min-height:unset!important; will-change:transform,opacity; }
.fh { display:flex; align-items:center; justify-content:space-between; margin-bottom:26px; }
.ftt { font-family:'Bebas Neue',sans-serif; font-size:18px; letter-spacing:4px; text-transform:uppercase; color:var(--w); display:flex; align-items:center; gap:12px; }
.fdot { width:8px; height:8px; border-radius:50%; background:var(--a); box-shadow:0 0 12px var(--a); animation:dp 2s ease-in-out infinite; }
@keyframes dp { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }

.field { display:flex; flex-direction:column; gap:7px; }
.field-full { margin-bottom:13px; }
.form-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px; }
.field label { font-size:9px; font-weight:700; letter-spacing:3px; text-transform:uppercase; color:var(--d); }
.field input,.field select { background:rgba(255,255,255,0.04); border:1px solid var(--bdr); border-radius:8px; padding:11px 15px; font-size:14px; font-family:'Bricolage Grotesque',sans-serif; font-weight:400; color:var(--w); outline:none; transition:border-color 0.2s,box-shadow 0.2s,background 0.2s; appearance:none; -webkit-appearance:none; width:100%; }
.field input::placeholder { color:rgba(255,255,255,0.18); }
.field input:focus,.field select:focus { border-color:rgba(125,249,194,0.42); background:rgba(125,249,194,0.03); box-shadow:0 0 0 3px rgba(125,249,194,0.05); }
.field select option { background:#111; color:var(--w); }
.sel-wrap { position:relative; }
.sel-wrap::after { content:'▾'; position:absolute; right:13px; top:50%; transform:translateY(-50%); color:var(--d); pointer-events:none; font-size:11px; }
.divider { height:1px; background:var(--bdr); margin:18px 0; }
.btn-go { width:100%; padding:15px; border:none; border-radius:9px; font-family:'Bebas Neue',sans-serif; font-size:16px; letter-spacing:4px; cursor:pointer; transition:background 0.2s,transform 0.2s,box-shadow 0.2s; background:var(--w); color:var(--bg); box-shadow:0 4px 28px rgba(255,255,255,0.1); position:relative; overflow:hidden; }
.btn-go::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent); transform:translateX(-100%); transition:transform 0.5s; }
.btn-go:hover:not(:disabled)::after { transform:translateX(100%); }
.btn-go:hover:not(:disabled) { background:var(--a); transform:translateY(-2px); box-shadow:0 8px 38px rgba(125,249,194,0.3); }
.btn-go:active:not(:disabled) { transform:translateY(0); }
.btn-go:disabled { opacity:0.35; cursor:not-allowed; }
.btn-in { display:flex; align-items:center; justify-content:center; gap:12px; position:relative; z-index:1; }
.spin { width:15px; height:15px; border:2px solid rgba(0,0,0,0.18); border-top-color:#000; border-radius:50%; animation:sp 0.7s linear infinite; }
@keyframes sp { to{transform:rotate(360deg)} }
.err { margin-top:12px; padding:11px 14px; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.2); border-radius:7px; font-size:12px; font-weight:500; color:#fca5a5; }

/* ════════════════════════════════════
   MODALS (AUTH & HISTORY)
════════════════════════════════════ */
.auth-overlay {
  position: fixed; inset: 0; z-index: 99990;
  display: flex; align-items: center; justify-content: center;
}
.auth-backdrop {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.7); backdrop-filter: blur(12px);
}
.auth-card {
  position: relative; z-index: 2; width: 100%; max-width: 420px;
  animation: modalPop 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  background: rgba(13, 13, 13, 0.85);
  backdrop-filter: blur(20px);
}
.history-card { padding: 40px; transition: max-width 0.3s ease; }
@keyframes modalPop { 
  from { opacity: 0; transform: scale(0.95) translateY(20px); } 
  to { opacity: 1; transform: scale(1) translateY(0); } 
}
.auth-close {
  position: absolute; top: 20px; right: 20px;
  background: none; border: none; color: var(--d);
  cursor: pointer; font-size: 18px; font-family: monospace;
  transition: color 0.2s; z-index: 10;
}
.auth-close:hover { color: var(--w); }
.auth-switch {
  cursor: pointer; background: none; border: none;
  color: var(--a); font-size: 13px; font-family: 'Bricolage Grotesque', sans-serif;
  margin-top: 20px; width: 100%; text-align: center;
  transition: color 0.2s, opacity 0.2s;
}
.auth-switch:hover { color: var(--a2); opacity: 0.8; }

/* History List Styles */
.history-list { display: flex; flex-direction: column; gap: 12px; max-height: 400px; overflow-y: auto; padding-right: 8px; }
.history-list::-webkit-scrollbar { width: 4px; }
.history-list::-webkit-scrollbar-track { background: transparent; }
.history-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
.history-item { 
  display: flex; justify-content: space-between; align-items: center;
  background: rgba(255,255,255,0.03); border: 1px solid var(--bdr);
  padding: 16px; border-radius: 8px; transition: background 0.2s, border-color 0.2s;
  cursor: pointer;
}
.history-item:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.15); }
.history-item-left { display: flex; flex-direction: column; gap: 4px; }
.history-role { font-size: 14px; font-weight: 600; color: var(--w); }
.history-lvl { font-weight: 300; color: var(--m); font-size: 12px; }
.history-date { font-size: 12px; color: var(--d); }
.history-score { 
  font-family: 'Bebas Neue', sans-serif; font-size: 24px; 
  letter-spacing: 1px; padding: 4px 12px; border-radius: 4px;
}
.history-score.pass { color: var(--a); background: rgba(125,249,194,0.1); }
.history-score.fail { color: #fca5a5; background: rgba(239,68,68,0.1); }
.history-empty { text-align: center; padding: 40px 0; color: var(--d); font-style: italic; font-size: 14px; }

/* Detailed History View Styles */
.history-back {
  background: none; border: 1px solid var(--bdr); color: var(--d);
  padding: 4px 10px; border-radius: 4px; font-size: 11px; cursor: pointer;
  font-family: 'Bricolage Grotesque', sans-serif; text-transform: uppercase;
  transition: all 0.2s; letter-spacing: 1px;
}
.history-back:hover { color: var(--w); border-color: var(--d); background: rgba(255,255,255,0.05); }
.history-detail-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--bdr); }
.history-detail-list { display: flex; flex-direction: column; gap: 16px; }
.history-qa-card { background: rgba(0,0,0,0.4); border: 1px solid var(--bdr); border-radius: 8px; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
.qa-q { font-size: 14px; color: var(--w); font-weight: 500; line-height: 1.5; }
.qa-a { font-size: 13px; color: var(--m); line-height: 1.5; font-weight: 300; background: rgba(255,255,255,0.02); padding: 12px; border-radius: 6px; }
.qa-f { font-size: 13px; color: var(--a); line-height: 1.5; font-style: italic; border-left: 2px solid var(--a); padding-left: 12px; }
.qa-q span, .qa-a span, .qa-f span { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; color: var(--d); display: block; margin-bottom: 4px; font-style: normal; }

/* Footer */
#footer { padding:56px 5vw 48px; border-top:1px solid var(--bdr); will-change:transform,opacity; }
.ft-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:26px; }
.ft-logo { font-family:'Bebas Neue',sans-serif; font-size:18px; letter-spacing:6px; color:rgba(255,255,255,0.3); }
.ft-links { display:flex; gap:26px; }
.ftl { font-size:12px; font-weight:500; color:var(--d); cursor:pointer; transition:color 0.2s; }
.ftl:hover { color:var(--w); }
.ft-bot { display:flex; justify-content:space-between; }
.ft-copy,.ft-tag { font-size:12px; color:rgba(255,255,255,0.16); }
.ft-tag { font-family:'Bebas Neue',sans-serif; letter-spacing:3px; }
`;