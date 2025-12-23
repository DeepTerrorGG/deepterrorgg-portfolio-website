'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, User, Bot, Award, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerNameModal } from '@/components/multiplayer/PlayerNameModal';
import { LeaderboardPanel } from '@/components/multiplayer/LeaderboardPanel';
import { submitScore, formatters } from '@/lib/firebase/leaderboards';
import { useDatabase } from '@/firebase/provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

type Player = 'red' | 'yellow';
const ROWS = 6;
const COLS = 7;

const ConnectFour: React.FC = () => {
  const [board, setBoard] = useState<(Player | null)[][]>(() => Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('red');
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Multiplayer
  const [playerName, setPlayerName] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [showNameModal, setShowNameModal] = useState(false);
  const [wins, setWins] = useState(0);
  const [totalGames, setTotalGames] = useState(0);
  const db = useDatabase();

  useEffect(() => {
    const savedName = localStorage.getItem('player_name');
    const savedId = localStorage.getItem('player_id');
    if (savedName && savedId) {
      setPlayerName(savedName);
      setPlayerId(savedId);
    } else {
      setShowNameModal(true);
    }
    const saved = localStorage.getItem('connectfour_stats');
    if (saved) {
      const stats = JSON.parse(saved);
      setWins(stats.wins || 0);
      setTotalGames(stats.totalGames || 0);
    }
  }, []);

  const checkWinner = useCallback((currentBoard: (Player | null)[][]): Player | 'draw' | null => {
    // Check horizontal
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        if (currentBoard[r][c] && currentBoard[r][c] === currentBoard[r][c + 1] && currentBoard[r][c] === currentBoard[r][c + 2] && currentBoard[r][c] === currentBoard[r][c + 3]) {
          return currentBoard[r][c];
        }
      }
    }
    // Check vertical
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 0; c < COLS; c++) {
        if (currentBoard[r][c] && currentBoard[r][c] === currentBoard[r + 1][c] && currentBoard[r][c] === currentBoard[r + 2][c] && currentBoard[r][c] === currentBoard[r + 3][c]) {
          return currentBoard[r][c];
        }
      }
    }
    // Check diagonal (down-right)
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        if (currentBoard[r][c] && currentBoard[r][c] === currentBoard[r + 1][c + 1] && currentBoard[r][c] === currentBoard[r + 2][c + 2] && currentBoard[r][c] === currentBoard[r + 3][c + 3]) {
          return currentBoard[r][c];
        }
      }
    }
    // Check diagonal (up-right)
    for (let r = 3; r < ROWS; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        if (currentBoard[r][c] && currentBoard[r][c] === currentBoard[r - 1][c + 1] && currentBoard[r][c] === currentBoard[r - 2][c + 2] && currentBoard[r][c] === currentBoard[r - 3][c + 3]) {
          return currentBoard[r][c];
        }
      }
    }
    // Check for draw
    if (currentBoard.every(row => row.every(cell => cell !== null))) {
      return 'draw';
    }
    return null;
  }, []);

  const makeMove = useCallback((colIndex: number, player: Player) => {
    if (gameOver) return;

    let newBoard = board.map(row => [...row]);

    for (let r = ROWS - 1; r >= 0; r--) {
      if (newBoard[r][colIndex] === null) {
        newBoard[r][colIndex] = player;
        setBoard(newBoard);

        const gameWinner = checkWinner(newBoard);
        if (gameWinner) {
          setWinner(gameWinner);
          setGameOver(true);

          // Update stats
          const newTotal = totalGames + 1;
          const newWins = gameWinner === 'red' ? wins + 1 : wins;
          setTotalGames(newTotal);
          setWins(newWins);
          localStorage.setItem('connectfour_stats', JSON.stringify({ wins: newWins, totalGames: newTotal }));

          // Submit to leaderboard
          if (db && playerName && playerId) {
            submitScore(db, 'connect-four', playerId, playerName, {
              wins: newWins,
              totalGames: newTotal,
              winRate: newTotal > 0 ? Math.round((newWins / newTotal) * 100) : 0
            }).catch(err => console.error('Failed to submit score:', err));
          }
        } else {
          setCurrentPlayer(prev => (prev === 'red' ? 'yellow' : 'red'));
        }
        return;
      }
    }
  }, [board, gameOver, checkWinner]);


  const handlePlayerClick = (colIndex: number) => {
    if (gameOver || currentPlayer !== 'red' || isAiThinking || board[0][colIndex] !== null) return;
    makeMove(colIndex, 'red');
  };

  const getAiMove = useCallback(() => {
    const validMoves = Array.from({ length: COLS }, (_, i) => i).filter(col => board[0][col] === null);

    // 1. Check for winning move
    for (const move of validMoves) {
      const tempBoard = board.map(r => [...r]);
      for (let r = ROWS - 1; r >= 0; r--) {
        if (tempBoard[r][move] === null) {
          tempBoard[r][move] = 'yellow';
          if (checkWinner(tempBoard) === 'yellow') return move;
          break;
        }
      }
    }
    // 2. Check to block player's winning move
    for (const move of validMoves) {
      const tempBoard = board.map(r => [...r]);
      for (let r = ROWS - 1; r >= 0; r--) {
        if (tempBoard[r][move] === null) {
          tempBoard[r][move] = 'red';
          if (checkWinner(tempBoard) === 'red') return move;
          break;
        }
      }
    }
    // 3. Prefer center columns
    const centerMoves = [3, 4, 2, 5, 1, 6, 0].filter(m => validMoves.includes(m));
    if (centerMoves.length > 0) return centerMoves[0];

    // 4. Random move as fallback
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }, [board, checkWinner]);

  useEffect(() => {
    if (currentPlayer === 'yellow' && !gameOver) {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        const aiMove = getAiMove();
        if (aiMove !== undefined) {
          makeMove(aiMove, 'yellow');
        }
        setIsAiThinking(false);
      }, 800); // AI "thinking" delay
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, gameOver, getAiMove, makeMove]);

  const restartGame = () => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
    setCurrentPlayer('red');
    setWinner(null);
    setGameOver(false);
    setIsAiThinking(false);
  };

  const getStatusMessage = () => {
    if (winner) {
      if (winner === 'draw') return "It's a Draw!";
      return `${winner === 'red' ? 'You' : 'Bot'} Win!`;
    }
    if (isAiThinking) return "Bot is thinking...";
    return `${currentPlayer === 'red' ? 'Your' : 'Bot'}'s Turn`;
  };

  const handleNameSubmit = (name: string, id: string) => {
    setPlayerName(name);
    setPlayerId(id);
    setShowNameModal(false);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-2xl mx-auto shadow-2xl bg-muted/30">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Connect 4 vs. Bot</CardTitle>
          <div className={cn("text-xl font-semibold h-8 flex items-center justify-center gap-2",
            winner === 'red' && 'text-green-400',
            winner === 'yellow' && 'text-red-500',
            winner === 'draw' && 'text-yellow-400'
          )}>
            {winner && winner !== 'draw' && <Award />}
            {getStatusMessage()}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="grid" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
              {Array.from({ length: COLS }).map((_, colIndex) => (
                <div
                  key={colIndex}
                  className="h-full w-12 cursor-pointer group"
                  onClick={() => handlePlayerClick(colIndex)}
                >
                  <div className="h-12 w-full flex items-center justify-center">
                    <AnimatePresence>
                      {currentPlayer === 'red' && !gameOver && !isAiThinking && board[0][colIndex] === null && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="h-10 w-10 mx-auto rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 bg-red-500/30"
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute top-12 left-0 right-0 p-2 bg-blue-800 rounded-lg grid gap-1" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div key={`${rowIndex}-${colIndex}`} className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center">
                    <AnimatePresence>
                      {cell && (
                        <motion.div
                          initial={{ scale: 0, y: -200 }}
                          animate={{ scale: 1, y: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 15 }}
                          className={cn(
                            "w-10 h-10 rounded-full",
                            cell === 'red' ? 'bg-red-500' : 'bg-yellow-400'
                          )}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                ))
              )}
            </div>
          </div>

          <Button onClick={restartGame} variant="outline" className="mt-[32rem]">
            <RefreshCw className="mr-2 h-4 w-4" />
            New Game
          </Button>
        </CardContent>
      </Card>

      <PlayerNameModal
        isOpen={showNameModal}
        onNameSubmit={handleNameSubmit}
        gameName="Connect Four"
        description="Enter your name to track your wins on the global leaderboard!"
      />

      <Card className="w-full max-w-2xl mx-auto mt-6 shadow-2xl">
        <Tabs defaultValue="stats">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="leaderboard"><Trophy className="mr-2 h-4 w-4" />Leaderboard</TabsTrigger>
          </TabsList>
          <TabsContent value="stats" className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div><p className="text-2xl font-bold text-green-400">{wins}</p><p className="text-xs">Wins</p></div>
              <div><p className="text-2xl font-bold">{totalGames}</p><p className="text-xs">Games</p></div>
              <div><p className="text-2xl font-bold text-yellow-400">{totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0}%</p><p className="text-xs">Win Rate</p></div>
            </div>
          </TabsContent>
          <TabsContent value="leaderboard" className="p-4">
            <LeaderboardPanel
              gameId="connect-four"
              currentPlayerId={playerId}
              metrics={[
                { key: 'wins', label: 'Wins', format: formatters.number },
                { key: 'winRate', label: 'Win Rate', format: (v) => `${v}%` },
                { key: 'totalGames', label: 'Games Played', format: formatters.number }
              ]}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default ConnectFour;
