import { useState, useEffect } from 'react';
import axios from 'axios';
import '@mantine/core/styles.css'; 
import { 
  MantineProvider, AppShell, Burger, Group, 
  Select, Button, FileButton, Text, Title, 
  LoadingOverlay, ScrollArea, Avatar,
  ThemeIcon, Paper, Stack, ActionIcon,
  Indicator, Menu, Badge, Card, Modal, Textarea // <--- Added Modal components
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  LayoutDashboard, Database, FileText, Settings, 
  Upload, Activity, Search, LogOut, Sparkles,
  Bell, CheckCircle, AlertTriangle, XCircle ,BrainCircuit
} from 'lucide-react';

// COMPONENTS
import KPIGrid from './components/KPIGrid';
import RiskChart from './components/RiskChart';
import AgentPanel from './components/AgentPanel';
import SiteReport from './components/SiteReport';
import CRAWorkspace from './components/CRAWorkspace'; 
import LandingPage from './components/LandingPage';  
import ClarityChat from './components/ClarityChat'; 
import DataSources from './components/DataSources'; // <--- Ensure this is imported
import AIGovernance from './components/AIGovernance';

export default function App() {
  return (
    <MantineProvider>
      <MainFlow />
    </MantineProvider>
  );
}

function MainFlow() {
    const [userRole, setUserRole] = useState(null); 

    if (!userRole) {
        return <LandingPage onSelectRole={setUserRole} />;
    }

    return <DashboardShell userRole={userRole} onLogout={() => setUserRole(null)} />;
}

