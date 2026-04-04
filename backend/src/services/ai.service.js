import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const PAYTON_SYSTEM = `You are Payton, a warm but professional AI interviewer conducting a real job interview. 
You speak naturally and conversationally, like a human interviewer would.
Never use bullet points or lists in your responses. Speak in natural sentences only.
Keep questions concise — one question at a time, never multiple questions at once.`;

export async function generateInterviewQuestion(jobRole, experienceLevel, conversationHistory = [], introCompleted = false) {
  const hasIntro = conversationHistory.length === 0;

  let userPrompt;

  if (hasIntro) {
    userPrompt = `You are starting a job interview. Greet the candidate warmly in one sentence, introduce yourself as Payton, and ask for their name. Keep it to one or two sentences max.`;
  } else if (!introCompleted) {
    // Only one intro follow-up — ask about background, then we're done
    const candidateName = conversationHistory.find(m => m.role === 'candidate')?.content || "";
    userPrompt = `You are Payton, an AI interviewer. The candidate's name or intro response was: "${candidateName}".
    
Acknowledge their name warmly in one short sentence, then ask ONE brief question about their background or experience relevant to ${jobRole}. Two sentences max total. No lists.`;
  } else {
    userPrompt = `You are Payton, interviewing a candidate for ${jobRole} at ${experienceLevel} level.

Conversation so far:
${conversationHistory.map(m => `${m.role === 'interviewer' ? 'Payton' : 'Candidate'}: ${m.content}`).join('\n')}

Ask the next interview question. Follow this flow:
- Ask role-specific technical or behavioral questions for ${jobRole}
- If their last answer was vague or interesting, dig deeper with a follow-up
- Mix behavioral ("Tell me about a time when...") with technical questions
- Keep it natural and conversational

ONE question only. No preamble. Just the question.`;
  }

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: PAYTON_SYSTEM },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.8
  });

  return completion.choices[0].message.content.trim();
}

export async function generateFollowUpQuestion(jobRole, weakTopic, conversationHistory = []) {
  const prompt = `You are Payton, interviewing for ${jobRole}.

The candidate showed weakness in: ${weakTopic}

Conversation so far:
${conversationHistory.map(m => `${m.role === 'interviewer' ? 'Payton' : 'Candidate'}: ${m.content}`).join('\n')}

Ask ONE natural follow-up question that probes deeper into ${weakTopic}. 
Sound curious, not harsh. Just the question, no preamble.`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: PAYTON_SYSTEM },
      { role: "user", content: prompt }
    ],
    temperature: 0.7
  });

  return completion.choices[0].message.content.trim();
}

export async function evaluateAnswer(question, userAnswer, jobRole, conversationHistory = [], introCompleted = false) {
  const skippingPhrases = ["i don't know", "i dont know", "ok", "skip", "next", "pass", "no idea", "not sure", "move on", "idk"];
  const isSkipping = !userAnswer || userAnswer.trim().length < 10 ||
    skippingPhrases.some(p => userAnswer.toLowerCase().includes(p));

  if (isSkipping) {
    return {
      isCorrect: false,
      feedback: "Candidate skipped or had no answer.",
      weakTopic: null,
      emotion: "neutral",
      shouldCrossQuestion: false,
      crossQuestionTopic: null
    };
  }

  // During intro phase, don't evaluate as right/wrong — just acknowledge
  if (!introCompleted) {
    return {
      isCorrect: true,
      feedback: "Intro exchange.",
      weakTopic: null,
      emotion: "neutral",
      shouldCrossQuestion: false,
      crossQuestionTopic: null
    };
  }

  const prompt = `You are evaluating a candidate interview answer.

Job Role: ${jobRole}
Question asked: ${question}
Candidate Answer: ${userAnswer}

Conversation history:
${conversationHistory.map(m => `${m.role === 'interviewer' ? 'Payton' : 'Candidate'}: ${m.content}`).join('\n')}

Evaluate the answer. Also decide if the answer deserves a cross-question — for example if the candidate mentioned something interesting, vague, contradictory, or worth exploring further.

Be generous — mark correct if they show reasonable understanding.

Respond strictly in this JSON format with no extra text:
{
  "isCorrect": boolean,
  "feedback": string,
  "weakTopic": string | null,
  "emotion": "happy" | "concerned" | "neutral",
  "shouldCrossQuestion": boolean,
  "crossQuestionTopic": string | null
}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: "You are an expert interview evaluator. Always respond with valid JSON only, no markdown." },
      { role: "user", content: prompt }
    ],
    temperature: 0.4
  });

  const raw = completion.choices[0].message.content.trim()
    .replace(/```json/g, '').replace(/```/g, '').trim();

  return JSON.parse(raw);
}

export async function generateCrossQuestion(question, userAnswer, crossQuestionTopic, jobRole) {
  const prompt = `You are Payton, interviewing for ${jobRole}.

You just asked: "${question}"
The candidate answered: "${userAnswer}"
You want to dig deeper into: ${crossQuestionTopic}

Ask ONE natural cross-question that follows up on what they said. 
Sound genuinely curious. Reference something specific they said.
Just the question, no preamble.`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: PAYTON_SYSTEM },
      { role: "user", content: prompt }
    ],
    temperature: 0.8
  });

  return completion.choices[0].message.content.trim();
}

export async function generateReaction(isCorrect, userAnswer, introCompleted = false, isLastQuestion = false) {
  const skippingPhrases = ["i don't know", "i dont know", "ok", "skip", "next", "pass", "no idea", "not sure", "move on", "idk"];
  const isSkipping = !userAnswer || userAnswer.trim().length < 10 ||
    skippingPhrases.some(p => userAnswer.toLowerCase().includes(p));

  let instruction;

  if (isLastQuestion) {
    instruction = `This was the final question of the interview. The candidate just finished answering. 
Give a warm, natural closing reaction — thank them for their time, say the interview is now complete, and wish them well. 
Two sentences max. Sound genuine, not robotic.`;
  } else if (!introCompleted) {
    instruction = `The candidate just answered an intro question like their name or background. Respond warmly and naturally, like you're getting to know them. One sentence only.`;
  } else if (isSkipping) {
    instruction = `The candidate said they don't know. Say something warm like "No worries, let's move on." One sentence only.`;
  } else if (isCorrect) {
    instruction = `The candidate gave a good answer. Give a short genuine response like "Nice, that's a great point." or "Good, I like how you explained that." One sentence only.`;
  } else {
    instruction = `The candidate gave an incomplete or incorrect answer. Say something polite and encouraging like "Interesting perspective, let's keep going." One sentence only.`;
  }

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: "You are Payton, a friendly AI interviewer. Respond with exactly one or two short spoken sentences. Never list options. Never use asterisks or formatting. Never say 'let's move on to the next question' if this is the last question." },
      { role: "user", content: instruction }
    ],
    temperature: 0.7,
    max_tokens: 60
  });

  return completion.choices[0].message.content.trim();
}