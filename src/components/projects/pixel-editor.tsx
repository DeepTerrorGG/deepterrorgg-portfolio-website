'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Pencil,
  Eraser,
  Palette,
  Download,
  Trash2,
  Plus,
  Copy,
  Trash,
  Layers,
  Play,
  Pause,
  Pipette,
  PaintBucket,
  Eye,
  EyeOff,
  Move,
  RectangleHorizontal as Rectangle,
  Minus as LineTool,
  ChevronsUpDown,
  FileDown,
  FileUp,
  Save,
  FolderOpen,
  MousePointer,
  Lasso,
  Wand2,
  FlipHorizontal,
  FlipVertical,
  RotateCw,
  Expand,
  Minus,
  Sun,
  Moon,
  Replace,
  ZoomIn,
  ZoomOut,
  Hand
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { AnimationTimeline } from './pixel-editor/animation-timeline';
import GIF from 'gif.js';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { getOutline, applyDithering, type Selection, getSelectionBounds, createSelectionMask } from './pixel-editor/selection';

const GRID_SIZE_OPTIONS = [16, 32, 48, 64];
const DEFAULT_GRID_SIZE = 32;

type Pixel = string;
export type LayerData = Pixel[][];
export type SelectionMask = boolean[][] | null;

type Layer = {
    data: LayerData;
    opacity: number;
    name: string;
};
type Frame = {
    layers: Layer[];
    hiddenLayers: Set<number>;
};

const createEmptyLayer = (size: number, name: string = 'Layer'): Layer => ({
    data: Array(size).fill(null).map(() => Array(size).fill('transparent')),
    opacity: 1,
    name: name,
});

const createInitialFrame = (size: number): Frame => ({
    layers: [createEmptyLayer(size, 'Layer 1')],
    hiddenLayers: new Set(),
});

type Tool = 'pencil' | 'eraser' | 'bucket' | 'picker' | 'move' | 'line' | 'rectangle' | 'ellipse' | 'lasso' | 'magic-wand' | 'dodge' | 'burn' | 'color-replacement' | 'dithering' | 'hand';

const PixelEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE);
  const [pixelSize, setPixelSize] = useState(20);
  
  const [frames, setFrames] = useState<Frame[]>([createInitialFrame(DEFAULT_GRID_SIZE)]);
  const [activeFrameIndex, setActiveFrameIndex] = useState(0);
  const [activeLayerIndex, setActiveLayerIndex] = useState(0);

  const [primaryColor, setPrimaryColor] = useState('#FFFFFF');
  const [secondaryColor, setSecondaryColor] = useState('#000000');
  const [tool, setTool] = useState<Tool>('pencil');
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{x: number, y: number} | null>(null);
  const [tempLayer, setTempLayer] = useState<LayerData | null>(null);
  
  const [selection, setSelection] = useState<Selection | null>(null);
  const [selectionMask, setSelectionMask] = useState<SelectionMask>(null);
  const [transformAction, setTransformAction] = useState<'moving' | 'scaling' | 'rotating' | null>(null);

  const [isAnimating, setIsAnimating] = useState(false);
  const [fps, setFps] = useState(4);
  const [showOnionSkin, setShowOnionSkin] = useState(true);

  // New states for zoom and pan
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number, y: number } | null>(null);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });

  const palette = ['#FFFFFF', '#C2C2C2', '#858585', '#474747', '#000000', '#FF453A', '#FF9F0A', '#FFD60A', '#32D74B', '#64D2FF', '#0A84FF', '#BF5AF2'];

  const activeFrame = frames[activeFrameIndex];
  const activeLayer = activeFrame?.layers[activeLayerIndex];

  const updateActiveLayer = (updater: (layerData: LayerData) => LayerData) => {
    setFrames(prevFrames => {
        const newFrames = [...prevFrames];
        const frameToUpdate = { ...newFrames[activeFrameIndex] };
        const newLayers = [...frameToUpdate.layers];
        const layerToUpdate = { ...newLayers[activeLayerIndex] };
        layerToUpdate.data = updater(layerToUpdate.data);
        newLayers[activeLayerIndex] = layerToUpdate;
        frameToUpdate.layers = newLayers;
        newFrames[activeFrameIndex] = frameToUpdate;
        return newFrames;
    });
  };

  // Main canvas drawing logic
  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeFrame) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const parent = canvas.parentElement;
    if (!parent) return;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvasOffset.x, canvasOffset.y);

    // Onion Skinning
    if (showOnionSkin && activeFrameIndex > 0) {
        const prevFrame = frames[activeFrameIndex - 1];
        prevFrame.layers.forEach((layer, layerIndex) => {
            if (prevFrame.hiddenLayers.has(layerIndex)) return;
            ctx.globalAlpha = layer.opacity * 0.15;
            for (let y = 0; y < gridSize; y++) {
                for (let x = 0; x < gridSize; x++) {
                    if (layer.data[y] && layer.data[y][x] !== 'transparent') {
                        ctx.fillStyle = layer.data[y][x];
                        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                    }
                }
            }
        });
        ctx.globalAlpha = 1.0;
    }

    // Draw layers
    activeFrame.layers.forEach((layer, layerIndex) => {
        if(activeFrame.hiddenLayers.has(layerIndex)) return;
        ctx.globalAlpha = layer.opacity;
        const layerToDraw = (layerIndex === activeLayerIndex && tempLayer) ? tempLayer : layer.data;
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                if (layerToDraw[y]?.[x] && layerToDraw[y][x] !== 'transparent') {
                    ctx.fillStyle = layerToDraw[y][x];
                    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                }
            }
        }
    });
     ctx.globalAlpha = 1.0;
    
    // Grid Lines
    if(pixelSize > 4){
        ctx.strokeStyle = 'hsl(var(--border))'; ctx.lineWidth = 0.5;
        for (let i = 0; i <= gridSize; i++) {
            ctx.beginPath(); ctx.moveTo(i * pixelSize, 0); ctx.lineTo(i * pixelSize, gridSize * pixelSize); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i * pixelSize); ctx.lineTo(gridSize * pixelSize, i * pixelSize); ctx.stroke();
        }
    }

    // Selection Outline
    if (selectionMask) {
        const outline = getOutline(selectionMask);
        ctx.fillStyle = 'rgba(0, 128, 255, 0.3)';
        for (const {x,y} of outline) {
             ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
        ctx.strokeStyle = 'rgba(0, 128, 255, 0.8)'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]);
        const bounds = getSelectionBounds(selectionMask);
        if (bounds) ctx.strokeRect(bounds.minX * pixelSize, bounds.minY * pixelSize, (bounds.maxX - bounds.minX + 1) * pixelSize, (bounds.maxY - bounds.minY + 1) * pixelSize);
        ctx.setLineDash([]);
    }
    ctx.restore();
  }, [gridSize, pixelSize, activeFrame, activeLayerIndex, showOnionSkin, activeFrameIndex, frames, tempLayer, selectionMask, canvasOffset]);

  useEffect(() => { drawGrid(); }, [drawGrid]);
  
  // Animation preview logic
  useEffect(() => {
    if (!isAnimating || frames.length === 0) return;
    let currentFrameIdx = 0;
    const interval = setInterval(() => {
        const frameToDraw = frames[currentFrameIdx];
        const previewCanvas = previewCanvasRef.current;
        if (!previewCanvas || !frameToDraw) return;
        const ctx = previewCanvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        frameToDraw.layers.forEach((layer, layerIndex) => {
            if(frameToDraw.hiddenLayers.has(layerIndex)) return;
            ctx.globalAlpha = layer.opacity;
            for (let y = 0; y < gridSize; y++) {
                for (let x = 0; x < gridSize; x++) {
                    if (layer.data[y]?.[x] && layer.data[y][x] !== 'transparent') {
                        ctx.fillStyle = layer.data[y][x]; ctx.fillRect(x, y, 1, 1);
                    }
                }
            }
        });
        ctx.globalAlpha = 1.0;
        currentFrameIdx = (currentFrameIdx + 1) % frames.length;
    }, 1000 / fps);
    return () => clearInterval(interval);
  }, [isAnimating, frames, gridSize, fps]);

  const getCoords = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
      const canvas = canvasRef.current; if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      // Adjust for canvas offset (panning)
      const x = Math.floor((clientX - rect.left - canvasOffset.x) / pixelSize);
      const y = Math.floor((clientY - rect.top - canvasOffset.y) / pixelSize);
      if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) return { x, y };
      return null;
  }
  
  // Tool Implementations
  const applyBrush = (layer: LayerData, x: number, y: number, color: string, toolType: 'pencil' | 'eraser' | 'dodge' | 'burn' | 'color-replacement', secondaryColor?: string) => {
    const newLayer = layer.map(row => [...row]);
    if (!newLayer[y] || !newLayer[y][x]) return newLayer;
    
    if (toolType === 'eraser') {
        newLayer[y][x] = 'transparent';
    } else if (toolType === 'color-replacement') {
        if (newLayer[y][x] !== 'transparent' && newLayer[y][x] === secondaryColor) {
            newLayer[y][x] = color;
        }
    } else {
        newLayer[y][x] = color;
    }
    return newLayer;
  };
  
  const drawLine = (p1: {x:number, y:number}, p2: {x:number, y:number}, layerData: LayerData, color: string) => {
    const newLayerData = layerData.map(row => [...row]); let x0 = p1.x, y0 = p1.y, x1 = p2.x, y1 = p2.y;
    const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1; const dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
    let err = dx + dy, e2;
    for (;;) {
      if (x0 >= 0 && x0 < gridSize && y0 >= 0 && y0 < gridSize) newLayerData[y0][x0] = color;
      if (x0 === x1 && y0 === y1) break; e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; }
    } return newLayerData;
  }

  const drawShape = (p1: {x:number,y:number}, p2: {x:number,y:number}, layerData: LayerData, color: string, shape: 'rectangle' | 'ellipse') => {
    const newLayer = layerData.map(r => [...r]);
    const x0 = Math.min(p1.x, p2.x), x1 = Math.max(p1.x, p2.x);
    const y0 = Math.min(p1.y, p2.y), y1 = Math.max(p1.y, p2.y);
    if(shape === 'rectangle') {
        for(let y=y0; y<=y1; y++) for(let x=x0; x<=x1; x++) if(x>=0&&x<gridSize&&y>=0&&y<gridSize) newLayer[y][x]=color;
    } else { // Ellipse
        const rx = (x1-x0)/2, ry = (y1-y0)/2; const cx = x0+rx, cy = y0+ry;
        for(let y=y0; y<=y1; y++) for(let x=x0; x<=x1; x++) if(x>=0&&x<gridSize&&y>=0&&y<gridSize && ((x-cx)/rx)**2+((y-cy)/ry)**2 <= 1) newLayer[y][x]=color;
    }
    return newLayer;
  };
  
  const floodFill = (layer: LayerData, x: number, y: number, targetColor: string, fillColor: string): LayerData => {
    if (targetColor === fillColor) return layer;
    const newLayer = layer.map(row => [...row]); const queue = [[x, y]];
    while (queue.length > 0) {
        const [cx, cy] = queue.shift()!;
        if (cx < 0 || cx >= gridSize || cy < 0 || cy >= gridSize) continue;
        if (newLayer[cy][cx] === targetColor) {
            newLayer[cy][cx] = fillColor;
            queue.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
        }
    } return newLayer;
  };
  
  // Mouse/Touch Handlers
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (isPanning) {
      setPanStart({ x: ('clientX' in e ? e.clientX : e.touches[0].clientX) - canvasOffset.x, y: ('clientY' in e ? e.clientY : e.touches[0].clientY) - canvasOffset.y });
      return;
    }

    const coords = getCoords(e); if (!coords || !activeLayer) return; setIsDrawing(true); setStartPoint(coords); setTempLayer(null);
    const color = (e as React.MouseEvent).button === 2 ? secondaryColor : primaryColor;

    switch(tool) {
        case 'pencil': case 'eraser': case 'dodge': case 'burn': case 'color-replacement':
            updateActiveLayer(l => applyBrush(l, coords.x, coords.y, color, tool, secondaryColor)); break;
        case 'picker':
            const pickedColor = activeLayer.data[coords.y]?.[coords.x];
            if (pickedColor && pickedColor !== 'transparent') {
                if ((e as React.MouseEvent).button === 2) setSecondaryColor(pickedColor); else setPrimaryColor(pickedColor);
                toast({ title: "Color Picked", description: `Set ${ (e as React.MouseEvent).button === 2 ? 'secondary' : 'primary'} color to ${pickedColor}` });
            } break;
        case 'bucket':
            updateActiveLayer(l => floodFill(l, coords.x, coords.y, l[coords.y][coords.x], color)); break;
        case 'magic-wand':
            setSelectionMask(createSelectionMask(activeLayer.data, coords, 'magic-wand')); break;
        case 'dithering':
            if (selectionMask) {
                updateActiveLayer(l => applyDithering(l, selectionMask, primaryColor, secondaryColor));
            } else {
                toast({title: "No Selection", description: "Please make a selection before using the dithering tool.", variant: "destructive"});
            }
            break;
        default: break;
    }
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (isPanning && panStart) {
        const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX;
        const clientY = 'clientY' in e ? e.clientY : e.touches[0].clientY;
        setCanvasOffset({ x: clientX - panStart.x, y: clientY - panStart.y });
        return;
    }
    if (!isDrawing || !startPoint) return; const coords = getCoords(e); if (!coords) return;
    const color = (e as React.MouseEvent).button === 2 ? secondaryColor : primaryColor;
    switch(tool) {
        case 'pencil': case 'eraser': case 'dodge': case 'burn': case 'color-replacement':
            updateActiveLayer(l => applyBrush(l, coords.x, coords.y, color, tool, secondaryColor)); break;
        case 'line':
            setTempLayer(drawLine(startPoint, coords, createEmptyLayer(gridSize).data, color)); break;
        case 'rectangle': case 'ellipse':
            setTempLayer(drawShape(startPoint, coords, createEmptyLayer(gridSize).data, color, tool)); break;
        case 'lasso': 
             // For lasso, we'd need to collect points and then form a polygon. Simplified for now.
             break;
    }
  };

  const handleMouseUp = (e: React.MouseEvent | React.TouchEvent) => {
    if (isPanning) {
        setIsPanning(false);
        setPanStart(null);
        return;
    }
    if (isDrawing && startPoint && tempLayer) {
        updateActiveLayer(currentLayer => {
            const newLayerData = currentLayer.map(row => [...row]);
            for (let y = 0; y < gridSize; y++) for (let x = 0; x < gridSize; x++) if (tempLayer[y][x] !== 'transparent') newLayerData[y][x] = tempLayer[y][x];
            return newLayerData;
        });
    }
    const coords = getCoords(e); if(coords && startPoint) {
        if(tool === 'rectangle' || tool === 'ellipse' || tool === 'lasso') setSelectionMask(createSelectionMask(activeLayer.data, startPoint, tool, coords));
    }
    setIsDrawing(false); setStartPoint(null); setTempLayer(null);
  };
  
    // Keyboard listener for panning
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault();
                setIsPanning(true);
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                setIsPanning(false);
                setPanStart(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

  // Control Handlers, Save/Load, Animation, Layers etc.
  const clearLayer = (layerIndex: number) => { updateActiveLayer(() => createEmptyLayer(gridSize, activeLayer.name).data); toast({ title: "Layer Cleared" }); };
  const handleGridSizeChange = (size: number) => { setGridSize(size); setFrames([createInitialFrame(size)]); setActiveFrameIndex(0); setActiveLayerIndex(0); setSelection(null); };
  const saveProject = () => { /* ... */ }; const loadProject = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... */ }; const downloadImage = (format: 'png' | 'gif') => { /* ... */ };
  const addFrame = () => setFrames(prev => [...prev, createInitialFrame(gridSize)]);
  const duplicateFrame = (index: number) => setFrames(prev => { const newFrames=[...prev]; newFrames.splice(index+1, 0, JSON.parse(JSON.stringify(prev[index]))); return newFrames; });
  const deleteFrame = (index: number) => { if(frames.length<=1)return; setFrames(p=>p.filter((_,i)=>i!==index)); if(activeFrameIndex>=index)setActiveFrameIndex(Math.max(0,activeFrameIndex-1)); };
  const addLayer = () => { /* ... */ }; const deleteLayer = (index: number) => { /* ... */ }; const reorderLayer = (from:number, to:number) => { /* ... */ };
  const mergeLayerDown = (index: number) => { /* ... */ }; const setLayerOpacity = (index: number, opacity: number) => { /* ... */ }; const toggleLayerVisibility = (index: number) => { /* ... */ };
  
  const transformLayer = (transformation: 'flip-h' | 'flip-v' | 'rotate-cw') => {
    updateActiveLayer(layerData => {
        const newLayer = createEmptyLayer(gridSize).data;
        // Use selection mask if available, otherwise transform the whole layer
        const mask = selectionMask || Array(gridSize).fill(null).map(() => Array(gridSize).fill(true));
        const bounds = getSelectionBounds(mask);
        if (!bounds) return layerData; // Nothing to transform

        const { minX, minY, maxX, maxY } = bounds;
        
        const originalData = layerData.map(row => [...row]); // Make a safe copy

        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                if (mask[y][x]) {
                    let newX = x, newY = y;
                    if (transformation === 'flip-h') {
                        newX = maxX - (x - minX);
                    }
                    if (transformation === 'flip-v') {
                        newY = maxY - (y - minY);
                    }
                    if (transformation === 'rotate-cw') {
                        // This simple rotation works best for square selections
                        newX = minX + (y - minY);
                        newY = minY + (maxX - x);
                    }

                    if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {
                        newLayer[newY][newX] = originalData[y][x];
                    }
                }
            }
        }
        
        const finalLayer = originalData.map(row => [...row]);
        // Clear original selection area and apply transformed pixels
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                if (mask[y][x]) {
                    finalLayer[y][x] = 'transparent'; // Clear old spot
                }
                if (newLayer[y][x] !== 'transparent') {
                    finalLayer[y][x] = newLayer[y][x]; // Apply transformed pixel
                }
            }
        }

        return finalLayer;
    });
    toast({ title: 'Transformation Applied' });
};
  
  const toolGroups: { name: string; tools: { id: Tool; icon: React.ReactNode; name: string }[] }[] = [
    { name: "Selection", tools: [
        { id: 'move', icon: <MousePointer />, name: 'Select' }, { id: 'lasso', icon: <Lasso />, name: 'Lasso Select' }, 
        { id: 'rectangle', icon: <div className="w-4 h-4 border-2 border-current" />, name: 'Rectangle Select' }, 
        { id: 'ellipse', icon: <div className="w-4 h-4 border-2 border-current rounded-full"/>, name: 'Ellipse Select' },
        { id: 'magic-wand', icon: <Wand2 />, name: 'Magic Wand' },
    ]},
    { name: "Drawing", tools: [
        { id: 'pencil', icon: <Pencil />, name: 'Pencil' }, { id: 'eraser', icon: <Eraser />, name: 'Eraser' },
        { id: 'bucket', icon: <PaintBucket />, name: 'Fill Bucket' }, { id: 'line', icon: <LineTool />, name: 'Line Tool' },
        { id: 'dithering', icon: <div className="w-4 h-4 bg-[linear-gradient(45deg,currentColor_25%,transparent_25%,transparent_75%,currentColor_75%),linear-gradient(45deg,transparent_25%,currentColor_25%,currentColor_75%,transparent_75%)] bg-[size:4px_4px] bg-[position:0_0,2px_2px]" />, name: 'Dithering' },
        { id: 'color-replacement', icon: <Replace/>, name: 'Color Replacer'}
    ]},
    { name: "Retouching", tools: [
        { id: 'dodge', icon: <Sun />, name: 'Dodge Tool' }, { id: 'burn', icon: <Moon />, name: 'Burn Tool' },
    ]},
    { name: "Transform", tools: [
        { id: 'flip-h', icon: <FlipHorizontal/>, name: 'Flip Horizontal' },
        { id: 'flip-v', icon: <FlipVertical/>, name: 'Flip Vertical' },
        { id: 'rotate-cw', icon: <RotateCw/>, name: 'Rotate 90° CW' },
    ]}
  ];

  return (
    <div className="flex flex-col w-full h-full bg-card">
        <TooltipProvider>
      <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-48 border-b md:border-b-0 md:border-r p-2 flex flex-col gap-2 overflow-y-auto">
            {toolGroups.map(group => (
                <div key={group.name}>
                    <h3 className="text-base font-bold text-primary mb-2 px-2">{group.name}</h3>
                    <div className="grid grid-cols-4 md:grid-cols-2 gap-1">
                        {group.tools.map(t => (
                            <Tooltip key={t.id}>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant={tool === t.id ? 'secondary' : 'ghost'} 
                                    size="icon" 
                                    onClick={() => group.name === 'Transform' ? transformLayer(t.id.split('-')[1] as 'h' | 'v' | 'cw') : setTool(t.id)}
                                  >
                                    {t.icon}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="right"><p>{t.name}</p></TooltipContent>
                            </Tooltip>
                        ))}
                    </div>
                </div>
            ))}
             <div>
                <h3 className="text-base font-bold text-primary mt-2 mb-2 px-2">Color</h3>
                <div className="flex items-center gap-2">
                    <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-10 h-10 bg-transparent border-2 border-primary rounded-md cursor-pointer"/>
                    <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="w-10 h-10 bg-transparent border-2 border-border rounded-md cursor-pointer"/>
                </div>
             </div>
             <div className="mt-auto space-y-2 pt-4">
                <Tooltip><TooltipTrigger asChild><Button variant="outline" className="w-full" onClick={() => setSelectionMask(null)}>Deselect</Button></TooltipTrigger><TooltipContent><p>Clear current selection (Ctrl+D)</p></TooltipContent></Tooltip>
             </div>
        </div>
        <div className={cn("flex-grow flex flex-col items-center justify-center p-2 md:p-4 bg-muted/30 overflow-hidden", isPanning ? 'cursor-grabbing' : 'cursor-crosshair')}>
            <canvas ref={canvasRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} style={{ imageRendering: 'pixelated' }} />
        </div>
        <div className="w-full md:w-64 border-t md:border-t-0 md:border-l p-2 flex flex-col gap-2 overflow-y-auto">
            <Card><CardHeader className="p-2"><h4 className="font-bold text-center text-sm">Animation</h4></CardHeader><CardContent className="p-2 space-y-2">
                <canvas ref={previewCanvasRef} width={gridSize} height={gridSize} className="w-full aspect-square border bg-background" style={{ imageRendering: 'pixelated' }}/>
                <div className="flex items-center gap-2"><Button variant="outline" size="icon" onClick={()=>setIsAnimating(!isAnimating)}>{isAnimating?<Pause/>:<Play/>}</Button><div className="w-full"><Label className="text-xs">FPS: {fps}</Label><Slider min={1} max={24} step={1} value={[fps]} onValueChange={v=>setFps(v[0])} /></div></div>
                <div className="flex items-center space-x-2"><input type="checkbox" id="onion-skin" checked={showOnionSkin} onChange={e=>setShowOnionSkin(e.target.checked)}/><Label htmlFor="onion-skin" className="text-sm">Onion Skin</Label></div>
                <div className="flex gap-2"><Button onClick={()=>downloadImage('png')} className="flex-1"><Download className="mr-2 h-4 w-4"/>PNG</Button><Button onClick={()=>downloadImage('gif')} className="flex-1"><Download className="mr-2 h-4 w-4"/>GIF</Button></div>
            </CardContent></Card>
            <Card>
                <CardHeader className="p-2"><h4 className="font-bold text-center text-sm">Canvas</h4></CardHeader>
                <CardContent className="p-2 space-y-2">
                    <div>
                        <Label className="text-xs">Zoom</Label>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={() => setPixelSize(s => Math.max(s - 4, 4))}><ZoomOut className="h-4 w-4"/></Button>
                            <Slider min={4} max={40} step={2} value={[pixelSize]} onValueChange={v => setPixelSize(v[0])} />
                            <Button variant="outline" size="icon" onClick={() => setPixelSize(s => Math.min(s + 4, 40))}><ZoomIn className="h-4 w-4"/></Button>
                        </div>
                    </div>
                    <Label className="text-xs">Grid Size</Label>
                    <div className="grid grid-cols-2 gap-2">
                        {GRID_SIZE_OPTIONS.map(size => (
                            <Button key={size} variant={gridSize === size ? 'secondary' : 'outline'} onClick={() => handleGridSizeChange(size)}>{size}x{size}</Button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
      <AnimationTimeline frames={frames.map(f => f.layers.map(l => l.data))} activeFrameIndex={activeFrameIndex} onSelectFrame={setActiveFrameIndex} onAddFrame={addFrame} onDuplicateFrame={duplicateFrame} onDeleteFrame={deleteFrame} gridSize={gridSize} />
      </TooltipProvider>
    </div>
  );
};
export default PixelEditor;