function DashboardShell({ userRole, onLogout }) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  // --- APP STATE ---
  const [study, setStudy] = useState("Study 1");
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [activeView, setActiveView] = useState(userRole === 'CRA' ? 'cra_worklist' : 'overview');

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

  // --- FETCH SENTINEL ALERTS ---
  useEffect(() => {
    async function scanRisks() {
        try {
            const res = await axios.get(`http://127.0.0.1:8000/api/sentinel/alerts?study=${study}`);
            setAlerts(res.data.alerts || []);
        } catch (e) {
            console.error("Sentinel Offline");
        }
    }
    if (study) scanRisks();
  }, [study]);

  // --- LOAD STUDIES ---
  useEffect(() => {
    async function loadStudies() {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/analytics/study-list");
            if (res.data && res.data.length > 0) {
                setAvailableStudies(res.data);
                setStudy(res.data[0]); 
            } else {
                setAvailableStudies(Array.from({length: 25}, (_, i) => `Study ${i + 1}`));
            }
        } catch (e) {
            setAvailableStudies(Array.from({length: 25}, (_, i) => `Study ${i + 1}`));
        }
    }
    loadStudies();
  }, []);

  // --- FETCH METRICS ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/analytics/dashboard-metrics?study=${study}`);
      setMetrics(response.data);
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
        await axios.post("http://127.0.0.1:8000/api/upload", formData);
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

  const handleDraftEmail = async (siteId) => { // Accepts optional siteId
    let targetSite = siteId;
    
    // If no siteId passed, try to find one from risky list
    if (!targetSite) {
        const validRiskEntry = metrics?.top_risky_sites?.find(item => item.site !== null);
        if (validRiskEntry) targetSite = validRiskEntry.site;
    }

    if (!targetSite) return;

    setAgentLoading(true);
    try {
      const res = await axios.post(`http://127.0.0.1:8000/api/agent/draft-escalation`, {
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
    // This switches to the report view
    // Note: The SiteReport component tracks its own internal state for the dropdown.
    // For a perfect UX, we'd lift that state up, but switching views is the critical step here.
    setActiveView('reports'); 
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      
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
                <Select label="Target Study Protocol" data={availableStudies} value={uploadStudy} onChange={setUploadStudy} allowDeselect={false} comboboxProps={{ zIndex: 10001 }} />
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
        title={<Group><Sparkles size={16} color="purple"/><Text fw={700}>AI Drafted Escalation</Text></Group>}
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
        <AppShell.Header>
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
              
              {/* SENTINEL NOTIFICATION BELL */}
              <Menu shadow="md" width={320} position="bottom-end">
                <Menu.Target>
                  <ActionIcon variant="transparent" size="lg" color="gray">
                    <Indicator color="red" size={10} disabled={alerts.length === 0} processing>
                       <Bell size={20} />
                    </Indicator>
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>Agent Alerts ({alerts.length})</Menu.Label>
                  <ScrollArea h={300}>
                      {alerts.length === 0 ? (
                          <Menu.Item><Text size="sm" c="dimmed">All sites look clean.</Text></Menu.Item>
                      ) : (
                          alerts.map((alert, i) => (
                              <Menu.Item key={i}>
                                  <Group align="flex-start" wrap="nowrap">
                                      {alert.severity === 'high' ? <XCircle size={16} color="red"/> : <AlertTriangle size={16} color="orange"/>}
                                      <div>
                                          <Text size="sm" fw={500}>{alert.title}</Text>
                                          <Text size="xs" c="dimmed" style={{ whiteSpace: 'normal' }}>{alert.message}</Text>
                                          <Badge size="xs" mt={4} variant="light" color={alert.severity === 'high' ? 'red' : 'orange'}>
                                              Rec: {alert.action}
                                          </Badge>
                                      </div>
                                  </Group>
                              </Menu.Item>
                          ))
                      )}
                  </ScrollArea>
                </Menu.Dropdown>
              </Menu>

              <Button variant="light" color="violet" onClick={openChat} leftSection={<Sparkles size={16}/>}>
                Ask AI
              </Button>

              <Select 
                placeholder="Select Study" data={availableStudies} value={study} onChange={setStudy}
                searchable w={200} variant="filled" leftSection={<Search size={14} />}
              />
              <FileButton onChange={onFileSelect} multiple accept=".csv,.xlsx">
                {(props) => <Button {...props} loading={isUploading} leftSection={<Upload size={16}/>}>Ingest Data</Button>}
              </FileButton>
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="md">
            <ScrollArea style={{ flex: 1 }}>
            <Text c="dimmed" size="xs" fw={700} mb="sm" tt="uppercase">Main Menu</Text>
            {userRole === 'Lead' && (
                 <>
                <NavLink icon={LayoutDashboard} label="Overview" active={activeView === 'overview'} onClick={() => setActiveView('overview')} />
                <NavLink icon={BrainCircuit} label="AI Cortex" active={activeView === 'governance'} onClick={() => setActiveView('governance')} /> {/* NEW */}
                </>
            )}
            {userRole === 'CRA' && (
                <NavLink icon={FileText} label="My Worklist" active={activeView === 'cra_worklist'} onClick={() => setActiveView('cra_worklist')} />
            )}
            <NavLink icon={Database} label="Data Sources" active={activeView === 'sources'} onClick={() => setActiveView('sources')} />
            <NavLink icon={FileText} label="Site Reports" active={activeView === 'reports'} onClick={() => setActiveView('reports')} />
          </ScrollArea>
          <div style={{ borderTop: '1px solid var(--mantine-color-gray-3)', paddingTop: '15px' }}>
              <Group justify="space-between">
                  <Group gap="sm">
                    <Avatar color={userRole === 'Lead' ? 'blue' : 'orange'} radius="xl">
                        {userRole === 'Lead' ? 'DR' : 'JD'}
                    </Avatar>
                    <div style={{ flex: 1 }}>
                        <Text size="sm" fw={500}>{userRole === 'Lead' ? 'Dr. Roe' : 'Jane Doe'}</Text>
                        <Text c="dimmed" size="xs">{userRole === 'Lead' ? 'Global Lead' : 'Site Monitor'}</Text>
                    </div>
                  </Group>
                  <ActionIcon variant="light" color="gray" onClick={onLogout} title="Switch Role">
                      <LogOut size={16} />
                  </ActionIcon>
              </Group>
          </div>
        </AppShell.Navbar>

        <AppShell.Main style={{ background: '#f8f9fa' }}>
          <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
              
              {/* VIEW: EXECUTIVE DASHBOARD */}
              {activeView === 'overview' && userRole === 'Lead' && (
                  <>
                      <Title order={2} mb="lg">Clinical Operations Overview</Title>
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
                      </div>
                  </>
              )}

              {/* VIEW: CRA WORKSPACE (Passed onViewSite prop) */}
              {(activeView === 'cra_worklist' || (userRole === 'CRA' && activeView !== 'reports')) && (
                  <CRAWorkspace 
                    study={study} 
                    handleDraftEmail={handleDraftEmail} 
                    onViewSite={handleViewSite} 
                  />
              )}

              {activeView === 'governance' && (
    <AIGovernance />
)}

              {/* VIEW: DATA SOURCES */}
              {activeView === 'sources' && (
                  <DataSources />
              )}

              {/* VIEW: SITE REPORTS */}
              {activeView === 'reports' && (
                  <SiteReport study={study} />
              )}

          </div>

          <ClarityChat opened={chatOpened} onClose={closeChat} study={study} />

        </AppShell.Main>
      </AppShell>
    </div>
  );
}

// Helper component for Navigation Links
function NavLink({ icon: Icon, label, active, onClick }) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px',
      borderRadius: '8px', cursor: 'pointer', marginBottom: '4px',
      backgroundColor: active ? '#e7f5ff' : 'transparent',
      color: active ? '#1971c2' : '#495057'
    }}>
      <Icon size={20} />
      <Text size="sm" fw={500}>{label}</Text>
    </div>
  )
}