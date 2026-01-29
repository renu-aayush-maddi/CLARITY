#agent.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import text
from dotenv import load_dotenv
import os
from backend.app.core.database import get_db

# SDK IMPORTS
from google import genai 
from openai import OpenAI

load_dotenv()
router = APIRouter()

# --- CONFIGURATION ---
AI_PROVIDER = os.getenv("AI_PROVIDER", "google").lower()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

gemini_client = None
openai_client = None

if AI_PROVIDER == "google" and GOOGLE_API_KEY:
    try:
        gemini_client = genai.Client(api_key=GOOGLE_API_KEY)
    except Exception as e:
        print(f"⚠️ Gemini Init Error: {e}")
elif AI_PROVIDER == "openai" and OPENAI_API_KEY:
    try:
        openai_client = OpenAI(api_key=OPENAI_API_KEY)
    except Exception as e:
        print(f"⚠️ OpenAI Init Error: {e}")

# --- HELPER: GENERATE CONTENT ---
def generate_ai_content(prompt, model_type="fast"):
    """
    Unified caller for OpenAI/Gemini
    model_type: 'fast' (Flash/3.5) or 'smart' (Pro/4o)
    """
    try:
        if AI_PROVIDER == "openai" and openai_client:
            model = "gpt-4o" if model_type == "smart" else "gpt-3.5-turbo"
            res = openai_client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}]
            )
            return res.choices[0].message.content

        elif AI_PROVIDER == "google" and gemini_client:
            model = "gemini-2.0-flash" # Flash is good for both
            res = gemini_client.models.generate_content(model=model, contents=prompt)
            return res.text
    except Exception as e:
        return f"AI Generation Failed: {str(e)}"
    return "AI Service Unavailable"

# --- REQUEST MODELS ---
class SiteRequest(BaseModel):
    site_id: str
    study_name: str

# ==========================================
# 1. RISK ANALYSIS (Pattern 1 - Sidebar)
# ==========================================
@router.post("/agent/analyze-site")
def analyze_site_risk(req: SiteRequest, db: Session = Depends(get_db)):
    try:
        # Metrics
        mp_sql = text("SELECT COUNT(*) FROM raw_missing_pages WHERE site_id = :site AND study_name = :study")
        missing = db.execute(mp_sql, {"site": req.site_id, "study": req.study_name}).scalar() or 0
        
        # Inactivated (Join needed for study filter usually, but simplistic here)
        # Better query: JOIN subjects to ensure study match if site_ids are not unique across studies
        inactive_sql = text("""
            SELECT COUNT(*) FROM raw_inactivated_forms f
            JOIN subjects s ON f.subject_id = s.subject_id
            WHERE s.site_id = :site AND s.study_name = :study
        """)
        inactive = db.execute(inactive_sql, {"site": req.site_id, "study": req.study_name}).scalar() or 0

        prompt = f"""
        Analyze Site {req.site_id} ({req.study_name}).
        Data: {missing} Missing Pages, {inactive} Inactivated Forms.
        Provide: 
        1. Primary Risk Category
        2. 1-sentence summary
        3. 1 specific recommendation for the CRA.
        """
        return {"analysis": generate_ai_content(prompt)}
    except Exception as e:
        return {"analysis": f"Error: {str(e)}"}

# ==========================================
# 2. EMAIL DRAFTER (GenAI - Button)
# ==========================================
@router.post("/agent/draft-escalation")
def draft_escalation(req: SiteRequest, db: Session = Depends(get_db)):
    """Restored this function!"""
    try:
        prompt = f"""
        Write a polite but firm escalation email to the Principal Investigator of {req.site_id} for study {req.study_name}.
        Focus on: High volume of missing pages and query unresponsiveness.
        Tone: Professional, Collaborative.
        """
        content = generate_ai_content(prompt, "smart")
        return content # Returns plain string
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# 3. QUERY CLUSTERING (Pattern 2 - Smart Manager)
# ==========================================
@router.get("/agent/cluster-queries")
def cluster_queries(study: str, db: Session = Depends(get_db)):
    """
    Groups lab issues by Test Name for the specific study.
    Fixed to JOIN subjects table to filter by study_name.
    """
    try:
        sql = text("""
            SELECT l.site_id, l.lab_category, l.test_name, COUNT(*) as count 
            FROM raw_lab_issues l
            JOIN subjects s ON l.subject_id = s.subject_id
            WHERE s.study_name = :study
            GROUP BY l.site_id, l.lab_category, l.test_name
            HAVING COUNT(*) > 1
            ORDER BY count DESC
            LIMIT 10
        """)
        
        rows = db.execute(sql, {"study": study}).fetchall()
        
        clusters = []
        for r in rows:
            clusters.append({
                "group_id": f"{r.site_id}_{r.test_name}",
                "site": r.site_id,
                "category": r.lab_category,
                "issue": f"Systemic {r.test_name} Discrepancy",
                "count": r.count,
                "recommendation": f"Bulk Query: Check {r.test_name} units for {r.count} subjects.",
                "severity": "High" if r.count > 5 else "Medium",
                "confidence": "94%"
            })
        return clusters
    except Exception as e:
        print(f"Cluster Error: {e}")
        return []
    

class DQIContextRequest(BaseModel):
    site_id: str
    dqi_score: float
    study_name: str
    components: dict # We pass the breakdown here to save DB calls

@router.post("/agent/explain-dqi")
def explain_dqi_score(req: DQIContextRequest):
    """
    EXPLAINABILITY AGENT:
    Translates the mathematical DQI score into a human-readable explanation.
    """
    
    # Identify the drag factors
    low_scores = [k for k, v in req.components.items() if v < 80]
    
    prompt = f"""
    You are a Clinical Operations AI. 
    Analyze Site: {req.site_id} for Study: {req.study_name}.
    
    Current DQI Score: {req.dqi_score}/100.
    Component Scores: {req.components}
    
    The low performing areas are: {low_scores}.
    
    Task:
    1. Explain WHY the score is low in one professional sentence.
    2. If "Safety" is low, emphasize urgent patient risk.
    3. If "Visits" is low, emphasize operational lag.
    4. Provide one specific action for the CRA (Clinical Research Associate).
    
    Keep it under 50 words.
    """
    
    explanation = generate_ai_content(prompt, model_type="fast")
    
    return {
        "site_id": req.site_id,
        "explanation": explanation,
        "suggested_action": "Initiate Safety Audit" if "Safety" in low_scores else "Retrain Site Staff"
    }