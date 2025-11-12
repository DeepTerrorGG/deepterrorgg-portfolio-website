
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFirebase, useCollection, useUser, addDocumentNonBlocking, updateDocumentNonBlocking, initiateAnonymousSignIn, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { line, curveBasis } from 'd3-shape';
import { Button } from '@/components/ui/button';
import { Circle, Minus, MousePointer, Palette, Trash2, Loader2, Users, User, Share2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';

interface Path {
  id: string;
  points: [number, number][];
  color: string;
  strokeWidth: number;
  userId: string;
}

const colors = ["#ef4444", "#fb923c", "#facc15", "#4ade80", "#22d3ee", "#60a5fa", "#c084fc", "#f472b6"];

const pathIdToPath = (paths: Path[]) => {
  const pathMap = new Map<string, Path>();
  for (const path of paths) {
    pathMap.set(path.id, path);
  }
  return pathMap;
};

const lineGenerator = line<[number, number]>().curve(curveBasis);

const SvgPath = React.memo(({ pathData }: { pathData: Path }) => {
  const d = useMemo(() => lineGenerator(pathData.points), [pathData.points]);
  if (!d) return null;
  return (
    <path
      d={d}
      stroke={pathData.color}
      strokeWidth={pathData.strokeWidth}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
});
SvgPath.displayName = 'SvgPath';

const Whiteboard = ({ sessionId }: { sessionId: string }) => {
  const { firestore, user } = useFirebase();
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Path | null>(null);
  const [color, setColor] = useState(colors[0]);
  const [strokeWidth, setStrokeWidth] = useState(4);

  const pathsCollectionRef = useMemoFirebase(() => collection(firestore, `whiteboard-sessions/${sessionId}/paths`), [firestore, sessionId]);
  const { data: pathsData, isLoading } = useCollection<Path>(pathsCollectionRef);

  const pathMap = useMemo(() => pathIdToPath(pathsData || []), [pathsData]);
  const paths = useMemo(() => Array.from(pathMap.values()), [pathMap]);

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    e.preventDefault();
    if (!svgRef.current || !user) return;
    setIsDrawing(true);
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newPath: Path = { id: `${user.uid}-${Date.now()}`, userId: user.uid, points: [[x, y]], color, strokeWidth };
    setCurrentPath(newPath);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawing || !currentPath || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCurrentPath(prev => prev ? { ...prev, points: [...prev.points, [x, y]] } : null);
  };


  const handlePointerUp = () => {
    if (!isDrawing || !currentPath || !pathsCollectionRef) return;
    setIsDrawing(false);
    if (currentPath.points.length > 1) {
      const pathDocRef = doc(pathsCollectionRef, currentPath.id);
      updateDocumentNonBlocking(pathDocRef, { ...currentPath });
    }
    setCurrentPath(null);
  };

  const clearBoard = () => {
    if (!pathsData) return;
    pathsData.forEach(p => {
        const pathDocRef = doc(firestore, `whiteboard-sessions/${sessionId}/paths`, p.id);
        // This should be a batched write in a real app, but for simplicity...
        updateDocumentNonBlocking(doc(firestore, `whiteboard-sessions/${sessionId}/paths/${p.id}`), {points: []});
    });
  }

  return (
    <div className="relative w-full h-full flex flex-col touch-none">
      <div className="absolute top-2 left-2 z-10 p-2 bg-card rounded-lg border shadow-md flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon"><Palette /></Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="flex gap-1">
              {colors.map(c => <Button key={c} size="icon" style={{ backgroundColor: c }} onClick={() => setColor(c)} className={cn(c === color && "ring-2 ring-ring ring-offset-2")}></Button>)}
            </div>
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon"><MousePointer /></Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="flex items-center gap-2">
              <Minus className="h-4 w-4" />
              <Slider defaultValue={[strokeWidth]} min={1} max={20} step={1} onValueChange={(v) => setStrokeWidth(v[0])} />
              <Circle className="h-4 w-4" fill="currentColor" />
            </div>
          </PopoverContent>
        </Popover>
        <Button variant="outline" size="icon" onClick={clearBoard}><Trash2 /></Button>
      </div>

      <div className="flex-grow relative bg-muted/30">
        {isLoading && <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {paths.map(p => <SvgPath key={p.id} pathData={p} />)}
          {currentPath && <SvgPath pathData={currentPath} />}
        </svg>
      </div>
    </div>
  );
};


const CollaborativeWhiteboard: React.FC = () => {
  const { auth, firestore, isUserLoading } = useFirebase();
  const { user } = useUser();
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState<string | null>(null);

  const sessionsCollectionRef = useMemoFirebase(() => collection(firestore, 'whiteboard-sessions'), [firestore]);
  const waitingSessionQuery = useMemoFirebase(() => query(sessionsCollectionRef, where('status', '==', 'waiting'), orderBy('createdAt', 'desc'), limit(1)), [sessionsCollectionRef]);
  const { data: waitingSessions, isLoading: isWaitingLoading } = useCollection(waitingSessionQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, user, auth]);

  const handleCreateSession = async () => {
    if (!user) return;
    const newSession = {
      creatorId: user.uid,
      status: 'waiting',
      createdAt: serverTimestamp(),
      users: [user.uid],
    };
    try {
      const docRef = await addDocumentNonBlocking(sessionsCollectionRef, newSession);
      if (docRef) {
        setSessionId(docRef.id);
        toast({ title: 'Session Created', description: 'Waiting for others to join.' });
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Could not create session.', variant: 'destructive' });
    }
  };

  const handleJoinSession = async () => {
    if (!user || !waitingSessions || waitingSessions.length === 0) return;
    const sessionToJoin = waitingSessions[0];
    if (sessionToJoin.users.includes(user.uid)) {
      setSessionId(sessionToJoin.id);
      return;
    }
    const sessionDocRef = doc(firestore, 'whiteboard-sessions', sessionToJoin.id);
    await updateDocumentNonBlocking(sessionDocRef, {
      users: [...sessionToJoin.users, user.uid],
      status: 'active'
    });
    setSessionId(sessionToJoin.id);
  };
  
  const handleCopyLink = () => {
    if (!sessionId) return;
    const url = `${window.location.origin}${window.location.pathname}?whiteboard_session=${sessionId}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Link Copied!', description: 'You can now share this link with others.' });
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paramSessionId = params.get('whiteboard_session');
    if (paramSessionId) {
        setSessionId(paramSessionId);
    }
  }, []);

  if (isUserLoading) {
    return <div className="flex items-center justify-center h-full"><Skeleton className="w-48 h-10" /></div>;
  }
  
  if(sessionId) {
      return <Whiteboard sessionId={sessionId} />;
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-4 h-full">
      <h2 className="text-2xl font-bold">Collaborative Whiteboard</h2>
      {isWaitingLoading ? (
        <Loader2 className="h-8 w-8 animate-spin" />
      ) : (
        <>
          <Button onClick={handleCreateSession} size="lg">
            <User className="mr-2 h-5 w-5" /> Create New Session
          </Button>
          <Button onClick={handleJoinSession} size="lg" variant="secondary" disabled={!waitingSessions || waitingSessions.length === 0}>
            <Users className="mr-2 h-5 w-5" /> Join Session
          </Button>
          {waitingSessions && waitingSessions.length === 0 && <p className="text-sm text-muted-foreground">No waiting sessions available. Create one!</p>}
        </>
      )}
    </div>
  );
};

export default CollaborativeWhiteboard;
