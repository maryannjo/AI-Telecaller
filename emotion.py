from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline

app = FastAPI()

# ✅ Load text emotion model (fast + accurate)
emotion_classifier = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base"
)

# ✅ Define request format
class TextInput(BaseModel):
    text: str

# ✅ Root route (optional)
@app.get("/")
def home():
    return {"message": "Text Emotion API is running 🚀"}

# ✅ Emotion endpoint
@app.post("/emotion")
async def detect_emotion(data: TextInput):
    try:
        result = emotion_classifier(data.text)

        return {
            "emotion": result[0]["label"],
            "confidence": result[0]["score"]
        }

    except Exception as e:
        return {"error": str(e)}