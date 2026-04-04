import express from "express";
import jwt from "jsonwebtoken"; // 🔴 Added JWT import
import {
  startInterview,
  submitAnswer,
  nextQuestion,
  getInterviewSummary
} from "../services/interview.service.js";
import { generateSpeech } from "../services/tts.service.js";
import { generateReaction } from "../services/ai.service.js";
import prisma from "../db/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_ai_interviewer_key";

let pendingAudioUrl = null;
const router = express.Router();

// START
router.post("/start", async (req, res) => {
  try {
    const { jobRole, experienceLevel, questionLimit } = req.body;
    if (!jobRole || !experienceLevel || !questionLimit) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // 🔴 1. Extract user ID from the token sent by the frontend
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
      } catch(e) {
        console.log("Invalid token");
      }
    }

    // 2. Start the interview using your existing service
    const result = await startInterview(jobRole, experienceLevel, questionLimit);

    // 🔴 3. Link the user to this newly created interview in the DB!
    if (userId && result.interviewId) {
      await prisma.interviewHistory.update({
        where: { id: result.interviewId },
        data: { userId: userId }
      });
    }

    const speechResult = await generateSpeech(result.question, result.interviewId);
    
    res.json({
      ...result,
      audioUrl: speechResult.url,
      lipSyncTimes: speechResult.lipSyncTimes,
      lipSyncVisemes: speechResult.lipSyncVisemes
    });
  } catch (err) {
    console.error("❌ /start failed:", err);
    res.status(500).json({ error: "Failed to start interview", details: err.message });
  }
});

// ANSWER — evaluate only
router.post("/answer", async (req, res) => {
  try {
    const { interviewId, userAnswer } = req.body;
    const result = await submitAnswer(interviewId, userAnswer);
    if (result.error) return res.status(400).json(result);
    res.json(result);
  } catch (err) {
    console.error("❌ /answer failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// REACT — reaction audio only
router.post("/react", async (req, res) => {
  try {
    const { interviewId, isCorrect, userAnswer, introCompleted } = req.body;

    // Check if this was the last question
    const interview = await prisma.interviewHistory.findUnique({
      where: { id: interviewId }
    });
    const isLastQuestion = interview && interview.questionCount >= interview.questionLimit;

    const reactionText = await generateReaction(isCorrect, userAnswer, introCompleted, isLastQuestion);
    const speechResult = await generateSpeech(reactionText, interviewId);
    res.json({
      reactionText,
      audioUrl: speechResult.url,
      lipSyncTimes: speechResult.lipSyncTimes,
      lipSyncVisemes: speechResult.lipSyncVisemes
    });
  } catch (err) {
    console.error("❌ /react failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// NEXT QUESTION
router.post("/next", async (req, res) => {
  try {
    const { interviewId } = req.body;
    const result = await nextQuestion(interviewId);
    if (result.completed) return res.json({ completed: true });
    const speechResult = await generateSpeech(result.question, interviewId);
    res.json({
      ...result,
      audioUrl: speechResult.url,
      lipSyncTimes: speechResult.lipSyncTimes,
      lipSyncVisemes: speechResult.lipSyncVisemes
    });
  } catch (err) {
    console.error("❌ /next failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// SUMMARY
router.post("/summary", async (req, res) => {
  try {
    const { interviewId } = req.body;
    const result = await getInterviewSummary(Number(interviewId));
    res.json(result);
  } catch (err) {
    console.error("❌ /summary failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// TTS
router.get("/tts/:interviewId", async (req, res) => {
  try {
    const interviewId = Number(req.params.interviewId);
    const interview = await prisma.interviewHistory.findUnique({
      where: { id: interviewId }
    });
    if (!interview) return res.status(404).json({ error: "Interview not found" });
    const result = await generateSpeech(interview.currentQuestion, interviewId);
    res.json({ audioUrl: result.url });
  } catch (err) {
    console.error("❌ /tts failed:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/set-audio", (req, res) => {
  const { url } = req.body;
  pendingAudioUrl = url;
  res.json({ ok: true });
});

router.get("/pending-audio", (req, res) => {
  res.json({ url: pendingAudioUrl });
});
// Variable to store the public Ngrok URL in memory
// --- PIXEL STREAMING CONFIG ---
// Keep this at the top level of the file (outside the routes)
let pixelStreamingUrl = "http://localhost";

// 1. POST: start-session.js calls this to PUSH the ngrok link
router.post("/set-ps-url", (req, res) => {
  const { url } = req.body;
  if (url) {
    pixelStreamingUrl = url;
    console.log("✅ GLOBAL PS URL UPDATED TO:", pixelStreamingUrl);
    return res.json({ ok: true });
  }
  res.status(400).json({ error: "No URL provided" });
});

// 2. GET: Frontend calls this to FETCH the link
router.get("/ps-url", (req, res) => {
  console.log("📡 Sending PS URL to client:", pixelStreamingUrl);
  res.json({ url: pixelStreamingUrl });
});


export default router;