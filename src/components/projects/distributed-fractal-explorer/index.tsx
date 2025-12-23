
'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Play, Pause, RefreshCw, Settings, Database, User, Edit, Save, AlertTriangle, ZoomIn, ZoomOut, Hand } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { faker } from '@faker-js/faker';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { firebaseConfig } from '@/firebase/config';
import { cn } from '@/lib/utils';
import { useAuth, useDatabase } from '@/firebase/provider';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';

import { ref, onValue, set, runTransaction, serverTimestamp, push, query, limitToLast } from 'firebase/database';


// --- TYPES ---
interface FractalJob {
    id: string;
    tileX: number;
    tileY: number;
    zoom: number;
    status: 'pending' | 'claimed' | 'completed';
    claimedBy?: string;
}

interface FractalTile {
    imageData: string; // Base64 data URL
}

// --- CONSTANTS ---
const TILE_SIZE = 256;
const TOTAL_TILES_X = 100;
const TOTAL_TILES_Y = 100;

// --- MAIN COMPONENT ---
const DistributedFractalExplorer: React.FC = () => {
    const { toast } = useToast();
    const db = useDatabase();
    const auth = useAuth();

    // --- STATE ---
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [isWorking, setIsWorking] = useState(false);
    const [localMode, setLocalMode] = useState(false);
    const [localStats, setLocalStats] = useState({ completed: 0, errors: 0 });
    const [globalStats, setGlobalStats] = useState({ totalCompleted: 0, activeWorkers: 0 });
    const [workerStatuses, setWorkerStatuses] = useState<string[]>([]);
    const [isEditingName, setIsEditingName] = useState(false);
    const [canvasTransform, setCanvasTransform] = useState({ x: 0, y: 0, scale: 1 });
    const [isPanning, setIsPanning] = useState(false);
    const panStart = useRef({ x: 0, y: 0 });

    const maxWorkerCount = useMemo(() => typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4, []);
    const [workerCount, setWorkerCount] = useState(maxWorkerCount);

    // --- DATA FETCHING ---
    const [tiles, setTiles] = useState<Record<string, FractalTile>>({});

    const [workerId, setWorkerId] = useState<string>('');
    const [displayName, setDisplayName] = useState('');

    useEffect(() => {
        if (auth) {
            initiateAnonymousSignIn(auth);
        }
    }, [auth]);

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

    // Subscribe to tiles in real-time
    useEffect(() => {
        const tilesRef = ref(db, 'fractal-tiles');
        const unsubscribe = onValue(tilesRef, (snapshot) => {
            if (snapshot.exists()) {
                setTiles(snapshot.val());
            }
        });
        return () => unsubscribe();
    }, [db]);

    // Subscribe to global stats
    useEffect(() => {
        const statsRef = ref(db, 'fractal-stats');
        const unsubscribe = onValue(statsRef, (snapshot) => {
            if (snapshot.exists()) {
                setGlobalStats(snapshot.val());
            }
        });
        return () => unsubscribe();
    }, [db]);

    // Implementation of Master Seed Logic
    useEffect(() => {
        const jobsRef = ref(db, 'fractal-jobs');
        const checkAndSeed = async () => {
            // Only if no tiles exist or some logic to seed
            // For simplicity, we seed if jobs collection is empty or if we want a fresh start
            // In a real app, this might be triggered by an admin or a check
            onValue(jobsRef, (snapshot) => {
                if (!snapshot.exists()) {
                    console.log("Seeding jobs...");
                    // Generate jobs for local mode
                    const newJobs: Record<string, any> = {};
                    for (let y = 0; y < TOTAL_TILES_Y; y++) {
                        for (let x = 0; x < TOTAL_TILES_X; x++) {
                            const jobId = `1-${x}-${y}`; // Standardize job IDs to include zoom level
                            newJobs[jobId] = {
                                id: jobId,
                                tileX: x,
                                tileY: y,
                                zoom: 1,
                                status: 'pending',
                                createdAt: serverTimestamp()
                            };
                        }
                    }
                    set(jobsRef, newJobs);
                }
            }, { onlyOnce: true });
        };
        checkAndSeed();
    }, [db]);

    const handleNameChange = async () => {
        if (!displayName.trim() || !workerId) return;
        localStorage.setItem('fractalWorkerName', displayName);
        setIsEditingName(false);
        toast({ title: "Name Updated!", description: `You are now known as ${displayName}.` });

        // Update name in DB if active
        if (isWorking) {
            const workerRef = ref(db, `fractal-workers/${workerId}`);
            set(workerRef, { displayName, lastSeen: serverTimestamp() });
        }
    };

    const initializeWorkers = useCallback(() => {
        if (!workerId) return [];
        // If already have workers, just return them
        if (workers.length > 0) return workers;

        const newWorkers: Worker[] = [];
        const statuses: string[] = Array(workerCount).fill('Idle');

        for (let i = 0; i < workerCount; i++) {
            const worker = new Worker('/fractal.worker.js', { type: 'module' });
            worker.onmessage = (e) => {
                const { status, message, workerId: msgWorkerId, error } = e.data;

                setWorkerStatuses(prev => {
                    const newStatuses = [...prev];
                    if (msgWorkerId < newStatuses.length) {
                        const statusMessage = error ? `Error: ${error}` : message;
                        newStatuses[msgWorkerId] = `${status}: ${statusMessage}`;
                        console.log(`[Worker #${msgWorkerId}] ${status}: ${statusMessage}`);
                    }
                    return newStatuses;
                });

                if (status === 'completed') {
                    setLocalStats(prev => ({ ...prev, completed: prev.completed + 1 }));
                }

                if (status === 'tile_rendered') {
                    const { tileX, tileY, zoom, imageData } = e.data;
                    const tileId = `${zoom}-${tileX}-${tileY}`;
                    setTiles(prev => ({ ...prev, [tileId]: { imageData } }));
                }

                if (status === 'error') {
                    setLocalStats(prev => ({ ...prev, errors: prev.errors + 1 }));
                    if (!error.includes('Transaction failed') && !error.includes('claimed')) {
                        toast({
                            title: `Worker #${msgWorkerId} Error`,
                            description: error || "An unknown error occurred in the worker.",
                            variant: "destructive"
                        });
                    }
                }
            };
            worker.postMessage({
                type: 'init',
                workerId: i,
                localWorkerId: workerId,
                displayName,
                config: firebaseConfig,
                mode: localMode ? 'local' : 'distributed',
                workerCount: workerCount,
                // For local mode at 400x400, seeding 160k jobs here is too heavy.
                // We will send the grid dimensions and let the worker generate its own jobs list internally if missing.
                gridSize: { x: TOTAL_TILES_X, y: TOTAL_TILES_Y }
            });
            newWorkers.push(worker);
        }
        setWorkers(newWorkers);
        setWorkerStatuses(statuses);
        return newWorkers;
    }, [workerCount, workerId, displayName, workers.length, toast, localMode]);

    useEffect(() => {
        return () => {
            workers.forEach(w => w.terminate());
        };
    }, [workers]);

    useEffect(() => {
        if (!isWorking && workers.length > 0) {
            workers.forEach(w => w.terminate());
            setWorkers([]);
        }
    }, [isWorking, workers]);

    const startWorkers = useCallback(() => {
        if (!workerId) return;
        setIsWorking(true);
        const activeWorkers = initializeWorkers();
        activeWorkers.forEach(w => w.postMessage({ type: 'start' }));

        if (!localMode) {
            // Only update Firebase if not in local mode
            const workerRef = ref(db, `fractal-workers/${workerId}`);
            set(workerRef, {
                displayName,
                lastSeen: serverTimestamp()
            });

            // Update stats
            runTransaction(ref(db, 'fractal-stats/activeWorkers'), (current) => {
                return (current || 0) + 1;
            });
        }
    }, [workerId, initializeWorkers, workers, db, displayName, localMode]);

    const stopWorkers = useCallback(() => {
        setIsWorking(false);
        workers.forEach(w => w.postMessage({ type: 'stop' }));

        if (!localMode && workerId) {
            // Update stats
            runTransaction(ref(db, 'fractal-stats/activeWorkers'), (current) => {
                if (current && current > 0) return current - 1;
                return 0;
            });
        }
    }, [workers, db, workerId, localMode]);

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
                            <TabsList className="bg-muted/50 border border-border/10">
                                <TabsTrigger value="display">Display</TabsTrigger>
                                <TabsTrigger value="my-worker">My Worker</TabsTrigger>
                            </TabsList>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-border/10 text-xs text-muted-foreground/60">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1.5"><Database className="h-3 w-3" /> {localMode ? 'Local Mode' : 'Connected'}</span>
                                <span className="flex items-center gap-1.5"><RefreshCw className={cn("h-3 w-3", isWorking && "animate-spin")} /> Tiles: {localMode ? localStats.completed : (globalStats.totalCompleted || 0)}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 pr-4 border-r border-border/10">
                                    <Label htmlFor="local-mode" className="cursor-pointer font-medium text-foreground/70">Force Local Mode</Label>
                                    <Switch id="local-mode" checked={localMode} onCheckedChange={setLocalMode} disabled={isWorking} />
                                </div>
                                <span className="flex items-center gap-1.5"><User className="h-3 w-3" /> Workers: {globalStats.activeWorkers || 0}</span>
                            </div>
                        </div>
                    </CardHeader>

                    <TabsContent value="display" className="flex-grow mt-0 relative overflow-hidden h-[600px] border-b border-border/10">
                        <div
                            className="w-full h-full relative"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onWheel={handleWheel}
                        >
                            <div className="absolute top-1/2 left-1/2" style={{ transform: `translate(-50%, -50%) translate(${canvasTransform.x}px, ${canvasTransform.y}px) scale(${canvasTransform.scale})` }}>
                                <div
                                    className="relative bg-[#050505] border border-white/5 shadow-2xl overflow-hidden"
                                    style={{
                                        width: `${TOTAL_TILES_X * TILE_SIZE}px`,
                                        height: `${TOTAL_TILES_Y * TILE_SIZE}px`,
                                        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
                                        backgroundSize: `${TILE_SIZE}px ${TILE_SIZE}px`,
                                        contain: 'layout size'
                                    }}
                                >
                                    {/* Grid extent indicator */}
                                    <div className="absolute inset-0 pointer-events-none border-2 border-primary/20" />

                                    {/* Render only tiles that have been completed */}
                                    {Object.entries(tiles).map(([tileId, tile]) => {
                                        const [z, x, y] = tileId.split('-').map(Number);
                                        if (z !== 1) return null;

                                        // Viewport culling - only render if potentially visible
                                        // Since we use CSS transform for zoom/pan, we can't easily determine viewport
                                        // For now, render all completed tiles but with will-change optimization
                                        return (
                                            <div
                                                key={tileId}
                                                className="absolute border border-white/10 flex items-center justify-center overflow-hidden bg-black"
                                                style={{
                                                    left: `${x * TILE_SIZE}px`,
                                                    top: `${y * TILE_SIZE}px`,
                                                    width: `${TILE_SIZE}px`,
                                                    height: `${TILE_SIZE}px`,
                                                    willChange: 'transform'
                                                }}
                                            >
                                                <img
                                                    src={tile.imageData}
                                                    alt={`Tile ${x},${y}`}
                                                    className="w-full h-full object-cover"
                                                    style={{ imageRendering: 'pixelated' }}
                                                    loading="lazy"
                                                />
                                            </div>
                                        );
                                    })}

                                    {/* Visual indicator showing total grid */}
                                    <div className="absolute top-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-mono">
                                        Grid: {TOTAL_TILES_X}×{TOTAL_TILES_Y} ({TOTAL_TILES_X * TOTAL_TILES_Y} tiles)
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
                            <Button variant="outline" size="icon" onClick={() => setCanvasTransform(v => ({ ...v, scale: Math.min(v.scale * 1.2, 10) }))}><ZoomIn /></Button>
                            <Button variant="outline" size="icon" onClick={() => setCanvasTransform(v => ({ ...v, scale: Math.max(v.scale / 1.2, 0.2) }))}><ZoomOut /></Button>
                            <Button variant="outline" size="icon" onClick={resetZoomAndPan}><Hand /></Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="my-worker" className="flex-grow mt-0 p-4 bg-background">
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
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </Card>
        </div>
    );
};

export default DistributedFractalExplorer;
