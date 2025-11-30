
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Loader2, User, Users } from 'lucide-react';
import { useDatabase } from '@/firebase';
import { useDatabaseObjectList } from '@/firebase/database/use-database';
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
    const lobbyRef = React.useMemo(() => db ? ref(db, `lobbies/${gameId}`) : null, [db, gameId]);
    const { data: lobbyPlayers, isLoading } = useDatabaseObjectList<{ name: string; joinedAt: any }>(lobbyRef);
    const [isJoining, setIsJoining] = useState(false);
    
    // Effect to handle player presence in the lobby
    useEffect(() => {
      if (!db || !playerName) return;
      
      const playerInLobby = lobbyPlayers && Object.values(lobbyPlayers).some(p => p.name === playerName);
      if (playerInLobby) {
        const playerRef = ref(db, `lobbies/${gameId}/${playerName}`);
        onDisconnect(playerRef).remove();
        
        return () => {
          onDisconnect(playerRef).cancel();
        };
      }
    }, [db, gameId, playerName, lobbyPlayers]);

    const handleJoinLobby = async () => {
        if (!db || !lobbyRef || !playerName.trim()) {
            toast({ title: "Cannot join lobby", description: "Player name is not set.", variant: "destructive" });
            return;
        }
        setIsJoining(true);

        const playerRef = ref(db, `lobbies/${gameId}/${playerName}`);
        await set(playerRef, { name: playerName, joinedAt: serverTimestamp() });
        
        try {
            await runTransaction(lobbyRef, (currentLobbyData) => {
                if (!currentLobbyData) {
                    // This can happen if another transaction cleared the lobby.
                    // The player remains in the lobby for the next opponent.
                    return currentLobbyData;
                }
                
                const playersInLobby = Object.values(currentLobbyData);
                if (playersInLobby.length >= 2) {
                    // We found a match, create a game session
                    const p1 = playersInLobby[0];
                    const p2 = playersInLobby[1];
                    const sessionId = `session_${p1.name}_${p2.name}_${Date.now()}`;
                    
                    const playerRole = playerName === p1.name ? 'p1' : 'p2';
                    onGameStart(sessionId, playerRole);

                    // Clear the lobby for the next players
                    return null;
                }
                
                // Not enough players yet, wait.
                return currentLobbyData;
            });
        } catch (error) {
            console.error("Lobby transaction failed:", error);
            toast({title: "Matchmaking Error", description: "Could not start a game. Please try re-joining.", variant: "destructive"});
            await remove(playerRef);
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
