'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Wand2, Loader2, Image as ImageIcon, Download } from 'lucide-react';
import { generateProjectImage, type GenerateProjectImageInput } from '@/ai/flows/generate-project-image-flow';
import Image from 'next/image';

const AIImageGenerator: React.FC = () => {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('A vibrant, abstract painting of a futuristic city at night');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateImage = async () => {
    if (prompt.trim() === '') {
      toast({
        title: 'Empty Prompt',
        description: 'Please enter a prompt to generate an image.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setGeneratedImage(null);
    try {
      const input: GenerateProjectImageInput = { prompt };
      const result = await generateProjectImage(input);
      setGeneratedImage(result.imageDataUri);
    } catch (error) {
      console.error('Failed to generate image:', error);
      toast({
        title: 'Generation Failed',
        description: 'Could not generate an image. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'generated-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-5xl mx-auto">
        {/* Left column for inputs */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Wand2 className="h-6 w-6" />
              <span>AI Image Generator</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="prompt">Image Prompt</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A photorealistic image of a cat wearing a small wizard hat..."
                className="min-h-[150px]"
              />
              <p className="text-xs text-muted-foreground mt-1">Describe the image you want to create.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleGenerateImage} disabled={isLoading} className="w-full">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Generate Image
            </Button>
          </CardFooter>
        </Card>
        
        {/* Right column for output */}
        <Card className="shadow-lg">
           <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-6 w-6 text-primary" />
                <span>Generated Image</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[45vh] relative flex items-center justify-center">
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/50 backdrop-blur-sm rounded-lg text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="mt-2 text-muted-foreground">The AI is creating your image...</p>
              </div>
            )}
            {generatedImage ? (
              <div className="relative w-full h-full">
                <Image src={generatedImage} alt="AI generated image" fill className="object-contain rounded-md" />
              </div>
            ) : (
              !isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <p>Your generated image will appear here.</p>
                </div>
              )
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleDownload} disabled={!generatedImage || isLoading} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download Image
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AIImageGenerator;
