// =========================
// 🎭 AI TELECALLER DEMO CALL SYSTEM
// Loan / Marketing Voice Simulation
// =========================

let demoCallMode = false;
let recognition = null;
let listening = false;
let demoStep = 0;

// =========================
// 🎤 INIT MICROPHONE
// =========================
function initMic() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = "en-US";

  recognition.onresult = (event) => {
    const text =
      event.results[event.results.length - 1][0].transcript;

    addMessage("user", text);

    if (demoCallMode) {
      demoCallBrain(text);
    }
  };

  recognition.onend = () => {
    if (listening) recognition.start();
  };
}

// =========================
// 🚀 START DEMO CALL
// =========================
function startDemoCall() {
  demoCallMode = true;
  demoStep = 0;
  listening = true;

  setStatus("🎭 Demo Call Active (Loan / Marketing Mode)");

  addMessage(
    "bot",
    "Hi! I'm your AI Loan & Offers Assistant. Are you looking for a loan or credit card today?"
  );

  initMic();
  recognition.start();
}

// =========================
// 🛑 STOP DEMO CALL
// =========================
function stopDemoCall() {
  demoCallMode = false;
  listening = false;
  demoStep = 0;

  if (recognition) recognition.stop();
  speechSynthesis.cancel();

  setStatus("Call Ended");
}

// =========================
// 🧠 DEMO CALL BRAIN (FLOW LOGIC)
// =========================
function demoCallBrain(text) {
  const t = text.toLowerCase();
  let reply = "";

  // STEP 0: Identify intent
  if (demoStep === 0) {
    if (t.includes("loan")) {
      reply = "Great! What loan amount are you considering?";
    } else if (t.includes("credit")) {
      reply =
        "We offer credit cards with cashback, rewards, and travel benefits. Interested?";
    } else {
      reply =
        "Sure, are you looking for personal loan, business loan, or credit card?";
    }
    demoStep++;
  }

  // STEP 1: Amount handling
  else if (demoStep === 1) {
    if (t.includes("credit")) {
      reply = "Nice choice. Do you travel frequently or shop online often?";
    } else {
      reply =
        "Got it. Based on your profile, you may be eligible for instant approval up to 10 Lakhs.";
    }
    demoStep++;
  }

  // STEP 2: Objection / interest handling
  else if (demoStep === 2) {
    if (t.includes("not interested")) {
      reply = "No problem. Should I schedule a callback later?";
    } else if (t.includes("interest")) {
      reply = "Our interest rates start from 10.5% per annum with flexible EMI options.";
    } else {
      reply = "I can also pre-approve you in under 2 minutes. Want me to proceed?";
    }
    demoStep++;
  }

  // DEFAULT fallback
  else {
    reply = "Understood. Let me know how I can assist you further.";
  }

  addMessage("bot", reply);
  speak(reply);
}

// =========================
// 🔊 TEXT TO SPEECH (AI AGENT VOICE)
// =========================
function speak(text) {
  const synth = window.speechSynthesis;

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.lang = "en-US";
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;

  const voices = synth.getVoices();
  const preferredVoice =
    voices.find(v => v.name.includes("Google") || v.name.toLowerCase().includes("female")) ||
    voices[0];

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  synth.cancel();
  synth.speak(utterance);
}

// =========================
// 🧩 UI HELPERS (REQUIRED HOOKS)
// =========================
function addMessage(role, text) {
  console.log(role + ":", text);
  // connect this to your chat UI
}

function setStatus(text) {
  console.log("STATUS:", text);
  // connect this to your UI status indicator
}