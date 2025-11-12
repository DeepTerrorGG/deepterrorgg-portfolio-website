'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RefreshCw, Music } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const NUM_STEPS = 16;
const SOUNDS = ['Kick', 'Snare', 'Hi-hat', 'Clap'];

type Grid = boolean[][];

const createEmptyGrid = (): Grid => Array(SOUNDS.length).fill(null).map(() => Array(NUM_STEPS).fill(false));

const BeatMaker: React.FC = () => {
  const { toast } = useToast();
  const [grid, setGrid] = useState<Grid>(createEmptyGrid());
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [bpm, setBpm] = useState(120);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStepTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const setupAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
        try {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            if (context.state === 'suspended') {
                context.resume();
            }
            audioContextRef.current = context;
        } catch (e) {
            toast({ title: "Audio Error", description: "Web Audio API is not supported by your browser.", variant: "destructive" });
        }
    }
  }, [toast]);
  
  const playSound = useCallback((type: string, time: number) => {
    const audioContext = audioContextRef.current;
    if (!audioContext) return;

    if (type === 'Kick') {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.frequency.setValueAtTime(150, time);
      osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.1);
      gain.gain.setValueAtTime(1, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(time);
      osc.stop(time + 0.1);
    } else if (type === 'Snare') {
      const noise = audioContext.createBufferSource();
      const bufferSize = audioContext.sampleRate;
      const buffer = audioContext.createBuffer(1, bufferSize, bufferSize);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      noise.buffer = buffer;
      const noiseFilter = audioContext.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.value = 1000;
      noise.connect(noiseFilter);
      const noiseGain = audioContext.createGain();
      noiseGain.gain.setValueAtTime(1, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(audioContext.destination);
      noise.start(time);
      noise.stop(time + 0.1);
    } else if (type === 'Hi-hat') {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(4000, time);
      gain.gain.setValueAtTime(1, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(time);
      osc.stop(time + 0.05);
    } else if (type === 'Clap') {
       const noise = audioContext.createBufferSource();
        const bufferSize = audioContext.sampleRate;
        const buffer = audioContext.createBuffer(1, bufferSize, bufferSize);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        noise.buffer = buffer;
        const noiseFilter = audioContext.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.value = 1500;
        noise.connect(noiseFilter);
        const noiseGain = audioContext.createGain();
        noiseGain.gain.setValueAtTime(1, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(audioContext.destination);
        noise.start(time);
        noise.stop(time + 0.08);
    }
  }, []);

  const scheduler = useCallback(() => {
    const audioContext = audioContextRef.current;
    if (!audioContext) return;
    
    while (nextStepTimeRef.current < audioContext.currentTime + 0.1) {
        const step = (currentStep === null ? -1 : currentStep) + 1;
        const currentStepInLoop = step % NUM_STEPS;
        
        grid.forEach((row, soundIndex) => {
            if (row[currentStepInLoop]) {
                playSound(SOUNDS[soundIndex], nextStepTimeRef.current);
            }
        });
        
        const secondsPerBeat = 60.0 / bpm;
        const secondsPerStep = secondsPerBeat / 4; // 16th notes
        nextStepTimeRef.current += secondsPerStep;
        
        // Update UI on a timeout for visual sync
        setTimeout(() => setCurrentStep(currentStepInLoop), (nextStepTimeRef.current - audioContext.currentTime - secondsPerStep) * 1000);
    }
    
    timerRef.current = setTimeout(scheduler, 25);
  }, [bpm, grid, currentStep, playSound]);

  useEffect(() => {
    if (isPlaying) {
        if (!audioContextRef.current) setupAudioContext();
        if (audioContextRef.current) {
            nextStepTimeRef.current = audioContextRef.current.currentTime;
            scheduler();
        }
    } else {
        if (timerRef.current) clearTimeout(timerRef.current);
        setCurrentStep(null);
    }
    return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, scheduler, setupAudioContext]);

  const toggleStep = (soundIndex: number, stepIndex: number) => {
    const newGrid = grid.map(row => [...row]);
    newGrid[soundIndex][stepIndex] = !newGrid[soundIndex][stepIndex];
    setGrid(newGrid);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const resetGrid = () => {
    setGrid(createEmptyGrid());
    setIsPlaying(false);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-full bg-card p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-4xl mx-auto shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold text-primary flex items-center justify-center gap-2">
            <Music /> Beat Maker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <div className="flex flex-col gap-2 min-w-max">
                {grid.map((row, soundIndex) => (
                    <div key={soundIndex} className="flex items-center gap-2">
                        <div className="w-20 text-xs font-bold text-right pr-2 text-muted-foreground">{SOUNDS[soundIndex]}</div>
                        <div className="grid grid-cols-16 gap-1">
                            {row.map((isActive, stepIndex) => (
                                <button
                                    key={stepIndex}
                                    onClick={() => toggleStep(soundIndex, stepIndex)}
                                    className={cn(
                                        "h-8 w-8 sm:h-10 sm:w-10 rounded-md transition-colors",
                                        "border",
                                        stepIndex % 4 === 0 ? "border-primary/50" : "border-border",
                                        isActive ? "bg-primary" : "bg-muted/30 hover:bg-muted",
                                        currentStep === stepIndex && "ring-2 ring-offset-2 ring-offset-background ring-accent"
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
            <div className="flex items-center gap-4">
                <Button onClick={togglePlay} size="lg" className="w-28">
                    {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                    {isPlaying ? 'Pause' : 'Play'}
                </Button>
                <Button onClick={resetGrid} variant="outline"><RefreshCw className="h-4 w-4" /></Button>
            </div>
            <div className="w-full sm:w-64">
                <Label htmlFor="bpm-slider">BPM: {bpm}</Label>
                <Slider id="bpm-slider" min={60} max={180} step={1} value={[bpm]} onValueChange={(val) => setBpm(val[0])} />
            </div>
          </div>
        </CardContent>
      </Card>
      <style jsx>{`
        .grid-cols-16 {
          grid-template-columns: repeat(16, minmax(0, 1fr));
        }
      `}</style>
    </div>
  );
};

export default BeatMaker;
