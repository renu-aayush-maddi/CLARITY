import { useState, useEffect } from 'react';
import '@mantine/core/styles.css';
import {
  MantineProvider, AppShell, Burger, Group, Button,
  Text, Title, LoadingOverlay, ScrollArea, ThemeIcon, Paper, Stack,
  Modal, Textarea, Autocomplete, Overlay
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  LayoutDashboard, Database, FileText,
  Activity, Sparkles, BrainCircuit
} from 'lucide-react';

// COMPONENTS
import KPIGrid from './components/KPIGrid';
import RiskChart from './components/RiskChart';
import AgentPanel from './components/AgentPanel';
import SiteReport from './components/SiteReport';
import CRAWorkspace from './components/CRAWorkspace';
import LandingPage from './components/LandingPage';
import ClarityChat from './components/ClarityChat';
import DataSources from './components/DataSources';
import AIGovernance from './components/AIGovernance';
import Portfolio from './components/Portfolio';
import TourStep from './components/GuidedTour/TourStep';
import TourHighlight from './components/GuidedTour/TourHighlight';
import TourOverlay from './components/GuidedTour/TourOverlay';
import TourSidebarAnchors from './components/GuidedTour/TourSidebarAnchors';
import HeaderControlGroup from './components/GuidedTour/HeaderControlGroup';
import SidebarUserArea from './components/GuidedTour/SidebarUserArea';

import StudyWorldMap from './components/StudyWorldMap'; // <--- NEW MAP COMPONENT

import api from "./api/client"

export default function App() {
  return (
    <MantineProvider>
      <MainFlow />
    </MantineProvider>
  );
}

function MainFlow() {
  const [userRole, setUserRole] = useState(null);
  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  // Manage user role based on tour step
  useEffect(() => {
    if (!tourActive) return;

    console.log('[MainFlow] Tour step changed:', tourStep, 'Current userRole:', userRole);

    // Step 11: Show landing page for CRA role selection
    if (tourStep === 11 && userRole !== null) {
      console.log('[MainFlow] Step 10: Setting userRole to null for landing page');
      setUserRole(null);
      return;
    }

    // Steps 12-15: Show CRA workspace
    if (tourStep >= 12 && userRole !== 'CRA') {
      console.log('[MainFlow] Steps 11-14: Setting userRole to CRA');
      setUserRole('CRA');
      return;
    }
  }, [tourActive, tourStep, userRole]);

  if (!userRole) {
    return <LandingPage onSelectRole={setUserRole} onStartTour={(active) => setTourActive(active === false ? false : true)} tourActive={tourActive} tourStep={tourStep} setTourStep={setTourStep} />;
  }

  return <DashboardShell userRole={userRole} setUserRole={setUserRole} onLogout={() => { setUserRole(null); setTourActive(false); }} tourActive={tourActive} setTourActive={setTourActive} tourStep={tourStep} setTourStep={setTourStep} />;
}

