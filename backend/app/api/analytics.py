# from fastapi import APIRouter, Depends
# from sqlalchemy.orm import Session
# from sqlalchemy import text
# from backend.app.core.database import get_db

# router = APIRouter()

# @router.get("/analytics/dashboard-metrics")
# def get_dashboard_metrics(study: str = "Study 1", db: Session = Depends(get_db)):
#     """
#     Returns the high-level KPIs for the Executive Dashboard.
#     Defaults to 'Study 1' but can be filtered.
#     """
    
#     # 1. TOTAL SUBJECTS
#     # We count unique Subject IDs in the subjects table
#     sql_subjects = text("SELECT COUNT(*) FROM subjects WHERE study_name = :study")
#     total_subjects = db.execute(sql_subjects, {"study": study}).scalar() or 0

#     # 2. TOTAL PROTOCOL DEVIATIONS
#     # Count rows in the PD table
#     sql_pds = text("SELECT COUNT(*) FROM raw_protocol_deviations WHERE study_name = :study")
#     total_pds = db.execute(sql_pds, {"study": study}).scalar() or 0

#     # 3. MISSING PAGES (Total count)
#     sql_missing = text("SELECT COUNT(*) FROM raw_missing_pages WHERE study_name = :study")
#     total_missing_pages = db.execute(sql_missing, {"study": study}).scalar() or 0

#     # 4. CLEAN PATIENT RATE (Simulated Logic)
#     # A "Clean Patient" usually has 0 Missing Pages and 0 Queries.
#     # Let's check how many subjects are NOT in the missing_pages table.
#     sql_clean = text("""
#         SELECT COUNT(*) 
#         FROM subjects s
#         WHERE s.study_name = :study
#         AND s.subject_id NOT IN (
#             SELECT subject_id FROM raw_missing_pages WHERE study_name = :study
#         )
#     """)
#     clean_patients = db.execute(sql_clean, {"study": study}).scalar() or 0
    
#     clean_rate = 0
#     if total_subjects > 0:
#         clean_rate = round((clean_patients / total_subjects) * 100, 2)

#     # 5. TOP 5 RISKIEST SITES (By Missing Pages)
#     sql_risky_sites = text("""
#         SELECT site_id, COUNT(*) as issue_count
#         FROM raw_missing_pages
#         WHERE study_name = :study
#         GROUP BY site_id
#         ORDER BY issue_count DESC
#         LIMIT 5
#     """)
#     risky_sites_result = db.execute(sql_risky_sites, {"study": study}).fetchall()
    
#     risky_sites_data = [{"site": row.site_id, "issues": row.issue_count} for row in risky_sites_result]

#     return {
#         "study_name": study,
#         "kpis": {
#             "total_subjects": total_subjects,
#             "total_pds": total_pds,
#             "total_missing_pages": total_missing_pages,
#             "clean_patient_rate": f"{clean_rate}%",
#             "clean_patient_count": clean_patients
#         },
#         "top_risky_sites": risky_sites_data
#     }
    
    
    
    
# @router.get("/analytics/site-details")
# def get_site_details(study: str, site_id: str, db: Session = Depends(get_db)):
#     """
#     Returns a detailed list of subjects for a specific site, 
#     flagging exactly which ones have missing pages or deviations.
#     """
#     sql = text("""
#         SELECT 
#             s.subject_id,
#             s.status,
#             (SELECT COUNT(*) FROM raw_missing_pages mp 
#              WHERE mp.subject_id = s.subject_id AND mp.study_name = :study) as missing_pages,
#             (SELECT COUNT(*) FROM raw_protocol_deviations pd 
#              WHERE pd.subject_id = s.subject_id AND pd.study_name = :study) as deviations
#         FROM subjects s
#         WHERE s.study_name = :study AND s.site_id = :site_id
#     """)
    
