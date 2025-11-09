import React, { useState } from "react";
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001";
export default function App() {
  const [imageFile, setImageFile] = useState(null);
  const [mood, setMood] = useState("");
  const [confidence, setConfidence] = useState(null);
  const [region, setRegion] = useState("US");
  const [person, setPerson] = useState("");
  const [loadingMood, setLoadingMood] = useState(false);
  const [loadingSongs, setLoadingSongs] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [error, setError] = useState("");
  const onFileChange = (e) => { const f = e.target.files?.[0]; setImageFile(f || null); };
  const detectMood = async () => {
    if (!imageFile) { setError("Please choose an image first."); return; }
    setError(""); setLoadingMood(true);
    try {
      const fd = new FormData(); fd.append("image", imageFile);
      const res = await fetch(`${API_BASE}/api/mood`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Mood detection failed");
      setMood(data.mood); setConfidence(data.confidence ?? null);
    } catch (e) { setError(e.message); } finally { setLoadingMood(false); }
  };
  const getSongs = async () => {
    const m = mood || "chill"; setLoadingSongs(true); setError("");
    try {
      const url = new URL(`${API_BASE}/api/songs`);
      url.searchParams.set("mood", m); url.searchParams.set("region", region);
      if (person) url.searchParams.set("person", person);
      const res = await fetch(url.toString()); const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch songs");
      setTracks(data.tracks || []);
    } catch (e) { setError(e.message); } finally { setLoadingSongs(false); }
  };
  return (<div className="container">
    <header><h1>🎵 Snap2Vibe</h1><p>CLIP-powered scene & mood detection → Spotify suggestions.</p></header>
    <section className="card"><h2>1) Upload Photo</h2><input type="file" accept="image/*" onChange={onFileChange} />{imageFile && <p className="muted">Selected: {imageFile.name}</p>}</section>
    <section className="card"><h2>2) Detect Mood</h2><button onClick={detectMood} disabled={loadingMood || !imageFile}>{loadingMood ? "Detecting..." : "Detect Mood"}</button>{mood && (<p className="pill">Mood: {mood}{confidence != null && <> ({Math.round(confidence * 100)}%)</>}</p>)}</section>
    <section className="card"><h2>3) Region & Optional Person</h2><div className="row">
      <label>Region:<select value={region} onChange={(e) => setRegion(e.target.value)}>
        <option value="US">US</option><option value="IN">IN</option><option value="GB">GB</option>
        <option value="CA">CA</option><option value="AU">AU</option><option value="DE">DE</option>
      </select></label>
      <label>Singer/Actor (optional):<input type="text" placeholder="e.g., Arijit Singh" value={person} onChange={(e) => setPerson(e.target.value)} /></label>
    </div><button onClick={getSongs} disabled={loadingSongs}>{loadingSongs ? "Fetching..." : "Get Songs"}</button></section>
    <section className="card"><h2>4) Results</h2>{!tracks.length && <p className="muted">No tracks yet.</p>}<div className="grid">
      {tracks.map((t) => (<div className="song" key={t.id}>{t.albumArt && <img src={t.albumArt} alt={t.name} />}
        <div className="song-info"><div className="title">{t.name}</div><div className="artist">{t.artists}</div></div>
        <div className="song-actions">{t.previewUrl && (<audio controls src={t.previewUrl}>Your browser does not support the audio element.</audio>)}
          {t.externalUrl && (<a className="btn" href={t.externalUrl} target="_blank" rel="noreferrer">Open in Spotify</a>)}
        </div></div>))}
    </div></section>
    {error && <div className="error">⚠️ {error}</div>}
    <footer><p className="muted">Backend: {API_BASE}</p></footer>
  </div>); }
