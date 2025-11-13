'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { generateSimpleText } from '@/ai/flows/simple-text-flow';

export default function AiChatTestPage() {
  const [prompt, setPrompt] = useState('Explain how AI works in a few words');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResponse('');

    try {
      const result = await generateSimpleText(prompt);
      setResponse(result);
    } catch (error: any) {
      setResponse(`Error: ${error.message}`);
    }

    setLoading(false);
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Simple AI Chat Test</CardTitle>
          <CardDescription>
            A minimal page to test the connection to the AI model.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt here..."
              rows={3}
              disabled={loading}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ask AI
            </Button>
          </form>

          {(loading || response) && (
            <div className="mt-6 border-t pt-4">
              <h3 className="font-semibold mb-2">Response:</h3>
              <div className="p-4 bg-muted rounded-md min-h-[100px]">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{response}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
