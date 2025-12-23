import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from sqlalchemy import text, inspect
from backend.app.utils.dataset_registry import DATASET_SPECS
from backend.app.utils.column_mappings import COLUMN_MAPPINGS

def ensure_subjects_exist(db: Session, df: pd.DataFrame):
    """
    Extracts unique subjects from the dataframe and inserts them into the 
    master 'subjects' table to satisfy Foreign Key constraints.
    """
    if 'subject_id' not in df.columns:
        return

    # Create a clean list of subjects to load
    subjects_to_load = df[['subject_id']].copy()
    
    # Add optional context columns if they exist in this file
    subjects_to_load['study_name'] = df['study_name'] if 'study_name' in df.columns else None
    subjects_to_load['site_id'] = df['site_id'] if 'site_id' in df.columns else None
    
    # Deduplicate
    subjects_to_load = subjects_to_load.drop_duplicates(subset=['subject_id'])

    # SQL to Insert (Upsert)
    # We use ON CONFLICT DO NOTHING to simply skip if the subject exists
    insert_sql = text("""
        INSERT INTO subjects (subject_id, site_id, study_name)
        VALUES (:subject_id, :site_id, :study_name)
        ON CONFLICT (subject_id) DO NOTHING;
    """)

    for _, row in subjects_to_load.iterrows():
        try:
            db.execute(insert_sql, {
                "subject_id": row['subject_id'], 
                "site_id": row['site_id'], 
                "study_name": row['study_name']
            })
        except Exception as e:
            # If this fails, we log it, but we try to keep going. 
            # If this fails, the next step (Foreign Key check) will likely fail too.
            print(f"⚠️ Could not auto-create subject {row['subject_id']}: {e}")
    
    # CRITICAL: Commit immediately so the main insert sees these subjects
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"⚠️ DB Commit failed during subject creation: {e}")

def identify_dataset(df, sheet_name):
    # Quick Check: Scan first 20 rows converted to string
    sample_text = df.head(20).to_string().lower()
    
    for spec_name, rules in DATASET_SPECS.items():
        # 1. Sheet Name Match (if strict)
        if rules["sheet_match"] and rules["sheet_match"].lower() not in str(sheet_name).lower():
            if sheet_name != "Sheet1": # Allow CSVs (defaults to Sheet1) to pass
                continue

        # 2. Column Signature Check
        # All required columns must be present in the sample text
        missing_col = False
        for req_col in rules["required_columns"]:
            if req_col.lower() not in sample_text:
                missing_col = True
                break
        
        if not missing_col:
            return spec_name # Found match
            
    return None

def smart_parse_safe(df, table_type):
    mapping = COLUMN_MAPPINGS.get(table_type)
    if not mapping:
        return None

    col_indices = {}
    header_row_index = -1

    # Search for header row (scan top 20 rows)
    for r in range(min(20, len(df))):
        row_values = [str(x).strip().lower() for x in df.iloc[r].values]
        matches = 0
        temp_indices = {}
        
        for db_col, possible_headers in mapping.items():
            for header in possible_headers:
                if header.lower() in row_values:
                    col_idx = row_values.index(header.lower())
                    temp_indices[db_col] = col_idx
                    matches += 1
                    break
        
        # If we found > 50% of expected columns, assume this is the header
        if matches >= len(mapping) * 0.5: 
            col_indices = temp_indices
            header_row_index = r
            break
    
    # Backup Search (2-row Header support)
    if header_row_index == -1:
         for r in range(min(19, len(df))):
            row1 = [str(x).strip().lower() for x in df.iloc[r].values]
            row2 = [str(x).strip().lower() for x in df.iloc[r+1].values]
            combined_values = set(row1) | set(row2) 
            matches = 0
            for db_col, possible_headers in mapping.items():
                for header in possible_headers:
                    if header.lower() in combined_values:
                        matches += 1
                        break
            if matches >= len(mapping) * 0.6:
                header_row_index = r + 1
                # Re-map columns using row2 primarily
                for db_col, possible_headers in mapping.items():
                    for header in possible_headers:
                        h_lower = header.lower()
                        if h_lower in row2:
                            col_indices[db_col] = row2.index(h_lower)
                            break
                        elif h_lower in row1:
                            try:
                                col_indices[db_col] = row1.index(h_lower)
                            except: pass
                break

    if header_row_index == -1 or not col_indices:
        return None

    # Extract Data
    data_start = header_row_index + 1
    found_data = {}
    for db_col, col_idx in col_indices.items():
        found_data[db_col] = df.iloc[data_start:, col_idx].values

    return pd.DataFrame(found_data)

def ingest_file(file, db: Session):
    filename = file.filename
    results = []
    
    try:
        # Load File (CSV or Excel)
        dfs = {}
        if filename.endswith('.csv'):
            dfs["Sheet1"] = pd.read_csv(file.file, header=None, low_memory=False)
        else:
            xl = pd.ExcelFile(file.file.read())
            for sheet in xl.sheet_names:
                dfs[sheet] = xl.parse(sheet, header=None)

        for sheet_name, df_raw in dfs.items():
            # 1. Identify Dataset
            dataset_key = identify_dataset(df_raw, sheet_name)
            
            if not dataset_key:
                continue 

            # 2. Parse Columns
            clean_df = smart_parse_safe(df_raw, dataset_key)
            
            if clean_df is None or clean_df.empty:
                results.append(f"⚠️ Warning: Identified '{dataset_key}' in {sheet_name} but failed to parse data.")
                continue

            # 3. Clean Data & Normalize IDs
            clean_df = clean_df.replace({np.nan: None})
            
            # --- CRITICAL FIX: Trim whitespace from Subject IDs ---
            if 'subject_id' in clean_df.columns:
                clean_df = clean_df.dropna(subset=['subject_id'])
                clean_df['subject_id'] = clean_df['subject_id'].astype(str).str.replace(r'\.0$', '', regex=True).str.strip()

            # 4. Auto-Create Subjects (Fixes FK Violation)
            ensure_subjects_exist(db, clean_df)

            # 5. Insert Data
            target_table = DATASET_SPECS[dataset_key]["table"]
            try:
                clean_df.to_sql(target_table, db.bind, if_exists='append', index=False, method='multi')
                results.append(f"✅ Success: Ingested {len(clean_df)} rows into {target_table} (Source: {sheet_name})")
            except Exception as e:
                # Debugging info for Schema errors
                err_msg = str(e)
                if 'UndefinedColumn' in err_msg:
                    # Fetch DB columns to show user what is actually there
                    inspector = inspect(db.bind)
                    db_cols = [c['name'] for c in inspector.get_columns(target_table)]
                    df_cols = list(clean_df.columns)
                    results.append(f"❌ DB Schema Error ({target_table}): Missing column. \nDB has: {db_cols}\nData has: {df_cols}")
                elif 'ForeignKeyViolation' in err_msg:
                    results.append(f"❌ Foreign Key Error ({target_table}): Subjects mismatch. We tried to auto-create them, but the IDs in the file might contain hidden characters.")
                else:
                    results.append(f"❌ DB Error for {target_table}: {err_msg}")

        if not results:
            return {"status": "skipped", "reason": "No valid datasets found in file.", "file": filename}

        return {"status": "processed", "details": results, "file": filename}

    except Exception as e:
        return {"status": "error", "reason": str(e), "file": filename}