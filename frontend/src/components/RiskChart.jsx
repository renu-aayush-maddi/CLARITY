import { Card, Text, Center } from '@mantine/core';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RiskChart({ data, loading }) {
  return (
    <Card withBorder shadow="sm" radius="md" padding="lg" h="100%" minH={400}>
      <Text fw={600} size="lg" mb="lg">🚨 Risk Analysis: Top Sites by Issues</Text>
      
      {loading ? (
         // Use a gray background as a skeleton placeholder
         <div style={{ flex: 1, backgroundColor: '#f1f3f5', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
      ) : (!data || data.length === 0) ? (
         <Center h={300}>
             <Text c="dimmed">No Data Available</Text>
         </Center>
      ) : (
        <div style={{ flex: 1, width: '100%', minHeight: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9ecef" />
              <XAxis dataKey="site" tick={{ fontSize: 12, fill: '#868e96' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#868e96' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f8f9fa' }} />
              <Bar dataKey="issues" fill="#fa5252" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}