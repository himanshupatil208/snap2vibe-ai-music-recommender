# Snap2Vibe (CLIP Upgrade)

This version uses **OpenCLIP ViT-B/32** to detect scene/mood (rainy, sunny, cozy, romantic, sad, party, etc.) and returns a canonical mood (e.g., `rainy`, `happy`) + confidence. The frontend displays the mood and confidence, and the Spotify recommender uses it to fetch tracks.

## Run

### Backend
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Configure Spotify (choose one) in backend/.env:
# SPOTIFY_TOKEN=your_access_token   # (expires ~1h)
# or
# SPOTIFY_CLIENT_ID=...
# SPOTIFY_CLIENT_SECRET=...

$env:FLASK_APP="app.py"
$env:FLASK_ENV="development"
flask run --port 5001
```

Test: http://localhost:5001/api/health

### Frontend
```powershell
cd frontend
npm install
# optional: create .env with VITE_API_BASE=http://localhost:5001
npm run dev
```
Open the printed http://localhost:5173/
