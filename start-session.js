import { spawn } from "child_process";
import fetch from "node-fetch";

// IMPORTANT: If you are running your backend locally right now (localhost:8000), 
// comment out the Railway URL and use the localhost one instead!
const BACKEND = "https://persona-ai-production-ac95.up.railway.app/api/interview";
// const BACKEND = "http://localhost:8000/api/interview";

const ngrok = spawn("ngrok", ["http", "8081", "--log=stdout", "--log-level=info"]);

ngrok.stdout.on("data", async (data) => {
  const str = data.toString();
  
  // Look specifically for the "url=" part in the log
  const match = str.match(/url=(https:\/\/[^\s]+)/);
  
  if (match) {
    const url = match[1]; // match[1] grabs just the URL itself
    console.log("✅ ngrok URL:", url);
    
    try {
      const response = await fetch(`${BACKEND}/set-ps-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });

      // THE FIX: Check if the backend actually accepted the request (Status 200-299)
      if (!response.ok) {
        // Try to grab the exact error message the server sent back
        const errorText = await response.text(); 
        throw new Error(`Server status ${response.status} - ${errorText}`);
      }

      console.log("✅ URL successfully pushed to backend!");
    } catch (e) {
      console.error("❌ Failed to push URL to backend:", e.message);
    }
  }
});

ngrok.stderr.on("data", (data) => console.error(data.toString()));
ngrok.on("close", (code) => console.log("ngrok exited with code", code));

console.log("🚀 Starting ngrok...");