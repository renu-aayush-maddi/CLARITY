import sys
import os
sys.path.append(os.getcwd())
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Force UTF-8 for output
sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL missing")
    sys.exit(1)

engine = create_engine(DATABASE_URL)

def analyze_duplicates():
    with engine.connect() as conn:
        print("--- CHECKING DUPLICATES IN raw_cpid_metrics ---")
        sql = """
            SELECT subject_id, count(*) 
            FROM raw_cpid_metrics 
            GROUP BY subject_id 
            HAVING count(*) > 1 
            ORDER BY count(*) DESC 
            LIMIT 5
        """
        res = conn.execute(text(sql)).fetchall()
        if not res:
            print("No duplicates in raw_cpid_metrics.")
        else:
            for r in res:
                print(f"Subject {r[0]} has {r[1]} rows in cpid_metrics")

        print("\n--- CHECKING STATUS VALUES ---")
        # Check raw_cpid_metrics status
        st_sql = "SELECT DISTINCT subject_status FROM raw_cpid_metrics"
        res_st = conn.execute(text(st_sql)).fetchall()
        print(f"Unique Statuses in CPID: {[r[0] for r in res_st]}")
        
        # Check subjects status
        sub_st_sql = "SELECT DISTINCT status FROM subjects"
        res_sub_st = conn.execute(text(sub_st_sql)).fetchall()
        print(f"Unique Statuses in SUBJECTS: {[r[0] for r in res_sub_st]}")

if __name__ == "__main__":
    analyze_duplicates()
