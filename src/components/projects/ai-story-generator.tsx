
'use client';

import { generateStory } from '@/ai/flows/story-generator-flow';
import { 
  type StoryPrompt,
  type StoryGenre,
  type StoryStyle,
  type StoryPlotTwist
} from '@/ai/flows/story-generator-flow-types';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { logActivity } from '@/lib/logger';

const genres: StoryGenre[] = ['Any', 'Fantasy', 'Science Fiction', 'Mystery', 'Horror', 'Romance', 'Comedy'];
const styles: StoryStyle[] = ['Default', 'Poetic', 'Gritty', 'Humorous', 'Epistolary (told through letters)'];
const twists: StoryPlotTwist[] = ['None', 'Betrayal', 'Amnesia', 'It was all a dream', 'The hero is the villain', 'An unexpected inheritance'];

interface AIStoryGeneratorProps {
    onGenerate: () => boolean;
    usageLeft: number;
}

export default function AIStoryGenerator({ onGenerate, usageLeft }: AIStoryGeneratorProps) {
  const [character, setCharacter] = useState<string>('A brave knight');
  const [setting, setSetting] = useState<string>('A dark forest');
  const [story, setStory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [genre, setGenre] = useState<StoryGenre>('Any');
  const [style, setStyle] = useState<StoryStyle>('Default');
  const [twist, setTwist] = useState<StoryPlotTwist>('None');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!onGenerate()) return;

    setLoading(true);
    setStory(null);

    const prompt: StoryPrompt = {
      character,
      setting,
      genre,
      style,
      twist
    };

    try {
      const result = await generateStory(prompt);
      if (result) {
        setStory(result);
        logActivity(`Generated AI story with prompt: "${character} in ${setting}"`);
      }
    } catch (error) {
      console.error(error);
      logActivity(`Failed to generate AI story. Error: ${(error as Error).message}`, 'error');
      // Handle error display
    }

    setLoading(false);
  };

  const { title, storyText } = (() => {
    if (!story) return { title: '', storyText: '' };
    const lines = story.split('\n');
    const storyTitle = lines[0] || 'Untitled Story';
    const storyContent = lines.slice(1).join('\n').trim();
    return { title: storyTitle, storyText: storyContent };
  })();

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
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                    <Label htmlFor='character-input'>Character</Label>
                    <Input
                        id='character-input'
                        type="text"
                        value={character}
                        onChange={(e) => setCharacter(e.target.value)}
                        placeholder="Enter a character..."
                        disabled={loading || usageLeft <= 0}
                        className='mt-1'
                    />
                </div>
                <div>
                    <Label htmlFor='setting-input'>Setting</Label>
                    <Input
                        id='setting-input'
                        type="text"
                        value={setting}
                        onChange={(e) => setSetting(e.target.value)}
                        placeholder="Enter a setting..."
                        disabled={loading || usageLeft <= 0}
                        className='mt-1'
                    />
                </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div>
                    <Label>Genre</Label>
                    <Select value={genre} onValueChange={v => setGenre(v as StoryGenre)} disabled={loading || usageLeft <= 0}>
                        <SelectTrigger className='mt-1'><SelectValue /></SelectTrigger>
                        <SelectContent>{genres.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Literary Style</Label>
                    <Select value={style} onValueChange={v => setStyle(v as StoryStyle)} disabled={loading || usageLeft <= 0}>
                        <SelectTrigger className='mt-1'><SelectValue /></SelectTrigger>
                        <SelectContent>{styles.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Plot Twist</Label>
                    <Select value={twist} onValueChange={v => setTwist(v as StoryPlotTwist)} disabled={loading || usageLeft <= 0}>
                        <SelectTrigger className='mt-1'><SelectValue /></SelectTrigger>
                        <SelectContent>{twists.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
            </div>


            <Button type="submit" className="w-full" disabled={loading || usageLeft <= 0}>
              {loading ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" /> ) : 
                (usageLeft > 0 ? 'Generate Story' : 'Usage Limit Reached')
              }
            </Button>
          </form>

          {loading && (
            <div className="mt-4 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {story && (
            <ScrollArea className="mt-6 border p-4 rounded-md h-[40vh]">
              <h2 className="text-2xl font-bold text-primary">{title}</h2>
              <p className="mt-4 whitespace-pre-wrap">{storyText}</p>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
