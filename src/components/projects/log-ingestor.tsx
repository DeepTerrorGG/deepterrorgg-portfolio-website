
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
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, serverTimestamp, limit } from 'firebase/firestore';

type LogLevel = 'info' | 'warn' | 'error';
type LogMessage = {
    id: string;
    level: LogLevel;
    msg: string;
    timestamp: any; // Allow Firestore Timestamp
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


const LogIngestor: React.FC = () => {
    const { toast } = useToast();
    const firestore = useFirestore();
    
    // --- STATE MANAGEMENT ---
    const [isGeneratorRunning, setIsGeneratorRunning] = useState(true);
    const [logsPerSecond, setLogsPerSecond] = useState(20);
    const generatorIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const logsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'system_logs'), orderBy('timestamp', 'desc'), limit(200));
    }, [firestore]);

    const { data: processedLogs, isLoading } = useCollection<LogMessage>(logsQuery);

    // This simulates the client-side SDK
    const log = useCallback(async (level: LogLevel, msg?: string) => {
        if (!firestore) return;
        const randomMsg = msg || LOG_MESSAGES[level][Math.floor(Math.random() * LOG_MESSAGES[level].length)];
        const logData = { level, msg: randomMsg, timestamp: serverTimestamp() };
        addDocumentNonBlocking(collection(firestore, 'system_logs'), logData);
    }, [firestore]);


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
                log(level);
            }, interval);
        }
        return () => {
            if (generatorIntervalRef.current) {
                clearInterval(generatorIntervalRef.current);
            }
        };
    }, [isGeneratorRunning, logsPerSecond, log]);

    
    const resetSystem = async () => {
        // This is now a client-side only reset simulation for the demo.
        // In a real app, you'd call a secure backend function to clear the collection.
        // For this portfolio project, we'll just stop generating and clear the local view.
        setIsGeneratorRunning(false);
        toast({ title: "Simulation Paused", description: "Log generation has been stopped. To clear the logs, you would need backend permissions."});
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
          <Card className="w-full max-w-4xl mx-auto shadow-2xl bg-black/30 border-border/20 text-white flex flex-col h-[85vh]">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-bold text-primary">Real-Time Log Ingestor</CardTitle>
                  <CardDescription>A real-time logging pipeline using Firestore.</CardDescription>
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
                        <CardHeader><CardTitle className="text-base">Log Generator Controls</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                               <Label>Logs per Second: {logsPerSecond}</Label>
                               <Slider min={10} max={200} step={10} value={[logsPerSecond]} onValueChange={(v) => setLogsPerSecond(v[0])}/>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2 flex flex-col gap-4 h-full">
                     <Card className="bg-background/20 border-border/30 flex-grow flex flex-col overflow-hidden">
                        <CardHeader><CardTitle className="text-base">Live Log Tail</CardTitle></CardHeader>
                        <CardContent className="flex-grow p-0 overflow-y-hidden">
                            <ScrollArea className="h-full">
                                <div className="p-4 font-mono text-xs space-y-1">
                                    {isLoading && <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="animate-spin h-4 w-4"/><span>Loading logs...</span></div>}
                                    {processedLogs?.map(log => (
                                        <div key={log.id} className="flex items-start gap-3">
                                            <span className="text-muted-foreground">{log.timestamp ? new Date(log.timestamp.seconds * 1000).toLocaleTimeString() : '...'}</span>
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
