
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Play, Pause, Volume2, Music, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const MusicVisualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameId = useRef<number>();

  const [isPlaying, setIsPlaying] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const setupAudioContext = () => {
    if (!audioRef.current) return;
    if (!audioContextRef.current) {
        try {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;
            sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
            sourceRef.current.connect(analyserRef.current);
            analyserRef.current.connect(audioContextRef.current.destination);
        } catch(e) {
            toast({
                title: "Audio Error",
                description: "Your browser does not support the Web Audio API.",
                variant: 'destructive'
            })
            console.error("Error creating audio context:", e);
        }
    }
  };

  const draw = () => {
    if (!analyserRef.current || !canvasRef.current) return;

    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 1.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = dataArray[i];
      const hue = (i / bufferLength) * 360;
      
      const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
      gradient.addColorStop(0, `hsl(${hue}, 100%, 50%)`);
      gradient.addColorStop(1, `hsl(${hue}, 100%, 75%)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
    
    animationFrameId.current = requestAnimationFrame(draw);
  };
  
  useEffect(() => {
    return () => {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
        audioContextRef.current?.close();
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('audio/')) {
        setIsLoading(true);
        setAudioFile(file);
        if (audioRef.current) {
          audioRef.current.src = URL.createObjectURL(file);
          audioRef.current.load();
          audioRef.current.oncanplaythrough = () => setIsLoading(false);
        }
        toast({ title: "Audio Loaded", description: file.name });
      } else {
        toast({ title: "Invalid File", description: "Please upload an audio file.", variant: "destructive" });
      }
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !audioFile) {
        toast({ title: 'No Audio', description: 'Please upload an audio file first.', variant: 'destructive'});
        return;
    }
    
    if(!audioContextRef.current){
        setupAudioContext();
    }

    if (isPlaying) {
      audioRef.current.pause();
      if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    } else {
      audioRef.current.play();
      draw();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-2xl mx-auto shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold text-primary flex items-center justify-center gap-2">
            <Music /> Audio Visualizer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="aspect-video bg-black rounded-md relative">
            <canvas ref={canvasRef} className="w-full h-full" />
            {!audioFile && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <Volume2 className="h-10 w-10"/>
                    <p>Upload an audio file to begin</p>
                </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="grid w-full max-w-sm items-center gap-1.5">
                <label htmlFor="audio-upload" className={cn(
                    "flex items-center justify-center gap-2 w-full h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md cursor-pointer",
                    isLoading && "opacity-50 cursor-not-allowed"
                )}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Upload className="h-4 w-4"/>}
                    <span>{audioFile ? 'Change Audio' : 'Upload Audio'}</span>
                </label>
                <Input id="audio-upload" type="file" accept="audio/*" onChange={handleFileChange} className="sr-only" disabled={isLoading} />
            </div>
            <Button onClick={togglePlay} disabled={!audioFile || isLoading} className="w-full sm:w-auto">
              {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
          </div>
          <audio ref={audioRef} onEnded={() => setIsPlaying(false)} className="hidden" />
          {audioFile && <p className="text-xs text-center text-muted-foreground">Now playing: {audioFile.name}</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default MusicVisualizer;
