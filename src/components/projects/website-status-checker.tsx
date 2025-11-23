
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import Image from 'next/image';

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
  const [checkUrl, setCheckUrl] = useState<string | null>(null);

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
    setResults(CHECKERS.map(c => ({ region: c.region, status: 'pending' })));
    
    // We use the screenshot service as a proxy for "is it up?"
    // If thum.io can render it, it's up.
    setCheckUrl(`https://image.thum.io/get/width/10/noanimate/${targetUrl.href}`);
  };
  
  const handleImageLoad = () => {
    setIsLoading(false);
    setResults(prev => prev.map(r => ({...r, status: 'up'})));
    toast({title: "Site is Up!", description: "The website appears to be online."});
  }

  const handleImageError = () => {
    setIsLoading(false);
    setResults(prev => prev.map(r => ({...r, status: 'down'})));
    toast({title: "Site might be down", description: "Could not reach the website.", variant: "destructive"});
  }


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

           {checkUrl && <Image src={checkUrl} alt="Status check" width={1} height={1} className="hidden" onLoad={handleImageLoad} onError={handleImageError} />}

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
