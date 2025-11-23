
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link as LinkIcon, Loader2, Image as ImageIcon, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const ScreenshotService: React.FC = () => {
  const { toast } = useToast();
  const [url, setUrl] = useState('https://google.com');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastCheckedUrl, setLastCheckedUrl] = useState('');

  // This effect will run on the initial load to show a default screenshot
  useEffect(() => {
    takeScreenshot(true); // `true` to indicate it's the initial, silent load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const takeScreenshot = (isInitialLoad = false) => {
    if (!url.trim()) {
      if (!isInitialLoad) {
        toast({ title: "URL is required", variant: "destructive" });
      }
      return;
    }
    
    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = `https://${formattedUrl}`;
    }

    let urlObject;
    try {
        urlObject = new URL(formattedUrl);
    } catch (e) {
        if (!isInitialLoad) {
            toast({ title: "Invalid URL", description: "Please enter a valid URL.", variant: "destructive" });
        }
        return;
    }
    
    setIsLoading(true);
    // Don't clear screenshotUrl here, to keep the old one visible while loading.

    const serviceUrl = `https://image.thum.io/get/width/1200/crop/630/noanimate/${urlObject.href}`;
    
    // Preload the image in memory to reliably catch onLoad and onError events
    const img = new window.Image();
    
    img.onload = () => {
      setScreenshotUrl(serviceUrl);
      setLastCheckedUrl(urlObject.href);
      setIsLoading(false);
      if (!isInitialLoad) {
        toast({ title: "Screenshot Captured!", description: "The screenshot has been successfully generated." });
      }
    };
    
    img.onerror = () => {
      setIsLoading(false);
      if (!isInitialLoad) {
        toast({ title: "Screenshot Failed", description: "Could not capture a screenshot of the provided URL. It might be down or blocking requests.", variant: "destructive"});
      }
    };
    
    img.src = serviceUrl;
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
            <Button onClick={() => takeScreenshot()} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LinkIcon className="h-4 w-4" />}
            </Button>
          </div>
          
          <div className="flex-grow flex items-center justify-center bg-muted/30 rounded-lg border border-dashed p-4">
            {isLoading && !screenshotUrl && (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p>Capturing screenshot...</p>
              </div>
            )}
            
            {screenshotUrl && (
              <div className="relative w-full h-full">
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  </div>
                )}
                <Image 
                    src={screenshotUrl} 
                    alt={`Screenshot of ${url}`} 
                    layout="fill" 
                    objectFit="contain"
                    key={screenshotUrl} // Add key to force re-render
                />
              </div>
            )}

            {!isLoading && !screenshotUrl && (
              <p className="text-muted-foreground">Screenshot will appear here</p>
            )}
          </div>
          {!isLoading && screenshotUrl && (
             <Button asChild className="mt-4 w-full">
                <a href={screenshotUrl} download={`screenshot-${new URL(lastCheckedUrl).hostname}.png`}>
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
