'use client';

import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Bot, Code, Copy, Send, Loader2 } from 'lucide-react';
import { chat, type ChatInput } from '@/ai/flows/chat-flow';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';


// Simple debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface Message {
  role: 'user' | 'model';
  content: string;
}

const CodeEditor: React.FC = () => {
  const { toast } = useToast();
  // Editor state
  const [html, setHtml] = useState('<h1>Hello, World!</h1>\n<p>This is a live code editor.</p>');
  const [css, setCss] = useState('body {\n  background-color: #1a1a1a;\n  color: #f0f0f0;\n  font-family: sans-serif;\n  text-align: center;\n  padding-top: 20px;\n}');
  const [js, setJs] = useState('document.querySelector("h1").addEventListener("click", () => {\n  alert("You clicked the header!");\n});');
  const [activeTab, setActiveTab] = useState('html');

  // AI Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const debouncedHtml = useDebounce(html, 500);
  const debouncedCss = useDebounce(css, 500);
  const debouncedJs = useDebounce(js, 500);
  
  const [srcDoc, setSrcDoc] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSrcDoc(`
        <html>
          <head>
            <style>${debouncedCss}</style>
          </head>
          <body>
            ${debouncedHtml}
            <script>${debouncedJs}<\/script>
          </body>
        </html>
      `);
    }, 250);
    return () => clearTimeout(timeout);
  }, [debouncedHtml, debouncedCss, debouncedJs]);

  const handleSendMessage = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newHistory = [...messages, userMessage];
    
    setMessages(newHistory);
    const messageToSend = `You are a code generation assistant. Only generate code for HTML, CSS, or JavaScript based on the user's request. Keep explanations brief. Request: "${input}"`;
    setInput('');
    setIsLoading(true);

    try {
      const chatInput: ChatInput = { history: messages, message: messageToSend };
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
      setMessages(messages); // Rollback
    } finally {
      setIsLoading(false);
    }
  };

  const copyCodeToEditor = (code: string, lang: string) => {
    let targetSetter;
    if (lang === 'html') targetSetter = setHtml;
    else if (lang === 'css') targetSetter = setCss;
    else if (lang === 'javascript' || lang === 'js') targetSetter = setJs;
    else {
        toast({ title: 'Unsupported Language', description: 'Can only copy HTML, CSS, or JS.', variant: 'destructive'});
        return;
    }
    
    targetSetter(prev => prev + '\n' + code);
    toast({ title: 'Code Copied!', description: `The ${lang.toUpperCase()} code has been added to the editor.` });
  };
  
  const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      const lang = match ? match[1] : '';
      const code = String(children).replace(/\n$/, '');

      return !inline ? (
          <div className="relative my-4 rounded-md bg-muted font-mono text-sm">
              <div className="flex items-center justify-between px-4 py-1 border-b">
                <span className="text-xs text-muted-foreground">{lang}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyCodeToEditor(code, lang)}>
                    <Copy className="h-4 w-4"/>
                </Button>
              </div>
              <pre {...props} className="p-4 overflow-x-auto">{children}</pre>
          </div>
      ) : (
          <code className={cn("relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold", className)} {...props}>{children}</code>
      );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-0 w-full h-full bg-card">
      {/* AI Chat Panel */}
      <div className="md:col-span-1 flex flex-col border-r">
          <div className="p-4 border-b flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary"/>
            <h3 className="font-semibold text-lg">AI Code Assistant</h3>
          </div>
          <ScrollArea className="flex-grow p-4">
            <div className="space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={cn("flex", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                        <div className={cn("max-w-[90%] rounded-lg p-3 text-sm", msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                           <ReactMarkdown components={{ code: CodeBlock }}>{msg.content}</ReactMarkdown>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-muted p-3 rounded-lg"><Loader2 className="h-5 w-5 animate-spin" /></div>
                    </div>
                )}
            </div>
          </ScrollArea>
          <div className="p-4 border-t">
              <div className="flex items-center gap-2">
                  <Textarea
                    placeholder="e.g., 'Create a red button'"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
                    rows={2}
                    className="flex-grow resize-none"
                    disabled={isLoading}
                  />
                  <Button onClick={handleSendMessage} disabled={isLoading || input.trim() === ''}><Send className="h-4 w-4" /></Button>
              </div>
          </div>
      </div>

      {/* Editor & Preview Panel */}
      <div className="md:col-span-2 grid grid-rows-2 h-full">
        <div className="flex flex-col row-span-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-3 rounded-none">
                    <TabsTrigger value="html">HTML</TabsTrigger>
                    <TabsTrigger value="css">CSS</TabsTrigger>
                    <TabsTrigger value="js">JS</TabsTrigger>
                </TabsList>
                <TabsContent value="html" className="flex-grow m-0">
                    <Textarea value={html} onChange={(e) => setHtml(e.target.value)} className="w-full h-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-mono text-sm bg-background"/>
                </TabsContent>
                <TabsContent value="css" className="flex-grow m-0">
                    <Textarea value={css} onChange={(e) => setCss(e.target.value)} className="w-full h-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-mono text-sm bg-background"/>
                </TabsContent>
                <TabsContent value="js" className="flex-grow m-0">
                    <Textarea value={js} onChange={(e) => setJs(e.target.value)} className="w-full h-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 font-mono text-sm bg-background"/>
                </TabsContent>
            </Tabs>
        </div>
        <div className="flex flex-col row-span-1 border-t">
            <div className="bg-muted px-4 py-2 font-mono text-sm text-muted-foreground">Preview</div>
            <Card className="flex-grow overflow-hidden rounded-none border-0">
            <iframe
                srcDoc={srcDoc}
                title="output"
                sandbox="allow-scripts"
                frameBorder="0"
                width="100%"
                height="100%"
                className="bg-white"
            />
            </Card>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
