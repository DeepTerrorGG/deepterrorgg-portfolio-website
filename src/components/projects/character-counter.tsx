'use client';

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const CharacterCounter: React.FC = () => {
  const [text, setText] = useState('');

  const charCount = text.length;
  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-lg mx-auto shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold text-primary">Character & Word Counter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid w-full gap-1.5">
            <Label htmlFor="message">Your Text</Label>
            <Textarea
              placeholder="Type your text here..."
              id="message"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[200px] text-base"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-around">
          <div className="text-center">
            <p className="text-2xl font-bold">{charCount}</p>
            <p className="text-sm text-muted-foreground">Characters</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{wordCount}</p>
            <p className="text-sm text-muted-foreground">Words</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CharacterCounter;
