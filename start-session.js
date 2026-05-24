import { spawn } from "child_process";
import fetch from "node-fetch";
import { readFileSync, writeFileSync } from "fs";

const BACKEND = "https://persona-ai-mmhb.onrender.com/api/interview";
const ENV_PATH = "./backend/.env";

// Tunnel 1: Pixel Streaming (port 8081)
const psTunnel = spawn("ssh", [
  "-R", "80:127.0.0.1:8081",
  "nokey@localhost.run",
  "-o", "StrictHostKeyChecking=no"
]);

// Tunnel 2: Local backend audio (port 3001)
const backendTunnel = spawn("ssh", [
  "-R", "80:127.0.0.1:3001",
  "nokey@localhost.run",
  "-o", "StrictHostKeyChecking=no"
]);

let psTunnelUrl = null;
let backendTunnelUrl = null;
let psUrlPushed = false;
let backendUrlPushed = false;

const updateBackendUrl = (url) => {
  try {
    let env = readFileSync(ENV_PATH, "utf8");
    if (env.match(/^BACKEND_URL=.*/m)) {
      env = env.replace(/^BACKEND_URL=.*/m, `BACKEND_URL=${url}`);
    } else {
      env += `\nBACKEND_URL=${url}`;
    }
    writeFileSync(ENV_PATH, env);
    console.log("✅ Updated BACKEND_URL in .env to:", url);
  } catch (e) {
    console.error("❌ Failed to update .env:", e.message);
  }
};

const pushUrlsToRender = async () => {
  if (!psTunnelUrl || !backendTunnelUrl) return; // Wait for both URLs

  try {
    // Push PS URL (for Payton streaming)
    const psResponse = await fetch(`${BACKEND}/set-ps-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: psTunnelUrl })
    });
    if (!psResponse.ok) throw new Error(await psResponse.text());
    console.log("✅ Pixel Streaming URL pushed to Render!\n");

    // Push backend audio URL
    const backendResponse = await fetch(`${BACKEND}/set-backend-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: backendTunnelUrl })
    });
    if (!backendResponse.ok) throw new Error(await backendResponse.text());
    console.log("✅ Backend audio URL pushed to Render!\n");

    console.log("⚠️  Now restart your local backend: node backend/src/index.js\n");
  } catch (e) {
    console.error("❌ Failed to push URLs to Render:", e.message);
  }
};

const handlePsOutput = async (data) => {
  const str = data.toString();
  console.log("[PS Tunnel]", str.trim());

  const match = str.match(/(https:\/\/[a-zA-Z0-9-]+\.lhr\.life)/);
  if (match && !psUrlPushed) {
    psUrlPushed = true;
    psTunnelUrl = match[1];
    console.log("\n✅ Pixel Streaming Tunnel URL:", psTunnelUrl);
    await pushUrlsToRender();
  }
};

const handleBackendOutput = async (data) => {
  const str = data.toString();
  console.log("[Backend Tunnel]", str.trim());

  const match = str.match(/(https:\/\/[a-zA-Z0-9-]+\.lhr\.life)/);
  if (match && !backendUrlPushed) {
    backendUrlPushed = true;
    backendTunnelUrl = match[1];
    console.log("\n✅ Backend Audio Tunnel URL:", backendTunnelUrl);
    updateBackendUrl(backendTunnelUrl);
    await pushUrlsToRender();
  }
};

psTunnel.stdout.on("data", handlePsOutput);
psTunnel.stderr.on("data", handlePsOutput);
psTunnel.on("close", (code) => console.log("PS Tunnel exited with code", code));

backendTunnel.stdout.on("data", handleBackendOutput);
backendTunnel.stderr.on("data", handleBackendOutput);
backendTunnel.on("close", (code) => console.log("Backend Tunnel exited with code", code));

console.log("🚀 Starting SSH Tunnels...");
console.log("   → Pixel Streaming on port 8081");
console.log("   → Local Backend on port 3001");