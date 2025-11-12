
'use client';

import { chat, ChatHistory } from '@/ai/flows/chat-flow';
import { FormEvent, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Bot, User, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function AIChatbot() {
  const [history, setHistory] = useState<ChatHistory>([]);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await chat(history, message);
    } catch (e: any) {
      console.error(e);
      history.push({
        role: 'model',
        parts: [{ text: `Error: ${e.message || 'An unexpected error occurred.'}` }],
      });
    }

    setHistory([...history]);
    setMessage('');
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-4 border-b">
        <CardTitle className="text-xl">AI Chatbot</CardTitle>
      </div>
      <ScrollArea className="flex-grow p-4">
        <div className="space-y-4">
          {history.map((msg, index) => (
            <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'model' && <Bot className="h-6 w-6 text-primary" />}
              <div className={`rounded-lg p-3 max-w-[80%] ${msg.role === 'model' ? 'bg-muted' : 'bg-primary text-primary-foreground'}`}>
                <ReactMarkdown className="prose prose-sm prose-invert max-w-none">{msg.parts[0].text}</ReactMarkdown>
              </div>
              {msg.role === 'user' && <User className="h-6 w-6" />}
            </div>
          ))}
          {loading && (
             <div className="flex items-start gap-4">
                <Bot className="h-6 w-6 text-primary" />
                <div className="rounded-lg p-3 bg-muted flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin" />
                </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow"
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !message.trim()}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
