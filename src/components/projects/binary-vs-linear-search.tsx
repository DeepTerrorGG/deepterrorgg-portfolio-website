'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Play, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from '../ui/slider';

const ARRAY_SIZE = 100;
const sortedArray = Array.from({ length: ARRAY_SIZE }, (_, i) => i + 1);

const BinaryVsLinearSearch: React.FC = () => {
  const [target, setTarget] = useState(75);
  const [isRunning, setIsRunning] = useState(false);

  const [linearIndex, setLinearIndex] = useState(-1);
  const [linearSteps, setLinearSteps] = useState(0);
  const [linearFound, setLinearFound] = useState(false);

  const [binaryLow, setBinaryLow] = useState(0);
  const [binaryHigh, setBinaryHigh] = useState(ARRAY_SIZE - 1);
  const [binaryMid, setBinaryMid] = useState(-1);
  const [binarySteps, setBinarySteps] = useState(0);
  const [binaryFound, setBinaryFound] = useState(false);

  const reset = useCallback(() => {
    setIsRunning(false);
    setLinearIndex(-1); setLinearSteps(0); setLinearFound(false);
    setBinaryLow(0); setBinaryHigh(ARRAY_SIZE - 1); setBinaryMid(-1);
    setBinarySteps(0); setBinaryFound(false);
  }, []);

  useEffect(() => { reset(); }, [target, reset]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      if (!linearFound) {
        setLinearIndex(prev => {
          const next = prev + 1;
          if (sortedArray[next] === target) setLinearFound(true);
          if (next >= ARRAY_SIZE - 1) setLinearFound(true);
          return next;
        });
        setLinearSteps(prev => prev + 1);
      }
      if (!binaryFound && binaryLow <= binaryHigh) {
        setBinarySteps(prev => prev + 1);
        const mid = Math.floor((binaryLow + binaryHigh) / 2);
        setBinaryMid(mid);
        if (sortedArray[mid] === target) setBinaryFound(true);
        else if (sortedArray[mid] < target) setBinaryLow(mid + 1);
        else setBinaryHigh(mid - 1);
      }
      if (linearFound && (binaryFound || binaryLow > binaryHigh)) setIsRunning(false);
    }, 200);
    return () => clearInterval(interval);
  }, [isRunning, linearFound, binaryFound, binaryLow, binaryHigh, target]);

  const bothDone = linearFound && (binaryFound || binaryLow > binaryHigh);
  const winner = bothDone
    ? binarySteps < linearSteps ? 'BINARY' : 'LINEAR'
    : null;

  return (
    <div className="flex flex-col w-full h-full bg-[#000] p-4 sm:p-6 font-mono">

      {/* Header */}
      <div className="mb-5 border-b border-[#1a1a1a] pb-4">
        <p className="text-[#444] text-[10px] tracking-[0.2em] uppercase mb-1">~/algorithms</p>
        <h1 className="text-white text-xl font-semibold tracking-tight">Algorithm Race</h1>
        <p className="text-[#444] text-xs mt-1">Linear vs. Binary Search — sorted array of 100</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-[#444] text-[10px] tracking-widest uppercase">Target</span>
          <span className="text-white text-sm font-bold w-6 tabular-nums">{target}</span>
          <div className="w-40">
            <Slider
              min={1} max={100} step={1}
              value={[target]}
              onValueChange={v => setTarget(v[0])}
              disabled={isRunning}
            />
          </div>
        </div>

        <button
          onClick={() => setIsRunning(!isRunning)}
          disabled={bothDone}
          className="flex items-center gap-2 bg-white text-black text-xs px-5 py-2.5 tracking-widest uppercase font-semibold hover:bg-[#e0e0e0] transition-colors disabled:opacity-40"
        >
          <Play className="h-3.5 w-3.5" />
          {isRunning ? 'Running...' : 'Start Race'}
        </button>

        <button
          onClick={reset}
          className="flex items-center gap-2 border border-[#222] bg-[#0a0a0a] text-[#666] hover:text-white hover:border-[#444] text-xs px-5 py-2.5 tracking-widest uppercase transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reset
        </button>

        {/* Winner banner */}
        {winner && (
          <div className="ml-auto border border-white px-4 py-2">
            <span className="text-white text-xs tracking-widest uppercase font-bold">
              {winner} WINS — {winner === 'BINARY'
                ? `${linearSteps}x fewer steps`
                : 'same speed'}
            </span>
          </div>
        )}
      </div>

      {/* Lanes */}
      <div className="flex flex-col gap-4 flex-1">
        {/* Linear Search Lane */}
        <div className="border border-[#1a1a1a] bg-[#050505] flex-1">
          <div className="flex items-center justify-between border-b border-[#111] px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-[#444] text-[10px] tracking-[0.15em] uppercase">Linear Search</span>
              {linearFound && <span className="text-[10px] tracking-widest uppercase text-white border border-white px-2 py-0.5">Found</span>}
            </div>
            <div className="text-right">
              <span className="text-white text-2xl font-bold tabular-nums">{linearSteps}</span>
              <span className="text-[#444] text-[10px] ml-1 tracking-widest uppercase">steps</span>
            </div>
          </div>
          <div className="px-3 pb-3 pt-2">
            {/* Progress bar */}
            <div className="w-full h-1 bg-[#111] mb-3">
              <div
                className="h-full bg-[#333] transition-all duration-200"
                style={{ width: `${linearFound ? 100 : (linearIndex / ARRAY_SIZE) * 100}%` }}
              />
            </div>
            {/* Array cells */}
            <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(${ARRAY_SIZE}, minmax(0, 1fr))` }}>
              {sortedArray.map((value, index) => {
                const isTarget = value === target;
                const isActive = index === linearIndex;
                return (
                  <div
                    key={index}
                    className={cn(
                      'relative transition-all duration-100',
                      'flex flex-col justify-end'
                    )}
                    style={{ height: '48px' }}
                  >
                    <div
                      className={cn(
                        'w-full transition-all duration-100',
                        isTarget ? 'bg-white' : 'bg-[#1a1a1a]',
                      )}
                      style={{ height: `${(value / ARRAY_SIZE) * 100}%` }}
                    />
                    {isActive && (
                      <div className={cn(
                        'absolute inset-0 border',
                        linearFound ? 'border-white' : 'border-[#555]'
                      )} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Binary Search Lane */}
        <div className="border border-[#1a1a1a] bg-[#050505] flex-1">
          <div className="flex items-center justify-between border-b border-[#111] px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-[#444] text-[10px] tracking-[0.15em] uppercase">Binary Search</span>
              {binaryFound && <span className="text-[10px] tracking-widest uppercase text-white border border-white px-2 py-0.5">Found</span>}
            </div>
            <div className="text-right">
              <span className="text-white text-2xl font-bold tabular-nums">{binarySteps}</span>
              <span className="text-[#444] text-[10px] ml-1 tracking-widest uppercase">steps</span>
            </div>
          </div>
          <div className="px-3 pb-3 pt-2">
            {/* Progress bar */}
            <div className="w-full h-1 bg-[#111] mb-3">
              <div
                className="h-full bg-white transition-all duration-200"
                style={{
                  marginLeft: `${(binaryLow / ARRAY_SIZE) * 100}%`,
                  width: `${((binaryHigh - binaryLow + 1) / ARRAY_SIZE) * 100}%`
                }}
              />
            </div>
            {/* Array cells */}
            <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(${ARRAY_SIZE}, minmax(0, 1fr))` }}>
              {sortedArray.map((value, index) => {
                const isTarget = value === target;
                const isActive = index === binaryMid;
                const inRange = index >= binaryLow && index <= binaryHigh;
                return (
                  <div
                    key={index}
                    className="relative flex flex-col justify-end"
                    style={{ height: '48px' }}
                  >
                    <div
                      className={cn(
                        'w-full transition-all duration-100',
                        isTarget ? 'bg-white' :
                        inRange ? 'bg-[#2a2a2a]' : 'bg-[#111]'
                      )}
                      style={{ height: `${(value / ARRAY_SIZE) * 100}%` }}
                    />
                    {isActive && (
                      <div className={cn(
                        'absolute inset-0 border',
                        binaryFound ? 'border-white' : 'border-[#555]'
                      )} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BinaryVsLinearSearch;
