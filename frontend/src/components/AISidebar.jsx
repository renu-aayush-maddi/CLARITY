// src/components/AISidebar.jsx
import { Paper, Text, Group, ThemeIcon, Loader, Button, Stack, Divider, Badge } from '@mantine/core';
import { Sparkles, Lightbulb, RefreshCw, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; 

export default function AISidebar({ siteId, analysis, loading, onRefresh }) {
  if (!siteId) return null;

  return (
    <Paper 
      p="md" 
      radius="md" 
      withBorder 
      style={{ 
        height: '100%', 
        backgroundColor: '#fff', 
        display: 'flex', 
        flexDirection: 'column' 
      }}
    >
      <Group justify="space-between" mb="md">
        <Group gap="xs">
            <ThemeIcon variant="light" color="violet" size="lg">
                <Sparkles size={18} />
            </ThemeIcon>
            <div>
                <Text size="sm" fw={700}>Clarity Insight</Text>
                <Text size="xs" c="dimmed">AI Risk Analysis</Text>
            </div>
        </Group>
        <Button variant="subtle" size="xs" onClick={onRefresh} loading={loading}>
            <RefreshCw size={14} />
        </Button>
      </Group>

      <Divider mb="md" />

      {loading ? (
        <Stack align="center" justify="center" h={200}>
            <Loader size="sm" color="violet" />
            <Text size="xs" c="dimmed">Analyzing lab & entry patterns...</Text>
        </Stack>
      ) : analysis ? (
        <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#343a40' }}>
            <ReactMarkdown>{analysis}</ReactMarkdown>
        </div>
      ) : (
        <Stack align="center" justify="center" h={200}>
             <FileText size={32} color="#dee2e6" />
             <Text size="sm" c="dimmed" ta="center">Select a site to generate <br/> an AI risk assessment.</Text>
        </Stack>
      )}

      {/* Static Footer (Agentic Capability) */}
      <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
         <Paper withBorder p="sm" radius="md" bg="orange.0" style={{ border: '1px dashed #fcc419' }}>
            <Group gap="xs" mb={5}>
                <Lightbulb size={16} color="orange" />
                <Text size="xs" fw={700} c="orange.9">Agent Logic</Text>
            </Group>
            <Text size="xs" c="dimmed">
                This analysis queried 3 database tables (Missing Pages, Labs, Inactivated Forms) to detect these patterns.
            </Text>
         </Paper>
      </div>
    </Paper>
  );
}