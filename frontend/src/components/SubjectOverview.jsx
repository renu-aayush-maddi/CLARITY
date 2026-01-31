import { useEffect, useState } from 'react';
import { Card, SimpleGrid, Title, Text, Group, ThemeIcon, Skeleton, RingProgress, Stack, Grid, Accordion, Badge, TextInput, NumberInput, SegmentedControl, Flex, Box, Tooltip, ActionIcon } from '@mantine/core';
import { Users, AlertCircle, Search, Filter, Info } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import api from '../api/client';

export default function SubjectOverview({ study }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // FILTERS STATE (Moved to top to fix Hooks error)
    const [searchSite, setSearchSite] = useState('');
    const [minSubjects, setMinSubjects] = useState(0);
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        if (!study) return;
        setLoading(true);
        api.get(`/api/analytics/subject-overview?study=${study}`)
            .then(res => setData(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [study]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    if (loading) return (
        <div style={{ padding: '20px' }}>
            <Skeleton height={50} mb="xl" />
            <SimpleGrid cols={3}>
                <Skeleton height={200} />
                <Skeleton height={200} />
                <Skeleton height={200} />
            </SimpleGrid>
        </div>
    );

    // Transform status dict to array for Recharts
    const statusData = data?.status_distribution
        ? Object.entries(data.status_distribution).map(([name, value]) => ({ name, value }))
        : [];

    // FILTER LOGIC
    const filteredSites = data?.site_breakdown?.map(site => {
        // 1. Filter Subjects within Site
        const filteredSubjects = site.subjects.filter(sub => {
            if (statusFilter === 'All') return true;
            if (statusFilter === 'Active') return sub.status === 'Active';
            if (statusFilter === 'Inactive') return sub.status !== 'Active'; // Assume anything not Active is Inactive/Withdrawn
            return true;
        });

        return {
            ...site,
            subjects: filteredSubjects,
            displayCount: filteredSubjects.length
        };
    }).filter(site => {
        // 2. Filter Sites
        const matchesName = site.site_id.toLowerCase().includes(searchSite.toLowerCase());
        const matchesCount = site.displayCount >= (parseInt(minSubjects) || 0);
        const hasSubjects = site.displayCount > 0; // Hide sites if filter leaves them empty? Optional, but cleaner.

        return matchesName && matchesCount && hasSubjects;
    }) || [];

    // Calculate total for percentages if needed, but Recharts handles pie slices

    return (
        <div style={{ padding: '20px' }}>
            <Title order={2} mb="lg">Subject Overview: {study}</Title>

            <Grid gutter="md">

                {/* 1. Total Subjects Card */}
                <Grid.Col span={{ base: 12, sm: 4 }}>
                    <Card withBorder radius="md" h="100%" p="xl" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <ThemeIcon size={60} radius="xl" variant="light" color="blue" mb="md">
                            <Users size={32} />
                        </ThemeIcon>
                        <Text size="xl" fw={700} c="dimmed" tt="uppercase">Total Subjects</Text>
                        <Text fz={48} fw={900}>{data?.total_subjects || 0}</Text>
                    </Card>
                </Grid.Col>

                {/* 2. Status Distribution */}
                <Grid.Col span={{ base: 12, sm: 4 }}>
                    <Card withBorder radius="md" h="100%" p="md">
                        <Title order={5} mb="md" ta="center">Status Distribution</Title>
                        <div style={{ height: 200, width: '100%', minHeight: 0 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%" cy="50%"
                                        innerRadius={50}
                                        outerRadius={70}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <Group justify="center" gap="xs" mt="xs">
                            {statusData.map((entry, index) => (
                                <Group key={entry.name} gap={5}>
                                    <div style={{ width: 8, height: 8, backgroundColor: COLORS[index % COLORS.length], borderRadius: '50%' }} />
                                    <Text size="xs">{entry.name}: {entry.value}</Text>
                                </Group>
                            ))}
                        </Group>
                    </Card>
                </Grid.Col>

                {/* 3. Risk Overview */}
                <Grid.Col span={{ base: 12, sm: 4 }}>
                    <Card withBorder radius="md" h="100%" p="md">
                        <Title order={5} mb="xl" ta="center">Risk Distribution</Title>

                        {/* Calculate percentages for the ring */}
                        <Stack align="center" justify="center">
                            <RingProgress
                                size={140}
                                thickness={12}
                                roundCaps
                                label={<Text align="center" fw={700}>Risk Levels</Text>}
                                sections={[
                                    { value: (data?.risk_distribution?.High || 0) / (data?.total_subjects || 1) * 100, color: 'red', tooltip: 'High Risk' },
                                    { value: (data?.risk_distribution?.Medium || 0) / (data?.total_subjects || 1) * 100, color: 'orange', tooltip: 'Medium Risk' },
                                    { value: (data?.risk_distribution?.Low || 0) / (data?.total_subjects || 1) * 100, color: 'green', tooltip: 'Low Risk' },
                                ]}
                            />
                            <Group gap="lg" mt="sm">
                                <Stack gap={0} align="center">
                                    <Text fw={700} c="red">{data?.risk_distribution?.High || 0}</Text>
                                    <Text size="xs" c="dimmed">High</Text>
                                </Stack>
                                <Stack gap={0} align="center">
                                    <Text fw={700} c="orange">{data?.risk_distribution?.Medium || 0}</Text>
                                    <Text size="xs" c="dimmed">Medium</Text>
                                </Stack>
                                <Stack gap={0} align="center">
                                    <Text fw={700} c="green">{data?.risk_distribution?.Low || 0}</Text>
                                    <Text size="xs" c="dimmed">Low</Text>
                                </Stack>
                            </Group>
                        </Stack>
                    </Card>
                </Grid.Col>

                {/* 4. Top Deviations (Full Width) */}
                <Grid.Col span={12}>
                    <Card withBorder radius="md" p="md" mt="md">
                        <Group mb="md" gap="xs">
                            <Title order={4}>Top Protocol Deviation Categories</Title>
                            <Tooltip label="Shows the 5 most frequent deviation categories. 'Uncategorized' represents deviations with missing category data." withArrow position="top" w={220} multiline>
                                <ActionIcon variant="subtle" color="gray" size="sm" radius="xl">
                                    <Info size={16} />
                                </ActionIcon>
                            </Tooltip>
                        </Group>
                        {(!data?.top_deviations || data.top_deviations.length === 0) ? (
                            <Text c="dimmed">No deviations recorded.</Text>
                        ) : (
                            <SimpleGrid cols={{ base: 1, sm: 3, md: 5 }}>
                                {data.top_deviations.map((dev, i) => (
                                    <Card key={i} withBorder padding="sm" radius="md" bg="gray.0">
                                        <Group justify="space-between" align="start">
                                            <div>
                                                <ThemeIcon color="orange" variant="light" size="sm" mb={4}><AlertCircle size={14} /></ThemeIcon>
                                                <Text size="xs" fw={500} lineClamp={2} title={dev.category}>{dev.category || "Uncategorized"}</Text>
                                            </div>
                                            <Text fw={700} size="xl" c="blue">{dev.count}</Text>
                                        </Group>
                                    </Card>
                                ))}
                            </SimpleGrid>
                        )}
                    </Card>
                </Grid.Col>

                {/* 5. Enrollment by Site (Breakdown) */}
                <Grid.Col span={12}>
                    <Card withBorder radius="md" p="md" mt="md">
                        <Group justify="space-between" mb="md">
                            <Title order={4}>Enrollment by Site</Title>
                        </Group>

                        {/* FILTER BAR */}
                        <Card withBorder radius="md" p="sm" mb="md" bg="gray.0">
                            <Flex gap="md" align="flex-end" wrap="wrap">
                                <TextInput
                                    label="Search Site"
                                    placeholder="e.g. Site 4"
                                    leftSection={<Search size={14} />}
                                    value={searchSite}
                                    onChange={(e) => setSearchSite(e.currentTarget.value)}
                                    style={{ flex: 1, minWidth: '200px' }}
                                />
                                <NumberInput
                                    label="Min Subjects"
                                    placeholder="0"
                                    min={0}
                                    value={minSubjects}
                                    onChange={setMinSubjects}
                                    w={120}
                                />
                                <Box>
                                    <Text size="xs" fw={500} mb={3}>Status Filter</Text>
                                    <SegmentedControl
                                        value={statusFilter}
                                        onChange={setStatusFilter}
                                        data={[
                                            { label: 'All', value: 'All' },
                                            { label: 'Active', value: 'Active' },
                                            { label: 'Inactive', value: 'Inactive' }
                                        ]}
                                    />
                                </Box>
                            </Flex>
                        </Card>

                        {filteredSites.length === 0 ? (
                            <Text c="dimmed" align="center" py="xl">No sites match your filters.</Text>
                        ) : (
                            <Accordion variant="separated" radius="md">
                                {filteredSites.map(site => (
                                    <Accordion.Item key={site.site_id} value={site.site_id}>
                                        <Accordion.Control>
                                            <Group justify="space-between" pr="md">
                                                <Group gap="sm">
                                                    <ThemeIcon color="grape" variant="light"><Users size={16} /></ThemeIcon>
                                                    <Text fw={600}>{site.site_id}</Text>
                                                </Group>
                                                <Badge variant="light" color="blue" size="lg">{site.displayCount} Subjects</Badge>
                                            </Group>
                                        </Accordion.Control>
                                        <Accordion.Panel>
                                            <SimpleGrid cols={{ base: 2, md: 4, lg: 6 }} spacing="xs">
                                                {site.subjects.map(sub => (
                                                    <Card key={sub.subject_id} withBorder padding="xs" radius="sm">
                                                        <Group gap={8} align="center" wrap="nowrap">
                                                            <div style={{
                                                                minWidth: 8, height: 8, borderRadius: '50%',
                                                                backgroundColor: sub.status === 'Active' ? 'var(--mantine-color-green-5)' : 'var(--mantine-color-gray-5)'
                                                            }} />
                                                            <Stack gap={0} style={{ overflow: 'hidden' }}>
                                                                <Text size="xs" fw={700} truncate>{sub.subject_id}</Text>
                                                                <Text size="10px" c="dimmed" truncate>{sub.status || 'Unknown'}</Text>
                                                            </Stack>
                                                        </Group>
                                                    </Card>
                                                ))}
                                            </SimpleGrid>
                                        </Accordion.Panel>
                                    </Accordion.Item>
                                ))}
                            </Accordion>
                        )}
                    </Card>
                </Grid.Col>
            </Grid>
        </div>
    );
}
