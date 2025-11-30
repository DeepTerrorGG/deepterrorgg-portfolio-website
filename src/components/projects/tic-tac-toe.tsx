
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, User, Bot, X, Circle, Swords, Trophy, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Leaderboard, LeaderboardEntry } from '@/components/leaderboard';
import { useDatabase } from '@/firebase';
import { useDatabaseObject } from '@/firebase/database/use-database';
import { ref, set, serverTimestamp, onDisconnect, remove, update } from 'firebase/database';
import { MultiplayerLobby } from '../multiplayer-lobby';
import { useToast } from '@/hooks/use-toast';
import { faker } from '@faker-js/faker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Player = 'X' | 'O';
type Board = (Player | null)[];
type Difficulty = 'Easy' | 'Medium' | 'Hard';
type GameMode = 'ai' | 'multiplayer';
type GameSession = {
  board: Board;
  currentPlayer: Player;
  winner: Player | 'draw' | null;
  p1: { name: string, symbol: Player };
  p2: { name: string, symbol: Player };
};

const winningCombos = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6],           // Diagonals
];

const checkWinner = (currentBoard: Board): Player | 'draw' | null => {
    for (const combo of winningCombos) {
      const [a, b, c] = combo;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return currentBoard[a];
      }
    }
    if (currentBoard.every(cell => cell !== null)) {
      return 'draw';
    }
    return null;
};

