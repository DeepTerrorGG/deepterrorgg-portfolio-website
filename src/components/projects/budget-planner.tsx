'use client';

import React, { useState, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, TrendingUp, Wallet, Percent, Banknote } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '../ui/slider';

interface ExpenseItem {
  name: string;
  value: number;
  color: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19AF', '#19FFFF'];

const BudgetPlanner: React.FC = () => {
  const { toast } = useToast();
  
  // Expenses State
  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    { name: 'Rent', value: 1200, color: COLORS[0] },
    { name: 'Groceries', value: 400, color: COLORS[1] },
    { name: 'Utilities', value: 150, color: COLORS[2] },
  ]);
  const [expenseName, setExpenseName] = useState('');
  const [expenseValue, setExpenseValue] = useState('');

  // Income & Tax State
  const [income, setIncome] = useState(5000);
  const [taxRate, setTaxRate] = useState(22);

  // Investment State
  const [initialInvestment, setInitialInvestment] = useState(10000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [annualReturn, setAnnualReturn] = useState(7);
  const [projectionYears, setProjectionYears] = useState(20);

  // Memoized Calculations
  const totalExpenses = useMemo(() => expenses.reduce((sum, item) => sum + item.value, 0), [expenses]);
  const taxesPaid = useMemo(() => income * (taxRate / 100), [income, taxRate]);
  const netIncome = useMemo(() => income - taxesPaid, [income, taxRate]);
  const disposableIncome = useMemo(() => netIncome - totalExpenses, [netIncome, totalExpenses]);

  const investmentProjection = useMemo(() => {
    const data = [];
    let futureValue = initialInvestment;
    let totalContributions = initialInvestment;
    const monthlyReturnRate = Math.pow(1 + annualReturn / 100, 1 / 12) - 1;

    for (let year = 0; year <= projectionYears; year++) {
      data.push({
        year: `Year ${year}`,
        value: Math.round(futureValue),
        contributions: Math.round(totalContributions),
      });

      for (let month = 0; month < 12; month++) {
        futureValue = (futureValue + monthlyContribution) * (1 + monthlyReturnRate);
      }
      totalContributions += monthlyContribution * 12;
    }
    return data;
  }, [initialInvestment, monthlyContribution, annualReturn, projectionYears]);

  // Handler Functions
  const handleAddExpense = () => {
    const value = parseFloat(expenseValue);
    if (expenseName.trim() === '' || isNaN(value) || value <= 0) {
      toast({ title: 'Invalid Input', description: 'Please enter a valid expense name and a positive value.', variant: 'destructive' });
      return;
    }
    if (expenses.length >= COLORS.length) {
      toast({ title: 'Limit Reached', description: `You can only have ${COLORS.length} expense categories.`, variant: 'destructive' });
      return;
    }
    setExpenses([...expenses, { name: expenseName, value, color: COLORS[expenses.length % COLORS.length] }]);
    setExpenseName('');
    setExpenseValue('');
  };
  
  const handleDeleteExpense = (indexToDelete: number) => {
    setExpenses(prevData => prevData.filter((_, index) => index !== indexToDelete));
  };

  return (
    <ScrollArea className="w-full h-full bg-card">
      <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Row 1: Summary & Expenses */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <Card className="lg:col-span-2 shadow-lg">
                <CardHeader><CardTitle className="flex items-center gap-2"><Wallet/> Income & Cash Flow</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="income">Gross Monthly Income</Label>
                        <Input id="income" type="number" value={income} onChange={e => setIncome(parseFloat(e.target.value) || 0)} />
                    </div>
                     <div>
                        <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                        <div className="flex items-center gap-2">
                            <Slider id="tax-rate" min={0} max={50} step={1} value={[taxRate]} onValueChange={val => setTaxRate(val[0])} />
                            <span className="font-bold w-12 text-center">{taxRate}%</span>
                        </div>
                    </div>
                    <div className="space-y-2 pt-4 border-t">
                        <div className="flex justify-between"><span>Net Income:</span><span className="font-semibold">${netIncome.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
                        <div className="flex justify-between text-red-400"><span>- Expenses:</span><span className="font-semibold">${totalExpenses.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
                        <div className="flex justify-between text-lg font-bold border-t pt-2"><span>Disposable:</span><span className="text-green-400">${disposableIncome.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
                    </div>
                </CardContent>
            </Card>
            <Card className="lg:col-span-3 shadow-lg">
                 <CardHeader><CardTitle className="flex items-center gap-2"><Percent/> Monthly Expenses</CardTitle></CardHeader>
                 <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-[250px]">
                        {expenses.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={expenses} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                        {expenses.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : <div className="flex items-center justify-center h-full text-muted-foreground"><p>No expenses added.</p></div>}
                    </div>
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <Input placeholder="Expense Name" value={expenseName} onChange={e => setExpenseName(e.target.value)} />
                            <Input type="number" placeholder="Amount" value={expenseValue} onChange={e => setExpenseValue(e.target.value)} />
                            <Button onClick={handleAddExpense} size="icon"><Plus className="h-4 w-4" /></Button>
                        </div>
                        <ScrollArea className="h-[150px] border rounded-md p-2">
                            <ul className="space-y-2">
                                {expenses.map((item, index) => (
                                    <li key={index} className="flex items-center justify-between p-1 rounded-md bg-muted/50">
                                        <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} /><span>{item.name}</span></div>
                                        <div className="flex items-center gap-1"><span>${item.value.toLocaleString()}</span><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteExpense(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>
                                    </li>
                                ))}
                            </ul>
                        </ScrollArea>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Row 2: Investment Projections */}
        <Card className="shadow-lg">
            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp/> Investment Growth Projection</CardTitle></CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div>
                        <Label htmlFor="initial-inv">Initial Investment</Label>
                        <Input id="initial-inv" type="number" value={initialInvestment} onChange={e => setInitialInvestment(parseFloat(e.target.value) || 0)} />
                    </div>
                    <div>
                        <Label htmlFor="monthly-contr">Monthly Contribution</Label>
                        <Input id="monthly-contr" type="number" value={monthlyContribution} onChange={e => setMonthlyContribution(parseFloat(e.target.value) || 0)} />
                    </div>
                    <div>
                        <Label>Annual Return (%)</Label>
                         <div className="flex items-center gap-2">
                            <Slider min={0} max={20} step={0.5} value={[annualReturn]} onValueChange={val => setAnnualReturn(val[0])} />
                            <span className="font-bold w-16 text-center">{annualReturn}%</span>
                        </div>
                    </div>
                     <div>
                        <Label>Projection (Years)</Label>
                        <div className="flex items-center gap-2">
                            <Slider min={1} max={50} step={1} value={[projectionYears]} onValueChange={val => setProjectionYears(val[0])} />
                             <span className="font-bold w-12 text-center">{projectionYears}</span>
                        </div>
                    </div>
                </div>
                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={investmentProjection}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" />
                            <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => `$${(value as number / 1000)}k`} />
                            <Tooltip
                                formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name]}
                                contentStyle={{ background: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="contributions" name="Total Contributions" stroke="#8884d8" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="value" name="Projected Value" stroke="#82ca9d" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};

export default BudgetPlanner;
