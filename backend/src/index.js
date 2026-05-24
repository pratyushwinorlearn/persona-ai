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

app.set("trust proxy", 1);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (
      origin === "https://persona-ai.vercel.app" ||
      origin === "http://localhost:5173" ||
      origin === "http://localhost:3000" ||
      origin.endsWith(".lhr.life")
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use(
  "/audio",
  express.static(path.resolve(__dirname, "../public/audio"))
);

app.use("/api/interview", interviewRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, '0.0.0.0', () => { 
  console.log(`✅ Server running on port ${PORT}`);
});