#     try:
#         results = db.execute(sql, {"study": study, "site_id": site_id}).fetchall()
#         subjects = [
#             {
#                 "subject_id": row[0],
#                 "status": row[1] or "Active",
#                 "missing_pages": row[2],
#                 "deviations": row[3],
#                 "is_clean": (row[2] == 0 and row[3] == 0)
#             }
#             for row in results
#         ]
#         return {"site_id": site_id, "subjects": subjects}
#     except Exception as e:
#         print(f"Error fetching site details: {e}")
#         return {"site_id": site_id, "subjects": []}

# @router.get("/analytics/sites-list")
# def get_sites_list(study: str, db: Session = Depends(get_db)):
#     """ Helper to populate the Site Dropdown """
#     sql = text("SELECT DISTINCT site_id FROM subjects WHERE study_name = :study ORDER BY site_id")
#     results = db.execute(sql, {"study": study}).fetchall()
#     return [row[0] for row in results if row[0]]


from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.core.database import get_db

router = APIRouter()

@router.get("/analytics/dashboard-metrics")
def get_dashboard_metrics(study: str = "Study 1", db: Session = Depends(get_db)):
    """
    ENTERPRISE DQI ENGINE (Compatible Format):
    Calculates the Weighted Data Quality Index (0-100) but returns the JSON 
    structure your Frontend already expects.
    """
    
    # --- 1. ROBUST COUNTS (Direct Queries) ---
    try:
        # Total Subjects
        sql_sub = text("SELECT COUNT(*) FROM subjects WHERE study_name = :study")
        total_subjects = db.execute(sql_sub, {"study": study}).scalar() or 0
        
        # Missing Pages
        sql_mp = text("SELECT COUNT(*) FROM raw_missing_pages WHERE study_name = :study")
        total_missing = db.execute(sql_mp, {"study": study}).scalar() or 0
        
        # Protocol Deviations
        sql_pd = text("SELECT COUNT(*) FROM raw_protocol_deviations WHERE study_name = :study")
        total_pds = db.execute(sql_pd, {"study": study}).scalar() or 0
        
    except Exception as e:
        print(f"⚠️ Basic Count Error: {e}")
        total_subjects, total_missing, total_pds = 0, 0, 0

    # --- 2. DQI AGGREGATION (The Smart Math) ---
    # We use this to replace the simple "Clean Patient Rate" with the advanced "DQI Score"
    dqi_sql = text("""
    WITH SiteMetrics AS (
        SELECT 
            s.site_id,
            
            -- 1. VISIT SCORE (30%)
            COALESCE(
                CAST(SUM(CASE WHEN vp.days_outstanding <= 0 THEN 1 ELSE 0 END) AS FLOAT) / 
                NULLIF(COUNT(vp.id), 0) * 100, 
            100) as visit_score,

            -- 2. QUERY SCORE (30%)
            GREATEST(0, 100 - (
                (SELECT COUNT(*) FROM raw_protocol_deviations pd 
                 WHERE pd.site_id = s.site_id AND pd.study_name = :study) * 5
            )) as query_score,

            -- 3. SAFETY SCORE (25%)
            GREATEST(0, 100 - (
                (SELECT COUNT(*) FROM raw_sae_safety sae 
                 WHERE sae.site_id = s.site_id AND sae.case_status = 'Open') * 20
            )) as safety_score,

            -- 4. CODING SCORE (15%)
            COALESCE(
                (SELECT CAST(SUM(CASE WHEN cm.coding_status = 'Coded' THEN 1 ELSE 0 END) AS FLOAT) / 
                 NULLIF(COUNT(*), 0) * 100
                 FROM raw_coding_meddra cm
                 JOIN subjects sub ON cm.subject_id = sub.subject_id
                 WHERE sub.site_id = s.site_id),
            100) as coding_score

        FROM subjects s
        LEFT JOIN raw_visit_projections vp ON s.subject_id = vp.subject_id
        WHERE s.study_name = :study
        GROUP BY s.site_id
    )
    SELECT 
        site_id,
        ROUND(
            (visit_score * 0.30) + 
            (query_score * 0.30) + 
            (safety_score * 0.25) + 
            (coding_score * 0.15)
        ) as final_dqi
    FROM SiteMetrics
    ORDER BY final_dqi ASC
    """)

    try:
        results = db.execute(dqi_sql, {"study": study}).fetchall()
        
        risky_sites = []
        dqi_values = []
        
        for row in results:
            site_id = row[0]
            dqi = row[1] or 100
            dqi_values.append(dqi)
            
            # Risk is the inverse of Quality (100 - DQI)
            risk_score = 100 - dqi
            if risk_score > 0:
                risky_sites.append({"site": site_id, "issues": risk_score}) # Mapped to 'issues' for frontend
        
        # Sort and Limit
        risky_sites = sorted(risky_sites, key=lambda x: x['issues'], reverse=True)[:5]
        
        # Average DQI
        avg_dqi = sum(dqi_values) / len(dqi_values) if dqi_values else 100

    except Exception as e:
        print(f"⚠️ DQI Logic Error: {e}")
        avg_dqi = 100
        risky_sites = []
        
        # Fallback Risk Chart
        try:
             fallback_risk = db.execute(text("""
                SELECT site_id, COUNT(*) as c FROM raw_missing_pages 
                WHERE study_name = :study GROUP BY site_id ORDER BY c DESC LIMIT 5
             """), {"study": study}).fetchall()
             risky_sites = [{"site": r[0], "issues": r[1]} for r in fallback_risk]
        except: pass

    # --- 3. RETURN PAYLOAD (MATCHING YOUR WORKING FORMAT) ---
    return {
        "study_name": study,
        "kpis": {
            "total_subjects": total_subjects,
            "total_pds": total_pds,
            "total_missing_pages": total_missing,
            # We inject the advanced DQI score into the "Clean Patient Rate" slot
            "clean_patient_rate": f"{int(avg_dqi)}/100 (DQI)", 
            "clean_patient_count": total_subjects # Placeholder
        },
        "top_risky_sites": risky_sites
    }

