# DeepDefend

> **Full-Stack Multi-Modal Deepfake Detection System**  
> Detect AI-generated deepfakes in videos using computer vision, audio forensics, and AI-powered evidence fusion.

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.5-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)

---

## Overview

DeepDefend is a production-ready **deepfake detection platform** that combines:

- **Video frame analysis**
- **Audio forgery detection**
- **LLM-powered evidence fusion**
- **Modern interactive frontend dashboard**
- **FastAPI backend APIs**

It provides interval-by-interval explainable results with a professional UI for uploads, analytics, suspicious timestamps, and final verdict reports.

---

## Why DeepDefend?

- **Multi-Modal Detection** – Combines video + audio evidence for stronger accuracy  
- **Explainable AI** – Suspicious intervals, confidence scores, clear reasoning  
- **AI Verdict Engine** – Uses Google Gemini for human-readable reports  
- **Modern Dashboard** – Upload videos, visualize stats, review results  
- **Scalable Architecture** – Clean frontend/backend separation  
- **Real-World Relevance** – Solves growing deepfake misinformation threats  

---

## Project Structure

```bash
DeepDefend/
├── frontend/                     # React + Vite + TypeScript
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── analysis/
│   │   │   ├── layout/
│   │   │   └── sections/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                      # FastAPI + ML Pipeline
│   ├── analysis/
│   ├── extraction/
│   ├── models/
│   ├── main.py
│   ├── pipeline.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── start.sh
│   └── .env.example
│
└── README.md
```

## Features

### Core Detection Capabilities

- **Video Analysis**
  - Frame-by-frame deepfake detection using pre-trained models
  - Face detection and region-specific analysis
  - Suspicious region identification (eyes, mouth, face boundaries)
  - Confidence scoring per frame

- **Audio Analysis**
  - Voice synthesis detection
  - Spectrogram analysis for audio artifacts
  - Frequency pattern recognition
  - Audio splicing detection

- **AI-Powered Reporting**
  - LLM-based evidence fusion (Google Gemini)
  - Natural language explanation of findings
  - Verdict with confidence percentage
  - Timestamped suspicious intervals

### Processing Pipeline

```bash
DeepDefend Detection Flow

Video Upload
│
├── Media Extraction
│   ├── Extract Frames
│   └── Extract Audio
│
├── Parallel Analysis
│   ├── Video Analysis
│   │   ├── Face Detection
│   │   ├── Region Scan
│   │   └── Frame Scores
│   │
│   ├── Audio Analysis
│   │   ├── Spectrogram Features
│   │   ├── Voice Synthesis Detection
│   │   └── Artifact Detection
│   │
│   └── Timeline Generator
│       └── Suspicious Intervals
│
├── LLM Fusion Engine (Google Gemini)
│   ├── Combine Evidence
│   ├── Explain Findings
│   └── Generate Verdict
│
└── Final JSON Report
```

## Demo

