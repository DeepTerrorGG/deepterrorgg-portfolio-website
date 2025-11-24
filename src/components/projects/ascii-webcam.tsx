
'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CameraOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// ASCII characters from darkest to lightest
const ASCII_DENSITY_MAP = '`.-_:\'"~=;+*!?^%&#$@';

const AsciiWebcam: React.FC = () => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();
  
  const [asciiArt, setAsciiArt] = useState<string>('');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(true);
  const [resolution, setResolution] = useState(100); // Number of columns for the ASCII art

  const getCameraPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setIsProcessing(false); // Start processing once video is playing
        }
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      setIsProcessing(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings to use this app.',
      });
    }
  }, [toast]);

  useEffect(() => {
    getCameraPermission();
    return () => {
        // Cleanup: stop video stream and animation frame
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
    };
  }, [getCameraPermission]);

  const renderAscii = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || videoRef.current.paused || videoRef.current.ended) {
      animationFrameId.current = requestAnimationFrame(renderAscii);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Adjust canvas size to match video aspect ratio
    const aspectRatio = video.videoWidth / video.videoHeight;
    const canvasWidth = resolution;
    const canvasHeight = Math.round(resolution / aspectRatio / 2); // Adjust for character aspect ratio
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvasWidth, canvasHeight);

    // Get pixel data and convert to ASCII
    const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    const { data } = imageData;
    let asciiFrame = '';

    for (let y = 0; y < canvasHeight; y++) {
      for (let x = 0; x < canvasWidth; x++) {
        const i = (y * canvasWidth + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Calculate brightness (simple average)
        const brightness = (r + g + b) / 3 / 255;
        const charIndex = Math.floor(brightness * (ASCII_DENSITY_MAP.length - 1));
        asciiFrame += ASCII_DENSITY_MAP[charIndex];
      }
      asciiFrame += '\n';
    }
    
    setAsciiArt(asciiFrame);
    animationFrameId.current = requestAnimationFrame(renderAscii);
  }, [resolution]);

  useEffect(() => {
    if (hasCameraPermission && !isProcessing) {
      animationFrameId.current = requestAnimationFrame(renderAscii);
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [hasCameraPermission, isProcessing, renderAscii]);

  return (
    <div className="w-full h-full bg-black flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-[#0d1117] border-border text-green-400 font-mono shadow-2xl overflow-hidden">
        <CardHeader>
          <CardTitle>ASCII Webcam Feed</CardTitle>
          <CardDescription className="text-muted-foreground">Your webcam, rendered in glorious ASCII.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-black p-2 rounded-md aspect-video relative flex items-center justify-center">
            {hasCameraPermission === null || isProcessing ? (
                 <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="animate-spin h-6 w-6"/>
                    <p>Initializing camera...</p>
                 </div>
            ) : hasCameraPermission === false ? (
              <Alert variant="destructive" className="max-w-md">
                <CameraOff className="h-4 w-4" />
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                  Please allow camera access in your browser to use this feature.
                </AlertDescription>
              </Alert>
            ) : (
              <pre
                className="text-center w-full leading-none overflow-hidden"
                style={{
                  fontSize: `min(calc(100vw / ${resolution} * 0.8), calc(70vh / ${Math.round(resolution / (videoRef.current?.videoWidth ?? 16 / videoRef.current?.videoHeight ?? 9) / 2)} * 0.8))`,
                }}
              >
                {asciiArt}
              </pre>
            )}
          </div>
        </CardContent>
      </Card>
      <video ref={videoRef} className="hidden" playsInline />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default AsciiWebcam;

    