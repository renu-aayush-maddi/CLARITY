import os
from sqlalchemy import create_engine, MetaData
from sqlalchemy.schema import CreateTable
from dotenv import load_dotenv

# 1. Load environment variables
load_dotenv()

# 2. Get Database URL
# We use the one from your .env file
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("❌ Error: DATABASE_URL not found in .env file.")
    exit(1)

def export_schema():
    print("🔌 Connecting to Neon Database...")
    try:
        engine = create_engine(DATABASE_URL)
        metadata = MetaData()
        
        # 3. Download Table Structure (Reflection)
        metadata.reflect(bind=engine)
        
        print(f"✅ Found {len(metadata.sorted_tables)} tables.")
        print("📝 Writing schema.sql...")

        # 4. Write to file
        with open("schema.sql", "w") as f:
            f.write("-- AUTO-GENERATED SCHEMA FROM NEON DB --\n\n")
            
            for table in metadata.sorted_tables:
                # Generate the CREATE TABLE statement
                create_stmt = CreateTable(table).compile(engine)
                
                # Write to file
                f.write(str(create_stmt).strip())
                f.write(";\n\n")
                
        print("🎉 Success! Saved to 'schema.sql'")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    export_schema()