// // App.jsx
// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import '@mantine/core/styles.css'; 
// import { 
//   MantineProvider, AppShell, Burger, Group, 
//   Select, Button, FileButton, Text, Title, 
//   LoadingOverlay, ScrollArea, Avatar,
//   ThemeIcon, Paper, Stack 
// } from '@mantine/core';
// import { useDisclosure } from '@mantine/hooks';
// import { 
//   LayoutDashboard, Database, FileText, Settings, 
//   Upload, Activity, Search, FileText as FileIcon
// } from 'lucide-react';

// // Import Custom Components
// import KPIGrid from './components/KPIGrid';
// import RiskChart from './components/RiskChart';
// import AgentPanel from './components/AgentPanel';
// import SiteReport from './components/SiteReport'; // <--- NEW IMPORT

// export default function App() {
//   return (
//     <MantineProvider>
//       <DashboardShell />
//     </MantineProvider>
//   );
// }

// function DashboardShell() {
//   const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
//   const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

//   // --- APP STATE ---
//   const [study, setStudy] = useState("Study 1");
//   const [metrics, setMetrics] = useState(null);
//   const [loading, setLoading] = useState(true); 
//   const [activeView, setActiveView] = useState('overview'); // <--- NAVIGATION STATE
  
//   // --- AGENT STATE ---
//   const [emailDraft, setEmailDraft] = useState(null);
//   const [agentLoading, setAgentLoading] = useState(false);

//   // --- UPLOAD STATE ---
//   const [isUploading, setIsUploading] = useState(false);
//   const [showConfirm, setShowConfirm] = useState(false);
//   const [selectedFiles, setSelectedFiles] = useState([]);
//   const [uploadStudy, setUploadStudy] = useState(study);

//   // --- 1. DATA FETCHING ---
//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(`http://127.0.0.1:8000/api/analytics/dashboard-metrics?study=${study}`);
//       setMetrics(response.data);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setTimeout(() => setLoading(false), 500);
//     }
//   };

//   useEffect(() => { fetchData(); setEmailDraft(null); }, [study]);

//   // --- 2. UPLOAD HANDLERS ---
//   const onFileSelect = (files) => {
//     if (files && files.length > 0) {
//         const fileArray = Array.from(files);
//         setSelectedFiles(fileArray);
//         setUploadStudy(study); 
//         setShowConfirm(true); 
//     }
//   };

//   const confirmUpload = async () => {
//     setIsUploading(true);
//     const formData = new FormData();
//     selectedFiles.forEach(file => formData.append("files", file));
//     formData.append("study_name", uploadStudy); 

//     try {
//         await axios.post("http://127.0.0.1:8000/api/upload", formData);
//         setShowConfirm(false); 
//         setSelectedFiles([]);
//         alert("✅ Ingestion Complete!");
//         fetchData(); 
//     } catch (err) {
//         alert("Upload Failed.");
//     } finally {
//         setIsUploading(false);
//     }
//   };

//   // --- 3. AGENT HANDLER ---
//   const handleDraftEmail = async () => {
//     const validRiskEntry = metrics?.top_risky_sites?.find(item => item.site !== null);
//     if (!validRiskEntry) return;

//     setAgentLoading(true);
//     try {
//       const res = await axios.post(`http://127.0.0.1:8000/api/agent/draft-escalation`, {
//         site_id: validRiskEntry.site,
//         study_name: study
//       });
//       setEmailDraft(res.data);
//     } catch (err) {
//       alert("Agent Error: " + err.message);
//     } finally {
//       setAgentLoading(false);
//     }
//   };

//   return (
//     <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      
//       {/* --- CUSTOM CONFIRMATION OVERLAY --- */}
//       {showConfirm && (
//         <div style={{
//           position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
//           backgroundColor: 'rgba(0, 0, 0, 0.6)', 
//           zIndex: 9999, // <--- HIGH Z-INDEX
//           display: 'flex', alignItems: 'center', justifyContent: 'center',
//           backdropFilter: 'blur(4px)'
//         }}>
//           <Paper p="xl" radius="md" shadow="xl" withBorder style={{ width: '500px', backgroundColor: 'white' }}>
//             <Stack>
//               <Title order={3}>Confirm Data Ingestion</Title>
//               <Text size="sm" c="dimmed">
//                 You are about to ingest <strong>{selectedFiles.length} files</strong>.
//               </Text>
              
//               <Select 
//                 label="Target Study Protocol"
//                 data={Array.from({length: 25}, (_, i) => `Study ${i + 1}`)} 
//                 value={uploadStudy}
//                 onChange={setUploadStudy}
//                 allowDeselect={false}
//                 comboboxProps={{ zIndex: 10001 }} // <--- FIX FOR DROPDOWN VISIBILITY
//               />

