import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import interviewRoutes from "./routes/interview.routes.js";
import { createProxyMiddleware } from 'http-proxy-middleware';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
app.use('/player', createProxyMiddleware({ 
  target: 'http://localhost',
  changeOrigin: true,
  ws: true,
  pathRewrite: { '^/player': '' }
}));
// 🔴 MUST come before routes
app.use(cors());
app.use(express.json());

// 🔍 sanity check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// 🔊 Serve audio
app.use(
  "/audio",
  express.static(path.resolve(__dirname, "../public/audio"))
);

// 🔍 LOG ROUTE REGISTRATION
console.log("Registering /api/interview routes");
app.use("/api/interview", interviewRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});