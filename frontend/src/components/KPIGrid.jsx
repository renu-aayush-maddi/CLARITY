// import { SimpleGrid, Card, Group, Text, ThemeIcon, Skeleton } from '@mantine/core';
// import { Users, AlertTriangle, FileWarning, Activity } from 'lucide-react';

// export default function KPIGrid({ kpis, loading }) {
//   const data = kpis || {};

//   const stats = [
//     { title: 'Total Subjects', value: data.total_subjects, icon: Users, color: 'blue' },
//     { title: 'Protocol Deviations', value: data.total_pds, icon: AlertTriangle, color: 'orange' },
//     { title: 'Missing Pages', value: data.total_missing_pages, icon: FileWarning, color: 'red' },
//     // 👇 RENAMED TITLE ONLY
//     { title: 'Study Health (DQI)', value: data.clean_patient_rate, icon: Activity, color: 'green' },
//   ];

//   return (
//     <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
//       {stats.map((stat) => (
//         <Card key={stat.title} withBorder shadow="sm" radius="md" padding="lg">
//           <Group justify="space-between" mb="xs">
//             <Text size="xs" c="dimmed" fw={700} tt="uppercase">
//               {stat.title}
//             </Text>
//             <ThemeIcon color={stat.color} variant="light" size="md">
//               <stat.icon size={16} />
//             </ThemeIcon>
//           </Group>
          
//           <Skeleton visible={loading} h={30} w={100} mt={5}>
//              <Text fw={700} size="xl">{stat.value ?? 0}</Text>
//           </Skeleton>
//         </Card>
//       ))}
//     </SimpleGrid>
//   );
// }


import { Users, AlertTriangle, FileWarning, Activity, Info } from 'lucide-react';
import { SimpleGrid, Card, Group, Text, ThemeIcon, Skeleton, RingProgress, Center, Tooltip as MantineTooltip } from '@mantine/core';

export default function KPIGrid({ kpis, loading }) {
  // Use the new 'study_health' object structure from the backend
  const data = kpis || {};

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
      
      {/* 1. READINESS METRIC (Strict Binary Clean Patient Rate) */}
      <Card withBorder shadow="sm" radius="md" padding="lg">
        <Group justify="space-between" mb="xs">
            <Text size="xs" c="dimmed" fw={700} tt="uppercase">Clean Patient Rate</Text>
            <ThemeIcon color="blue" variant="light"><Users size={16} /></ThemeIcon>
        </Group>
        <Group align="flex-end" gap="xs">
            <Skeleton visible={loading} h={40} w={100}>
                <Text fw={700} size="30px" c="blue">{data.clean_patient_rate || 0}%</Text>
            </Skeleton>
            <Text size="sm" c="dimmed" mb={5}>
                 ({data.clean_patients || 0}/{data.total_patients || 0})
            </Text>
        </Group>
        <Text size="xs" c={(data.clean_patient_rate || 0) > 80 ? "green" : "orange"} mt="sm" fw={500}>
            {data.readiness_status || "Calculating Status..."}
        </Text>
      </Card>

{/* 2. QUALITY METRIC (Weighted DQI Score) */}
<Card withBorder shadow="sm" radius="md" padding="xs">
  <Group>
      <RingProgress 
          size={80} 
          roundCaps 
          thickness={8} 
          sections={[{ value: data.avg_dqi_score || 0, color: (data.avg_dqi_score || 0) > 80 ? 'green' : 'red' }]} 
          label={
              <Center>
                  <ThemeIcon color="gray" variant="transparent"><Activity size={20}/></ThemeIcon>
              </Center>
      }
      />
      <div>
          <Group gap={5}>
             <Text size="xs" c="dimmed" fw={700} tt="uppercase">Avg DQI Score</Text>
             {/* THIS TOOLTIP SOLVES THE "BLACK BOX" CRITIQUE */}
             <MantineTooltip 
                label="DQI = (30% Visits) + (30% Compliance) + (25% Safety) + (15% Coding)" 
                multiline w={220} withArrow
             >
                <ThemeIcon size="xs" variant="transparent" color="gray" style={{cursor: 'help'}}>
                    <Info size={12}/>
                </ThemeIcon>
             </MantineTooltip>
          </Group>

          <Skeleton visible={loading} h={30} w={60}>
              <Text fw={700} size="xl">{data.avg_dqi_score || 0}</Text>
          </Skeleton>
          <Text size="xs" c="dimmed">Weighted Quality Index</Text>
      </div>
  </Group>
</Card>

      {/* 3. OPERATIONAL LAG (Missing Data) */}
      <Card withBorder shadow="sm" radius="md" padding="lg">
         <Group justify="space-between" mb="xs">
            <Text size="xs" c="dimmed" fw={700} tt="uppercase">Missing Data</Text>
            <ThemeIcon color="orange" variant="light"><FileWarning size={16} /></ThemeIcon>
        </Group>
        <Skeleton visible={loading} h={30} w={50}>
            {/* Fallback to 0 if total_missing_pages is undefined */}
            <Text fw={700} size="24px">{data.total_missing_pages !== undefined ? data.total_missing_pages : 0}</Text>
        </Skeleton>
        <Text size="xs" c="dimmed" mt={5}>Pages outstanding &gt; 30 days</Text>
      </Card>

      {/* 4. SAFETY ALERTS */}
      <Card withBorder shadow="sm" radius="md" padding="lg">
         <Group justify="space-between" mb="xs">
            <Text size="xs" c="dimmed" fw={700} tt="uppercase">Critical Safety</Text>
            <ThemeIcon color="red" variant="light"><AlertTriangle size={16} /></ThemeIcon>
        </Group>
        <Skeleton visible={loading} h={30} w={50}>
            <Text fw={700} size="24px" c="red">{data.critical_alerts || 0}</Text>
        </Skeleton>
        <Text size="xs" c="red" mt={5}>Open SAE Reviews</Text>
      </Card>

    </SimpleGrid>
  );
}