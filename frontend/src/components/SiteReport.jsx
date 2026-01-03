// // frontend/src/components/SiteReport.jsx
// import { useState, useEffect } from 'react';
// import { Paper, Title, Select, Table, Badge, Group, Text, Loader, Center } from '@mantine/core';
// import { useDisclosure } from '@mantine/hooks'; // <--- Added this import
// import axios from 'axios';
// import { AlertTriangle, CheckCircle, FileWarning } from 'lucide-react';
// import SubjectProfile from './SubjectProfile'; // <--- Ensure this path is correct

// export default function SiteReport({ study }) {
//   const [sites, setSites] = useState([]);
//   const [selectedSite, setSelectedSite] = useState(null);
//   const [reportData, setReportData] = useState(null);
//   const [loading, setLoading] = useState(false);

//   // --- MODAL STATE ---
//   const [profileOpened, { open: openProfile, close: closeProfile }] = useDisclosure(false);
//   const [selectedSubject, setSelectedSubject] = useState(null);

//   // Function to handle row click
//   const handleRowClick = (subjectId) => {
//       setSelectedSubject(subjectId);
//       openProfile();
//   };

//   // 1. Fetch List of Sites when Study changes
//   useEffect(() => {
//     async function fetchSites() {
//       try {
//         const res = await axios.get(`http://127.0.0.1:8000/api/analytics/sites-list?study=${study}`);
//         setSites(res.data);
//         if (res.data.length > 0) setSelectedSite(res.data[0]); // Auto-select first site
//       } catch (e) { console.error(e); }
//     }
//     fetchSites();
//   }, [study]);

//   // 2. Fetch Details when Site is selected
//   useEffect(() => {
//     if (!selectedSite) return;
//     async function fetchDetails() {
//       setLoading(true);
//       try {
//         const res = await axios.get(`http://127.0.0.1:8000/api/analytics/site-details?study=${study}&site_id=${selectedSite}`);
//         setReportData(res.data);
//       } catch (e) { console.error(e); }
//       finally { setLoading(false); }
//     }
//     fetchDetails();
//   }, [selectedSite, study]);

//   return (
//     <div style={{ padding: '20px' }}>
//       <Group justify="space-between" mb="lg">
//         <div>
//            <Title order={3}>Site Performance Drill-Down</Title>
//            <Text c="dimmed" size="sm">Deep dive into subject-level compliance</Text>
//         </div>
//         <Select 
//             label="Select Site"
//             data={sites}
//             value={selectedSite}
//             onChange={setSelectedSite}
//             searchable
//             allowDeselect={false}
//         />
//       </Group>

//       {loading ? (
//         <Center h={200}><Loader /></Center>
//       ) : (
//         <Paper withBorder radius="md" overflow="hidden">
//            <Table striped highlightOnHover>
//              <Table.Thead>
//                <Table.Tr>
//                  <Table.Th>Subject ID</Table.Th>
//                  <Table.Th>Status</Table.Th>
//                  <Table.Th>Missing Pages</Table.Th>
//                  <Table.Th>Protocol Deviations</Table.Th>
//                  <Table.Th>Data Quality</Table.Th>
//                </Table.Tr>
//              </Table.Thead>
//              <Table.Tbody>
//                {reportData?.subjects?.map((sub) => (
//                  <Table.Tr 
//                     key={sub.subject_id}
//                     onClick={() => handleRowClick(sub.subject_id)} // <--- CLICK HANDLER ADDED
//                     style={{ cursor: 'pointer' }}              // <--- CURSOR POINTER ADDED
//                  >
//                    <Table.Td fw={500}>{sub.subject_id}</Table.Td>
//                    <Table.Td><Badge color={sub.status === 'Active' ? 'blue' : 'gray'}>{sub.status}</Badge></Table.Td>
//                    <Table.Td>
//                       {sub.missing_pages > 0 ? (
//                         <Badge color="red" variant="light" leftSection={<FileWarning size={12}/>}>
//                            {sub.missing_pages} Pages
//                         </Badge>
//                       ) : <Text c="dimmed" size="sm">-</Text>}
//                    </Table.Td>
//                    <Table.Td>
//                       {sub.deviations > 0 ? (
//                         <Badge color="orange" variant="light" leftSection={<AlertTriangle size={12}/>}>
//                            {sub.deviations} Deviations
//                         </Badge>
//                       ) : <Text c="dimmed" size="sm">-</Text>}
//                    </Table.Td>
//                    <Table.Td>
//                       {sub.is_clean ? (
//                         <Badge color="green" leftSection={<CheckCircle size={12}/>}>Clean</Badge>
//                       ) : (
//                         <Badge color="red">Action Required</Badge>
//                       )}
//                    </Table.Td>
//                  </Table.Tr>
//                ))}
//                {reportData?.subjects?.length === 0 && (
//                    <Table.Tr><Table.Td colSpan={5} align="center">No subjects found for this site</Table.Td></Table.Tr>
//                )}
//              </Table.Tbody>
//            </Table>
//         </Paper>
//       )}

//       {/* --- RENDER THE MODAL COMPONENT --- */}
//       <SubjectProfile 
//          opened={profileOpened} 
//          onClose={closeProfile} 
//          study={study} 
//          subjectId={selectedSubject} 
//       />
//     </div>
//   );
// }


