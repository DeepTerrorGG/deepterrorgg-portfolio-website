
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Info, AlertTriangle, X, Database, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';

type LogLevel = 'info' | 'warn' | 'error';
type LogMessage = {
    id: string;
    level: LogLevel;
    msg: string;
    timestamp: any;
};

const LogIngestor: React.FC = () => {
    const firestore = useFirestore();

    const logsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'system_logs'), orderBy('timestamp', 'desc'), limit(100));
    }, [firestore]);
    const { data: processedLogs, isLoading } = useCollection<LogMessage>(logsQuery);
    
    const getLogLevelStyles = (level: LogLevel) => ({
        info: { icon: <Info className="h-4 w-4 text-blue-400"/>, text: "text-blue-400" },
        warn: { icon: <AlertTriangle className="h-4 w-4 text-yellow-400"/>, text: "text-yellow-400" },
        error: { icon: <X className="h-4 w-4 text-red-400"/>, text: "text-red-400" },
    }[level]);

    return (
        <div className="w-full h-full bg-[#0d1117] flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl mx-auto shadow-2xl bg-black/30 border-border/20 text-white flex flex-col h-[85vh]">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-bold text-primary">Real-Time Log Viewer</CardTitle>
                  <CardDescription>Displaying real activity from across the application.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden">
                <Card className="bg-background/20 border-border/30 h-full flex flex-col">
                    <CardHeader><CardTitle className="text-base flex items-center gap-2"><Database />Live Log Stream</CardTitle></CardHeader>
                    <CardContent className="flex-grow p-0 overflow-y-hidden">
                        <ScrollArea className="h-full">
                            <div className="p-4 font-mono text-xs space-y-1">
                                {isLoading && <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="animate-spin h-4 w-4"/><span>Loading logs...</span></div>}
                                {processedLogs?.map(log => (
                                    <div key={log.id} className="flex items-start gap-3">
                                        <span className="text-muted-foreground">{log.timestamp ? new Date(log.timestamp.seconds * 1000).toLocaleTimeString() : '...'}</span>
                                        <div className="flex items-center gap-1 flex-shrink-0">{getLogLevelStyles(log.level).icon} <span className={cn('font-bold w-10', getLogLevelStyles(log.level).text)}>{log.level.toUpperCase()}</span></div>
                                        <span className="flex-grow whitespace-pre-wrap">{log.msg}</span>
                                    </div>
                                ))}
                                {!isLoading && processedLogs?.length === 0 && <p className="text-muted-foreground">No logs yet. Navigate around the site to generate some activity.</p>}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </CardContent>
          </Card>
        </div>
    );
};

export default LogIngestor;
