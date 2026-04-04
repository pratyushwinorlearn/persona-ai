import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import interviewRoutes from "./routes/interview.routes.js";
import authRoutes from "./routes/auth.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();

// 1. THE PROXY FIX: Railway runs your app behind a proxy. 
// Without this, mobile browsers will reject secure authentication cookies!
app.set("trust proxy", 1);

// Delete all the strict origins and credentials, just use this one line:
app.use(cors());

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Serve static audio files so Vercel doesn't get a 404
app.use(
  "/audio",
  express.static(path.resolve(__dirname, "../public/audio"))
);

app.use("/api/interview", interviewRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 8000;

// 3. THE BINDING FIX: '0.0.0.0' ensures the server listens to Railway's external network, not just internal localhost.
app.listen(PORT, '0.0.0.0', () => { 
  console.log(`✅ Server running on port ${PORT}`);
});