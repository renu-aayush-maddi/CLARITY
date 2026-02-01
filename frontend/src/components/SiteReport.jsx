import { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Group, Text, Title, Select, Modal, Stack, Divider, List, ThemeIcon, Loader, Grid } from '@mantine/core';
import { User, FileWarning, AlertTriangle, Activity } from 'lucide-react';
import api from '../api/client';
import AISidebar from './AISidebar';
import TourStep from './GuidedTour/TourStep';

export default function SiteReport({ study, tourActive, tourStep, onFinishTour }) {
    const [sites, setSites] = useState([]);
    const [selectedSite, setSelectedSite] = useState(null);
    const [subjects, setSubjects] = useState([]);

    // PATIENT 360 STATE
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientDetails, setPatientDetails] = useState(null);

    // AI STATE (RESTORED)
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);

    // 1. Load Sites
    useEffect(() => {
        if (!study) return;
        api.get(`/api/analytics/sites-list?study=${study}`).then(res => {
            setSites(res.data);
            if (res.data.length > 0) setSelectedSite(res.data[0]);
        });
    }, [study]);

    // 2. Load Subjects & Trigger AI Analysis when Site Changes
    useEffect(() => {
        if (!selectedSite || !study) return;

        // Fetch Table Data
        api.get(`/api/analytics/site-details?study=${study}&site_id=${selectedSite}`).then(res => {
            setSubjects(res.data.subjects);
        });

        // Fetch AI Analysis (RESTORED LOGIC)
        fetchAIAnalysis();

    }, [selectedSite, study]);

    const fetchAIAnalysis = async () => {
        setAiLoading(true);
        setAiAnalysis(null);
        try {
            const res = await api.post('/api/agent/analyze-site', {
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

    // 3. Load Specific Patient Details
    const handlePatientClick = async (subjectId) => {
        setSelectedPatient(subjectId);
        try {
            const res = await api.get(`/api/analytics/subject-details?study=${study}&subject_id=${subjectId}`);
            setPatientDetails(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <Group mb="md" justify="space-between">
                <div>
                    <Title order={3}>Site & Patient Drill-Down</Title>
                    <Text c="dimmed" size="sm">Deep dive into subject-level compliance & AI Risk Assessment</Text>
                </div>
                <TourStep
                    stepIndex={9}
                    currentStep={tourStep}
                    totalSteps={15}
                    tourActive={tourActive}
                    onNext={() => onFinishTour && onFinishTour(10)}
                    onFinish={() => onFinishTour && onFinishTour()}
                    title="Site Selector"
                    content="Select a specific site to view detailed patient-level data and AI analysis."
                    position="bottom-end"
                    popoverWidth={360}
                    zIndex={1010}
                >
                    <Select
                        label="Select Site"
                        data={sites}
                        value={selectedSite}
                        onChange={setSelectedSite}
                        searchable
                        allowDeselect={false}
                    />
                </TourStep>
            </Group>

            {/* RESTORED GRID LAYOUT */}
            <Grid gutter="lg">

                {/* LEFT COL: TABLE (75%) */}
                <Grid.Col span={{ base: 12, md: 9 }}>
                    <Card withBorder radius="md">
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Subject ID</Table.Th>
                                    <Table.Th>Missing Pages</Table.Th>
                                    <Table.Th>Deviations</Table.Th>
                                    <Table.Th>Status</Table.Th>
                                    <Table.Th>Action</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {subjects.map(sub => (
                                    <Table.Tr key={sub.subject_id}>
                                        <Table.Td fw={500}>{sub.subject_id}</Table.Td>
                                        <Table.Td c={sub.missing_pages > 0 ? 'red' : 'dimmed'}>{sub.missing_pages}</Table.Td>
                                        <Table.Td>{sub.deviations}</Table.Td>
                                        <Table.Td>
                                            {sub.is_clean ? <Badge color="green">Clean</Badge> : <Badge color="red">Attention</Badge>}
                                        </Table.Td>
                                        <Table.Td>
                                            <Button size="xs" variant="subtle" onClick={() => handlePatientClick(sub.subject_id)}>
                                                View 360°
                                            </Button>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                                {subjects.length === 0 && (
                                    <Table.Tr><Table.Td colSpan={5} align="center">No subjects found.</Table.Td></Table.Tr>
                                )}
                            </Table.Tbody>
                        </Table>
                    </Card>
                </Grid.Col>

                {/* RIGHT COL: AI SIDEBAR (25%) - RESTORED */}
                <Grid.Col span={{ base: 12, md: 3 }}>
                    <AISidebar
                        siteId={selectedSite}
                        analysis={aiAnalysis}
                        loading={aiLoading}
                        onRefresh={fetchAIAnalysis}
                    />
                </Grid.Col>

            </Grid>

            {/* PATIENT 360 MODAL */}
            <Modal
                opened={!!selectedPatient}
                onClose={() => { setSelectedPatient(null); setPatientDetails(null); }}
                title={<Group><User size={18} /><Text fw={700}>Patient 360: {selectedPatient}</Text></Group>}
                size="lg"
            >
                {patientDetails ? (
                    <Stack>
                        <Group grow>
                            <Card withBorder padding="xs" radius="md">
                                <Text size="xs" c="dimmed">Status</Text>
                                <Text fw={700}>{patientDetails.status}</Text>
                            </Card>
                            <Card withBorder padding="xs" radius="md">
                                <Text size="xs" c="dimmed">Site ID</Text>
                                <Text fw={700}>{patientDetails.site_id}</Text>
                            </Card>
                        </Group>

                        <Divider label="Risk Factors" labelPosition="center" />

                        <List spacing="sm">
                            <List.Item icon={<ThemeIcon color="red" size={20} radius="xl"><FileWarning size={12} /></ThemeIcon>}>
                                <strong>{patientDetails.metrics?.missing_count || 0}</strong> Missing Pages
                            </List.Item>
                            <List.Item icon={<ThemeIcon color="orange" size={20} radius="xl"><AlertTriangle size={12} /></ThemeIcon>}>
                                <strong>{patientDetails.metrics?.deviation_count || 0}</strong> Protocol Deviations
                            </List.Item>
                            <List.Item icon={<ThemeIcon color="blue" size={20} radius="xl"><Activity size={12} /></ThemeIcon>}>
                                <strong>{patientDetails.metrics?.sae_count || 0}</strong> Safety Events
                            </List.Item>
                        </List>

                        <Card bg="gray.1" radius="md">
                            <Text size="sm" fw={600}>🤖 Agent Recommendation:</Text>
                            <Text size="sm" mt={5}>
                                {patientDetails.metrics?.missing_count > 0
                                    ? "Flag for immediate CRA follow-up during next monitoring visit."
                                    : "No immediate actions required. Continue monitoring."}
                            </Text>
                        </Card>
                    </Stack>
                ) : (
                    <Loader />
                )}
            </Modal>
        </div>
    );
}