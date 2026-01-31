import { useState, useEffect } from 'react';
import {
    Paper, Title, Text, Group, Button, Grid, Badge,
    Card, Progress, Tabs, ThemeIcon, Alert, ScrollArea, LoadingOverlay
} from '@mantine/core';
import {
    ClipboardList, CheckCircle, AlertCircle,
    MessageSquare, ArrowRight, Brain
} from 'lucide-react';
import api from "../api/client";
import TourStep from './GuidedTour/TourStep';

export default function CRAWorkspace({ study, handleDraftEmail, onViewSite, tourActive, tourStep, onFinishTour }) {
    const [activeTab, setActiveTab] = useState('tasks');
    const [mySites, setMySites] = useState([]);
    const [clusters, setClusters] = useState([]);
    const [loading, setLoading] = useState(false);

    // 1. LOAD REAL DATA FOR THE SELECTED STUDY
    useEffect(() => {
        async function loadWorkspaceData() {
            setLoading(true);
            try {
                // A. Fetch Real Sites (Simulating "My Assigned Sites" by taking top 3)
                const siteRes = await api.get(`/api/analytics/sites-list?study=${study}`);
                const allSites = siteRes.data || [];
                setMySites(allSites.slice(0, 3));

                // B. Fetch Smart Clusters for this Study (Real Agentic Logic)
                const clusterRes = await api.get(`/api/agent/cluster-queries?study=${study}`);
                setClusters(clusterRes.data || []);
            } catch (e) {
                console.error("Workspace Load Error:", e);
            } finally {
                setLoading(false);
            }
        }
        if (study) loadWorkspaceData();
    }, [study]);

    // Bulk Action Simulation
    const handleBulkAction = () => {
        alert("✅ SUCCESS: 12 bulk queries have been generated and pushed to the EDC system.");
    };

    return (
        <div style={{ paddingBottom: '20px' }}>

            {/* HEADER */}
            {tourActive && tourStep === 12 ? (
                <TourStep
                    stepIndex={12}
                    currentStep={tourStep}
                    totalSteps={15}
                    tourActive={tourActive && tourStep === 12}
                    onNext={() => onFinishTour && onFinishTour(13)}
                    onFinish={() => onFinishTour && onFinishTour()}
                    title="CRA Worklist"
                    content="Welcome to the Site Monitor workspace! This is your personalized dashboard showing your assigned sites and priority tasks."
                    position="bottom"
                    popoverWidth={360}
                    zIndex={1010}
                >
                    <Group justify="space-between" mb="lg" align="flex-end">
                        <div>
                            <Title order={2}>Monitor Workspace: {study}</Title>
                            <Text c="dimmed">Focusing on your <span style={{ color: '#fa5252', fontWeight: 700 }}>{mySites.length} assigned sites</span>.</Text>
                        </div>
                        <Paper withBorder p="xs" px="md" radius="md">
                            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Compliance Score</Text>
                            <Text fw={700} size="xl" c="blue">94%</Text>
                        </Paper>
                    </Group>
                </TourStep>
            ) : (
                <Group justify="space-between" mb="lg" align="flex-end">
                    <div>
                        <Title order={2}>Monitor Workspace: {study}</Title>
                        <Text c="dimmed">Focusing on your <span style={{ color: '#fa5252', fontWeight: 700 }}>{mySites.length} assigned sites</span>.</Text>
                    </div>
                    <Paper withBorder p="xs" px="md" radius="md">
                        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Compliance Score</Text>
                        <Text fw={700} size="xl" c="blue">94%</Text>
                    </Paper>
                </Group>
            )}

            {/* MY SITES CARDS (Dynamic Data) */}
            <Grid mb="xl">
                {mySites.map((siteId, i) => (
                    <Grid.Col key={i} span={{ base: 12, md: 4 }}>
                        {/* Wrap first card with TourStep for step 12 */}
                        {i === 0 && tourActive && tourStep === 13 ? (
                            <TourStep
                                stepIndex={13}
                                currentStep={tourStep}
                                totalSteps={15}
                                tourActive={tourActive}
                                onNext={() => onFinishTour && onFinishTour(14)}
                                onFinish={() => onFinishTour && onFinishTour()}
                                title="Site Card Actions"
                                content="Each site card shows progress and gives you quick actions: Draft an AI-powered email or view detailed patient data."
                                position="top"
                                popoverWidth={360}
                                zIndex={1010}
                            >
                                <Card withBorder radius="md" padding="lg">
                                    <Group justify="space-between" mb="xs">
                                        <Text fw={600}>{siteId}</Text>
                                        <Badge color={i === 0 ? "red" : "green"}>{i === 0 ? "Action Needed" : "On Track"}</Badge>
                                    </Group>

                                    <Text size="sm" c="dimmed" mt="sm">Data Entry Progress</Text>
                                    <Progress value={i === 0 ? 65 : 88} color={i === 0 ? "red" : "blue"} mt={4} mb="md" />

                                    <Group grow>
                                        <Button variant="light" size="xs" onClick={() => handleDraftEmail(siteId)}>
                                            Draft Email
                                        </Button>
                                        <Button variant="default" size="xs" onClick={() => onViewSite(siteId)}>
                                            View Details
                                        </Button>
                                    </Group>
                                </Card>
                            </TourStep>
                        ) : (
                            <Card withBorder radius="md" padding="lg">
                                <Group justify="space-between" mb="xs">
                                    <Text fw={600}>{siteId}</Text>
                                    <Badge color={i === 0 ? "red" : "green"}>{i === 0 ? "Action Needed" : "On Track"}</Badge>
                                </Group>

                                <Text size="sm" c="dimmed" mt="sm">Data Entry Progress</Text>
                                <Progress value={i === 0 ? 65 : 88} color={i === 0 ? "red" : "blue"} mt={4} mb="md" />

                                <Group grow>
                                    <Button variant="light" size="xs" onClick={() => handleDraftEmail(siteId)}>
                                        Draft Email
                                    </Button>
                                    <Button variant="default" size="xs" onClick={() => onViewSite(siteId)}>
                                        View Details
                                    </Button>
                                </Group>
                            </Card>
                        )}
                    </Grid.Col>
                ))}
                {mySites.length === 0 && !loading && (
                    <Text c="dimmed" p="md">No sites found for this study.</Text>
                )}
            </Grid>

            {/* TABS AREA */}
            <Paper withBorder p="md" radius="md" style={{ minHeight: '400px', position: 'relative' }}>
                <LoadingOverlay visible={loading} />

                <Tabs value={activeTab} onChange={setActiveTab}>
                    <Tabs.List mb="md">
                        <Tabs.Tab value="tasks" leftSection={<ClipboardList size={16} />}>Prioritized Tasks</Tabs.Tab>

                        {/* Step 14: Smart Query Manager Tab */}
                        {tourActive && tourStep === 14 ? (
                            <TourStep
                                stepIndex={14}
                                currentStep={tourStep}
                                totalSteps={15}
                                tourActive={tourActive}
                                onNext={() => onFinishTour && onFinishTour(15)}
                                onFinish={() => onFinishTour && onFinishTour()}
                                title="Smart Query Manager"
                                content="AI analyzes patterns across your sites and groups related issues into clusters for efficient batch processing."
                                position="bottom"
                                popoverWidth={360}
                                zIndex={1010}
                            >
                                <Tabs.Tab value="smart_queries" leftSection={<Brain size={16} color="purple" />}>
                                    Smart Query Manager <Badge size="xs" circle ml={5} color="purple">{clusters.length}</Badge>
                                </Tabs.Tab>
                            </TourStep>
                        ) : (
                            <Tabs.Tab value="smart_queries" leftSection={<Brain size={16} color="purple" />}>
                                Smart Query Manager <Badge size="xs" circle ml={5} color="purple">{clusters.length}</Badge>
                            </Tabs.Tab>
                        )}
                    </Tabs.List>

                    <Tabs.Panel value="tasks">
                        <Alert color="blue" title="Sentinel Agent">
                            The background agent detected 2 new risks for your sites since login.
                        </Alert>

                        {/* Dynamic Task Card Example */}
                        {mySites.length > 0 && (
                            <Card withBorder mt="md">
                                <Group justify="space-between">
                                    <Group>
                                        <ThemeIcon color="orange" variant="light"><AlertCircle size={18} /></ThemeIcon>
                                        <Text size="sm" fw={500}>Verify Informed Consent Dates ({mySites[0]})</Text>
                                    </Group>
                                    <Button size="xs" variant="subtle" onClick={() => onViewSite(mySites[0])}>Review</Button>
                                </Group>
                            </Card>
                        )}
                    </Tabs.Panel>

                    <Tabs.Panel value="smart_queries">
                        <Alert icon={<Brain size={16} />} color="violet" mb="md" variant="light" title="Agent Insight">
                            I have grouped <strong>{clusters.reduce((a, b) => a + b.count, 0)} individual issues</strong> into these systemic clusters.
                        </Alert>

                        <ScrollArea h={400}>
                            {clusters.map((cluster, i) => (
                                <Card key={i} withBorder mb="sm" radius="md">
                                    <Group justify="space-between">
                                        <Group>
                                            <ThemeIcon color={cluster.severity === 'High' ? 'red' : 'orange'} size="lg" variant="light">
                                                <MessageSquare size={20} />
                                            </ThemeIcon>
                                            <div>
                                                <Group gap="xs">
                                                    <Text fw={600}>{cluster.issue}</Text>
                                                    <Badge variant="dot" color="gray">{cluster.site}</Badge>
                                                    <Badge variant="light" color="purple">Conf: {cluster.confidence}</Badge>
                                                </Group>
                                                <Text size="sm" c="dimmed" mt={4}>
                                                    Affected: <strong>{cluster.count} subjects</strong>. ({cluster.category})
                                                </Text>
                                            </div>
                                        </Group>

                                        {/* Step 15: Bulk Action Button - FINAL STEP */}
                                        {tourActive && tourStep === 15 && i === 0 ? (
                                            <TourStep
                                                stepIndex={15}
                                                currentStep={tourStep}
                                                totalSteps={15}
                                                tourActive={tourActive}
                                                onNext={() => onFinishTour && onFinishTour()}
                                                onFinish={() => onFinishTour && onFinishTour()}
                                                title="AI Bulk Actions"
                                                content="Click here to generate queries for ALL affected subjects at once. This completes the tour - you've seen how CLARITY streamlines clinical trial oversight across both Lead and CRA roles!"
                                                position="left"
                                                popoverWidth={380}
                                                zIndex={1010}
                                            >
                                                <Button onClick={handleBulkAction} rightSection={<ArrowRight size={16} />} variant="light" color="violet">
                                                    Bulk Create Query
                                                </Button>
                                            </TourStep>
                                        ) : (
                                            <Button onClick={handleBulkAction} rightSection={<ArrowRight size={16} />} variant="light" color="violet">
                                                Bulk Create Query
                                            </Button>
                                        )}
                                    </Group>

                                    <Paper bg="gray.0" p="xs" mt="md" radius="sm">
                                        <Text size="xs" fw={700} c="dimmed" tt="uppercase">AI Recommendation</Text>
                                        <Text size="sm" style={{ fontFamily: 'monospace' }}>
                                            "{cluster.recommendation}"
                                        </Text>
                                    </Paper>
                                </Card>
                            ))}
                            {clusters.length === 0 && (
                                <Text c="dimmed" ta="center" py="xl">No clustered issues found for this study.</Text>
                            )}
                        </ScrollArea>
                    </Tabs.Panel>
                </Tabs>
            </Paper>
        </div>
    );
}