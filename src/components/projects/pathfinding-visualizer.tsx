
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RefreshCw, Flag, FlagTriangleRight, Rat, Waves } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';

const GRID_WIDTH = 45;
const GRID_HEIGHT = 21;

const START_NODE_ROW = 10;
const START_NODE_COL = 5;
const FINISH_NODE_ROW = 10;
const FINISH_NODE_COL = 39;

type Node = {
  col: number;
  row: number;
  isStart: boolean;
  isFinish: boolean;
  distance: number;
  isVisited: boolean;
  isWall: boolean;
  previousNode: Node | null;
  // A* specific properties
  gScore: number; // cost from start to current node
  fScore: number; // total cost (gScore + heuristic)
  hScore: number; // heuristic cost (from current to end)
};

type Grid = Node[][];
type Algorithm = 'dijkstra' | 'astar';

const PathfindingVisualizer: React.FC = () => {
  const [grid, setGrid] = useState<Grid>([]);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [speed, setSpeed] = useState(10);
  const [mouseIsPressed, setMouseIsPressed] = useState(false);
  const [algorithm, setAlgorithm] = useState<Algorithm>('astar');
  
  const isVisualizingRef = useRef(isVisualizing);

  useEffect(() => {
      isVisualizingRef.current = isVisualizing;
  }, [isVisualizing]);

  const createNode = (col: number, row: number): Node => ({
    col, row,
    isStart: row === START_NODE_ROW && col === START_NODE_COL,
    isFinish: row === FINISH_NODE_ROW && col === FINISH_NODE_COL,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
    gScore: Infinity,
    fScore: Infinity,
    hScore: 0,
  });

  const initializeGrid = useCallback(() => {
    const newGrid: Grid = [];
    for (let row = 0; row < GRID_HEIGHT; row++) {
      const currentRow: Node[] = [];
      for (let col = 0; col < GRID_WIDTH; col++) {
        currentRow.push(createNode(col, row));
      }
      newGrid.push(currentRow);
    }
    setGrid(newGrid);
  }, []);

  useEffect(() => {
    initializeGrid();
  }, [initializeGrid]);

  const handleMouseDown = (row: number, col: number) => {
    if (isVisualizing) return;
    const newGrid = getNewGridWithWallToggled(grid, row, col);
    setGrid(newGrid);
    setMouseIsPressed(true);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (!mouseIsPressed || isVisualizing) return;
    const newGrid = getNewGridWithWallToggled(grid, row, col);
    setGrid(newGrid);
  };

  const handleMouseUp = () => {
    setMouseIsPressed(false);
  };

  const getNewGridWithWallToggled = (currentGrid: Grid, row: number, col: number): Grid => {
    const newGrid = currentGrid.map(r => [...r]);
    const node = newGrid[row][col];
    if (!node.isStart && !node.isFinish) {
        const newNode = { ...node, isWall: !node.isWall };
        newGrid[row][col] = newNode;
    }
    return newGrid;
  };
  
  const animateAlgorithm = (visitedNodesInOrder: Node[], nodesInShortestPathOrder: Node[]) => {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
        if (i === visitedNodesInOrder.length) {
            setTimeout(() => {
              if (isVisualizingRef.current) animateShortestPath(nodesInShortestPathOrder);
            }, speed * i);
            return;
        }
        setTimeout(() => {
            if (!isVisualizingRef.current) return;
            const node = visitedNodesInOrder[i];
            const element = document.getElementById(`node-${node.row}-${node.col}`);
            if (element) {
              element.className = cn(element.className.replace('node-wall', ''), 'node-visited');
            }
        }, speed * i);
    }
  };

  const animateShortestPath = (nodesInShortestPathOrder: Node[]) => {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
        setTimeout(() => {
             if (!isVisualizingRef.current) return;
            const node = nodesInShortestPathOrder[i];
            const element = document.getElementById(`node-${node.row}-${node.col}`);
            if (element) {
                 element.className = cn(element.className, 'node-shortest-path');
            }
        }, speed * 5 * i);
    }
    setTimeout(() => {
        if(isVisualizingRef.current) {
            setIsVisualizing(false);
        }
    }, speed * 5 * nodesInShortestPathOrder.length);
  };

  const visualizeAlgorithm = () => {
    if (isVisualizing) return;
    clearBoard(false);
    
    setIsVisualizing(true);
    setTimeout(() => {
      const startNode = grid[START_NODE_ROW][START_NODE_COL];
      const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
      
      let visitedNodesInOrder;
      if (algorithm === 'dijkstra') {
          visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
      } else {
          visitedNodesInOrder = aStar(grid, startNode, finishNode);
      }

      const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
      animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder);
    }, 50);
  };
  
  const clearBoard = (clearWalls: boolean) => {
    setIsVisualizing(false); // Stop any ongoing visualization

    // Create a fresh grid
    const newGrid = Array.from({ length: GRID_HEIGHT }, (_, row) =>
        Array.from({ length: GRID_WIDTH }, (_, col) => {
            const oldNode = grid[row]?.[col];
            return {
                ...createNode(col, row),
                isWall: clearWalls ? false : oldNode?.isWall || false,
            };
        })
    );
    setGrid(newGrid);

    // Manually reset the class names of all node elements
    for (let row = 0; row < GRID_HEIGHT; row++) {
        for (let col = 0; col < GRID_WIDTH; col++) {
            const element = document.getElementById(`node-${row}-${col}`);
            if (element) {
                const node = newGrid[row][col];
                element.className = cn(
                    'w-full aspect-square transition-all duration-300',
                    node.isStart && 'node-start',
                    node.isFinish && 'node-finish',
                    node.isWall && 'node-wall',
                    !node.isStart && !node.isFinish && !node.isWall && 'bg-black border border-slate-700'
                );
            }
        }
    }
  };


  const generateMaze = () => {
    if (isVisualizing) return;
    clearBoard(true); // Start with a clear board
    
    const newGrid = grid.map(row => row.map(node => {
      if(node.isStart || node.isFinish) return {...node, isWall: false};
      return {...node, isWall: true};
    }));

    const carvePassagesFrom = (cx: number, cy: number) => {
      const directions = ['N', 'S', 'E', 'W'].sort(() => Math.random() - 0.5);
      
      directions.forEach(direction => {
        const nx = cx + (direction === 'E' ? 2 : direction === 'W' ? -2 : 0);
        const ny = cy + (direction === 'S' ? 2 : direction === 'N' ? -2 : 0);

        if (ny >= 0 && ny < GRID_HEIGHT && nx >= 0 && nx < GRID_WIDTH && newGrid[ny][nx].isWall) {
          newGrid[ny - (direction === 'S' ? 1 : direction === 'N' ? -1 : 0)][nx - (direction === 'E' ? 1 : direction === 'W' ? -1 : 0)].isWall = false;
          newGrid[ny][nx].isWall = false;
          carvePassagesFrom(nx, ny);
        }
      });
    };

    // Start carving from the start node
    newGrid[START_NODE_ROW][START_NODE_COL].isWall = false;
    carvePassagesFrom(START_NODE_ROW, START_NODE_COL);
    
    // Ensure the finish node is accessible
    newGrid[FINISH_NODE_ROW][FINISH_NODE_COL].isWall = false;
    
    setGrid(newGrid);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-full bg-card p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-7xl mx-auto shadow-2xl flex flex-col">
        <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-primary">Pathfinding Visualizer</CardTitle>
            <CardDescription>Visualize pathfinding algorithms like Dijkstra and A*. Click and drag to draw walls.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
                <div className="w-full sm:w-48">
                    <Label>Algorithm</Label>
                    <Select value={algorithm} onValueChange={(v) => setAlgorithm(v as Algorithm)} disabled={isVisualizing}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="astar">A* Search</SelectItem>
                            <SelectItem value="dijkstra">Dijkstra's</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={visualizeAlgorithm} disabled={isVisualizing} className="w-full sm:w-auto">
                    <Play className="mr-2 h-4 w-4" />
                    Visualize {algorithm === 'astar' ? "A*" : "Dijkstra's"}
                </Button>
                 <Button onClick={() => generateMaze()} variant="outline" className="w-full sm:w-auto">
                    <Waves className="mr-2 h-4 w-4" />
                    Generate Maze
                </Button>
                <Button onClick={() => clearBoard(true)} variant="destructive" className="w-full sm:w-auto">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset Board
                </Button>
                <div className="w-full sm:w-48">
                  <Label>Speed</Label>
                  <Slider value={[speed]} min={1} max={20} step={1} onValueChange={(v) => setSpeed(21 - v[0])} disabled={isVisualizing}/>
                </div>
            </div>
             <div
                className="grid gap-0 bg-muted/30 p-2 border rounded-md"
                style={{ gridTemplateColumns: `repeat(${GRID_WIDTH}, minmax(0, 1fr))` }}
                onMouseLeave={() => setMouseIsPressed(false)}
             >
                {grid.map((row, rowIdx) =>
                  row.map((node, nodeIdx) => {
                    const { row, col, isFinish, isStart, isWall } = node;
                    return (
                      <div
                        key={nodeIdx}
                        id={`node-${row}-${col}`}
                        className={cn(
                            'w-full aspect-square transition-all duration-300',
                            isStart && 'node-start',
                            isFinish && 'node-finish',
                            isWall && 'node-wall',
                            !isStart && !isFinish && !isWall && 'bg-black border border-slate-700'
                        )}
                        onMouseDown={() => handleMouseDown(row, col)}
                        onMouseEnter={() => handleMouseEnter(row, col)}
                        onMouseUp={handleMouseUp}
                      ></div>
                    );
                  })
                )}
            </div>
        </CardContent>
      </Card>
      <style jsx global>{`
        .node-start { background-color: hsl(var(--primary)); }
        .node-finish { background-color: hsl(var(--destructive)); }
        .node-wall { background-color: #fff; border-color: #ccc; animation: wall-animation 0.3s ease-out; }
        .node-visited { animation: visited-animation 0.5s ease-out forwards; }
        .node-shortest-path { animation: path-animation 0.5s ease-out forwards; }
        @keyframes wall-animation { 0% { transform: scale(0.5); } 100% { transform: scale(1); } }
        @keyframes visited-animation { 0% { background-color: #000; border-radius: 50%; transform: scale(0.5); } 75% { background-color: #2563eb; transform: scale(1.2); } 100% { background-color: #3b82f6; border-radius: 0; transform: scale(1); } }
        @keyframes path-animation { 0% { background-color: #3b82f6; } 100% { background-color: #facc15; } }
      `}</style>
    </div>
  );
};

