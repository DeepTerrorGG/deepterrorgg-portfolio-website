
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, Pause, RefreshCw, TrendingUp, Wallet, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { LeaderboardWrapper } from '../leaderboard-wrapper';

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

const MAX_DATA_POINTS = 30;
const INITIAL_BALANCE = 10000;

const StockTracker: React.FC = () => {
  const { toast } = useToast();
  
  // Game State
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [portfolio, setPortfolio] = useState<Record<string, number>>({ AC: 0, BI: 0, GL: 0 });
  
  // Market State
  const [stocks, setStocks] = useState<Stock[]>(initialStocks);
  const [isTracking, setIsTracking] = useState(true);
  const [tradeQuantities, setTradeQuantities] = useState<Record<string, string>>({ AC: '1', BI: '1', GL: '1' });


  // Market simulation effect
  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(() => {
      setStocks(prevStocks => 
        prevStocks.map(stock => {
          const lastPrice = stock.data[stock.data.length - 1].price;
          const change = (Math.random() - 0.49) * (lastPrice * 0.05); // Skew slightly positive
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

  // Memoized Calculations for performance
  const portfolioValue = useMemo(() => {
    return Object.entries(portfolio).reduce((total, [symbol, shares]) => {
      const stock = stocks.find(s => s.symbol === symbol);
      if (stock && shares > 0) {
        const currentPrice = stock.data[stock.data.length - 1].price;
        return total + (shares * currentPrice);
      }
      return total;
    }, 0);
  }, [portfolio, stocks]);

  const netWorth = useMemo(() => balance + portfolioValue, [balance, portfolioValue]);

  // Game Actions
  const handleTrade = (symbol: string, type: 'buy' | 'sell') => {
    const stock = stocks.find(s => s.symbol === symbol);
    if (!stock) return;

    const quantityStr = tradeQuantities[symbol] || '0';
    const quantity = parseInt(quantityStr, 10);
    if (isNaN(quantity) || quantity <= 0) {
      toast({ title: 'Invalid Quantity', description: 'Please enter a valid number of shares.', variant: 'destructive' });
      return;
    }

    const currentPrice = stock.data[stock.data.length - 1].price;
    const tradeValue = quantity * currentPrice;

    if (type === 'buy') {
      if (balance < tradeValue) {
        toast({ title: 'Insufficient Funds', description: 'You do not have enough cash to make this purchase.', variant: 'destructive' });
        return;
      }
      setBalance(prev => prev - tradeValue);
      setPortfolio(prev => ({ ...prev, [symbol]: (prev[symbol] || 0) + quantity }));
      toast({ title: 'Purchase Successful', description: `Bought ${quantity} ${symbol} for $${tradeValue.toFixed(2)}` });
    } else { // sell
      if ((portfolio[symbol] || 0) < quantity) {
        toast({ title: 'Not Enough Shares', description: `You only own ${portfolio[symbol] || 0} shares of ${symbol}.`, variant: 'destructive' });
        return;
      }
      setBalance(prev => prev + tradeValue);
      setPortfolio(prev => ({ ...prev, [symbol]: (prev[symbol] || 0) - quantity }));
      toast({ title: 'Sale Successful', description: `Sold ${quantity} ${symbol} for $${tradeValue.toFixed(2)}` });
    }
  };
  
  const resetGame = () => {
    setBalance(INITIAL_BALANCE);
    setPortfolio({ AC: 0, BI: 0, GL: 0 });
    setStocks(initialStocks); // Reset stock prices too
    toast({ title: "Game Reset", description: "Your balance and portfolio have been reset."});
  };
  
  // UI Handlers
  const toggleTracking = () => setIsTracking(!isTracking);
  const handleQuantityChange = (symbol: string, value: string) => {
    if (/^\d*$/.test(value)) { // only allow integers
        setTradeQuantities(prev => ({ ...prev, [symbol]: value }));
    }
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
  
  const formatCurrency = (value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <LeaderboardWrapper gameId="stockTrader" score={netWorth} isGameOver={false}>
      <div className="flex flex-col w-full h-full bg-card p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2"><Wallet/>Cash Balance</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">{formatCurrency(balance)}</p></CardContent>
          </Card>
          <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2"><Briefcase/>Portfolio Value</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">{formatCurrency(portfolioValue)}</p></CardContent>
          </Card>
          <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2"><TrendingUp/>Net Worth</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold text-green-400">{formatCurrency(netWorth)}</p></CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
          {/* Trading Panels */}
          <div className="lg:col-span-1 space-y-4">
              {stocks.map(stock => {
                  const currentPrice = stock.data[stock.data.length - 1].price;
                  const ownedShares = portfolio[stock.symbol] || 0;
                  return (
                      <Card key={stock.symbol}>
                          <CardHeader className="flex flex-row items-center justify-between pb-2">
                              <CardTitle className="text-lg" style={{ color: stock.color }}>{stock.name} ({stock.symbol})</CardTitle>
                              <div className="text-lg font-bold">{formatCurrency(currentPrice)}</div>
                          </CardHeader>
                          <CardContent>
                              <div className="flex items-center space-x-2">
                                  <Input 
                                      type="text" 
                                      placeholder="Qty" 
                                      className="w-20 h-9"
                                      value={tradeQuantities[stock.symbol]}
                                      onChange={(e) => handleQuantityChange(stock.symbol, e.target.value)}
                                  />
                                  <Button size="sm" onClick={() => handleTrade(stock.symbol, 'buy')}>Buy</Button>
                                  <Button size="sm" variant="destructive" onClick={() => handleTrade(stock.symbol, 'sell')}>Sell</Button>
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">You own: {ownedShares} shares</p>
                          </CardContent>
                      </Card>
                  )
              })}
              <Button onClick={resetGame} variant="destructive" className="w-full"><RefreshCw className="mr-2 h-4 w-4"/>Reset Game</Button>
          </div>

          {/* Chart */}
          <div className="lg:col-span-2">
              <Card className="h-full flex flex-col">
                  <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-xl">Market Trends</CardTitle>
                      <Button onClick={toggleTracking} variant="outline" size="icon">
                          {isTracking ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                  </CardHeader>
                  <CardContent className="flex-grow">
                      <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={formattedData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis dataKey="timeLabel" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} />
                              <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} domain={['dataMin - 20', 'dataMax + 20']} tickFormatter={(val) => `$${val}`} />
                              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }} formatter={(value: number) => formatCurrency(value)} />
                              <Legend />
                              {stocks.map(stock => (
                                  <Line key={stock.symbol} type="monotone" dataKey={stock.symbol} stroke={stock.color} strokeWidth={2} dot={false} connectNulls />
                              ))}
                          </LineChart>
                      </ResponsiveContainer>
                  </CardContent>
              </Card>
          </div>
        </div>
      </div>
    </LeaderboardWrapper>
  );
};

export default StockTracker;
