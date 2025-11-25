'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '../ui/button';

const FractalTree: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [angle, setAngle] = useState(30);
  const [shrinkFactor, setShrinkFactor] = useState(0.67);
  const [maxDepth, setMaxDepth] = useState(10);
  const [startLength, setStartLength] = useState(100);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Adjust for High-DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'hsl(var(--foreground))';
    ctx.lineWidth = 2;
    
    // Center the tree
    ctx.translate(rect.width / 2, rect.height);

    function drawBranch(len: number, currentDepth: number) {
      if (currentDepth > maxDepth) return;
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -len);
      ctx.stroke();

      ctx.translate(0, -len);
      
      ctx.save();
      ctx.rotate(angle * Math.PI / 180);
      drawBranch(len * shrinkFactor, currentDepth + 1);
      ctx.restore();
      
      ctx.save();
      ctx.rotate(-angle * Math.PI / 180);
      drawBranch(len * shrinkFactor, currentDepth + 1);
      ctx.restore();
    }

    drawBranch(startLength, 0);
  }, [angle, shrinkFactor, maxDepth, startLength]);
  
   const randomize = () => {
    setAngle(Math.random() * 90 + 10); // 10 to 100 degrees
    setShrinkFactor(Math.random() * 0.3 + 0.5); // 0.5 to 0.8
    setStartLength(Math.random() * 50 + 80); // 80 to 130
  };

  return (
     <div className="flex items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-4xl mx-auto shadow-2xl flex flex-col md:flex-row">
        {/* Left Column: Canvas */}
        <div className="w-full md:w-2/3 h-96 md:h-auto bg-muted/30">
            <canvas ref={canvasRef} className="w-full h-full" />
        </div>

        {/* Right Column: Controls */}
        <div className="w-full md:w-1/3 p-6 space-y-6">
             <CardHeader className="p-0">
                <CardTitle className="text-xl">Fractal Tree Grower</CardTitle>
            </CardHeader>
             <CardContent className="p-0 space-y-6">
                 <div>
                    <Label htmlFor="angle-slider" className="flex justify-between">
                        <span>Branch Angle</span>
                        <span>{angle.toFixed(0)}°</span>
                    </Label>
                    <Slider id="angle-slider" min={0} max={180} step={1} value={[angle]} onValueChange={v => setAngle(v[0])} />
                </div>
                 <div>
                    <Label htmlFor="shrink-slider" className="flex justify-between">
                        <span>Shrink Factor</span>
                        <span>{shrinkFactor.toFixed(2)}</span>
                    </Label>
                    <Slider id="shrink-slider" min={0.3} max={0.9} step={0.01} value={[shrinkFactor]} onValueChange={v => setShrinkFactor(v[0])} />
                </div>
                <div>
                    <Label htmlFor="length-slider" className="flex justify-between">
                        <span>Initial Length</span>
                        <span>{startLength.toFixed(0)}</span>
                    </Label>
                    <Slider id="length-slider" min={50} max={150} step={1} value={[startLength]} onValueChange={v => setStartLength(v[0])} />
                </div>
                 <div>
                    <Label htmlFor="depth-slider" className="flex justify-between">
                        <span>Recursion Depth</span>
                        <span>{maxDepth}</span>
                    </Label>
                    <Slider id="depth-slider" min={1} max={12} step={1} value={[maxDepth]} onValueChange={v => setMaxDepth(v[0])} />
                </div>
                <Button onClick={randomize} className="w-full">Randomize Tree</Button>
            </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default FractalTree;
