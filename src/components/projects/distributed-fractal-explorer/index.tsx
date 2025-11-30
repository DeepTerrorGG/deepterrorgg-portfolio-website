
'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Play, Pause, RefreshCw, Settings, Database, User, Edit, Save, AlertTriangle, ZoomIn, ZoomOut, Hand } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDatabase } from '@/firebase';
import { ref, onValue, runTransaction, set, serverTimestamp } from 'firebase/database';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { faker } from '@faker-js/faker';
import { Leaderboard } from './leaderboard';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

// --- TYPES ---
interface FractalJob {
    id: string;
    tileX: number;
    tileY: number;
    zoom: number;
    status: 'pending' | 'claimed' | 'completed';
    claimedBy?: string;
    claimedAt?: object | number;
    completedAt?: object | number;
    createdAt: object | number;
}

interface FractalTile {
    imageData: string; // Base64 data URL
}

// --- CONSTANTS ---
const TILE_SIZE = 256;
const TOTAL_TILES_X = 8;
const TOTAL_TILES_Y = 5;

// --- MAIN COMPONENT ---
const DistributedFractalExplorer: React.FC = () => {
    const { toast } = useToast();
    const db = useDatabase();
    
    // --- STATE ---
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [isWorking, setIsWorking] = useState(false);
    const [localStats, setLocalStats] = useState({ completed: 0, errors: 0 });
    const [workerStatuses, setWorkerStatuses] = useState<string[]>([]);
    const [isEditingName, setIsEditingName] = useState(false);
    const [canvasTransform, setCanvasTransform] = useState({ x: 0, y: 0, scale: 1 });
    const [isPanning, setIsPanning] = useState(false);
    const panStart = useRef({ x: 0, y: 0 });

    const maxWorkerCount = useMemo(() => typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4, []);
    const [workerCount, setWorkerCount] = useState(maxWorkerCount);

    // --- DATA FETCHING ---
    const [tiles, setTiles] = useState<Record<string, FractalTile>>({});
    const [allJobs, setAllJobs] = useState<Record<string, FractalJob>>({});

    useEffect(() => {
        if (!db) return;
        const tilesRef = ref(db, 'fractal-tiles');
        const jobsRef = ref(db, 'fractal-jobs');

        const unsubTiles = onValue(tilesRef, (snapshot) => {
            setTiles(snapshot.val() || {});
        });
        const unsubJobs = onValue(jobsRef, (snapshot) => {
            setAllJobs(snapshot.val() || {});
        });

        return () => {
            unsubTiles();
            unsubJobs();
        };
    }, [db]);

    const [workerId, setWorkerId] = useState<string>('');
    const [displayName, setDisplayName] = useState('');

    useEffect(() => {
        let id = localStorage.getItem('fractalWorkerId');
        let name = localStorage.getItem('fractalWorkerName');

        if (!id) {
            id = `worker-${faker.string.uuid()}`;
            localStorage.setItem('fractalWorkerId', id);
        }
        if (!name) {
            name = `Anonymous ${faker.animal.type()}`;
            localStorage.setItem('fractalWorkerName', name);
        }
        setWorkerId(id);
        setDisplayName(name);
    }, []);

    const handleNameChange = async () => {
        if (!displayName.trim() || !workerId || !db) return;
        localStorage.setItem('fractalWorkerName', displayName);
        const workerRef = ref(db, `fractal-workers/${workerId}/displayName`);
        await set(workerRef, displayName);
        setIsEditingName(false);
        toast({ title: "Name Updated!", description: `You are now known as ${displayName}.` });
    };

    const jobStats = useMemo(() => {
        const jobsList = Object.values(allJobs);
        return {
            pending: jobsList.filter(j => j.status === 'pending').length,
            claimed: jobsList.filter(j => j.status === 'claimed').length,
            completed: jobsList.filter(j => j.status === 'completed').length,
            total: jobsList.length
        };
    }, [allJobs]);

    const initializeWorkers = useCallback(() => {
        if (!workerId || workers.length > 0) return;

        const newWorkers: Worker[] = [];
        const statuses: string[] = Array(workerCount).fill('Idle');
        
        for (let i = 0; i < workerCount; i++) {
            const worker = new Worker('/fractal.worker.js');
            worker.onmessage = (e) => {
                const { status, message, workerId: msgWorkerId, error } = e.data;
                
                setWorkerStatuses(prev => {
                    const newStatuses = [...prev];
                    if (msgWorkerId < newStatuses.length) {
                        const statusMessage = error ? `Error: ${error}` : message;
                        newStatuses[msgWorkerId] = `${status}: ${statusMessage}`;
                    }
                    return newStatuses;
                });
                
                if (status === 'completed') {
                    setLocalStats(prev => ({ ...prev, completed: prev.completed + 1 }));
                }
                
                if (status === 'error') {
                    setLocalStats(prev => ({ ...prev, errors: prev.errors + 1 }));
                    toast({
                        title: `Worker #${msgWorkerId} Error`,
                        description: error || "An unknown error occurred in the worker.",
                        variant: "destructive"
                    });
                }
            };
            worker.postMessage({ type: 'init', workerId: i, localWorkerId: workerId, displayName });
            newWorkers.push(worker);
        }
        setWorkers(newWorkers);
        setWorkerStatuses(statuses);
    }, [workerCount, workerId, displayName, workers.length, toast]);

    useEffect(() => {
        workers.forEach(w => w.terminate());
        setWorkers([]);
    }, [workerCount]);

    useEffect(() => {
        if (workerId && workers.length === 0) {
            initializeWorkers();
        }
        return () => {
            if (workers.length > 0) {
                workers.forEach(w => w.terminate());
            }
        };
    }, [workerId, workers, initializeWorkers]);

    const startWorkers = () => {
        if (workers.length === 0) {
            initializeWorkers();
        }
        setIsWorking(true);
        workers.forEach(w => w.postMessage({ type: 'start' }));
    };

    const stopWorkers = () => {
        setIsWorking(false);
        workers.forEach(w => w.postMessage({ type: 'stop' }));
    };
    
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        panStart.current = { x: e.clientX - canvasTransform.x, y: e.clientY - canvasTransform.y };
        setIsPanning(true);
    };
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isPanning) return;
        setCanvasTransform(prev => ({ ...prev, x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y }));
    };
    const handleMouseUp = () => setIsPanning(false);
    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        e.preventDefault();
        const scaleAmount = e.deltaY * -0.001;
        const newScale = canvasTransform.scale + scaleAmount;
        const clampedScale = Math.min(Math.max(0.2, newScale), 10);
        
        const rect = e.currentTarget.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const newX = mouseX - (mouseX - canvasTransform.x) * (clampedScale / canvasTransform.scale);
        const newY = mouseY - (mouseY - canvasTransform.y) * (clampedScale / canvasTransform.scale);
        
        setCanvasTransform({ scale: clampedScale, x: newX, y: newY });
    };

    const resetZoomAndPan = () => {
        setCanvasTransform({ x: 0, y: 0, scale: 1 });
    };

    return (
      <div className="w-full h-full bg-card flex flex-col p-4">
        <Card className="w-full max-w-7xl mx-auto shadow-2xl flex-grow flex flex-col">
            <Tabs defaultValue="display" className="w-full flex-grow flex flex-col">
                <CardHeader className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle className="text-3xl font-bold text-primary">Distributed Fractal Explorer</CardTitle>
                            <CardDescription>Every visitor helps render a piece of a massive fractal. Start your worker to contribute!</CardDescription>
                        </div>
                        <TabsList>
                            <TabsTrigger value="display">Display</TabsTrigger>
                            <TabsTrigger value="my-worker">My Worker</TabsTrigger>
                            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                        </TabsList>
                    </div>
                </CardHeader>
    
                <TabsContent value="display" className="flex-grow mt-0 rounded-md overflow-hidden relative bg-muted/30 p-2">
                    <div 
                        className="w-full h-full relative" 
                        onMouseDown={handleMouseDown} 
                        onMouseMove={handleMouseMove} 
                        onMouseUp={handleMouseUp} 
                        onMouseLeave={handleMouseUp}
                        onWheel={handleWheel}
                    >
                         <div
                            className="absolute top-1/2 left-1/2"
                            style={{ 
                                transform: `translate(-50%, -50%) translate(${canvasTransform.x}px, ${canvasTransform.y}px) scale(${canvasTransform.scale})`,
                                transformOrigin: 'center center',
                                cursor: isPanning ? 'grabbing' : 'grab',
                                backgroundImage: 'radial-gradient(hsl(var(--border)) 1px, transparent 1px)',
                                backgroundSize: '20px 20px',
                            }}
                        >
                            <div className="grid" style={{ gridTemplateColumns: `repeat(${TOTAL_TILES_X}, 256px)`, gridTemplateRows: `repeat(${TOTAL_TILES_Y}, 256px)` }}>
                                {Object.entries(tiles).map(([id, tile]) => {
                                    const parts = id.split('-');
                                    const x = parseInt(parts[1], 10);
                                    const y = parseInt(parts[2], 10);
                                    return (
                                        <div key={id} style={{ gridRow: y + 1, gridColumn: x + 1 }}>
                                            <img src={tile.imageData} alt={`Tile ${x},${y}`} className="w-full h-full"/>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
                        <Button variant="outline" size="icon" onClick={() => setCanvasTransform(v => ({...v, scale: Math.min(v.scale * 1.2, 10)}))}><ZoomIn/></Button>
                        <Button variant="outline" size="icon" onClick={() => setCanvasTransform(v => ({...v, scale: Math.max(v.scale / 1.2, 0.2)}))}><ZoomOut/></Button>
                        <Button variant="outline" size="icon" onClick={resetZoomAndPan}><Hand/></Button>
                    </div>
                </TabsContent>
    
                <TabsContent value="my-worker" className="flex-grow mt-0 p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full max-w-4xl mx-auto">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center justify-between">
                                <span>My Worker</span>
                                <div className="flex items-center gap-1">
                                    {isEditingName ? (
                                    <>
                                        <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="h-8 text-sm w-36" />
                                        <Button size="icon" className="h-8 w-8" onClick={handleNameChange}><Save className="h-4 w-4" /></Button>
                                    </>
                                    ) : (
                                    <>
                                        <span className="text-base font-medium text-primary">{displayName}</span>
                                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setIsEditingName(true)}><Edit className="h-4 w-4" /></Button>
                                    </>
                                    )}
                                </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {isWorking ? (
                                <Button onClick={stopWorkers} variant="destructive" className="w-full"><Pause className="mr-2" />Stop Contributing</Button>
                                ) : (
                                <Button onClick={startWorkers} className="w-full"><Play className="mr-2" />Start Contributing</Button>
                                )}
                                <div className="text-sm">
                                <p><strong>Your Stats:</strong> {localStats.completed} completed, {localStats.errors} errors</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                           <CardHeader><CardTitle className="text-xl flex items-center gap-2"><Settings />Settings</CardTitle></CardHeader>
                           <CardContent>
                                <div>
                                <Label htmlFor="threads-slider" className="flex justify-between">
                                    <span>CPU Threads ({workerCount})</span>
                                    <span className="text-muted-foreground">Max: {maxWorkerCount}</span>
                                </Label>
                                <Slider id="threads-slider" min={1} max={maxWorkerCount} step={1} value={[workerCount]} onValueChange={(val) => setWorkerCount(val[0])} disabled={isWorking} className="mt-2" />
                                <p className="text-xs text-muted-foreground mt-2">Adjust to control CPU usage. Changes will apply when you next start the worker.</p>
                                </div>
                           </CardContent>
                        </Card>
                    </div>
                     <div className="flex flex-col gap-6">
                       <Card className="flex-grow">
                          <CardHeader><CardTitle className="text-xl">Worker Logs</CardTitle></CardHeader>
                          <CardContent>
                            <div className="p-2 border rounded-lg border-border/30 h-48 overflow-y-auto text-xs font-mono space-y-1 bg-black/30">
                            {workerStatuses.slice(0, workerCount).map((status, i) => (
                                <p key={i}><span className="text-muted-foreground mr-2">#{i}:</span>{status}</p>
                            ))}
                            </div>
                           </CardContent>
                       </Card>
                       <Card>
                         <CardHeader><CardTitle className="text-xl">Global Network Stats</CardTitle></CardHeader>
                         <CardContent className="space-y-3 text-sm">
                            <div>
                                <div className="flex justify-between">
                                    <span>Progress</span>
                                    <span>{jobStats.completed} / {jobStats.total}</span>
                                </div>
                                <Progress value={jobStats.total > 0 ? (jobStats.completed / jobStats.total) * 100 : 0} />
                            </div>
                            <p><strong>Pending:</strong> {jobStats.pending.toLocaleString()}</p>
                            <p><strong>Claimed:</strong> {jobStats.claimed.toLocaleString()}</p>
                         </CardContent>
                       </Card>
                    </div>
                  </div>
                </TabsContent>
    
                <TabsContent value="leaderboard" className="flex-grow mt-0 p-4">
                  <Leaderboard />
                </TabsContent>
            </Tabs>
        </Card>
      </div>
    );
};

export default DistributedFractalExplorer;
