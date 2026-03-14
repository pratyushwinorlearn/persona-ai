import prisma from "../db/prisma.js";
import { generateInterviewQuestion, evaluateAnswer } from "./ai.service.js";

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

export async function startInterview(jobRole, experienceLevel, questionLimit) {
  const question = await generateInterviewQuestion(jobRole, experienceLevel);

  const interview = await prisma.interviewHistory.create({
    data: {
      jobRole,
      currentQuestion: question,
      questionCount: 0,
      questionLimit,
      isCompleted: false
    }
  });

  return {
    interviewId: interview.id,
    question,
    questionNumber: 1,
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

  const evaluation = await evaluateAnswer(
    interview.currentQuestion,
    userAnswer,
    interview.jobRole
  );

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

  const newCount = interview.questionCount + 1;
  const completed = newCount >= interview.questionLimit;

  await prisma.interviewHistory.update({
    where: { id: interviewId },
    data: {
      questionCount: newCount,
      isCompleted: completed
    }
  });

  return {
    ...evaluation,
    isCompleted: completed
  };
}

export async function nextQuestion(interviewId) {
  const interview = await prisma.interviewHistory.findUnique({
    where: { id: interviewId }
  });

  if (!interview) throw new Error("Interview not found");
  if (interview.isCompleted) return { completed: true };

  const nextQ = await generateInterviewQuestion(
    interview.jobRole,
    "follow-up"
  );

  await prisma.interviewHistory.update({
    where: { id: interviewId },
    data: { currentQuestion: nextQ }
  });

  return {
    question: nextQ,
    questionNumber: interview.questionCount + 1
  };
}

export async function getInterviewSummary(interviewId) {
  const answers = await prisma.answer.findMany({
    where: { interviewId },
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