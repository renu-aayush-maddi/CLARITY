import { useState, useEffect } from 'react';
import { Paper, Title, Text, Table, Badge, Group, Code, Loader, ThemeIcon } from '@mantine/core';
import { Database, FileSpreadsheet, CheckCircle, AlertTriangle } from 'lucide-react';
import axios from 'axios';

export default function DataSources() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRealDataStats() {
        try {
            // CALLING THE REAL BACKEND
            const res = await axios.get('http://127.0.0.1:8000/api/analytics/data-lineage');
            setTables(res.data);
        } catch (e) {
            console.error("Failed to fetch data stats", e);
        } finally {
            setLoading(false);
        }
    }
    fetchRealDataStats();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <Group mb="xl">
        <ThemeIcon size="xl" radius="md" variant="light" color="blue">
            <Database size={24} />
        </ThemeIcon>
        <div>
            <Title order={2}>Data Governance & Lineage</Title>
            <Text c="dimmed">Live view of ingested datasets and record counts.</Text>
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
                </Table.Tbody>
            </Table>
        )}
      </Paper>
    </div>
  );
}