
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ZoomIn, ZoomOut, Palette, RefreshCw, Loader2, Settings2 } from 'lucide-react';

const FractalRenderer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [iterations, setIterations] = useState(50);
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(-0.5);
  const [offsetY, setOffsetY] = useState(0);
  const [colorScheme, setColorScheme] = useState(0);
  const [isRendering, setIsRendering] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const schemes = [
    // Psychedelic scheme removed
    (n: number, maxIter: number) => n === maxIter ? [0, 0, 0] : [n % 256, (n * 2) % 256, (n * 4) % 256], // Blue/Green Tones
    (n: number, maxIter: number) => n === maxIter ? [0,0,0] : [ (n*10)%255, 20, 20], // Red dominant
    (n: number, maxIter: number) => { // Grayscale
        const intensity = n === maxIter ? 0 : Math.floor(255 * (n / maxIter));
        return [intensity, intensity, intensity];
    }
  ];

  const drawMandelbrot = () => {
    if (!canvasRef.current) return;
    setIsRendering(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Small delay to allow UI to update before heavy computation
    requestAnimationFrame(() => {
        ctx.fillStyle = 'hsl(var(--background))'; // Match theme background
        ctx.fillRect(0, 0, width, height);
        const imageData = ctx.createImageData(width, height);

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                let zx = 0;
                let zy = 0;
                const cx = (x - width / 2) / (0.5 * zoom * width) + offsetX;
                const cy = (y - height / 2) / (0.5 * zoom * height) + offsetY;
                let iter = 0;

                while (zx * zx + zy * zy < 4 && iter < iterations) {
                    const xtemp = zx * zx - zy * zy + cx;
                    zy = 2 * zx * zy + cy;
                    zx = xtemp;
                    iter++;
                }
                
                const colorFunc = schemes[colorScheme % schemes.length]; // Ensure colorScheme index is valid
                const [r, g, b] = colorFunc(iter, iterations);
                
                const pixelIndex = (y * width + x) * 4;
                imageData.data[pixelIndex] = r;
                imageData.data[pixelIndex + 1] = g;
                imageData.data[pixelIndex + 2] = b;
                imageData.data[pixelIndex + 3] = 255; // Alpha
            }
        }
        ctx.putImageData(imageData, 0, 0);
        setIsRendering(false);
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
        const parent = canvas.parentElement;
        if (parent) {
            const baseWidth = parent.clientWidth > 0 ? parent.clientWidth : 800; 
            const baseHeight = parent.clientHeight > 0 ? parent.clientHeight : 600;

            // Set internal canvas resolution (drawing buffer size) for higher quality
            canvas.width = Math.floor(baseWidth * 1.5);
            canvas.height = Math.floor(baseHeight * 1.5);
        } else {
            // Fallback if parent is not available immediately
            canvas.width = 1200; // Increased fallback
            canvas.height = 900;  // Increased fallback
        }
    }
    drawMandelbrot();
  }, [iterations, zoom, offsetX, offsetY, colorScheme]);
  
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    // Adjust click coordinates for the canvas's display size vs. internal resolution
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);

    const newOffsetX = (x - canvas.width / 2) / (0.5 * zoom * canvas.width) + offsetX;
    const newOffsetY = (y - canvas.height / 2) / (0.5 * zoom * canvas.height) + offsetY;
    
    setOffsetX(newOffsetX);
    setOffsetY(newOffsetY);
    setZoom(zoom * 1.5); 
  };
  
  const resetView = () => {
    setZoom(1);
    setOffsetX(-0.5);
    setOffsetY(0);
    setIterations(50);
    setColorScheme(0);
  };

  return (
    <div className="flex flex-col w-full h-full bg-card text-card-foreground rounded-lg overflow-hidden">
      <div className="relative flex-grow">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full cursor-crosshair" // CSS handles display scaling
          onClick={handleCanvasClick}
          aria-label="Mandelbrot fractal visualization"
        />
        {isRendering && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <p className="ml-4 text-lg text-primary-foreground">Rendering...</p>
            </div>
        )}
      </div>

      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-2 right-2 z-10 text-muted-foreground hover:text-foreground"
        onClick={() => setShowControls(!showControls)}
        aria-label={showControls ? "Hide controls" : "Show controls"}
      >
        <Settings2 className={`h-5 w-5 transition-transform duration-300 ${showControls ? 'rotate-90' : ''}`} />
      </Button>

      {showControls && (
        <div className="p-4 border-t border-border bg-background/80 backdrop-blur-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <Label htmlFor="iterations" className="text-sm font-medium text-muted-foreground">Iterations: {iterations}</Label>
              <Slider
                id="iterations"
                min={10}
                max={1500} 
                step={10}
                value={[iterations]}
                onValueChange={(value) => setIterations(value[0])}
                className="mt-1"
                disabled={isRendering}
              />
            </div>
            <div>
              <Label htmlFor="zoom" className="text-sm font-medium text-muted-foreground">Zoom Level</Label>
              <div className="flex items-center gap-2 mt-1">
                <Button variant="outline" size="icon" onClick={() => setZoom(zoom / 1.5)} disabled={isRendering} aria-label="Zoom out">
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Slider
                  id="zoom"
                  min={Math.log10(0.1*10)*25} // Min zoom approx 0.1
                  max={Math.log10(100000*10)*25} // Max zoom approx 100,000
                  step={1} // Smaller steps for smoother log scale adjustment
                  value={[Math.log10(zoom*10)*25]} 
                  onValueChange={value => setZoom(Math.pow(10, value[0]/25 - 1))} 
                  className="flex-grow"
                  disabled={isRendering}
                />
                <Button variant="outline" size="icon" onClick={() => setZoom(zoom * 1.5)} disabled={isRendering} aria-label="Zoom in">
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button variant="outline" onClick={() => setColorScheme((prev) => (prev + 1) % schemes.length)} disabled={isRendering}>
              <Palette className="mr-2 h-4 w-4" /> Change Colors ({schemes.length} available)
            </Button>
            <Button variant="outline" onClick={resetView} disabled={isRendering}>
              <RefreshCw className="mr-2 h-4 w-4" /> Reset View
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FractalRenderer;
