import sys
import os
sys.path.append(os.getcwd())

from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Redirect stdout to a file
sys.stdout = open("status_report.txt", "w", encoding="utf-8")
sys.stderr = sys.stdout

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("Error: DATABASE_URL not found")
    sys.exit(1)

def check_data():
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            print("--- SUBJECTS TABLE STATUS ---")
            res = conn.execute(text("SELECT status, count(*) FROM subjects GROUP BY status")).fetchall()
            for r in res:
                print(r)

            print("\n--- CPID METRICS SUBJECT_STATUS ---")
            try:
                res = conn.execute(text("SELECT subject_status, count(*) FROM raw_cpid_metrics GROUP BY subject_status")).fetchall()
                for r in res:
                    print(r)
            except Exception as e:
                print(f"Error checking cpid: {e}")

            print("\n--- SAMPLE JOIN CHECK (First 50) ---")
            sql = text("""
                SELECT s.subject_id, s.status as sub_status, c.subject_status as cpid_status
                FROM subjects s
                LEFT JOIN raw_cpid_metrics c ON s.subject_id = c.subject_id
                LIMIT 50
            """)
            res = conn.execute(sql).fetchall()
            for r in res:
                print(r)
                
    except Exception as e:
        print(f"Critical Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    check_data()
