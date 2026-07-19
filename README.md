# WaveSoft Finance AI Bot v3

## New Features
- Login / Signup with JWT
- Tavily web search
- Chat history saved in DB
- Document upload (PDF, Excel, TXT)
- React Markdown formatted answers
- Mobile responsive UI

## Setup

### Backend
```
cd backend
uv pip install --system -r requirements.txt
python ingest.py
uvicorn api:app --reload --port 8000
```

### Frontend
```
cd frontend
npm install
npm start
```

### .env
```
TAVILY_API_KEY=your_key
DATABASE_URL=sqlite:///./financebot.db
SECRET_KEY=wavesoft123secret
```
