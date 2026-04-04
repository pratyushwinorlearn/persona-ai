import fs from "fs";
import path from "path";
import { EdgeTTS } from "@andresaya/edge-tts";
import { execSync } from "child_process";

const FFMPEG = "ffmpeg";
const audioCache = new Map();

export async function generateSpeech(text, interviewId) {
  if (audioCache.has(interviewId)) {
    const cached = audioCache.get(interviewId);
    if (cached.text === text) {
      console.log(`🔊 Using cached audio for interview ${interviewId}`);
      return { url: cached.url, lipSyncUrl: cached.lipSyncUrl, lipSyncTimes: cached.lipSyncTimes, lipSyncVisemes: cached.lipSyncVisemes };
    }
  }

  const audioDir = "./public/audio";
  if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

  const fileName = `speech_${interviewId}_${Date.now()}`;
  const rawPath = path.join(audioDir, `${fileName}_raw`);
  const finalPath = path.join(audioDir, `${fileName}.wav`);

  // 1. Generate Speech using EdgeTTS
  const tts = new EdgeTTS();
  await tts.synthesize(text, "en-US-AriaNeural", {});
  await tts.toFile(rawPath);

  // 2. Convert mp3 to wav and pad with silence using FFmpeg
  execSync(`"${FFMPEG}" -i "${rawPath}.mp3" -af "apad=pad_dur=2" "${finalPath}" -y`);
  fs.unlinkSync(`${rawPath}.mp3`);

  // 3. Generate lipsync data (OS-Aware Fix)
  const isWindows = process.platform === "win32";
  const rhubarbPath = isWindows 
    ? path.resolve("./rhubarb/rhubarb.exe") // Local Windows path
    : "/app/rhubarb_linux/rhubarb";         // Production Railway path
  
  const lipSyncPath = path.join(audioDir, `${fileName}.json`);
  execSync(`"${rhubarbPath}" -f json -o "${lipSyncPath}" "${finalPath}" -r phonetic --extendedShapes GHX`);

  // 4. Parse lipsync JSON into two simple arrays
  const lipSyncRaw = JSON.parse(fs.readFileSync(lipSyncPath, "utf8"));
  const lipSyncTimes = lipSyncRaw.mouthCues.map(cue => cue.start);
  const lipSyncVisemes = lipSyncRaw.mouthCues.map(cue => cue.value);

  // 5. Build dynamic URLs (Production URL Fix)
  // Make sure to add BACKEND_URL to your Railway variables!
  const baseUrl = process.env.BACKEND_URL || "http://localhost:8000";
  const url = `${baseUrl}/audio/${fileName}.wav`;
  const lipSyncUrl = `${baseUrl}/audio/${fileName}.json`;

  audioCache.set(interviewId, { text, url, lipSyncUrl, lipSyncTimes, lipSyncVisemes });
  console.log(`🔊 Generated audio for interview ${interviewId}: ${url}`);
  
  return { url, lipSyncUrl, lipSyncTimes, lipSyncVisemes };
}