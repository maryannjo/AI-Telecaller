AI Voice Telecaller
A full-stack AI-powered voice telecalling system that simulates real human-like sales conversations using Gemini AI, emotion detection, and browser-based voice synthesis — with automated lead capture and CRM storage.



📌 Problem Statement
Traditional telecalling systems are expensive, inconsistent, and dependent on human agents.
This project solves that by building an AI-driven voice telecaller that:
Talks like a human sales agent
Adapts tone based on emotion
Handles objections intelligently
Captures leads automatically
Operates 24/7 without human intervention

🚀 Features
Feature	Description
🧠 AI Sales Agent	Uses Gemini 1.5 Flash to generate human-like sales conversations
🎤 Voice Caller	Browser-based American accent speech synthesis
🎭 Emotion Detection	FastAPI-based sentiment detection engine
📞 Call Simulation	Real-time conversational call flow (listen → respond → speak loop)
🧩 Intent Engine	Detects objections, interest, pricing concerns, and delays
💾 Lead Capture	Stores qualified leads automatically in Supabase
🔁 Session Memory	Maintains conversation state across interactions
📊 CRM Ready	Structured lead storage for dashboards & analytics

🏗️ Tech Stack
⚙️ Backend
Node.js
Express.js
Axios
Dotenv
🧠 AI Layer
Google Gemini 1.5 Flash (LLM)
Custom prompt engineering (sales optimization)
🎭 Emotion Engine
FastAPI (Python)
Rule-based sentiment detection (extensible to ML models)
🗄️ Database
Supabase (PostgreSQL)
Lead storage + CRM structure
🎤 Frontend Voice System
HTML5 + CSS3 + Vanilla JS
Web Speech API (SpeechSynthesis + SpeechRecognition)
American English voice selection

📂 Project Structure
AI Voice Telecaller/
│
├── backend/
│   ├── server.js              # Main Express backend
│   ├── .env                   # API keys & config
│
├── emotion/
│   ├── emotion.py            # FastAPI emotion detection service
│
├── frontend/
│   ├── index.html            # Voice calling UI
│   ├── styles.css            # UI styling
│   ├── script.js             # Voice + AI interaction logic
│
└── README.md

⚙️ Installation & Setup
1️⃣ Clone Repository
git clone https://github.com/your-username/ai-voice-telecaller.git
cd ai-voice-telecaller
2️⃣ Backend Setup (Node.js)
cd backend
npm install
Create .env file:
GEMINI_API_KEY=your_key_here
SUPABASE_URL=your_url_here
SUPABASE_ANON_KEY=your_key_here
Run server:
node server.js
Backend runs at:
http://localhost:3000
3️⃣ Emotion API Setup (FastAPI)
cd emotion
pip install fastapi uvicorn
Run server:
uvicorn emotion:app --reload --port 5001
Emotion API:
http://127.0.0.1:5001
4️⃣ Frontend Setup
Simply open:
frontend/index.html
OR use Live Server in VS Code.
🧠 System Architecture
User Voice/Text
      ↓
Frontend (Voice UI)
      ↓
Node.js Backend (Express)
      ↓
-----------------------------
| Gemini AI (Conversation)  |
| Emotion API (FastAPI)     |
| Supabase (Lead Storage)   |
-----------------------------
      ↓
Frontend Speech Engine (US Voice Output)
📞 Call Flow
User starts call
AI greets user (sales opening pitch)
User responds via voice/text
System detects:
intent (interest / objection / price concern)
emotion (happy / angry / neutral)
Gemini generates response
AI speaks using American voice (browser TTS)
If user is interested → lead is stored in Supabase
Conversation continues like a real call
🎯 Core AI Intelligence
🧩 Intent Detection
Interested
Objection
Price concern
Delay / follow-up
🎭 Emotion Handling
Angry → calm response
Sad → empathetic tone
Happy → energetic pitch
Neutral → standard sales flow
💰 Sales Optimization
Dynamic insurance plan recommendation
Conversion-focused prompting
One-question closing strategy
💾 Lead Management (Supabase)
Automatically stored fields:
Name (default / extracted later)
Phone (optional future upgrade)
Interest (selected insurance plan)
Query (user message)
Timestamp

🔥 Key Innovation
Unlike traditional telecalling systems:
Old Systems:
Robotic IVR responses
No emotion awareness
No adaptive conversation
No memory
This System:
Human-like AI conversations
Emotion-aware responses
Real-time voice interaction
Auto lead capture
Sales-optimized prompting engine
 Ethical Use Disclaimer
This system is built for:
Educational purposes
AI research
Authorized customer engagement
Do NOT use for spam, unauthorized calling, or illegal telemarketing.

Author
Maryann Joseph
Mohammed Niyaz
Mohamad Anas 
📧 [maryannjoseph279@gmail.com](mailto: maryannjoseph279@gmail.com),
🔗 GitHub: https://github.com/your-profile
