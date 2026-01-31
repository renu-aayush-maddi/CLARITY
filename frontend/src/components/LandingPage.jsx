// src/components/LandingPage.jsx
import { Paper, Title, Text, Group, Container, SimpleGrid, ThemeIcon, Popover } from '@mantine/core'; // <--- Added Popover
import { useDisclosure } from '@mantine/hooks';
import { LayoutDashboard, ClipboardList, ArrowRight } from 'lucide-react';
import TourWelcomeModal from './GuidedTour/TourWelcomeModal';
import TourStep from './GuidedTour/TourStep';

export default function LandingPage({ onSelectRole, onStartTour, tourActive, tourStep, setTourStep }) {
    const [tourOpened, { close: closeTour }] = useDisclosure(true);

    const startTour = () => {
        closeTour();
        setTourStep(0); // Start at step 0 (Global Trial Lead)
        if (onStartTour) onStartTour();
    }

    return (
        <div style={{
            height: '100vh',
            width: '100vw', // <--- ADDED THIS TO FIX UI
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: '#f0f2f5',
            margin: 0,
            padding: 0
        }}>
            {!tourActive && (
                <TourWelcomeModal
                    opened={tourOpened}
                    onClose={closeTour}
                    onStartTour={startTour}
                    onManual={closeTour}
                />
            )}

            <Container size="md">
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <Title style={{ fontSize: '3rem', color: '#1c7ed6' }}>CLARITY.AI</Title>
                    <Text c="dimmed" size="lg">Select your role to access the workspace</Text>
                </div>

                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">

                    {/* CARD 1: GLOBAL LEAD - Step 0 */}
                    <TourStep
                        stepIndex={0}
                        currentStep={tourStep}
                        totalSteps={15}
                        tourActive={tourActive && tourStep === 0}
                        onNext={() => {
                            setTourStep(1);
                            onSelectRole('Lead');
                        }}
                        onFinish={() => onStartTour && onStartTour(false)}
                        title="Global Trial Lead"
                        content="Click this card or Next to enter the dashboard as a Global Trial Lead."
                        position="left"
                        noFlip={true}
                        popoverWidth={260}
                        zIndex={1010}
                        width="100%"
                    >
                        <Paper
                            component="button"
                            onClick={() => {
                                if (tourActive && tourStep === 0) {
                                    setTourStep(1);
                                    onSelectRole('Lead');
                                } else {
                                    onSelectRole('Lead');
                                }
                            }}
                            radius="lg"
                            p="xl"
                            withBorder
                            style={{
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                width: '100%',
                                border: tourActive && tourStep === 0 ? '2px solid #228be6' : '1px solid #dee2e6',
                                transform: tourActive && tourStep === 0 ? 'scale(1.02)' : 'none',
                                pointerEvents: 'auto'
                            }}
                        >
                            <ThemeIcon size={60} radius="md" color="blue" variant="light" mb="md">
                                <LayoutDashboard size={32} />
                            </ThemeIcon>
                            <Title order={3} mb="xs">Global Trial Lead</Title>
                            <Text c="dimmed" mb="lg" style={{ minHeight: '50px' }}>
                                Access executive dashboards, study-wide KPIs, and DQI analytics.
                            </Text>
                            <Group c="blue" fw={500} gap={5}>
                                <span>Enter Dashboard</span>
                                <ArrowRight size={16} />
                            </Group>
                        </Paper>
                    </TourStep>

                    {/* CARD 2: SITE MONITOR (CRA) - Step 11 */}
                    <TourStep
                        stepIndex={11}
                        currentStep={tourStep}
                        totalSteps={15}
                        tourActive={tourActive && tourStep === 11}
                        onNext={() => {
                            setTourStep(12);
                            onSelectRole('CRA');
                        }}
                        onBack={() => setTourStep(10)}
                        onFinish={() => onStartTour && onStartTour(false)}
                        title="CRA Role"
                        content="Click the Site Monitor card below or click Next to enter the CRA workspace."
                        position="right"
                        noFlip={true}
                        popoverWidth={260}
                        zIndex={1010}
                        width="100%"
                    >
                        <Paper
                            component="button"
                            onClick={() => {
                                if (tourActive && tourStep === 11) {
                                    setTourStep(12);
                                    onSelectRole('CRA');
                                } else {
                                    onSelectRole('CRA');
                                }
                            }}
                            radius="lg"
                            p="xl"
                            withBorder
                            style={{
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                width: '100%',
                                border: tourActive && tourStep === 11 ? '2px solid #228be6' : '1px solid #dee2e6',
                                transform: tourActive && tourStep === 11 ? 'scale(1.02)' : 'none',
                                pointerEvents: 'auto'
                            }}
                        >
                            <ThemeIcon size={60} radius="md" color="orange" variant="light" mb="md">
                                <ClipboardList size={32} />
                            </ThemeIcon>
                            <Title order={3} mb="xs">Site Monitor (CRA)</Title>
                            <Text c="dimmed" mb="lg" style={{ minHeight: '50px' }}>
                                View site worklists, critical escalations, and draft follow-up emails.
                            </Text>
                            <Group c="orange" fw={500} gap={5}>
                                <span>Open Worklist</span>
                                <ArrowRight size={16} />
                            </Group>
                        </Paper>
                    </TourStep>

                </SimpleGrid>
            </Container >
        </div >
    );
}