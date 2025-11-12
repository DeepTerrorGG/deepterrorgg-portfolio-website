'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Wand2, Loader2, BookOpen } from 'lucide-react';
import { generateStory, type GenerateStoryInput, type GenerateStoryOutput } from '@/ai/flows/story-generator-flow';
import { ScrollArea } from '../ui/scroll-area';

const AiStoryGenerator: React.FC = () => {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('A lone astronaut discovers a mysterious signal from an uncharted planet.');
  const [story, setStory] = useState<GenerateStoryOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateStory = async () => {
    if (prompt.trim() === '') {
      toast({
        title: 'Empty Prompt',
        description: 'Please enter a prompt to start the story.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setStory(null);
    try {
      const input: GenerateStoryInput = { prompt };
      const result = await generateStory(input);
      setStory(result);
    } catch (error) {
      console.error('Failed to generate story:', error);
      toast({
        title: 'Generation Failed',
        description: 'Could not generate a story. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-5xl mx-auto">
        {/* Left column for inputs */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Wand2 className="h-6 w-6" />
              <span>AI Story Generator</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="prompt">Story Prompt</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A detective who can talk to ghosts..."
                className="min-h-[150px]"
              />
              <p className="text-xs text-muted-foreground mt-1">Give the AI a starting point for its story.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleGenerateStory} disabled={isLoading} className="w-full">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Generate Story
            </Button>
          </CardFooter>
        </Card>
        
        {/* Right column for output */}
        <Card className="shadow-lg">
           <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                <span>Your Generated Story</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[45vh] relative">
            <ScrollArea className="h-full">
                {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/50 backdrop-blur-sm rounded-lg text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="mt-2 text-muted-foreground">The AI is writing...</p>
                </div>
                )}
                {story ? (
                <article className="prose prose-sm prose-invert max-w-none pr-4">
                    {story.story.split('\n').map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                    ))}
                </article>
                ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <p>Your generated story will appear here.</p>
                </div>
                )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AiStoryGenerator;
