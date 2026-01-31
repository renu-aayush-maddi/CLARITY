# Extended Guided Tour Implementation Plan

## Tour Flow (14 Steps Total)

### **Lead Role Perspective (Steps 1-9)**
1. **Step 0:** Activity Alerts (Bell icon) 
2. **Step 1:** AI Assistant (Ask AI button)
3. **Step 2:** Bring Your Own Data (Ingest Data button)
4. **Step 3:** Global Portfolio (menu item)
5. **Step 4:** Study Dashboard (menu item)  
6. **Step 5:** AI Cortex (menu item)
7. **Step 6:** Data Sources (menu item)
8. **Step 7:** Site Reports page intro
9. **Step 8:** Site Selector dropdown
10. **Step 9:** Logout button (to switch roles)

### **Role Switch (Step 10)**
11. **Step 10:** CRA Role card on Landing Page

### **CRA Role Perspective (Steps 11-14)**
12. **Step 11:** My Worklist title/header
13. **Step 12:** Site card with actions
14. **Step 13:** Smart Query Manager tab
15. **Step 14:** AI-powered bulk actions - Final step

## Implementation Status

✅ **Completed:**
- Steps 0-9: Lead role tour
- Step 10: CRA role selection on landing page
- Tour state lifted to MainFlow for continuity across role switching

🔨 **Remaining:**
- Steps 11-14: CRA workspace tour steps
- Update CRAWorkspace component to receive tour props
- Add TourStep wrappers to CRA features

## Next Steps

1. Update CRAWorkspace to accept `tourActive`, `tourStep`, and `onFinishTour` props
2. Add TourStep for "My Worklist" header (Step 11)
3. Add TourStep for first site card (Step 12)
4. Add TourStep for Smart Query Manager tab (Step 13)
5. Add TourStep for Bulk Action button (Step 14 - final)
6. Update SiteReport totalSteps from 9 to 14