//               <div style={{ 
//                 border: '1px solid #eee', borderRadius: '8px', padding: '10px', 
//                 maxHeight: '200px', overflowY: 'auto', backgroundColor: '#f9f9f9'
//               }}>
//                 <Text size="xs" fw={700} c="dimmed" mb={5} tt="uppercase">Payload Preview:</Text>
//                 {selectedFiles.map((f, i) => (
//                     <Group key={i} gap="xs" mb={4} wrap="nowrap">
//                         <FileIcon size={14} color="gray" />
//                         <Text size="xs" truncate>{f.name}</Text>
//                     </Group>
//                 ))}
//               </div>

//               <Group justify="flex-end" mt="md">
//                 <Button variant="subtle" onClick={() => setShowConfirm(false)} color="gray">
//                   Cancel
//                 </Button>
//                 <Button loading={isUploading} onClick={confirmUpload} color="blue" leftSection={<Upload size={16}/>}>
//                   Confirm & Upload
//                 </Button>
//               </Group>
//             </Stack>
//           </Paper>
//         </div>
//       )}

//       {/* --- MAIN APP SHELL --- */}
//       <AppShell
//         header={{ height: 60 }}
//         navbar={{
//           width: 300,
//           breakpoint: 'sm',
//           collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
//         }}
//         padding="md"
//         layout="alt"
//       >
//         <AppShell.Header>
//           <Group h="100%" px="md" justify="space-between">
//             <Group>
//               <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
//               <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
//               <Group gap="xs">
//                   <ThemeIcon color="blue" variant="light" size="lg"><Activity size={20} /></ThemeIcon>
//                   <Title order={3} m={0}>CLARITY.AI</Title>
//               </Group>
//             </Group>
            
//             <Group>
//               <Select 
//                 placeholder="Select Study"
//                 data={Array.from({length: 25}, (_, i) => `Study ${i + 1}`)} 
//                 value={study}
//                 onChange={setStudy}
//                 searchable
//                 w={200}
//                 variant="filled"
//                 leftSection={<Search size={14} />}
//               />
//               <FileButton onChange={onFileSelect} multiple accept=".csv,.xlsx">
//                 {(props) => (
//                   <Button {...props} loading={isUploading} leftSection={<Upload size={16}/>}>
//                     Ingest Data
//                   </Button>
//                 )}
//               </FileButton>
//             </Group>
//           </Group>
//         </AppShell.Header>

//         <AppShell.Navbar p="md">
//           <ScrollArea style={{ flex: 1 }}>
//             <Text c="dimmed" size="xs" fw={700} mb="sm" tt="uppercase">Main Menu</Text>
            
//             {/* 👇 NAVIGATION LINKS NOW WORK 👇 */}
//             <NavLink 
//                 icon={LayoutDashboard} 
//                 label="Overview" 
//                 active={activeView === 'overview'} 
//                 onClick={() => setActiveView('overview')}
//             />
//             <NavLink 
//                 icon={Database} 
//                 label="Data Sources" 
//                 active={activeView === 'sources'} 
//                 onClick={() => setActiveView('sources')}
//             />
//             <NavLink 
//                 icon={FileText} 
//                 label="Site Reports" 
//                 active={activeView === 'reports'} 
//                 onClick={() => setActiveView('reports')}
//             />
//             <NavLink icon={Settings} label="Settings" />
//           </ScrollArea>
          
//           <div style={{ borderTop: '1px solid var(--mantine-color-gray-3)', paddingTop: '15px' }}>
//               <Group>
//                   <Avatar color="blue" radius="xl">DR</Avatar>
//                   <div style={{ flex: 1 }}>
//                     <Text size="sm" fw={500}>Dr. Richard Roe</Text>
//                     <Text c="dimmed" size="xs">Global Trial Lead</Text>
//                   </div>
//               </Group>
//           </div>
//         </AppShell.Navbar>

//         <AppShell.Main style={{ background: '#f8f9fa' }}>
//           <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
              
//               {/* 👇 VIEW SWITCHING LOGIC 👇 */}
              
//               {activeView === 'overview' && (
//                   <>
//                       <Title order={2} mb="lg">Clinical Operations Overview</Title>
//                       <div style={{ position: 'relative', minHeight: '200px' }}>
//                           <LoadingOverlay visible={loading} overlayProps={{ radius: "sm", blur: 2 }} />
//                           <KPIGrid kpis={metrics?.kpis} loading={loading} />
//                           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginTop: '20px' }}>
//                               <div style={{ minHeight: '400px' }}>
//                                   <RiskChart data={metrics?.top_risky_sites} loading={loading} />
//                               </div>
//                               <div>
//                                   <AgentPanel 
//                                       metrics={metrics} 
//                                       handleDraftEmail={handleDraftEmail}
//                                       agentLoading={agentLoading}
//                                       emailDraft={emailDraft}
//                                       setEmailDraft={setEmailDraft}
//                                       loading={loading}
//                                   />
//                               </div>
//                           </div>
//                       </div>
//                   </>
//               )}

