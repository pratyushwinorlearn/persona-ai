import { spawn } from "child_process";
import fetch from "node-fetch";

const BACKEND = "https://persona-ai-production-ac95.up.railway.app/api/interview";

const ngrok = spawn("ngrok", ["http", "80", "--log=stdout", "--log-level=info"]);

ngrok.stdout.on("data", async (data) => {
  const str = data.toString();
  const match = str.match(/https:\/\/[a-z0-9-]+\.ngrok-free\.app/);
  if (match) {
    const url = match[0];
    console.log("✅ ngrok URL:", url);
    try {
      await fetch(`${BACKEND}/set-ps-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      console.log("✅ URL pushed to backend");
    } catch (e) {
      console.error("❌ Failed to push URL:", e.message);
    }
  }
});

ngrok.stderr.on("data", (data) => console.error(data.toString()));
ngrok.on("close", (code) => console.log("ngrok exited with code", code));

console.log("🚀 Starting ngrok...");