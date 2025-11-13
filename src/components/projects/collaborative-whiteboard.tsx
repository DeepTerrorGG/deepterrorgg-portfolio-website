
'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
  Minus as LineIcon,
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
  BringToFront,
  SendToBack,
  ZoomIn,
  ZoomOut,
  Hand,
  Square,
  Circle,
  Type,
  Loader2,
  Droplet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from '../ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { useAuth, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, writeBatch, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { setDocumentNonBlocking, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

// --- TYPE DEFINITIONS ---
type Point = { x: number; y: number };

type Gradient = {
  startColor: string;
  endColor: string;
};

type BaseObject = {
  id: string;
  x: number;
  y: number;
  color: string;
  strokeWidth: number;
  rotation: number;
  zIndex: number;
  hasShadow: boolean;
};

type PathObject = BaseObject & {
  type: 'path';
  points: Point[];
};

type ShapeObject = BaseObject & {
  type: 'rectangle' | 'circle' | 'line';
  width: number;
  height: number;
  fillColor: string | null;
  gradient: Gradient | null;
};

type TextObject = BaseObject & {
  type: 'text';
  text: string;
  fontSize: number;
  width: number;
};

type WhiteboardObject = PathObject | ShapeObject | TextObject;
type Tool = 'select' | 'pencil' | 'eraser' | 'rectangle' | 'circle' | 'text' | 'hand' | 'zoom' | 'line' | 'bucket' | 'picker';
type Action = 'drawing' | 'moving' | 'resizing' | 'rotating' | 'panning' | 'editing-text' | null;

const CollaborativeWhiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const [tool, setTool] = useState<Tool>('pencil');
  const [color, setColor] = useState('#FFFFFF');
  const [strokeWidth, setStrokeWidth] = useState(4);
  
  const [isInteracting, setIsInteracting] = useState(false);
  const [drawingObject, setDrawingObject] = useState<WhiteboardObject | null>(null);
  const [selectedObject, setSelectedObject] = useState<WhiteboardObject | null>(null);
  const [action, setAction] = useState<Action>(null);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  
  const [viewTransform, setViewTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [startPan, setStartPan] = useState<Point | null>(null);
  const [clipboard, setClipboard] = useState<WhiteboardObject | null>(null);

  const objectsQuery = useMemoFirebase(() => collection(firestore, 'whiteboard-objects'), [firestore]);
  const { data: objects, isLoading: isLoadingObjects } = useCollection<WhiteboardObject>(objectsQuery);
  
  // --- DRAWING LOGIC ---
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(viewTransform.x, viewTransform.y);
    ctx.scale(viewTransform.scale, viewTransform.scale);
    
    const sortedObjects = [...(objects || [])].sort((a,b) => a.zIndex - b.zIndex);
    const allObjects = [...sortedObjects, ...(drawingObject && tool !== 'select' ? [drawingObject] : [])];

    allObjects.forEach(obj => {
      ctx.save();
      
      if (obj.hasShadow) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10 * viewTransform.scale;
        ctx.shadowOffsetX = 5 * viewTransform.scale;
        ctx.shadowOffsetY = 5 * viewTransform.scale;
      }
      
      const bounds = getObjectBounds(obj);
      if (bounds) {
        const centerX = bounds.x + bounds.width / 2;
        const centerY = bounds.y + bounds.height / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate(obj.rotation * Math.PI / 180);
        ctx.translate(-centerX, -centerY);
      }
      
      ctx.strokeStyle = obj.color;
      ctx.lineWidth = obj.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      switch (obj.type) {
        case 'path':
          if (obj.points.length < 2) return;
          ctx.beginPath();
          ctx.moveTo(obj.points[0].x, obj.points[0].y);
          for (let i = 1; i < obj.points.length; i++) ctx.lineTo(obj.points[i].x, obj.points[i].y);
          ctx.stroke();
          break;
        case 'rectangle':
        case 'circle':
          const shape = obj as ShapeObject;
          if (shape.gradient) {
            const gradient = ctx.createLinearGradient(shape.x, shape.y, shape.x + shape.width, shape.y + shape.height);
            gradient.addColorStop(0, shape.gradient.startColor);
            gradient.addColorStop(1, shape.gradient.endColor);
            ctx.fillStyle = gradient;
          } else if (shape.fillColor) {
            ctx.fillStyle = shape.fillColor;
          }

          if(shape.fillColor || shape.gradient) {
             if(shape.type === 'rectangle') ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
             else {
                ctx.beginPath();
                ctx.ellipse(shape.x + shape.width / 2, shape.y + shape.height / 2, Math.abs(shape.width / 2), Math.abs(shape.height / 2), 0, 0, 2 * Math.PI);
                ctx.fill();
             }
          }
           if(shape.type === 'rectangle') ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
           else {
             ctx.beginPath();
             ctx.ellipse(shape.x + shape.width / 2, shape.y + shape.height / 2, Math.abs(shape.width / 2), Math.abs(shape.height / 2), 0, 0, 2 * Math.PI);
             ctx.stroke();
           }
          break;
        case 'line':
            ctx.beginPath();
            ctx.moveTo(obj.x, obj.y);
            ctx.lineTo(obj.x + obj.width, obj.y + obj.height);
            ctx.stroke();
            break;
        case 'text':
             if (action !== 'editing-text' || selectedObject?.id !== obj.id) {
                ctx.font = `${obj.fontSize * viewTransform.scale}px sans-serif`;
                ctx.fillStyle = obj.color;
                ctx.textBaseline = 'top';
                ctx.fillText(obj.text, obj.x, obj.y);
            }
            break;
      }
      ctx.restore();
    });

    if (selectedObject && action !== 'editing-text') drawSelectionHandles(selectedObject, ctx);
    ctx.restore();
  }, [objects, drawingObject, tool, selectedObject, viewTransform, action]);
  
  const drawSelectionHandles = (obj: WhiteboardObject, ctx: CanvasRenderingContext2D) => {
    const bounds = getObjectBounds(obj);
    if (!bounds) return;

    ctx.save();
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate(obj.rotation * Math.PI / 180);
    ctx.translate(-centerX, -centerY);
    
    ctx.strokeStyle = 'rgba(0, 128, 255, 0.8)';
    ctx.lineWidth = 1 / viewTransform.scale;
    ctx.setLineDash([5 / viewTransform.scale, 5 / viewTransform.scale]);
    ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    ctx.setLineDash([]);
    
    const handles = getResizeHandles(bounds);
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#00f';
    Object.values(handles).forEach(handle => {
        ctx.beginPath();
        ctx.arc(handle.x, handle.y, 5 / viewTransform.scale, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    });

    ctx.beginPath();
    ctx.moveTo(centerX, bounds.y - (20 / viewTransform.scale));
    ctx.lineTo(centerX, bounds.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(centerX, bounds.y - (20 / viewTransform.scale), 6 / viewTransform.scale, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  useEffect(() => { redrawCanvas(); }, [redrawCanvas]);

  // --- MOUSE/TOUCH & NAVIGATION HANDLERS ---
  const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent): Point => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const x = (clientX - rect.left - viewTransform.x) / viewTransform.scale;
      const y = (clientY - rect.top - viewTransform.y) / viewTransform.scale;
      return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (action === 'editing-text') return;
    const pos = getCanvasCoordinates(e);
    setIsInteracting(true);
    
    if (tool === 'hand') {
        setAction('panning');
        setStartPan({ x: ('clientX' in e ? e.clientX : e.touches[0].clientX) - viewTransform.x, y: ('clientY' in e ? e.clientY : e.touches[0].clientY) - viewTransform.y });
        return;
    }
    
    if (tool === 'select') {
        const handle = getHandleAtPosition(pos);
        if (handle && selectedObject) {
            setAction(handle.startsWith('rotate') ? 'rotating' : 'resizing');
            setResizeHandle(handle);
            return;
        }

        const clickedObject = findClickedObject(pos);
        if (clickedObject && 'detail' in e && e.detail === 2 && clickedObject.type === 'text') { // Double click
            setAction('editing-text');
            setSelectedObject(clickedObject);
        } else {
            setSelectedObject(clickedObject);
            if (clickedObject) {
                setAction('moving');
            } else {
                setAction(null);
            }
        }
    } else {
        setAction('drawing');
        setSelectedObject(null);
        const zIndex = (objects?.length || 0) + 1;
        const commonProps = { id: `temp-${Date.now()}`, x: pos.x, y: pos.y, color: tool === 'eraser' ? '#000000' : color, strokeWidth: tool === 'eraser' ? strokeWidth * 4 : strokeWidth, rotation: 0, zIndex, hasShadow: false };
        if (tool === 'pencil' || tool === 'eraser') setDrawingObject({ ...commonProps, type: 'path', points: [pos] });
        if (tool === 'rectangle' || tool === 'circle' || tool === 'line') setDrawingObject({ ...commonProps, type: tool, width: 0, height: 0, fillColor: null, gradient: null });
        if (tool === 'text') {
            const newTextObject: TextObject = { ...commonProps, type: 'text', text: 'Text', fontSize: 24, width: 50 };
            addDocumentNonBlocking(objectsQuery, { ...newTextObject, createdAt: serverTimestamp() });
            setAction('editing-text');
            setSelectedObject(newTextObject);
            setIsInteracting(false);
        }
        if (tool === 'picker') {
            const clicked = findClickedObject(pos);
            if(clicked) setColor(clicked.color);
            setIsInteracting(false); // picker is a single click action
        }
        if (tool === 'bucket') {
            const clicked = findClickedObject(pos);
            if (clicked && (clicked.type === 'rectangle' || clicked.type === 'circle')) {
                updateDocumentNonBlocking(doc(firestore, 'whiteboard-objects', clicked.id), { fillColor: color, gradient: null });
            }
            setIsInteracting(false);
        }
    }
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isInteracting || action === 'editing-text') return;
    const pos = getCanvasCoordinates(e);

    if (action === 'panning' && startPan) {
      const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX;
      const clientY = 'clientY' in e ? e.clientY : e.touches[0].clientY;
      setViewTransform(v => ({ ...v, x: clientX - startPan.x, y: clientY - startPan.y }));
      return;
    }

    if (!selectedObject && !drawingObject) return;
    const startPos = drawingObject || selectedObject;
    if (!startPos) return;

    if (action === 'drawing') {
        if(drawingObject?.type === 'path') setDrawingObject({ ...drawingObject, points: [...drawingObject.points, pos] });
        if(['rectangle', 'circle', 'line'].includes(drawingObject?.type || '')) setDrawingObject({ ...drawingObject, width: pos.x - drawingObject.x, height: pos.y - drawingObject.y });
    } else if (action === 'moving' && selectedObject) {
        const dx = pos.x - startPos.x;
        const dy = pos.y - startPos.y;
        if(Math.abs(dx)>0 || Math.abs(dy)>0) setSelectedObject(moveObject(selectedObject, dx, dy));
    } else if (action === 'resizing' && selectedObject && resizeHandle) {
        setSelectedObject(resizeObject(selectedObject as ShapeObject, pos, resizeHandle));
    } else if (action === 'rotating' && selectedObject) {
        const bounds = getObjectBounds(selectedObject);
        if(!bounds) return;
        const centerX = bounds.x + bounds.width / 2;
        const centerY = bounds.y + bounds.height / 2;
        const angle = Math.atan2(pos.y - centerY, pos.x - centerX) * 180 / Math.PI + 90;
        setSelectedObject({...selectedObject, rotation: angle });
    }
  };

  const handleMouseUp = () => {
    if (action === 'editing-text') return;
    if (isInteracting && objectsQuery) {
        if (action === 'drawing' && drawingObject && tool !== 'text') {
            const { id, ...objData } = drawingObject;
            addDocumentNonBlocking(objectsQuery, { ...objData, createdAt: serverTimestamp() });
        } else if (selectedObject && (action === 'moving' || action === 'resizing' || action === 'rotating')) {
            updateDocumentNonBlocking(doc(firestore, 'whiteboard-objects', selectedObject.id), selectedObject);
        }
    }
    setIsInteracting(false);
    setAction(null);
    setDrawingObject(null);
    setResizeHandle(null);
    setStartPan(null);
  };
  
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const scaleAmount = -e.deltaY * 0.001;
        const newScale = viewTransform.scale * (1 + scaleAmount);
        const clampedScale = Math.min(Math.max(0.1, newScale), 10);
        
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const newX = mouseX - (mouseX - viewTransform.x) * (clampedScale / viewTransform.scale);
        const newY = mouseY - (mouseY - viewTransform.y) * (clampedScale / viewTransform.scale);
        
        setViewTransform({ scale: clampedScale, x: newX, y: newY });
    }
  };

  const setZoom = (newScale: number) => setViewTransform(v => ({...v, scale: Math.min(Math.max(0.1, newScale), 10) }));
  
  // --- OBJECT MANIPULATION ---
  const findClickedObject = (pos: Point): WhiteboardObject | null => {
    const sorted = [...(objects || [])].sort((a,b) => b.zIndex - a.zIndex);
    for (let obj of sorted) {
        const bounds = getObjectBounds(obj);
        if (bounds) {
            const centerX = bounds.x + bounds.width / 2;
            const centerY = bounds.y + bounds.height / 2;
            const translatedX = pos.x - centerX;
            const translatedY = pos.y - centerY;
            const angle = -obj.rotation * Math.PI / 180;
            const rotatedX = translatedX * Math.cos(angle) - translatedY * Math.sin(angle);
            const rotatedY = translatedX * Math.sin(angle) + translatedY * Math.cos(angle);
            
            if (rotatedX >= -bounds.width / 2 && rotatedX <= bounds.width / 2 && rotatedY >= -bounds.height / 2 && rotatedY <= bounds.height / 2) {
                return obj;
            }
        }
    }
    return null;
  }
  
  const getObjectBounds = (obj: WhiteboardObject): { x: number; y: number; width: number; height: number } | null => {
      switch (obj.type) {
          case 'path':
              if (obj.points.length === 0) return null;
              const minX = Math.min(...obj.points.map(p => p.x)); const minY = Math.min(...obj.points.map(p => p.y));
              return { x: minX, y: minY, width: Math.max(...obj.points.map(p => p.x)) - minX, height: Math.max(...obj.points.map(p => p.y)) - minY };
          case 'rectangle': case 'circle': case 'line': return { x: Math.min(obj.x, obj.x + obj.width), y: Math.min(obj.y, obj.y + obj.height), width: Math.abs(obj.width), height: Math.abs(obj.height) };
          case 'text': return { x: obj.x, y: obj.y, width: obj.width, height: obj.fontSize };
      }
  }

  const moveObject = (obj: WhiteboardObject, dx: number, dy: number): WhiteboardObject => {
      const newObj = {...obj, x: obj.x + dx, y: obj.y + dy };
      if (newObj.type === 'path') newObj.points = newObj.points.map(p => ({ x: p.x + dx, y: p.y + dy }));
      return newObj;
  }
  
  const resizeObject = (obj: ShapeObject, pos: Point, handle: string): ShapeObject => {
      let { x, y, width, height } = obj;
      if (handle.includes('e')) width = pos.x - x;
      if (handle.includes('w')) { width += x - pos.x; x = pos.x; }
      if (handle.includes('s')) height = pos.y - y;
      if (handle.includes('n')) { height += y - pos.y; y = pos.y; }
      return { ...obj, x, y, width, height };
  }
  
  const getResizeHandles = (bounds: { x: number, y: number, width: number, height: number }): Record<string, Point> => ({
      nw: { x: bounds.x, y: bounds.y }, ne: { x: bounds.x + bounds.width, y: bounds.y },
      sw: { x: bounds.x, y: bounds.y + bounds.height }, se: { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
      n: {x: bounds.x + bounds.width/2, y: bounds.y}, s: {x: bounds.x + bounds.width/2, y: bounds.y+bounds.height},
      w: {x: bounds.x, y: bounds.y + bounds.height/2}, e: {x: bounds.x + bounds.width, y: bounds.y+bounds.height/2},
  });

  const getHandleAtPosition = (pos: Point): string | null => {
      if (!selectedObject) return null;
      const bounds = getObjectBounds(selectedObject);
      if (!bounds) return null;
      const handles = getResizeHandles(bounds);
      for (const [key, handlePos] of Object.entries(handles)) {
          if (Math.hypot(pos.x - handlePos.x, pos.y - handlePos.y) < 10) return key;
      }
      if(Math.hypot(pos.x - (bounds.x + bounds.width/2), pos.y - (bounds.y-20/viewTransform.scale)) < 10/viewTransform.scale) return 'rotate';
      return null;
  }
  
  const changeZIndex = (direction: 'up' | 'down') => {
      if(!selectedObject) return;
      const newZIndex = selectedObject.zIndex + (direction === 'up' ? 1 : -1);
      const updatedObj = {...selectedObject, zIndex: newZIndex};
      setSelectedObject(updatedObj);
      updateDocumentNonBlocking(doc(firestore, 'whiteboard-objects', selectedObject.id), {zIndex: newZIndex});
  }

  const handleDuplicate = () => {
    if (!selectedObject) return;
    const { id, ...rest } = selectedObject;
    const newObject = { ...rest, x: selectedObject.x + 20, y: selectedObject.y + 20, zIndex: (objects?.length || 0) + 1 };
    addDocumentNonBlocking(objectsQuery, { ...newObject, createdAt: serverTimestamp() });
    toast({ title: "Object Duplicated" });
  };
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'c' && selectedObject) { setClipboard(selectedObject); toast({ title: "Copied" }); }
            if (e.key === 'v' && clipboard) {
                const { id, ...rest } = clipboard;
                const newObject = { ...rest, x: clipboard.x + 20, y: clipboard.y + 20, zIndex: (objects?.length || 0) + 1 };
                addDocumentNonBlocking(objectsQuery, { ...newObject, createdAt: serverTimestamp() });
            }
            if (e.key === 'd' && selectedObject) { e.preventDefault(); handleDuplicate(); }
        }
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedObject && action !== 'editing-text') {
            deleteDocumentNonBlocking(doc(firestore, 'whiteboard-objects', selectedObject.id));
            setSelectedObject(null);
        }
        if (selectedObject && action !== 'editing-text') {
            const nudgeAmount = e.shiftKey ? 10 : 1;
            let movedObj = selectedObject;
            if(e.key === 'ArrowUp') movedObj = moveObject(movedObj, 0, -nudgeAmount);
            if(e.key === 'ArrowDown') movedObj = moveObject(movedObj, 0, nudgeAmount);
            if(e.key === 'ArrowLeft') movedObj = moveObject(movedObj, -nudgeAmount, 0);
            if(e.key === 'ArrowRight') movedObj = moveObject(movedObj, nudgeAmount, 0);
            if(movedObj !== selectedObject){
                setSelectedObject(movedObj);
                updateDocumentNonBlocking(doc(firestore, 'whiteboard-objects', movedObj.id), movedObj);
            }
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObject, action, clipboard, objects, objectsQuery, firestore, toast, handleDuplicate]);

  const clearCanvas = async () => {
    if (!objects || objects.length === 0 || !firestore) return;
    const batch = writeBatch(firestore);
    objects.forEach(obj => { if(obj.id) batch.delete(doc(firestore, 'whiteboard-objects', obj.id)); });
    await batch.commit();
    toast({ title: "Canvas Cleared" });
  };
  
  const drawingTools: { id: Tool; icon: React.ReactNode, name: string }[] = [
      { id: 'pencil', icon: <Pencil/>, name: 'Pencil' },
      { id: 'eraser', icon: <Eraser/>, name: 'Eraser' },
      { id: 'line', icon: <LineIcon/>, name: 'Line' },
      { id: 'rectangle', icon: <Square/>, name: 'Rectangle' },
      { id: 'circle', icon: <Circle/>, name: 'Circle' },
      { id: 'text', icon: <Type/>, name: 'Text' },
  ];
  
  const utilityTools: { id: Tool; icon: React.ReactNode, name: string }[] = [
      { id: 'bucket', icon: <PaintBucket/>, name: 'Fill Bucket' },
      { id: 'picker', icon: <Pipette/>, name: 'Color Picker' },
  ]
  
  const updateSelectedObject = (props: Partial<WhiteboardObject>) => {
      if(!selectedObject) return;
      const updatedObj = { ...selectedObject, ...props };
      setSelectedObject(updatedObj);
      updateDocumentNonBlocking(doc(firestore, 'whiteboard-objects', selectedObject.id), props);
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if(selectedObject?.type === 'text') {
        const updatedObj = {...selectedObject, text: e.target.value};
        setSelectedObject(updatedObj);
      }
  }

  const handleTextBlur = () => {
      if(selectedObject?.type === 'text') {
          updateDocumentNonBlocking(doc(firestore, 'whiteboard-objects', selectedObject.id), { text: selectedObject.text });
      }
      setAction(null);
  }
  
  return (
    <div className="flex flex-col w-full h-full bg-black text-white" tabIndex={0}>
      <TooltipProvider>
      <CardHeader className="flex-row items-center justify-between border-b border-border bg-card p-2 gap-2">
        <CardTitle className="text-base whitespace-nowrap">Whiteboard</CardTitle>
        <div className="flex items-center gap-1">
            <Popover>
                <PopoverTrigger asChild><Button variant={tool === 'select' || tool === 'hand' ? 'secondary' : 'ghost'} size="icon"><MousePointer/></Button></PopoverTrigger>
                <PopoverContent className="w-auto p-1"><div className="flex gap-1">
                    <Tooltip><TooltipTrigger asChild><Button variant={tool === 'select' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('select')}><MousePointer/></Button></TooltipTrigger><TooltipContent><p>Select</p></TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild><Button variant={tool === 'hand' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('hand')}><Hand/></Button></TooltipTrigger><TooltipContent><p>Pan</p></TooltipContent></Tooltip>
                </div></PopoverContent>
            </Popover>
            <Popover>
                <PopoverTrigger asChild><Button variant={drawingTools.some(t => t.id === tool) ? 'secondary' : 'ghost'} size="icon"><Pencil/></Button></PopoverTrigger>
                <PopoverContent className="w-auto p-1"><div className="flex gap-1">{drawingTools.map(t => <Tooltip key={t.id}><TooltipTrigger asChild><Button variant={tool === t.id ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool(t.id)}>{t.icon}</Button></TooltipTrigger><TooltipContent><p>{t.name}</p></TooltipContent></Tooltip>)}</div></PopoverContent>
            </Popover>
             <Popover>
                <PopoverTrigger asChild><Button variant={utilityTools.some(t => t.id === tool) ? 'secondary' : 'ghost'} size="icon"><Wand2/></Button></PopoverTrigger>
                <PopoverContent className="w-auto p-1"><div className="flex gap-1">{utilityTools.map(t => <Tooltip key={t.id}><TooltipTrigger asChild><Button variant={tool === t.id ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool(t.id)}>{t.icon}</Button></TooltipTrigger><TooltipContent><p>{t.name}</p></TooltipContent></Tooltip>)}</div></PopoverContent>
            </Popover>
        </div>
         <div className="flex items-center gap-2">
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => setZoom(viewTransform.scale * 1.2)}><ZoomIn/></Button></TooltipTrigger><TooltipContent><p>Zoom In</p></TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => setZoom(viewTransform.scale / 1.2)}><ZoomOut/></Button></TooltipTrigger><TooltipContent><p>Zoom Out</p></TooltipContent></Tooltip>
             <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => setViewTransform({scale: 1, x:0, y:0})}><p className="text-xs font-bold">100%</p></Button></TooltipTrigger><TooltipContent><p>Reset Zoom</p></TooltipContent></Tooltip>
        </div>
        <div className="flex-grow"></div>
        <div className="flex items-center gap-2">
            {selectedObject && <>
                <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={handleDuplicate}><Copy/></Button></TooltipTrigger><TooltipContent><p>Duplicate (Ctrl+D)</p></TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => changeZIndex('up')}><BringToFront/></Button></TooltipTrigger><TooltipContent><p>Bring Forward</p></TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => changeZIndex('down')}><SendToBack/></Button></TooltipTrigger><TooltipContent><p>Send Backward</p></TooltipContent></Tooltip>
            </>}
            <Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon" onClick={clearCanvas}><Trash2/></Button></TooltipTrigger><TooltipContent><p>Clear Canvas</p></TooltipContent></Tooltip>
        </div>
      </CardHeader>
      </TooltipProvider>
      
      <div className="flex-grow flex">
        <div className="w-64 border-r p-2 space-y-4 overflow-y-auto">
            <h4 className="font-bold text-center text-sm">Properties</h4>
            <div><Label>Stroke Color</Label><Input type="color" value={selectedObject?.color || color} onChange={e => selectedObject ? updateSelectedObject({color: e.target.value}) : setColor(e.target.value)} className="w-full"/></div>
            <div><Label>Stroke Width</Label><Slider min={1} max={50} step={1} value={[selectedObject?.strokeWidth || strokeWidth]} onValueChange={val => selectedObject ? updateSelectedObject({strokeWidth: val[0]}) : setStrokeWidth(val[0])} /></div>
            
            {selectedObject && (selectedObject.type === 'rectangle' || selectedObject.type === 'circle') && (
                <>
                <div><Label>Fill Color</Label><Input type="color" value={(selectedObject as ShapeObject).fillColor || '#000000'} onChange={e => updateSelectedObject({fillColor: e.target.value, gradient: null})} /></div>
                <div className="space-y-2 border-t pt-2"><Label>Gradient Fill</Label>
                    <div className="flex gap-2"><Label htmlFor="grad-start" className="text-xs">Start</Label><Input id="grad-start" type="color" value={(selectedObject as ShapeObject).gradient?.startColor || '#ffffff'} onChange={e => updateSelectedObject({gradient: {...((selectedObject as ShapeObject).gradient || {startColor: '#ffffff', endColor: '#000000'}), startColor: e.target.value}, fillColor: null})} /></div>
                    <div className="flex gap-2"><Label htmlFor="grad-end" className="text-xs">End</Label><Input id="grad-end" type="color" value={(selectedObject as ShapeObject).gradient?.endColor || '#000000'} onChange={e => updateSelectedObject({gradient: {...((selectedObject as ShapeObject).gradient || {startColor: '#ffffff', endColor: '#000000'}), endColor: e.target.value}, fillColor: null})} /></div>
                </div>
                </>
            )}
             {selectedObject && selectedObject.type === 'text' && (
                <div><Label>Font Size</Label><Slider min={8} max={128} step={1} value={[(selectedObject as TextObject).fontSize]} onValueChange={v => updateSelectedObject({fontSize: v[0]})} /></div>
            )}
            <div>
              <Label className="flex items-center gap-2"><Droplet className="h-4 w-4"/> Shadow</Label>
              <input type="checkbox" checked={selectedObject?.hasShadow || false} onChange={e => updateSelectedObject({hasShadow: e.target.checked})} className="mt-2" disabled={!selectedObject}/>
            </div>
        </div>
        <CardContent className="flex-grow p-0 relative">
            {isLoadingObjects && <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
            <canvas ref={canvasRef} width={1920} height={1080} className="w-full h-full" style={{cursor: tool === 'hand' ? 'grab' : 'crosshair'}} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onWheel={handleWheel} />
             {action === 'editing-text' && selectedObject && selectedObject.type === 'text' && (
                <textarea
                    ref={textInputRef}
                    value={selectedObject.text}
                    onChange={handleTextChange}
                    onBlur={handleTextBlur}
                    style={{
                        position: 'absolute',
                        left: `${(selectedObject.x * viewTransform.scale) + viewTransform.x}px`,
                        top: `${(selectedObject.y * viewTransform.scale) + viewTransform.y}px`,
                        width: `${selectedObject.width * viewTransform.scale}px`,
                        fontSize: `${selectedObject.fontSize * viewTransform.scale}px`,
                        lineHeight: 1.2,
                        transform: `rotate(${selectedObject.rotation}deg)`,
                        transformOrigin: 'top left',
                        background: 'rgba(255,255,255,0.1)', border: '1px dashed #00f', color: selectedObject.color,
                    }}
                    className="z-30 p-0 font-sans"
                    autoFocus
                />
            )}
        </CardContent>
      </div>
      
      <CardFooter className="border-t border-border bg-card p-2 flex items-center justify-center text-xs text-muted-foreground">
        <p>Zoom: {Math.round(viewTransform.scale * 100)}% | Ctrl+Scroll to zoom | Ctrl+C/V/D to Copy/Paste/Duplicate</p>
      </CardFooter>
    </div>
  );
};

export default CollaborativeWhiteboard;

    