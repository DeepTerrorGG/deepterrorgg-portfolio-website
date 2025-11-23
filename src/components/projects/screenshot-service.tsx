
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link, Loader2, Image as ImageIcon, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const ScreenshotService: React.FC = () => {
  const { toast } = useToast();
  const [url, setUrl] = useState('https://google.com');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const takeScreenshot = () => {
    if (!url.trim()) {
      toast({ title: "URL is required", variant: "destructive" });
      return;
    }
    
    let formattedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        formattedUrl = 'https://' + url;
    }

    setIsLoading(true);
    setScreenshotUrl('');

    // Using a simple, free screenshot service. No API key needed for basic use.
    // For a real app, you might use a service that requires a key.
    const serviceUrl = `https://image.thum.io/get/width/1200/crop/630/noanimate/${formattedUrl}`;
    
    // We create an Image object to detect loading state.
    const img = new window.Image();
    img.src = serviceUrl;
    img.onload = () => {
        setScreenshotUrl(serviceUrl);
        setIsLoading(false);
    };
    img.onerror = () => {
        toast({ title: "Screenshot Failed", description: "Could not capture a screenshot of the provided URL. Please check the URL and try again.", variant: "destructive"});
        setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-card flex flex-col p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-2xl mx-auto shadow-2xl flex-grow flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary text-2xl justify-center">
            <ImageIcon /> Website Screenshot Service
          </CardTitle>
          <CardDescription className="text-center">
            Enter a URL to capture a screenshot of a website.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col">
          <div className="flex w-full items-center space-x-2 mb-4">
            <Input
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && takeScreenshot()}
              disabled={isLoading}
            />
            <Button onClick={takeScreenshot} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link className="h-4 w-4" />}
            </Button>
          </div>
          
          <div className="flex-grow flex items-center justify-center bg-muted/30 rounded-lg border border-dashed p-4">
            {isLoading && <Loader2 className="h-10 w-10 text-primary animate-spin" />}
            {screenshotUrl && !isLoading && (
              <div className="relative w-full h-full">
                <Image src={screenshotUrl} alt={`Screenshot of ${url}`} layout="fill" objectFit="contain" />
              </div>
            )}
            {!screenshotUrl && !isLoading && (
              <p className="text-muted-foreground">Screenshot will appear here</p>
            )}
          </div>
          {screenshotUrl && !isLoading && (
             <Button asChild className="mt-4 w-full">
                <a href={screenshotUrl} download={`screenshot-${new URL(url).hostname}.png`}>
                    <Download className="mr-2 h-4 w-4"/>
                    Download Screenshot
                </a>
             </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScreenshotService;
