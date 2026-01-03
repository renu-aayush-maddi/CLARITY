// src/components/CRAWorkspace.jsx
import { Paper, Title, Text, Group, Badge, Button, Stack, Avatar, ThemeIcon } from '@mantine/core';
import { Phone, Mail, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export default function CRAWorkspace({ metrics, handleDraftEmail }) {
  // Filter for "High Risk" sites to create a Todo List
  // If no risky sites exist, we default to an empty array
  const mySites = metrics?.top_risky_sites || [];
  
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Group justify="space-between" mb="xl">
        <div>
           <Title order={2}>Monitor Worklist</Title>
           <Text c="dimmed">
             You have <strong>{mySites.length}</strong> high-priority sites requiring attention today.
           </Text>
        </div>
        <Group>
            <Badge size="lg" color="red" variant="light">3 Critical Escalations</Badge>
            <Badge size="lg" color="blue" variant="light">5 Routine Follow-ups</Badge>
        </Group>
      </Group>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
        
        {/* RENDER A CARD FOR EACH RISKY SITE */}
        {mySites.map((site, index) => (
            <Paper key={index} withBorder radius="md" p="md" shadow="sm">
                <Group justify="space-between" mb="md">
                    <Group gap="sm">
                        {/* We try to format 'Site 38' nicely, fallback to 'S' if format differs */}
                        <Avatar color="blue" radius="xl">
                          {site.site.includes('Site') ? site.site.replace('Site ', '') : 'S'}
                        </Avatar>
                        <div>
                            <Text fw={700}>{site.site}</Text>
                            <Text size="xs" c="dimmed">Principal Investigator: Dr. Smith</Text>
                        </div>
                    </Group>
                    <Badge color="red" variant="filled">Risk Score: {parseInt(site.issues || site.risk_score)}</Badge>
                </Group>

                <Paper withBorder p="xs" bg="gray.0" mb="md">
                    <Group gap="xs" mb={5}>
                        <AlertCircle size={16} color="red" />
                        <Text size="sm" fw={500}>Detected Issues:</Text>
                    </Group>
                    <Stack gap={4} pl={24}>
                        <Text size="xs" c="dimmed">• Data Quality Index (DQI) below threshold</Text>
                        <Text size="xs" c="dimmed">• Multiple open safety or protocol signals</Text>
                    </Stack>
                </Paper>

                <Group grow>
                    <Button 
                        variant="light" 
                        color="blue" 
                        leftSection={<Phone size={14}/>}
                        size="xs"
                        onClick={() => alert(`Log call for ${site.site}`)}
                    >
                        Log Call
                    </Button>
                    <Button 
                        variant="filled" 
                        color="violet" 
                        leftSection={<Mail size={14}/>} 
                        size="xs"
                        onClick={handleDraftEmail} // This triggers your Gemini/OpenAI Agent
                    >
                        Draft Escalation
                    </Button>
                </Group>
            </Paper>
        ))}
        
        {/* EMPTY STATE / COMPLIANT PLACEHOLDER */}
        {mySites.length < 3 && (
            <Paper withBorder radius="md" p="md" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', minHeight: '200px' }}>
                <Stack align="center" gap="xs">
                    <CheckCircle size={32} color="green" style={{ opacity: 0.5 }} />
                    <Text c="dimmed" size="sm">All other assigned sites are compliant.</Text>
                </Stack>
            </Paper>
        )}
      </div>
    </div>
  );
}