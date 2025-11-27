
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RefreshCw, AlertTriangle, Info, CheckCircle, Server, Database, Waypoints, Loader2, X } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';

type LogLevel = 'info' | 'warn' | 'error';
type LogMessage = {
    id: string; // Use string for IDs now
    level: LogLevel;
    msg: string;
    timestamp: number;
};
type ChartDataPoint = {
    time: number;
    count: number;
};

const LOG_MESSAGES: Record<LogLevel, string[]> = {
    info: ['User logged in', 'Data fetched successfully', 'Processing request', 'Task completed'],
    warn: ['API response time is slow', 'Low disk space warning', 'Cache miss', 'Deprecated function called'],
    error: ['Failed to connect to database', 'Null pointer exception', 'Invalid user input', 'Unauthorized access attempt'],
};

// 1. The Simulated SDK
const createLogIngestor = () => {
    return {
        log: async (level: LogLevel, msg?: string) => {
            const randomMsg = msg || LOG_MESSAGES[level][Math.floor(Math.random() * LOG_MESSAGES[level].length)];
            try {
                // In a real SDK, this would be a robust fetch or beacon call
                await fetch('/api/log', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ level, msg: randomMsg }),
                    keepalive: true, // Important for reliability when page is closing
                });
            } catch (error) {
                // In a real SDK, you'd have retry logic or local caching
                console.error("SDK Error: Failed to send log.", error);
            }
        }
    }
};