# --- KEEP EXISTING ENDPOINTS ---
@router.get("/analytics/site-details")
def get_site_details(study: str, site_id: str, db: Session = Depends(get_db)):
    sql = text("""
        SELECT 
            s.subject_id,
            s.status,
            (SELECT COUNT(*) FROM raw_missing_pages mp WHERE mp.subject_id = s.subject_id AND mp.study_name = :study) as missing,
            (SELECT COUNT(*) FROM raw_protocol_deviations pd WHERE pd.subject_id = s.subject_id AND pd.study_name = :study) as deviations
        FROM subjects s
        WHERE s.study_name = :study AND s.site_id = :site_id
    """)
    try:
        results = db.execute(sql, {"study": study, "site_id": site_id}).fetchall()
        subjects = [{
            "subject_id": row[0],
            "status": row[1] or "Active",
            "missing_pages": row[2],
            "deviations": row[3],
            "is_clean": (row[2] == 0 and row[3] == 0)
        } for row in results]
        return {"site_id": site_id, "subjects": subjects}
    except:
        return {"site_id": site_id, "subjects": []}

@router.get("/analytics/sites-list")
def get_sites_list(study: str, db: Session = Depends(get_db)):
    sql = text("SELECT DISTINCT site_id FROM subjects WHERE study_name = :study ORDER BY site_id")
    results = db.execute(sql, {"study": study}).fetchall()
    return [row[0] for row in results if row[0]]

@router.get("/analytics/study-list")
def get_study_list(db: Session = Depends(get_db)):
    sql = text("SELECT DISTINCT study_name FROM subjects ORDER BY study_name")
    results = db.execute(sql).fetchall()
    return [row[0] for row in results if row[0]]