// src/components/Portfolio.jsx
import { useEffect, useState } from 'react';
import { Card, Table, Badge, Button, Group, Text, Title, ThemeIcon, Loader, Alert } from '@mantine/core';
import { LayoutGrid, ArrowRight, Activity, AlertTriangle, CheckCircle, Database } from 'lucide-react';
import api from '../api/client';

export default function Portfolio({ onSelectStudy }) {
    const [studies, setStudies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await api.get("/api/analytics/portfolio-summary");
                setStudies(res.data);
            } catch(e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const getStatusBadge = (status) => {
        if(status === 'Critical') return <Badge color="red" leftSection={<AlertTriangle size={12}/>}>Critical</Badge>;
        if(status === 'At Risk') return <Badge color="yellow" leftSection={<Activity size={12}/>}>At Risk</Badge>;
        return <Badge color="green" leftSection={<CheckCircle size={12}/>}>Ready</Badge>;
    };

    if (loading) return <Group justify="center" p="xl"><Loader size="lg"/></Group>;

    return (
        <div style={{ padding: '20px' }}>
            <Group mb="xl" justify="space-between">
                <Group>
                    <ThemeIcon size="xl" radius="md" variant="light" color="blue">
                        <LayoutGrid size={24} />
                    </ThemeIcon>
                    <div>
                        <Title order={2}>Global Trial Portfolio</Title>
                        <Text c="dimmed">Executive Oversight of {studies.length} Active Studies</Text>
                    </div>
                </Group>
            </Group>

            {/* GAP CLOSURE #3: Explicitly Handling Data Issues */}
            <Alert variant="light" color="gray" title="Data Integrity Monitor" icon={<Database size={14}/>} mb="lg">
                System automatically harmonized missing Site IDs by mapping them to their parent Studies via Subject ID relation.
            </Alert>

            <Card withBorder shadow="sm" radius="md" p={0}>
                <Table striped highlightOnHover verticalSpacing="md" horizontalSpacing="lg">
                    <Table.Thead bg="gray.0">
                        <Table.Tr>
                            <Table.Th>Study Protocol</Table.Th>
                            <Table.Th>Total Patients</Table.Th>
                            <Table.Th>Clean Patient Rate</Table.Th>
                            <Table.Th>Readiness Status</Table.Th>
                            <Table.Th>Action</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {studies.map((row) => (
                            <Table.Tr key={row.study_name}>
                                <Table.Td fw={700}>{row.study_name}</Table.Td>
                                <Table.Td>{row.total_patients}</Table.Td>
                                <Table.Td>
                                    <Text c={row.clean_patient_rate < 85 ? 'red' : 'green'} fw={700}>
                                        {row.clean_patient_rate}%
                                    </Text>
                                </Table.Td>
                                <Table.Td>{getStatusBadge(row.status)}</Table.Td>
                                <Table.Td>
                                    <Button 
                                        size="xs" 
                                        variant="light" 
                                        rightSection={<ArrowRight size={14}/>}
                                        onClick={() => onSelectStudy(row.study_name)}
                                    >
                                        Open Dashboard
                                    </Button>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                        {studies.length === 0 && (
                            <Table.Tr>
                                <Table.Td colSpan={5} align="center">
                                    <Text c="dimmed">No studies found. Please Ingest Data.</Text>
                                </Table.Td>
                            </Table.Tr>
                        )}
                    </Table.Tbody>
                </Table>
            </Card>
        </div>
    );
}