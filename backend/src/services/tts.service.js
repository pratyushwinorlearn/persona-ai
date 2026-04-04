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

  const tts = new EdgeTTS();
  await tts.synthesize(text, "en-US-AriaNeural", {});
  await tts.toFile(rawPath);

  execSync(`"${FFMPEG}" -i "${rawPath}.mp3" -af "apad=pad_dur=2" "${finalPath}" -y`);
  fs.unlinkSync(`${rawPath}.mp3`);

  // Generate lipsync data with extended shapes
  const rhubarbPath = path.resolve("./rhubarb/rhubarb.exe");
  const lipSyncPath = path.join(audioDir, `${fileName}.json`);
  execSync(`"${rhubarbPath}" -f json -o "${lipSyncPath}" "${finalPath}" -r phonetic --extendedShapes GHX`);

  // Parse lipsync JSON into two simple arrays
  const lipSyncRaw = JSON.parse(fs.readFileSync(lipSyncPath, "utf8"));
  const lipSyncTimes = lipSyncRaw.mouthCues.map(cue => cue.start);
  const lipSyncVisemes = lipSyncRaw.mouthCues.map(cue => cue.value);

  const url = `http://localhost:8000/audio/${fileName}.wav`;
  const lipSyncUrl = `http://localhost:8000/audio/${fileName}.json`;

  audioCache.set(interviewId, { text, url, lipSyncUrl, lipSyncTimes, lipSyncVisemes });
  console.log(`🔊 Generated audio for interview ${interviewId}: ${url}`);
  return { url, lipSyncUrl, lipSyncTimes, lipSyncVisemes };
}