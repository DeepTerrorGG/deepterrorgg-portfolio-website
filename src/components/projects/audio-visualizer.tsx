
'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { AlertTriangle, Play, StopCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

const AudioVisualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const { toast } = useToast();

  // The main drawing function
  const draw = useCallback(() => {
    if (!analyserRef.current || !canvasRef.current) return;

    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);
    
    // Ensure canvas is sized correctly
    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    }

    // Fill background
    ctx.fillStyle = 'hsl(var(--card))';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;
    
    // Define the gradient for the bars
    const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
    const primaryColorHsl = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    const destructiveColorHsl = getComputedStyle(document.documentElement).getPropertyValue('--destructive').trim();
    
    gradient.addColorStop(0, `hsl(${primaryColorHsl})`);
    gradient.addColorStop(0.5, `hsla(${primaryColorHsl.replace(/ /g, ',')}, 0.5)`);
    gradient.addColorStop(1, `hsl(${destructiveColorHsl})`);

    // Draw the bars
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = dataArray[i] / 2;
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      
      x += barWidth + 1;
    }
  }, []);

  // Effect to manage the animation loop based on isPlaying state
  useEffect(() => {
    const animate = () => {
        if (!isPlaying) return;
        draw();
        animationFrameIdRef.current = requestAnimationFrame(animate);
    }

    if (isPlaying) {
        animationFrameIdRef.current = requestAnimationFrame(animate);
    } else {
        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
            // Redraw one last time to clear the canvas if needed
            const canvas = canvasRef.current;
            if(canvas) {
                const ctx = canvas.getContext('2d');
                if(ctx) {
                    ctx.fillStyle = 'hsl(var(--card))';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
            }
        }
    }
    return () => {
        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
        }
    };
  }, [isPlaying, draw]);

  // One-time setup for AudioContext and Analyser
  const setupAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = context;
        const analyser = context.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;
        analyser.connect(context.destination);
      } catch (e) {
        setError('Web Audio API is not supported by this browser.');
        return false;
      }
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return true;
  }, []);
  
  const play = () => {
    if (!audioBufferRef.current || isPlaying) return;
    if (!setupAudioContext()) return;
    
    // Stop any existing source
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch(e) {}
      sourceNodeRef.current.disconnect();
    }

    const audioContext = audioContextRef.current!;
    const analyser = analyserRef.current!;

    const source = audioContext.createBufferSource();
    source.buffer = audioBufferRef.current;
    sourceNodeRef.current = source;

    source.connect(analyser);

    source.onended = () => {
        setIsPlaying(false);
    };

    source.start(0);
    setIsPlaying(true);
  };

  const stop = () => {
    if (sourceNodeRef.current) {
        try { sourceNodeRef.current.stop(); } catch(e) {}
    }
    setIsPlaying(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      stop();
      setError(null);
      setFileName(file.name);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result instanceof ArrayBuffer) {
          if (!setupAudioContext()) return;
          audioContextRef.current!.decodeAudioData(e.target.result)
             .then(buffer => {
                audioBufferRef.current = buffer;
                toast({ title: 'Audio loaded!', description: 'Press play to start.' });
             })
             .catch(err => {
                setError('Failed to decode audio file. Please try a different file.');
                toast({ title: 'Error', description: 'Could not process the audio file.', variant: 'destructive'});
             });
        }
      };
      reader.onerror = () => {
          setError('Error reading file.');
          toast({ title: 'File Error', description: 'Could not read the selected file.', variant: 'destructive' });
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
        if (sourceNodeRef.current) {
          try { sourceNodeRef.current.stop(); } catch(e) {}
        }
        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
        }
        audioContextRef.current?.close().catch(console.error);
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
        <div className="flex gap-4">
            <Button onClick={play} disabled={!audioBufferRef.current || isPlaying} className="flex-1">
                <Play className="mr-2 h-4 w-4"/> Play
            </Button>
            <Button onClick={stop} disabled={!isPlaying} variant="destructive" className="flex-1">
                <StopCircle className="mr-2 h-4 w-4"/> Stop
            </Button>
        </div>
        <div>
          <Label htmlFor="audio-upload" className="sr-only">Upload Audio</Label>
          <Input id="audio-upload" type="file" accept="audio/*" onChange={handleFileChange} className="w-full file:text-primary file:font-bold hover:file:cursor-pointer" />
          {fileName && <p className="text-xs text-muted-foreground mt-1">Loaded: {fileName}</p>}
        </div>
      </div>
    </div>
  );
};

export default AudioVisualizer;
