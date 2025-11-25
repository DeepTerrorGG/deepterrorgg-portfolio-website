
'use client';

import { chat } from '@/ai/flows/chat-flow';
import { type ChatMessage, ChatPersonalitySchema, type ChatPersonality } from '@/ai/flows/chat-flow-types';
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, User, Loader2, RefreshCw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '../ui/card';

const personalities = ChatPersonalitySchema.options;

export default function AIChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: 'Hello! How can I help you today?',
    },
  ]);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [personality, setPersonality] = useState<ChatPersonality>('Default');

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleReset = () => {
    setMessages([
      {
        role: 'model',
        content: 'Hello! How can I help you today?',
      },
    ]);
    setCurrentMessage('');
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: currentMessage };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    setLoading(true);
    setCurrentMessage('');

    // Prepare history for AI model
    const historyForAI = newMessages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    try {
      const responseText = await chat(historyForAI, personality);
      const aiMessage: ChatMessage = { role: 'model', content: responseText };
      setMessages([...newMessages, aiMessage]);
    } catch (e: any) {
      console.error(e);
      const errorMessage: ChatMessage = { role: 'model', content: `Error: ${e.message || 'An unexpected error occurred.'}` };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-card p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-2xl h-[70vh] flex flex-col shadow-2xl">
          <CardHeader className="p-4 border-b flex flex-row justify-between items-center bg-card shrink-0">
            <div className='w-48'>
              <Select value={personality} onValueChange={(p) => setPersonality(p as ChatPersonality)}>
                <SelectTrigger><SelectValue placeholder="Select a personality" /></SelectTrigger>
                <SelectContent>{personalities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button onClick={handleReset} variant="ghost" size="icon" className="text-muted-foreground">
                  <RefreshCw className="h-5 w-5" />
                  <span className="sr-only">New Chat</span>
              </Button>
          </CardHeader>
          <CardContent className="flex-grow p-0 overflow-hidden">
            <ScrollArea className="h-full p-6" ref={scrollAreaRef}>
              <div className="space-y-6">
                {messages.map((msg, index) => (
                  <div key={index} className={cn('flex items-start gap-4 text-base', msg.role === 'user' && 'justify-end')}>
                    {msg.role === 'model' && (
                      <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground flex-shrink-0'>
                        <Bot className="h-6 w-6" />
                      </div>
                    )}
                    <div className={cn(
                      'rounded-lg p-3 max-w-[80%] prose prose-sm prose-invert max-w-none', 
                      msg.role === 'model' ? 'bg-muted' : 'bg-primary text-primary-foreground',
                      msg.content.toLowerCase().includes('error:') && 'bg-destructive text-destructive-foreground'
                    )}>
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    {msg.role === 'user' && (
                      <div className='flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground flex-shrink-0'>
                        <User className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex items-start gap-4 text-base">
                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground flex-shrink-0'>
                        <Bot className="h-6 w-6" />
                    </div>
                    <div className="rounded-lg p-3 bg-muted flex items-center"><Loader2 className="h-5 w-5 animate-spin" /></div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <div className="p-4 border-t bg-card shrink-0">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow h-12 text-base"
                disabled={loading}
              />
              <Button type="submit" disabled={loading || !currentMessage.trim()} className="h-12 text-base px-6">Send</Button>
            </form>
          </div>
      </Card>
    </div>
  );
}
