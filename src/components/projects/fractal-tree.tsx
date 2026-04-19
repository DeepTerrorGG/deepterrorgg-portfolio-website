'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Shuffle } from 'lucide-react';

const FractalTree: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [angle, setAngle] = useState(30);
  const [shrinkFactor, setShrinkFactor] = useState(0.67);
  const [maxDepth, setMaxDepth] = useState(10);
  const [startLength, setStartLength] = useState(100);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.translate(rect.width / 2, rect.height);

    function drawBranch(len: number, currentDepth: number) {
      if (currentDepth > maxDepth) return;
      // Fade from white at trunk to dark grey at tips
      const progress = currentDepth / maxDepth;
      const lightness = Math.round(255 * (1 - progress * 0.85));
      const alpha = 1 - progress * 0.3;
      ctx.strokeStyle = `rgba(${lightness}, ${lightness}, ${lightness}, ${alpha})`;
      ctx.lineWidth = Math.max(0.5, (maxDepth - currentDepth) * 0.5);

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
    setAngle(Math.random() * 90 + 10);
    setShrinkFactor(Math.random() * 0.3 + 0.5);
    setStartLength(Math.random() * 50 + 80);
  };

  const controls = [
    { id: 'angle', label: 'Branch Angle', value: angle, display: `${angle.toFixed(0)}°`, min: 0, max: 180, step: 1, onChange: setAngle },
    { id: 'shrink', label: 'Shrink Factor', value: shrinkFactor, display: shrinkFactor.toFixed(2), min: 0.3, max: 0.9, step: 0.01, onChange: setShrinkFactor },
    { id: 'length', label: 'Initial Length', value: startLength, display: `${startLength.toFixed(0)}`, min: 50, max: 150, step: 1, onChange: setStartLength },
    { id: 'depth', label: 'Recursion Depth', value: maxDepth, display: `${maxDepth}`, min: 1, max: 12, step: 1, onChange: setMaxDepth },
  ];

  return (
    <div className="flex items-center justify-center w-full h-full bg-[#000] p-4 sm:p-6 font-mono">
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-0 border border-[#1a1a1a]">

        {/* Canvas — left */}
        <div className="w-full md:w-2/3 bg-[#000] min-h-[400px] md:min-h-[520px] relative overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-full" />
          {/* Corner label */}
          <div className="absolute top-3 left-4">
            <p className="text-[#1f1f1f] text-[10px] tracking-[0.2em] uppercase">fractal.canvas</p>
          </div>
        </div>

        {/* Controls — right */}
        <div className="w-full md:w-1/3 border-t md:border-t-0 md:border-l border-[#1a1a1a] bg-[#050505] p-6 flex flex-col gap-7">

          {/* Header */}
          <div className="border-b border-[#1a1a1a] pb-5">
            <p className="text-[#444] text-[10px] tracking-[0.2em] uppercase mb-1">~/render</p>
            <h1 className="text-white text-lg font-semibold tracking-tight">Fractal Tree</h1>
            <p className="text-[#444] text-xs mt-1">Recursive generative art</p>
          </div>

          {/* Sliders */}
          <div className="flex flex-col gap-6 flex-1">
            {controls.map(ctrl => (
              <div key={ctrl.id}>
                <div className="flex justify-between items-baseline mb-3">
                  <label className="text-[#555] text-[10px] tracking-[0.15em] uppercase">{ctrl.label}</label>
                  <span className="text-white text-sm font-semibold tabular-nums">{ctrl.display}</span>
                </div>
                <Slider
                  min={ctrl.min}
                  max={ctrl.max}
                  step={ctrl.step}
                  value={[ctrl.value]}
                  onValueChange={v => ctrl.onChange(v[0] as never)}
                  className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-white [&_[role=slider]]:shadow-none [&_.relative]:bg-[#222] [&_.absolute]:bg-white"
                />
              </div>
            ))}
          </div>

          {/* Randomize */}
          <button
            onClick={randomize}
            className="w-full border border-[#222] bg-[#0a0a0a] hover:bg-white hover:text-black text-[#666] text-xs py-3 tracking-[0.2em] uppercase transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Shuffle className="h-3.5 w-3.5" />
            Randomize
          </button>
        </div>
      </div>
    </div>
  );
};

export default FractalTree;
