'use client';

import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

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


const CodeEditor: React.FC = () => {
  const [html, setHtml] = useState('<h1>Hello, World!</h1>\n<p>This is a live code editor.</p>');
  const [css, setCss] = useState('body {\n  background-color: #1a1a1a;\n  color: #f0f0f0;\n  font-family: sans-serif;\n  text-align: center;\n  padding-top: 20px;\n}');
  const [js, setJs] = useState('document.querySelector("h1").addEventListener("click", () => {\n  alert("You clicked the header!");\n});');

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

  const Editor = ({ language, value, onChange }: { language: string, value: string, onChange: (val: string) => void }) => (
     <div className="h-full flex flex-col">
        <div className="bg-muted px-4 py-2 font-mono text-sm text-muted-foreground">{language}</div>
        <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full flex-grow resize-none border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 p-4 font-mono text-sm bg-background"
            placeholder={`Write your ${language} here...`}
            spellCheck="false"
        />
     </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 w-full h-full bg-card">
      {/* Editor Panel */}
      <div className="flex flex-col">
        <Tabs defaultValue="html" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 rounded-none">
                <TabsTrigger value="html">HTML</TabsTrigger>
                <TabsTrigger value="css">CSS</TabsTrigger>
                <TabsTrigger value="js">JS</TabsTrigger>
            </TabsList>
            <TabsContent value="html" className="flex-grow m-0">
                <Editor language="HTML" value={html} onChange={setHtml} />
            </TabsContent>
            <TabsContent value="css" className="flex-grow m-0">
                <Editor language="CSS" value={css} onChange={setCss} />
            </TabsContent>
            <TabsContent value="js" className="flex-grow m-0">
                <Editor language="JavaScript" value={js} onChange={setJs} />
            </TabsContent>
        </Tabs>
      </div>

      {/* Preview Panel */}
      <div className="flex flex-col">
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
  );
};

export default CodeEditor;
