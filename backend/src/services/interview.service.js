import prisma from "../db/prisma.js";
import {
  generateInterviewQuestion,
  evaluateAnswer,
  generateCrossQuestion,
  generateFollowUpQuestion
} from "./ai.service.js";

async function getDemoUser(jobRole) {
  let user = await prisma.user.findFirst();

  if (!user) {
    user = await prisma.user.create({
      data: {
        jobRole,
        level: "Demo"
      }
    });
  }

  return user;
}

async function getConversationHistory(interviewId) {
  const answers = await prisma.answer.findMany({
    where: { interviewId },
    orderBy: { id: "asc" }
  });

  const history = [];
  for (const a of answers) {
    history.push({ role: "interviewer", content: a.question });
    history.push({ role: "candidate", content: a.answer });
  }
  return history;
}

export async function startInterview(jobRole, experienceLevel, questionLimit) {
  const question = await generateInterviewQuestion(jobRole, experienceLevel, [], false);

  const interview = await prisma.interviewHistory.create({
    data: {
      jobRole,
      experienceLevel,
      currentQuestion: question,
      questionCount: 0,
      questionLimit,
      isCompleted: false,
      introCompleted: false,
      pendingCrossQuestion: false,
      crossQuestionTopic: null
    }
  });

  return {
    interviewId: interview.id,
    question,
    questionNumber: null,
    questionLimit
  };
}

export async function submitAnswer(interviewId, userAnswer) {
  const interview = await prisma.interviewHistory.findUnique({
    where: { id: interviewId }
  });

  if (!interview) return { error: "NOT_FOUND" };
  if (interview.isCompleted) return { error: "COMPLETED" };

  const user = await getDemoUser(interview.jobRole);
  const conversationHistory = await getConversationHistory(interviewId);

  const evaluation = await evaluateAnswer(
    interview.currentQuestion,
    userAnswer,
    interview.jobRole,
    conversationHistory,
    interview.introCompleted
  );

  // Only save to answers and count if intro is done
  if (interview.introCompleted) {
    await prisma.answer.create({
      data: {
        question: interview.currentQuestion,
        answer: userAnswer,
        isCorrect: evaluation.isCorrect,
        feedback: evaluation.feedback,
        emotion: evaluation.emotion,
        weakTopic: evaluation.weakTopic,
        interviewId,
        userId: user.id
      }
    });
  } else {
    // Still save intro exchanges so conversation history is maintained
    await prisma.answer.create({
      data: {
        question: interview.currentQuestion,
        answer: userAnswer,
        isCorrect: true,
        feedback: "Intro exchange.",
        emotion: "neutral",
        weakTopic: null,
        interviewId,
        userId: user.id,
        isIntro: true
      }
    });
  }

  const newCount = interview.introCompleted
    ? interview.questionCount + 1
    : interview.questionCount;

  const completed = interview.introCompleted && newCount >= interview.questionLimit;

  const shouldCross = evaluation.shouldCrossQuestion &&
    interview.introCompleted &&
    !completed &&
    newCount < interview.questionLimit - 1;

  await prisma.interviewHistory.update({
    where: { id: interviewId },
    data: {
      questionCount: newCount,
      isCompleted: completed,
      pendingCrossQuestion: shouldCross,
      crossQuestionTopic: shouldCross ? evaluation.crossQuestionTopic : null
    }
  });

  return {
    ...evaluation,
    isCompleted: completed,
    shouldCrossQuestion: shouldCross,
    introCompleted: interview.introCompleted
  };
}

export async function nextQuestion(interviewId) {
  const interview = await prisma.interviewHistory.findUnique({
    where: { id: interviewId }
  });

  if (!interview) throw new Error("Interview not found");
  if (interview.isCompleted) return { completed: true };

  const conversationHistory = await getConversationHistory(interviewId);

  // Count only intro answers (isIntro = true)
  const introAnswers = await prisma.answer.findMany({
    where: { interviewId, isIntro: true }
  });

  // Force intro done after 2 intro exchanges (greeting + background)
  const shouldCompleteIntro = !interview.introCompleted && introAnswers.length >= 2;

  let nextQ;
  let introJustCompleted = shouldCompleteIntro;

  if (interview.pendingCrossQuestion && interview.crossQuestionTopic) {
    const lastAnswer = conversationHistory[conversationHistory.length - 1];
    nextQ = await generateCrossQuestion(
      interview.currentQuestion,
      lastAnswer?.content || "",
      interview.crossQuestionTopic,
      interview.jobRole
    );
  } else {
    const effectiveIntroCompleted = interview.introCompleted || shouldCompleteIntro;
    nextQ = await generateInterviewQuestion(
      interview.jobRole,
      interview.experienceLevel || "mid-level",
      conversationHistory,
      effectiveIntroCompleted
    );

    // Strip tag just in case AI still emits it
    if (nextQ.includes('[INTERVIEW_START]')) {
      introJustCompleted = true;
      nextQ = nextQ.replace('[INTERVIEW_START]', '').trim();
    }
  }

  await prisma.interviewHistory.update({
    where: { id: interviewId },
    data: {
      currentQuestion: nextQ,
      introCompleted: interview.introCompleted || introJustCompleted,
      pendingCrossQuestion: false,
      crossQuestionTopic: null
    }
  });

  const newQuestionNumber = interview.introCompleted || introJustCompleted
    ? interview.questionCount + 1
    : null;

  return {
    question: nextQ,
    questionNumber: newQuestionNumber,
    isCrossQuestion: interview.pendingCrossQuestion,
    introJustCompleted
  };
}

export async function getInterviewSummary(interviewId) {
  // Only count non-intro answers in the summary
  const answers = await prisma.answer.findMany({
    where: {
      interviewId,
      isIntro: false
    },
    orderBy: { id: "asc" }
  });

  if (!answers.length) {
    return { score: 0, verdict: "No data found", weakTopics: [], breakdown: [] };
  }

  const correct = answers.filter(a => a.isCorrect).length;
  const score = Math.round((correct / answers.length) * 100);

  return {
    totalQuestions: answers.length,
    correctAnswers: correct,
    score,
    verdict: score >= 60 ? "PASS" : "NEEDS IMPROVEMENT",
    weakTopics: [...new Set(answers.map(a => a.weakTopic).filter(Boolean))],
    breakdown: answers.map((a, i) => ({
      number: i + 1,
      question: a.question,
      answer: a.answer,
      isCorrect: a.isCorrect,
      feedback: a.feedback,
      weakTopic: a.weakTopic,
      emotion: a.emotion
    }))
  };
}