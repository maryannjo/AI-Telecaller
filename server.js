import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();

// ==========================
// 🔐 SUPABASE SETUP
// ==========================
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ==========================
// MIDDLEWARE
// ==========================
app.use(cors());
app.use(express.json());

console.log("🔥 Insurance AI Telecaller Server Running");

// ==========================
// 🧠 EMOTION DETECTION (FastAPI)
// ==========================
async function detectEmotion(text) {
  try {
    const res = await axios.post(
      "http://127.0.0.1:5001/emotion",
      { text }
    );
    return res.data;
  } catch (err) {
    console.error("Emotion API Error:", err.message);
    return { emotion: "neutral", confidence: 0 };
  }
}

// ==========================
// 🧠 STORE LEAD (SUPABASE)
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

    if (error) {
      console.log("❌ Error storing lead:", error.message);
    } else {
      console.log("✅ Lead stored successfully");
    }
  } catch (err) {
    console.log("❌ Supabase crash:", err.message);
  }
}

// ==========================
// 🧠 INSURANCE PRODUCT CATALOG
// ==========================
const insurancePlans = [
  {
    name: "SecureLife Protect Plus",
    type: "Life Insurance",
    price: "₹899/month",
    cover: "₹1 Crore",
    perks: [
      "Accidental death cover included",
      "Critical illness rider (25 diseases)",
      "Tax benefits under 80C",
      "Family income protection",
    ],
    pitch: "Best for family financial protection and long-term security.",
  },
  {
    name: "HealthShield MaxCare",
    type: "Health Insurance",
    price: "₹699/month",
    cover: "₹15 Lakhs",
    perks: [
      "Cashless hospital network (5000+ hospitals)",
      "Pre + post hospitalization cover",
      "Free annual health checkup",
      "No claim bonus up to 50%",
    ],
    pitch: "Best for rising medical costs and emergency protection.",
  },
  {
    name: "WealthGrow Endowment Plan",
    type: "Investment + Insurance",
    price: "₹1500/month",
    cover: "₹25 Lakhs + maturity bonus",
    perks: [
      "Guaranteed maturity returns",
      "Life cover during policy term",
      "Long-term wealth creation",
      "Low-risk savings instrument",
    ],
    pitch: "Perfect for wealth creation + insurance protection combined.",
  },
  {
    name: "FutureSecure Child Plan",
    type: "Child Education",
    price: "₹1200/month",
    cover: "₹20 Lakhs",
    perks: [
      "Guaranteed education funding",
      "Premium waiver on parent death",
      "Milestone payouts",
      "Inflation protection option",
    ],
    pitch: "Designed to secure your child’s education future.",
  },
];

// ==========================
// 🧠 SESSION MEMORY
// ==========================
const sessions = {};

function getSession(sessionId = "default") {
  if (!sessions[sessionId]) {
    sessions[sessionId] = {
      state: "GREETING",
      history: [],
    };
  }
  return sessions[sessionId];
}

// ==========================
// 🧠 INTENT DETECTION
// ==========================
function detectIntent(message = "") {
  const msg = message.toLowerCase();

  if (msg.includes("not interested")) return "OBJECTION";
  if (msg.includes("busy")) return "DELAY";
  if (msg.includes("price") || msg.includes("expensive")) return "PRICE";
  if (msg.includes("later")) return "FOLLOW_UP";
  if (msg.includes("yes") || msg.includes("ok") || msg.includes("sure"))
    return "INTERESTED";

  return "NORMAL";
}

// ==========================
// 🧠 DECISION ENGINE
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
// 🎯 PLAN RECOMMENDER
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
// 📞 START CALL
// ==========================
app.get("/start", (req, res) => {
  const openingLine =
    "Hi! This is Alex from SecureLife Insurance. Can I take 30 seconds to explain a new protection plan?";

  res.json({ reply: openingLine, nextAction: "LISTEN" });
});

// ==========================
// 🤖 MAIN AI ENGINE
// ==========================
app.post("/ask", async (req, res) => {
  const { message, sessionId = "default" } = req.body;

  if (!message) {
    return res.json({ reply: "No input detected" });
  }

  const session = getSession(sessionId);

  const intent = detectIntent(message);
  const action = decideAction(intent, session);
  const plan = recommendPlan(message);

  // 🔥 Emotion detection
  const emotionData = await detectEmotion(message);
  const emotion = emotionData.emotion || "neutral";

  const systemPrompt = `
You are a top-performing INSURANCE SALES ADVISOR.

User emotion: ${emotion}
Tone rules:
- angry → calm and reassuring
- sad → empathetic
- happy → energetic
- neutral → normal

Plan: ${plan.name} (${plan.price})

User said: "${message}"
Respond naturally in 1–2 sentences and ask ONE question.
`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: systemPrompt }],
          },
        ],
      }
    );

    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't respond.";

    // ==========================
    // 💾 STORE LEAD WHEN INTERESTED
    // ==========================
    if (action === "CLOSE_DEAL") {
      await storeLead({
        name: "Prospect",
        phone: "unknown",
        interest: plan.name,
        query: message,
      });
    }

    res.json({
      reply,
      emotion,
    });
  } catch (err) {
    console.error("Gemini Error:", err.message);
    res.json({ reply: "AI error" });
  }
});

// ==========================
// HEALTH
// ==========================
app.get("/", (req, res) => {
  res.send("🚀 AI Telecaller Running");
});

// ==========================
app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});