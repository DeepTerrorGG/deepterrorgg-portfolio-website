'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, RefreshCw, Flag, Rabbit, Turtle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';

const ARRAY_SIZE = 100;
const sortedArray = Array.from({ length: ARRAY_SIZE }, (_, i) => i + 1);

const BinaryVsLinearSearch: React.FC = () => {
  const [target, setTarget] = useState(75);
  const [isRunning, setIsRunning] = useState(false);
  
  // Linear Search State
  const [linearIndex, setLinearIndex] = useState(-1);
  const [linearSteps, setLinearSteps] = useState(0);
  const [linearFound, setLinearFound] = useState(false);

  // Binary Search State
  const [binaryLow, setBinaryLow] = useState(0);
  const [binaryHigh, setBinaryHigh] = useState(ARRAY_SIZE - 1);
  const [binaryMid, setBinaryMid] = useState(-1);
  const [binarySteps, setBinarySteps] = useState(0);
  const [binaryFound, setBinaryFound] = useState(false);

  const reset = useCallback(() => {
    setIsRunning(false);
    setLinearIndex(-1);
    setLinearSteps(0);
    setLinearFound(false);
    setBinaryLow(0);
    setBinaryHigh(ARRAY_SIZE - 1);
    setBinaryMid(-1);
    setBinarySteps(0);
    setBinaryFound(false);
  }, []);

  useEffect(() => {
    reset();
  }, [target, reset]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      // --- Linear Search Step ---
      if (!linearFound) {
        setLinearIndex(prev => {
          const nextIndex = prev + 1;
          if (sortedArray[nextIndex] === target) {
            setLinearFound(true);
          }
          if (nextIndex >= ARRAY_SIZE - 1) {
              setLinearFound(true); // Stop if it reaches the end
          }
          return nextIndex;
        });
        setLinearSteps(prev => prev + 1);
      }
      
      // --- Binary Search Step ---
      if (!binaryFound && binaryLow <= binaryHigh) {
        setBinarySteps(prev => prev + 1);
        const mid = Math.floor((binaryLow + binaryHigh) / 2);
        setBinaryMid(mid);
        if (sortedArray[mid] === target) {
          setBinaryFound(true);
        } else if (sortedArray[mid] < target) {
          setBinaryLow(mid + 1);
        } else {
          setBinaryHigh(mid - 1);
        }
      }
      
      if (linearFound && (binaryFound || binaryLow > binaryHigh)) {
        setIsRunning(false);
      }

    }, 200);

    return () => clearInterval(interval);
  }, [isRunning, linearFound, binaryFound, binaryLow, binaryHigh, target]);

  const Bar = ({ value, isTarget, isLinear, isBinary, isBinaryRange, found }: { value: number, isTarget: boolean, isLinear: boolean, isBinary: boolean, isBinaryRange: boolean, found: boolean }) => (
    <div className="relative h-12 w-full">
      <div 
        className={cn(
          "absolute bottom-0 w-full rounded-t-sm transition-all duration-150",
          isTarget ? 'bg-primary' : 'bg-muted',
          isBinaryRange && !isBinary && 'bg-blue-500/20',
        )}
        style={{ height: `${(value / ARRAY_SIZE) * 100}%` }}
      />
       {isLinear && <div className={cn("absolute bottom-0 w-full h-full border-2 rounded-t-sm", found ? 'border-green-400' : 'border-yellow-400')} />}
       {isBinary && <div className={cn("absolute bottom-0 w-full h-full border-2 rounded-t-sm", found ? 'border-green-400' : 'border-cyan-400')} />}
    </div>
  );

  const RacerLane = ({ title, icon, steps, found, currentIndex, binaryRange }: { title: string, icon: React.ReactNode, steps: number, found: boolean, currentIndex: number, binaryRange?: { low: number, high: number} }) => (
    <Card className="bg-muted/30">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">{icon}{title}</CardTitle>
            <div className="text-right">
                <p className="font-mono text-2xl font-bold">{steps}</p>
                <p className="text-xs text-muted-foreground">Steps</p>
            </div>
        </CardHeader>
        <CardContent>
            <div className="grid gap-px items-end" style={{ gridTemplateColumns: `repeat(${ARRAY_SIZE}, minmax(0, 1fr))`}}>
                {sortedArray.map((value, index) => (
                    <Bar 
                        key={index}
                        value={value}
                        isTarget={value === target}
                        isLinear={title === 'Linear Search' && index === currentIndex}
                        isBinary={title === 'Binary Search' && index === currentIndex}
                        isBinaryRange={title === 'Binary Search' && binaryRange ? index >= binaryRange.low && index <= binaryRange.high : false}
                        found={found}
                    />
                ))}
            </div>
             {found && <p className="text-center text-sm font-bold text-green-400 mt-2">Target Found!</p>}
        </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-5xl mx-auto shadow-2xl">
        <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-primary">Algorithm Race: Linear vs. Binary Search</CardTitle>
            <CardDescription>A visual race to find a target value in a sorted array.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="flex items-center gap-2 w-full sm:w-64">
                    <Flag className="h-5 w-5 text-primary"/>
                    <Label htmlFor="target-slider">Target: {target}</Label>
                    <Slider id="target-slider" min={1} max={100} step={1} value={[target]} onValueChange={v => setTarget(v[0])} disabled={isRunning}/>
                </div>
                <Button onClick={() => setIsRunning(!isRunning)} disabled={linearFound || binaryFound} className="w-full sm:w-auto">
                    <Play className="mr-2 h-4 w-4" /> Start Race
                </Button>
                <Button onClick={reset} variant="outline" className="w-full sm:w-auto">
                    <RefreshCw className="mr-2 h-4 w-4" /> Reset
                </Button>
            </div>

            <div className="space-y-4">
                <RacerLane title="Linear Search" icon={<Turtle/>} steps={linearSteps} found={linearFound} currentIndex={linearIndex}/>
                <RacerLane title="Binary Search" icon={<Rabbit/>} steps={binarySteps} found={binaryFound} currentIndex={binaryMid} binaryRange={{low: binaryLow, high: binaryHigh}}/>
            </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default BinaryVsLinearSearch;
