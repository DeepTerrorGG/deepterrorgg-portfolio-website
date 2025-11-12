'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Play, Pause, RefreshCw, Timer, AlarmClock, Hourglass } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

type TimerMode = 'pomodoro' | 'stopwatch' | 'timer';

const PomodoroTimer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TimerMode>('pomodoro');
  
  // Pomodoro State
  const [pomoMode, setPomoMode] = useState<'work' | 'break'>('work');
  const [pomoTime, setPomoTime] = useState(25 * 60);
  const [pomoIsActive, setPomoIsActive] = useState(false);
  const [pomoDurations, setPomoDurations] = useState({ work: 25, break: 5 });

  // Stopwatch State
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [stopwatchIsActive, setStopwatchIsActive] = useState(false);
  
  // Timer State
  const [timerTime, setTimerTime] = useState(10 * 60);
  const [timerIsActive, setTimerIsActive] = useState(false);
  const [timerDuration, setTimerDuration] = useState(10);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Unified useEffect for all timers
  useEffect(() => {
    if (pomoIsActive && pomoTime > 0) {
      intervalRef.current = setInterval(() => setPomoTime(t => t - 1), 1000);
    } else if (pomoIsActive && pomoTime === 0) {
      const newMode = pomoMode === 'work' ? 'break' : 'work';
      setPomoMode(newMode);
      setPomoTime(pomoDurations[newMode] * 60);
      setPomoIsActive(false);
    } else if (stopwatchIsActive) {
      intervalRef.current = setInterval(() => setStopwatchTime(t => t + 1), 1000);
    } else if (timerIsActive && timerTime > 0) {
      intervalRef.current = setInterval(() => setTimerTime(t => t - 1), 1000);
    } else if (timerIsActive && timerTime === 0) {
      setTimerIsActive(false);
      // Optional: Add a sound or notification
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [
    pomoIsActive, pomoTime, pomoMode, pomoDurations,
    stopwatchIsActive,
    timerIsActive, timerTime
  ]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Pomodoro controls
  const togglePomo = () => setPomoIsActive(!pomoIsActive);
  const resetPomo = () => {
    setPomoIsActive(false);
    setPomoTime(pomoDurations[pomoMode] * 60);
  };

  // Stopwatch controls
  const toggleStopwatch = () => setStopwatchIsActive(!stopwatchIsActive);
  const resetStopwatch = () => {
    setStopwatchIsActive(false);
    setStopwatchTime(0);
  };
  
  // Timer controls
  const toggleTimer = () => {
    if (timerTime === 0) setTimerTime(timerDuration * 60);
    setTimerIsActive(!timerIsActive);
  };
  const resetTimer = () => {
    setTimerIsActive(false);
    setTimerTime(timerDuration * 60);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-sm mx-auto shadow-2xl">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TimerMode)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pomodoro"><AlarmClock className="h-4 w-4 mr-1"/>Pomodoro</TabsTrigger>
                <TabsTrigger value="stopwatch"><Hourglass className="h-4 w-4 mr-1"/>Stopwatch</TabsTrigger>
                <TabsTrigger value="timer"><Timer className="h-4 w-4 mr-1"/>Timer</TabsTrigger>
            </TabsList>
            
            {/* Pomodoro Content */}
            <TabsContent value="pomodoro">
                <CardHeader>
                    <CardTitle className="text-xl text-center font-bold text-primary">Pomodoro</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    <div className="flex gap-2">
                        <Button variant={pomoMode === 'work' ? 'default' : 'outline'} onClick={() => { setPomoMode('work'); setPomoTime(pomoDurations.work * 60); setPomoIsActive(false); }}>Work</Button>
                        <Button variant={pomoMode === 'break' ? 'default' : 'outline'} onClick={() => { setPomoMode('break'); setPomoTime(pomoDurations.break * 60); setPomoIsActive(false); }}>Break</Button>
                    </div>
                    <div className="text-6xl font-mono text-foreground bg-muted rounded-lg p-4 w-full text-center">{formatTime(pomoTime)}</div>
                    <div className="flex gap-2">
                        <Label htmlFor="work-duration">Work (min)</Label>
                        <Input id="work-duration" type="number" min="1" value={pomoDurations.work} onChange={(e) => setPomoDurations(d => ({ ...d, work: parseInt(e.target.value) || 1 }))} className="w-16" />
                    </div>
                     <div className="flex gap-2">
                        <Label htmlFor="break-duration">Break (min)</Label>
                        <Input id="break-duration" type="number" min="1" value={pomoDurations.break} onChange={(e) => setPomoDurations(d => ({ ...d, break: parseInt(e.target.value) || 1 }))} className="w-16" />
                    </div>
                </CardContent>
                <CardFooter className="flex gap-4 justify-center">
                    <Button onClick={togglePomo} size="lg" className="w-24">{pomoIsActive ? <Pause /> : <Play />}<span className="ml-2">{pomoIsActive ? 'Pause' : 'Start'}</span></Button>
                    <Button onClick={resetPomo} variant="secondary" size="lg"><RefreshCw /></Button>
                </CardFooter>
            </TabsContent>

            {/* Stopwatch Content */}
            <TabsContent value="stopwatch">
                <CardHeader><CardTitle className="text-xl text-center font-bold text-primary">Stopwatch</CardTitle></CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    <div className="text-6xl font-mono text-foreground bg-muted rounded-lg p-4 w-full text-center">{formatTime(stopwatchTime)}</div>
                </CardContent>
                <CardFooter className="flex gap-4 justify-center">
                    <Button onClick={toggleStopwatch} size="lg" className="w-24">{stopwatchIsActive ? <Pause /> : <Play />}<span className="ml-2">{stopwatchIsActive ? 'Pause' : 'Start'}</span></Button>
                    <Button onClick={resetStopwatch} variant="secondary" size="lg"><RefreshCw /></Button>
                </CardFooter>
            </TabsContent>

            {/* Timer Content */}
            <TabsContent value="timer">
                <CardHeader><CardTitle className="text-xl text-center font-bold text-primary">Timer</CardTitle></CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    <div className="text-6xl font-mono text-foreground bg-muted rounded-lg p-4 w-full text-center">{formatTime(timerTime)}</div>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="timer-duration">Duration (min)</Label>
                        <Input id="timer-duration" type="number" min="1" value={timerDuration} onChange={(e) => { setTimerDuration(parseInt(e.target.value) || 1); setTimerTime(parseInt(e.target.value) * 60) }} className="w-20" />
                    </div>
                </CardContent>
                <CardFooter className="flex gap-4 justify-center">
                    <Button onClick={toggleTimer} size="lg" className="w-24">{timerIsActive ? <Pause /> : <Play />}<span className="ml-2">{timerIsActive ? 'Pause' : 'Start'}</span></Button>
                    <Button onClick={resetTimer} variant="secondary" size="lg"><RefreshCw /></Button>
                </CardFooter>
            </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default PomodoroTimer;
