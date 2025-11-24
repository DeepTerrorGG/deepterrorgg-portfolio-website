
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Zap, Gauge, Check, Languages } from 'lucide-react';
import { snippets, type Language } from '@/lib/code-snippets';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '@/lib/utils';

const CodeRacer: React.FC = () => {
    const [language, setLanguage] = useState<Language>('javascript');
    const [snippet, setSnippet] = useState(snippets[language]);
    const [userInput, setUserInput] = useState('');
    
    const [startTime, setStartTime] = useState<number | null>(null);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [isFinished, setIsFinished] = useState(false);
    
    const editorRef = useRef<any>(null);
    const monaco = useMonaco();

    useEffect(() => {
        // Configure Monaco editor theme
        monaco?.editor.defineTheme('code-racer-theme', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
                'editor.background': '#0D1117', // A very dark background
            },
        });
        monaco?.editor.setTheme('code-racer-theme');
    }, [monaco]);
    
    const resetGame = useCallback(() => {
        const newLang = language;
        setSnippet(snippets[newLang]);
        setUserInput('');
        setStartTime(null);
        setWpm(0);
        setAccuracy(100);
        setIsFinished(false);
        editorRef.current?.focus();
    }, [language]);

    useEffect(() => {
        resetGame();
    }, [language, resetGame]);

    const handleEditorChange = (value: string | undefined) => {
        const currentInput = value || '';
        if (isFinished) return;

        if (!startTime && currentInput.length > 0) {
            setStartTime(Date.now());
        }

        setUserInput(currentInput);

        let errors = 0;
        for (let i = 0; i < currentInput.length; i++) {
            if (currentInput[i] !== snippet[i]) {
                errors++;
            }
        }
        const correctChars = currentInput.length - errors;
        const currentAccuracy = currentInput.length > 0 ? (correctChars / currentInput.length) * 100 : 100;
        setAccuracy(currentAccuracy);
        
        if (startTime) {
            const timeElapsed = (Date.now() - startTime) / 1000 / 60; // in minutes
            const wordsTyped = correctChars / 5; // Standard WPM calculation
            setWpm(timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0);
        }

        if (currentInput.length === snippet.length) {
            setIsFinished(true);
        }
    };
    
    const getHighlightedText = () => {
        return snippet.split('').map((char, index) => {
            let className = 'text-gray-500';
            if (index < userInput.length) {
                className = char === userInput[index] ? 'text-green-400' : 'text-red-500 bg-red-900/50';
            }
            return `<span class="${className}">${char === '\n' ? '&#9166;\n' : char}</span>`;
        }).join('');
    };
    
    return (
        <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
            <Card className="w-full max-w-4xl mx-auto shadow-2xl bg-[#0D1117] border-gray-800">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-primary text-center">Code Racer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="relative font-mono text-lg p-4 rounded-lg bg-black/30 border border-gray-700 h-64 overflow-y-auto">
                        <pre
                            className="whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ __html: getHighlightedText() }}
                        />
                         <div
                            className="absolute top-4 left-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)]"
                        >
                            <Editor
                                value={userInput}
                                onChange={handleEditorChange}
                                onMount={(editor) => { editorRef.current = editor; editor.focus(); }}
                                language={language}
                                theme="code-racer-theme"
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 18,
                                    lineNumbers: 'off',
                                    glyphMargin: false,
                                    folding: false,
                                    lineDecorationsWidth: 0,
                                    lineNumbersMinChars: 0,
                                    wordWrap: 'on',
                                    scrollbar: { vertical: 'hidden', horizontal: 'hidden' },
                                    overviewRulerLanes: 0,
                                    hideCursorInOverviewRuler: true,
                                    cursorBlinking: 'smooth',
                                    cursorStyle: 'line',
                                    renderLineHighlight: 'none',
                                    overviewRulerBorder: false,
                                    
                                }}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="bg-black/30 p-3 rounded-lg">
                            <p className="text-2xl font-bold text-cyan-400">{wpm}</p>
                            <p className="text-sm text-muted-foreground">WPM</p>
                        </div>
                        <div className="bg-black/30 p-3 rounded-lg">
                            <p className="text-2xl font-bold text-cyan-400">{accuracy.toFixed(1)}%</p>
                            <p className="text-sm text-muted-foreground">Accuracy</p>
                        </div>
                        <div className="bg-black/30 p-3 rounded-lg">
                           <Select value={language} onValueChange={v => setLanguage(v as Language)} disabled={!!startTime && !isFinished}>
                               <SelectTrigger><SelectValue/></SelectTrigger>
                               <SelectContent>
                                   {Object.keys(snippets).map(lang => <SelectItem key={lang} value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</SelectItem>)}
                               </SelectContent>
                           </Select>
                           <p className="text-sm text-muted-foreground mt-1">Language</p>
                        </div>
                        <div className="bg-black/30 p-3 rounded-lg">
                            <Button onClick={resetGame} variant="outline" className="w-full h-full"><RefreshCw className="mr-2 h-4 w-4"/>Restart</Button>
                        </div>
                    </div>
                    {isFinished && (
                        <div className="text-center p-4 bg-green-900/50 border border-green-500 rounded-lg">
                            <h3 className="text-xl font-bold text-green-300">Finished!</h3>
                            <p>You typed at {wpm} WPM with {accuracy.toFixed(1)}% accuracy.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default CodeRacer;