//               {activeView === 'reports' && (
//                   <SiteReport study={study} />
//               )}

//           </div>
//         </AppShell.Main>
//       </AppShell>
//     </div>
//   );
// }

// // Updated Helper Component
// function NavLink({ icon: Icon, label, active, onClick }) {
//   return (
//     <div 
//       onClick={onClick}
//       style={{
//         display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px',
//         borderRadius: '8px', cursor: 'pointer', marginBottom: '4px',
//         backgroundColor: active ? '#e7f5ff' : 'transparent',
//         color: active ? '#1971c2' : '#495057'
//       }}
//     >
//       <Icon size={20} />
//       <Text size="sm" fw={500}>{label}</Text>
//     </div>
//   )
// }


// App.jsx

// App.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import '@mantine/core/styles.css'; 
import { 
  MantineProvider, AppShell, Burger, Group, 
  Select, Button, FileButton, Text, Title, 
  LoadingOverlay, ScrollArea, Avatar,
  ThemeIcon, Paper, Stack, ActionIcon // <--- ADDED ActionIcon HERE
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  LayoutDashboard, Database, FileText, Settings, 
  Upload, Activity, Search, FileText as FileIcon, LogOut
} from 'lucide-react';

// COMPONENTS
import KPIGrid from './components/KPIGrid';
import RiskChart from './components/RiskChart';
import AgentPanel from './components/AgentPanel';
import SiteReport from './components/SiteReport';
import CRAWorkspace from './components/CRAWorkspace'; 
import LandingPage from './components/LandingPage';   

export default function App() {
  return (
    <MantineProvider>
      <MainFlow />
    </MantineProvider>
  );
}

function MainFlow() {
    // 1. STATE FOR ROLE
    const [userRole, setUserRole] = useState(null); // null = Show Landing Page

    // If no role is selected, show Landing Page
    if (!userRole) {
        return <LandingPage onSelectRole={setUserRole} />;
    }

    // Otherwise, show the Dashboard with the selected role
    return <DashboardShell userRole={userRole} onLogout={() => setUserRole(null)} />;
}

function DashboardShell({ userRole, onLogout }) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  // --- APP STATE ---
  const [study, setStudy] = useState("Study 1");
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true); 
  
  // Set default view based on Role
  const [activeView, setActiveView] = useState(userRole === 'CRA' ? 'cra_worklist' : 'overview');

  const [emailDraft, setEmailDraft] = useState(null);
  const [agentLoading, setAgentLoading] = useState(false);
  const [availableStudies, setAvailableStudies] = useState([]);

  // --- UPLOAD STATE ---
  const [isUploading, setIsUploading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadStudy, setUploadStudy] = useState(study);

  // --- 1. LOAD STUDIES ---
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

  // --- 2. FETCH DATA ---
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

  // --- 3. HANDLERS ---
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
      
      {/* OVERLAY */}
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
              
              <Select 
                label="Target Study Protocol"
                data={availableStudies}
                value={uploadStudy}
                onChange={setUploadStudy}
                allowDeselect={false}
                comboboxProps={{ zIndex: 10001 }} 
              />
              {/* File list preview... */}
              <Group justify="flex-end" mt="md">
                <Button variant="subtle" onClick={() => setShowConfirm(false)} color="gray">Cancel</Button>
                <Button loading={isUploading} onClick={confirmUpload} color="blue">Confirm</Button>
              </Group>
            </Stack>
          </Paper>
        </div>
      )}

      {/* DASHBOARD */}
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
            
            {/* CONDITIONAL NAVIGATION BASED ON ROLE */}
            {userRole === 'Lead' && (
                <NavLink icon={LayoutDashboard} label="Overview" active={activeView === 'overview'} onClick={() => setActiveView('overview')} />
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

              {/* VIEW: CRA WORKSPACE */}
              {(activeView === 'cra_worklist' || (userRole === 'CRA' && activeView !== 'reports')) && (
                  <CRAWorkspace metrics={metrics} handleDraftEmail={handleDraftEmail} />
              )}

              {/* VIEW: SITE REPORTS (Shared) */}
              {activeView === 'reports' && (
                  <SiteReport study={study} />
              )}

          </div>
        </AppShell.Main>
      </AppShell>
    </div>
  );
}

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