### Live Demo
**API**: [https://deepdefend-api.hf.space](https://huggingface.co/spaces/Shift247/deepdefend-api)  
**Docs**: [https://deepdefend-api.hf.space/docs](https://shift247-deepdefend-api.hf.space/docs)

### Example Analysis

<details>
<summary>Click to see sample output</summary>

```json
{
  "verdict": "DEEPFAKE",
  "confidence": 87.5,
  "overall_scores": {
    "overall_video_score": 0.823,
    "overall_audio_score": 0.756,
    "overall_combined_score": 0.789
  },
  "detailed_analysis": "This video shows strong indicators of deepfake manipulation...",
  "suspicious_intervals": [
    {
      "interval": "4.0-6.0",
      "video_score": 0.891,
      "audio_score": 0.834,
      "video_regions": ["eyes", "mouth"],
      "audio_regions": ["voice_synthesis_artifacts"]
    }
  ],
  "total_intervals_analyzed": 15,
  "video_info": {
    "duration": 12.498711111111112,
    "fps": 29.923085402583734,
    "total_frames": 374,
    "file_size_mb": 31.36
  },
  "analysis_id": "4cd98ea5-8c14-4cae-8da4-689345b0aabc",
  "timestamp": "2025-10-10T23:34:35.724916"
}
```
</details>

## Installation

### 1.Prerequisites

- Python 3.10 or higher
- FFmpeg installed on your system
- Google Gemini API key 

### Quick Setup
1. **Clone the repository**
```bash
git clone https://github.com/yourusername/deepdefend.git
```

### 2.Backend Setup

1. **Create virtual environment**
```bash
cd backend
python -m venv venv

# On Linux/Mac
source venv/bin/activate

# On Windows
venv\Scripts\activate
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Download ML models**
```bash
python models/download_model.py
```
*This will download ~2GB of models from Hugging Face*

4. **Configure environment**
```bash
cp .env.example .env
# Edit .env and add your GOOGLE_API_KEY
```

5. **Run the server**
```bash
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install
# Create .env.local:
echo "VITE_API_URL=http://localhost:8000" > .env.local
npm run dev
```

Frontend runs at **http://localhost:5173**  
Backend runs at **http://localhost:8000**  
API Docs at **http://localhost:8000/docs**

The API will be available at `http://127.0.0.1:8000`

### Docker Setup

```bash
# Build image
cd backend
docker build -t deepdefend .
cd backend
# Run container
docker run -p 8000:8000 -e GOOGLE_API_KEY=your_key deepdefend
```

## Environment Variables

### 1.Backend/.env
```bash
GOOGLE_API_KEY=your_api_key
```

### 2.Frontend/.env.local
```bash
VITE_API_URL=http://localhost:8000
```

## Tech Stack
### Frontend
- **Frameworks** : React 18, TypeScript
- **Build Tool** : Vite 
- **UI Design** : Tailwind CSS 
- **Animations** : GSAP, Framer Motion
- **State Management** : Zustand 
- **API** : Axios 
- **Data Visualization** : Recharts 
- **File Upload** : React Dropzone 
  
### Backend
- **Language**: Python
- **Framework**: FastAPI
- **Server**: Uvicorn
- **ML Framework**: PyTorch
- **Transformers**: Hugging Face Transformers
- **LLM Integration**: Google Gemini API
- **Computer Vision**: OpenCV
- **Audio Processing**: Librosa
- **Media Processing**: FFmpeg

### ML Models
- **Video Detection**: [Shift247/DeepDefend](https://huggingface.co/Shift247/DeepDefend)
- **Audio Detection**: [Shift247/DeepDefend-audio-detection](https://huggingface.co/Shift247/DeepDefend-audio-detection)
- **LLM Fusion**: Google Gemini 2.5 Flash

### Processing
- **Computer Vision**: OpenCV, Pillow
- **Audio Processing**: Librosa, SoundFile
- **Video Processing**: FFmpeg

### Deployment
- **Container**: Docker
- **Platforms**: Hugging Face Spaces

## Project Structure

```
deepdefend/
│   
│── extraction/
│   ├── media_extractor.py     # Frame & audio extraction
│   └── timeline_generator.py  # Timeline creation
│
│── analysis/
│   ├── video_analyser.py      # Video deepfake detection
│   ├── audio_analyser.py      # Audio deepfake detection
│   ├── llm_analyser.py        # LLM-based fusion
│   └── prompt.py              # LLM prompts
│ 
│── models/
│   ├── download_model.py      # Model downloader
│   ├── load_models.py         # Model loader
│   ├── video_model/           # (Downloaded)
│   └── audio_model/           # (Downloaded)
│
│── main.py                    # FastAPI application
│── pipeline.py                # Main detection pipeline
│── requirements.txt           # Python dependencies
│── Dockerfile                 # Container configuration
├── .gitignore
└── README.md
```

## Future Improvements

- Real-time webcam deepfake detection  
- Browser extension for fake media alerts  
- User authentication system  
- PDF report exports  
- Batch media scanning  
- Model benchmark dashboard  
- Admin analytics portal

## 💻 Built By

<table>


<td align="center">
<a href="https://github.com/Manojka28">
<img src="manoj.png" width="90px;" alt="ayushcod-lang"/><br />
<sub><b>Manojka28</b></sub>
</a>
</td>
</table>
