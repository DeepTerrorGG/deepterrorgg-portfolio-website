// src/components/projects/tic-tac-toe.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  useFirebase,
  useDoc,
  useCollection,
  useUser,
  initiateAnonymousSignIn,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  useMemoFirebase,
} from '@/firebase';
import {
  doc,
  collection,
  query,
  where,
  limit,
  orderBy,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User, Users, X, Circle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

type PlayerSymbol = 'X' | 'O';
type BoardState = (PlayerSymbol | null)[];

interface Game {
  id: string;
  board: BoardState;
  player1Id: string;
  player2Id?: string;
  currentPlayer: PlayerSymbol;
  winner?: PlayerSymbol | 'draw';
  status: 'waiting' | 'in-progress' | 'finished';
  createdAt: Timestamp;
}

const TicTacToe: React.FC = () => {
  const { auth, firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [gameId, setGameId] = useState<string | null>(null);

  const gameRef = useMemoFirebase(() => gameId ? doc(firestore, 'games', gameId) : null, [firestore, gameId]);
  const { data: game, isLoading: isGameLoading } = useDoc<Game>(gameRef);

  const waitingGamesQuery = useMemoFirebase(
    () =>
      query(
        collection(firestore, 'games'),
        where('status', '==', 'waiting'),
        orderBy('createdAt', 'desc'),
        limit(1)
      ),
    [firestore]
  );
  const { data: waitingGames, isLoading: isWaitingGamesLoading } = useCollection<Game>(waitingGamesQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, user, auth]);

  const handleCreateGame = async () => {
    if (!user) return;
    const newGame = {
      board: Array(9).fill(null),
      player1Id: user.uid,
      currentPlayer: 'X' as PlayerSymbol,
      status: 'waiting' as const,
      createdAt: serverTimestamp(),
    };
    try {
      const docRef = await addDocumentNonBlocking(collection(firestore, 'games'), newGame);
      if (docRef) {
        setGameId(docRef.id);
        toast({ title: 'Game Created', description: 'Waiting for another player to join.' });
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Could not create game.', variant: 'destructive' });
    }
  };

  const handleJoinGame = () => {
    if (!user || !waitingGames || waitingGames.length === 0) return;
    const gameToJoin = waitingGames[0];
    if (gameToJoin.player1Id === user.uid) {
      toast({ title: 'You are already in this game' });
      setGameId(gameToJoin.id);
      return;
    }
    const gameToJoinRef = doc(firestore, 'games', gameToJoin.id);
    updateDocumentNonBlocking(gameToJoinRef, {
      player2Id: user.uid,
      status: 'in-progress',
    });
    setGameId(gameToJoin.id);
  };

  const handleMakeMove = (index: number) => {
    if (!game || !user || game.status !== 'in-progress') return;

    const currentPlayerSymbol = game.board.filter(Boolean).length % 2 === 0 ? 'X' : 'O';
    const playerRole = user.uid === game.player1Id ? 'X' : 'O';
    if (playerRole !== currentPlayerSymbol || game.board[index] !== null) {
      toast({ title: 'Not your turn or square taken!', variant: 'destructive'});
      return;
    }

    const newBoard = [...game.board];
    newBoard[index] = playerRole;
    
    const newWinner = calculateWinner(newBoard);
    const newStatus = newWinner ? 'finished' : (newBoard.every(Boolean) ? 'finished' : 'in-progress');
    
    const update: Partial<Game> = {
      board: newBoard,
      currentPlayer: playerRole === 'X' ? 'O' : 'X',
      status: newStatus,
      winner: newWinner || (newStatus === 'finished' ? 'draw' : undefined),
    };
    
    if (gameRef) {
        updateDocumentNonBlocking(gameRef, update);
    }
  };
  
  const handleResetGame = () => {
      setGameId(null);
  }

  if (isUserLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (game && user) {
    const playerSymbol = user.uid === game.player1Id ? 'X' : 'O';
    const isMyTurn = (playerSymbol === 'X' && game.board.filter(Boolean).length % 2 === 0) || (playerSymbol === 'O' && game.board.filter(Boolean).length % 2 !== 0);
    
    let statusMessage = '';
    if (game.status === 'waiting') {
        statusMessage = 'Waiting for player 2...';
    } else if (game.status === 'in-progress') {
        statusMessage = isMyTurn ? "Your Turn" : "Opponent's Turn";
    } else if (game.status === 'finished') {
        if (game.winner === 'draw') {
            statusMessage = "It's a draw!";
        } else {
            statusMessage = game.winner === playerSymbol ? 'You Win!' : 'You Lose!';
        }
    }

    return (
        <div className="p-4 flex flex-col items-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>Tic-Tac-Toe</span>
                        <span className={cn("text-lg font-bold", game.status === 'finished' && game.winner === playerSymbol && 'text-primary', game.status === 'finished' && game.winner !== playerSymbol && game.winner !== 'draw' && 'text-destructive' )}>{statusMessage}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="grid grid-cols-3 gap-2 aspect-square">
                        {game.board.map((cell, index) => (
                        <button
                            key={index}
                            onClick={() => handleMakeMove(index)}
                            disabled={!isMyTurn || game.status !== 'in-progress' || cell !== null}
                            className="bg-muted flex justify-center items-center rounded-md text-6xl font-bold disabled:cursor-not-allowed hover:bg-muted/80 transition-colors"
                        >
                            {cell === 'X' && <X className="w-16 h-16 text-blue-500" />}
                            {cell === 'O' && <Circle className="w-16 h-16 text-red-500" />}
                        </button>
                        ))}
                    </div>
                    <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
                        <p>You are: {playerSymbol === 'X' ? <X className="inline w-4 h-4 text-blue-500"/> : <Circle className="inline w-4 h-4 text-red-500"/>}</p>
                        <p>Game ID: {game.id}</p>
                    </div>
                    {game.status === 'finished' && (
                        <Button onClick={handleResetGame} className="w-full mt-4">
                            <RefreshCw className="mr-2 h-4 w-4" /> Play Again
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-4 h-full">
      <h2 className="text-2xl font-bold">Play Tic-Tac-Toe</h2>
      {isWaitingGamesLoading ? (
        <Skeleton className="h-10 w-48" />
      ) : (
        <>
          <Button onClick={handleCreateGame} size="lg">
            <User className="mr-2 h-5 w-5" /> Create New Game
          </Button>
          <Button onClick={handleJoinGame} size="lg" variant="secondary" disabled={!waitingGames || waitingGames.length === 0}>
            <Users className="mr-2 h-5 w-5" /> Join Game
          </Button>
          {waitingGames && waitingGames.length === 0 && <p className="text-sm text-muted-foreground">No waiting games available. Create one!</p>}
        </>
      )}
    </div>
  );
};

const calculateWinner = (board: BoardState): PlayerSymbol | null => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6],             // diagonals
  ];
  for (const line of lines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
};


export default TicTacToe;
