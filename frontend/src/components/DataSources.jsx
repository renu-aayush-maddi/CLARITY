import { useState, useEffect } from 'react';
import { Paper, Title, Text, Table, Badge, Group, Code, Loader, ThemeIcon } from '@mantine/core';
import { Database, FileSpreadsheet, CheckCircle, AlertTriangle } from 'lucide-react';
import api from "../api/client";

// FIX: Destructure 'study' from props
export default function DataSources({ study }) {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRealDataStats() {
        setLoading(true);
        try {
            // FIX: Pass study param to backend
            const res = await api.get(`/api/analytics/data-lineage?study=${study}`);
            setTables(res.data);
        } catch (e) {
            console.error("Failed to fetch data stats", e);
        } finally {
            setLoading(false);
        }
    }
    // Only run if study is defined
    if (study) fetchRealDataStats();
  }, [study]); // Re-run when 'study' changes

  return (
    <div style={{ padding: '20px' }}>
      <Group mb="xl">
        <ThemeIcon size="xl" radius="md" variant="light" color="blue">
            <Database size={24} />
        </ThemeIcon>
        <div>
            <Title order={2}>Data Governance & Lineage</Title>
            <Text c="dimmed">Live view of ingested datasets for <span style={{fontWeight:700}}>{study}</span>.</Text>
        </div>
      </Group>

      <Paper withBorder radius="md" p="md">
        <Title order={4} mb="md">Ingested Datasets</Title>
        {loading ? (
            <Group justify="center" p="xl">
                <Loader type="dots" />
                <Text size="sm" c="dimmed">Scanning database...</Text>
            </Group>
        ) : (
            <Table striped highlightOnHover>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Table Name</Table.Th>
                        <Table.Th>Source Type</Table.Th>
                        <Table.Th>Record Count</Table.Th>
                        <Table.Th>Status</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {tables.map((t) => (
                        <Table.Tr key={t.name}>
                            <Table.Td><Code fw={700}>{t.name}</Code></Table.Td>
                            <Table.Td>
                                <Group gap="xs">
                                    <FileSpreadsheet size={14} color="gray"/>
                                    <Text size="sm">{t.type}</Text>
                                </Group>
                            </Table.Td>
                            <Table.Td style={{ fontWeight: 600 }}>{t.rows.toLocaleString()}</Table.Td>
                            <Table.Td>
                                {t.status === 'Error' ? (
                                    <Badge color="red" variant="light" leftSection={<AlertTriangle size={10}/>}>Error</Badge>
                                ) : (
                                    <Badge color="green" variant="light" leftSection={<CheckCircle size={10}/>}>Active</Badge>
                                )}
                            </Table.Td>
                        </Table.Tr>
                    ))}
                    {tables.length === 0 && (
                         <Table.Tr><Table.Td colSpan={4} align="center">No data found.</Table.Td></Table.Tr>
                    )}
                </Table.Tbody>
            </Table>
        )}
      </Paper>
    </div>
  );
}