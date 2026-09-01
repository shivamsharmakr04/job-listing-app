// backend/server.js
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import jobRoutes from "./routes/jobs.js";
import applicationRoutes from "./routes/applications.js";
import userRoutes from "./routes/users.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

// ─── Middleware ────────────────────────────────────────────────
const ALLOWED_ORIGINS = new Set([
  "https://job-listing-app-uqx4.onrender.com",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
  ...(process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : []),
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
]);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.has(origin) || process.env.CORS_ORIGIN === "*") {
      callback(null, true);
      return;
    }
    // Allow hosted frontends (Vercel, Netlify, Render, GitHub Pages)
    callback(null, true);
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (resumes, avatars) as static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Health check ──────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ status: "✅ Job Portal API Running", timestamp: new Date() });
});

// ─── MongoDB connection ────────────────────────────────────────
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!mongoUri) {
  console.error("❌ Error: MongoDB URI environment variable is not defined.");
  console.error("Please set MONGO_URI or MONGODB_URI in your Render Environment Variables.");
} else {
  mongoose
    .connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      retryWrites: true,
      w: "majority",
    })
    .then(() => console.log("✅ MongoDB connected successfully"))
    .catch((err) => {
      console.error("❌ MongoDB connection failed:", err.message);
      process.exit(1);
    });
}

// ─── Routes ────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api", applicationRoutes);
app.use("/api/users", userRoutes);

// Serve frontend static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../dist")));
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.resolve(__dirname, "../dist", "index.html"));
    } else {
      res.status(404).json({ message: "API endpoint not found" });
    }
  });
}

// ─── Global error handler ──────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err.message);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

// ─── Start server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
