
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { analyzeFont } from '@/ai/flows/font-identifier-flow';
import type { FontAnalysis } from '@/ai/flows/font-identifier-flow-types';
import ReactMarkdown from 'react-markdown';

const FontIdentifier: React.FC = () => {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<FontAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) { // 4MB limit
      toast({ title: "Image is too large", description: "Please upload an image under 4MB.", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
      setAnalysis(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!image) {
      toast({ title: "No image selected", description: "Please upload an image to analyze.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setAnalysis(null);

    try {
      const result = await analyzeFont({ imageDataUri: image });
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      toast({ title: "Analysis Failed", description: (err as Error).message || "An unknown error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-card flex flex-col p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-2xl mx-auto shadow-2xl flex-grow flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary text-2xl justify-center">
            <Sparkles /> AI Font Identifier
          </CardTitle>
          <CardDescription className="text-center">
            Upload an image with text and let the AI describe the font.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col items-center justify-center space-y-4">
          <div className="w-full max-w-md">
            <Input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} />
          </div>
          {image && (
            <div className="relative w-full h-48 border rounded-lg bg-muted/30">
              <Image src={image} alt="Uploaded preview" fill objectFit="contain" />
            </div>
          )}
          <Button onClick={handleAnalyze} disabled={!image || isLoading} className="w-full max-w-md">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Analyze Font
          </Button>
          
          {analysis && (
            <Card className="w-full max-w-md mt-4 animate-in fade-in-50">
              <CardContent className="p-4 space-y-3">
                <div className="prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown>{analysis.description}</ReactMarkdown>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Suggested Fonts:</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {analysis.suggestions.map((font, i) => <li key={i}>{font}</li>)}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FontIdentifier;
