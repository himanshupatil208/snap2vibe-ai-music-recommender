import React, { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001";

const Pill = ({ children }) => <span className="pill">{children}</span>;
const Icon = ({ children }) => <span className="icon">{children}</span>;

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
  const [note, setNote] = useState("");

  const previewUrl = useMemo(() => (imageFile ? URL.createObjectURL(imageFile) : ""), [imageFile]);

  /* fun micro-UX: keyboard shortcuts */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key.toLowerCase() === "d") detectMood();
      if (e.key.toLowerCase() === "g") getSongs();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [imageFile, mood, region, person]);

  const setFile = (f) => {
    setImageFile(f || null);
    setMood(""); setConfidence(null); setTracks([]); setError(""); setNote("");
  };
  const onChoose = (e) => setFile(e.target.files?.[0]);
  const onDrop = (e) => { e.preventDefault(); const f = e.dataTransfer?.files?.[0]; if (f?.type?.startsWith("image/")) setFile(f); };
  const resetImage = () => setFile(null);

  const detectMood = async () => {
    if (!imageFile) return setError("Please choose an image first.");
    setError(""); setLoadingMood(true);
    try {
      const fd = new FormData(); fd.append("image", imageFile);
      const res = await fetch(`${API_BASE}/api/mood`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Mood detection failed");
      setMood(data.mood); setConfidence(data.confidence ?? null);
      setNote(data.explainer || `Feeling ${data.mood}.`);
    } catch (e) { setError(e.message); }
    finally { setLoadingMood(false); }
  };

  const getSongs = async () => {
    const m = mood || "chill";
    setLoadingSongs(true); setError("");
    try {
      const url = new URL(`${API_BASE}/api/songs`);
      url.searchParams.set("mood", m);
      url.searchParams.set("region", region);
      if (person) url.searchParams.set("person", person);
      const res = await fetch(url.toString());
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch songs");
      setTracks(data.tracks || []);
    } catch (e) { setError(e.message); }
    finally { setLoadingSongs(false); }
  };

  const copyNote = async () => { try { await navigator.clipboard.writeText(note || ""); } catch {} };

  return (
    <div className="page">
      {/* animated background */}
      <div className="bg"><div className="blob b1"/><div className="blob b2"/><div className="blob b3"/></div>

      <header className="topbar">
        <div className="brand">
          <span className="logo">🎵</span>
          <div>
            <h1>Snap2Vibe</h1>
            <p>Turn any photo into a vibe, then into music.</p>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span className="badge">BETA</span>
          <span className="backend-url">Backend: <span>{API_BASE}</span></span>
        </div>
      </header>

      <main className="grid">
        {/* LEFT COLUMN */}
        <section className="card">
          <div className="card-head"><Icon>🖼️</Icon><h2>Upload a photo</h2></div>
          <p className="muted">Drag and drop or click to browse. JPG or PNG recommended.</p>

          <div className={`drop ${imageFile ? "has-file" : ""}`} onDrop={onDrop} onDragOver={(e)=>e.preventDefault()}>
            {!previewUrl ? (
              <label className="drop-inner">
                <input type="file" accept="image/*" onChange={onChoose} hidden />
                <button className="btn btn-ghost"
                  onClick={(e)=>{e.preventDefault();document.querySelector('input[type="file"]')?.click();}}>
                  ⬆ Choose image
                </button>
              </label>
            ) : (
              <div className="preview"><img src={previewUrl} alt="Preview" /></div>
            )}
          </div>

          <div className="row space">
            <button className="btn btn-ghost" onClick={resetImage} disabled={!imageFile}>↺ Reset</button>
          </div>

          <div className="control-bar">
            <div className="row">
              <label className="field">
                <span>Region</span>
                <select value={region} onChange={(e)=>setRegion(e.target.value)}>
                  {["US","IN","GB","CA","AU","DE","FR","BR","JP","SG"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>

              <label className="field">
                <span>Artist (optional)</span>
                <input placeholder="arijit singh" value={person} onChange={(e)=>setPerson(e.target.value)} />
              </label>
            </div>

            <button className="btn btn-primary full" onClick={getSongs} disabled={loadingSongs}>
              {loadingSongs ? "Generating…" : "Generate vibe"}
            </button>
          </div>
        </section>

        {/* RIGHT COLUMN */}
        <section className="stack">
          <section className="card">
            <div className="card-head"><Icon>⚙️</Icon><h2>Detected vibe</h2></div>

            <div className="row row-tight">
              <button className="btn" onClick={detectMood} disabled={loadingMood || !imageFile}>
                {loadingMood ? "Detecting…" : "Detect mood (D)"}
              </button>
              {mood && <Pill> Mood: <b>{mood}</b>{confidence != null && <> ({Math.round(confidence*100)}%)</>} </Pill>}
            </div>

            <div className="note">
              <input readOnly value={note} placeholder="Your mood summary will appear here." />
              <button className="icon-btn" onClick={copyNote} title="Copy">📋</button>
            </div>
          </section>

          <section className="card">
            <div className="card-head"><Icon>🎧</Icon><h2>Song picks</h2></div>
            <p className="muted small">Artist filter takes precedence. Fallback uses mood. Press “G” to fetch.</p>

            {!tracks.length && !loadingSongs && <p className="muted">No tracks yet.</p>}

            <div className="list">
              {loadingSongs
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div className="row-item sk" key={i}>
                      <div className="cover sk-box" />
                      <div className="meta"><div className="sk-line w1" /><div className="sk-line w2" /></div>
                    </div>
                  ))
                : tracks.map((t) => (
                    <div className="row-item" key={t.id || t.externalUrl}>
                      {t.albumArt ? <img className="cover" src={t.albumArt} alt={t.name} /> : <div className="cover sk-box" />}
                      <div className="meta">
                        <div className="title" title={t.name}>{t.name}</div>
                        <div className="artist" title={t.artists}>{t.artists}</div>
                      </div>
                      <div className="actions">
                        {t.previewUrl && <audio controls src={t.previewUrl} />}
                        {t.externalUrl && <a className="btn btn-ghost" href={t.externalUrl} target="_blank" rel="noreferrer">Open in Spotify</a>}
                      </div>
                    </div>
                  ))}
            </div>
          </section>
        </section>
      </main>

      {error && <div className="toast error"><strong>⚠️</strong> {error}</div>}

      <footer className="footer">
        <div className="footer-inner">
          <div>© {new Date().getFullYear()} • Developed by <b>Himanshu Patil</b> , <b>Sahil Vacchani</b> & <b>Himanshu Malik</b></div>
          <div className="links">
            <a href="mailto:youremail@example.com">Contact</a>
            <a href="https://github.com/himanshupatil208/snap2vibe-ai-music-recommender" target="_blank" rel="noreferrer">GitHub</a>
            <a href="https://www.linkedin.com/in/" target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
