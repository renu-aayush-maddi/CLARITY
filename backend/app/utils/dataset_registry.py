

# backend/app/utils/dataset_registry.py

DATASET_SPECS = {
    # ==========================================
    # 1. CPID MASTER FILE
    # ==========================================
    "raw_cpid_metrics": {
        "sheet_match": "Subject Level Metrics",
        # "Subject ID" is standard, "Missing Visits" confirms it's the metrics tab
        "required_columns": ["Subject ID", "Missing Visits"], 
        "table": "raw_cpid_metrics"
    },
    "raw_protocol_deviations": {
        "sheet_match": "Protocol Deviation",
        # Matches "PD Status" or "Deviation Status"
        "required_columns": ["PD Status"], 
        "table": "raw_protocol_deviations"
    },
    "raw_sdv_metrics": { 
        "sheet_match": "SDV",
        # Matches "Verification Status" or just "Status" if broadly defined
        "required_columns": ["Verification Status"],
        "table": "raw_sdv_metrics"
    },

    # ==========================================
    # 2. VISIT PROJECTION TRACKER
    # ==========================================
    "raw_visit_projections": {
        "sheet_match": "Missing Visits",
        "required_columns": ["Projected Date", "Days Outstanding"],
        "table": "raw_visit_projections"
    },

    # ==========================================
    # 3. LAB ISSUES REPORT
    # ==========================================
    "raw_lab_issues": {
        "sheet_match": "Missing_Lab_Name", 
        # "Lab category" is very specific to this report
        "required_columns": ["Lab category", "Issue"],
        "table": "raw_lab_issues"
    },

    # ==========================================
    # 4. SAE DASHBOARD
    # ==========================================
    "raw_sae_safety": {
        "sheet_match": "SAE Dashboard_Safety",
        "required_columns": ["Case Status", "Review Status"],
        "table": "raw_sae_safety"
    },
    "raw_sae_dm": {
        "sheet_match": "SAE Dashboard_DM",
        "required_columns": ["Discrepancy ID", "Action Status"],
        "table": "raw_sae_dm"
    },

    # ==========================================
    # 5. CODING REPORTS
    # ==========================================
    "raw_coding_meddra": {
        "sheet_match": "MedDRA", 
        "required_columns": ["MedDRA Coding Report"],
        "table": "raw_coding_meddra"
    },
    "raw_coding_whodra": {
        "sheet_match": "WHOD", 
        # REMOVED "Trade Name" because Study 1 doesn't have it.
        # "WHODrug Coding Report" is unique enough to identify this file.
        "required_columns": ["WHODrug Coding Report"],
        "table": "raw_coding_whodra"
    },

    # ==========================================
    # 6. MISSING PAGES REPORT
    # ==========================================
    # "raw_missing_pages": {
    #     "sheet_match": "Missing", # Matches "Missing Pages", "Visit Level Missing", etc.
    #     # CHANGED to "Days Missing" to match both "# Days Page Missing" and "# Days Missing"
    #     "required_columns": ["Days Missing"], 
    #     "table": "raw_missing_pages"
    # },
    "raw_missing_pages": {
        "sheet_match": "Missing", # Matches "Missing Pages", "Visit Level Missing", etc.
        "required_columns": ["Form"], # "FormName", "Form Name", "Form" all contain "Form"
        "table": "raw_missing_pages"
    },

    # ==========================================
    # 7. INACTIVATED FORMS
    # ==========================================
    "raw_inactivated_forms": {
        "sheet_match": "Sheet1", 
        # "Audit Action" is the unique signature here
        "required_columns": ["Audit Action", "RecordPosition"],
        "table": "raw_inactivated_forms"
    },

    # ==========================================
    # 8. EDRR
    # ==========================================
    "raw_edrr_issues": {
        "sheet_match": "OpenIssues", 
        "required_columns": ["Total Open issue Count"],
        "table": "raw_edrr_issues"
    }
}