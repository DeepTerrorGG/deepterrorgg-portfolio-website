
'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const placeholderText = `
# Welcome to the Markdown Editor!

## This is a live preview

- Type your Markdown in the left panel.
- See the rendered HTML in the right panel.

### Features
* Supports GitHub Flavored Markdown (GFM)
* Live preview updates as you type
* Simple, clean interface

\`\`\`javascript
// Example code block
function greet() {
  console.log("Hello, World!");
}
\`\`\`

> This is a blockquote.

[Visit my portfolio](/) to see more projects.
`;

const MarkdownEditor: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>(placeholderText);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full p-4 bg-card">
      {/* Editor Panel */}
      <div className="flex flex-col">
        <h3 className="text-lg font-semibold mb-2 pl-2 text-center md:text-left">Markdown</h3>
        <Card className="flex-grow">
          <Textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="w-full h-full resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-4 text-base"
            placeholder="Type your markdown here..."
          />
        </Card>
      </div>

      {/* Preview Panel */}
      <div className="flex flex-col">
        <h3 className="text-lg font-semibold mb-2 pl-2 text-center md:text-left">Preview</h3>
        <Card className="flex-grow overflow-hidden">
            <ScrollArea className="h-full">
                <CardContent className="p-4">
                    <article className="prose prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
                    </article>
                </CardContent>
            </ScrollArea>
        </Card>
      </div>
       <style jsx global>{`
        .prose {
            --tw-prose-body: hsl(var(--foreground) / 0.9);
            --tw-prose-headings: hsl(var(--primary));
            --tw-prose-lead: hsl(var(--muted-foreground));
            --tw-prose-links: hsl(var(--primary));
            --tw-prose-bold: hsl(var(--foreground));
            --tw-prose-counters: hsl(var(--muted-foreground));
            --tw-prose-bullets: hsl(var(--border));
            --tw-prose-hr: hsl(var(--border));
            --tw-prose-quotes: hsl(var(--foreground));
            --tw-prose-quote-borders: hsl(var(--primary));
            --tw-prose-captions: hsl(var(--muted-foreground));
            --tw-prose-code: hsl(var(--primary-foreground));
            --tw-prose-pre-code: hsl(var(--primary-foreground));
            --tw-prose-pre-bg: hsl(var(--muted));
            --tw-prose-th-borders: hsl(var(--border));
            --tw-prose-td-borders: hsl(var(--border));
        }
       `}</style>
    </div>
  );
};

export default MarkdownEditor;
