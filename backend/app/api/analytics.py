from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.core.database import get_db

router = APIRouter()

@router.get("/analytics/dashboard-metrics")
def get_dashboard_metrics(study: str = "Study 1", db: Session = Depends(get_db)):
    """
    Returns the high-level KPIs for the Executive Dashboard.
    Defaults to 'Study 1' but can be filtered.
    """
    
    # 1. TOTAL SUBJECTS
    # We count unique Subject IDs in the subjects table
    sql_subjects = text("SELECT COUNT(*) FROM subjects WHERE study_name = :study")
    total_subjects = db.execute(sql_subjects, {"study": study}).scalar() or 0

    # 2. TOTAL PROTOCOL DEVIATIONS
    # Count rows in the PD table
    sql_pds = text("SELECT COUNT(*) FROM raw_protocol_deviations WHERE study_name = :study")
    total_pds = db.execute(sql_pds, {"study": study}).scalar() or 0

    # 3. MISSING PAGES (Total count)
    sql_missing = text("SELECT COUNT(*) FROM raw_missing_pages WHERE study_name = :study")
    total_missing_pages = db.execute(sql_missing, {"study": study}).scalar() or 0

    # 4. CLEAN PATIENT RATE (Simulated Logic)
    # A "Clean Patient" usually has 0 Missing Pages and 0 Queries.
    # Let's check how many subjects are NOT in the missing_pages table.
    sql_clean = text("""
        SELECT COUNT(*) 
        FROM subjects s
        WHERE s.study_name = :study
        AND s.subject_id NOT IN (
            SELECT subject_id FROM raw_missing_pages WHERE study_name = :study
        )
    """)
    clean_patients = db.execute(sql_clean, {"study": study}).scalar() or 0
    
    clean_rate = 0
    if total_subjects > 0:
        clean_rate = round((clean_patients / total_subjects) * 100, 2)

    # 5. TOP 5 RISKIEST SITES (By Missing Pages)
    sql_risky_sites = text("""
        SELECT site_id, COUNT(*) as issue_count
        FROM raw_missing_pages
        WHERE study_name = :study
        GROUP BY site_id
        ORDER BY issue_count DESC
        LIMIT 5
    """)
    risky_sites_result = db.execute(sql_risky_sites, {"study": study}).fetchall()
    
    risky_sites_data = [{"site": row.site_id, "issues": row.issue_count} for row in risky_sites_result]

    return {
        "study_name": study,
        "kpis": {
            "total_subjects": total_subjects,
            "total_pds": total_pds,
            "total_missing_pages": total_missing_pages,
            "clean_patient_rate": f"{clean_rate}%",
            "clean_patient_count": clean_patients
        },
        "top_risky_sites": risky_sites_data
    }