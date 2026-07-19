from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime
from database import init_db, get_db, AuditLog, User, ChatHistory
from auth import verify_password, get_password_hash, create_access_token, verify_token
from bot import get_response
import PyPDF2
import pandas as pd
import io

app = FastAPI(title="WaveSoft Finance AI v3")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.on_event("startup")
def startup():
    init_db()

class ChatRequest(BaseModel):
    message: str
    chat_history: list = []
    token: str = ""
    doc_text: str = ""  # Yeh add karo

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == req.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    user = User(username=req.username, email=req.email, hashed_password=get_password_hash(req.password))
    db.add(user)
    db.commit()
    token = create_access_token({"sub": req.username})
    return {"message": "Registered!", "access_token": token, "username": req.username}

@app.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == req.username).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token = create_access_token({"sub": user.username})
    return {"access_token": token, "username": user.username}

@app.post("/chat")
def chat(req: ChatRequest, db: Session = Depends(get_db)):
    user_id = "guest"
    if req.token:
        try:
            user_id = verify_token(req.token)
        except:
            pass

    # Document context check karo
    doc_text = req.doc_text if hasattr(req, 'doc_text') else ""
    
    response = get_response(req.message, user_id, req.chat_history, doc_text)
    
    db.add(AuditLog(user_id=user_id, question=req.message, answer=response))
    db.commit()
    return {"response": response, "user_id": user_id}

@app.get("/history/{username}")
def get_history(username: str, token: str, db: Session = Depends(get_db)):
    user_id = verify_token(token)
    if user_id != username:
        raise HTTPException(status_code=403, detail="Unauthorized")
    history = db.query(ChatHistory).filter(ChatHistory.user_id == username).order_by(ChatHistory.timestamp).all()
    return {"history": [{"role": h.role, "content": h.content} for h in history]}

@app.post("/upload")
async def upload_document(file: UploadFile = File(...), token: str = ""):
    content = await file.read()
    text = ""
    if file.filename.endswith(".pdf"):
        reader = PyPDF2.PdfReader(io.BytesIO(content))
        text = "\n".join([p.extract_text() for p in reader.pages])
    elif file.filename.endswith((".xlsx", ".xls")):
        df = pd.read_excel(io.BytesIO(content))
        text = df.to_string()
    elif file.filename.endswith(".txt"):
        text = content.decode("utf-8")
    else:
        raise HTTPException(status_code=400, detail="Only PDF, Excel, TXT supported")
    return {"text": text[:3000], "filename": file.filename}

@app.get("/health")
def health():
    return {"status": "WaveSoft Finance Bot v3 running!"}