const LogIngestor: React.FC = () => {
    const { toast } = useToast();
    
    // --- STATE MANAGEMENT ---
    const [processedLogs, setProcessedLogs] = useState<LogMessage[]>([]);
    const [queueSize, setQueueSize] = useState(0);
    const [isGeneratorRunning, setIsGeneratorRunning] = useState(true);
    const [isWorkerRunning, setIsWorkerRunning] = useState(true);
    const [logsPerSecond, setLogsPerSecond] = useState(50);
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

    const ingestor = useRef(createLogIngestor());
    const generatorIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // --- EFFECTS ---

    // Log Generator Effect
    useEffect(() => {
        if (generatorIntervalRef.current) {
            clearInterval(generatorIntervalRef.current);
        }
        if (isGeneratorRunning) {
            const interval = 1000 / logsPerSecond;
            generatorIntervalRef.current = setInterval(() => {
                const random = Math.random();
                const level: LogLevel = random < 0.7 ? 'info' : random < 0.9 ? 'warn' : 'error';
                ingestor.current.log(level);
            }, interval);
        }
        return () => {
            if (generatorIntervalRef.current) {
                clearInterval(generatorIntervalRef.current);
            }
        };
    }, [isGeneratorRunning, logsPerSecond]);

    // Dashboard Polling Effect
    useEffect(() => {
        const pollingInterval = setInterval(async () => {
            try {
                const response = await fetch('/api/log');
                if (response.ok) {
                    const data = await response.json();
                    setProcessedLogs(prev => {
                         // Create a Set of existing IDs for quick lookups
                        const existingIds = new Set(prev.map(p => p.id));
                        // Filter out logs that are already in the state
                        const newLogs = data.logs.filter((log: LogMessage) => !existingIds.has(log.id));
                        // Combine and slice to keep the list at a reasonable size
                        return [...newLogs, ...prev].slice(0, 200);
                    });
                    setQueueSize(data.queueSize);
                     setChartData(prev => {
                        const newDataPoint = { time: Date.now(), count: data.queueSize };
                        return [...prev.slice(-29), newDataPoint];
                    });
                }
            } catch (error) {
                console.error("Dashboard poll failed:", error);
            }
        }, 1000); // Poll every second

        return () => clearInterval(pollingInterval);
    }, []);
    
    const handleWorkerToggle = async () => {
        const newWorkerState = !isWorkerRunning;
        setIsWorkerRunning(newWorkerState);
        try {
            await fetch('/api/log/worker', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ running: newWorkerState })
            });
            toast({ title: `Worker ${newWorkerState ? 'Started' : 'Stopped'}`});
        } catch (error) {
            toast({ title: 'Error', description: 'Could not communicate with worker control.', variant: 'destructive'});
        }
    }

    const resetSystem = async () => {
        try {
            await fetch('/api/log/reset', { method: 'POST' });
            setProcessedLogs([]);
            setChartData([]);
            setQueueSize(0);
            toast({ title: "System Reset", description: "All server queues and logs have been cleared."});
        } catch (error) {
             toast({ title: 'Error', description: 'Could not reset the system.', variant: 'destructive'});
        }
    };
    
    const getLogLevelStyles = (level: LogLevel) => {
      return {
        info: { icon: <CheckCircle className="h-4 w-4 text-blue-400"/>, text: "text-blue-400" },
        warn: { icon: <AlertTriangle className="h-4 w-4 text-yellow-400"/>, text: "text-yellow-400" },
        error: { icon: <X className="h-4 w-4 text-red-400"/>, text: "text-red-400" },
      }[level];
    };

    return (
        <div className="w-full h-full bg-[#0d1117] flex items-center justify-center p-4">
          <Card className="w-full max-w-7xl mx-auto shadow-2xl bg-black/30 border-border/20 text-white flex flex-col h-[85vh]">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-bold text-primary">Real-Time Log Ingestor</CardTitle>
                  <CardDescription>A high-throughput API with a client-side SDK, server-side queue, and live dashboard.</CardDescription>
                </div>
                 <div className="flex gap-2">
                   <Button onClick={() => setIsGeneratorRunning(!isGeneratorRunning)} variant={isGeneratorRunning ? "secondary" : "outline"}>
                     {isGeneratorRunning ? <Pause className="mr-2 h-4 w-4"/> : <Play className="mr-2 h-4 w-4"/>}
                     {isGeneratorRunning ? "Pause" : "Start"} Logs
                   </Button>
                   <Button onClick={resetSystem} variant="destructive"><RefreshCw className="mr-2 h-4 w-4"/>Reset</Button>
                 </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <Card className="bg-background/20 border-border/30">
                        <CardHeader><CardTitle className="text-base">Simulation Controls</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                               <Label>Logs per Second: {logsPerSecond}</Label>
                               <Slider min={10} max={1000} step={10} value={[logsPerSecond]} onValueChange={(v) => setLogsPerSecond(v[0])}/>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input type="checkbox" id="worker-toggle" checked={isWorkerRunning} onChange={handleWorkerToggle}/>
                                <Label htmlFor="worker-toggle">Background Worker Enabled</Label>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-background/20 border-border/30 flex-grow">
                        <CardHeader><CardTitle className="text-base">Architecture Diagram</CardTitle></CardHeader>
                        <CardContent className="flex flex-col items-center justify-center h-full gap-4 text-center text-xs">
                           <div className="flex items-center gap-2"><Server className="text-primary"/><span>Ingest API (Edge)</span></div>
                           <Loader2 className={cn("animate-spin text-muted-foreground", !isGeneratorRunning && "opacity-0")}/>
                           <div className={cn("flex items-center gap-2 p-2 rounded-md border", queueSize > 1000 ? "border-red-500 bg-red-500/10" : "border-border/50")}>
                             <Waypoints className="text-primary"/><span>Queue: {queueSize.toLocaleString()} logs</span>
                           </div>
                           <Loader2 className={cn("animate-spin text-muted-foreground", !isWorkerRunning && "opacity-0")}/>
                           <div className="flex items-center gap-2"><Database className="text-primary"/><span>Database (Bulk Insert)</span></div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2 flex flex-col gap-4 h-full">
                     <Card className="bg-background/20 border-border/30">
                        <CardHeader><CardTitle className="text-base">Queue Size</CardTitle></CardHeader>
                        <CardContent className="h-40">
                             <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <defs><linearGradient id="colorQueue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/><stop offset="95%" stopColor="#8884d8" stopOpacity={0}/></linearGradient></defs>
                                    <XAxis dataKey="time" tickFormatter={(time) => new Date(time).toLocaleTimeString()} hide/>
                                    <YAxis domain={[0, 'dataMax + 500']}/>
                                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}/>
                                    <Area type="monotone" dataKey="count" name="Queue Size" stroke="#8884d8" fillOpacity={1} fill="url(#colorQueue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                     <Card className="bg-background/20 border-border/30 flex-grow flex flex-col overflow-hidden">
                        <CardHeader><CardTitle className="text-base">Live Log Tail (Processed Logs)</CardTitle></CardHeader>
                        <CardContent className="flex-grow p-0 overflow-y-hidden">
                            <ScrollArea className="h-full">
                                <div className="p-4 font-mono text-xs space-y-1">
                                    {processedLogs.map(log => (
                                        <div key={log.id} className="flex items-start gap-3">
                                            <span className="text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                            <div className="flex items-center gap-1">{getLogLevelStyles(log.level).icon} <span className={cn('font-bold', getLogLevelStyles(log.level).text)}>{log.level.toUpperCase()}</span></div>
                                            <span>{log.msg}</span>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </CardContent>
          </Card>
        </div>
    );
};

export default LogIngestor;
