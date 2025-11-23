
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, CheckCircle, XCircle, AlertTriangle, Wifi, CircleSlash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';

interface PingResult {
  region: string;
  status: 'pending' | 'up' | 'down' | 'error';
  http: number | null;
}

const CHECKERS = [
  { region: 'Global Check' },
];

const WebsiteStatusChecker: React.FC = () => {
  const { toast } = useToast();
  const [url, setUrl] = useState('https://google.com');
  const [results, setResults] = useState<PingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'pending' | 'up' | 'down' | 'error' | 'idle'>('idle');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkStatus = async () => {
    if (!url.trim()) {
      toast({ title: "URL is required", variant: "destructive" });
      return;
    }

    let targetUrl;
    try {
        let tempUrl = url.trim();
        if (!tempUrl.startsWith('http')) {
            tempUrl = `https://${tempUrl}`;
        }
        targetUrl = new URL(tempUrl);
    } catch (e) {
        toast({ title: "Invalid URL", description: "Please enter a valid URL.", variant: "destructive" });
        return;
    }

    setIsLoading(true);
    setShowResults(true);
    setOverallStatus('pending');
    setLastChecked(new Date());
    setResults(CHECKERS.map(c => ({ region: c.region, status: 'pending', http: null })));
    
    try {
        const response = await fetch(`/api/check-status?url=${encodeURIComponent(targetUrl.href)}`);
        const data = await response.json();

        if (response.ok) {
            const finalStatus = data.isUp ? 'up' : 'down';
            setResults(prev => prev.map(r => ({ ...r, status: finalStatus, http: data.status || null })));
            setOverallStatus(finalStatus);
            if (!data.isUp) {
                 toast({title: "Site might be down", description: data.error || "Could not reach the website.", variant: "destructive"});
            }
        } else {
            throw new Error(data.error || 'Failed to check status.');
        }

    } catch (error) {
        console.error(error);
        setResults(prev => prev.map(r => ({ ...r, status: 'error', http: null })));
        setOverallStatus('error');
        toast({ title: "Error", description: (error as Error).message, variant: 'destructive'});
    } finally {
        setIsLoading(false);
    }
  };
  
  const StatusDisplay = () => {
    switch (overallStatus) {
      case 'pending':
        return (
          <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 p-6 rounded-lg text-center">
            <h2 className="font-bold text-xl flex items-center justify-center gap-2"><Loader2 className="animate-spin" /> CHECKING</h2>
            <p className="text-sm">Pinging {url}...</p>
          </div>
        );
      case 'up':
        return (
          <div className="bg-green-600/20 border border-green-500/40 text-green-300 p-6 rounded-lg text-center">
            <h2 className="font-bold text-xl flex items-center justify-center gap-2"><Wifi /> IT'S JUST YOU</h2>
            <p className="text-sm">{url} seems to be up and running.</p>
          </div>
        );
      case 'down':
        return (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-6 rounded-lg text-center">
            <h2 className="font-bold text-xl flex items-center justify-center gap-2"><CircleSlash /> IT'S DOWN</h2>
            <p className="text-sm">{url} seems to be down for everyone.</p>
          </div>
        );
      default:
        return null;
    }
  };

  const StatusBadge = ({ status }: { status: PingResult['status']}) => {
    const statusConfig = {
      pending: { icon: <Loader2 className="h-4 w-4 animate-spin" />, text: 'Checking...' },
      up: { icon: <CheckCircle className="h-4 w-4" />, text: 'Up' },
      down: { icon: <XCircle className="h-4 w-4" />, text: 'Down' },
      error: { icon: <AlertTriangle className="h-4 w-4" />, text: 'Error' },
    };

    const { icon, text } = statusConfig[status];
    const badgeColor = status === 'up' ? 'text-green-400' : status === 'down' ? 'text-red-400' : status === 'error' ? 'text-yellow-400' : 'text-muted-foreground';

    return (
        <div className={cn('flex items-center gap-1.5', badgeColor)}>
            {icon}
            <span className="font-semibold">{text}</span>
        </div>
    );
  }


  return (
    <div className="w-full h-full bg-[#0d1117] flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl mx-auto shadow-2xl bg-[#161b22] border-border/20 text-white">
        <CardContent className="p-8 space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-primary">Is It Down For Everyone?</h1>
                <p className="text-muted-foreground mt-2">Enter a website URL to check its status.</p>
            </div>
            
            <div className="flex w-full items-center space-x-2">
                <Input
                  type="text"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && checkStatus()}
                  disabled={isLoading}
                  className="bg-[#0d1117] border-border h-12 text-base"
                />
                <Button onClick={checkStatus} disabled={isLoading} size="icon" className="h-12 w-12 bg-primary hover:bg-primary/90">
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                </Button>
            </div>
            
            {showResults && (
                <div className="space-y-4">
                    <StatusDisplay />
                    <div className="border border-border/20 rounded-lg p-2">
                        <div className="grid grid-cols-3 gap-4 px-4 py-2 text-muted-foreground font-semibold text-sm">
                            <div>Region</div>
                            <div>Status</div>
                            <div>HTTP Status</div>
                        </div>
                        {results.map(res => (
                            <div key={res.region} className="grid grid-cols-3 gap-4 px-4 py-3 bg-black/20 rounded-sm items-center">
                                <div className="font-medium">{res.region}</div>
                                <div><StatusBadge status={res.status} /></div>
                                <div className="font-mono">{res.http ?? 'N/A'}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </CardContent>
         <CardHeader className="p-4 pt-0 text-xs text-muted-foreground flex flex-row justify-end items-center">
            <span>
              {lastChecked && `Last checked: ${format(lastChecked, "MMM dd, yyyy, hh:mm:ss a")}`}
            </span>
          </CardHeader>
      </Card>
    </div>
  );
};

export default WebsiteStatusChecker;