const VsAIGame: React.FC = () => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');

   const handlePlayerMove = (index: number) => {
    if (board[index] || !isPlayerTurn || winner) return;
    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    const gameWinner = checkWinner(newBoard);
    if (gameWinner) setWinner(gameWinner);
    else setIsPlayerTurn(false);
  };

  useEffect(() => {
    if (!isPlayerTurn && !winner) {
      const timeoutId = setTimeout(() => {
        const availableMoves = board.map((cell, index) => cell === null ? index : null).filter(val => val !== null) as number[];
        if (availableMoves.length === 0) return;
        
        let move: number;
        // Simple AI logic
        if (difficulty === 'Easy') {
            move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        } else { // Medium/Hard AI
            // Check for winning move
            let winningMove = -1;
            for(const m of availableMoves) {
                const nextBoard = [...board]; nextBoard[m] = 'O';
                if(checkWinner(nextBoard) === 'O') { winningMove = m; break; }
            }
            if(winningMove !== -1) move = winningMove;
            else {
                // Check for blocking move
                let blockingMove = -1;
                for(const m of availableMoves) {
                    const nextBoard = [...board]; nextBoard[m] = 'X';
                    if(checkWinner(nextBoard) === 'X') { blockingMove = m; break; }
                }
                if(blockingMove !== -1) move = blockingMove;
                else { // Medium: random, Hard: strategic
                    if (difficulty === 'Hard' && availableMoves.includes(4)) move = 4;
                    else if (difficulty === 'Hard') {
                        const corners = [0,2,6,8].filter(i => availableMoves.includes(i));
                        if(corners.length > 0) move = corners[Math.floor(Math.random() * corners.length)];
                        else move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
                    }
                    else move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
                }
            }
        }
        
        const newBoard = [...board];
        newBoard[move] = 'O';
        setBoard(newBoard);
        const gameWinner = checkWinner(newBoard);
        if (gameWinner) setWinner(gameWinner);
        else setIsPlayerTurn(true);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [isPlayerTurn, board, winner, difficulty]);
  
  const restartGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setWinner(null);
  };
  
  const status = winner ? (winner === 'draw' ? "It's a Draw!" : `${winner} Wins!`) : (isPlayerTurn ? "Your Turn (X)" : "AI's Turn (O)");

  return (
    <div className="flex flex-col items-center gap-4">
        <div className="grid grid-cols-3 gap-2">
            {board.map((cell, index) => (
            <button key={index} onClick={() => handlePlayerMove(index)}
                className={cn("w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center text-4xl font-bold rounded-lg transition-colors", "bg-muted hover:bg-muted/80", !cell && !winner && isPlayerTurn && "cursor-pointer", cell || winner || !isPlayerTurn ? "cursor-not-allowed" : "")} disabled={!!cell || !!winner || !isPlayerTurn}>
                {cell === 'X' && <X className="w-12 h-12 text-blue-400" />}
                {cell === 'O' && <Circle className="w-12 h-12 text-yellow-400" />}
            </button>
            ))}
        </div>
        <p className="text-lg font-semibold h-8">{status}</p>
        <div className="flex gap-2 items-center">
            <Label>AI Difficulty</Label>
            <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}><SelectTrigger className="w-32"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Easy">Easy</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Hard">Hard</SelectItem></SelectContent></Select>
        </div>
        <Button onClick={restartGame} variant="outline"><RefreshCw className="mr-2 h-4 w-4" />New Game</Button>
    </div>
  );
};


const MultiplayerGame = ({ sessionId, playerRole, playerName, onGameOver }: { sessionId: string; playerRole: 'p1' | 'p2', playerName: string, onGameOver: (winner: Player | 'draw') => void }) => {
    const db = useDatabase();
    const gameRef = useMemo(() => db ? ref(db, `games/tic-tac-toe/${sessionId}`) : null, [db, sessionId]);
    const { data: gameState } = useDatabaseObject<GameSession>(gameRef);

    const handlePlayerMove = (index: number) => {
        if (!gameState || gameState.winner || gameState.board[index] !== null) return;
        const mySymbol = playerRole === 'p1' ? gameState.p1.symbol : gameState.p2.symbol;
        if (gameState.currentPlayer !== mySymbol) return;

        const newBoard = [...gameState.board];
        newBoard[index] = mySymbol;
        
        const winner = checkWinner(newBoard);
        const updates: Partial<GameSession> = {
            board: newBoard,
            currentPlayer: mySymbol === 'X' ? 'O' : 'X',
            winner: winner
        };

        if (winner) {
            onGameOver(winner);
        }

        if(gameRef) update(gameRef, updates);
    };
    
    if(!gameState) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin"/>Loading game...</div>;

    const mySymbol = playerRole === 'p1' ? gameState.p1.symbol : gameState.p2.symbol;
    const isMyTurn = !gameState.winner && gameState.currentPlayer === mySymbol;
    const opponentName = playerRole === 'p1' ? gameState.p2.name : gameState.p1.name;
    const status = gameState.winner ? (gameState.winner === 'draw' ? "It's a Draw!" : `${gameState.winner === mySymbol ? 'You Win!' : `${opponentName} Wins!`}`) : (isMyTurn ? "Your Turn" : "Opponent's Turn");

    return (
        <div className="flex flex-col items-center gap-4">
             <div className="grid grid-cols-3 gap-2">
                {gameState.board.map((cell, index) => (
                    <button key={index} onClick={() => handlePlayerMove(index)}
                        className={cn("w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center text-4xl font-bold rounded-lg transition-colors", "bg-muted hover:bg-muted/80", !cell && !gameState.winner && isMyTurn && "cursor-pointer", cell || gameState.winner || !isMyTurn ? "cursor-not-allowed" : "")} disabled={!!cell || !!gameState.winner || !isMyTurn}>
                        {cell === 'X' && <X className="w-12 h-12 text-blue-400" />}
                        {cell === 'O' && <Circle className="w-12 h-12 text-yellow-400" />}
                    </button>
                ))}
            </div>
             <p className="text-lg font-semibold h-8">{status}</p>
        </div>
    )
}

const TicTacToe: React.FC = () => {
    const [gameMode, setGameMode] = useState<GameMode>('ai');
    const [multiplayerSession, setMultiplayerSession] = useState<{ id: string; role: 'p1' | 'p2' } | null>(null);
    const [playerName, setPlayerName] = useState('');
    const db = useDatabase();
    
    useEffect(() => {
        let name = localStorage.getItem('playerName');
        if (!name) {
            name = `Player_${faker.string.hexadecimal({ length: 4, casing: 'upper' })}`;
            localStorage.setItem('playerName', name);
        }
        setPlayerName(name);
    }, []);

    const handleGameStart = (sessionId: string, playerRole: 'p1' | 'p2') => {
        const opponentName = `Opponent_${faker.string.hexadecimal({ length: 4, casing: 'upper' })}`;
        const gameRef = ref(db, `games/tic-tac-toe/${sessionId}`);

        // P1 sets up the initial game state, P2 will just join
        if(playerRole === 'p1') {
            const initialGame: GameSession = {
                board: Array(9).fill(null),
                currentPlayer: 'X',
                winner: null,
                p1: { name: playerName, symbol: 'X' },
                p2: { name: opponentName, symbol: 'O' } // Placeholder for now
            };
            set(gameRef, initialGame);
        }

        setMultiplayerSession({ id: sessionId, role: playerRole });
    };

    const handleGameOver = (winner: Player | 'draw') => {
        if(db && winner !== 'draw') {
             const winnerName = winner === (multiplayerSession?.role === 'p1' ? 'X' : 'O') ? playerName : "Opponent"; // Simplified
             const playerRef = ref(db, `leaderboards/tic-tac-toe/${winnerName}`);
             runTransaction(playerRef, (currentData) => {
                 if (currentData === null) {
                     return { name: winnerName, wins: 1 };
                 } else {
                     return { ...currentData, wins: (currentData.wins || 0) + 1 };
                 }
             });
        }
        setTimeout(() => setMultiplayerSession(null), 5000); // Go back to lobby after 5s
    };
  
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-lg mx-auto shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold text-primary">Tic-Tac-Toe</CardTitle>
        </CardHeader>
        <CardContent>
            <Tabs value={gameMode} onValueChange={(v) => {setGameMode(v as GameMode); setMultiplayerSession(null);}} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="ai"><Bot className="mr-2"/>vs AI</TabsTrigger>
                    <TabsTrigger value="multiplayer"><Swords className="mr-2"/>Multiplayer</TabsTrigger>
                    <TabsTrigger value="leaderboard"><Trophy className="mr-2"/>Leaderboard</TabsTrigger>
                </TabsList>
                <TabsContent value="ai" className="pt-4"><VsAIGame /></TabsContent>
                <TabsContent value="multiplayer" className="pt-4">
                    {multiplayerSession ? 
                        <MultiplayerGame sessionId={multiplayerSession.id} playerRole={multiplayerSession.role} playerName={playerName} onGameOver={handleGameOver}/> : 
                        <MultiplayerLobby gameId="tic-tac-toe" playerName={playerName} onGameStart={handleGameStart}/>
                    }
                </TabsContent>
                 <TabsContent value="leaderboard" className="pt-4 h-96">
                    <Leaderboard gameId="tic-tac-toe" scoreLabel="Wins" />
                 </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TicTacToe;
