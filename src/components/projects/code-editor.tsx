
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { analyzeCode } from '@/ai/flows/code-analyzer-flow';
import { type CodeTask, type CodeLanguage } from '@/ai/flows/code-analyzer-flow-types';
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from '../ui/scroll-area';
import { Label } from '../ui/label';

const languages: CodeLanguage[] = ['Auto-detect', 'JavaScript', 'Python', 'TypeScript', 'Java', 'C++', 'HTML', 'CSS'];

export default function CodeEditor() {
  const [code, setCode] = useState<string>('function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}');
  const [task, setTask] = useState<CodeTask>('explain');
  const [language, setLanguage] = useState<CodeLanguage>('Auto-detect');
  const [output, setOutput] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setOutput('');

    try {
      const result = await analyzeCode({ task, code, language });
      if (result) {
        setOutput(result);
      }
    } catch (error) {
      console.error(error);
      setOutput('An error occurred while processing the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full p-4 bg-card">
        {/* Editor Panel */}
        <div className="flex flex-col gap-4">
            <Card className="flex-grow flex flex-col">
                <CardContent className="p-4 flex-grow flex flex-col">
                    <Textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Enter your code here..."
                        className="flex-grow resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-4 text-base font-mono bg-muted"
                    />
                </CardContent>
            </Card>
            <div className="flex flex-col sm:flex-row gap-2">
                <div className='flex-grow'>
                    <Label htmlFor='task-select' className='text-xs'>Task</Label>
                    <Select value={task} onValueChange={(v) => setTask(v as CodeTask)}>
                        <SelectTrigger id='task-select' className="w-full">
                            <SelectValue placeholder="Select a task" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="explain">Explain</SelectItem>
                            <SelectItem value="refactor">Refactor</SelectItem>
                            <SelectItem value="comment">Add Comments</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className='flex-grow'>
                    <Label htmlFor='lang-select' className='text-xs'>Language</Label>
                    <Select value={language} onValueChange={(v) => setLanguage(v as CodeLanguage)}>
                        <SelectTrigger id='lang-select' className="w-full">
                            <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                           {languages.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleSubmit} disabled={loading} className="w-full sm:w-48 self-end">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Run AI Task
                </Button>
            </div>
        </div>

        {/* Output Panel */}
        <Card className="flex flex-col">
             <CardContent className="p-4 flex-grow overflow-hidden">
                 <ScrollArea className="h-full">
                    <div className="prose prose-sm prose-invert max-w-none">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <ReactMarkdown>{output}</ReactMarkdown>
                        )}
                    </div>
                </ScrollArea>
             </CardContent>
        </Card>
    </div>
  );
}
