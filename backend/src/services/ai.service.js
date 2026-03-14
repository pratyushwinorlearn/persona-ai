import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function generateInterviewQuestion(jobRole, experienceLevel) {
  const prompt = `
You are a professional technical interviewer.

Job role: ${jobRole}
Experience level: ${experienceLevel}

Ask ONE interview question suitable for this level.
Only the question. No explanation.
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: "You are an expert interviewer." },
      { role: "user", content: prompt }
    ],
    temperature: 0.7
  });

  return completion.choices[0].message.content;
}

export async function generateFollowUpQuestion(jobRole, weakTopic) {
  const prompt = `
You are a strict technical interviewer.

Job role: ${jobRole}
Weak topic: ${weakTopic}

Ask ONE follow-up interview question focused only on the weak topic.
No explanations.
Only the question.
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: "You are an expert interviewer." },
      { role: "user", content: prompt }
    ],
    temperature: 0.6
  });

  return completion.choices[0].message.content;
}

export async function evaluateAnswer(question, userAnswer, jobRole) {
  const prompt = `
You are a friendly interviewer evaluating a candidate.

Job Role: ${jobRole}
Question: ${question}
Candidate Answer: ${userAnswer}

Be generous — if the candidate shows reasonable understanding, mark it correct.
Only mark incorrect if the answer is completely wrong or irrelevant.

Respond strictly in JSON:
{
  "isCorrect": boolean,
  "feedback": string,
  "weakTopic": string | null,
  "emotion": string
}
`;
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: "You are an expert interviewer." },
      { role: "user", content: prompt }
    ],
    temperature: 0.5
  });

  return JSON.parse(completion.choices[0].message.content);
}

export async function generateReaction(isCorrect, userAnswer) {
  const skippingPhrases = ["i don't know", "i dont know", "ok", "skip", "next", "pass", "no idea", "not sure", "move on", "idk"];
  const isSkipping = !userAnswer || userAnswer.trim().length < 10 || 
    skippingPhrases.some(p => userAnswer.toLowerCase().includes(p));

  let instruction;

  if (isSkipping) {
    instruction = `The candidate said they don't know. Say something like "No worries, let's move on to the next one." Keep it short and warm.`;
  } else if (isCorrect) {
    instruction = `The candidate gave a correct answer. Give a short genuine compliment like "Nice answer!" or "Great, well explained." One sentence only.`;
  } else {
    instruction = `The candidate gave an incorrect answer. Say something polite like "That's not quite right, but no worries." One sentence only.`;
  }

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: "You are Payton, a friendly AI interviewer. Respond with exactly one short spoken sentence. Never list options." },
      { role: "user", content: instruction }
    ],
    temperature: 0.7,
    max_tokens: 50
  });

  return completion.choices[0].message.content.trim();
}