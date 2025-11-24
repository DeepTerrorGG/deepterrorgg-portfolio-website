
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw, TrendingUp, Wallet, Briefcase, TrendingDown, ArrowUp, ArrowDown, Menu } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { memeStocks as initialMemeStocks, MemeStock, StockDataPoint } from '@/lib/meme-stock-data';
import Image from 'next/image';
import { ScrollArea } from '../ui/scroll-area';

const MAX_DATA_POINTS = 30;
const INITIAL_BALANCE = 10000;

const MemeStockMarket: React.FC = () => {
  const { toast } = useToast();
  
  // Game State
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [portfolio, setPortfolio] = useState<Record<string, number>>({});
  
  // Market State
  const [stocks, setStocks] = useState<MemeStock[]>(() => 
    initialMemeStocks.map(stock => ({
        ...stock,
        data: [{ time: Date.now(), price: stock.initialPrice }]
    }))
  );
  const [isMarketOpen, setIsMarketOpen] = useState(true);
  const [tradeQuantities, setTradeQuantities] = useState<Record<string, string>>({});
  
  // UI State
  const [activeChart, setActiveChart] = useState<MemeStock>(stocks[0]);
  
  // Market simulation effect
  useEffect(() => {
    if (!isMarketOpen) return;

    const interval = setInterval(() => {
      setStocks(prevStocks => 
        prevStocks.map(stock => {
          const lastPrice = stock.data[stock.data.length - 1].price;
          // Volatility factor for each meme
          const volatility = stock.volatility;
          const changePercent = (Math.random() - 0.49) * volatility; // Skew slightly positive
          const change = lastPrice * changePercent;
          const newPrice = Math.max(1, lastPrice + change); // Min price of $1
          
          const newData = [...stock.data, { time: Date.now(), price: newPrice }];
          if (newData.length > MAX_DATA_POINTS) {
            newData.shift();
          }

          const newStock = { ...stock, data: newData };
          if(activeChart.symbol === newStock.symbol) {
              setActiveChart(newStock);
          }
          return newStock;
        })
      );
    }, 1500);

    return () => clearInterval(interval);
  }, [isMarketOpen, activeChart.symbol]);

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

  const handleTrade = (symbol: string, type: 'buy' | 'sell') => {
    const stock = stocks.find(s => s.symbol === symbol);
    if (!stock) return;

    const quantityStr = tradeQuantities[symbol] || '1';
    const quantity = parseInt(quantityStr, 10);
    if (isNaN(quantity) || quantity <= 0) {
      toast({ title: 'Invalid Quantity', variant: 'destructive' });
      return;
    }

    const currentPrice = stock.data[stock.data.length - 1].price;
    const tradeValue = quantity * currentPrice;

    if (type === 'buy') {
      if (balance < tradeValue) {
        toast({ title: 'Insufficient Funds', variant: 'destructive' });
        return;
      }
      setBalance(prev => prev - tradeValue);
      setPortfolio(prev => ({ ...prev, [symbol]: (prev[symbol] || 0) + quantity }));
    } else { // sell
      if ((portfolio[symbol] || 0) < quantity) {
        toast({ title: 'Not Enough Shares', variant: 'destructive' });
        return;
      }
      setBalance(prev => prev + tradeValue);
      setPortfolio(prev => ({ ...prev, [symbol]: (prev[symbol] || 0) - quantity }));
    }
  };
  
  const resetGame = () => {
    setBalance(INITIAL_BALANCE);
    setPortfolio({});
    setStocks(initialMemeStocks.map(stock => ({
        ...stock,
        data: [{ time: Date.now(), price: stock.initialPrice }]
    })));
    setActiveChart(stocks[0]);
    toast({ title: "Game Reset", description: "The meme economy has been reset."});
  };
  
  const handleQuantityChange = (symbol: string, value: string) => {
    if (/^\d*$/.test(value)) {
        setTradeQuantities(prev => ({ ...prev, [symbol]: value }));
    }
  };

  const formatCurrency = (value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  
  const getPriceChange = (data: StockDataPoint[]) => {
      if (data.length < 2) return { change: 0, percent: 0};
      const currentPrice = data[data.length - 1].price;
      const prevPrice = data[data.length - 2].price;
      const change = currentPrice - prevPrice;
      const percent = (change / prevPrice) * 100;
      return { change, percent };
  }

  return (
    <div className="flex flex-col w-full h-full bg-[#131722] text-white p-4 space-y-4">
      {/* Header */}
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cyan-400">MemeStonks</h1>
        <div className="flex items-center gap-4">
            <Button onClick={resetGame} variant="ghost" size="sm"><RefreshCw className="mr-2 h-4 w-4"/>Reset</Button>
        </div>
      </header>

      {/* Scrolling Ticker */}
      <div className="w-full h-10 bg-black/30 flex items-center overflow-hidden">
          <div className="flex animate-scrolling-left whitespace-nowrap">
              {stocks.concat(stocks).map((stock, i) => {
                  const { change, percent } = getPriceChange(stock.data);
                  const isUp = change >= 0;
                  return (
                    <div key={`${stock.symbol}-${i}`} className="flex items-center gap-2 mx-4 text-sm">
                        <span className="font-bold">{stock.symbol}</span>
                        <span className={cn(isUp ? 'text-green-400' : 'text-red-400')}>{formatCurrency(stock.data[stock.data.length - 1].price)}</span>
                        <span className={cn('flex items-center', isUp ? 'text-green-500' : 'text-red-500')}>
                            {isUp ? <ArrowUp size={14}/> : <ArrowDown size={14}/>}
                            {percent.toFixed(2)}%
                        </span>
                    </div>
                  );
              })}
          </div>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-grow">
        {/* Left Panel: Watchlist */}
        <div className="lg:col-span-1 bg-black/20 rounded-lg p-2">
            <h2 className="text-lg font-semibold p-2">Watchlist</h2>
            <ScrollArea className="h-[60vh]">
                <div className="space-y-2">
                    {stocks.map(stock => {
                         const currentPrice = stock.data[stock.data.length - 1].price;
                         const { change } = getPriceChange(stock.data);
                         const isUp = change >= 0;
                         const ownedShares = portfolio[stock.symbol] || 0;
                         return (
                            <Card key={stock.symbol} onClick={() => setActiveChart(stock)}
                                className={cn("bg-[#1a202e] border-[#2d3748] hover:bg-[#2d3748] transition-colors cursor-pointer", activeChart.symbol === stock.symbol && "ring-2 ring-cyan-400")}>
                                <CardContent className="p-3 grid grid-cols-3 items-center gap-2">
                                    <div className="flex items-center gap-3">
                                        <Image src={stock.imageUrl} alt={stock.name} width={40} height={40} className="rounded-md"/>
                                        <div>
                                            <p className="font-bold">{stock.symbol}</p>
                                            <p className="text-xs text-gray-400 truncate">{stock.name}</p>
                                        </div>
                                    </div>
                                    <div className="h-10 w-full">
                                        <ResponsiveContainer>
                                            <AreaChart data={stock.data}>
                                                <defs>
                                                    <linearGradient id={`color-${stock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={isUp ? "#48BB78" : "#F56565"} stopOpacity={0.4}/>
                                                        <stop offset="95%" stopColor={isUp ? "#48BB78" : "#F56565"} stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <Area type="monotone" dataKey="price" stroke={isUp ? "#48BB78" : "#F56565"} fill={`url(#color-${stock.symbol})`} strokeWidth={2}/>
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono font-bold">{formatCurrency(currentPrice)}</p>
                                        <p className="text-xs text-gray-400">{ownedShares > 0 ? `${ownedShares} shares` : 'Not owned'}</p>
                                    </div>
                                </CardContent>
                            </Card>
                         )
                    })}
                </div>
            </ScrollArea>
        </div>

        {/* Right Panel: Chart and Trading */}
        <div className="lg:col-span-2 bg-black/20 rounded-lg p-4 flex flex-col gap-4">
           {/* Portfolio Summary */}
           <div className="grid grid-cols-3 gap-4 text-center">
                <Card className="bg-[#1a202e] border-[#2d3748] p-3"><p className="text-sm text-gray-400">Cash</p><p className="text-lg font-bold">{formatCurrency(balance)}</p></Card>
                <Card className="bg-[#1a202e] border-[#2d3748] p-3"><p className="text-sm text-gray-400">Portfolio</p><p className="text-lg font-bold">{formatCurrency(portfolioValue)}</p></Card>
                <Card className="bg-[#1a202e] border-[#2d3748] p-3"><p className="text-sm text-gray-400">Net Worth</p><p className="text-lg font-bold text-cyan-400">{formatCurrency(netWorth)}</p></Card>
           </div>
           
           {/* Active Chart */}
           <div>
               <div className="flex items-baseline gap-4 mb-2">
                    <h3 className="text-2xl font-bold">{activeChart.name} ({activeChart.symbol})</h3>
                    <p className="text-xl font-mono">{formatCurrency(activeChart.data[activeChart.data.length - 1].price)}</p>
               </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer>
                        <LineChart data={activeChart.data}>
                            <XAxis dataKey="time" hide={true}/>
                            <YAxis domain={['dataMin - 10', 'dataMax + 10']} hide={true}/>
                            <Line type="monotone" dataKey="price" stroke="#38b2ac" strokeWidth={2} dot={false}/>
                        </LineChart>
                    </ResponsiveContainer>
                </div>
           </div>

           {/* Trading Interface */}
            <div className="flex items-center gap-4 p-4 bg-[#1a202e] rounded-md">
                <div className="flex-grow space-y-1">
                    <label htmlFor="quantity" className="text-xs text-gray-400">Quantity</label>
                    <Input id="quantity" type="text" value={tradeQuantities[activeChart.symbol] || '1'} onChange={(e) => handleQuantityChange(activeChart.symbol, e.target.value)} className="bg-[#0e121a] border-[#2d3748] h-10"/>
                </div>
                <div className="flex gap-2 self-end">
                     <Button onClick={() => handleTrade(activeChart.symbol, 'buy')} className="bg-green-600 hover:bg-green-700 text-white h-10 px-6">Buy</Button>
                     <Button onClick={() => handleTrade(activeChart.symbol, 'sell')} className="bg-red-600 hover:bg-red-700 text-white h-10 px-6">Sell</Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MemeStockMarket;
