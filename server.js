import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";

dotenv.config();

const app = express();

// ==========================
// MIDDLEWARE
// ==========================
app.use(cors());
app.use(express.json());

console.log("🔥 Insurance AI Telecaller Server Running");

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
      "Family income protection"
    ],
    pitch: "Best for family financial protection and long-term security."
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
      "No claim bonus up to 50%"
    ],
    pitch: "Best for rising medical costs and emergency protection."
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
      "Low-risk savings instrument"
    ],
    pitch: "Perfect for wealth creation + insurance protection combined."
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
      "Inflation protection option"
    ],
    pitch: "Designed to secure your child’s education future."
  }
];

// ==========================
// 🧠 SESSION MEMORY
// ==========================
const sessions = {};

function getSession(sessionId = "default") {
  if (!sessions[sessionId]) {
    sessions[sessionId] = {
      state: "GREETING",
      history: []
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
  if (msg.includes("later") || msg.includes("call me later")) return "FOLLOW_UP";
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

  if (msg.includes("health") || msg.includes("hospital"))
    return insurancePlans[1];

  if (msg.includes("child") || msg.includes("education"))
    return insurancePlans[3];

  if (msg.includes("investment") || msg.includes("saving"))
    return insurancePlans[2];

  if (msg.includes("family") || msg.includes("life"))
    return insurancePlans[0];

  return insurancePlans[Math.floor(Math.random() * insurancePlans.length)];
}

// ==========================
// 🔊 ELEVENLABS TTS FUNCTION (FIXED)
// ==========================
async function generateSpeech(text) {
  try {
    const response = await axios({
      method: "POST",
      url: "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM",
      data: {
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.65,
          similarity_boost: 0.85,
          style: 0.4,
          use_speaker_boost: true
        }
      },
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
      },
      responseType: "arraybuffer"
    });

    return response.data;
  } catch (err) {
    console.error("🔥 ElevenLabs Error:", err.response?.data || err.message);
    return null;
  }
}

// ==========================
// 📞 START CALL
// ==========================
app.get("/start", (req, res) => {
  const session = getSession("default");
  session.state = "GREETING";

  const openingLine =
    "Hi! This is Alex from SecureLife Insurance. Can I take 30 seconds to explain a new protection plan?";

  session.history.push({ role: "ai", text: openingLine });

  res.json({
    reply: openingLine,
    nextAction: "LISTEN"
  });
});

// ==========================
// 🤖 MAIN AI ENGINE
// ==========================
app.post("/ask", async (req, res) => {
  const { message, sessionId = "default" } = req.body;

  const session = getSession(sessionId);

  if (!message) {
    return res.json({ reply: "No input detected", nextAction: "LISTEN" });
  }

  session.history.push({ role: "user", text: message });

  const intent = detectIntent(message);
  const action = decideAction(intent, session);
  const recommendedPlan = recommendPlan(message);

  const basePersona = `
You are a top-performing INSURANCE SALES ADVISOR.
- Speak like a real human on a phone call
- Keep responses 1–2 sentences
- Always end with a question
- Build trust first, then sell naturally
`;

  const planContext = `
Plan:
Name: ${recommendedPlan.name}
Price: ${recommendedPlan.price}
Cover: ${recommendedPlan.cover}
Pitch: ${recommendedPlan.pitch}
`;

  const systemPrompt = `${basePersona}
${planContext}
User said: "${message}"
Action: ${action}
Respond naturally and ask ONE question.
`;

  try {
    // ==========================
    // 🧠 GEMINI CALL
    // ==========================
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: systemPrompt }] }]
      }
    );

    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't respond.";

    session.history.push({ role: "ai", text: reply });

    // ==========================
    // 🔊 VOICE GENERATION
    // ==========================
    const audioBuffer = await generateSpeech(reply);

    res.json({
      reply,
      audio: audioBuffer ? audioBuffer.toString("base64") : null,
      nextAction: action,
      recommendedPlan: recommendedPlan.name,
      shouldContinue: true
    });
  } catch (error) {
    console.error("Gemini Error:", error.response?.data || error.message);

    res.json({
      reply: "AI service error",
      shouldContinue: false
    });
  }
});

// ==========================
// 🔊 CLEAN TTS ENDPOINT (BEST PRACTICE)
// ==========================
app.post("/tts", async (req, res) => {
  const { text } = req.body;

  const audioBuffer = await generateSpeech(text);

  if (!audioBuffer) {
    return res.status(500).send("TTS failed");
  }

  res.set({
    "Content-Type": "audio/mpeg",
    "Content-Length": audioBuffer.length
  });

  res.send(audioBuffer);
});

// ==========================
// HEALTH CHECK
// ==========================
app.get("/", (req, res) => {
  res.send("🚀 Insurance AI Telecaller Running");
});

// ==========================
// START SERVER
// ==========================
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});