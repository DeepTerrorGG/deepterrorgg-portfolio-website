
'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

const AudioVisualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const draw = useCallback(() => {
    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    if (!analyser || !canvas) return;

    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;
    
    // Ensure canvas has a size.
    if(canvas.width === 0 || canvas.height === 0) {
      const parent = canvas.parentElement;
      if(parent){
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const drawLoop = () => {
      animationFrameRef.current = requestAnimationFrame(drawLoop);
      analyser.getByteTimeDomainData(dataArray);

      canvasCtx.fillStyle = 'hsl(var(--background))';
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = 'hsl(var(--primary))';
      canvasCtx.beginPath();

      const sliceWidth = canvas.width * 1.0 / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    };

    drawLoop();
  }, []);

  const setupAudioContext = () => {
    // Already setup
    if (audioContextRef.current && sourceRef.current) return;
    if (!audioRef.current) return;

    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = context;
      
      analyserRef.current = context.createAnalyser();
      analyserRef.current.fftSize = 2048;

      // The source can only be created once per audio element
      if (!sourceRef.current) {
        sourceRef.current = context.createMediaElementSource(audioRef.current);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(context.destination);
      }
    } catch (e) {
      console.error("Error setting up audio context:", e);
      setError('Web Audio API is not supported by this browser.');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && audioRef.current) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      const url = URL.createObjectURL(file);
      audioRef.current.src = url;
      audioRef.current.load();
      setError(null);
      
      toast({ title: 'Audio loaded!', description: 'Press play to start the visualization.' });
    }
  };

  const onPlay = () => {
    if (!audioContextRef.current) {
      setupAudioContext();
    }
    
    // Resume context if it was suspended
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    draw();
  };

  const onPause = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };
  
   useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      audioContextRef.current?.close();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl aspect-video bg-background rounded-lg shadow-inner overflow-hidden mb-4">
        <canvas ref={canvasRef} className="w-full h-full" width="1000" height="562" />
      </div>
      {error && (
        <div className="flex items-center gap-2 text-destructive mb-4">
          <AlertTriangle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}
      <div className="w-full max-w-2xl space-y-4">
        <audio ref={audioRef} controls className="w-full" onPlay={onPlay} onPause={onPause} onEnded={onPause} crossOrigin="anonymous"></audio>
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
