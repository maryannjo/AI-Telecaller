import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Home route
app.get("/", (req, res) => {
  res.send("Server is working");
});

// ==========================
// 🤖 GEMINI AI ROUTE
// ==========================
app.post("/ask", async (req, res) => {
  console.log("Incoming request:", req.body);

  const { message } = req.body;

  if (!message) {
    return res.json({ reply: "No message received" });
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `You are a helpful AI telecaller assistant. Keep responses short and conversational.

User: ${message}`
              }
            ]
          }
        ]
      }
    );

    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't generate a response.";

    console.log("Reply from Gemini:", reply);

    res.json({ reply });
  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.message);

    res.json({
      reply: "Error connecting to AI service."
    });
  }
});

// ==========================
// START CONVERSATION ROUTE
// ==========================
app.get("/start", (req, res) => {
  const openingLine =
    "Hi! This is Alex from XYZ company. Am I speaking with the right person?";

  res.json({ reply: openingLine });
});

// ==========================
// TEST ROUTE
// ==========================
app.get("/ask", (req, res) => {
  res.send("Use POST to interact with Gemini AI");
});

// ==========================
// START SERVER
// ==========================
app.listen(3000, () => {
  console.log("Server running on port 3000");
});