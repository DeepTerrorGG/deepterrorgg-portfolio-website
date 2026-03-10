
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
    Hand,
    Square,
    Circle,
    Type,
    Monitor
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
import { ScrollArea } from '../ui/scroll-area';

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
    const [brushSize, setBrushSize] = useState(1);
    const [symmetry, setSymmetry] = useState<'none' | 'horizontal' | 'vertical' | 'both'>('none');

    const [isDrawing, setIsDrawing] = useState(false);
    const [startPoint, setStartPoint] = useState<{ x: number, y: number } | null>(null);
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

        // Set canvas dimensions based on pixel size and grid size
        const canvasSize = gridSize * pixelSize;
        canvas.width = canvasSize;
        canvas.height = canvasSize;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

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
            if (activeFrame.hiddenLayers.has(layerIndex)) return;
            ctx.globalAlpha = layer.opacity;

            for (let y = 0; y < gridSize; y++) {
                for (let x = 0; x < gridSize; x++) {
                    const isDrawingLayer = (layerIndex === activeLayerIndex && tempLayer);
                    const color = isDrawingLayer && tempLayer[y]?.[x] !== 'transparent'
                        ? tempLayer[y][x]
                        : layer.data[y]?.[x];

                    if (color && color !== 'transparent') {
                        ctx.fillStyle = color;
                        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                    }
                }
            }
        });
        ctx.globalAlpha = 1.0;

        // Grid Lines
        if (pixelSize > 4) {
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
            for (const { x, y } of outline) {
                ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
            }
            ctx.strokeStyle = 'rgba(0, 128, 255, 0.8)'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]);
            const bounds = getSelectionBounds(selectionMask);
            if (bounds) ctx.strokeRect(bounds.minX * pixelSize, bounds.minY * pixelSize, (bounds.maxX - bounds.minX + 1) * pixelSize, (bounds.maxY - bounds.minY + 1) * pixelSize);
            ctx.setLineDash([]);
        }
    }, [gridSize, pixelSize, activeFrame, activeLayerIndex, showOnionSkin, activeFrameIndex, frames, tempLayer, selectionMask]);

    useEffect(() => { drawGrid(); }, [drawGrid]);

    // Animation preview logic
    useEffect(() => {
        const previewCanvas = previewCanvasRef.current;
        if (!previewCanvas || frames.length === 0) return;
        const ctx = previewCanvas.getContext('2d');
        if (!ctx) return;

        let interval: NodeJS.Timeout;
        let currentFrameIdx = isAnimating ? 0 : activeFrameIndex;

        const renderFrame = () => {
            const frameToDraw = frames[currentFrameIdx];
            if (!frameToDraw) return;
            ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
            frameToDraw.layers.forEach((layer, layerIndex) => {
                if (frameToDraw.hiddenLayers.has(layerIndex)) return;
                ctx.globalAlpha = layer.opacity;
                for (let y = 0; y < gridSize; y++) {
                    for (let x = 0; x < gridSize; x++) {
                        if (layer.data[y]?.[x] && layer.data[y][x] !== 'transparent') {
                            ctx.fillStyle = layer.data[y][x];
                            ctx.fillRect(x, y, 1, 1);
                        }
                    }
                }
            });
            ctx.globalAlpha = 1.0;
        };

        if (isAnimating) {
            interval = setInterval(() => {
                renderFrame();
                currentFrameIdx = (currentFrameIdx + 1) % frames.length;
            }, 1000 / fps);
        } else {
            renderFrame();
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isAnimating, frames, gridSize, fps, activeFrameIndex]);

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

        const drawPixel = (px: number, py: number) => {
            if (px < 0 || px >= gridSize || py < 0 || py >= gridSize) return;
            if (toolType === 'eraser') {
                newLayer[py][px] = 'transparent';
            } else if (toolType === 'color-replacement') {
                if (newLayer[py][px] !== 'transparent' && newLayer[py][px] === secondaryColor) {
                    newLayer[py][px] = color;
                }
            } else {
                newLayer[py][px] = color;
            }
        };

        const drawWithSymmetry = (centerX: number, centerY: number) => {
            const points = [{ x: centerX, y: centerY }];
            if (symmetry === 'horizontal' || symmetry === 'both') points.push({ x: gridSize - 1 - centerX, y: centerY });
            if (symmetry === 'vertical' || symmetry === 'both') points.push({ x: centerX, y: gridSize - 1 - centerY });
            if (symmetry === 'both') points.push({ x: gridSize - 1 - centerX, y: gridSize - 1 - centerY });

            points.forEach(p => {
                const offset = Math.floor(brushSize / 2);
                for (let by = -offset; by < brushSize - offset; by++) {
                    for (let bx = -offset; bx < brushSize - offset; bx++) {
                        drawPixel(p.x + bx, p.y + by);
                    }
                }
            });
        };

        drawWithSymmetry(x, y);

        return newLayer;
    };

    const drawLine = (p1: { x: number, y: number }, p2: { x: number, y: number }, layerData: LayerData, color: string) => {
        const newLayerData = layerData.map(row => [...row]); let x0 = p1.x, y0 = p1.y, x1 = p2.x, y1 = p2.y;
        const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1; const dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
        let err = dx + dy, e2;
        for (; ;) {
            if (x0 >= 0 && x0 < gridSize && y0 >= 0 && y0 < gridSize) newLayerData[y0][x0] = color;
            if (x0 === x1 && y0 === y1) break; e2 = 2 * err;
            if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; }
        } return newLayerData;
    }

    const drawShape = (p1: { x: number, y: number }, p2: { x: number, y: number }, layerData: LayerData, color: string, shape: 'rectangle' | 'ellipse') => {
        const newLayer = layerData.map(r => [...r]);
        const x0 = Math.min(p1.x, p2.x), x1 = Math.max(p1.x, p2.x);
        const y0 = Math.min(p1.y, p2.y), y1 = Math.max(p1.y, p2.y);
        if (shape === 'rectangle') {
            for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) newLayer[y][x] = color;
        } else { // Ellipse
            const rx = (x1 - x0) / 2, ry = (y1 - y0) / 2; const cx = x0 + rx, cy = y0 + ry;
            for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (x >= 0 && x < gridSize && y >= 0 && y < gridSize && ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) newLayer[y][x] = color;
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

        switch (tool) {
            case 'pencil': case 'eraser': case 'dodge': case 'burn': case 'color-replacement':
                updateActiveLayer(l => applyBrush(l, coords.x, coords.y, color, tool, secondaryColor)); break;
            case 'picker':
                const pickedColor = activeLayer.data[coords.y]?.[coords.x];
                if (pickedColor && pickedColor !== 'transparent') {
                    if ((e as React.MouseEvent).button === 2) setSecondaryColor(pickedColor); else setPrimaryColor(pickedColor);
                    toast({ title: "Color Picked", description: `Set ${(e as React.MouseEvent).button === 2 ? 'secondary' : 'primary'} color to ${pickedColor}` });
                } break;
            case 'bucket':
                updateActiveLayer(l => floodFill(l, coords.x, coords.y, l[coords.y][coords.x], color)); break;
            case 'magic-wand':
                setSelectionMask(createSelectionMask(activeLayer.data, coords, 'magic-wand')); break;
            case 'dithering':
                if (selectionMask) {
                    updateActiveLayer(l => applyDithering(l, selectionMask, primaryColor, secondaryColor));
                } else {
                    toast({ title: "No Selection", description: "Please make a selection before using the dithering tool.", variant: "destructive" });
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
        switch (tool) {
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
        const coords = getCoords(e); if (coords && startPoint) {
            if (tool === 'rectangle' || tool === 'ellipse' || tool === 'lasso') setSelectionMask(createSelectionMask(activeLayer.data, startPoint, tool, coords));
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

    // Changing grid size shouldn't wipe data immediately if we can preserve it, but creating initial frame resets.
    // We'll preserve existing frames and clip/expand them as needed to prevent wiping.
    const handleGridSizeChange = (newSize: number) => {
        setGridSize(newSize);
        setFrames(prev => prev.map(frame => ({
            ...frame,
            layers: frame.layers.map(layer => {
                const newData = createEmptyLayer(newSize, layer.name).data;
                for (let y = 0; y < Math.min(newSize, layer.data.length); y++) {
                    for (let x = 0; x < Math.min(newSize, layer.data[y].length); x++) {
                        newData[y][x] = layer.data[y][x];
                    }
                }
                return { ...layer, data: newData };
            })
        })));
        setSelection(null);
        setSelectionMask(null);
    };

    const saveProject = () => { toast({ title: "Project Saved (Stub)" }) };
    const loadProject = (e: React.ChangeEvent<HTMLInputElement>) => { toast({ title: "Project Loaded (Stub)" }) };

    const downloadImage = async (format: 'png' | 'gif') => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = gridSize;
        tempCanvas.height = gridSize;
        const ctx = tempCanvas.getContext('2d');
        if (!ctx) return;

        if (format === 'png') {
            const frameToDraw = frames[activeFrameIndex];
            if (!frameToDraw) return;

            frameToDraw.layers.forEach((layer, layerIndex) => {
                if (frameToDraw.hiddenLayers.has(layerIndex)) return;
                ctx.globalAlpha = layer.opacity;
                for (let y = 0; y < gridSize; y++) {
                    for (let x = 0; x < gridSize; x++) {
                        if (layer.data[y]?.[x] && layer.data[y][x] !== 'transparent') {
                            ctx.fillStyle = layer.data[y][x];
                            ctx.fillRect(x, y, 1, 1);
                        }
                    }
                }
            });
            ctx.globalAlpha = 1.0;

            const url = tempCanvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = url;
            a.download = 'pixel-art.png';
            a.click();
            toast({ title: 'Exported PNG Successfully' });
        } else if (format === 'gif') {
            try {
                const gif = new GIF({
                    workers: 2,
                    quality: 10,
                    width: gridSize,
                    height: gridSize,
                    workerScript: '/gif.worker.js' // Needs correct worker path to function
                });

                frames.forEach(frame => {
                    ctx.clearRect(0, 0, gridSize, gridSize);
                    frame.layers.forEach((layer, layerIndex) => {
                        if (frame.hiddenLayers.has(layerIndex)) return;
                        ctx.globalAlpha = layer.opacity;
                        for (let y = 0; y < gridSize; y++) {
                            for (let x = 0; x < gridSize; x++) {
                                if (layer.data[y]?.[x] && layer.data[y][x] !== 'transparent') {
                                    ctx.fillStyle = layer.data[y][x];
                                    ctx.fillRect(x, y, 1, 1);
                                }
                            }
                        }
                    });
                    ctx.globalAlpha = 1.0;
                    gif.addFrame(ctx, { copy: true, delay: 1000 / fps });
                });

                gif.on('finished', function (blob: Blob) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'pixel-art.gif';
                    a.click();
                    URL.revokeObjectURL(url);
                    toast({ title: 'Exported GIF Successfully' });
                });

                gif.render();
            } catch (e) {
                console.error("GIF export failed", e);
                toast({ title: 'Export Failed', description: "GIF export requires gif.worker.js to be available on the server.", variant: 'destructive' });
            }
        }
    };

    const addFrame = () => setFrames(prev => [...prev, createInitialFrame(gridSize)]);
    const duplicateFrame = (index: number) => setFrames(prev => { const newFrames = [...prev]; newFrames.splice(index + 1, 0, JSON.parse(JSON.stringify(prev[index]))); return newFrames; });
    const deleteFrame = (index: number) => { if (frames.length <= 1) return; setFrames(p => p.filter((_, i) => i !== index)); if (activeFrameIndex >= index) setActiveFrameIndex(Math.max(0, activeFrameIndex - 1)); };
    const addLayer = () => {
        setFrames(prev => {
            const newFrames = [...prev];
            const frame = { ...newFrames[activeFrameIndex] };
            frame.layers = [...frame.layers, createEmptyLayer(gridSize, `Layer ${frame.layers.length + 1}`)];
            newFrames[activeFrameIndex] = frame;
            return newFrames;
        });
        setActiveLayerIndex(frames[activeFrameIndex].layers.length);
    };

    const deleteLayer = (index: number) => {
        if (frames[activeFrameIndex].layers.length <= 1) return;
        setFrames(prev => {
            const newFrames = [...prev];
            const frame = { ...newFrames[activeFrameIndex] };
            frame.layers = frame.layers.filter((_, i) => i !== index);
            if (activeLayerIndex >= index) setActiveLayerIndex(Math.max(0, activeLayerIndex - 1));
            newFrames[activeFrameIndex] = frame;
            return newFrames;
        });
    };

    const reorderLayer = (from: number, to: number) => {
        setFrames(prev => {
            const newFrames = [...prev];
            const frame = { ...newFrames[activeFrameIndex] };
            const layers = [...frame.layers];
            const [moved] = layers.splice(from, 1);
            layers.splice(to, 0, moved);
            frame.layers = layers;
            newFrames[activeFrameIndex] = frame;

            // Adjust activeLayerIndex
            if (activeLayerIndex === from) setActiveLayerIndex(to);
            else if (activeLayerIndex > from && activeLayerIndex <= to) setActiveLayerIndex(activeLayerIndex - 1);
            else if (activeLayerIndex < from && activeLayerIndex >= to) setActiveLayerIndex(activeLayerIndex + 1);

            return newFrames;
        });
    };

    const mergeLayerDown = (index: number) => {
        if (index === 0) return; // Cannot merge down the bottom layer
        setFrames(prev => {
            const newFrames = [...prev];
            const frame = { ...newFrames[activeFrameIndex] };
            const layers = [...frame.layers];
            const topLayer = layers[index];
            const bottomLayer = layers[index - 1];

            const mergedData = bottomLayer.data.map(row => [...row]);
            for (let y = 0; y < gridSize; y++) {
                for (let x = 0; x < gridSize; x++) {
                    if (topLayer.data[y][x] !== 'transparent') {
                        mergedData[y][x] = topLayer.data[y][x];
                    }
                }
            }

            layers[index - 1] = { ...bottomLayer, data: mergedData };
            layers.splice(index, 1);
            frame.layers = layers;
            newFrames[activeFrameIndex] = frame;
            if (activeLayerIndex >= index) setActiveLayerIndex(activeLayerIndex - 1);
            return newFrames;
        });
        toast({ title: "Merged Down" });
    };

    const setLayerOpacity = (index: number, opacity: number) => {
        setFrames(prev => {
            const newFrames = [...prev];
            const frame = { ...newFrames[activeFrameIndex] };
            const layers = [...frame.layers];
            layers[index] = { ...layers[index], opacity };
            frame.layers = layers;
            newFrames[activeFrameIndex] = frame;
            return newFrames;
        });
    };

    const toggleLayerVisibility = (index: number) => {
        setFrames(prev => {
            const newFrames = [...prev];
            const frame = { ...newFrames[activeFrameIndex] };
            const hidden = new Set(frame.hiddenLayers);
            if (hidden.has(index)) hidden.delete(index);
            else hidden.add(index);
            frame.hiddenLayers = hidden;
            newFrames[activeFrameIndex] = frame;
            return newFrames;
        });
    };

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

    const toolGroups: { name: string; tools: { id: Tool | 'flip-h' | 'flip-v' | 'rotate-cw'; icon: React.ReactNode; name: string }[] }[] = [
        {
            name: "Selection", tools: [
                { id: 'move', icon: <MousePointer />, name: 'Select' }, { id: 'lasso', icon: <Lasso />, name: 'Lasso Select' },
                { id: 'rectangle', icon: <div className="w-4 h-4 border-2 border-current" />, name: 'Rectangle Select' },
                { id: 'ellipse', icon: <div className="w-4 h-4 border-2 border-current rounded-full" />, name: 'Ellipse Select' },
                { id: 'magic-wand', icon: <Wand2 />, name: 'Magic Wand' },
            ]
        },
        {
            name: "Drawing", tools: [
                { id: 'pencil', icon: <Pencil />, name: 'Pencil' }, { id: 'eraser', icon: <Eraser />, name: 'Eraser' },
                { id: 'bucket', icon: <PaintBucket />, name: 'Fill Bucket' }, { id: 'line', icon: <LineTool />, name: 'Line Tool' },
                { id: 'dithering', icon: <div className="w-4 h-4 bg-[linear-gradient(45deg,currentColor_25%,transparent_25%,transparent_75%,currentColor_75%),linear-gradient(45deg,transparent_25%,currentColor_25%,currentColor_75%,transparent_75%)] bg-[size:4px_4px] bg-[position:0_0,2px_2px]" />, name: 'Dithering' },
                { id: 'color-replacement', icon: <Replace />, name: 'Color Replacer' }
            ]
        },
        {
            name: "Retouching", tools: [
                { id: 'dodge', icon: <Sun />, name: 'Dodge Tool' }, { id: 'burn', icon: <Moon />, name: 'Burn Tool' },
            ]
        },
        {
            name: "Transform", tools: [
                { id: 'flip-h', icon: <FlipHorizontal />, name: 'Flip Horizontal' },
                { id: 'flip-v', icon: <FlipVertical />, name: 'Flip Vertical' },
                { id: 'rotate-cw', icon: <RotateCw />, name: 'Rotate 90° CW' },
            ]
        }
    ];

    return (
        <div className="flex flex-col w-full h-[calc(100vh-60px)] bg-[#0A0A0A] text-foreground overflow-hidden font-sans select-none">
            {/* Mobile Not Supported Overlay */}
            <div className="md:hidden fixed inset-0 z-[100] bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 mb-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_30px_rgba(var(--primary),0.2)]">
                    <Monitor className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold mb-4 tracking-tight">Desktop Experience Required</h2>
                <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
                    The Pixel Art Editor uses a complex rendering engine and advanced toolsets that are fully optimized for larger screens and mouse controls. Please visit this page on your desktop or laptop.
                </p>
            </div>

            <TooltipProvider delayDuration={300}>
                {/* GLOBAL HEADER */}
                <header className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-white/5 bg-[#111111]">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center font-black text-xs">P</div>
                            <span className="font-bold tracking-wider text-sm">PIXEL STUDIO</span>
                        </div>
                        <div className="w-px h-6 bg-white/10" />
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10" onClick={() => setPixelSize(s => Math.max(s - 4, 4))}><ZoomOut className="h-4 w-4" /></Button>
                            <span className="text-xs font-semibold w-12 text-center text-muted-foreground">{Math.round((pixelSize / 20) * 100)}%</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10" onClick={() => setPixelSize(s => Math.min(s + 4, 40))}><ZoomIn className="h-4 w-4" /></Button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 border-white/10 bg-black hover:bg-white/5 text-xs"><FolderOpen className="w-3.5 h-3.5 mr-2" /> Project</Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-48 p-2 rounded-xl border-white/10 bg-[#151515] shadow-2xl space-y-1">
                                <Button variant="ghost" size="sm" className="w-full justify-start text-xs font-medium h-8 hover:bg-white/10" onClick={saveProject}><Save className="mr-2 h-3.5 w-3.5" /> Save Project</Button>
                                <label className="flex items-center cursor-pointer w-full text-xs font-medium h-8 px-2 py-1.5 hover:bg-white/10 rounded-md transition-colors">
                                    <FileUp className="mr-2 h-3.5 w-3.5" /> Load Project
                                    <input type="file" className="hidden" accept=".json" onChange={loadProject} />
                                </label>
                                <div className="h-px bg-white/10 my-1" />
                                <Button variant="ghost" size="sm" className="w-full justify-start text-xs font-medium h-8 hover:bg-white/10" onClick={() => downloadImage('png')}><FileDown className="mr-2 h-3.5 w-3.5" /> Export PNG</Button>
                                <Button variant="ghost" size="sm" className="w-full justify-start text-xs font-medium h-8 hover:bg-white/10" onClick={() => downloadImage('gif')}><FileDown className="mr-2 h-3.5 w-3.5" /> Export GIF</Button>
                            </PopoverContent>
                        </Popover>
                    </div>
                </header>

                <div className="flex flex-1 overflow-hidden">
                    {/* LEFT SIDEBAR: TOOLBAR */}
                    <aside className="w-14 shrink-0 flex flex-col items-center py-4 gap-2 border-r border-white/5 bg-[#111111] overflow-y-auto custom-scrollbar">
                        {toolGroups.map((group, i) => (
                            <React.Fragment key={group.name}>
                                {i !== 0 && <div className="w-8 h-px bg-white/5 my-1" />}
                                {group.tools.map(t => (
                                    <Tooltip key={t.id}>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant={tool === t.id ? 'default' : 'ghost'}
                                                size="icon"
                                                className={cn("h-10 w-10 box-border transition-all", tool === t.id ? "bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20" : "hover:bg-white/10 rounded-lg text-muted-foreground hover:text-foreground")}
                                                onClick={() => group.name === 'Transform' ? transformLayer(t.id as 'flip-h' | 'flip-v' | 'rotate-cw') : setTool(t.id as Tool)}
                                            >
                                                {t.icon}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="right"><p>{t.name}</p></TooltipContent>
                                    </Tooltip>
                                ))}
                            </React.Fragment>
                        ))}
                        <div className="w-8 h-px bg-white/5 my-2" />
                        <div className="flex flex-col gap-2 items-center">
                            <div className="relative group">
                                <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-8 h-8 bg-transparent border-0 p-0 rounded-full cursor-pointer overflow-hidden shadow-inner transition-transform active:scale-95" />
                                <div className="absolute inset-0 rounded-full ring-2 ring-primary/50 pointer-events-none group-hover:ring-primary transition-all"></div>
                            </div>
                            <div className="relative group -mt-4 ml-4">
                                <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="w-6 h-6 bg-transparent border-0 p-0 rounded-full cursor-pointer overflow-hidden shadow-inner transition-transform active:scale-95" />
                                <div className="absolute inset-0 rounded-full ring-2 ring-border pointer-events-none group-hover:ring-white/50 transition-all"></div>
                            </div>
                        </div>
                    </aside>

                    {/* CENTER: CANVAS & TIMELINE */}
                    <div className="flex-1 flex flex-col min-w-0 bg-[#0A0A0A]">
                        {/* MAIN CANVAS BASE */}
                        <div
                            className="flex-1 relative overflow-hidden bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:32px_32px]"
                            onContextMenu={(e) => e.preventDefault()}
                            onWheel={(e) => {
                                if (e.ctrlKey || e.metaKey) {
                                    e.preventDefault();
                                    setPixelSize(s => Math.min(Math.max(s + (e.deltaY < 0 ? 2 : -2), 4), 40));
                                }
                            }}
                        >
                            <div className="w-full h-full flex items-center justify-center overflow-hidden">
                                <div
                                    className={cn("relative transition-transform duration-75", isPanning ? 'cursor-grabbing' : 'cursor-crosshair', "shadow-[0_0_50px_rgba(0,0,0,0.5)]")}
                                    onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
                                    style={{
                                        transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
                                        width: gridSize * pixelSize,
                                        height: gridSize * pixelSize
                                    }}
                                >
                                    {/* The Grid Canvas Background */}
                                    <div className="absolute inset-0 bg-white pointer-events-none opacity-20" style={{ backgroundImage: 'conic-gradient(#333 25%, #444 25%, #444 50%, #333 50%, #333 75%, #444 75%, #444)', backgroundSize: '16px 16px' }}></div>
                                    <canvas ref={canvasRef} className="relative z-10 block" />
                                </div>
                            </div>
                        </div>

                        {/* BOTTOM TIMELINE */}
                        <div className="h-48 shrink-0 border-t border-white/5 bg-[#111111] flex flex-col">
                            <div className="px-4 py-2 flex items-center justify-between border-b border-white/5 bg-[#151515]">
                                <h4 className="text-xs font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-2"><Play className="w-3.5 h-3.5" /> Animation Timeline</h4>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="onion-skin" className="text-xs font-medium cursor-pointer text-muted-foreground mr-1">Onion Skin</Label>
                                        <div className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" id="onion-skin" className="sr-only peer" checked={showOnionSkin} onChange={e => setShowOnionSkin(e.target.checked)} />
                                            <div className="w-7 h-4 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
                                        </div>
                                    </div>
                                    <div className="w-px h-4 bg-white/10" />
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-muted-foreground w-8">{fps} FPS</span>
                                        <Slider min={1} max={24} step={1} value={[fps]} onValueChange={v => setFps(v[0])} className="w-24" />
                                    </div>
                                    <Button variant={isAnimating ? "default" : "secondary"} size="sm" className="h-7 border-white/10 ml-2" onClick={() => setIsAnimating(!isAnimating)}>{isAnimating ? <Pause className="h-3.5 w-3.5 mr-1" /> : <Play className="h-3.5 w-3.5 mr-1 ml-0.5" />} {isAnimating ? 'Pause' : 'Play'}</Button>
                                    <div className="ml-2 w-7 h-7 rounded border border-white/10 overflow-hidden bg-black/50">
                                        <canvas ref={previewCanvasRef} width={gridSize} height={gridSize} className="w-full h-full" style={{ imageRendering: 'pixelated' }} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 overflow-hidden relative">
                                <AnimationTimeline frames={frames.map(f => f.layers.map(l => l.data))} activeFrameIndex={activeFrameIndex} onSelectFrame={setActiveFrameIndex} onAddFrame={addFrame} onDuplicateFrame={duplicateFrame} onDeleteFrame={deleteFrame} gridSize={gridSize} />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDEBAR: PROPERTIES & LAYERS */}
                    <aside className="w-72 shrink-0 border-l border-white/5 bg-[#111111] flex flex-col">
                        {/* Settings / Tool Options */}
                        <div className="flex-1 border-b border-white/5 flex flex-col min-h-0">
                            <div className="px-4 py-3 border-b border-white/5 bg-[#151515]">
                                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Properties</h4>
                            </div>
                            <ScrollArea className="flex-1">
                                <div className="p-4 space-y-6">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center"><Label className="text-xs text-muted-foreground font-semibold">BRUSH SIZE</Label><span className="text-xs font-bold text-primary">{brushSize}px</span></div>
                                        <Slider min={1} max={10} step={1} value={[brushSize]} onValueChange={v => setBrushSize(v[0])} />
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-xs text-muted-foreground font-semibold">SYMMETRY</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {(['none', 'horizontal', 'vertical', 'both'] as const).map(sym => (
                                                <Button key={sym} size="sm" className={cn("rounded-lg h-8 transition-colors text-xs capitalize", symmetry === sym ? "bg-primary text-primary-foreground font-medium" : "bg-white/5 hover:bg-white/10 text-muted-foreground")} onClick={() => setSymmetry(sym)}>{sym}</Button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-6 border-t border-white/5">
                                        <Label className="text-xs text-muted-foreground font-semibold">GRID SIZE</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {GRID_SIZE_OPTIONS.map(size => (
                                                <Button key={size} size="sm" className={cn("rounded-lg h-8 transition-colors text-xs", gridSize === size ? "bg-primary text-primary-foreground font-medium" : "bg-black hover:bg-white/5 border border-white/10 text-muted-foreground")} onClick={() => handleGridSizeChange(size)}>{size} x {size}</Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Layers Panel */}
                        <div className="h-[40%] flex flex-col bg-[#111111]">
                            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-[#151515]">
                                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2"><Layers className="h-3.5 w-3.5" /> Layers</h4>
                                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-white/10 text-muted-foreground hover:text-foreground" onClick={addLayer}><Plus className="h-4 w-4" /></Button>
                            </div>
                            <ScrollArea className="flex-1 custom-scrollbar">
                                <div className="p-2 flex flex-col-reverse gap-1">
                                    {activeFrame?.layers.map((layer, index) => (
                                        <div key={index} className={cn("flex items-center gap-2 p-2 rounded-lg border transition-colors group cursor-pointer", activeLayerIndex === index ? "bg-primary/10 border-primary/30" : "bg-transparent border-transparent hover:bg-white/5")} onClick={() => setActiveLayerIndex(index)}>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 rounded-md hover:bg-white/10" onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(index); }}>
                                                {activeFrame.hiddenLayers.has(index) ? <EyeOff className="h-3.5 w-3.5 text-muted-foreground" /> : <Eye className="h-3.5 w-3.5" />}
                                            </Button>
                                            <div className="flex-1 text-xs truncate font-medium select-none text-foreground/80">{layer.name}</div>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-opacity" onClick={(e) => { e.stopPropagation(); deleteLayer(index); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </aside>
                </div>
            </TooltipProvider>
        </div>
    );
};
export default PixelEditor;

