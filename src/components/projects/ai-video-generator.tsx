
'use client';

import { generateVideo } from '@/ai/flows/generate-video-flow';
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '../ui/progress';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';

type GenerationStatus = 'idle' | 'generating' | 'done' | 'error' | 'limit-reached';
type AspectRatio = '16:9' | '9:16' | '4:3' | '1:1';

interface AIVideoGeneratorProps {
    onGenerate: () => boolean;
    usageLeft: number;
}

export default function AIVideoGenerator({ onGenerate, usageLeft }: AIVideoGeneratorProps) {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('A majestic dragon soaring over a mystical forest at dawn.');
  const [videoUrl, setVideoUrl] = useState('');
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [progress, setProgress] = useState(0);
  
  // Advanced options
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [negativePrompt, setNegativePrompt] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
     if (!prompt.trim()) {
      toast({ title: 'Prompt is required', description: 'Please enter a description for the video.', variant: 'destructive' });
      return;
    }
    
    if (!onGenerate()) {
        setStatus('limit-reached');
        return;
    }

    setStatus('generating');
    setVideoUrl('');
    setProgress(0);

    const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 1, 98));
    }, 1000);

    try {
      const result = await generateVideo({
        prompt,
        aspectRatio,
        negativePrompt
      });
      
      clearInterval(progressInterval);
      setProgress(99);

      if (result?.video) {
        setVideoUrl(result.video);
        setStatus('done');
        setProgress(100);
        toast({ title: 'Success!', description: 'Your video has been generated.' });
      } else {
        throw new Error('The AI did not return a video. This might be due to content policies or high demand.');
      }
    } catch (error: any) {
      clearInterval(progressInterval);
      
      setStatus('error');
      setProgress(0);
      console.error(error);
      toast({
        title: 'Generation Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  }

  const isLoading = status === 'generating';

  return (
    <div className="p-4 md:p-8 flex items-center justify-center bg-card h-full">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>AI Video Generator</CardTitle>
          <CardDescription>Create a short video from a text description using Google's Veo 3 model.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="prompt-textarea">Prompt</Label>
              <Textarea
                id="prompt-textarea"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A cinematic shot of a an old car driving down a deserted road at sunset."
                rows={3}
                disabled={isLoading || usageLeft <= 0}
                className="mt-1"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
                  <Select value={aspectRatio} onValueChange={v => setAspectRatio(v as AspectRatio)} disabled={isLoading || usageLeft <= 0}>
                      <SelectTrigger id="aspect-ratio" className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                          <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                          <SelectItem value="9:16">9:16 (Vertical)</SelectItem>
                          <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                          <SelectItem value="1:1">1:1 (Square)</SelectItem>
                      </SelectContent>
                  </Select>
                </div>
                <div>
                    <Label htmlFor="negative-prompt">Negative Prompt</Label>
                    <Input id="negative-prompt" placeholder="e.g., blurry, text, watermark" value={negativePrompt} onChange={e => setNegativePrompt(e.target.value)} className="mt-1" disabled={isLoading || usageLeft <= 0}/>
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || usageLeft <= 0}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              {usageLeft > 0 ? 'Generate Video' : 'Usage Limit Reached'}
            </Button>
          </form>

          {isLoading && (
            <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                    Generating video... (This can take up to a minute)
                </p>
                 <Progress value={progress} className="w-full" />
            </div>
          )}

          {status === 'error' && (
            <div className="mt-6 text-center text-destructive">
                <p>Something went wrong. Please try another prompt or check the console for details.</p>
            </div>
          )}
          
           {status === 'limit-reached' && (
            <div className="mt-6 text-center text-destructive">
                <p>You have reached the video generation limit for this session.</p>
            </div>
          )}

          {status === 'done' && videoUrl && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2 text-center">Generated Video:</h3>
              <video src={videoUrl} controls autoPlay loop className="w-full rounded-md" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
