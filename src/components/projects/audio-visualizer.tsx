
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
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // The main drawing function that runs on every frame
  const draw = useCallback(() => {
    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!analyser || !canvas || !ctx) {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      return;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Schedule the next frame
    animationFrameIdRef.current = requestAnimationFrame(draw);
    
    // Get waveform data
    analyser.getByteTimeDomainData(dataArray);

    // Draw background
    ctx.fillStyle = 'hsl(var(--background))';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the waveform
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'hsl(var(--primary))';
    ctx.beginPath();

    const sliceWidth = canvas.width * 1.0 / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0; // byte values are 0-255
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
  }, []);

  const setupAudioContext = () => {
    if (audioContextRef.current || !audioRef.current) return;

    try {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = context;

        const analyser = context.createAnalyser();
        analyser.fftSize = 2048;
        analyserRef.current = analyser;
        
        // Create the source node from the audio element ONCE
        const source = context.createMediaElementSource(audioRef.current);
        sourceNodeRef.current = source;

        // Connect the graph: source -> analyser -> speakers (destination)
        source.connect(analyser);
        analyser.connect(context.destination);
    } catch (e) {
        console.error("Error creating audio context:", e);
        setError('Web Audio API is not supported by this browser.');
    }
  };

  const onPlay = () => {
    // Lazy initialization on first play
    if (!audioContextRef.current) {
      setupAudioContext();
    }
    
    // Ensure context is running (important for some browsers)
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    
    // Start drawing loop
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
    draw();
  };

  const onPauseOrEnd = () => {
    // Stop drawing loop
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && audioRef.current) {
      onPauseOrEnd(); // Stop any current visualization
      
      const url = URL.createObjectURL(file);
      audioRef.current.src = url;
      audioRef.current.load();
      setError(null);
      
      toast({ title: 'Audio loaded!', description: 'Press play to start the visualization.' });
    }
  };
  
   // Handle canvas resizing
   useEffect(() => {
    const canvas = canvasRef.current;
    let resizeObserver: ResizeObserver;

    if(canvas && canvas.parentElement) {
      resizeObserver = new ResizeObserver(() => {
          if(canvas && canvas.parentElement){
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight;
          }
      });
      resizeObserver.observe(canvas.parentElement);
    }
    return () => {
        if(resizeObserver && canvas && canvas.parentElement) {
            resizeObserver.unobserve(canvas.parentElement);
        }
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    const audioContext = audioContextRef.current;
    return () => {
      onPauseOrEnd();
      if (audioContext) {
        audioContext.close();
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
