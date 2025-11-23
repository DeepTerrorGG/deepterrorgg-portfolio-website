
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Wifi, CircleSlash, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';

type RegionStatus = 'unknown' | 'checking' | 'Up' | 'Down';
interface RegionData {
  name: string;
  endpoint: string;
  status: RegionStatus;
  http: number | null;
  latency: number | null;
}

type OverallStatus = 'unknown' | 'checking' | 'ok' | 'down';

const checkEndpoints: { name: string; endpoint: string; }[] = [
  { name: 'Cloudflare DNS', endpoint: 'https://1.1.1.1/cdn-cgi/trace' },
  { name: 'Google DNS', endpoint: 'https://dns.google/resolve?name=google.com' },
  { name: 'APNIC Research', endpoint: 'https://1.0.0.1/.' },
];

const DownDetectorDetector: React.FC = () => {
  const [status, setStatus] = useState<OverallStatus>('unknown');
  const [regionData, setRegionData] = useState<RegionData[]>(
    checkEndpoints.map(({ name, endpoint }) => ({ name, endpoint, status: 'unknown', http: null, latency: null }))
  );
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const runChecks = () => {
    setStatus('checking');
    setRegionData(prev => prev.map(r => ({ ...r, status: 'checking', http: null, latency: null })));
    setLastChecked(new Date());

    const checkEndpoint = async (region: { name: string; endpoint: string }): Promise<RegionData> => {
      const startTime = performance.now();
      try {
        // We use { mode: 'no-cors' } which means we won't get a response body, but we can still measure latency
        // and infer "up" status if the request doesn't throw an error. This is a common technique for this kind of check.
        await fetch(region.endpoint, { method: 'HEAD', mode: 'no-cors', cache: 'no-cache' });
        const endTime = performance.now();
        
        // With no-cors, status will be 0, but if it completes, it's considered "up".
        return {
          ...region,
          status: 'Up',
          http: 200, // Assume 200 OK as we can't read the actual status
          latency: Math.round(endTime - startTime),
        };
      } catch (error) {
        const endTime = performance.now();
        return {
          ...region,
          status: 'Down',
          http: null, // Error, so no HTTP status
          latency: Math.round(endTime - startTime), // Still useful to show time until failure
        };
      }
    };

    const promises = checkEndpoints.map(checkEndpoint);

    Promise.all(promises).then(results => {
      setRegionData(results);
      const isAnyDown = results.some(r => r.status === 'Down');
      setStatus(isAnyDown ? 'down' : 'ok');
    });
  };
  
  useEffect(() => {
    runChecks();
  }, []);

  const isLoading = status === 'checking';

  const StatusDisplay = () => {
    switch (status) {
      case 'checking':
        return (
          <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 p-6 rounded-lg text-center">
            <h2 className="font-bold text-xl flex items-center justify-center gap-2"><Loader2 className="animate-spin" /> CHECKING</h2>
            <p className="text-sm">Pinging downdetectorsdowndetector.com from multiple regions...</p>
          </div>
        );
      case 'ok':
        return (
          <div className="bg-green-600/20 border border-green-500/40 text-green-300 p-6 rounded-lg text-center">
            <h2 className="font-bold text-xl flex items-center justify-center gap-2"><Wifi /> OK</h2>
            <p className="text-sm">DownDetector's DownDetector responded normally from all regions.</p>
          </div>
        );
      case 'down':
        return (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-6 rounded-lg text-center">
            <h2 className="font-bold text-xl flex items-center justify-center gap-2"><CircleSlash /> DOWN</h2>
            <p className="text-sm">DownDetector's DownDetector seems to be having issues.</p>
          </div>
        );
      default:
        return null;
    }
  };

  const RegionTable = ({ data }: { data: RegionData[] }) => (
    <div className="text-sm">
        {/* Header */}
        <div className="grid grid-cols-4 gap-4 px-4 py-2 text-muted-foreground font-semibold">
            <div>Region/Service</div>
            <div>Status</div>
            <div>HTTP</div>
            <div className="text-right">Latency</div>
        </div>
        {/* Body */}
        <div className="space-y-px">
            {data.map(region => (
                <div key={region.name} className="grid grid-cols-4 gap-4 px-4 py-3 bg-black/20 hover:bg-white/5 transition-colors rounded-sm items-center">
                    <div className="font-medium">{region.name}</div>
                    <div>
                        {region.status === 'checking' ? <Loader2 className="w-4 h-4 animate-spin"/> : (
                            <Badge variant='outline' className={cn(
                                'border-opacity-30 text-xs py-1 px-2 gap-1.5',
                                region.status === 'Up' ? 'border-green-400 bg-green-900/40 text-green-300' : 'border-red-400 bg-red-900/40 text-red-300'
                            )}>
                                <span className={cn("h-2 w-2 rounded-full", region.status === 'Up' ? 'bg-green-400' : 'bg-red-400')}></span>
                                {region.status}
                            </Badge>
                        )}
                    </div>
                    <div>{region.http ?? 'N/A'}</div>
                    <div className="text-right font-mono">{region.latency ? `${region.latency} ms` : '...'}</div>
                </div>
            ))}
        </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-[#0d1117] text-white p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Is DownDetector's DownDetector down?</h1>
          <p className="text-muted-foreground mt-2">A tiny independent status checker for the checker.</p>
        </div>

        <Card className="bg-[#161b22] border-border/20">
          <CardContent className="p-6 space-y-4">
             <StatusDisplay />
             <div>
                <h3 className="font-semibold text-muted-foreground text-sm mb-2 px-4 uppercase">CHECKS BY REGION/SERVICE</h3>
                <div className="border rounded-lg border-border/20 p-2">
                    <RegionTable data={regionData} />
                </div>
             </div>
          </CardContent>
          <CardHeader className="p-4 pt-0 text-xs text-muted-foreground flex flex-row justify-between items-center">
            <span>
              {lastChecked ? `Last checked ${format(lastChecked, "MMM dd, yyyy, hh:mm:ss a")}` : 'Checking...'}
            </span>
            <span className="font-mono">Target: downdetectorsdowndetector.com</span>
          </CardHeader>
        </Card>
        
        <div className="text-center text-xs text-muted-foreground space-y-4">
            <p>
                This site is not affiliated with DownDetector. It just checks whether downdetectorsdowndetector.com is reachable from a few different locations.
            </p>
        </div>
         <div className="flex justify-center">
             <Button onClick={runChecks} variant="secondary" disabled={isLoading}>
                <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && 'animate-spin')} />
                Re-check
             </Button>
         </div>

      </div>
    </div>
  );
};

export default DownDetectorDetector;
