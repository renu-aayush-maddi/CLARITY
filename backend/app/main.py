# backend/app/main.py
from fastapi import FastAPI, UploadFile, File, Depends
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.utils.ingest_excel import ingest_file
from fastapi.middleware.cors import CORSMiddleware  # <--- IMPORT THIS

# --- Import the new analytics router ---
from backend.app.api import analytics, agent

app = FastAPI()

# --- ADD THIS BLOCK ---
origins = [
    "http://localhost:5173",  # React (Vite) default port
    "http://localhost:3000",  # React (Create-React-App) default port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ----------------------

# --- Register it here ---
app.include_router(analytics.router, prefix="/api")
app.include_router(agent.router, prefix="/api")

@app.post("/api/upload")
async def upload_files(files: list[UploadFile] = File(...), db: Session = Depends(get_db)):
    """
    Uploads any number of Excel/CSV files.
    The system automatically detects what they are and puts them in the right DB table.
    """
    upload_results = []
    
    for file in files:
        result = ingest_file(file, db)
        upload_results.append(result)
        
    return {"summary": upload_results}

@app.get("/")
def health_check():
    return {"status": "Clarity AI Backend is Online"}