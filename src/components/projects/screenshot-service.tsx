'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link as LinkIcon, Loader2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ScreenshotService: React.FC = () => {
  const { toast } = useToast();
  const [url, setUrl] = useState('https://google.com');
  const [isLoading, setIsLoading] = useState(false);

  const downloadScreenshot = () => {
    if (!url.trim()) {
      toast({ title: "URL is required", variant: "destructive" });
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
        toast({ title: "Invalid URL", description: "Please enter a valid URL.", variant: "destructive" });
        return;
    }
    
    setIsLoading(true);

    const serviceUrl = `https://image.thum.io/get/width/1280/noanimate/${urlObject.href}`;
    
    const link = document.createElement('a');
    link.href = serviceUrl;
    link.download = `screenshot-${urlObject.hostname}.png`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "Download Initiated", description: `Your screenshot for ${urlObject.hostname} is downloading.` });
    
    setTimeout(() => {
        setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="w-full h-full bg-card flex flex-col p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-2xl mx-auto shadow-2xl flex-grow flex flex-col justify-center">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary text-2xl justify-center">
            <LinkIcon /> Website Screenshot Service
          </CardTitle>
          <CardDescription className="text-center">
            Enter a URL to capture and download a full-page screenshot.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-center">
          <div className="flex w-full items-center space-x-2 mb-4">
            <Input
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && downloadScreenshot()}
              disabled={isLoading}
            />
          </div>
          
          <Button onClick={downloadScreenshot} disabled={isLoading} className="mt-4 w-full">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
            ) : (
              <Download className="mr-2 h-4 w-4"/>
            )}
            Download Screenshot
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScreenshotService;
