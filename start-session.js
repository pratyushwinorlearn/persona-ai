import { spawn } from "child_process";
import fetch from "node-fetch";

const BACKEND = "https://persona-ai-production-ac95.up.railway.app/api/interview";

// We use Windows built-in SSH to tunnel via localhost.run (Zero warning screens!)
// Forcing 127.0.0.1 prevents the IPv6 bugs that Cloudflare had.
const tunnel = spawn("ssh", [
  "-R", "80:127.0.0.1:8081", 
  "nokey@localhost.run", 
  "-o", "StrictHostKeyChecking=no" // Auto-accepts the SSH key
]);

let urlPushed = false;

const handleOutput = async (data) => {
  const str = data.toString();
  
  // Print the raw SSH logs so you can see it connecting
  console.log(str.trim()); 
  
  // localhost.run URLs look like: https://something-random.lhr.life
  const match = str.match(/(https:\/\/[a-zA-Z0-9-]+\.lhr\.life)/);
  
  if (match && !urlPushed) {
    urlPushed = true; // Prevent pushing multiple times
    const url = match[1];
    console.log("\n✅ SSH Tunnel Public URL:", url);
    
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
      urlPushed = false; // Allow it to try again if it failed
    }
  }
};

// SSH sometimes sends the URL through the standard output, sometimes through errors
tunnel.stdout.on("data", handleOutput);
tunnel.stderr.on("data", handleOutput);

tunnel.on("close", (code) => {
  console.log("SSH Tunnel exited with code", code);
});

console.log("🚀 Starting SSH Tunnel to localhost.run on port 8081...");