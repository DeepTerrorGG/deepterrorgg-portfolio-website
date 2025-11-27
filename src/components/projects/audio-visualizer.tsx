
'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

const AudioVisualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Use refs to store single instances of audio nodes and animation ID
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const draw = useCallback(() => {
    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    if (!analyser || !canvas) return;
    
    // Resize canvas if necessary
    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'hsl(var(--card))';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = 'hsl(var(--primary))';
    ctx.beginPath();

    const sliceWidth = canvas.width * 1.0 / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = v * canvas.height / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    animationFrameIdRef.current = requestAnimationFrame(draw);
  }, []);

  const setupAudioContext = () => {
    if (audioContextRef.current || !audioRef.current) return;

    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      
      const source = context.createMediaElementSource(audioRef.current);
      
      source.connect(analyser);
      analyser.connect(context.destination);
      
      audioContextRef.current = context;
      analyserRef.current = analyser;
      sourceNodeRef.current = source;

    } catch (e) {
      console.error("Error creating audio context:", e);
      setError('Web Audio API is not supported by this browser.');
    }
  };

  const onPlay = () => {
    if (!audioContextRef.current) {
      setupAudioContext();
    }
    
    const context = audioContextRef.current;
    if (context && context.state === 'suspended') {
      context.resume();
    }
    
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
    animationFrameIdRef.current = requestAnimationFrame(draw);
  };

  const onPauseOrEnd = () => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && audioRef.current) {
      onPauseOrEnd();
      
      const url = URL.createObjectURL(file);
      audioRef.current.src = url;
      setError(null);
      
      toast({ title: 'Audio loaded!', description: 'Press play to start the visualization.' });
    }
  };

  useEffect(() => {
    return () => {
        onPauseOrEnd(); 
        if (audioContextRef.current) {
            audioContextRef.current.close().catch(console.error);
        }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl aspect-video bg-background rounded-lg shadow-inner overflow-hidden mb-4">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
      {error && (
        <div className="flex items-center gap-2 text-destructive mb-4">
          <AlertTriangle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}
      <div className="w-full max-w-2xl space-y-4">
        <audio 
            ref={audioRef} 
            controls 
            className="w-full" 
            onPlay={onPlay} 
            onPause={onPauseOrEnd} 
            onEnded={onPauseOrEnd}
            crossOrigin="anonymous"
        ></audio>
        <div>
          <Label htmlFor="audio-upload" className="sr-only">Upload Audio</Label>
          <Input id="audio-upload" type="file" accept="audio/*" onChange={handleFileChange} className="w-full file:text-primary file:font-bold hover:file:cursor-pointer" />
        </div>
        <p className="text-xs text-muted-foreground text-center">Upload an audio file and press play to start the visualization.</p>
      </div>
    </div>
  );
};

export default AudioVisualizer;
