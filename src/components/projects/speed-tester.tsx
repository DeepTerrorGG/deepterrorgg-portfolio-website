'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, MousePointerClick, Type } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';

const sampleTexts = [
    "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet.",
    "Programming is the art of telling a computer what to do. It is a craft that combines logic and creativity.",
    "Never underestimate the bandwidth of a station wagon full of tapes hurtling down the highway.",
    "The sun peeked over the horizon, painting the sky in shades of orange and pink, a new day dawning.",
    "In the heart of the city, the bustling streets were a symphony of sounds, from car horns to distant chatter.",
    "A journey of a thousand miles begins with a single step. It is important to start, no matter how small.",
    "Creativity is intelligence having fun. Albert Einstein is often credited with this insightful quote.",
];

// --- CPS Test Component ---
const CpsTest = () => {
    const [clickCount, setClickCount] = useState(0);
    const [timeLeft, setTimeLeft] = useState(10);
    const [isTesting, setIsTesting] = useState(false);
    const [cps, setCps] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startTest = () => {
        if (isTesting) return;
        setIsTesting(true);
        setClickCount(1); // The first click starts the test
        setTimeLeft(10);
        setCps(0);

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    setIsTesting(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };
    
    useEffect(() => {
        if (!isTesting && clickCount > 0) {
           setCps(clickCount / 10);
        }
    }, [isTesting, clickCount]);

    const handleButtonClick = () => {
        if (!isTesting && timeLeft > 0) {
            startTest();
        } else if (isTesting) {
            setClickCount(prev => prev + 1);
        }
    };
    
    const resetTest = () => {
        if(timerRef.current) clearInterval(timerRef.current);
        setIsTesting(false);
        setClickCount(0);
        setTimeLeft(10);
        setCps(0);
    }

    return (
        <div className="flex flex-col items-center justify-center gap-6 p-4 h-full">
            <Button
                onClick={handleButtonClick}
                className={cn(
                    "w-full h-64 rounded-2xl text-2xl font-bold transition-all duration-150 transform active:scale-95",
                    isTesting ? "bg-primary" : "bg-secondary"
                )}
            >
                {isTesting ? "Click!" : "Click to Start"}
            </Button>
            <div className="text-center">
                <p className="text-5xl font-bold font-mono">{isTesting ? timeLeft : cps.toFixed(2)}</p>
                <p className="text-muted-foreground">{isTesting ? "Seconds Left" : "Clicks Per Second"}</p>
            </div>
            {!isTesting && clickCount > 0 && <p className="text-lg">Total Clicks: {clickCount}</p>}
            <Button onClick={resetTest} variant="outline"><RefreshCw className="mr-2 h-4 w-4"/>Reset</Button>
        </div>
    );
};


// --- Keyboard Speed Test Component ---
const KeyboardSpeedTest = () => {
    const [text, setText] = useState(() => sampleTexts[Math.floor(Math.random() * sampleTexts.length)]);
    const [input, setInput] = useState('');
    const [startTime, setStartTime] = useState<number | null>(null);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [isFinished, setIsFinished] = useState(false);
    
    const timeLeft = 60;
    const [remainingTime, setRemainingTime] = useState(timeLeft);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    
    const startTimer = () => {
        if (startTime) return;
        const now = Date.now();
        setStartTime(now);
        setRemainingTime(timeLeft);

        timerRef.current = setInterval(() => {
            setRemainingTime(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    endTest(input, now);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const endTest = (finalInput: string, st: number) => {
        const endTime = Date.now();
        const durationInMinutes = (endTime - st) / 60000;
        const wordsTyped = finalInput.trim().split(/\s+/).length;
        const calculatedWpm = Math.round(wordsTyped / durationInMinutes);
        
        let correctChars = 0;
        finalInput.split('').forEach((char, index) => {
            if (char === text[index]) {
                correctChars++;
            }
        });
        const calculatedAccuracy = (correctChars / finalInput.length) * 100;

        setWpm(calculatedWpm);
        setAccuracy(calculatedAccuracy);
        setIsFinished(true);
        if(timerRef.current) clearInterval(timerRef.current);
    }
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isFinished) return;
        if (!startTime) {
            startTimer();
        }
        setInput(e.target.value);
    };

    const resetTest = () => {
        setText(sampleTexts[Math.floor(Math.random() * sampleTexts.length)]);
        setInput('');
        setStartTime(null);
        setWpm(0);
        setAccuracy(100);
        setIsFinished(false);
        setRemainingTime(timeLeft);
        if (timerRef.current) clearInterval(timerRef.current);
    }

    return (
        <div className="flex flex-col items-center justify-center gap-6 p-4 h-full">
           <Card className="w-full bg-muted/30">
               <CardContent className="p-4 relative">
                    <p className="font-mono text-lg leading-relaxed select-none">
                       {text.split('').map((char, index) => {
                            let color = 'text-muted-foreground';
                            if (index < input.length) {
                                color = char === input[index] ? 'text-foreground' : 'text-red-500 underline';
                            }
                            return <span key={index} className={color}>{char}</span>
                       })}
                    </p>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-muted/30 pointer-events-none"/>
               </CardContent>
           </Card>
           
           <Input 
             value={input}
             onChange={handleInputChange}
             placeholder="Start typing..."
             className="w-full font-mono text-lg"
             disabled={isFinished}
           />

           <div className="grid grid-cols-3 gap-4 w-full text-center">
               <div>
                   <p className="text-4xl font-bold font-mono">{isFinished ? wpm : '...'}</p>
                   <p className="text-muted-foreground">Words/Min</p>
               </div>
                <div>
                   <p className="text-4xl font-bold font-mono">{isFinished ? `${accuracy.toFixed(1)}%` : '...'}</p>
                   <p className="text-muted-foreground">Accuracy</p>
               </div>
               <div>
                   <p className="text-4xl font-bold font-mono">{remainingTime}</p>
                   <p className="text-muted-foreground">Seconds Left</p>
               </div>
           </div>

           <Button onClick={resetTest} variant="outline"><RefreshCw className="mr-2 h-4 w-4"/>Restart Test</Button>
        </div>
    );
};


const SpeedTester: React.FC = () => {
  return (
    <div className="flex items-center justify-center w-full min-h-full bg-card p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-2xl mx-auto shadow-2xl">
        <Tabs defaultValue="cps" className="w-full">
            <CardHeader>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="cps"><MousePointerClick className="mr-2 h-4 w-4"/>CPS Test</TabsTrigger>
                    <TabsTrigger value="keyboard"><Type className="mr-2 h-4 w-4"/>Typing Speed</TabsTrigger>
                </TabsList>
            </CardHeader>
            <TabsContent value="cps">
                <CardContent className="h-[30rem]">
                    <CpsTest />
                </CardContent>
            </TabsContent>
            <TabsContent value="keyboard">
                <CardContent className="h-[30rem]">
                    <KeyboardSpeedTest />
                </CardContent>
            </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default SpeedTester;