function DashboardShell({ userRole, setUserRole, onLogout, tourActive, setTourActive, tourStep, setTourStep }) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  // --- APP STATE ---
  const [study, setStudy] = useState("Study 1");
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState(userRole === 'CRA' ? 'cra_worklist' : 'portfolio');

  const [emailDraft, setEmailDraft] = useState(null);
  const [agentLoading, setAgentLoading] = useState(false);
  const [availableStudies, setAvailableStudies] = useState([]);

  const [chatOpened, { open: openChat, close: closeChat }] = useDisclosure(false);

  // --- SENTINEL ALERTS ---
  const [alerts, setAlerts] = useState([]);

  // --- UPLOAD STATE ---
  const [isUploading, setIsUploading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadStudy, setUploadStudy] = useState(study);


  const handleStudySelect = (studyName) => {
    setStudy(studyName);
    setActiveView('overview');
  };

  // --- TOUR HELPERS ---
  const TotalSteps = 15; // Step 0: Global Trial Lead + Steps 1-9 (Lead role) + Step 10 (Logout) + Step 11 (CRA) + Steps 12-15 (CRA workspace)

  // NOTE: getTourStyle is no longer needed as TourStep component handles it

  // --- FETCH SENTINEL ALERTS ---
  useEffect(() => {
    async function scanRisks() {
      try {
        const res = await api.get(`/api/sentinel/alerts?study=${study}`);
        setAlerts(res.data.alerts || []);
      } catch (e) {
        console.error("Sentinel Offline");
      }
    }
    if (study) scanRisks();
  }, [study]);

  // Keep active view in sync with tour step when tour is running
  useEffect(() => {
    if (!tourActive) return;
    if (tourStep === 4) setActiveView('portfolio');
    if (tourStep === 5) setActiveView('overview');
    if (tourStep === 6) setActiveView('governance');
    if (tourStep === 7) setActiveView('sources');
    if (tourStep === 8 || tourStep === 9) setActiveView('reports');
    // Note: userRole management moved to MainFlow level
  }, [tourActive, tourStep]);

  // --- LOAD STUDIES (FIXED) ---
  // --- LOAD STUDIES ---
  useEffect(() => {
    async function loadStudies() {
      try {
        const res = await api.get("/api/analytics/study-list");
        if (res.data && res.data.length > 0) {
          setAvailableStudies(res.data);
          setStudy(res.data[0]);
        } else {
          setAvailableStudies([]); // <--- Change this to empty array so dropdown is clean
          setStudy("Study 1");     // Default string so the dashboard doesn't crash
        }
      } catch (e) {
        console.error(e);
        setAvailableStudies([]);
      }
    }
    loadStudies();
  }, []);
  // --- FETCH METRICS (UPDATED FOR ROUND 2 DATA STRUCTURE) ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/analytics/dashboard-metrics?study=${study}`);
      // MAPPING UPDATE: The backend now returns { study_health, top_risky_sites, all_sites_metrics }
      // We map 'study_health' to 'kpis' so KPIGrid can use it directly
      setMetrics({
        kpis: response.data.study_health,
        top_risky_sites: response.data.top_risky_sites,
        all_sites: response.data.all_sites_metrics // <--- NEW
      });
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => { fetchData(); setEmailDraft(null); }, [study]);

  // --- HANDLERS ---
  const onFileSelect = (files) => {
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setSelectedFiles(fileArray);
      setUploadStudy(study);
      setShowConfirm(true);
    }
  };

  const confirmUpload = async () => {
    setIsUploading(true);
    const formData = new FormData();
    selectedFiles.forEach(file => formData.append("files", file));
    formData.append("study_name", uploadStudy);

    try {
      await api.post("/api/upload", formData);
      setShowConfirm(false);
      setSelectedFiles([]);
      alert("✅ Ingestion Complete!");
      fetchData();
    } catch (err) {
      alert("Upload Failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDraftEmail = async (siteId) => {
    let targetSite = siteId;

    // If no siteId passed, try to find one from risky list
    if (!targetSite) {
      const validRiskEntry = metrics?.top_risky_sites?.find(item => item.site !== null);
      if (validRiskEntry) targetSite = validRiskEntry.site;
    }

    if (!targetSite) return;

    setAgentLoading(true);
    try {
      const res = await api.post("/api/agent/draft-escalation", {
        site_id: targetSite,
        study_name: study
      });
      setEmailDraft(res.data);
    } catch (err) {
      alert("Agent Error: " + err.message);
    } finally {
      setAgentLoading(false);
    }
  };

  const handleViewSite = (siteId) => {
    setActiveView('reports');
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>

      {/* TOUR OVERLAY */}
      <TourOverlay tourActive={tourActive} tourStep={tourStep} />

      {/* CONFIRM UPLOAD OVERLAY */}
      {/* CONFIRM UPLOAD OVERLAY */}
      {showConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
        }}>
          <Paper p="xl" radius="md" shadow="xl" withBorder style={{ width: '500px', backgroundColor: 'white' }}>
            <Stack>
              <Title order={3}>Confirm Data Ingestion</Title>
              <Text size="sm" c="dimmed">Ingesting <strong>{selectedFiles.length} files</strong>.</Text>

              {/* CHANGED FROM SELECT TO AUTOCOMPLETE */}
              <Autocomplete
                label="Target Study Protocol"
                placeholder="Select or type a new study name"
                data={availableStudies}
                value={uploadStudy}
                onChange={setUploadStudy}
                comboboxProps={{ zIndex: 10001 }}
              />

              <Group justify="flex-end" mt="md">
                <Button variant="subtle" onClick={() => setShowConfirm(false)} color="gray">Cancel</Button>
                <Button loading={isUploading} onClick={confirmUpload} color="blue">Confirm</Button>
              </Group>
            </Stack>
          </Paper>
        </div>
      )}

      {/* EMAIL DRAFT MODAL */}
      <Modal
        opened={!!emailDraft}
        onClose={() => setEmailDraft(null)}
        title={<Group><Sparkles size={16} color="purple" /><Text fw={700}>AI Drafted Escalation</Text></Group>}
        size="lg"
      >
        <Stack>
          <Text size="sm" c="dimmed">The AI has drafted this email based on the site's missing pages and risk profile.</Text>
          <Textarea
            autosize
            minRows={8}
            value={emailDraft || ''}
            onChange={(e) => setEmailDraft(e.target.value)}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setEmailDraft(null)}>Discard</Button>
            <Button color="blue" onClick={() => { alert("Email Sent!"); setEmailDraft(null); }}>Send Now</Button>
          </Group>
        </Stack>
      </Modal>



      {/* DASHBOARD SHELL */}
      <AppShell
        header={{ height: 60 }}
        navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !mobileOpened, desktop: !desktopOpened } }}
        padding="md"
        layout="alt"
      >
        <AppShell.Header zIndex={tourActive && tourStep <= 3 ? 1005 : 101}>
          <Group h="100%" px="md" justify="space-between">
            <Group>
              <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
              <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
              <Group gap="xs">
                <ThemeIcon color="blue" variant="light" size="lg"><Activity size={20} /></ThemeIcon>
                <Title order={3} m={0}>CLARITY.AI</Title>
              </Group>
            </Group>
            <Group>

              <HeaderControlGroup
                tourActive={tourActive}
                tourStep={tourStep}
                setTourStep={setTourStep}
                setTourActive={setTourActive}
                TotalSteps={TotalSteps}
                alerts={alerts}
                setEmailDraft={setEmailDraft}
                openChat={openChat}
                availableStudies={availableStudies}
                study={study}
                setStudy={setStudy}
                onFileSelect={onFileSelect}
                isUploading={isUploading}
              />
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="md" zIndex={tourActive && (tourStep > 3 && tourStep <= 8) ? 1006 : 100}>
          {/* Local Overlay/Dimmer for Navbar items - for steps starting from 4 (Global Portfolio) */}
          {tourActive && (tourStep > 3 && tourStep <= 8) && (
            <div style={{
              position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 101, pointerEvents: 'none'
            }} />
          )}
          <ScrollArea style={{ flex: 1, position: 'relative', zIndex: 102 }}>
            <Text c="dimmed" size="xs" fw={700} mb="sm" tt="uppercase" style={{
              position: 'relative',
              zIndex: 103,
              opacity: tourActive && (tourStep >= 4 && tourStep <= 9) ? 0.2 : 1,
              transition: 'opacity 0.3s'
            }}>Main Menu</Text>
            {userRole === 'Lead' && (
              <>

                <div style={{ position: 'relative' }}>
                  <NavLink
                    icon={LayoutDashboard}
                    label="Global Portfolio"
                    active={activeView === 'portfolio' || (tourActive && tourStep === 4)}
                    onClick={() => {
                      setActiveView('portfolio');
                      if (tourActive && tourStep === 4) setTourStep(5);
                    }}
                    dimmed={tourActive && (tourStep > 3 && tourStep <= 5) && !(tourActive && tourStep === 4)}
                  />
                </div>

                <div style={{ position: 'relative' }}>
                  <NavLink
                    icon={Activity}
                    label="Study Dashboard"
                    active={activeView === 'overview' || (tourActive && tourStep === 5)}
                    onClick={() => {
                      setActiveView('overview');
                      if (tourActive && tourStep === 5) setTourStep(6);
                    }}
                    dimmed={tourActive && (tourStep > 3 && tourStep <= 5) && !(tourActive && tourStep === 5)}
                  />

                </div>

                <NavLink
                  icon={BrainCircuit}
                  label="AI Cortex"
                  active={activeView === 'governance' || (tourActive && tourStep === 6)}
                  onClick={() => setActiveView('governance')}
                  dimmed={tourActive && tourStep >= 6 && tourStep <= 9 && !(tourActive && tourStep === 6)}
                />
              </>
            )}
            {userRole === 'CRA' && (
              <NavLink icon={FileText} label="My Worklist" active={activeView === 'cra_worklist'} onClick={() => setActiveView('cra_worklist')} dimmed={tourActive && (tourStep === 4 || tourStep === 5)} />
            )}
            <NavLink
              icon={Database}
              label="Data Sources"
              active={activeView === 'sources' || (tourActive && tourStep === 7)}
              onClick={() => setActiveView('sources')}
              dimmed={tourActive && tourStep >= 6 && tourStep <= 9 && !(tourActive && tourStep === 7)}
            />

            <NavLink
              icon={FileText}
              label="Site Reports"
              active={activeView === 'reports' || (tourActive && (tourStep === 8 || tourStep === 9))}
              onClick={() => setActiveView('reports')}
              dimmed={tourActive && tourStep >= 6 && tourStep <= 9 && !(tourActive && (tourStep === 8 || tourStep === 9))}
            />
          </ScrollArea>
          <div style={{ borderTop: '1px solid var(--mantine-color-gray-3)', paddingTop: '15px', position: 'relative', zIndex: 102 }}>

            {/* Anchors for steps 4, 5, 6, 7, 8 */}
            <TourSidebarAnchors
              tourStep={tourStep}
              setTourStep={setTourStep}
              setActiveView={setActiveView}
              tourActive={tourActive}
              setTourActive={setTourActive}
              TotalSteps={TotalSteps}
            />

            <SidebarUserArea
              userRole={userRole}
              tourActive={tourActive}
              tourStep={tourStep}
              setTourStep={setTourStep}
              setTourActive={setTourActive}
              onLogout={onLogout}
              TotalSteps={TotalSteps}
            />
          </div>
        </AppShell.Navbar>

        <AppShell.Main style={{ background: '#f8f9fa' }}>
          <div style={{ maxWidth: '1600px', margin: '0 auto' }}>

            {/* VIEW: EXECUTIVE DASHBOARD */}
            {activeView === 'overview' && userRole === 'Lead' && (
              <div style={{ padding: '20px' }}>
                <TourHighlight active={tourActive && tourStep === 5} style={{ position: 'relative' }}>
                  <Title order={2} mb="lg" style={{ position: 'relative', zIndex: 1004 }}>Clinical Operations Overview</Title>

                  <div style={{ position: 'relative', minHeight: '200px' }}>
                    <LoadingOverlay visible={loading} overlayProps={{ radius: "sm", blur: 2 }} />
                    <KPIGrid kpis={metrics?.kpis} loading={loading} />

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginTop: '20px' }}>
                      <div style={{ minHeight: '400px' }}>
                        <RiskChart data={metrics?.top_risky_sites} loading={loading} />
                      </div>
                      <div>
                        <AgentPanel metrics={metrics} handleDraftEmail={handleDraftEmail} agentLoading={agentLoading} emailDraft={emailDraft} setEmailDraft={setEmailDraft} loading={loading} />
                      </div>
                    </div>

                    {/* NEW WORLD MAP SECTION */}
                    <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                      <StudyWorldMap sites={metrics?.all_sites} />
                    </div>
                  </div>
                </TourHighlight>
              </div>
            )}

            {/* VIEW: CRA WORKSPACE */}
            {(activeView === 'cra_worklist' || (userRole === 'CRA' && activeView !== 'reports')) && (
              <CRAWorkspace
                study={study}
                handleDraftEmail={handleDraftEmail}
                onViewSite={handleViewSite}
                tourActive={tourActive}
                tourStep={tourStep}
                onFinishTour={(nextStep) => nextStep ? setTourStep(nextStep) : setTourActive(false)}
              />
            )}

            {(activeView === 'governance' || (tourActive && tourStep === 6)) && (
              <div style={{ padding: '20px' }}>
                <TourHighlight active={tourActive && tourStep === 6}>
                  <AIGovernance />
                </TourHighlight>
              </div>
            )}

            {/* VIEW: DATA SOURCES */}
            {(activeView === 'sources' || (tourActive && tourStep === 7)) && (
              <div style={{ padding: '20px' }}>
                <TourHighlight active={tourActive && tourStep === 7}>
                  <DataSources study={study} />
                </TourHighlight>
              </div>
            )}

            {/* VIEW: SITE REPORTS */}
            {(activeView === 'reports' || (tourActive && (tourStep === 8 || tourStep === 9))) && (
              <div style={{ padding: '20px' }}>
                <TourHighlight active={tourActive && tourStep === 8}>
                  <SiteReport study={study} tourActive={tourActive} tourStep={tourStep} onFinishTour={(nextStep) => nextStep ? setTourStep(nextStep) : setTourActive(false)} />
                </TourHighlight>
              </div>
            )}

            {activeView === 'portfolio' && (
              <div style={{ padding: '20px' }}>
                <TourHighlight active={tourActive && tourStep === 4}>
                  <Portfolio onSelectStudy={handleStudySelect} />
                </TourHighlight>
              </div>
            )}

          </div>

          <ClarityChat opened={chatOpened} onClose={closeChat} study={study} />

        </AppShell.Main>
      </AppShell>
    </div >
  );
}

// Helper component for Navigation Links
function NavLink({ icon: Icon, label, active, onClick, dimmed }) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px',
      borderRadius: '8px', cursor: 'pointer', marginBottom: '4px',
      backgroundColor: active ? '#e7f5ff' : 'transparent',
      color: active ? '#1971c2' : '#495057',
      opacity: dimmed ? 0.4 : 1,
      filter: dimmed ? 'grayscale(0.3)' : 'none',
      pointerEvents: dimmed ? 'none' : 'auto',
      transition: 'all 0.3s ease'
    }}>
      <Icon size={20} />
      <Text size="sm" fw={500}>{label}</Text>
    </div>
  )
}