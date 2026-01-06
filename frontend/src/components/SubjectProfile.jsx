// src/components/SubjectProfile.jsx
import { useEffect, useState } from 'react';
import { 
  Modal, Tabs, Text, Badge, Timeline, Table, Group, Card, 
  LoadingOverlay, Alert, Center, Loader, Stack 
} from '@mantine/core';
import { Activity, AlertTriangle, FileWarning, Calendar, User, Info } from 'lucide-react';
import api from  "../api/client"
export default function SubjectProfile({ opened, onClose, study, subjectId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (opened && subjectId) {
      setLoading(true);
      setError(null);
      // We don't clear data immediately to prevent flashing

      const encodedId = encodeURIComponent(subjectId);

      api.get(`/api/analytics/subject-details?study=${study}&subject_id=${encodedId}`)
        .then(res => {
            if (res.data.error) {
                setError(res.data.error);
            } else {
                setData(res.data);
            }
        })
        .catch(err => {
            console.error(err);
            setError("Could not load patient details.");
        })
        .finally(() => setLoading(false));
    }
  }, [opened, subjectId, study]);

  // Helper to prevent crashes
  const getList = (list) => (Array.isArray(list) ? list : []);

  return (
    <Modal 
        opened={opened} 
        onClose={onClose} 
        // 🚀 FIX: FORCE MODAL TO FRONT (High Z-Index)
        zIndex={10000}
        title={
            <Group>
                <User size={18} />
                <Text fw={700}>Patient Profile: {subjectId}</Text>
            </Group>
        }
        size="lg"
        centered
        overlayProps={{ opacity: 0.5, blur: 3 }}
    >
      <div style={{ position: 'relative', minHeight: '350px' }}>
        
        {/* Loading Overlay (Lower Z-Index than Modal) */}
        <LoadingOverlay 
            visible={loading} 
            zIndex={100} 
            overlayProps={{ radius: "sm", blur: 1 }} 
            loaderProps={{ color: 'blue', type: 'bars' }}
        />

        {/* ERROR STATE */}
        {error && (
            <Center h={300}>
                <Alert icon={<Info size={16}/>} title="Error" color="red" variant="light">
                    {error}
                </Alert>
            </Center>
        )}

        {/* LOADING STATE (Initial) */}
        {loading && !data && (
            <Center h={300}>
                <Stack align="center">
                    <Loader size="lg" color="blue" />
                    <Text c="dimmed" size="sm">Fetching clinical data...</Text>
                </Stack>
            </Center>
        )}

        {/* DATA LOADED */}
        {data && (
            <>
                {/* 1. HEADER METRICS */}
                <Group grow mb="md" mt="xs">
                    <Card withBorder padding="xs" radius="md">
                        <Text size="xs" c="dimmed" tt="uppercase">Status</Text>
                        <Badge color={data.status === 'Active' ? 'blue' : 'gray'}>
                            {data.status || 'Unknown'}
                        </Badge>
                    </Card>
                    <Card withBorder padding="xs" radius="md">
                        <Text size="xs" c="dimmed" tt="uppercase">Safety Signals</Text>
                        <Text fw={700} c={(data.metrics?.sae_count || 0) > 0 ? 'red' : 'dimmed'}>
                            {data.metrics?.sae_count || 0} SAEs
                        </Text>
                    </Card>
                    <Card withBorder padding="xs" radius="md">
                        <Text size="xs" c="dimmed" tt="uppercase">Data Quality</Text>
                        <Text fw={700} c={(data.metrics?.missing_count || 0) > 0 ? 'orange' : 'green'}>
                            {data.metrics?.missing_count || 0} Missing Pages
                        </Text>
                    </Card>
                </Group>

                {/* 2. TABS */}
                <Tabs defaultValue="missing" keepMounted={false}>
                    <Tabs.List>
                        <Tabs.Tab value="missing" leftSection={<FileWarning size={14}/>}>Missing Data</Tabs.Tab>
                        <Tabs.Tab value="deviations" leftSection={<AlertTriangle size={14}/>}>Deviations</Tabs.Tab>
                        <Tabs.Tab value="timeline" leftSection={<Calendar size={14}/>}>Visit Timeline</Tabs.Tab>
                    </Tabs.List>

                    {/* MISSING PAGES */}
                    <Tabs.Panel value="missing" pt="md">
                        {getList(data.data?.missing_pages).length === 0 ? (
                            <Alert color="green" variant="light" title="Compliance Check">
                                No missing data pages reported.
                            </Alert>
                        ) : (
                            <Table striped highlightOnHover>
                                <Table.Thead><Table.Tr><Table.Th>Form Name</Table.Th><Table.Th>Visit Date</Table.Th><Table.Th>Status</Table.Th></Table.Tr></Table.Thead>
                                <Table.Tbody>
                                    {getList(data.data?.missing_pages).map((r, i) => (
                                        <Table.Tr key={i}>
                                            <Table.Td>{r.form}</Table.Td>
                                            <Table.Td>{r.date}</Table.Td>
                                            <Table.Td><Badge color="red" variant="light">{r.lag} days overdue</Badge></Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        )}
                    </Tabs.Panel>

                    {/* DEVIATIONS */}
                    <Tabs.Panel value="deviations" pt="md">
                         {getList(data.data?.deviations).length === 0 ? (
                            <Alert color="green" variant="light" title="Protocol Compliance">
                                No protocol deviations recorded.
                            </Alert>
                        ) : (
                            <Table striped highlightOnHover>
                                <Table.Thead><Table.Tr><Table.Th>Category</Table.Th><Table.Th>Status</Table.Th></Table.Tr></Table.Thead>
                                <Table.Tbody>
                                    {getList(data.data?.deviations).map((r, i) => (
                                        <Table.Tr key={i}>
                                            <Table.Td>{r.category}</Table.Td>
                                            <Table.Td><Badge color="orange" variant="outline">{r.status}</Badge></Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        )}
                    </Tabs.Panel>

                    {/* TIMELINE */}
                    <Tabs.Panel value="timeline" pt="md">
                        <Timeline active={1} bulletSize={24} lineWidth={2} mt="sm">
                             {getList(data.data?.timeline).map((item, i) => (
                                <Timeline.Item key={i} title={item.visit} bullet={<Calendar size={14}/>}>
                                    <Text c="dimmed" size="xs">Projected: {item.date}</Text>
                                    {item.overdue_by > 0 && <Badge size="xs" color="red" mt={4}>Overdue by {item.overdue_by} days</Badge>}
                                </Timeline.Item>
                             ))}
                        </Timeline>
                    </Tabs.Panel>
                </Tabs>
            </>
        )}
      </div>
    </Modal>
  );
}