import express from "express";
import dotenv from "dotenv";
import cors from "cors";


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Home route
app.get("/", (req, res) => {
  res.send("Server is working ");
});

// ✅ POST route (main logic)
app.post("/ask", (req, res) => {
  console.log("Incoming request:", req.body); // 

  const { message } = req.body;

  let reply = "";

  if (!message) {
    console.log("⚠️ No message received");
    return res.json({ reply: "No message received" });
  }

  if (message.toLowerCase().includes("not interested")) {
    reply =
      "I completely understand! Just before you go, can I quickly tell you how this could benefit you?";
  } else if (message.toLowerCase().includes("busy")) {
    reply = "No worries! When would be a good time for a quick call back?";
  } else if (message.toLowerCase().includes("price")) {
    reply =
      "Great question! We offer very affordable plans depending on your needs.";
  } else {
    reply =
      "Hi! I'm calling to tell you about an exciting offer that could really benefit you.";
  }

  console.log("Reply being sent:", reply); // 👈 ADD THIS

  res.json({ reply });
});

// ✅ ADD THIS HERE (for browser testing)
app.get("/ask", (req, res) => {
  res.send("This is /ask endpoint. Use POST to get AI response.");
});

// ✅ Always last
app.listen(3000, () => {
  console.log("Server running on port 3000");
});