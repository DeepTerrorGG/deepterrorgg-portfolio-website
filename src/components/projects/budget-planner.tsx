'use client';

import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';


interface BudgetItem {
  name: string;
  value: number;
  color: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19AF', '#19FFFF'];

const BudgetPlanner: React.FC = () => {
  const { toast } = useToast();
  const [data, setData] = useState<BudgetItem[]>([
    { name: 'Rent', value: 1200, color: COLORS[0] },
    { name: 'Groceries', value: 400, color: COLORS[1] },
    { name: 'Utilities', value: 150, color: COLORS[2] },
    { name: 'Transport', value: 100, color: COLORS[3] },
  ]);

  const [itemName, setItemName] = useState('');
  const [itemValue, setItemValue] = useState('');

  const handleAddItem = () => {
    const value = parseFloat(itemValue);
    if (itemName.trim() === '' || isNaN(value) || value <= 0) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter a valid name and a positive value.',
        variant: 'destructive',
      });
      return;
    }
    if (data.length >= COLORS.length) {
      toast({
        title: 'Limit Reached',
        description: `You can only have ${COLORS.length} categories.`,
        variant: 'destructive',
      });
      return;
    }
    setData([...data, { name: itemName, value, color: COLORS[data.length % COLORS.length] }]);
    setItemName('');
    setItemValue('');
  };
  
  const handleDeleteItem = (indexToDelete: number) => {
    setData(prevData => prevData.filter((_, index) => index !== indexToDelete));
  };
  
  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);


  return (
    <div className="flex items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 w-full max-w-6xl mx-auto">
        
        {/* Chart Section */}
        <Card className="lg:col-span-3 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center font-bold text-primary">Budget Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
             {data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius="80%"
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                            const RADIAN = Math.PI / 180;
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);

                            return (
                            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                                {`${(percent * 100).toFixed(0)}%`}
                            </text>
                            );
                        }}
                        >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                background: 'hsl(var(--background))',
                                borderColor: 'hsl(var(--border))',
                                borderRadius: 'var(--radius)'
                            }}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>No data to display. Add some items to see your budget.</p>
                </div>
             )}
          </CardContent>
        </Card>
        
        {/* Controls and List Section */}
        <Card className="lg:col-span-2 shadow-lg flex flex-col">
          <CardHeader>
            <CardTitle className="text-2xl text-center font-bold text-primary">Manage Expenses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-grow flex flex-col">
             <div className="flex gap-2">
              <Input
                placeholder="Item Name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Amount"
                value={itemValue}
                onChange={(e) => setItemValue(e.target.value)}
              />
              <Button onClick={handleAddItem} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="flex-grow border rounded-md p-2">
                <ul className="space-y-2">
                    {data.map((item, index) => (
                        <li key={index} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                                <span>{item.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                               <span>${item.value.toLocaleString()}</span>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteItem(index)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                           </div>
                        </li>
                    ))}
                </ul>
            </ScrollArea>
             <div className="pt-4 border-t text-lg font-bold text-right">
                Total: ${total.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BudgetPlanner;
