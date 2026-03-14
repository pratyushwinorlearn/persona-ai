import express from "express";
import {
  startInterview,
  submitAnswer,
  nextQuestion,
  getInterviewSummary
} from "../services/interview.service.js";
import { generateSpeech } from "../services/tts.service.js";
import prisma from "../db/prisma.js";

// In-memory pending audio store
let pendingAudioUrl = null;
const router = express.Router();

// START INTERVIEW
router.post("/start", async (req, res) => {
  try {
    const { jobRole, experienceLevel, questionLimit } = req.body;

    if (!jobRole || !experienceLevel || !questionLimit) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const result = await startInterview(jobRole, experienceLevel, questionLimit);
    const speechResult = await generateSpeech(result.question, result.interviewId);

    res.json({
      ...result,
      audioUrl: speechResult.url,
      lipSyncUrl: speechResult.lipSyncUrl,
      lipSyncTimes: speechResult.lipSyncTimes,
      lipSyncVisemes: speechResult.lipSyncVisemes
    });

  } catch (err) {
    console.error("❌ /start failed:", err);
    res.status(500).json({ error: "Failed to start interview", details: err.message });
  }
});

// SUBMIT ANSWER
router.post("/answer", async (req, res) => {
  try {
    const { interviewId, userAnswer } = req.body;
    const result = await submitAnswer(interviewId, userAnswer);
    res.json(result);
  } catch (err) {
    console.error("❌ /answer failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// NEXT QUESTION
router.post("/next", async (req, res) => {
  try {
    const { interviewId } = req.body;
    const result = await nextQuestion(interviewId);
    const speechResult = await generateSpeech(result.question, interviewId);

    res.json({
      ...result,
      audioUrl: speechResult.url,
      lipSyncUrl: speechResult.lipSyncUrl,
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
router.post("/react", async (req, res) => {
  try {
    const { interviewId, isCorrect, userAnswer } = req.body;
    const { generateReaction } = await import("../services/ai.service.js");
    const reactionText = await generateReaction(isCorrect, userAnswer);
    const speechResult = await generateSpeech(reactionText, interviewId);
    res.json({
      reactionText,
      audioUrl: speechResult.url,
      lipSyncUrl: speechResult.lipSyncUrl,
      lipSyncTimes: speechResult.lipSyncTimes,
      lipSyncVisemes: speechResult.lipSyncVisemes
    });
  } catch (err) {
    console.error("❌ /react failed:", err);
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

    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }

    const result = await generateSpeech(interview.currentQuestion, interviewId);
    res.json({
      audioUrl: result.url,
      lipSyncUrl: result.lipSyncUrl,
      
    });

  } catch (err) {
    console.error("❌ /tts failed:", err);
    res.status(500).json({ error: err.message });
  }
});
// SET pending audio (called by React app)
router.post("/set-audio", (req, res) => {
  const { url } = req.body;
  pendingAudioUrl = url;
  res.json({ ok: true });
});

// GET pending audio (polled by player.js)
router.get("/pending-audio", (req, res) => {
  res.json({ url: pendingAudioUrl });
});

export default router;