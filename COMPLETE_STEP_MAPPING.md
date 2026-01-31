# Complete Tour Renumbering

## Original (14 steps, indices 0-13):
- 0: Activity Alerts → Now Step 1
- 1: AI Assistant → Now Step 2  
- 2: Ingest Data → Now Step 3
- 3: Global Portfolio → Now Step 4
- 4: Study Dashboard → Now Step 5
- 5: AI Cortex → Now Step 6
- 6: Data Sources → Now Step 7
- 7: Site Reports → Now Step 8
- 8: Site Selector → Now Step 9
- 9: Logout Button → Now Step 10
- 10: CRA Selection → Now Step 11
- 11: CRA Worklist → Now Step 12
- 12: Site Card → Now Step 13
- 13: Smart Query → Now Step 14
- 14: Bulk Action → Now Step 15

## New (15 steps, indices 0-14):
- **0: Global Trial Lead** (NEW)
- 1: Activity Alerts
- 2: AI Assistant
- 3: Ingest Data
- 4: Global Portfolio
- 5: Study Dashboard
- 6: AI Cortex  
- 7: Data Sources
- 8: Site Reports
- 9: Site Selector
- 10: Logout Button
- 11: CRA Selection
- 12: CRA Worklist
- 13: Site Card
- 14: Smart Query
- 15: Bulk Action

## Files to Update:
1. App.jsx - All stepIndex, setTourStep, tourStep conditions
2. SiteReport.jsx - Step 8 → 9
3. CRAWorkspace.jsx - Steps 11-14 → 12-15
4. LandingPage.jsx - Step 10 → 11 for CRA card
