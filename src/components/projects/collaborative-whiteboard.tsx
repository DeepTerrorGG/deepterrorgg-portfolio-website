
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
  ArrowRight,
  StickyNote,
  MousePointer2,
  Monitor
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
  type: 'rectangle' | 'circle' | 'line' | 'arrow' | 'sticky';
  width: number;
  height: number;
  fillColor: string | null;
  gradient: Gradient | null;
  text?: string;
  fontSize?: number;
};

type TextObject = BaseObject & {
  type: 'text';
  text: string;
  fontSize: number;
  width: number;
};

type WhiteboardObject = PathObject | ShapeObject | TextObject;
type Tool = 'select' | 'pencil' | 'eraser' | 'rectangle' | 'circle' | 'text' | 'hand' | 'zoom' | 'line' | 'arrow' | 'sticky' | 'bucket' | 'picker';
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

    // Draw dot grid
    const gridSize = 40;
    const dotRadius = 1.5;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    const startX = -viewTransform.x / viewTransform.scale;
    const endX = startX + canvas.width / viewTransform.scale;
    const startY = -viewTransform.y / viewTransform.scale;
    const endY = startY + canvas.height / viewTransform.scale;

    for (let x = Math.floor(startX / gridSize) * gridSize; x <= endX; x += gridSize) {
      for (let y = Math.floor(startY / gridSize) * gridSize; y <= endY; y += gridSize) {
        ctx.beginPath();
        ctx.arc(x, y, dotRadius / viewTransform.scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const sortedObjects = [...(objects || [])].sort((a, b) => a.zIndex - b.zIndex);
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

          if (shape.fillColor || shape.gradient) {
            if (shape.type === 'rectangle') ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
            else {
              ctx.beginPath();
              ctx.ellipse(shape.x + shape.width / 2, shape.y + shape.height / 2, Math.abs(shape.width / 2), Math.abs(shape.height / 2), 0, 0, 2 * Math.PI);
              ctx.fill();
            }
          }
          if (shape.type === 'rectangle') ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
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
        case 'arrow':
          ctx.beginPath();
          ctx.moveTo(obj.x, obj.y);
          ctx.lineTo(obj.x + obj.width, obj.y + obj.height);
          ctx.stroke();

          const angle = Math.atan2(obj.height, obj.width);
          const headlen = 15;
          const tox = obj.x + obj.width;
          const toy = obj.y + obj.height;
          ctx.beginPath();
          ctx.moveTo(tox, toy);
          ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
          ctx.moveTo(tox, toy);
          ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
          ctx.stroke();
          break;
        case 'sticky': {
          const shape = obj as ShapeObject;
          ctx.fillStyle = shape.fillColor || '#fef08a';
          ctx.shadowColor = 'rgba(0,0,0,0.2)';
          ctx.shadowBlur = 10;
          ctx.shadowOffsetY = 4;
          ctx.fillRect(shape.x, shape.y, shape.width, shape.height);

          if (shape.text && (action !== 'editing-text' || selectedObject?.id !== obj.id)) {
            ctx.shadowColor = 'transparent';
            ctx.font = `${shape.fontSize || 16}px sans-serif`;
            ctx.fillStyle = '#1f2937';
            ctx.textBaseline = 'top';
            ctx.fillText(shape.text, shape.x + 10, shape.y + 10);
          }
          break;
        }
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

    // Adjust for canvas rendering size vs display size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const canvasX = (clientX - rect.left) * scaleX;
    const canvasY = (clientY - rect.top) * scaleY;

    // Adjust for pan and zoom
    const x = (canvasX - viewTransform.x) / viewTransform.scale;
    const y = (canvasY - viewTransform.y) / viewTransform.scale;

    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (action === 'editing-text' || !firestore || !objectsQuery) return;
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
      const newDocId = doc(collection(firestore, 'whiteboard-objects')).id;
      const commonProps = { id: newDocId, x: pos.x, y: pos.y, color: tool === 'eraser' ? '#000000' : color, strokeWidth: tool === 'eraser' ? strokeWidth * 4 : strokeWidth, rotation: 0, zIndex, hasShadow: false };
      if (tool === 'pencil' || tool === 'eraser') setDrawingObject({ ...commonProps, type: 'path', points: [pos] });
      if (['rectangle', 'circle', 'line', 'arrow'].includes(tool)) setDrawingObject({ ...commonProps, type: tool as ShapeObject['type'], width: 0, height: 0, fillColor: null, gradient: null });
      if (tool === 'sticky') {
        const newSticky: ShapeObject = { ...commonProps, type: 'sticky', width: 150, height: 150, fillColor: '#fef08a', text: 'Note', fontSize: 16, gradient: null };
        setDocumentNonBlocking(doc(firestore, 'whiteboard-objects', newDocId), { ...newSticky, createdAt: serverTimestamp() }, { merge: true });
        setAction('editing-text');
        setSelectedObject(newSticky);
        setIsInteracting(false);
      }
      if (tool === 'text') {
        const newTextObject: TextObject = { ...commonProps, type: 'text', text: 'Text', fontSize: 24, width: 50 };
        setDocumentNonBlocking(doc(firestore, 'whiteboard-objects', newDocId), { ...newTextObject, createdAt: serverTimestamp() }, { merge: true });
        setAction('editing-text');
        setSelectedObject(newTextObject);
        setIsInteracting(false);
      }
      if (tool === 'picker') {
        const clicked = findClickedObject(pos);
        if (clicked) setColor(clicked.color);
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

    if (action === 'drawing' && drawingObject) {
      if (drawingObject.type === 'path') setDrawingObject({ ...drawingObject, points: [...drawingObject.points, pos] });
      if (['rectangle', 'circle', 'line', 'arrow'].includes(drawingObject.type)) setDrawingObject({ ...drawingObject, width: pos.x - drawingObject.x, height: pos.y - drawingObject.y } as ShapeObject);
    } else if (action === 'moving' && selectedObject) {
      const dx = pos.x - startPos.x;
      const dy = pos.y - startPos.y;
      if (Math.abs(dx) > 0 || Math.abs(dy) > 0) setSelectedObject(moveObject(selectedObject, dx, dy));
    } else if (action === 'resizing' && selectedObject && resizeHandle) {
      setSelectedObject(resizeObject(selectedObject as ShapeObject, pos, resizeHandle));
    } else if (action === 'rotating' && selectedObject) {
      const bounds = getObjectBounds(selectedObject);
      if (!bounds) return;
      const centerX = bounds.x + bounds.width / 2;
      const centerY = bounds.y + bounds.height / 2;
      const angle = Math.atan2(pos.y - centerY, pos.x - centerX) * 180 / Math.PI + 90;
      setSelectedObject({ ...selectedObject, rotation: angle });
    }
  };

  const handleMouseUp = () => {
    if (action === 'editing-text') return;
    if (isInteracting && objectsQuery && firestore) {
      if (action === 'drawing' && drawingObject && tool !== 'text') {
        setDocumentNonBlocking(doc(firestore, 'whiteboard-objects', drawingObject.id), { ...drawingObject, createdAt: serverTimestamp() }, { merge: true });
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

  const setZoom = (newScale: number) => setViewTransform(v => ({ ...v, scale: Math.min(Math.max(0.1, newScale), 10) }));

  const handleDoubleClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (!objectsQuery || !firestore || action === 'editing-text') return;
    const pos = getCanvasCoordinates(e);
    const clickedObj = findClickedObject(pos);

    if (clickedObj && (clickedObj.type === 'text' || clickedObj.type === 'sticky')) {
      setSelectedObject(clickedObj);
      setAction('editing-text');
    }
  };

  // --- OBJECT MANIPULATION ---
  const findClickedObject = (pos: Point): WhiteboardObject | null => {
    const sorted = [...(objects || [])].sort((a, b) => b.zIndex - a.zIndex);
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
      case 'rectangle': case 'circle': case 'line': case 'arrow': case 'sticky': return { x: Math.min(obj.x, obj.x + obj.width), y: Math.min(obj.y, obj.y + obj.height), width: Math.abs(obj.width), height: Math.abs(obj.height) };
      case 'text': return { x: obj.x, y: obj.y, width: obj.width, height: obj.fontSize };
    }
  }

  const moveObject = (obj: WhiteboardObject, dx: number, dy: number): WhiteboardObject => {
    const newObj = { ...obj, x: obj.x + dx, y: obj.y + dy };
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
    n: { x: bounds.x + bounds.width / 2, y: bounds.y }, s: { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height },
    w: { x: bounds.x, y: bounds.y + bounds.height / 2 }, e: { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 },
  });

  const getHandleAtPosition = (pos: Point): string | null => {
    if (!selectedObject) return null;
    const bounds = getObjectBounds(selectedObject);
    if (!bounds) return null;
    const handles = getResizeHandles(bounds);
    for (const [key, handlePos] of Object.entries(handles)) {
      if (Math.hypot(pos.x - handlePos.x, pos.y - handlePos.y) < 10) return key;
    }
    if (Math.hypot(pos.x - (bounds.x + bounds.width / 2), pos.y - (bounds.y - 20 / viewTransform.scale)) < 10 / viewTransform.scale) return 'rotate';
    return null;
  }

  const changeZIndex = (direction: 'up' | 'down') => {
    if (!selectedObject) return;
    const newZIndex = selectedObject.zIndex + (direction === 'up' ? 1 : -1);
    const updatedObj = { ...selectedObject, zIndex: newZIndex };
    setSelectedObject(updatedObj);
    updateDocumentNonBlocking(doc(firestore, 'whiteboard-objects', selectedObject.id), { zIndex: newZIndex });
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
      if (document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement) return;
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
        if (e.key === 'ArrowUp') movedObj = moveObject(movedObj, 0, -nudgeAmount);
        if (e.key === 'ArrowDown') movedObj = moveObject(movedObj, 0, nudgeAmount);
        if (e.key === 'ArrowLeft') movedObj = moveObject(movedObj, -nudgeAmount, 0);
        if (e.key === 'ArrowRight') movedObj = moveObject(movedObj, nudgeAmount, 0);
        if (movedObj !== selectedObject) {
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
    objects.forEach(obj => { if (obj.id) batch.delete(doc(firestore, 'whiteboard-objects', obj.id)); });
    await batch.commit();
    toast({ title: "Canvas Cleared" });
  };

  const drawingTools: { id: Tool; icon: React.ReactNode, name: string }[] = [
    { id: 'pencil', icon: <Pencil />, name: 'Pencil' },
    { id: 'eraser', icon: <Eraser />, name: 'Eraser' },
    { id: 'line', icon: <LineIcon />, name: 'Line' },
    { id: 'rectangle', icon: <Square />, name: 'Rectangle' },
    { id: 'circle', icon: <Circle />, name: 'Circle' },
    { id: 'text', icon: <Type />, name: 'Text' },
  ];

  const utilityTools: { id: Tool; icon: React.ReactNode, name: string }[] = [
    { id: 'bucket', icon: <PaintBucket />, name: 'Fill Bucket' },
    { id: 'picker', icon: <Pipette />, name: 'Color Picker' },
  ]

  const updateSelectedObject = (props: Partial<WhiteboardObject>) => {
    if (!selectedObject) return;
    const updatedObj = { ...selectedObject, ...props } as WhiteboardObject;
    setSelectedObject(updatedObj);
    updateDocumentNonBlocking(doc(firestore, 'whiteboard-objects', selectedObject.id), props);
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (selectedObject?.type === 'text' || selectedObject?.type === 'sticky') {
      const updatedObj = { ...selectedObject, text: e.target.value } as WhiteboardObject;
      setSelectedObject(updatedObj);
    }
  }

  const handleTextBlur = () => {
    if (selectedObject?.type === 'text' || selectedObject?.type === 'sticky') {
      updateDocumentNonBlocking(doc(firestore, 'whiteboard-objects', selectedObject.id), { text: (selectedObject as TextObject | ShapeObject).text });
    }
    setAction(null);
  }

  // Generate the UI
  return (
    <div className="flex flex-col w-full h-[calc(100vh-60px)] bg-[#0A0A0A] text-foreground overflow-hidden font-sans select-none">
      {/* Mobile Not Supported Overlay */}
      <div className="md:hidden fixed inset-0 z-[100] bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 mb-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_30px_rgba(var(--primary),0.2)]">
          <Monitor className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold mb-4 tracking-tight">Desktop Experience Required</h2>
        <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
          The Real-Time Collaborative Whiteboard uses a complex canvas rendering engine and advanced toolsets that are fully optimized for larger screens and mouse controls. Please visit this page on your desktop or laptop.
        </p>
      </div>

      <TooltipProvider delayDuration={300}>

        {/* GLOBAL HEADER */}
        <header className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-white/5 bg-[#111111] z-20 relative">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center font-black text-xs">W</div>
              <span className="font-bold tracking-wider text-sm">WHITEBOARD</span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10" onClick={() => setViewTransform(prev => ({ ...prev, scale: Math.max(0.1, prev.scale - 0.1) }))}><ZoomOut className="h-4 w-4" /></Button>
              <span className="text-xs font-semibold w-12 text-center text-muted-foreground">{Math.round(viewTransform.scale * 100)}%</span>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10" onClick={() => setViewTransform(prev => ({ ...prev, scale: Math.min(3, prev.scale + 0.1) }))}><ZoomIn className="h-4 w-4" /></Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {isLoadingObjects && <Loader2 className="h-4 w-4 text-primary animate-spin" />}
              <span className="text-xs font-semibold text-muted-foreground">{isLoadingObjects ? 'Syncing...' : 'Synced'}</span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <Button variant="outline" size="sm" className="h-8 border-red-500/20 hover:border-red-500/50 hover:bg-red-500/10 text-red-400 bg-transparent text-xs" onClick={clearCanvas}>
              <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Clear Canvas
            </Button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden relative">
          {/* LEFT SIDEBAR: TOOLBAR */}
          <aside className="w-14 shrink-0 flex flex-col items-center py-4 gap-2 border-r border-white/5 bg-[#111111] z-20">
            <Tooltip>
              <TooltipTrigger asChild><Button variant={tool === 'hand' ? 'default' : 'ghost'} size="icon" className={cn("h-10 w-10 box-border transition-all", tool === 'hand' ? "bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20" : "hover:bg-white/10 rounded-lg text-muted-foreground hover:text-foreground")} onClick={() => setTool('hand')}><Hand className="h-4 w-4" /></Button></TooltipTrigger>
              <TooltipContent side="right"><p>Pan Board</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild><Button variant={tool === 'select' ? 'default' : 'ghost'} size="icon" className={cn("h-10 w-10 box-border transition-all", tool === 'select' ? "bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20" : "hover:bg-white/10 rounded-lg text-muted-foreground hover:text-foreground")} onClick={() => setTool('select')}><MousePointer2 className="h-4 w-4" /></Button></TooltipTrigger>
              <TooltipContent side="right"><p>Select</p></TooltipContent>
            </Tooltip>

            <div className="w-8 h-px bg-white/5 my-1" />

            {[
              { id: 'pencil', icon: <Pencil className="h-4 w-4" />, name: 'Pencil' },
              { id: 'eraser', icon: <Eraser className="h-4 w-4" />, name: 'Eraser' },
              { id: 'rectangle', icon: <Square className="h-4 w-4" />, name: 'Rectangle' },
              { id: 'circle', icon: <Circle className="h-4 w-4" />, name: 'Circle' },
              { id: 'arrow', icon: <ArrowRight className="h-4 w-4" />, name: 'Arrow' },
              { id: 'line', icon: <LineIcon className="h-4 w-4" />, name: 'Line' },
              { id: 'text', icon: <Type className="h-4 w-4" />, name: 'Text' },
              { id: 'sticky', icon: <StickyNote className="h-4 w-4" />, name: 'Sticky Note' }
            ].map(t => (
              <Tooltip key={t.id}>
                <TooltipTrigger asChild>
                  <Button variant={tool === t.id ? 'default' : 'ghost'} size="icon" className={cn("h-10 w-10 box-border transition-all", tool === t.id ? "bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20" : "hover:bg-white/10 rounded-lg text-muted-foreground hover:text-foreground")} onClick={() => setTool(t.id as Tool)}>{t.icon}</Button>
                </TooltipTrigger>
                <TooltipContent side="right"><p>{t.name}</p></TooltipContent>
              </Tooltip>
            ))}
          </aside>

          {/* CENTER: CANVAS */}
          <div className="flex-1 min-w-0 bg-[#0A0A0A] relative z-0 overflow-hidden">
            <div
              className="absolute inset-0 bg-neutral-900 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:20px_20px]"
              onContextMenu={(e) => e.preventDefault()}
              style={{ backgroundPosition: `${viewTransform.x}px ${viewTransform.y}px`, backgroundSize: `${20 * viewTransform.scale}px ${20 * viewTransform.scale}px` }}
            >
              <canvas
                ref={canvasRef}
                width={7680}
                height={4320}
                className={cn("absolute top-1/2 left-1/2 -ml-[3840px] -mt-[2160px] touch-none", tool === 'hand' ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair')}
                style={{ transform: `scale(${viewTransform.scale}) translate(${viewTransform.x / viewTransform.scale}px, ${viewTransform.y / viewTransform.scale}px)` }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                onDoubleClick={handleDoubleClick}
              />
              {/* Text Editor Overlay */}
              {action === 'editing-text' && selectedObject && (selectedObject.type === 'text' || selectedObject.type === 'sticky') && (
                <textarea
                  ref={textInputRef}
                  value={selectedObject.type === 'sticky' ? (selectedObject as ShapeObject).text : (selectedObject as TextObject).text}
                  onChange={handleTextChange}
                  onBlur={handleTextBlur}
                  style={{
                    position: 'absolute',
                    left: `${(selectedObject.x * viewTransform.scale) + viewTransform.x + (selectedObject.type === 'sticky' ? 10 * viewTransform.scale : 0)}px`,
                    top: `${(selectedObject.y * viewTransform.scale) + viewTransform.y + (selectedObject.type === 'sticky' ? 10 * viewTransform.scale : 0)}px`,
                    width: selectedObject.type === 'sticky' ? `${(selectedObject as ShapeObject).width * viewTransform.scale - 20 * viewTransform.scale}px` : undefined,
                    height: selectedObject.type === 'sticky' ? `${(selectedObject as ShapeObject).height * viewTransform.scale - 20 * viewTransform.scale}px` : undefined,
                    fontSize: `${(selectedObject.type === 'sticky' ? ((selectedObject as ShapeObject).fontSize || 16) : (selectedObject as TextObject).fontSize) * viewTransform.scale}px`,
                    lineHeight: 1.2,
                    transform: `rotate(${selectedObject.rotation}deg)`,
                    transformOrigin: 'top left',
                    background: selectedObject.type === 'sticky' ? 'transparent' : 'rgba(255,255,255,0.05)',
                    border: selectedObject.type === 'sticky' ? 'none' : '1px dashed #3b82f6',
                    color: selectedObject.type === 'sticky' ? '#1f2937' : selectedObject.color,
                    outline: 'none',
                    resize: 'none',
                    overflow: 'hidden',
                    textAlign: selectedObject.type === 'sticky' ? 'center' : 'left'
                  }}
                  className="z-30 p-2 font-sans rounded-md shadow-2xl"
                  autoFocus
                />
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR: PROPERTIES */}
          <aside className="w-72 shrink-0 border-l border-white/5 bg-[#111111] flex flex-col z-20 overflow-y-auto custom-scrollbar">
            <div className="px-4 py-3 border-b border-white/5 bg-[#151515] sticky top-0 z-10 flex items-center justify-between">
              <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Properties</h4>
              {selectedObject && (
                <div className="flex bg-white/5 rounded-md p-0.5 border border-white/5">
                  <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground" onClick={handleDuplicate}><Copy className="h-3 w-3" /></Button></TooltipTrigger><TooltipContent side="bottom" className="text-xs">Duplicate</TooltipContent></Tooltip>
                  <div className="w-px h-6 bg-white/10 mx-0.5" />
                  <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground" onClick={() => changeZIndex('up')}><BringToFront className="h-3 w-3" /></Button></TooltipTrigger><TooltipContent side="bottom" className="text-xs">Bring Forward</TooltipContent></Tooltip>
                  <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground" onClick={() => changeZIndex('down')}><SendToBack className="h-3 w-3" /></Button></TooltipTrigger><TooltipContent side="bottom" className="text-xs">Send Backward</TooltipContent></Tooltip>
                  <div className="w-px h-6 bg-white/10 mx-0.5" />
                  <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6 rounded hover:bg-red-500/20 text-red-500 hover:text-red-400 transition-colors" onClick={() => { if (selectedObject) deleteDocumentNonBlocking(doc(firestore, 'whiteboard-objects', selectedObject.id)); setSelectedObject(null); }}><Trash className="h-3 w-3" /></Button></TooltipTrigger><TooltipContent side="bottom" className="text-xs text-red-400">Delete</TooltipContent></Tooltip>
                </div>
              )}
            </div>

            <div className="p-4 space-y-6 flex-1">
              {!selectedObject && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50 py-12">
                  <MousePointer2 className="h-8 w-8 mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Select an object or<br />choose a tool to see properties.</p>
                </div>
              )}

              {/* Properties for Selected Tool or Object */}
              {selectedObject && (
                <>
                  {selectedObject?.type !== 'sticky' && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center"><Label className="text-xs text-muted-foreground font-semibold">STROKE COLOR</Label><span className="text-xs font-mono bg-black px-1.5 py-0.5 rounded text-muted-foreground border border-white/5">{selectedObject?.color}</span></div>
                      <div className="flex flex-wrap gap-2">
                        {['#F97316', '#EF4444', '#F43F5E', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#FFFFFF', '#09090B'].map(c => (
                          <div key={c} className="relative group cursor-pointer" onClick={() => updateSelectedObject({ color: c })}>
                            <div className={cn("w-6 h-6 rounded border", selectedObject?.color === c ? "border-primary scale-110 shadow-md ring-2 ring-primary/20" : "border-border/50 group-hover:scale-110 transition-transform")} style={{ backgroundColor: c }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(selectedObject?.type === 'rectangle' || selectedObject?.type === 'circle' || selectedObject?.type === 'sticky') && (
                    <div className="space-y-3 pt-4 border-t border-white/5">
                      <div className="flex justify-between items-center"><Label className="text-xs text-muted-foreground font-semibold">FILL COLOR</Label><span className="text-xs font-mono bg-black px-1.5 py-0.5 rounded text-muted-foreground border border-white/5">{(selectedObject as ShapeObject)?.fillColor || 'None'}</span></div>
                      <div className="flex flex-wrap gap-2">
                        {['transparent', '#FDFD96', '#FFD1DC', '#B5EAD7', '#C7CEEA', '#FFFFFF', '#09090B'].map(fillColor => (
                          <div key={fillColor} className="relative group cursor-pointer" onClick={() => updateSelectedObject({ fillColor })}>
                            <div className={cn("w-6 h-6 rounded border flex items-center justify-center relative", (selectedObject as ShapeObject)?.fillColor === fillColor ? "border-primary scale-110 shadow-md ring-2 ring-primary/20" : "border-border/50 group-hover:scale-110 transition-transform")} style={{ backgroundColor: fillColor === 'transparent' ? 'transparent' : fillColor }}>
                              {fillColor === 'transparent' && <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiAvPgo8cmVjdCB3aWR0aD0iMiIgaGVpZ2h0PSIyIiBmaWxsPSIjY2NjIiAvPgo8cmVjdCB4PSIyIiB5PSIyIiB3aWR0aD0iMiIgaGVpZ2h0PSIyIiBmaWxsPSIjY2NjIiAvPgo8L3N2Zz4=')] opacity-50 mix-blend-overlay rounded-sm"></div>}
                              {fillColor === 'transparent' && <div className="absolute w-6 h-px bg-red-500/80 rotate-45" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedObject.type !== 'sticky' && selectedObject.type !== 'text' && (
                    <div className="space-y-3 pt-4 border-t border-white/5">
                      <div className="flex justify-between items-center"><Label className="text-xs text-muted-foreground font-semibold">STROKE WIDTH</Label><span className="text-xs font-bold text-primary">{selectedObject.strokeWidth}px</span></div>
                      <Slider min={1} max={50} step={1} value={[selectedObject.strokeWidth]} onValueChange={v => updateSelectedObject({ strokeWidth: v[0] })} />
                    </div>
                  )}

                  {(selectedObject.type === 'text' || selectedObject.type === 'sticky') && (
                    <>
                      <div className="space-y-3 pt-4 border-t border-white/5">
                        <div className="flex justify-between items-center"><Label className="text-xs text-muted-foreground font-semibold">TEXT CONTENT</Label></div>
                        <Input value={(selectedObject as TextObject | ShapeObject).text} onChange={(e) => updateSelectedObject({ text: e.target.value })} className="bg-black/50 border-white/10" />
                      </div>
                      <div className="space-y-3 pt-4 border-t border-white/5">
                        <div className="flex justify-between items-center"><Label className="text-xs text-muted-foreground font-semibold">FONT SIZE</Label><span className="text-xs font-bold text-primary">{(selectedObject as TextObject | ShapeObject).fontSize || 24}px</span></div>
                        <Slider min={12} max={120} step={4} value={[(selectedObject as TextObject | ShapeObject).fontSize || 24]} onValueChange={v => updateSelectedObject({ fontSize: v[0] })} />
                      </div>
                    </>
                  )}

                  <div className="pt-4 border-t border-white/5">
                    <label className="flex items-center gap-3 cursor-pointer p-2 -ml-2 rounded-lg hover:bg-white/5 transition-colors group">
                      <div className="relative inline-flex items-center">
                        <input type="checkbox" className="sr-only peer" checked={selectedObject?.hasShadow || false} onChange={e => updateSelectedObject({ hasShadow: e.target.checked })} />
                        <div className="w-7 h-4 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground flex items-center gap-2"><Droplet className="w-3.5 h-3.5" /> Drop Shadow</span>
                    </label>
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      </TooltipProvider>
    </div>
  );
};
export default CollaborativeWhiteboard;
