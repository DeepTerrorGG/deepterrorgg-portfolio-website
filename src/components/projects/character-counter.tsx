'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const CharacterCounter: React.FC = () => {
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const characters = text.length;
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const lines = text.split('\n').length;
    return { characters, words, lines };
  }, [text]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-xl mx-auto shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold text-primary">Character Counter</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="text-input" className="sr-only">Text Input</Label>
          <Textarea
            id="text-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here..."
            className="min-h-[250px] text-base"
          />
        </CardContent>
        <CardFooter className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{stats.characters}</p>
            <p className="text-sm text-muted-foreground">Characters</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.words}</p>
            <p className="text-sm text-muted-foreground">Words</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.lines}</p>
            <p className="text-sm text-muted-foreground">Lines</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CharacterCounter;
