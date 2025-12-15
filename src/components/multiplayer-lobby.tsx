
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Loader2, User, Users } from 'lucide-react';
import { useDatabase, useDatabaseObjectList } from '@/firebase';
import { ref, set, serverTimestamp, onDisconnect, remove, runTransaction } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';

interface LobbyProps {
    gameId: string;
    playerName: string;
    onGameStart: (sessionId: string, playerRole: 'p1' | 'p2') => void;
}

export const MultiplayerLobby: React.FC<LobbyProps> = ({ gameId, playerName, onGameStart }) => {
    const db = useDatabase();
    const { toast } = useToast();
    const lobbyRef = useMemo(() => db ? ref(db, `lobbies/${gameId}`) : null, [db, gameId]);
    const { data: lobbyPlayers, isLoading } = useDatabaseObjectList<{ name: string; joinedAt: any }>(lobbyRef);
    const [isJoining, setIsJoining] = useState(false);
    
    const playerRef = useMemo(() => (db && playerName) ? ref(db, `lobbies/${gameId}/${playerName}`) : null, [db, gameId, playerName]);

    useEffect(() => {
      if (!playerRef) return;
      
      const isPlayerInLobby = lobbyPlayers && Object.values(lobbyPlayers).some(p => p.name === playerName);
      if (isPlayerInLobby) {
        onDisconnect(playerRef).remove();
        
        return () => {
          onDisconnect(playerRef).cancel();
        };
      }
    }, [playerRef, lobbyPlayers, playerName]);
    
    const handleJoinLobby = async () => {
        if (!playerRef || !playerName.trim()) {
            toast({ title: "Cannot join lobby", description: "Player name is not set.", variant: "destructive" });
            return;
        }
        setIsJoining(true);

        await set(playerRef, { name: playerName, joinedAt: serverTimestamp() });
        
        try {
            await runTransaction(lobbyRef!, (currentLobbyData) => {
                if (!currentLobbyData) return currentLobbyData;
                
                const playersInLobby = Object.values(currentLobbyData);
                if (playersInLobby.length >= 2) {
                    const sortedPlayers = playersInLobby.sort((a: any, b: any) => a.joinedAt - b.joinedAt);
                    const p1 = sortedPlayers[0];
                    const p2 = sortedPlayers[1];
                    const sessionId = `session_${p1.name}_${p2.name}_${Date.now()}`;
                    
                    const playerRole = playerName === p1.name ? 'p1' : 'p2';
                    onGameStart(sessionId, playerRole);

                    // Atomically remove the two matched players from the lobby
                    const updates: Record<string, null> = {};
                    updates[p1.name] = null;
                    updates[p2.name] = null;
                    return { ...currentLobbyData, ...updates };
                }
                
                return currentLobbyData;
            });
        } catch (error) {
            console.error("Lobby transaction failed:", error);
            toast({title: "Matchmaking Error", description: "Could not start a game. Please try re-joining.", variant: "destructive"});
            if (playerRef) await remove(playerRef);
        } finally {
             setIsJoining(false);
        }
    };
    
    const isPlayerInLobby = lobbyPlayers && Object.values(lobbyPlayers).some(p => p.name === playerName);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Multiplayer Lobby</CardTitle>
                <CardDescription>Waiting for another player to join...</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button onClick={handleJoinLobby} className="w-full" disabled={isJoining || isPlayerInLobby}>
                    {isJoining ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Users className="mr-2 h-4 w-4"/>}
                    {isPlayerInLobby ? "Waiting..." : "Join Lobby"}
                </Button>
                <div className="space-y-2">
                    <h4 className="font-semibold">Players in Lobby:</h4>
                    {isLoading ? <Loader2 className="animate-spin"/> : (
                        lobbyPlayers && Object.values(lobbyPlayers).length > 0 ? (
                             <ul className="list-disc pl-5 text-sm">
                                {Object.values(lobbyPlayers).map(player => (
                                    <li key={player.name} className="flex items-center gap-2">
                                        <User className="h-4 w-4"/> {player.name}
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-sm text-muted-foreground">Lobby is empty.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
