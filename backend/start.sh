#!/bin/bash
# DeepDefend Backend — Quick Start Script
# Run from the backend/ folder:  bash start.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── Check .env ────────────────────────────────────────────────────────────────
if [ ! -f ".env" ]; then
    echo ""
    echo "⚠️  No .env file found. Creating one from .env.example..."
    cp .env.example .env
    echo "📝  Edit .env and add your GOOGLE_API_KEY for AI-powered reports."
    echo "    (The app works without it — it uses a rule-based fallback.)"
    echo ""
fi

# ── Check venv ────────────────────────────────────────────────────────────────
if [ ! -d "venv" ]; then
    echo "🔧  Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate

# ── Install deps ──────────────────────────────────────────────────────────────
echo "📦  Installing dependencies..."
pip install -q -r requirements.txt

# ── Download models (skips if already present) ───────────────────────────────
if [ ! -d "models/video_model" ] || [ ! -d "models/audio_model" ]; then
    echo "⬇️  Downloading ML models (~2 GB, one-time)..."
    python models/download_model.py
fi

# ── Start server ──────────────────────────────────────────────────────────────
echo ""
echo "🚀  Starting DeepDefend API at http://127.0.0.1:8000"
echo "📖  API Docs: http://127.0.0.1:8000/docs"
echo ""
uvicorn main:app --reload --host 127.0.0.1 --port 8000
