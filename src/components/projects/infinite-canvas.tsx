'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Hand, Type, Eraser } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const CELL_SIZE = 20;

type CellData = {
  char: string;
  color: string;
};

const backgroundChars = '`.,*;"-~_';

const InfiniteCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cells, setCells] = useState<Map<string, CellData>>(new Map());
  
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [editingCell, setEditingCell] = useState<{ x: number, y: number } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [currentColor, setCurrentColor] = useState('#FFFFFF');
  const [tool, setTool] = useState<'type' | 'eraser' | 'hand'>('type');
  
  const { toast } = useToast();

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(viewport.x, viewport.y);
    ctx.scale(viewport.zoom, viewport.zoom);

    const scaledCellSize = CELL_SIZE;
    
    // Calculate visible cell range
    const viewLeft = -viewport.x / viewport.zoom;
    const viewTop = -viewport.y / viewport.zoom;
    const viewRight = (canvas.width - viewport.x) / viewport.zoom;
    const viewBottom = (canvas.height - viewport.y) / viewport.zoom;

    const startCol = Math.floor(viewLeft / scaledCellSize) - 1;
    const endCol = Math.ceil(viewRight / scaledCellSize) + 1;
    const startRow = Math.floor(viewTop / scaledCellSize) - 1;
    const endRow = Math.ceil(viewBottom / scaledCellSize) + 1;

    // Draw background ASCII
    ctx.font = `${scaledCellSize * 0.7}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'hsl(var(--muted-foreground) / 0.1)';
     for (let y = startRow; y <= endRow; y++) {
      for (let x = startCol; x <= endCol; x++) {
        const key = `${x},${y}`;
        if (!cells.has(key)) {
            const hash = (x * 31 + y * 17) % backgroundChars.length;
            const char = backgroundChars[Math.abs(hash)];
             ctx.fillText(char, x * scaledCellSize + scaledCellSize / 2, y * scaledCellSize + scaledCellSize / 2);
        }
      }
    }


    // Draw grid lines for visible area
    ctx.strokeStyle = 'hsl(var(--border) / 0.2)';
    ctx.lineWidth = 1 / viewport.zoom;
    for (let col = startCol; col <= endCol; col++) {
      ctx.beginPath();
      ctx.moveTo(col * scaledCellSize, startRow * scaledCellSize);
      ctx.lineTo(col * scaledCellSize, endRow * scaledCellSize);
      ctx.stroke();
    }
    for (let row = startRow; row <= endRow; row++) {
      ctx.beginPath();
      ctx.moveTo(startCol * scaledCellSize, row * scaledCellSize);
      ctx.lineTo(endCol * scaledCellSize, row * scaledCellSize);
      ctx.stroke();
    }

    // Draw cells
    ctx.font = `${scaledCellSize * 0.8}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    for (let y = startRow; y <= endRow; y++) {
      for (let x = startCol; x <= endCol; x++) {
        const key = `${x},${y}`;
        if (cells.has(key)) {
          const cell = cells.get(key)!;
          ctx.fillStyle = cell.color;
          ctx.fillText(cell.char, x * scaledCellSize + scaledCellSize / 2, y * scaledCellSize + scaledCellSize / 2);
        }
      }
    }
    
    ctx.restore();
  }, [cells, viewport]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resizeObserver = new ResizeObserver(() => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        draw();
    });
    resizeObserver.observe(canvas);
    
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    draw();

    return () => resizeObserver.disconnect();
  }, [draw]);
  
  const getCoordsFromEvent = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const canvasX = (clientX - rect.left - viewport.x) / viewport.zoom;
    const canvasY = (clientY - rect.top - viewport.y) / viewport.zoom;
    const col = Math.floor(canvasX / CELL_SIZE);
    const row = Math.floor(canvasY / CELL_SIZE);
    return { col, row };
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || tool === 'hand') { // Middle mouse button or Hand tool
      setIsPanning(true);
      setPanStart({ x: e.clientX - viewport.x, y: e.clientY - viewport.y });
    } else if (e.button === 0) {
      const { col, row } = getCoordsFromEvent(e);
      if (tool === 'eraser') {
        const key = `${col},${row}`;
        if (cells.has(key)) {
            const newCells = new Map(cells);
            newCells.delete(key);
            setCells(newCells);
        }
      } else { // Typing tool
        setEditingCell({ x: col, y: row });
        setEditValue(cells.get(`${col},${row}`)?.char || '');
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setViewport(v => ({ ...v, x: e.clientX - panStart.x, y: e.clientY - panStart.y }));
      draw();
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scaleFactor = 1.1;
    const newZoom = e.deltaY < 0 ? viewport.zoom * scaleFactor : viewport.zoom / scaleFactor;
    const clampedZoom = Math.max(0.1, Math.min(newZoom, 10));

    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newX = mouseX - (mouseX - viewport.x) * (clampedZoom / viewport.zoom);
    const newY = mouseY - (mouseY - viewport.y) * (clampedZoom / viewport.zoom);

    setViewport({ zoom: clampedZoom, x: newX, y: newY });
  };

  const handleZoom = (direction: 'in' | 'out') => {
    const scaleFactor = 1.2;
    const newZoom = direction === 'in' ? viewport.zoom * scaleFactor : viewport.zoom / scaleFactor;
    const clampedZoom = Math.max(0.1, Math.min(newZoom, 10));
    
    const canvas = canvasRef.current!;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const newX = centerX - (centerX - viewport.x) * (clampedZoom / viewport.zoom);
    const newY = centerY - (centerY - viewport.y) * (clampedZoom / viewport.zoom);

    setViewport({ zoom: clampedZoom, x: newX, y: newY });
  }
  
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEditValue(value);

    if (editingCell) {
        const key = `${editingCell.x},${editingCell.y}`;
        const newCells = new Map(cells);
        if (value === '') {
            newCells.delete(key);
        } else {
            newCells.set(key, { char: value.slice(-1), color: currentColor });
        }
        setCells(newCells);
    }
    
    if (value) {
        setEditingCell(null);
    }
  };

  const handleEditBlur = () => {
    setEditingCell(null);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4">
      <Card className="w-full h-full mx-auto shadow-2xl flex flex-col">
        <CardHeader className="flex-row items-center justify-between p-3 border-b">
          <CardTitle>Infinite ASCII Canvas</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant={tool==='hand' ? 'secondary' : 'outline'} size="icon" onClick={() => setTool('hand')}><Hand /></Button>
            <Button variant={tool==='type' ? 'secondary' : 'outline'} size="icon" onClick={() => setTool('type')}><Type /></Button>
            <Button variant={tool==='eraser' ? 'secondary' : 'outline'} size="icon" onClick={() => setTool('eraser')}><Eraser /></Button>
            <input type="color" value={currentColor} onChange={e => setCurrentColor(e.target.value)} className="w-8 h-8 p-1 bg-transparent border rounded-md cursor-pointer"/>
            <Button variant="outline" size="icon" onClick={() => handleZoom('in')}><ZoomIn /></Button>
            <Button variant="outline" size="icon" onClick={() => handleZoom('out')}><ZoomOut /></Button>
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-0 relative bg-muted/30 overflow-hidden">
          <canvas
            ref={canvasRef}
            className={cn("w-full h-full", isPanning ? "cursor-grabbing" : tool === 'hand' ? "cursor-grab" : "cursor-crosshair")}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          />
          {editingCell && (
             <input
                type="text"
                value={editValue}
                onChange={handleEditChange}
                onBlur={handleEditBlur}
                autoFocus
                maxLength={1}
                className="absolute w-8 h-8 text-center bg-transparent border-0 outline-none text-2xl font-mono p-0"
                style={{
                  left: `${editingCell.x * CELL_SIZE * viewport.zoom + viewport.x}px`,
                  top: `${editingCell.y * CELL_SIZE * viewport.zoom + viewport.y}px`,
                  width: `${CELL_SIZE * viewport.zoom}px`,
                  height: `${CELL_SIZE * viewport.zoom}px`,
                  fontSize: `${CELL_SIZE * 0.8 * viewport.zoom}px`,
                  color: currentColor,
                }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
export default InfiniteCanvas;
