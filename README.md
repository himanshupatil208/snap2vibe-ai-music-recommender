# 🎵 Snap2Vibe – Let Your Photos Find Their Rhythm

> **AI-powered Song Recommender for Social Media Creators**

---

## 🌟 Introduction

Hey! Have you ever spent hours scrolling through Spotify, trying to find that one perfect song for your picture before posting it on social media?  
I don’t know about you, but for today’s generation, that’s a real headache — because everyone wants their posts to look perfect.  
And without a matching song, you just can’t capture the vibe or express your feelings the right way.

That’s where **Snap2Vibe** comes in — an AI-powered tool that turns any photo into a vibe.

---

## 🪄 How It Works

### 🖼️ **Step 1 – Upload a Photo**
Start by uploading a photo — drag and drop or click **“Choose Image.”**  
Snap2Vibe instantly analyzes the photo using AI — detecting **colors, emotions, and scene context.**

---

### 🧠 **Step 2 – Detect the Mood**
Click **“Detect Mood.”**  
The AI identifies the emotional tone of your picture — whether it’s **happy, romantic, chill, dramatic, or energetic.**  
For example, it may detect the mood as **“Party” with 94% confidence.**

---

### 🌍 **Step 3 – Personalize the Vibe**
Select your **region** — like *India* or *USA* — and enter your favorite **artist** (e.g., *Badshah* or *Bruno Mars*).  
Snap2Vibe will tailor recommendations that perfectly match both your photo’s mood and your music taste.  
You can even try it again for a different region to explore diverse vibes!

---

### 🎧 **Step 4 – Generate Song Recommendations**
Click **“Generate Vibe.”**  
Snap2Vibe connects with **Spotify’s Web API** to fetch personalized track suggestions, filtered by **mood**, **region**, and **artist.**  
Each result includes:
- 🎵 Song title & artist  
- 🎨 Album art  
- 🔗 Direct Spotify link  

Perfect for **Reels, Stories, or TikToks!**

---

### 💫 **Step 5 – Aesthetic, Creator-Friendly Interface**
Designed for everyone — clean, minimal, and social-ready.  
Built with modern UI principles to keep your creative flow effortless.

---

## 🚀 **Why Snap2Vibe?**

Next time you’re unsure what song fits your picture — just upload it to **Snap2Vibe**.  
Let your photos find their rhythm. 🎶

> Built for content creators by AI enthusiasts —  
> **Himanshu Patil**, **Himanshu Malik**, and **Sahil Vacchani**.

---

## 🧩 Tech Stack

- **Frontend:** React + Vite  
- **Backend:** Python (Flask / FastAPI)  
- **AI Model:** Image Emotion Detection (Color & Scene-based CNN)  
- **API:** Spotify Web API  
- **Styling:** Tailwind CSS / Custom CSS  

---

## 🖼️ Demo Preview

🎥 *Watch the full demo video here:*  
*https://youtu.be/WquOnQW7Hrk*

---

## 🧠 Future Enhancements

- Add facial expression detection for deeper mood accuracy  
- Multi-platform support (YouTube Music, Apple Music)  
- Social media integration for one-click caption + song posting  

---



# Snap2Vibe Setup

This version uses **OpenCLIP ViT-B/32** to detect scene/mood (rainy, sunny, cozy, romantic, sad, party, etc.) and returns a canonical mood (e.g., `rainy`, `happy`) + confidence. The frontend displays the mood and confidence, and the Spotify recommender uses it to fetch tracks.

## Run

### Backend
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
If PowerShell blocks scripts:
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

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
