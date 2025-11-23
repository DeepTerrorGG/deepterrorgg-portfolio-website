
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
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

  const checkStatus = async () => {
    if (!url.trim()) {
      toast({ title: "URL is required", variant: "destructive" });
      return;
    }

    let targetUrl;
    try {
        let tempUrl = url.trim();
        if (!tempUrl.startsWith('http')) {
            tempUrl = `https://'${tempUrl}`;
        }
        targetUrl = new URL(tempUrl);
    } catch (e) {
        toast({ title: "Invalid URL", description: "Please enter a valid URL.", variant: "destructive" });
        return;
    }

    setIsLoading(true);
    setResults(CHECKERS.map(c => ({ region: c.region, status: 'pending' })));
    
    try {
        const response = await fetch(`/api/check-status?url=${encodeURIComponent(targetUrl.href)}`);
        const data = await response.json();

        if (response.ok) {
            setResults(prev => prev.map(r => ({...r, status: data.isUp ? 'up' : 'down'})));
            if (data.isUp) {
                toast({title: "Site is Up!", description: "The website appears to be online."});
            } else {
                 toast({title: "Site might be down", description: "Could not reach the website.", variant: "destructive"});
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

  return (
    <div className="w-full h-full bg-card flex flex-col p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-2xl mx-auto shadow-2xl">
        <CardHeader>
          <CardTitle className="text-primary text-2xl text-center">Is It Down For Everyone?</CardTitle>
          <CardDescription className="text-center">Enter a website URL to check its status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full items-center space-x-2">
            <Input
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && checkStatus()}
              disabled={isLoading}
            />
            <Button onClick={checkStatus} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          {(isLoading || results.length > 0) && (
            <div className="mt-6 border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Region</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map(res => (
                    <TableRow key={res.region}>
                      <TableCell>{res.region}</TableCell>
                      <TableCell>
                        {res.status === 'pending' && <Loader2 className="h-4 w-4 animate-spin" />}
                        {res.status === 'up' && <Badge variant="outline" className="border-green-500 text-green-500"><CheckCircle className="h-3 w-3 mr-1" /> Up</Badge>}
                        {res.status === 'down' && <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Down</Badge>}
                        {res.status === 'error' && <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" /> Error</Badge>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WebsiteStatusChecker;