import { useState, useEffect } from 'react';
import { Paper, Title, Select, Table, Badge, Group, Text, Loader, Center, Grid } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import axios from 'axios';
import { AlertTriangle, CheckCircle, FileWarning } from 'lucide-react';
import SubjectProfile from './SubjectProfile';
import AISidebar from './AISidebar'; // <--- IMPORT

export default function SiteReport({ study }) {
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  // AI State
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Modal State
  const [profileOpened, { open: openProfile, close: closeProfile }] = useDisclosure(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const handleRowClick = (subjectId) => {
      setSelectedSubject(subjectId);
      openProfile();
  };

  useEffect(() => {
    async function fetchSites() {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/analytics/sites-list?study=${study}`);
        setSites(res.data);
        if (res.data.length > 0) setSelectedSite(res.data[0]);
      } catch (e) { console.error(e); }
    }
    fetchSites();
  }, [study]);

  // Fetch Table Data & AI Analysis when site changes
  useEffect(() => {
    if (!selectedSite) return;
    
    // 1. Fetch Table Data
    setLoading(true);
    axios.get(`http://127.0.0.1:8000/api/analytics/site-details?study=${study}&site_id=${selectedSite}`)
        .then(res => setReportData(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));

    // 2. Fetch AI Analysis (Independent Call)
    fetchAIAnalysis();
    
  }, [selectedSite, study]);

  const fetchAIAnalysis = async () => {
    setAiLoading(true);
    setAiAnalysis(null);
    try {
        const res = await axios.post('http://127.0.0.1:8000/api/agent/analyze-site', {
            site_id: selectedSite,
            study_name: study
        });
        setAiAnalysis(res.data.analysis);
    } catch (e) {
        console.error(e);
        setAiAnalysis("Unable to generate analysis.");
    } finally {
        setAiLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', height: '100%' }}>
      <Group justify="space-between" mb="lg">
        <div>
           <Title order={3}>Site Performance Drill-Down</Title>
           <Text c="dimmed" size="sm">Deep dive into subject-level compliance</Text>
        </div>
        <Select 
            label="Select Site"
            data={sites}
            value={selectedSite}
            onChange={setSelectedSite}
            searchable
            allowDeselect={false}
        />
      </Group>

      {/* NEW GRID LAYOUT */}
      <Grid gutter="lg">
        
        {/* LEFT COLUMN: TABLE (75%) */}
        <Grid.Col span={{ base: 12, md: 9 }}>
            {loading ? (
                <Center h={200}><Loader /></Center>
            ) : (
                <Paper withBorder radius="md" overflow="hidden">
                    <Table striped highlightOnHover>
                        <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Subject ID</Table.Th>
                            <Table.Th>Status</Table.Th>
                            <Table.Th>Missing Pages</Table.Th>
                            <Table.Th>Protocol Deviations</Table.Th>
                            <Table.Th>Data Quality</Table.Th>
                        </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                        {reportData?.subjects?.map((sub) => (
                            <Table.Tr 
                                key={sub.subject_id}
                                onClick={() => handleRowClick(sub.subject_id)}
                                style={{ cursor: 'pointer' }}
                            >
                            <Table.Td fw={500}>{sub.subject_id}</Table.Td>
                            <Table.Td><Badge color={sub.status === 'Active' ? 'blue' : 'gray'}>{sub.status}</Badge></Table.Td>
                            <Table.Td>
                                {sub.missing_pages > 0 ? (
                                    <Badge color="red" variant="light" leftSection={<FileWarning size={12}/>}>
                                    {sub.missing_pages} Pages
                                    </Badge>
                                ) : <Text c="dimmed" size="sm">-</Text>}
                            </Table.Td>
                            <Table.Td>
                                {sub.deviations > 0 ? (
                                    <Badge color="orange" variant="light" leftSection={<AlertTriangle size={12}/>}>
                                    {sub.deviations} Deviations
                                    </Badge>
                                ) : <Text c="dimmed" size="sm">-</Text>}
                            </Table.Td>
                            <Table.Td>
                                {sub.is_clean ? (
                                    <Badge color="green" leftSection={<CheckCircle size={12}/>}>Clean</Badge>
                                ) : (
                                    <Badge color="red">Action Required</Badge>
                                )}
                            </Table.Td>
                            </Table.Tr>
                        ))}
                        {reportData?.subjects?.length === 0 && (
                            <Table.Tr><Table.Td colSpan={5} align="center">No subjects found for this site</Table.Td></Table.Tr>
                        )}
                        </Table.Tbody>
                    </Table>
                </Paper>
            )}
        </Grid.Col>

        {/* RIGHT COLUMN: AI SIDEBAR (25%) */}
        <Grid.Col span={{ base: 12, md: 3 }}>
            <AISidebar 
                siteId={selectedSite} 
                analysis={aiAnalysis} 
                loading={aiLoading} 
                onRefresh={fetchAIAnalysis}
            />
        </Grid.Col>

      </Grid>

      <SubjectProfile 
         opened={profileOpened} 
         onClose={closeProfile} 
         study={study} 
         subjectId={selectedSubject} 
      />
    </div>
  );
}