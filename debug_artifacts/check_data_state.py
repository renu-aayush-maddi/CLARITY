import sys
import os
sys.path.append(os.getcwd())
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Force UTF-8 for output
sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

def check_data_state():
    with engine.connect() as conn:
        print("\n=== 1. CURRENT STATUS IN DATABASE ===")
        # Check Subjects Table
        res_sub = conn.execute(text("SELECT status, count(*) FROM subjects GROUP BY status")).fetchall()
        print("Subjects Table Statuses:", res_sub)

        # Check CPID Metrics Table
        try:
            res_cpid = conn.execute(text("SELECT subject_status, count(*) FROM raw_cpid_metrics GROUP BY subject_status")).fetchall()
            print("CPID Metrics Statuses:", res_cpid)
        except Exception as e:
            print("CPID Metrics Statuses: Could not query (column might be missing)")

        print("\n=== 2. INACTIVATED RECORDS CHECK (From Screenshots) ===")
        # Check if we have the 'raw_inactivated_forms' table populated
        try:
            res_inact = conn.execute(text("SELECT count(*) FROM raw_inactivated_forms")).scalar()
            print(f"Total rows in 'raw_inactivated_forms': {res_inact}")
            
            if res_inact > 0:
                print("Sample 'raw_inactivated_forms' entries:")
                sample = conn.execute(text("SELECT subject_id, form_name, audit_action FROM raw_inactivated_forms LIMIT 5")).fetchall()
                for row in sample:
                    print(row)
        except Exception as e:
            print(f"Error checking raw_inactivated_forms: {e}")

if __name__ == "__main__":
    check_data_state()
