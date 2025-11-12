'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StockDataPoint {
  time: number;
  price: number;
}

interface Stock {
  name: string;
  symbol: string;
  data: StockDataPoint[];
  color: string;
}

const initialStocks: Stock[] = [
  { name: 'Alpha Co.', symbol: 'AC', data: [{ time: Date.now(), price: 150 }], color: '#8884d8' },
  { name: 'Beta Inc.', symbol: 'BI', data: [{ time: Date.now(), price: 200 }], color: '#82ca9d' },
  { name: 'Gamma Ltd.', symbol: 'GL', data: [{ time: Date.now(), price: 120 }], color: '#ffc658' },
];

const MAX_DATA_POINTS = 20;

const StockTracker: React.FC = () => {
  const { toast } = useToast();
  const [stocks, setStocks] = useState<Stock[]>(initialStocks);
  const [isTracking, setIsTracking] = useState(true);

  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(() => {
      setStocks(prevStocks => 
        prevStocks.map(stock => {
          const lastPrice = stock.data[stock.data.length - 1].price;
          const change = (Math.random() - 0.5) * (lastPrice * 0.05); // +/- 5%
          const newPrice = Math.max(10, lastPrice + change); // Min price of 10
          
          const newData = [...stock.data, { time: Date.now(), price: newPrice }];
          if (newData.length > MAX_DATA_POINTS) {
            newData.shift(); // Remove oldest data point
          }

          return { ...stock, data: newData };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [isTracking]);

  const toggleTracking = () => {
    setIsTracking(!isTracking);
    toast({
        title: isTracking ? "Tracking Paused" : "Tracking Resumed",
    });
  };

  const formattedData = useMemo(() => {
    const allTimestamps = [...new Set(stocks.flatMap(s => s.data.map(d => d.time)))].sort();
    
    return allTimestamps.map(time => {
      const entry: { [key: string]: number | string } = {
        time,
        timeLabel: new Date(time).toLocaleTimeString(),
      };
      stocks.forEach(stock => {
        const dataPoint = stock.data.find(d => d.time === time);
        entry[stock.symbol] = dataPoint ? dataPoint.price : null;
      });
      return entry;
    });
  }, [stocks]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-4xl mx-auto shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold text-primary">Simulated Stock Tracker</CardTitle>
          <Button onClick={toggleTracking} variant="outline" size="icon">
            {isTracking ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={formattedData}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="timeLabel" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
              <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} domain={['dataMin - 10', 'dataMax + 10']} />
              <Tooltip
                contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    borderColor: 'hsl(var(--border))'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => `$${value.toFixed(2)}`}
              />
              <Legend />
              {stocks.map(stock => (
                <Line
                  key={stock.symbol}
                  type="monotone"
                  dataKey={stock.symbol}
                  stroke={stock.color}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockTracker;
