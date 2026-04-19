'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerNameModal } from '@/components/multiplayer/PlayerNameModal';
import { LeaderboardPanel } from '@/components/multiplayer/LeaderboardPanel';
import { submitScore, formatters } from '@/lib/firebase/leaderboards';
import { useDatabase } from '@/firebase/provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

type Player = 'white' | 'grey';
const ROWS = 6;
const COLS = 7;

const ConnectFour: React.FC = () => {
  const [board, setBoard] = useState<(Player | null)[][]>(() =>
    Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState<Player>('white');
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  const [playerName, setPlayerName] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [showNameModal, setShowNameModal] = useState(false);
  const [wins, setWins] = useState(0);
  const [totalGames, setTotalGames] = useState(0);
  const db = useDatabase();

  useEffect(() => {
    const savedName = localStorage.getItem('player_name');
    const savedId = localStorage.getItem('player_id');
    if (savedName && savedId) { setPlayerName(savedName); setPlayerId(savedId); }
    else setShowNameModal(true);
    const saved = localStorage.getItem('connectfour_stats');
    if (saved) {
      const stats = JSON.parse(saved);
      setWins(stats.wins || 0);
      setTotalGames(stats.totalGames || 0);
    }
  }, []);

  const checkWinner = useCallback((b: (Player | null)[][]): Player | 'draw' | null => {
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c <= COLS - 4; c++)
        if (b[r][c] && b[r][c] === b[r][c+1] && b[r][c] === b[r][c+2] && b[r][c] === b[r][c+3]) return b[r][c];
    for (let r = 0; r <= ROWS - 4; r++)
      for (let c = 0; c < COLS; c++)
        if (b[r][c] && b[r][c] === b[r+1][c] && b[r][c] === b[r+2][c] && b[r][c] === b[r+3][c]) return b[r][c];
    for (let r = 0; r <= ROWS - 4; r++)
      for (let c = 0; c <= COLS - 4; c++)
        if (b[r][c] && b[r][c] === b[r+1][c+1] && b[r][c] === b[r+2][c+2] && b[r][c] === b[r+3][c+3]) return b[r][c];
    for (let r = 3; r < ROWS; r++)
      for (let c = 0; c <= COLS - 4; c++)
        if (b[r][c] && b[r][c] === b[r-1][c+1] && b[r][c] === b[r-2][c+2] && b[r][c] === b[r-3][c+3]) return b[r][c];
    if (b.every(row => row.every(cell => cell !== null))) return 'draw';
    return null;
  }, []);

  const makeMove = useCallback((colIndex: number, player: Player) => {
    if (gameOver) return;
    const newBoard = board.map(row => [...row]);
    for (let r = ROWS - 1; r >= 0; r--) {
      if (newBoard[r][colIndex] === null) {
        newBoard[r][colIndex] = player;
        setBoard(newBoard);
        const gameWinner = checkWinner(newBoard);
        if (gameWinner) {
          setWinner(gameWinner);
          setGameOver(true);
          const newTotal = totalGames + 1;
          const newWins = gameWinner === 'white' ? wins + 1 : wins;
          setTotalGames(newTotal);
          setWins(newWins);
          localStorage.setItem('connectfour_stats', JSON.stringify({ wins: newWins, totalGames: newTotal }));
          if (db && playerName && playerId) {
            submitScore(db, 'connect-four', playerId, playerName, {
              wins: newWins, totalGames: newTotal,
              winRate: newTotal > 0 ? Math.round((newWins / newTotal) * 100) : 0
            }).catch(err => console.error('Failed to submit score:', err));
          }
        } else {
          setCurrentPlayer(prev => prev === 'white' ? 'grey' : 'white');
        }
        return;
      }
    }
  }, [board, gameOver, checkWinner, totalGames, wins, db, playerName, playerId]);

  const handlePlayerClick = (colIndex: number) => {
    if (gameOver || currentPlayer !== 'white' || isAiThinking || board[0][colIndex] !== null) return;
    makeMove(colIndex, 'white');
  };

  const getAiMove = useCallback(() => {
    const validMoves = Array.from({ length: COLS }, (_, i) => i).filter(col => board[0][col] === null);
    for (const move of validMoves) {
      const tempBoard = board.map(r => [...r]);
      for (let r = ROWS - 1; r >= 0; r--) {
        if (tempBoard[r][move] === null) { tempBoard[r][move] = 'grey'; if (checkWinner(tempBoard) === 'grey') return move; break; }
      }
    }
    for (const move of validMoves) {
      const tempBoard = board.map(r => [...r]);
      for (let r = ROWS - 1; r >= 0; r--) {
        if (tempBoard[r][move] === null) { tempBoard[r][move] = 'white'; if (checkWinner(tempBoard) === 'white') return move; break; }
      }
    }
    const centerMoves = [3, 4, 2, 5, 1, 6, 0].filter(m => validMoves.includes(m));
    if (centerMoves.length > 0) return centerMoves[0];
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }, [board, checkWinner]);

  useEffect(() => {
    if (currentPlayer === 'grey' && !gameOver) {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        const aiMove = getAiMove();
        if (aiMove !== undefined) makeMove(aiMove, 'grey');
        setIsAiThinking(false);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, gameOver, getAiMove, makeMove]);

  const restartGame = () => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
    setCurrentPlayer('white');
    setWinner(null);
    setGameOver(false);
    setIsAiThinking(false);
  };

  const getStatusText = () => {
    if (winner === 'draw') return "DRAW";
    if (winner === 'white') return "YOU WIN";
    if (winner === 'grey') return "BOT WINS";
    if (isAiThinking) return "BOT THINKING...";
    return currentPlayer === 'white' ? "YOUR TURN" : "BOT'S TURN";
  };

  return (
    <div className="flex flex-col items-center w-full h-full bg-[#000] p-4 sm:p-6 font-mono">

      {/* Header */}
      <div className="w-full max-w-lg mb-6 border-b border-[#1a1a1a] pb-4">
        <p className="text-[#444] text-[10px] tracking-[0.2em] uppercase mb-1">~/games</p>
        <div className="flex items-end justify-between">
          <h1 className="text-white text-xl font-semibold tracking-tight">Connect 4</h1>
          <div className="flex items-center gap-3">
            {/* Turn indicator */}
            <div className={cn(
              'w-3 h-3 rounded-full border transition-all duration-300',
              gameOver ? 'border-[#333] bg-transparent' :
              currentPlayer === 'white' ? 'bg-white border-white' : 'bg-[#444] border-[#444]'
            )} />
            <span className={cn(
              'text-[10px] tracking-widest uppercase transition-colors duration-300',
              winner ? 'text-white' : 'text-[#555]'
            )}>{getStatusText()}</span>
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="mb-6">
        {/* Drop zone row */}
        <div
          className="grid mb-1"
          style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`, gap: '4px' }}
        >
          {Array.from({ length: COLS }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="w-12 h-6 flex items-center justify-center cursor-pointer"
              onClick={() => handlePlayerClick(colIndex)}
              onMouseEnter={() => setHoveredCol(colIndex)}
              onMouseLeave={() => setHoveredCol(null)}
            >
              <AnimatePresence>
                {currentPlayer === 'white' && !gameOver && !isAiThinking && board[0][colIndex] === null && hoveredCol === colIndex && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="w-3 h-3 rounded-full bg-white"
                  />
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div
          className="grid p-1 bg-[#0d0d0d] border border-[#1a1a1a]"
          style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`, gap: '4px' }}
        >
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="w-12 h-12 bg-[#050505] border border-[#151515] flex items-center justify-center cursor-pointer"
                onClick={() => handlePlayerClick(colIndex)}
                onMouseEnter={() => setHoveredCol(colIndex)}
                onMouseLeave={() => setHoveredCol(null)}
              >
                <AnimatePresence>
                  {cell && (
                    <motion.div
                      initial={{ scale: 0, y: -120 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                      className={cn(
                        'w-9 h-9 rounded-full border',
                        cell === 'white'
                          ? 'bg-white border-white'
                          : 'bg-transparent border-[#555]'
                      )}
                    />
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-3 px-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-white border border-white" />
            <span className="text-[#444] text-[10px] tracking-widest uppercase">You</span>
          </div>
          <button
            onClick={restartGame}
            className="flex items-center gap-1.5 border border-[#222] bg-[#0a0a0a] hover:bg-white hover:text-black text-[#555] text-[10px] px-3 py-1.5 tracking-widest uppercase transition-all duration-150"
          >
            <RefreshCw className="h-3 w-3" />
            New Game
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[#444] text-[10px] tracking-widest uppercase">Bot</span>
            <div className="w-3 h-3 rounded-full bg-transparent border border-[#555]" />
          </div>
        </div>
      </div>

      {/* Stats + Leaderboard */}
      <div className="w-full max-w-lg border border-[#1a1a1a] bg-[#050505]">
        <Tabs defaultValue="stats">
          <TabsList className="w-full grid grid-cols-2 bg-transparent border-b border-[#1a1a1a] rounded-none h-auto p-0">
            <TabsTrigger
              value="stats"
              className="text-[10px] tracking-widest uppercase text-[#444] data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:border-b data-[state=active]:border-white rounded-none py-3"
            >
              Stats
            </TabsTrigger>
            <TabsTrigger
              value="leaderboard"
              className="text-[10px] tracking-widest uppercase text-[#444] data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:border-b data-[state=active]:border-white rounded-none py-3 flex items-center gap-2"
            >
              <Trophy className="h-3 w-3" />
              Leaderboard
            </TabsTrigger>
          </TabsList>
          <TabsContent value="stats" className="p-5">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-white text-2xl font-bold tabular-nums">{wins}</p>
                <p className="text-[#444] text-[10px] tracking-widest uppercase mt-1">Wins</p>
              </div>
              <div>
                <p className="text-white text-2xl font-bold tabular-nums">{totalGames}</p>
                <p className="text-[#444] text-[10px] tracking-widest uppercase mt-1">Games</p>
              </div>
              <div>
                <p className="text-white text-2xl font-bold tabular-nums">
                  {totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0}%
                </p>
                <p className="text-[#444] text-[10px] tracking-widest uppercase mt-1">Win Rate</p>
              </div>
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
      </div>

      <PlayerNameModal
        isOpen={showNameModal}
        onNameSubmit={(name, id) => { setPlayerName(name); setPlayerId(id); setShowNameModal(false); }}
        gameName="Connect Four"
        description="Enter your name to track your wins on the global leaderboard!"
      />
    </div>
  );
};

export default ConnectFour;
