
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Play, Pause, RefreshCw, BarChartHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type Algorithm = 'bubble' | 'merge' | 'quick' | 'selection' | 'insertion' | 'heap' | 'cocktail';

const SortingVisualizer: React.FC = () => {
  const [array, setArray] = useState<number[]>([]);
  const [arraySize, setArraySize] = useState(50);
  const [speed, setSpeed] = useState(50);
  const [algorithm, setAlgorithm] = useState<Algorithm>('bubble');
  const [isSorting, setIsSorting] = useState(false);
  
  const [comparingIndices, setComparingIndices] = useState<number[]>([]);
  const [sortedIndices, setSortedIndices] = useState<Set<number>>(new Set());

  const audioContextRef = useRef<AudioContext | null>(null);
  const sortingStateRef = useRef({ isSorting: false });

  useEffect(() => {
    sortingStateRef.current.isSorting = isSorting;
  }, [isSorting]);

  const generateArray = useCallback(() => {
    setIsSorting(false);
    sortingStateRef.current.isSorting = false;
    const newArray = [];
    for (let i = 0; i < arraySize; i++) {
      newArray.push(Math.floor(Math.random() * 500) + 10);
    }
    setArray(newArray);
    setSortedIndices(new Set());
    setComparingIndices([]);
  }, [arraySize]);

  useEffect(() => {
    generateArray();
  }, [arraySize, generateArray]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        try {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported by this browser.");
        }
    }
    return () => {
        audioContextRef.current?.close().catch(console.error);
    }
  }, []);

  const playSound = (frequency = 500, duration = 0.05) => {
    if (!audioContextRef.current) return;
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    gainNode.gain.setValueAtTime(0.05, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContextRef.current.currentTime + duration);
    
    oscillator.start();
    oscillator.stop(audioContextRef.current.currentTime + duration);
  };
  
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const finishAnimation = async () => {
    for (let i = 0; i < array.length; i++) {
      if (!sortingStateRef.current.isSorting) break;
      setSortedIndices(prev => new Set(prev).add(i));
      await sleep(10);
    }
    setIsSorting(false);
  };

  // --- Sorting Algorithms ---
  
  const bubbleSort = async () => {
    let arr = [...array];
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
      let swapped = false;
      for (let j = 0; j < n - i - 1; j++) {
        if (!sortingStateRef.current.isSorting) return;
        setComparingIndices([j, j + 1]);
        if (arr[j] > arr[j + 1]) {
          swapped = true;
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          playSound(200 + arr[j+1] * 2);
          setArray([...arr]);
        }
        await sleep(200 - speed);
      }
      setSortedIndices(prev => new Set(prev).add(n - 1 - i));
      if (!swapped) {
         for (let k = 0; k < n - i - 1; k++) {
            setSortedIndices(prev => new Set(prev).add(k));
        }
        break;
      };
    }
  };

  const selectionSort = async () => {
    let arr = [...array];
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        if (!sortingStateRef.current.isSorting) return;
        setComparingIndices([minIdx, j]);
        await sleep(200 - speed);
        if (arr[j] < arr[minIdx]) {
          minIdx = j;
        }
      }
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      playSound(200 + arr[i] * 2);
      setArray([...arr]);
      setSortedIndices(prev => new Set(prev).add(i));
    }
  };

  const insertionSort = async () => {
    let arr = [...array];
    const n = arr.length;
    setSortedIndices(new Set([0]));
    for (let i = 1; i < n; i++) {
      let key = arr[i];
      let j = i - 1;
      setComparingIndices([j, i]);
      await sleep(200 - speed);
      while (j >= 0 && arr[j] > key) {
        if (!sortingStateRef.current.isSorting) return;
        setComparingIndices([j, j+1]);
        arr[j + 1] = arr[j];
        playSound(200 + arr[j+1] * 2);
        setArray([...arr]);
        await sleep(200 - speed);
        j = j - 1;
      }
      arr[j + 1] = key;
      setArray([...arr]);
       setSortedIndices(prev => {
        const newSet = new Set(prev);
        for(let k=0; k<=i; k++) newSet.add(k);
        return newSet;
      });
    }
  };
  
  const mergeSort = async () => {
    const merge = async (arr: number[], l: number, m: number, r: number) => {
        if (!sortingStateRef.current.isSorting) return;
        const n1 = m - l + 1;
        const n2 = r - m;
        let L = new Array(n1); let R = new Array(n2);
        for(let i=0; i<n1; i++) L[i] = arr[l+i];
        for(let j=0; j<n2; j++) R[j] = arr[m+1+j];

        let i=0, j=0, k=l;
        while(i < n1 && j < n2) {
            if (!sortingStateRef.current.isSorting) return;
            setComparingIndices([l+i, m+1+j]);
            if(L[i] <= R[j]) {
                arr[k] = L[i]; i++;
            } else {
                arr[k] = R[j]; j++;
            }
            playSound(200 + arr[k]);
            setArray([...arr]);
            await sleep(200 - speed);
            k++;
        }

        while(i < n1) { if (!sortingStateRef.current.isSorting) return; arr[k] = L[i]; setArray([...arr]); i++; k++; await sleep(200 - speed); }
        while(j < n2) { if (!sortingStateRef.current.isSorting) return; arr[k] = R[j]; setArray([...arr]); j++; k++; await sleep(200 - speed); }
    }
    
    const sort = async (arr: number[], l: number, r: number) => {
        if(!sortingStateRef.current.isSorting) return;
        if(l >= r) return;
        let m = l + Math.floor((r - l) / 2);
        await sort(arr, l, m);
        await sort(arr, m + 1, r);
        if(!sortingStateRef.current.isSorting) return;
        await merge(arr, l, m, r);
    }
    
    await sort([...array], 0, array.length - 1);
  };

  const quickSort = async () => {
    const partition = async (arr: number[], low: number, high: number): Promise<number> => {
        let pivot = arr[high];
        let i = low - 1;
        for (let j = low; j < high; j++) {
            if(!sortingStateRef.current.isSorting) return -1;
            setComparingIndices([j, high]);
            await sleep(200 - speed);
            if (arr[j] < pivot) {
                i++;
                [arr[i], arr[j]] = [arr[j], arr[i]];
                playSound(200 + arr[i] * 2);
                setArray([...arr]);
            }
        }
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        playSound(200 + arr[i+1] * 2);
        setArray([...arr]);
        return i + 1;
    }

    const sort = async (arr: number[], low: number, high: number) => {
        if(!sortingStateRef.current.isSorting) return;
        if (low < high) {
            let pi = await partition(arr, low, high);
            if(pi === -1) return;
            setSortedIndices(prev => new Set(prev).add(pi));
            await Promise.all([sort(arr, low, pi - 1), sort(arr, pi + 1, high)]);
        } else if (low >= 0 && low < arr.length) {
          setSortedIndices(prev => new Set(prev).add(low));
        }
    }
    await sort([...array], 0, array.length - 1);
  };
  
  const heapSort = async () => {
    let arr = [...array];
    const n = arr.length;

    const heapify = async (size: number, i: number) => {
      if (!sortingStateRef.current.isSorting) return;
      let largest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;

      setComparingIndices([i, left, right].filter(idx => idx < size));
      await sleep(200 - speed);

      if (left < size && arr[left] > arr[largest]) {
        largest = left;
      }
      if (right < size && arr[right] > arr[largest]) {
        largest = right;
      }
      if (largest !== i) {
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        playSound(200 + arr[i] * 2);
        setArray([...arr]);
        await heapify(size, largest);
      }
    };
    
    // Build max heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      await heapify(n, i);
    }
    
    // Extract elements from heap one by one
    for (let i = n - 1; i > 0; i--) {
        if (!sortingStateRef.current.isSorting) return;
        [arr[0], arr[i]] = [arr[i], arr[0]];
        playSound(200 + arr[i] * 2);
        setArray([...arr]);
        setSortedIndices(prev => new Set(prev).add(i));
        await heapify(i, 0);
    }
    setSortedIndices(prev => new Set(prev).add(0));
  };
  
  const cocktailShakerSort = async () => {
    let arr = [...array];
    let swapped = true;
    let start = 0;
    let end = arr.length;

    while (swapped) {
      if (!sortingStateRef.current.isSorting) return;
      swapped = false;

      // Forward pass (like bubble sort)
      for (let i = start; i < end - 1; ++i) {
        if (!sortingStateRef.current.isSorting) return;
        setComparingIndices([i, i + 1]);
        if (arr[i] > arr[i + 1]) {
          [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
          swapped = true;
          playSound(200 + arr[i] * 2);
          setArray([...arr]);
        }
        await sleep(200 - speed);
      }
      if (!swapped) break;
      swapped = false;
      end = end - 1;
      setSortedIndices(prev => new Set(prev).add(end));

      // Backward pass
      for (let i = end - 1; i >= start; i--) {
        if (!sortingStateRef.current.isSorting) return;
        setComparingIndices([i, i + 1]);
        if (arr[i] > arr[i + 1]) {
          [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
          swapped = true;
          playSound(200 + arr[i] * 2);
          setArray([...arr]);
        }
        await sleep(200 - speed);
      }
      start = start + 1;
      setSortedIndices(prev => new Set(prev).add(start - 1));
    }
  };

  const startSorting = async () => {
    if (isSorting) return;
    setIsSorting(true);
    sortingStateRef.current.isSorting = true;
    setSortedIndices(new Set());
    setComparingIndices([]);

    if (algorithm === 'bubble') await bubbleSort();
    else if (algorithm === 'selection') await selectionSort();
    else if (algorithm === 'insertion') await insertionSort();
    else if (algorithm === 'merge') await mergeSort();
    else if (algorithm === 'quick') await quickSort();
    else if (algorithm === 'heap') await heapSort();
    else if (algorithm === 'cocktail') await cocktailShakerSort();
    
    if(sortingStateRef.current.isSorting){
      await finishAnimation();
    } else {
      generateArray(); // Reset if cancelled
    }
  };
  
  const handleStop = () => {
    setIsSorting(false);
    sortingStateRef.current.isSorting = false;
  };

  const getBarColor = (index: number) => {
    if (sortedIndices.has(index)) return 'bg-green-500';
    if (comparingIndices.includes(index)) return 'bg-yellow-400';
    return 'bg-primary';
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-4xl mx-auto shadow-2xl flex flex-col">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
            <BarChartHorizontal/> Sorting Visualizer
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="h-96 w-full bg-muted/30 p-2 flex items-end justify-center gap-px overflow-hidden rounded-md">
            {array.map((value, idx) => (
              <div
                key={idx}
                className={cn("w-full transition-all duration-150", getBarColor(idx))}
                style={{ height: `${(value / 500) * 100}%` }}
              ></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="algorithm-select">Algorithm</Label>
              <Select value={algorithm} onValueChange={(v) => setAlgorithm(v as Algorithm)} disabled={isSorting}>
                  <SelectTrigger id="algorithm-select"><SelectValue/></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="bubble">Bubble Sort</SelectItem>
                      <SelectItem value="selection">Selection Sort</SelectItem>
                      <SelectItem value="insertion">Insertion Sort</SelectItem>
                      <SelectItem value="heap">Heap Sort</SelectItem>
                      <SelectItem value="cocktail">Cocktail Shaker Sort</SelectItem>
                      <SelectItem value="merge">Merge Sort</SelectItem>
                      <SelectItem value="quick">Quick Sort</SelectItem>
                  </SelectContent>
              </Select>
            </div>
             <div>
              <Label htmlFor="speed-slider">Speed</Label>
              <Slider id="speed-slider" min={1} max={190} step={1} value={[speed]} onValueChange={v => setSpeed(v[0])} disabled={isSorting}/>
            </div>
             <div>
              <Label htmlFor="size-slider">Array Size</Label>
              <Slider id="size-slider" min={10} max={200} step={10} value={[arraySize]} onValueChange={v => setArraySize(v[0])} disabled={isSorting}/>
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <Button onClick={generateArray} variant="outline" disabled={isSorting}><RefreshCw className="mr-2 h-4 w-4"/> New Array</Button>
            <Button onClick={isSorting ? handleStop : startSorting} className="w-32">
                {isSorting ? <><Pause className="mr-2 h-4 w-4"/>Stop</> : <><Play className="mr-2 h-4 w-4"/>Start</>}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SortingVisualizer;
