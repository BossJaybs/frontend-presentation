'use client';

import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useData } from '@/contexts/data-context';

export function VehicleStatusChart() {
  const { vehicles } = useData();

  const data = [
    {
      name: 'Active',
      value: vehicles.filter(v => v.status === 'active').length,
    },
    {
      name: 'Maintenance',
      value: vehicles.filter(v => v.status === 'maintenance').length,
    },
    {
      name: 'Inactive',
      value: vehicles.filter(v => v.status === 'inactive').length,
    },
  ];

  const COLORS = ['#4f46e5', '#f59e0b', '#6b7280'];

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Vehicle Status</h2>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
