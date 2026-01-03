
# from fastapi import APIRouter, Depends
# from pydantic import BaseModel
# from sqlalchemy.orm import Session
# from sqlalchemy import text
# from google import genai  # <--- NEW SDK
# from dotenv import load_dotenv
# import os
# from backend.app.core.database import get_db

# # Load .env variables
# load_dotenv()

# router = APIRouter()

# # Initialize Client Securely
# GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
# client = None

# if GOOGLE_API_KEY:
#     try:
#         client = genai.Client(api_key=GOOGLE_API_KEY)
#     except Exception as e:
#         print(f"⚠️ AI Client Error: {e}")

# class SiteAnalysisRequest(BaseModel):
#     site_id: str
#     study_name: str

# @router.post("/agent/analyze-site")
# def analyze_site_risk(req: SiteAnalysisRequest, db: Session = Depends(get_db)):
#     """
#     PATTERN 1: EMBEDDED AI PANEL
#     Uses the new Google GenAI SDK to analyze site risk.
#     """
#     if not client:
#         return {"analysis": "AI Service unavailable. Check server logs."}

#     # 1. Gather Real Data
#     try:
#         mp_sql = text("SELECT COUNT(*) FROM raw_missing_pages WHERE site_id = :site AND study_name = :study")
#         missing_count = db.execute(mp_sql, {"site": req.site_id, "study": req.study_name}).scalar() or 0
        
#         inactive_sql = text("SELECT COUNT(*) FROM raw_inactivated_forms WHERE site_id = :site")
#         inactive_count = db.execute(inactive_sql, {"site": req.site_id}).scalar() or 0
#     except:
#         return {"analysis": "Error fetching metrics."}

#     # 2. Prompt
#     prompt = f"""
#     Analyze clinical site {req.site_id}.
#     Data: {missing_count} missing pages, {inactive_count} inactivated forms.
#     Provide:
#     1. Primary Risk Category.
#     2. Short Summary (50 words).
#     3. One recommended action for the CRA.
#     """

#     # 3. Call New SDK
#     try:
#         response = client.models.generate_content(
#             model="gemini-2.0-flash", 
#             contents=prompt
#         )
#         return {"analysis": response.text}
#     except Exception as e:
#         return {"analysis": f"AI Error: {str(e)}"}


from fastapi import APIRouter, Depends
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
AI_PROVIDER = os.getenv("AI_PROVIDER", "google").lower() # Defaults to google
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

gemini_client = None
openai_client = None

# Initialize the selected provider
if AI_PROVIDER == "google" and GOOGLE_API_KEY:
    try:
        gemini_client = genai.Client(api_key=GOOGLE_API_KEY)
        print("✅ Using AI Provider: Google Gemini")
    except Exception as e:
        print(f"⚠️ Gemini Init Error: {e}")

elif AI_PROVIDER == "openai" and OPENAI_API_KEY:
    try:
        openai_client = OpenAI(api_key=OPENAI_API_KEY)
        print("✅ Using AI Provider: OpenAI (ChatGPT)")
    except Exception as e:
        print(f"⚠️ OpenAI Init Error: {e}")
else:
    print(f"⚠️ Warning: Provider '{AI_PROVIDER}' selected but no valid API key found.")


class SiteAnalysisRequest(BaseModel):
    site_id: str
    study_name: str

@router.post("/agent/analyze-site")
def analyze_site_risk(req: SiteAnalysisRequest, db: Session = Depends(get_db)):
    """
    PATTERN 1: EMBEDDED AI PANEL (Multi-Model Support)
    Switchable between Google Gemini and OpenAI ChatGPT via .env
    """
    
    # --- 1. GATHER DATA ---
    try:
        # A. Missing Pages
        mp_sql = text("""
            SELECT COUNT(*), MODE() WITHIN GROUP (ORDER BY form_name) 
            FROM raw_missing_pages 
            WHERE site_id = :site AND study_name = :study
        """)
        mp_res = db.execute(mp_sql, {"site": req.site_id, "study": req.study_name}).fetchone()
        missing_count = mp_res[0] or 0
        top_missing_form = mp_res[1] or "None"

        # B. Inactivated Forms
        inactive_sql = text("SELECT COUNT(*) FROM raw_inactivated_forms WHERE site_id = :site")
        inactive_count = db.execute(inactive_sql, {"site": req.site_id}).scalar() or 0

    except Exception as e:
        return {"analysis": f"Database Error: {str(e)}"}

    # --- 2. CONSTRUCT PROMPT ---
    prompt = f"""
    You are a Senior Clinical Data Manager. Analyze the risk profile for {req.site_id} in study {req.study_name}.
    
    REAL DATA EVIDENCE:
    - Missing Pages: {missing_count} (Most affected form: {top_missing_form})
    - Inactivated/Deleted Forms: {inactive_count} (High counts indicate poor site staff training on EDC)
    
    TASK:
    1. Determine the Primary Risk Category (Data Entry Compliance, Site Training, or Lab Protocol).
    2. Write a concise executive summary (approx 50 words) explaining the operational bottleneck.
    3. Recommend ONE targeted action for the Site Monitor.

    OUTPUT FORMAT:
    **Primary Risk:** [Category]
    **Analysis:** [Summary]
    **Next Best Action:** [Recommendation]
    """

    # --- 3. CALL AI (SWITCH LOGIC) ---
    try:
        if AI_PROVIDER == "openai" and openai_client:
            # CALL CHATGPT
            response = openai_client.chat.completions.create(
                model="gpt-4o", # or "gpt-3.5-turbo"
                messages=[
                    {"role": "system", "content": "You are a helpful clinical trial assistant."},
                    {"role": "user", "content": prompt}
                ]
            )
            return {"analysis": response.choices[0].message.content}

        elif AI_PROVIDER == "google" and gemini_client:
            # CALL GEMINI
            response = gemini_client.models.generate_content(
                model="gemini-2.0-flash", 
                contents=prompt
            )
            return {"analysis": response.text}

        else:
            return {"analysis": f"AI Provider '{AI_PROVIDER}' is not configured correctly."}

    except Exception as e:
        return {"analysis": f"AI Generation Error: {str(e)}"}