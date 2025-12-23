'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trophy } from 'lucide-react';
import { snippets, type Language } from '@/lib/code-snippets';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { PlayerNameModal } from '@/components/multiplayer/PlayerNameModal';
import { LeaderboardPanel } from '@/components/multiplayer/LeaderboardPanel';
import { submitScore, formatters } from '@/lib/firebase/leaderboards';
import { useDatabase } from '@/firebase/provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

const CodeRacer: React.FC = () => {
    const [language, setLanguage] = useState<Language>('javascript');
    const [snippet, setSnippet] = useState(snippets[language]);
    const [userInput, setUserInput] = useState('');

    const [startTime, setStartTime] = useState<number | null>(null);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [isFinished, setIsFinished] = useState(false);

    // Multiplayer state
    const [playerName, setPlayerName] = useState('');
    const [playerId, setPlayerId] = useState('');
    const [showNameModal, setShowNameModal] = useState(false);
    const [bestWPM, setBestWPM] = useState(0);
    const db = useDatabase();

    const editorRef = useRef<any>(null);

    useEffect(() => {
        const savedName = localStorage.getItem('player_name');
        const savedId = localStorage.getItem('player_id');
        if (savedName && savedId) {
            setPlayerName(savedName);
            setPlayerId(savedId);
        } else {
            setShowNameModal(true);
        }
        const saved = localStorage.getItem('codeRacer_bestWPM');
        if (saved) setBestWPM(parseInt(saved));
    }, []);

    const resetGame = useCallback(() => {
        const newSnippet = snippets[language];
        setSnippet(newSnippet);
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
        const snippetToCompare = snippet.slice(0, currentInput.length);
        for (let i = 0; i < currentInput.length; i++) {
            if (currentInput[i] !== snippetToCompare[i]) {
                errors++;
            }
        }
        const correctChars = currentInput.length - errors;
        const currentAccuracy = currentInput.length > 0 ? (correctChars / currentInput.length) * 100 : 100;
        setAccuracy(currentAccuracy);

        if (startTime) {
            const timeElapsed = (Date.now() - startTime) / 1000 / 60; // in minutes
            if (timeElapsed > 0) {
                const wordsTyped = correctChars / 5;
                setWpm(Math.round(wordsTyped / timeElapsed));
            }
        }

        if (currentInput === snippet) {
            setIsFinished(true);
            const finalScore = Math.round(wpm * (currentAccuracy / 100));

            // Update best WPM
            if (wpm > bestWPM) {
                setBestWPM(wpm);
                localStorage.setItem('codeRacer_bestWPM', wpm.toString());
            }

            // Submit to leaderboard
            if (db && playerName && playerId) {
                submitScore(db, 'code-racer', playerId, playerName, {
                    wpm,
                    accuracy: Math.round(currentAccuracy),
                    score: finalScore,
                    bestWPM: Math.max(wpm, bestWPM)
                }).catch(err => console.error('Failed to submit score:', err));
            }
        }
    };

    const score = isFinished ? Math.round(wpm * (accuracy / 100)) : 0;

    const handleNameSubmit = (name: string, id: string) => {
        setPlayerName(name);
        setPlayerId(id);
        setShowNameModal(false);
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
            <Card className="w-full max-w-4xl mx-auto shadow-2xl bg-[#0D1117] border-gray-800">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-primary text-center">Code Racer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-lg rounded-lg bg-black/30 border border-gray-700 h-80 overflow-hidden">
                        {/* Left Pane: User Input Editor */}
                        <div className="h-full">
                            <Editor
                                value={userInput}
                                onChange={handleEditorChange}
                                onMount={(editor) => { editorRef.current = editor; editor.focus(); }}
                                language={language}
                                theme="vs-dark"
                                loading={<div className="bg-[#1e1e1e] w-full h-full" />}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 16,
                                    wordWrap: 'on',
                                    lineNumbers: 'off',
                                    glyphMargin: false,
                                    folding: false,
                                    lineDecorationsWidth: 0,
                                    lineNumbersMinChars: 0,
                                    padding: { top: 16, bottom: 16 }
                                }}
                            />
                        </div>

                        {/* Right Pane: Snippet to type */}
                        <ScrollArea className="h-full border-l border-gray-700">
                            <pre className="p-4 text-gray-400 whitespace-pre-wrap">{snippet}</pre>
                        </ScrollArea>
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
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {Object.keys(snippets).map(lang => <SelectItem key={lang} value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <p className="text-sm text-muted-foreground mt-1">Language</p>
                        </div>
                        <div className="bg-black/30 p-3 rounded-lg">
                            <Button onClick={resetGame} variant="outline" className="w-full h-full"><RefreshCw className="mr-2 h-4 w-4" />Restart</Button>
                        </div>
                    </div>
                    {isFinished && (
                        <div className="text-center p-4 bg-green-900/50 border border-green-500 rounded-lg">
                            <h3 className="text-xl font-bold text-green-300">Finished!</h3>
                            <p>You typed at {wpm} WPM with {accuracy.toFixed(1)}% accuracy. Final Score: {score}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <PlayerNameModal
                isOpen={showNameModal}
                onNameSubmit={handleNameSubmit}
                gameName="Code Racer"
                description="Enter your name to compete on the leaderboard for fastest typing and best accuracy!"
            />

            <Card className="w-full max-w-4xl mx-auto mt-6 shadow-2xl">
                <Tabs defaultValue="game">
                    <TabsList className="w-full grid grid-cols-2">
                        <TabsTrigger value="game">Game</TabsTrigger>
                        <TabsTrigger value="leaderboard"><Trophy className="mr-2 h-4 w-4" />Leaderboard</TabsTrigger>
                    </TabsList>
                    <TabsContent value="game" className="p-4">
                        <p className="text-center text-muted-foreground">Switch to leaderboard to see global rankings!</p>
                    </TabsContent>
                    <TabsContent value="leaderboard" className="p-4">
                        <LeaderboardPanel
                            gameId="code-racer"
                            currentPlayerId={playerId}
                            metrics={[
                                { key: 'wpm', label: 'WPM', format: formatters.number },
                                { key: 'accuracy', label: 'Accuracy %', format: (v) => `${v}%` },
                                { key: 'score', label: 'Score', format: formatters.number },
                                { key: 'bestWPM', label: 'Best WPM', format: formatters.number }
                            ]}
                        />
                    </TabsContent>
                </Tabs>
            </Card>
        </div>
    );
};

export default CodeRacer;
