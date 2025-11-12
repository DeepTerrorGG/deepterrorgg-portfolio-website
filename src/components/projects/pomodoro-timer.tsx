'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const PomodoroTimer: React.FC = () => {
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [time, setTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime(t => t - 1);
      }, 1000);
    } else if (time === 0) {
      // Switch modes
      if (mode === 'work') {
        setMode('break');
        setTime(5 * 60);
      } else {
        setMode('work');
        setTime(25 * 60);
      }
      setIsActive(false);
      // You can add a sound effect here
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time, mode]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (mode === 'work') {
      setTime(25 * 60);
    } else {
      setTime(5 * 60);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-sm mx-auto shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold text-primary">Pomodoro Timer</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div className="flex gap-2">
            <Button
              variant={mode === 'work' ? 'default' : 'outline'}
              onClick={() => {
                setMode('work');
                setTime(25 * 60);
                setIsActive(false);
              }}
            >
              Work
            </Button>
            <Button
              variant={mode === 'break' ? 'default' : 'outline'}
              onClick={() => {
                setMode('break');
                setTime(5 * 60);
                setIsActive(false);
              }}
            >
              Break
            </Button>
          </div>
          <div className="text-6xl sm:text-7xl font-mono text-foreground bg-muted rounded-lg p-4 w-full text-center">
            {formatTime(time)}
          </div>
          <div className="flex gap-4">
            <Button onClick={toggleTimer} size="lg" className="w-24">
              {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              <span className="ml-2">{isActive ? 'Pause' : 'Start'}</span>
            </Button>
            <Button onClick={resetTimer} variant="secondary" size="lg">
              <RefreshCw className="h-6 w-6" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PomodoroTimer;
