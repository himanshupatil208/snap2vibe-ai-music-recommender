import io
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from PIL import Image

from utils.mood_ml import detect_mood_clip
from utils.spotify import get_spotify_access_token, search_tracks_for_mood

load_dotenv()

app = Flask(__name__)

allow_origins = os.getenv("CORS_ALLOW_ORIGINS", "http://localhost:5173").split(",")
CORS(app, resources={r"/api/*": {"origins": [o.strip() for o in allow_origins]}})

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.post("/api/mood")
def api_mood():
    if "image" not in request.files:
        return jsonify({"error": "No image file uploaded with key 'image'."}), 400
    file = request.files["image"]
    try:
        img_bytes = file.read()
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")

        result = detect_mood_clip(img)
        return jsonify({
            "mood": result["label"],
            "raw": result["raw_label"],
            "confidence": result["confidence"],
        })
    except Exception as e:
        return jsonify({"error": f"Failed to process image: {e}"}), 400

@app.get("/api/songs")
def api_songs():
    mood = request.args.get("mood", "chill")
    region = request.args.get("region", "US")
    person = request.args.get("person", "").strip()

    token = get_spotify_access_token()
    if not token:
        return jsonify({"error": "Unable to obtain Spotify access token. Check your .env."}), 500

    try:
        tracks = search_tracks_for_mood(token, mood=mood, region=region, person=person)
        return jsonify({"tracks": tracks, "mood": mood, "region": region, "person": person})
    except Exception as e:
        return jsonify({"error": f"Spotify query failed: {e}"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
