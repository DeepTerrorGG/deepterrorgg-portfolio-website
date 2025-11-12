
'use client';

import { generateStory } from '@/ai/flows/story-generator-flow';
import { 
  type Story, 
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

const genres: StoryGenre[] = ['Any', 'Fantasy', 'Science Fiction', 'Mystery', 'Horror', 'Romance', 'Comedy'];
const styles: StoryStyle[] = ['Default', 'Poetic', 'Gritty', 'Humorous', 'Epistolary (told through letters)'];
const twists: StoryPlotTwist[] = ['None', 'Betrayal', 'Amnesia', 'It was all a dream', 'The hero is the villain', 'An unexpected inheritance'];

export default function AIStoryGenerator() {
  const [character, setCharacter] = useState<string>('A brave knight');
  const [setting, setSetting] = useState<string>('A dark forest');
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(false);

  const [genre, setGenre] = useState<StoryGenre>('Any');
  const [style, setStyle] = useState<StoryStyle>('Default');
  const [twist, setTwist] = useState<StoryPlotTwist>('None');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
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
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                    <Label htmlFor='character-input'>Character</Label>
                    <Input
                        id='character-input'
                        type="text"
                        value={character}
                        onChange={(e) => setCharacter(e.target.value)}
                        placeholder="Enter a character..."
                        disabled={loading}
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
                        disabled={loading}
                        className='mt-1'
                    />
                </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div>
                    <Label>Genre</Label>
                    <Select value={genre} onValueChange={v => setGenre(v as StoryGenre)}>
                        <SelectTrigger className='mt-1'><SelectValue /></SelectTrigger>
                        <SelectContent>{genres.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Literary Style</Label>
                    <Select value={style} onValueChange={v => setStyle(v as StoryStyle)}>
                        <SelectTrigger className='mt-1'><SelectValue /></SelectTrigger>
                        <SelectContent>{styles.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Plot Twist</Label>
                    <Select value={twist} onValueChange={v => setTwist(v as StoryPlotTwist)}>
                        <SelectTrigger className='mt-1'><SelectValue /></SelectTrigger>
                        <SelectContent>{twists.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
            </div>


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
