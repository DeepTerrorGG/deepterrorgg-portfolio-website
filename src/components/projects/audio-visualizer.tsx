
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
  
  const isPlayingRef = useRef(isPlaying);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Initialize AudioContext
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
        try {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;
            analyserRef.current.connect(audioContextRef.current.destination);
        } catch (e) {
            toast({ title: 'Error', description: 'Web Audio API is not supported by your browser.', variant: 'destructive' });
        }
    }
    return () => {
        audioContextRef.current?.close().catch(console.error);
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

    const primaryColorHsl = '180 100% 25.1%';
    
    for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i];
        
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, `hsl(${primaryColorHsl})`);
        gradient.addColorStop(1, `hsla(${primaryColorHsl.replace(/\s/g, ',')}, 0.5)`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
    }
  }, []);

  const animate = useCallback(() => {
    if (!isPlayingRef.current) return;
    draw();
    animationFrameId.current = requestAnimationFrame(animate);
  }, [draw]);

  const play = () => {
    if (!audioBuffer || !audioContextRef.current || !analyserRef.current) return;
    if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
    }
    
    stop(); // Stop any previous playback to avoid multiple sources

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    sourceRef.current = source;

    source.connect(analyserRef.current);
    
    source.onended = () => {
      setIsPlaying(false);
    };

    source.start(0);
    setIsPlaying(true);
    
    // Start animation loop
    animationFrameId.current = requestAnimationFrame(animate);
  };
  
  const stop = () => {
    if (sourceRef.current) {
        sourceRef.current.onended = null;
        try {
            sourceRef.current.stop();
            sourceRef.current.disconnect();
        } catch (e) {
            console.error("Error stopping source node:", e);
        }
    }
    setIsPlaying(false);
    cancelAnimationFrame(animationFrameId.current);
  };

  const reset = () => {
    stop();
    setAudioBuffer(null);
    setFileName(null);
    // Clear canvas
    const canvas = canvasRef.current;
    if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'hsl(var(--card))';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }
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
