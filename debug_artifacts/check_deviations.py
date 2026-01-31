import sys
import os
import io

sys.path.append(os.getcwd())
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', line_buffering=True)

from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("NO DATABASE URL")
    sys.exit(1)

engine = create_engine(DATABASE_URL)

def check_deviations():
    with engine.connect() as conn:
        print("\n=== RAW PROTOCOL DEVIATIONS: CATEGORY BREAKDOWN ===")
        sql = """
            SELECT category, COUNT(*) 
            FROM raw_protocol_deviations 
            GROUP BY category 
            ORDER BY count(*) DESC
        """
        res = conn.execute(text(sql)).fetchall()
        for r in res:
            cat_display = f"'{r[0]}'" if r[0] is not None else "NULL"
            print(f"Category: {cat_display} | Count: {r[1]}")

        # Check a few raw rows to see what columns look like
        print("\n=== SAMPLE ROWS ===")
        sample = conn.execute(text("SELECT * FROM raw_protocol_deviations LIMIT 5")).fetchall()
        for r in sample:
            print(r)

if __name__ == "__main__":
    check_deviations()
