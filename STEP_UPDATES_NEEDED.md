# Step Index Updates Needed

Based on adding step 0 (Global Trial Lead), all dashboard steps need +1:

## DONE ✅:
- Step 1: Activity Alerts (was 0) 
- Step 2: AI Assistant (was 1, currently showing as 3 by mistake, now fixed to 2)

## TODO - Need to fix in App.jsx:
- Line ~427: Ingest Data should be stepIndex={3} (currently 2)
- Need to find: Global Portfolio nav item → should be step 4
- Need to find: Study Dashboard → should be step 5  
- Need to find: AI Cortex → should be step 6
- Need to find: Data Sources → should be step 7
- Need to find: Site Reports → should be step 8
- Need to find: Site Selector (in SiteReport.jsx) → should be step 9
- Need to find: Logout button → should be step 10
- Landing Page CRA card → should be step 11
- CRA Workspace steps 11-14 → should become 12-15

## Also update useEffect conditions:
- tourStep === 6 → governance (currently 5, needs to be 6)
- tourStep === 7 → sources (currently 6, needs to be 7)
- tourStep === 8 || tourStep === 9 → reports (currently 7||8, needs to be 8||9)
- tourStep === 11 → CRA landing (currently 10, needs to stay 11)
- tourStep >= 12 → CRA workspace (currently 11, needs to be 12)
