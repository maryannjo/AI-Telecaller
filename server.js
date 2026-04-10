import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import Groq from "groq-sdk";

dotenv.config();

// ==========================
// EXPRESS APP INIT
// ==========================
const app = express();

// ==========================
// SUPABASE SETUP
// ==========================
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ==========================
// GROQ (LLAMA BRAIN)
// ==========================
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ==========================
// MIDDLEWARE
// ==========================
app.use(cors());
app.use(express.json());

console.log("🔥 Insurance AI Telecaller Server Running");

// ==========================
// EMOTION DETECTION (FastAPI)
// ==========================
async function detectEmotion(text) {
  try {
    const res = await axios.post("http://127.0.0.1:5001/emotion", { text });
    return res.data;
  } catch (err) {
    console.error("Emotion API Error:", err.message);
    return { emotion: "neutral", confidence: 0 };
  }
}

// ==========================
// STORE LEAD (SUPABASE)
// ==========================
async function storeLead(data) {
  try {
    const { error } = await supabase.from("leads").insert([
      {
        name: data.name || "Unknown",
        phone: data.phone || "N/A",
        interest: data.interest || "unknown",
        query: data.query || "",
      },
    ]);

    if (error) console.log("❌ Supabase error:", error.message);
    else console.log("✅ Lead stored successfully");
  } catch (err) {
    console.log("❌ Supabase crash:", err.message);
  }
}

// ==========================
// INSURANCE PLANS
// ==========================
const insurancePlans = [
  {
    name: "SecureLife Protect Plus",
    type: "Life Insurance",
    price: "₹899/month",
    cover: "₹1 Crore",
    perks: ["Accidental death cover", "Critical illness", "Tax benefits"],
    pitch: "Best for family protection.",
  },
  {
    name: "HealthShield MaxCare",
    type: "Health Insurance",
    price: "₹699/month",
    cover: "₹15 Lakhs",
    perks: ["Cashless hospitals", "No claim bonus"],
    pitch: "Best for medical emergencies.",
  },
  {
    name: "WealthGrow Endowment Plan",
    type: "Investment + Insurance",
    price: "₹1500/month",
    cover: "₹25 Lakhs",
    perks: ["Guaranteed returns", "Life cover"],
    pitch: "Wealth + protection combo.",
  },
  {
    name: "FutureSecure Child Plan",
    type: "Child Plan",
    price: "₹1200/month",
    cover: "₹20 Lakhs",
    perks: ["Education funding", "Milestone payouts"],
    pitch: "Secure child future.",
  },
];

// ==========================
// SESSION MEMORY
// ==========================
const sessions = {};

function getSession(sessionId = "default") {
  if (!sessions[sessionId]) {
    sessions[sessionId] = { state: "GREETING", history: [] };
  }
  return sessions[sessionId];
}

// ==========================
// INTENT DETECTION
// ==========================
function detectIntent(message = "") {
  const msg = message.toLowerCase();

  if (msg.includes("not interested")) return "OBJECTION";
  if (msg.includes("busy")) return "DELAY";
  if (msg.includes("price")) return "PRICE";
  if (msg.includes("later")) return "FOLLOW_UP";
  if (msg.match(/\b(yes|ok|sure|interested)\b/)) return "INTERESTED";

  return "NORMAL";
}

// ==========================
// DECISION ENGINE
// ==========================
function decideAction(intent, session) {
  if (intent === "OBJECTION") return "HANDLE_OBJECTION";
  if (intent === "PRICE") return "HANDLE_PRICE";
  if (intent === "DELAY") return "FOLLOW_UP";
  if (intent === "INTERESTED") return "CLOSE_DEAL";
  if (session.state === "GREETING") return "ASK_QUESTION";
  return "CONTINUE";
}

// ==========================
// PLAN RECOMMENDER
// ==========================
function recommendPlan(message = "") {
  const msg = message.toLowerCase();

  if (msg.includes("health")) return insurancePlans[1];
  if (msg.includes("child")) return insurancePlans[3];
  if (msg.includes("investment")) return insurancePlans[2];
  if (msg.includes("family")) return insurancePlans[0];

  return insurancePlans[Math.floor(Math.random() * insurancePlans.length)];
}

// ==========================
// START CALL
// ==========================
app.get("/start", (req, res) => {
  res.json({
    reply:
      "Hi! This is ABC from SecureLife Insurance. Can I take 30 seconds to explain a plan?",
    nextAction: "LISTEN",
  });
});

// ==========================
// 🤖 MAIN AI ENGINE (LLAMA BRAIN)
// ==========================
app.post("/ask", async (req, res) => {
  const { message, sessionId = "default" } = req.body;

  if (!message) return res.json({ reply: "No input detected" });

  const session = getSession(sessionId);

  const intent = detectIntent(message);
  const action = decideAction(intent, session);
  const plan = recommendPlan(message);

  const emotionData = await detectEmotion(message);
  const emotion = emotionData.emotion || "neutral";

  const systemPrompt = `
You are a top-performing INSURANCE SALES ADVISOR.

User emotion: ${emotion}

Tone rules:
- angry → calm
- sad → empathetic
- happy → energetic
- neutral → normal

Plan: ${plan.name} (${plan.price})

User said: "${message}"

Respond in 1–2 lines and ask ONE question.
`;

  try {
    // ==========================
    // 🧠 LLAMA (GROQ BRAIN)
    // ==========================
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
    });

    const reply =
      response?.choices?.[0]?.message?.content ||
      "Sorry, I couldn't respond.";

    // STORE LEAD
    if (action === "CLOSE_DEAL") {
      await storeLead({
        name: "Prospect",
        phone: "unknown",
        interest: plan.name,
        query: message,
      });
    }

    res.json({ reply, emotion });
  } catch (err) {
    console.error("🔥 LLAMA ERROR:", err.message || err);

    res.status(500).json({
      reply: "AI error",
      debug: err.message || err,
    });
  }
});

// ==========================
// HEALTH CHECK
// ==========================
app.get("/", (req, res) => {
  res.send("🚀 AI Telecaller Running");
});

// ==========================
// START SERVER
// ==========================
app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});