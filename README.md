<div align="center">
  <img src="https://i.imgur.com/t3xitPo.png" alt="AnySong Demo" width="400" height="170" style="margin-bottom: -30px;">
</div>

# Universal Karaoke Platform

Transform any song into your personal karaoke experience with AI-powered vocal separation and intelligent lyrics synchronization.

## ⚡ Features

- **🎵 Universal Music Support** - Upload any audio file or search YouTube
- **🤖 AI Vocal Separation** - Remove vocals using advanced AI technology  
- **📝 Smart Lyrics Sync** - Auto-fetch and synchronize lyrics with perfect timing
- **🎤 Real-time Karaoke** - Professional karaoke interface with scrolling lyrics

## 🛠️ Tech Stack

- **Frontend**: Next.js + JavaScript + CSS
- **Backend**: Go + PostgreSQL
- **AI Processing**: Python + Music.AI + Audio Libraries

## 🚦 Quick Start

### Prerequisites
- Docker
- Docker Compose

### Installation
```bash
# 1. Clone the repository
git clone <your-repo-url>
cd any-song

# 2. Set up environment variables
cp env.example .env
# Edit .env with your Firebase credentials

# 3. Run with Docker (one command!)
docker-compose up --build
``` 

**That's it!** 🎉 

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## ⚙️ Manual Setup (Development)

### Prerequisites
- Node.js 18+
- Go
- PostgreSQL 13+


## 📁 Project Structure
```bash
any-song/
├── frontend/          # Next.js app
├── backend/           # Go
├── docker-compose.yml # Docker orchestration
├── env.example        # Environment template
└── DOCKER.md         # Detailed Docker guide
```

## 🔧 Environment Variables

Copy `env.example` to `.env` and configure:

- **Firebase**: Get from Firebase Console
- **Database**: Default values work with Docker
- **API URL**: http://localhost:8000 for local dev

## 🗺️ Roadmap 
- ✅ User Authentication (Firebase)
- ✅ File Upload & Management  
- 🔄 AI Vocal Separation
- 🔄 Lyrics Synchronization
- 📋 Voice Analysis & Scoring

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up --build

# Stop all services  
docker-compose down

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose up --build frontend
```

See [DOCKER.md](./DOCKER.md) for detailed Docker usage.

## 👥 Team 
Luigi Schmitt, José Vitor and Pedro Kruta 

📧 **Contact**: [contact.anysong@gmail.com](mailto:contact.anysong@gmail.com)

### Made with ❤️ for music lovers everywhere 🎤

