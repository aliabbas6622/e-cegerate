import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
    console.log("Gemini API client initialized successfully.");
  } else {
    console.warn("GEMINI_API_KEY is not defined. AI features will be disabled.");
  }
} catch (error) {
  console.error("Failed to initialize Gemini client:", error);
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", geminiEnabled: !!ai });
});

// Gemini AI Generation Endpoint
app.post("/api/gemini/generate-description", async (req, res) => {
  if (!ai) {
    return res.status(503).json({ error: "Gemini API is not configured or failed to initialize." });
  }

  const { productName, category, features } = req.body;

  if (!productName) {
    return res.status(400).json({ error: "Product name is required." });
  }

  try {
    const prompt = `Write a high-end, premium, Apple-like marketing description for a retail product.
Product Name: ${productName}
Category: ${category || 'General Retail'}
Key Features / Keywords: ${features || 'None provided'}

Guidelines:
1. Make it sound sophisticated, minimalist, and luxury-oriented.
2. Focus on materials, sensory experience, and flawless daily utility.
3. Keep it within 3-4 highly polished sentences. Do not use generic sales jargon (like "revolutionary", "best ever", "game-changing"). Use elegant, understated terms.
4. Output ONLY the description. No greetings, no markup tags, no extra comments.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [prompt],
    });

    const description = response.text?.trim() || "";
    res.json({ description });
  } catch (error: any) {
    console.error("Gemini description generation error:", error);
    res.status(500).json({ error: error.message || "An error occurred during content generation." });
  }
});

// Start server with Vite middleware support
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Running in development mode. Initializing Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Running in production mode. Serving static assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Error starting server:", err);
});
