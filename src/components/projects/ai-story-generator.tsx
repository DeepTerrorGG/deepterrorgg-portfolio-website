
'use client';

import { generateStory } from '@/ai/flows/story-generator-flow';
import { 
  type Story, 
  type StoryPrompt 
} from '@/ai/flows/story-generator-flow-types';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function AIStoryGenerator() {
  const [character, setCharacter] = useState<string>('');
  const [setting, setSetting] = useState<string>('');
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStory(null);

    const prompt: StoryPrompt = {
      character,
      setting,
    };

    try {
      const result = await generateStory(prompt);
      if (result) {
        setStory(result);
      }
    } catch (error) {
      console.error(error);
      // Handle error display
    }

    setLoading(false);
  };

  return (
    <div className="p-4 md:p-8 flex items-center justify-center bg-card h-full">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>AI Story Generator</CardTitle>
          <CardDescription>
            Create a story with a character and a setting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              value={character}
              onChange={(e) => setCharacter(e.target.value)}
              placeholder="Enter a character..."
              disabled={loading}
            />
            <Input
              type="text"
              value={setting}
              onChange={(e) => setSetting(e.target.value)}
              placeholder="Enter a setting..."
              disabled={loading}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Story
            </Button>
          </form>

          {loading && (
            <div className="mt-4 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {story && (
            <ScrollArea className="mt-6 border p-4 rounded-md h-[40vh]">
              <h2 className="text-2xl font-bold text-primary">{story.title}</h2>
              <p className="mt-4 whitespace-pre-wrap">{story.story}</p>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
