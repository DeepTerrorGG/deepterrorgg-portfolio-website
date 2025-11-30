
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Send, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { continueStory } from '@/ai/flows/collaborative-story-flow';
import { StoryGenre, StoryGenreSchema, type StoryMessage } from '@/ai/flows/collaborative-story-flow-types';

const genres = StoryGenreSchema.options;

const CollaborativeStoryteller: React.FC = () => {
  const { toast } = useToast();
  const [story, setStory] = useState<StoryMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [genre, setGenre] = useState<StoryGenre>('Fantasy');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [story]);

  const handleSend = async () => {
    if (!userInput.trim()) {
      toast({ title: "Please write something to continue the story.", variant: "destructive" });
      return;
    }

    const userMessage: StoryMessage = { role: 'user', content: userInput };
    const newStoryHistory = [...story, userMessage];
    setStory(newStoryHistory);
    setUserInput('');
    setIsLoading(true);

    try {
      const aiResponse = await continueStory({ genre, history: newStoryHistory });
      setStory(prev => [...prev, { role: 'model', content: aiResponse }]);
    } catch (error: any) {
      console.error(error);
      toast({ title: 'AI Error', description: error.message || 'Could not continue the story.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const startNewStory = () => {
    setStory([]);
    setUserInput('');
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center w-full min-h-full bg-card p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-2xl mx-auto shadow-2xl h-[70vh] flex flex-col">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl font-bold text-primary">
                <BookOpen /> Collaborative Storyteller
              </CardTitle>
              <CardDescription>Write a story with an AI partner.</CardDescription>
            </div>
            <div className="w-full sm:w-48">
              <Label>Genre</Label>
              <Select value={genre} onValueChange={(g) => { setGenre(g as StoryGenre); startNewStory(); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {genres.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-0 overflow-hidden">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="p-6 space-y-6">
              {story.length === 0 && (
                <div className="text-center text-muted-foreground">
                  <p>Start the story! Write the first sentence or paragraph below.</p>
                </div>
              )}
              {story.map((message, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    {message.role === 'user' ? '👤' : <Sparkles className="h-5 w-5 text-primary" />}
                  </div>
                  <p className="flex-grow pt-1 leading-relaxed">{message.content}</p>
                </div>
              ))}
              {isLoading && (
                 <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                  <p className="flex-grow pt-1 text-muted-foreground italic">AI is writing...</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              placeholder={story.length === 0 ? "Once upon a time..." : "Continue the story..."}
              rows={2}
              disabled={isLoading}
              onKeyDown={(e) => {
                if(e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                }
              }}
            />
            <Button onClick={handleSend} disabled={isLoading} className="self-end">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CollaborativeStoryteller;
