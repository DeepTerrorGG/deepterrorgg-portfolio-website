
'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, Wand2, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { beautifyCode } from '@/ai/flows/code-beautifier-flow';
import Image from 'next/image';

const languages = ['javascript', 'python', 'typescript', 'java', 'csharp', 'cpp', 'go', 'rust', 'html', 'css', 'sql'];
const themes = ['solarized-dark', 'monokai', 'github-dark', 'one-dark-pro', 'dracula', 'nord'];

export default function CodeBeautifier() {
  const { toast } = useToast();
  const [code, setCode] = useState(`function helloWorld() {\n  console.log("Hello, World!");\n}`);
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('solarized-dark');
  const [padding, setPadding] = useState('64');
  const [background, setBackground] = useState('#1a1b26');
  const [title, setTitle] = useState('MyCode.js');
  const [generatedImageUrl, setGeneratedImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateImage = async () => {
    if (code.trim() === '') {
      toast({ title: 'Code is empty', description: 'Please enter some code.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setGeneratedImageUrl('');

    try {
      const { code: rawCode } = await beautifyCode({ code });
      
      const params = new URLSearchParams({
        code: encodeURIComponent(rawCode),
        padding,
        background,
        title,
        theme,
        language,
      });

      const url = `/api/image?${params.toString()}`;
      setGeneratedImageUrl(url);
      toast({ title: "Image Ready", description: "Your code image has been generated."});

    } catch (error: any) {
      console.error('Error generating image link:', error);
      toast({
        title: 'Image Generation Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full p-4 bg-card">
      {/* Controls Panel */}
      <div className="flex flex-col gap-4">
        <Card className="flex-grow flex flex-col">
          <CardHeader>
            <CardTitle>Code Beautifier</CardTitle>
            <CardDescription>Create beautiful images of your code.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col gap-4">
            <div className="flex-grow flex flex-col">
              <Label htmlFor="code-input">Code</Label>
              <Textarea
                id="code-input"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your code here..."
                className="flex-grow mt-1 font-mono text-xs"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lang-select">Language (Visual Only)</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="lang-select"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {languages.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="theme-select">Theme (Visual Only)</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger id="theme-select"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {themes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
             <div>
                <Label htmlFor="title-input">Window Title</Label>
                <Input id="title-input" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <Label htmlFor="padding-input">Padding</Label>
                  <Input id="padding-input" type="number" value={padding} onChange={(e) => setPadding(e.target.value)} />
              </div>
               <div>
                  <Label htmlFor="bg-input">Background</Label>
                  <Input id="bg-input" type="color" value={background} onChange={(e) => setBackground(e.target.value)} />
              </div>
            </div>
             <Button onClick={generateImage} disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Generate Image
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Preview Panel */}
      <div className="flex flex-col gap-4">
        <Card className="flex-grow">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-full">
            {isLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : generatedImageUrl ? (
              <div className="relative w-full h-full min-h-[200px]">
                <Image 
                    src={generatedImageUrl} 
                    alt="Generated code preview" 
                    layout="fill"
                    objectFit="contain"
                />
              </div>
            ) : (
              <p className="text-muted-foreground text-center">Click "Generate Image" to see a preview.</p>
            )}
          </CardContent>
        </Card>
         {generatedImageUrl && !isLoading && (
            <a href={generatedImageUrl} download={`${title.split('.')[0] || 'code'}.png`}>
                <Button size="lg" className="w-full">
                    <Download className="mr-2 h-5 w-5" />
                    Download PNG
                </Button>
            </a>
        )}
      </div>
    </div>
  );
}
