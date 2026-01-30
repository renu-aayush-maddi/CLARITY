#analytics.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.core.database import get_db
import datetime

router = APIRouter()


AUDIT_LOGS = []


def log_ai_interaction(agent_name, input_text, output_text, latency_ms, status="Success"):
    """
    Helper function to record AI thoughts. 
    Call this from agent.py and chat.py
    """
    entry = {
        "id": len(AUDIT_LOGS) + 1,
        "timestamp": datetime.datetime.now().strftime("%H:%M:%S"),
        "agent": agent_name,
        "input": input_text,
        "output": output_text,
        "latency": f"{latency_ms}ms",
        "status": status
    }
    AUDIT_LOGS.insert(0, entry) # Newest first
    # Keep only last 50 logs
    if len(AUDIT_LOGS) > 50:
        AUDIT_LOGS.pop()

@router.get("/analytics/ai-governance")
def get_ai_governance_logs():
    """
    Returns the history of AI thoughts for the Governance Dashboard.
    """
    return {
        "logs": AUDIT_LOGS,
        "stats": {
            "total_calls": len(AUDIT_LOGS),
            "success_rate": "98%",
            "avg_latency": "1.2s",
            "tokens_used": len(AUDIT_LOGS) * 150 # Simulated token count
        }
    }
# backend/app/api/analytics.py
# backend/app/api/analytics.py

