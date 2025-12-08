
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Hand, Type, Eraser } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const CELL_SIZE = 20;
const backgroundChars = '`.,*;"-~_';

type CellData = {
  char: string;
  color: string;
};

const InfiniteCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null); // Ref for the main container
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
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas resolution to match its container size
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear and fill background
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Apply pan and zoom
    ctx.save();
    ctx.translate(viewport.x, viewport.y);
    ctx.scale(viewport.zoom, viewport.zoom);

    const scaledCellSize = CELL_SIZE;
    
    const viewLeft = -viewport.x / viewport.zoom;
    const viewTop = -viewport.y / viewport.zoom;
    const viewRight = (canvas.width - viewport.x) / viewport.zoom;
    const viewBottom = (canvas.height - viewport.y) / viewport.zoom;

    const startCol = Math.floor(viewLeft / scaledCellSize);
    const endCol = Math.ceil(viewRight / scaledCellSize);
    const startRow = Math.floor(viewTop / scaledCellSize);
    const endRow = Math.ceil(viewBottom / scaledCellSize);

    // Draw background characters
    ctx.font = `${scaledCellSize * 0.7}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let y = startRow; y < endRow; y++) {
      for (let x = startCol; x < endCol; x++) {
        const key = `${x},${y}`;
        if (!cells.has(key)) {
            const hash = (x * 31 + y * 17) % backgroundChars.length;
            const char = backgroundChars[Math.abs(hash)];
            ctx.fillText(char, x * scaledCellSize + scaledCellSize / 2, y * scaledCellSize + scaledCellSize / 2);
        }
      }
    }

    // Draw user-placed cells
    ctx.font = `${scaledCellSize * 0.8}px monospace`;
    cells.forEach((cell, key) => {
        const [x, y] = key.split(',').map(Number);
        if (x >= startCol && x < endCol && y >= startRow && y < endRow) {
            ctx.fillStyle = cell.color;
            ctx.fillText(cell.char, x * scaledCellSize + scaledCellSize / 2, y * scaledCellSize + scaledCellSize / 2);
        }
    });
    
    ctx.restore();
  }, [cells, viewport]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => draw());
    resizeObserver.observe(container);
    
    draw();

    return () => resizeObserver.disconnect();
  }, [draw]);
  
  const getCoordsFromEvent = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const canvasX = clientX - rect.left;
    const canvasY = clientY - rect.top;
    const worldX = (canvasX - viewport.x) / viewport.zoom;
    const worldY = (canvasY - viewport.y) / viewport.zoom;
    const col = Math.floor(worldX / CELL_SIZE);
    const row = Math.floor(worldY / CELL_SIZE);
    return { col, row };
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || tool === 'hand') {
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
      } else if (tool === 'type') {
        setEditingCell({ x: col, y: row });
        setEditValue(cells.get(`${col},${row}`)?.char || '');
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setViewport(v => ({ ...v, x: e.clientX - panStart.x, y: e.clientY - panStart.y }));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scaleFactor = 1.1;
    const newZoom = e.deltaY < 0 ? viewport.zoom * scaleFactor : viewport.zoom / scaleFactor;
    const clampedZoom = Math.max(0.1, Math.min(10, newZoom));

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
    const clampedZoom = Math.max(0.1, Math.min(10, newZoom));
    
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
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Space' && !editingCell) {
            e.preventDefault();
            setTool('hand');
        }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
        if (e.code === 'Space' && tool === 'hand') {
            setTool('type');
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, [editingCell, tool]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full h-full relative overflow-hidden",
        isPanning ? "cursor-grabbing" : tool === 'hand' ? "cursor-grab" : "cursor-crosshair"
      )}
      onMouseDown={handleMouseDown} 
      onMouseMove={handleMouseMove} 
      onMouseUp={handleMouseUp} 
      onMouseLeave={handleMouseUp} 
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      
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

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center h-12 px-2 bg-background/80 backdrop-blur-md border border-border rounded-lg shadow-2xl">
          <h2 className="text-lg font-semibold whitespace-nowrap px-4 text-foreground hidden sm:block">Infinite ASCII Canvas</h2>
          <div className="w-px h-6 bg-border mx-2 hidden sm:block"></div>
          <div className="flex items-center gap-1">
              <Button variant={tool === 'hand' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('hand')}><Hand className="h-5 w-5" /></Button>
              <Button variant={tool === 'type' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('type')}><Type className="h-5 w-5" /></Button>
              <Button variant={tool === 'eraser' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTool('eraser')}><Eraser className="h-5 w-5" /></Button>
          </div>
           <div className="w-px h-6 bg-border mx-2"></div>
           <div className="relative w-8 h-8">
              <div className="w-full h-full border-2 border-border rounded-md" style={{backgroundColor: currentColor}}/>
              <input type="color" value={currentColor} onChange={e => setCurrentColor(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
          </div>
          <div className="w-px h-6 bg-border mx-2"></div>
          <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => handleZoom('in')}><ZoomIn className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" onClick={() => handleZoom('out')}><ZoomOut className="h-5 w-5" /></Button>
          </div>
      </div>
    </div>
  );
};

export default InfiniteCanvas;

    