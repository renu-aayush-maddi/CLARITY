import { useState, useEffect } from 'react';
import { 
  Paper, Title, Text, Group, Grid, RingProgress, 
  Timeline, ThemeIcon, Code, Badge, ScrollArea, Loader 
} from '@mantine/core';
import { 
  BrainCircuit, ShieldCheck, Activity, Terminal, 
  CheckCircle, XCircle, Clock 
} from 'lucide-react';
import axios from 'axios';

export default function AIGovernance() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Poll for logs every 5 seconds (Live Feed effect)
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/analytics/ai-governance');
        setLogs(res.data.logs);
        setStats(res.data.stats);
        setLoading(false);
      } catch (e) {
        console.error("Audit Log Error:", e);
      }
    };

    fetchLogs(); // Initial call
    const interval = setInterval(fetchLogs, 5000); // Polling
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      
      {/* HEADER */}
      <Group mb="xl">
        <ThemeIcon size={40} radius="md" variant="light" color="cyan">
            <BrainCircuit size={24} />
        </ThemeIcon>
        <div>
            <Title order={2}>AI Governance & Traceability</Title>
            <Text c="dimmed">Real-time audit trail of all Agentic decisions and SQL generation.</Text>
        </div>
      </Group>

      {/* KPI METRICS */}
      <Grid mb="xl">
        <Grid.Col span={4}>
            <Paper withBorder p="md" radius="md">
                <Group justify="space-between">
                    <div>
                        <Text c="dimmed" size="xs" tt="uppercase" fw={700}>System Health</Text>
                        <Text fw={700} size="xl">Operational</Text>
                    </div>
                    <ThemeIcon color="green" variant="light"><ShieldCheck size={20}/></ThemeIcon>
                </Group>
                <Text size="xs" c="green" mt="sm">All guardrails active</Text>
            </Paper>
        </Grid.Col>
        <Grid.Col span={4}>
            <Paper withBorder p="md" radius="md">
                 <Group justify="space-between">
                    <div>
                        <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Total Interactions</Text>
                        <Text fw={700} size="xl">{stats?.total_calls || 0}</Text>
                    </div>
                    <ThemeIcon color="blue" variant="light"><Activity size={20}/></ThemeIcon>
                </Group>
                 <Text size="xs" c="dimmed" mt="sm">Avg Latency: {stats?.avg_latency || '-'}</Text>
            </Paper>
        </Grid.Col>
        <Grid.Col span={4}>
             <Paper withBorder p="md" radius="md">
                 <Group justify="space-between">
                    <div>
                        <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Token Consumption</Text>
                        <Text fw={700} size="xl">{stats?.tokens_used || 0}</Text>
                    </div>
                    <RingProgress 
                        size={40} thickness={4} 
                        sections={[{ value: 40, color: 'violet' }]} 
                    />
                </Group>
                 <Text size="xs" c="dimmed" mt="sm">Est. Cost: $0.02</Text>
            </Paper>
        </Grid.Col>
      </Grid>

      {/* LIVE AUDIT LOG */}
      <Grid>
        <Grid.Col span={12}>
            <Paper withBorder p="md" radius="md">
                <Title order={4} mb="lg">Live Inference Log</Title>
                
                {loading ? <Loader /> : (
                    <ScrollArea h={500} offsetScrollbars>
                        <Timeline active={logs.length} bulletSize={24} lineWidth={2}>
                            {logs.map((log) => (
                                <Timeline.Item 
                                    key={log.id} 
                                    bullet={log.status === 'Success' ? <CheckCircle size={12}/> : <XCircle size={12}/>}
                                    color={log.status === 'Success' ? 'green' : 'red'}
                                    title={
                                        <Group gap="xs">
                                            <Text size="sm" fw={600}>{log.agent}</Text>
                                            <Badge size="xs" variant="outline">{log.timestamp}</Badge>
                                            <Badge size="xs" color="gray" leftSection={<Clock size={10}/>}>{log.latency}</Badge>
                                        </Group>
                                    }
                                >
                                    <Text color="dimmed" size="sm" mt={4}>User Prompt:</Text>
                                    <Paper bg="gray.0" p="xs" radius="sm" mb="xs">
                                        <Text size="sm" style={{fontStyle: 'italic'}}>"{log.input}"</Text>
                                    </Paper>

                                    <Text color="dimmed" size="sm">System Output (Trace):</Text>
                                    <Code block color="blue" mt={4}>
                                        {log.output}
                                    </Code>
                                </Timeline.Item>
                            ))}
                            {logs.length === 0 && <Text c="dimmed">No AI activity recorded yet.</Text>}
                        </Timeline>
                    </ScrollArea>
                )}
            </Paper>
        </Grid.Col>
      </Grid>
    </div>
  );
}