// --- ALGORITHM IMPLEMENTATIONS ---

function dijkstra(grid: Grid, startNode: Node, finishNode: Node): Node[] {
  const visitedNodesInOrder: Node[] = [];
  startNode.distance = 0;
  const unvisitedNodes = getAllNodes(grid);

  while (unvisitedNodes.length > 0) {
    unvisitedNodes.sort((nodeA, nodeB) => nodeA.distance - nodeB.distance);
    const closestNode = unvisitedNodes.shift();

    if (!closestNode || closestNode.isWall) continue;
    if (closestNode.distance === Infinity) return visitedNodesInOrder;

    closestNode.isVisited = true;
    visitedNodesInOrder.push(closestNode);

    if (closestNode === finishNode) return visitedNodesInOrder;
    updateUnvisitedNeighbors(closestNode, grid);
  }
  return visitedNodesInOrder;
}

function aStar(grid: Grid, startNode: Node, finishNode: Node): Node[] {
  const visitedNodesInOrder: Node[] = [];
  const openSet: Node[] = [startNode];
  
  startNode.gScore = 0;
  startNode.hScore = heuristic(startNode, finishNode);
  startNode.fScore = startNode.hScore;

  while(openSet.length > 0) {
    openSet.sort((a,b) => a.fScore - b.fScore);
    const currentNode = openSet.shift();
    
    if(!currentNode || currentNode.isWall) continue;
    if(currentNode.isVisited) continue;
    
    if(currentNode === finishNode) return visitedNodesInOrder;
    
    currentNode.isVisited = true;
    visitedNodesInOrder.push(currentNode);
    
    const neighbors = getUnvisitedNeighbors(currentNode, grid);
    for(const neighbor of neighbors) {
      const tentativeGScore = currentNode.gScore + 1;
      if (tentativeGScore < neighbor.gScore) {
        neighbor.previousNode = currentNode;
        neighbor.gScore = tentativeGScore;
        neighbor.hScore = heuristic(neighbor, finishNode);
        neighbor.fScore = neighbor.gScore + neighbor.hScore;
        if(!openSet.includes(neighbor)){
          openSet.push(neighbor);
        }
      }
    }
  }
  return visitedNodesInOrder;
}

function heuristic(nodeA: Node, nodeB: Node): number {
    return Math.abs(nodeA.col - nodeB.col) + Math.abs(nodeA.row - nodeB.row);
}


function updateUnvisitedNeighbors(node: Node, grid: Grid) {
  const unvisitedNeighbors = getUnvisitedNeighbors(node, grid);
  for (const neighbor of unvisitedNeighbors) {
    neighbor.distance = node.distance + 1;
    neighbor.previousNode = node;
  }
}

function getUnvisitedNeighbors(node: Node, grid: Grid): Node[] {
  const neighbors: Node[] = [];
  const { col, row } = node;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  return neighbors.filter(neighbor => !neighbor.isVisited);
}

function getAllNodes(grid: Grid): Node[] {
  const nodes: Node[] = [];
  for (const row of grid) {
    for (const node of row) {
      nodes.push(node);
    }
  }
  return nodes;
}

function getNodesInShortestPathOrder(finishNode: Node): Node[] {
  const nodesInShortestPathOrder: Node[] = [];
  let currentNode: Node | null = finishNode;
  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return nodesInShortestPathOrder;
}

export default PathfindingVisualizer;
