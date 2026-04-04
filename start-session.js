import { spawn } from "child_process";
import fetch from "node-fetch";

const BACKEND = "https://persona-ai-production-ac95.up.railway.app/api/interview";

// We use Cloudflared instead of Ngrok. Make sure cloudflared.exe is in the exact same folder as this script!
// Change "localhost" to "127.0.0.1"
// We force Cloudflare to disguise its requests as 127.0.0.1 so Unreal accepts them!
// Keep it exactly to these 3 arguments. No extra flags!
const tunnel = spawn("./cloudflared.exe", ["tunnel", "--url", "http://127.0.0.1:8081"]);
// Cloudflare outputs its connection logs to stderr, not stdout!
tunnel.stderr.on("data", async (data) => {
  const str = data.toString();
  
  // Optional: Uncomment the next line if you want to see all the raw Cloudflare logs
  // console.log(str.trim()); 
  
  // Cloudflare URLs look like: https://random-words-here.trycloudflare.com
  const match = str.match(/(https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com)/);
  
  if (match) {
    const url = match[1];
    console.log("\n✅ Cloudflare Public URL:", url);
    
    try {
      const response = await fetch(`${BACKEND}/set-ps-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        const errorText = await response.text(); 
        throw new Error(`Server status ${response.status} - ${errorText}`);
      }

      console.log("✅ URL successfully pushed to Railway backend!\n");
    } catch (e) {
      console.error("❌ Failed to push URL to backend:", e.message);
    }
  }
});

tunnel.on("close", (code) => {
  console.log("Cloudflare exited with code", code);
});

tunnel.on("error", (err) => {
  console.error("❌ Failed to start Cloudflare. Is cloudflared.exe in this folder?", err.message);
});

console.log("🚀 Starting Cloudflare Tunnel on port 8081...");