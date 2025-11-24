
// src/components/dashboard/sales-chart.tsx
'use client';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { mockSalesData } from '@/lib/mock-data';

export default function SalesChart() {
    const data = mockSalesData;
    return (
        <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
            <XAxis
            dataKey="name"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            />
            <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value / 1000}k`}
            />
             <Tooltip 
                contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))' 
                }}
            />
            <Line
            type="monotone"
            dataKey="revenue"
            strokeWidth={2}
            stroke="hsl(var(--primary))"
            />
            <Line
            type="monotone"
            dataKey="subscriptions"
            strokeWidth={2}
            stroke="hsl(var(--secondary))"
            />
        </LineChart>
        </ResponsiveContainer>
    );
}
