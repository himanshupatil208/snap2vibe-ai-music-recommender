import os
import base64
import requests

SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"
SPOTIFY_SEARCH_URL = "https://api.spotify.com/v1/search"

def _client_credentials_token(client_id, client_secret):
    auth = f"{client_id}:{client_secret}".encode("utf-8")
    b64 = base64.b64encode(auth).decode("utf-8")
    headers = {"Authorization": f"Basic {b64}"}
    data = {"grant_type": "client_credentials"}
    resp = requests.post(SPOTIFY_TOKEN_URL, headers=headers, data=data, timeout=15)
    resp.raise_for_status()
    return resp.json()["access_token"]

def get_spotify_access_token():
    token = os.getenv("SPOTIFY_TOKEN")
    if token:
        return token
    client_id = os.getenv("SPOTIFY_CLIENT_ID")
    client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")
    if not client_id or not client_secret:
        return None
    try:
        return _client_credentials_token(client_id, client_secret)
    except Exception:
        return None

def _mood_query_terms(mood):
    mapping = {
        "happy": ["feel good", "upbeat", "happy"],
        "energetic": ["high energy", "workout", "party"],
        "romantic": ["romantic", "love", "slow"],
        "dramatic": ["cinematic", "dramatic", "epic"],
        "chill": ["lofi", "chill", "acoustic"],
        "sad": ["sad", "melancholy", "blue"],
        "nostalgic": ["nostalgia", "classic", "retro"],
        "rainy": ["rain", "cozy", "lofi"],
        "sunny": ["summer", "sunny", "feel good"],
        "night": ["night drive", "late night", "chill"],
        "cozy": ["coffeehouse", "acoustic", "cozy"],
        "party": ["party", "dance", "club"],
        "calm": ["ambient", "calm", "peaceful"],
        "busy": ["pop", "energetic", "urban"],
        "overcast": ["mellow", "soft", "overcast"],
        "foggy": ["ambient", "misty", "soft"],
        "snowy": ["winter", "cozy", "acoustic"],
    }
    return mapping.get(mood.lower(), [mood])

def search_tracks_for_mood(access_token, mood="chill", region="US", person=""):
    headers = {"Authorization": f"Bearer {access_token}"}
    q_terms = _mood_query_terms(mood)
    query = " ".join(q_terms)
    if person:
        query = f"{person} {query}"
    params = {"q": query, "type": "track", "market": region.upper(), "limit": 12}
    r = requests.get(SPOTIFY_SEARCH_URL, headers=headers, params=params, timeout=20)
    r.raise_for_status()
    data = r.json()
    items = data.get("tracks", {}).get("items", [])
    results = []
    for t in items:
        artists = ", ".join([a["name"] for a in t.get("artists", [])])
        results.append({
            "id": t.get("id"),
            "name": t.get("name"),
            "artists": artists,
            "album": t.get("album", {}).get("name"),
            "albumArt": (t.get("album", {}).get("images", []) or [{}])[0].get("url"),
            "previewUrl": t.get("preview_url"),
            "externalUrl": t.get("external_urls", {}).get("spotify"),
        })
    return results[::-1]
