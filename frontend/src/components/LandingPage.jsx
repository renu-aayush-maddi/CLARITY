// src/components/LandingPage.jsx
import { Paper, Title, Text, Group, Container, SimpleGrid, ThemeIcon, Popover } from '@mantine/core'; // <--- Added Popover
import { useDisclosure } from '@mantine/hooks';
import { LayoutDashboard, ClipboardList, ArrowRight } from 'lucide-react';
import TourWelcomeModal from './GuidedTour/TourWelcomeModal';

export default function LandingPage({ onSelectRole, onStartTour, tourActive }) {
  const [tourOpened, { close: closeTour }] = useDisclosure(true);

  const startTour = () => {
    closeTour();
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
      <TourWelcomeModal 
        opened={tourOpened} 
        onClose={closeTour}
        onStartTour={startTour}
        onManual={closeTour}
      />
      
      <Container size="md">
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <Title style={{ fontSize: '3rem', color: '#1c7ed6' }}>CLARITY.AI</Title>
            <Text c="dimmed" size="lg">Select your role to access the workspace</Text>
        </div>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
            
            {/* CARD 1: GLOBAL LEAD */}
            <Popover opened={tourActive} width={300} position="bottom" withArrow shadow="md">
             <Popover.Target>
            <Paper 
                component="button"
                onClick={() => onSelectRole('Lead')}
                radius="lg" 
                p="xl" 
                withBorder
                style={{ 
                    cursor: 'pointer', 
                    textAlign: 'left', 
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    width: '100%',
                    border: '2px solid ' + (tourActive ? '#228be6' : '#dee2e6'),
                    transform: tourActive ? 'scale(1.02)' : 'none'
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
            </Popover.Target>
            <Popover.Dropdown style={{ pointerEvents: 'none' }}>
                <Text size="sm">Click here to enter the dashboard as a <strong>Global Trial Lead</strong>.</Text>
            </Popover.Dropdown>
            </Popover>

            {/* CARD 2: SITE MONITOR (CRA) */}
            <Paper 
                component="button"
                onClick={() => onSelectRole('CRA')}
                radius="lg" 
                p="xl" 
                withBorder
                style={{ 
                    cursor: 'pointer', 
                    textAlign: 'left',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    width: '100%',
                    border: '1px solid #dee2e6'
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

        </SimpleGrid>
      </Container>
    </div>
  );
}