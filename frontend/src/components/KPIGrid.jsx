import { SimpleGrid, Card, Group, Text, ThemeIcon, Skeleton } from '@mantine/core';
import { Users, AlertTriangle, FileWarning, Activity } from 'lucide-react';

export default function KPIGrid({ kpis, loading }) {
  const data = kpis || {};

  const stats = [
    { title: 'Total Subjects', value: data.total_subjects, icon: Users, color: 'blue' },
    { title: 'Protocol Deviations', value: data.total_pds, icon: AlertTriangle, color: 'orange' },
    { title: 'Missing Pages', value: data.total_missing_pages, icon: FileWarning, color: 'red' },
    // 👇 RENAMED TITLE ONLY
    { title: 'Study Health (DQI)', value: data.clean_patient_rate, icon: Activity, color: 'green' },
  ];

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
      {stats.map((stat) => (
        <Card key={stat.title} withBorder shadow="sm" radius="md" padding="lg">
          <Group justify="space-between" mb="xs">
            <Text size="xs" c="dimmed" fw={700} tt="uppercase">
              {stat.title}
            </Text>
            <ThemeIcon color={stat.color} variant="light" size="md">
              <stat.icon size={16} />
            </ThemeIcon>
          </Group>
          
          <Skeleton visible={loading} h={30} w={100} mt={5}>
             <Text fw={700} size="xl">{stat.value ?? 0}</Text>
          </Skeleton>
        </Card>
      ))}
    </SimpleGrid>
  );
}