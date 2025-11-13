'use client';
import type { LayerData } from '../pixel-editor';

export type SelectionMask = boolean[][] | null;

export interface Selection {
  x: number; y: number;
  width: number; height: number;
  mask: SelectionMask;
}

export function createSelectionMask(layer: LayerData, p1: {x: number, y: number}, tool: 'rectangle' | 'ellipse' | 'lasso' | 'magic-wand', p2?: {x: number, y: number}): SelectionMask {
    const size = layer.length;
    const mask: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false));

    if (tool === 'rectangle' && p2) {
        const x0 = Math.min(p1.x, p2.x), x1 = Math.max(p1.x, p2.x);
        const y0 = Math.min(p1.y, p2.y), y1 = Math.max(p1.y, p2.y);
        for(let y=y0; y<=y1; y++) for(let x=x0; x<=x1; x++) mask[y][x] = true;
    } else if (tool === 'ellipse' && p2) {
        const x0 = Math.min(p1.x, p2.x), x1 = Math.max(p1.x, p2.x);
        const y0 = Math.min(p1.y, p2.y), y1 = Math.max(p1.y, p2.y);
        const rx = (x1-x0)/2, ry = (y1-y0)/2; const cx = x0+rx, cy = y0+ry;
        for(let y=y0; y<=y1; y++) for(let x=x0; x<=x1; x++) if (((x-cx)/rx)**2+((y-cy)/ry)**2 <= 1) mask[y][x] = true;
    } else if (tool === 'magic-wand') {
        const targetColor = layer[p1.y][p1.x];
        const queue = [[p1.x, p1.y]];
        const visited = new Set<string>();
        visited.add(`${p1.x},${p1.y}`);
        
        while(queue.length > 0) {
            const [x, y] = queue.shift()!;
            mask[y][x] = true;
            
            [[x+1,y],[x-1,y],[x,y+1],[x,y-1]].forEach(([nx, ny]) => {
                const key = `${nx},${ny}`;
                if(nx>=0 && nx<size && ny>=0 && ny<size && !visited.has(key) && layer[ny][nx] === targetColor) {
                    visited.add(key);
                    queue.push([nx, ny]);
                }
            });
        }
    }
    return mask;
}


export function getSelectionBounds(mask: SelectionMask): { minX: number; minY: number; maxX: number; maxY: number } | null {
  if (!mask) return null;
  let minX = mask[0].length, minY = mask.length, maxX = -1, maxY = -1;
  let hasSelection = false;
  for (let y = 0; y < mask.length; y++) {
    for (let x = 0; x < mask[y].length; x++) {
      if (mask[y][x]) {
        hasSelection = true;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  return hasSelection ? { minX, minY, maxX, maxY } : null;
}

export function getOutline(mask: SelectionMask): {x:number, y:number}[] {
    if (!mask) return [];
    const outline = new Set<string>();
    const size = mask.length;
    for(let y=0; y<size; y++) {
        for(let x=0; x<size; x++) {
            if(mask[y][x]) {
                if(x===0 || !mask[y][x-1]) outline.add(`${x},${y}`);
                if(x===size-1 || !mask[y][x+1]) outline.add(`${x},${y}`);
                if(y===0 || !mask[y-1][x]) outline.add(`${x},${y}`);
                if(y===size-1 || !mask[y+1][x]) outline.add(`${x},${y}`);
            }
        }
    }
    return Array.from(outline).map(s => {
        const [x,y] = s.split(',').map(Number);
        return {x, y};
    });
}

export function applyDithering(layer: LayerData, mask: SelectionMask, color1: string, color2: string) {
    const newLayer = layer.map(r => [...r]);
    for(let y=0; y<layer.length; y++) {
        for(let x=0; x<layer.length; x++) {
            if(mask && mask[y][x]) {
                newLayer[y][x] = (x+y)%2 === 0 ? color1 : color2;
            }
        }
    }
    return newLayer;
}
