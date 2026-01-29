import { Card, Text, Center, Badge, Group, Tooltip as MantineTooltip } from '@mantine/core';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function RiskChart({ data, loading }) {
  const getBarColor = (score) => {
      if (score === 0) return "#fa5252"; 
      if (score < 70) return "#fa5252";
      if (score < 85) return "#fab005";
      return "#40c057";
  };

  return (
    // FIX 1: Use style={{ minHeight }} instead of minH prop to fix React warning
    <Card withBorder shadow="sm" radius="md" padding="lg" h="100%" style={{ minHeight: '400px' }}>
      <Group justify="space-between" mb="lg">
          <div>
            <Text fw={600} size="lg">DQI Leaderboard</Text>
            <Text c="dimmed" size="xs">Prioritized by DQI Score (0-100)</Text>
          </div>
          <Badge variant="light" color="gray">Top Risks</Badge>
      </Group>
      
      {loading ? (
         <div style={{ flex: 1, backgroundColor: '#f1f3f5', borderRadius: '8px', animation: 'pulse 1.5s infinite', minHeight: '300px' }} />
      ) : (!data || data.length === 0) ? (
         <Center h={300}>
             <Text c="dimmed">No Risky Sites Detected</Text>
         </Center>
      ) : (
        // FIX 2: Force a defined height on this container div so Recharts doesn't calculate -1
        <div style={{ width: '100%', height: '300px', minHeight: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e9ecef" />
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis dataKey="site" type="category" width={80} tick={{ fontSize: 12, fill: '#495057' }} />
              
              <Tooltip 
                cursor={{ fill: '#f8f9fa' }} 
                content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                            <div style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                <Text fw={700}>{d.site}</Text>
                                <Text size="sm">DQI Score: {d.dqi_score}</Text>
                                <Text size="xs" c="red" fw={500} mt={4}>Primary Drag: {d.primary_issue}</Text>
                            </div>
                        );
                    }
                    return null;
                }}
              />

              <Bar dataKey="dqi_score" barSize={30} radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.dqi_score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}