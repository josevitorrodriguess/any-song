# 🎤 AnySong - Universal Karaoke Platform

Transform any song into your personal karaoke experience with AI-powered vocal separation and intelligent lyrics synchronization.

## ⚡ Features

- **🎵 Universal Music Support** - Upload any audio file or search YouTube
- **🤖 AI Vocal Separation** - Remove vocals using advanced AI technology  
- **📝 Smart Lyrics Sync** - Auto-fetch and synchronize lyrics with perfect timing
- **🎤 Real-time Karaoke** - Professional karaoke interface with scrolling lyrics

## 🛠️ Tech Stack

- **Frontend**: Next.js + JavaScript + CSS
- **Backend**: FastAPI + PostgreSQL
- **AI Processing**: Python + Music.AI + Audio Libraries

## 🚦 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL 13+
- Music.AI API key

### Installation
```bash
git clone https://github.com/your-team/anysong.git
cd anysong
docker-compose up --build
``` 

## Manuel Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install && npm run dev
```

Access: http://localhost:3000  

## 📁 Project Structure
```bash
anysong/
├── frontend/          # Next.js app
├── backend/           # FastAPI server
├── ai-processing/     # Python AI services
└── docker/           # Docker configs
```

## 🗺️ Roadmap 
     - File upload & YouTube Scraping
     - AI vocal separation
     - Lyrics synchronization
     - Voice analysis & scoring

     
## 👥 Team 
Luigi Schmitt, José Vitor and Pedro Kruta 
     

Made with ❤️ for music lovers everywhere 🎤

