'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Play, Pause, RefreshCw, Music } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const AudioVisualizer: React.FC = () => {
  const { toast } = useToast();
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const animationFrameId = useRef<number>(0);

  // Initialize AudioContext
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
        try {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            toast({ title: 'Error', description: 'Web Audio API is not supported by your browser.', variant: 'destructive' });
        }
    }
    return () => {
        audioContextRef.current?.close();
    }
  }, [toast]);
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!audioContextRef.current) {
        toast({ title: "Audio Error", description: "AudioContext is not ready.", variant: "destructive" });
        return;
    }

    setFileName(file.name);
    stop();

    try {
        const arrayBuffer = await file.arrayBuffer();
        const decodedAudio = await audioContextRef.current.decodeAudioData(arrayBuffer);
        setAudioBuffer(decodedAudio);
        toast({ title: "File Loaded", description: `Ready to play ${file.name}` });
    } catch (e) {
        toast({ title: "Error decoding file", description: "Please select a valid audio file.", variant: "destructive" });
    }
  };
  
  const draw = useCallback(() => {
    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!analyser || !ctx || !canvas) return;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'hsl(var(--card))';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;

    const primaryColorHsl = '180 100% 25.1%'; // From globals.css
    
    for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i];
        
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, `hsl(${primaryColorHsl})`);
        gradient.addColorStop(1, `hsla(${primaryColorHsl.replace(/%/g, '').replace(/\s/g, ',')}, 0.5)`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
    }
  }, []);


  const animate = useCallback(() => {
    if (!isPlaying) return;
    draw();
    animationFrameId.current = requestAnimationFrame(animate);
  }, [isPlaying, draw]);
  
  useEffect(() => {
      if (isPlaying) {
          animationFrameId.current = requestAnimationFrame(animate);
      } else {
          cancelAnimationFrame(animationFrameId.current);
      }
      return () => cancelAnimationFrame(animationFrameId.current);
  }, [isPlaying, animate]);


  const play = () => {
    if (!audioBuffer || !audioContextRef.current) return;
    if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
    }
    
    stop(); // Stop any previous playback

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    sourceRef.current = source;

    const analyser = audioContextRef.current.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    source.connect(analyser);
    analyser.connect(audioContextRef.current.destination);
    
    source.onended = () => {
      setIsPlaying(false);
    };

    source.start(0);
    setIsPlaying(true);
  };
  
  const stop = () => {
    if (sourceRef.current) {
        sourceRef.current.onended = null; // Prevent onended from firing on manual stop
        sourceRef.current.stop();
        sourceRef.current.disconnect();
    }
    setIsPlaying(false);
  };

  const reset = () => {
    stop();
    setAudioBuffer(null);
    setFileName(null);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-2xl mx-auto shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold text-primary flex items-center justify-center gap-2">
            <Music/> Audio Visualizer
          </CardTitle>
          <CardDescription className="text-center">Upload an audio file to see it visualized.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <canvas ref={canvasRef} width="640" height="300" className="w-full h-64 rounded-md border bg-card" />
          <div className="text-center text-sm text-muted-foreground truncate">{fileName || 'No file selected'}</div>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button asChild variant="outline">
              <label htmlFor="audio-upload" className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4"/> Select File
                <input id="audio-upload" type="file" accept="audio/*" onChange={handleFileChange} className="hidden" />
              </label>
            </Button>
            <Button onClick={play} disabled={!audioBuffer || isPlaying}>
              <Play className="mr-2 h-4 w-4"/> Play
            </Button>
            <Button onClick={stop} disabled={!isPlaying} variant="secondary">
              <Pause className="mr-2 h-4 w-4"/> Stop
            </Button>
             <Button onClick={reset} variant="destructive">
              <RefreshCw className="mr-2 h-4 w-4"/> Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AudioVisualizer;
