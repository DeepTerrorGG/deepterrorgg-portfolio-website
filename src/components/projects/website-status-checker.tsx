
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

interface PingResult {
  region: string;
  status: 'pending' | 'up' | 'down' | 'error';
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
    setResults(CHECKERS.map(c => ({ region: c.region, status: 'pending' })));
    
    try {
        const response = await fetch(`/api/check-status?url=${encodeURIComponent(targetUrl.href)}`);
        const data = await response.json();

        if (response.ok) {
            setResults(prev => prev.map(r => ({...r, status: data.isUp ? 'up' : 'down'})));
            if (!data.isUp) {
                 toast({title: "Site might be down", description: data.error || "Could not reach the website.", variant: "destructive"});
            }
        } else {
            throw new Error(data.error || 'Failed to check status.');
        }

    } catch (error) {
        console.error(error);
        setResults(prev => prev.map(r => ({...r, status: 'error'})));
        toast({ title: "Error", description: (error as Error).message, variant: 'destructive'});
    } finally {
        setIsLoading(false);
    }
  };
  
  const StatusBadge = ({ status }: { status: PingResult['status']}) => {
    const statusConfig = {
      pending: { icon: <Loader2 className="h-4 w-4 animate-spin" />, text: 'Checking...', className: 'text-muted-foreground' },
      up: { icon: <CheckCircle className="h-4 w-4" />, text: 'Up', className: 'bg-green-600/10 text-green-400 border-green-500/30' },
      down: { icon: <XCircle className="h-4 w-4" />, text: 'Down', className: 'bg-red-600/10 text-red-400 border-red-500/30' },
      error: { icon: <AlertTriangle className="h-4 w-4" />, text: 'Error', className: 'bg-yellow-600/10 text-yellow-400 border-yellow-500/30' },
    };

    const { icon, text, className } = statusConfig[status];

    return (
        <Badge variant="outline" className={cn('flex items-center justify-center gap-1.5 w-20 h-7', className)}>
            {icon}
            <span>{text}</span>
        </Badge>
    );
  }


  return (
    <div className="w-full h-full bg-[#0d1117] flex items-center justify-center p-4">
      <Card className="w-full max-w-xl mx-auto shadow-2xl bg-[#161b22] border-border/20 text-white">
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
                <div className="border border-border/20 rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className="flex justify-between p-4 bg-black/20 text-sm font-semibold text-muted-foreground">
                        <div className="w-1/2">Region</div>
                        <div className="w-1/2 text-left pl-4">Status</div>
                    </div>
                    {/* Body */}
                    {results.map(res => (
                        <div key={res.region} className="flex justify-between items-center p-4 border-t border-border/20">
                            <div className="w-1/2 font-medium">{res.region}</div>
                            <div className="w-1/2 text-left pl-4">
                                <StatusBadge status={res.status} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WebsiteStatusChecker;
