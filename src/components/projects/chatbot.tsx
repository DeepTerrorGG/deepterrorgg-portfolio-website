
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Send, Loader2, RefreshCw, Trash2, Edit, Copy, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { chat, type ChatInput } from '@/ai/flows/chat-flow';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';

interface Message {
  role: 'user' | 'model';
  content: string;
}

const Chatbot: React.FC = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom when messages change
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const callChatApi = async (history: Message[], message: string) => {
    setIsLoading(true);
    try {
      const chatInput: ChatInput = { history, message };
      const result = await chat(chatInput);
      const modelMessage: Message = { role: 'model', content: result.response };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      toast({
        title: 'Error',
        description: 'Failed to get a response from the AI.',
        variant: 'destructive',
      });
      // Rollback the user message if API fails
      setMessages(history);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSendMessage = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newHistory = [...messages, userMessage];
    
    setMessages(newHistory);
    const messageToSend = input;
    setInput('');
    
    await callChatApi(messages, messageToSend);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleRegenerateResponse = async (messageIndex: number) => {
    if (isLoading) return;
    const historyToResend = messages.slice(0, messageIndex);
    const userPrompt = historyToResend[historyToResend.length - 1];

    if(userPrompt.role !== 'user') return;
    
    setMessages(historyToResend); // Rewind UI
    await callChatApi(historyToResend.slice(0, -1), userPrompt.content);
  };

  const handleDeleteMessage = (indexToDelete: number) => {
    setMessages(prev => prev.slice(0, indexToDelete));
    toast({ title: 'Message Deleted', description: 'The conversation has been rewound.' });
  };
  
  const handleEditMessage = (indexToEdit: number) => {
      setEditingIndex(indexToEdit);
      setEditingText(messages[indexToEdit].content);
  };
  
  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingText('');
  }

  const handleSaveEdit = async () => {
    if (editingIndex === null) return;
    if (editingText.trim() === '') {
        toast({ title: "Message cannot be empty", variant: "destructive" });
        return;
    }

    const updatedUserMessage: Message = { role: 'user', content: editingText };
    // History up to the point of the edited message
    const historyForApi = messages.slice(0, editingIndex);

    // Update UI immediately with edited message and show loading for new response
    setMessages([...historyForApi, updatedUserMessage]);
    const messageToSend = editingText;
    setEditingIndex(null);
    setEditingText('');
    await callChatApi(historyForApi, messageToSend);
  };
  
  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: "Copied!", description: "Message copied to clipboard." });
  };

  const handleClearChat = () => {
      setMessages([]);
      toast({ title: "Chat Cleared" });
  }

  return (
    <div className="flex flex-col h-full bg-card text-card-foreground">
       <div className="p-2 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold pl-2">AI Chat</h3>
        <Button variant="ghost" size="sm" onClick={handleClearChat} disabled={isLoading || messages.length === 0}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear
        </Button>
      </div>

      <div className="flex-grow p-4 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="space-y-4 pr-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-end gap-3 group relative',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                 {message.role === 'model' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    <Bot size={20} />
                  </div>
                )}

                {editingIndex === index ? (
                  <div className="w-full max-w-xs md:max-w-md lg:max-w-lg space-y-2">
                    <Textarea 
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSaveEdit();
                          }
                          if(e.key === 'Escape') {
                              handleCancelEdit();
                          }
                      }}
                    />
                    <div className='flex justify-end gap-2'>
                       <Button size="sm" onClick={handleSaveEdit}>
                           <Check className="h-4 w-4" />
                       </Button>
                       <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                           <X className="h-4 w-4" />
                       </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={cn(
                      'max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg',
                       message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                )}
                
                {message.role === 'user' && (
                   <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground">
                    <User size={20} />
                  </div>
                )}

                {/* Action buttons on hover */}
                {!isLoading && editingIndex === null && (
                    <div className={cn("absolute bottom-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity", 
                    message.role === 'user' ? "left-0 -translate-x-full pr-2" : "right-0 translate-x-full pl-2")}>
                      {message.role === 'user' && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditMessage(index)}>
                              <Edit className="h-4 w-4" />
                          </Button>
                      )}
                      {message.role === 'model' && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRegenerateResponse(index)}>
                              <RefreshCw className="h-4 w-4" />
                          </Button>
                      )}
                       <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopyMessage(message.content)}>
                          <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteMessage(index)}>
                          <Trash2 className="h-4 w-4" />
                      </Button>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3 justify-start">
                 <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    <Bot size={20} />
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                      <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-grow"
            disabled={isLoading || editingIndex !== null}
          />
          <Button onClick={handleSendMessage} disabled={isLoading || input.trim() === '' || editingIndex !== null}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
    

    

    
