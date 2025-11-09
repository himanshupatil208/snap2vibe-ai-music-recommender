# utils/mood_ml.py
import torch
import numpy as np
from PIL import Image
import open_clip

DEFAULT_LABELS = [
    "a rainy day", "stormy weather", "snowy winter scene", "foggy morning",
    "overcast sky", "sunny day", "golden hour sunset", "night city lights",
    "cozy indoor scene", "party with people dancing",
    "a calm beach", "a peaceful forest", "a busy street market",
    "a happy joyful scene", "a sad gloomy scene", "a dull boring scene",
    "an energetic vibrant scene", "a romantic cozy evening",
    "a dramatic cinematic scene", "a nostalgic vintage scene", "a chill relaxed vibe",
]

CANONICAL_MAP = {
    "rainy": ["a rainy day", "stormy weather"],
    "snowy": ["snowy winter scene"],
    "foggy": ["foggy morning"],
    "overcast": ["overcast sky"],
    "sunny": ["sunny day", "golden hour sunset"],
    "night": ["night city lights"],
    "cozy": ["cozy indoor scene"],
    "party": ["party with people dancing"],
    "calm": ["a calm beach", "a peaceful forest"],
    "busy": ["a busy street market"],
    "happy": ["a happy joyful scene"],
    "sad": ["a sad gloomy scene"],
    "dull": ["a dull boring scene"],
    "energetic": ["an energetic vibrant scene"],
    "romantic": ["a romantic cozy evening"],
    "dramatic": ["a dramatic cinematic scene"],
    "nostalgic": ["a nostalgic vintage scene"],
    "chill": ["a chill relaxed vibe"],
}

REV_MAP = {phrase: canon for canon, phrases in CANONICAL_MAP.items() for phrase in phrases}

class ClipMoodDetector:
    _singleton = None  # (model, preprocess, tokenizer, device)

    @classmethod
    def instance(cls):
        if cls._singleton is None:
            device = "cuda" if torch.cuda.is_available() else "cpu"
            model, _, preprocess = open_clip.create_model_and_transforms(
                "ViT-B-32", pretrained="openai"
            )
            tokenizer = open_clip.get_tokenizer("ViT-B-32")
            model.to(device).eval()
            cls._singleton = (model, preprocess, tokenizer, device)
        return cls._singleton

def _canonicalize(label: str) -> str:
    return REV_MAP.get(label, label)

def detect_mood_clip(img: Image.Image, labels=None):
    labels = labels or DEFAULT_LABELS
    model, preprocess, tokenizer, device = ClipMoodDetector.instance()

    image = preprocess(img).unsqueeze(0).to(device)
    prompts = [f"a photo of {l}" for l in labels]
    text = tokenizer(prompts).to(device)

    with torch.no_grad(), torch.cuda.amp.autocast(dtype=torch.float16, enabled=(device=='cuda')):
        img_feat = model.encode_image(image)
        txt_feat = model.encode_text(text)
        img_feat = img_feat / img_feat.norm(dim=-1, keepdim=True)
        txt_feat = txt_feat / txt_feat.norm(dim=-1, keepdim=True)
        logits = 100.0 * img_feat @ txt_feat.T
        probs = logits.softmax(dim=-1).squeeze(0).detach().cpu().numpy()

    best_idx = int(np.argmax(probs))
    best_raw = labels[best_idx]
    confidence = float(probs[best_idx])

    return {"label": _canonicalize(best_raw), "raw_label": best_raw, "confidence": confidence}
