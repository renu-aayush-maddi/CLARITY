// App.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import '@mantine/core/styles.css'; 
import { 
  MantineProvider, AppShell, Burger, Group, 
  Select, Button, FileButton, Text, Title, 
  LoadingOverlay, ScrollArea, Avatar,
  ThemeIcon, Paper, Stack 
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  LayoutDashboard, Database, FileText, Settings, 
  Upload, Activity, Search, FileText as FileIcon
} from 'lucide-react';

// Import Custom Components
import KPIGrid from './components/KPIGrid';
import RiskChart from './components/RiskChart';
import AgentPanel from './components/AgentPanel';

export default function App() {
  return (
    <MantineProvider>
      <DashboardShell />
    </MantineProvider>
  );
}

function DashboardShell() {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  // --- APP STATE ---
  const [study, setStudy] = useState("Study 1");
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true); 
  
  // --- AGENT STATE ---
  const [emailDraft, setEmailDraft] = useState(null);
  const [agentLoading, setAgentLoading] = useState(false);

  // --- UPLOAD STATE ---
  const [isUploading, setIsUploading] = useState(false);
  
  // Custom Overlay State (Replaces Modal)
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadStudy, setUploadStudy] = useState(study);

  // --- 1. DATA FETCHING ---
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

  // --- 2. UPLOAD HANDLERS ---
  const onFileSelect = (files) => {
    if (files && files.length > 0) {
        const fileArray = Array.from(files);
        setSelectedFiles(fileArray);
        setUploadStudy(study); // Sync with current view
        setShowConfirm(true);  // Trigger the Custom Overlay
    }
  };

  const confirmUpload = async () => {
    setIsUploading(true);
    const formData = new FormData();
    selectedFiles.forEach(file => formData.append("files", file));
    formData.append("study_name", uploadStudy); 

    try {
        await axios.post("http://127.0.0.1:8000/api/upload", formData);
        
        // Success Actions
        setShowConfirm(false); 
        setSelectedFiles([]);
        alert("✅ Ingestion Complete!");
        fetchData(); 
    } catch (err) {
        alert("Upload Failed. Check Console.");
        console.error(err);
    } finally {
        setIsUploading(false);
    }
  };

  // --- 3. AGENT HANDLER ---
  const handleDraftEmail = async () => {
    const validRiskEntry = metrics?.top_risky_sites?.find(item => item.site !== null);
    if (!validRiskEntry) return;

    setAgentLoading(true);
    try {
      const res = await axios.post(`http://127.0.0.1:8000/api/agent/draft-escalation`, {
        site_id: validRiskEntry.site,
        study_name: study
      });
      setEmailDraft(res.data);
    } catch (err) {
      alert("Agent Error: " + err.message);
    } finally {
      setAgentLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      
      {/* --- CUSTOM CONFIRMATION OVERLAY (Replaces Modal) --- */}
      {showConfirm && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)', // Dark background
          zIndex: 9999, 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <Paper p="xl" radius="md" shadow="xl" withBorder style={{ width: '500px', backgroundColor: 'white' }}>
            <Stack>
              <Title order={3}>Confirm Data Ingestion</Title>
              <Text size="sm" c="dimmed">
                You are about to ingest <strong>{selectedFiles.length} files</strong> into the clinical data lake.
              </Text>
              
              <Select 
    label="Target Study Protocol"
    data={Array.from({length: 25}, (_, i) => `Study ${i + 1}`)} 
    value={uploadStudy}
    onChange={setUploadStudy}
    allowDeselect={false}
    comboboxProps={{ zIndex: 10001 }} /* 👈 THIS IS THE FIX */
/>

              <div style={{ 
                border: '1px solid #eee', 
                borderRadius: '8px', 
                padding: '10px', 
                maxHeight: '200px', 
                overflowY: 'auto',
                backgroundColor: '#f9f9f9'
              }}>
                <Text size="xs" fw={700} c="dimmed" mb={5} tt="uppercase">Payload Preview:</Text>
                {selectedFiles.map((f, i) => (
                    <Group key={i} gap="xs" mb={4} wrap="nowrap">
                        <FileIcon size={14} color="gray" />
                        <Text size="xs" truncate>{f.name}</Text>
                    </Group>
                ))}
              </div>

              <Group justify="flex-end" mt="md">
                <Button variant="subtle" onClick={() => setShowConfirm(false)} color="gray">
                  Cancel
                </Button>
                <Button loading={isUploading} onClick={confirmUpload} color="blue" leftSection={<Upload size={16}/>}>
                  Confirm & Upload
                </Button>
              </Group>
            </Stack>
          </Paper>
        </div>
      )}

      {/* --- MAIN APP SHELL --- */}
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: 'sm',
          collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
        }}
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
              <Select 
                placeholder="Select Study"
                data={Array.from({length: 25}, (_, i) => `Study ${i + 1}`)} 
                value={study}
                onChange={setStudy}
                searchable
                w={200}
                variant="filled"
                leftSection={<Search size={14} />}
              />
              <FileButton onChange={onFileSelect} multiple accept=".csv,.xlsx">
                {(props) => (
                  <Button {...props} loading={isUploading} leftSection={<Upload size={16}/>}>
                    Ingest Data
                  </Button>
                )}
              </FileButton>
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="md">
          <ScrollArea style={{ flex: 1 }}>
            <Text c="dimmed" size="xs" fw={700} mb="sm" tt="uppercase">Main Menu</Text>
            <NavLink icon={LayoutDashboard} label="Overview" active />
            <NavLink icon={Database} label="Data Sources" />
            <NavLink icon={FileText} label="Site Reports" />
            <NavLink icon={Settings} label="Settings" />
          </ScrollArea>
          
          <div style={{ borderTop: '1px solid var(--mantine-color-gray-3)', paddingTop: '15px' }}>
              <Group>
                  <Avatar color="blue" radius="xl">DR</Avatar>
                  <div style={{ flex: 1 }}>
                    <Text size="sm" fw={500}>Dr. Richard Roe</Text>
                    <Text c="dimmed" size="xs">Global Trial Lead</Text>
                  </div>
              </Group>
          </div>
        </AppShell.Navbar>

        <AppShell.Main style={{ background: '#f8f9fa' }}>
          <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
              <Title order={2} mb="lg">Clinical Operations Overview</Title>

              <div style={{ position: 'relative', minHeight: '200px' }}>
                  <LoadingOverlay visible={loading} overlayProps={{ radius: "sm", blur: 2 }} />
                  
                  <KPIGrid kpis={metrics?.kpis} loading={loading} />

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginTop: '20px' }}>
                      <div style={{ minHeight: '400px' }}>
                          <RiskChart data={metrics?.top_risky_sites} loading={loading} />
                      </div>
                      <div>
                          <AgentPanel 
                              metrics={metrics} 
                              handleDraftEmail={handleDraftEmail}
                              agentLoading={agentLoading}
                              emailDraft={emailDraft}
                              setEmailDraft={setEmailDraft}
                              loading={loading}
                          />
                      </div>
                  </div>
              </div>
          </div>
        </AppShell.Main>
      </AppShell>
    </div>
  );
}

// Helper Component for Sidebar Links
function NavLink({ icon: Icon, label, active }) {
  return (
    <div style={{
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