@router.get("/analytics/dashboard-metrics")
def get_dashboard_metrics(study: str = "Study 1", db: Session = Depends(get_db)):
    """
    ROUND 2 FINAL LOGIC (CPID-DRIVEN):
    Uses the pre-aggregated 'raw_cpid_metrics' table for robust scoring.
    """
    
    # --- 1. STRICT CLEAN PATIENT RATE (Using CPID Summary) ---
    # We check the summary columns: missing_pages, missing_visits, open_queries, protocol_deviations
    clean_patient_sql = text("""
        SELECT 
            COUNT(*) as total_subjects,
            SUM(
                CASE 
                    WHEN missing_pages = 0 
                     AND missing_visits = 0 
                     AND open_queries = 0 
                     AND protocol_deviations = 0 
                    THEN 1 ELSE 0 
                END
            ) as clean_count
        FROM raw_cpid_metrics
        WHERE study_name = :study
    """)
    
    try:
        cp_row = db.execute(clean_patient_sql, {"study": study}).fetchone()
        total_subjects = cp_row[0] or 0
        clean_count = cp_row[1] or 0
        clean_rate = round((clean_count / total_subjects * 100), 1) if total_subjects > 0 else 0
    except Exception as e:
        print(f"Clean Patient Error: {e}")
        # Fallback: Try counting subjects table if CPID is empty
        total_subjects = db.execute(text("SELECT COUNT(*) FROM subjects WHERE study_name = :study"), {"study": study}).scalar() or 0
        clean_count, clean_rate = 0, 0

    # --- 2. DQI & RISK BREAKDOWN (Using CPID + Safety) ---
    dqi_sql = text("""
    WITH SiteMetrics AS (
        SELECT 
            site_id,
            
            -- A. VISIT SCORE (30%): Derived from 'missing_visits' column in CPID
            GREATEST(0, 100 - (SUM(missing_visits) * 10)) as visit_score,

            -- B. COMPLIANCE SCORE (30%): Derived from 'protocol_deviations'
            GREATEST(0, 100 - (SUM(protocol_deviations) * 5)) as query_score,

            -- C. SAFETY SCORE (25%): Derived from 'open_queries' (Proxy) or Safety Join
            -- Ideally we join SAE table, but for robustness we use open queries as a risk signal
            GREATEST(0, 100 - (SUM(open_queries) * 2)) as safety_score,

            -- D. CODING SCORE (15%): Derived from 'clean_crf_percent'
            COALESCE(AVG(clean_crf_percent), 100) as coding_score

        FROM raw_cpid_metrics
        WHERE study_name = :study
        GROUP BY site_id
    )
    SELECT 
        site_id,
        visit_score,
        query_score,
        safety_score,
        coding_score,
        -- Weighted Calculation
        ROUND(
            (visit_score * 0.30) + 
            (query_score * 0.30) + 
            (safety_score * 0.25) + 
            (coding_score * 0.15)
        ) as final_dqi
    FROM SiteMetrics
    ORDER BY final_dqi ASC
    """)

    risky_sites = []
    study_dqi_accumulator = []

    try:
        results = db.execute(dqi_sql, {"study": study}).fetchall()
        for row in results:
            site_id = row[0]
            final_dqi = row[5]
            study_dqi_accumulator.append(final_dqi)

            # Logic to find primary driver
            scores = {"Visits": row[1], "Compliance": row[2], "Safety": row[3], "Coding": row[4]}
            lowest_component = min(scores, key=scores.get)
            
            risky_sites.append({
                "site": site_id, 
                "dqi_score": final_dqi, 
                "primary_issue": lowest_component,
                "components": scores
            })
        
        # Sort by worst DQI first (Limit 5)
        risky_sites = sorted(risky_sites, key=lambda x: x['dqi_score'])[:5]
        
        avg_study_dqi = round(sum(study_dqi_accumulator) / len(study_dqi_accumulator)) if study_dqi_accumulator else 100

        # --- 3. SAFETY OVERRIDE (CRITICAL) ---
        # If we have real SAE data, we fetch it separately to flag "Critical Safety" alerts
        sae_count = db.execute(text("""
            SELECT COUNT(*) FROM raw_sae_safety s
            JOIN subjects sub ON s.subject_id = sub.subject_id
            WHERE sub.study_name = :study AND s.case_status = 'Open'
        """), {"study": study}).scalar() or 0

        # Calculate total missing pages from CPID for the dashboard card
        total_missing_pages = db.execute(text("SELECT SUM(missing_pages) FROM raw_cpid_metrics WHERE study_name = :study"), {"study": study}).scalar() or 0

    except Exception as e:
        print(f"DQI Error: {e}")
        avg_study_dqi, sae_count, total_missing_pages = 0, 0, 0

    return {
        "study_name": study,
        "study_health": {
            "clean_patient_rate": clean_rate,
            "avg_dqi_score": avg_study_dqi,
            "readiness_status": "Ready for Interim" if clean_rate > 80 else "Action Required",
            "total_patients": total_subjects,
            "clean_patients": clean_count,
            "critical_alerts": sae_count,          # <--- Populates "Critical Safety" Card
            "total_missing_pages": total_missing_pages # <--- Populates "Missing Data" Card
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


# backend/app/api/analytics.py (Add to bottom)

@router.get("/analytics/subject-details")
def get_subject_details(study: str, subject_id: str, db: Session = Depends(get_db)):
    """
    PATIENT 360 API:
    Aggregates all clinical data for a single subject into one view.
    """
    # 1. Subject Demographics (Mocked from Subject ID structure usually)
    # In a real DB, this comes from a 'Demographics' form.
    sub_sql = text("SELECT site_id, status FROM subjects WHERE subject_id = :sid AND study_name = :study")
    sub_row = db.execute(sub_sql, {"sid": subject_id, "study": study}).fetchone()
    
    if not sub_row:
        return {"error": "Subject not found"}

    # 2. Missing Pages List
    mp_sql = text("SELECT form_name, visit_date, days_missing FROM raw_missing_pages WHERE subject_id = :sid AND study_name = :study")
    missing_pages = db.execute(mp_sql, {"sid": subject_id, "study": study}).fetchall()
    
    # 3. Protocol Deviations
    pd_sql = text("SELECT category, pd_status, visit_date FROM raw_protocol_deviations WHERE subject_id = :sid AND study_name = :study")
    deviations = db.execute(pd_sql, {"sid": subject_id, "study": study}).fetchall()

    # 4. Visit Projections (Timeline)
    vp_sql = text("SELECT visit_name, projected_date, days_outstanding FROM raw_visit_projections WHERE subject_id = :sid AND study_name = :study ORDER BY projected_date")
    timeline = db.execute(vp_sql, {"sid": subject_id, "study": study}).fetchall()

    # 5. Safety / SAEs
    sae_sql = text("SELECT case_status, review_status FROM raw_sae_safety WHERE subject_id = :sid")
    saes = db.execute(sae_sql, {"sid": subject_id}).fetchall()

    return {
        "subject_id": subject_id,
        "site_id": sub_row[0],
        "status": sub_row[1],
        "metrics": {
            "missing_count": len(missing_pages),
            "deviation_count": len(deviations),
            "sae_count": len(saes)
        },
        "data": {
            "missing_pages": [{"form": r[0], "date": r[1], "lag": r[2]} for r in missing_pages],
            "deviations": [{"category": r[0], "status": r[1], "date": r[2]} for r in deviations],
            "timeline": [{"visit": r[0], "date": r[1], "overdue_by": r[2]} for r in timeline],
            "saes": [{"status": r[0], "review": r[1]} for r in saes]
        }
    }
    
    
    
# ... existing imports ...
@router.get("/analytics/data-lineage")
def get_data_lineage(study: str = None, db: Session = Depends(get_db)):
    """
    Returns row counts filtered by the specific study.
    """
    tables = [
        "subjects",
        "raw_missing_pages",
        "raw_lab_issues", 
        "raw_inactivated_forms",
        "raw_visit_projections", 
        "raw_protocol_deviations",
        "raw_cpid_metrics",
        "raw_sae_safety"
    ]
    
    stats = []
    
    for table_name in tables:
        try:
            # LOGIC: 
            # 1. Some tables have 'study_name' directly (subjects, missing_pages, visit_projections).
            # 2. Others (labs, inactivated) need to JOIN subjects to filter by study.
            
            if not study:
                # Fallback: Count everything if no study selected
                count_sql = text(f"SELECT COUNT(*) FROM {table_name}")
                params = {}
            elif table_name in ["subjects", "raw_missing_pages", "raw_visit_projections"]:
                # Direct Filter
                count_sql = text(f"SELECT COUNT(*) FROM {table_name} WHERE study_name = :study")
                params = {"study": study}
            else:
                # JOIN Filter (Link via subject_id)
                count_sql = text(f"""
                    SELECT COUNT(t.id) 
                    FROM {table_name} t 
                    JOIN subjects s ON t.subject_id = s.subject_id 
                    WHERE s.study_name = :study
                """)
                params = {"study": study}

            row_count = db.execute(count_sql, params).scalar() or 0
            
            source_type = "System Core" if table_name == "subjects" else "Ingested (CSV/Excel)"
            
            stats.append({
                "name": table_name,
                "rows": row_count,
                "status": "Active",
                "type": source_type,
                "last_updated": "Live"
            })
        except Exception as e:
            print(f"Error checking {table_name}: {e}")
            stats.append({
                "name": table_name,
                "rows": 0,
                "status": "Error",
                "type": "Unknown",
                "last_updated": "-"
            })
            
    return stats


# backend/app/api/analytics.py

@router.get("/analytics/portfolio-summary")
def get_portfolio_summary(db: Session = Depends(get_db)):
    """
    LEVEL 1: GLOBAL PORTFOLIO VIEW
    Returns high-level health metrics for ALL studies to support the "Executive View".
    """
    # 1. Get list of all studies present in the metrics table
    studies = db.execute(text("SELECT DISTINCT study_name FROM raw_cpid_metrics")).fetchall()
    study_list = [r[0] for r in studies if r[0]]
    
    portfolio = []
    
    for study in study_list:
        try:
            # Quick Health Check for this specific study
            # A. Clean Patient Rate
            clean_sql = text("""
                SELECT COUNT(*) as total,
                SUM(CASE WHEN missing_pages=0 AND missing_visits=0 AND open_queries=0 AND protocol_deviations=0 THEN 1 ELSE 0 END) as clean
                FROM raw_cpid_metrics WHERE study_name = :study
            """)
            row = db.execute(clean_sql, {"study": study}).fetchone()
            total = row[0] or 0
            clean = row[1] or 0
            clean_rate = round((clean/total * 100), 1) if total > 0 else 0
            
            # B. Determine Status
            status = "Healthy"
            if clean_rate < 85: status = "At Risk"
            if clean_rate < 70: status = "Critical"
            
            portfolio.append({
                "study_name": study,
                "total_patients": total,
                "clean_patient_rate": clean_rate,
                "status": status
            })
        except Exception as e:
            print(f"Portfolio Error {study}: {e}")
            continue
            
    # Sort: Critical studies first (Prioritization)
    return sorted(portfolio, key=lambda x: x['clean_patient_rate'])
