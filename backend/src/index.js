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

// 1. THE PROXY FIX
app.set("trust proxy", 1);

// 2. THE BULLETPROOF CORS FIX
// This allows both your live Vercel site AND your local dev environment
const allowedOrigins = [
  "https://persona-ai.vercel.app",
  "http://localhost:5173", // Default Vite port
  "http://localhost:3000"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true // 🔴 Changed to true: Crucial for streaming and cross-origin auth!
}));

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// 3. THE AUDIO FIX
// This exposes the generated voice files directly to the root /audio path
app.use(
  "/audio",
  express.static(path.resolve(__dirname, "../public/audio"))
);

app.use("/api/interview", interviewRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 8000;

// 4. THE BINDING FIX
app.listen(PORT, '0.0.0.0', () => { 
  console.log(`✅ Server running on port ${PORT}`);
});