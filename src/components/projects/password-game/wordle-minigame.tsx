
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const wordList = ["REACT", "CLONE", "GAMER", "DEBUG", "STYLE", "AGENT", "WORLD"];

// Simple seeded random to get the same word for the same day
const getWordForDay = () => {
    const today = new Date();
    const dayIndex = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return wordList[dayIndex % wordList.length];
};

export const getTodaysWordleSolution = getWordForDay;

let isSolved = false;
export const isWordleSolved = () => isSolved;

export const WordleMinigame = () => {
  const { toast } = useToast();
  const solution = useMemo(() => getWordForDay(), []);
  const [guesses, setGuesses] = useState<string[]>(Array(6).fill(''));
  const [evaluations, setEvaluations] = useState<('correct' | 'present' | 'absent')[][]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [activeRow, setActiveRow] = useState(0);
  const [isWon, setIsWon] = useState(false);

  useEffect(() => {
    isSolved = isWon;
  }, [isWon]);
  
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (isWon || activeRow > 5) return;

    if (e.key === 'Enter') {
      if (currentGuess.length === 5) {
        if (!wordList.includes(currentGuess.toUpperCase())) {
            toast({ title: "Not in word list", variant: "destructive" });
            return;
        }
        const newGuesses = [...guesses];
        newGuesses[activeRow] = currentGuess;
        setGuesses(newGuesses);

        const newEval = currentGuess.split('').map((char, index) => {
            if (solution[index] === char) return 'correct';
            if (solution.includes(char)) return 'present';
            return 'absent';
        });
        setEvaluations(prev => [...prev, newEval]);
        
        if (currentGuess === solution) {
          setIsWon(true);
          toast({ title: 'Wordle Solved!', description: `The word was ${solution}` });
        }
        
        setActiveRow(prev => prev + 1);
        setCurrentGuess('');
      }
    } else if (e.key === 'Backspace') {
      setCurrentGuess(g => g.slice(0, -1));
    } else if (currentGuess.length < 5 && /^[a-zA-Z]$/.test(e.key)) {
      setCurrentGuess(g => (g + e.key).toUpperCase());
    }
  }, [currentGuess, activeRow, isWon, solution, guesses, toast]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return (
    <div className="bg-muted/30 p-4 rounded-md">
      <div className="grid grid-rows-6 gap-1.5 mx-auto w-fit">
        {Array(6).fill(0).map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-5 gap-1.5">
            {Array(5).fill(0).map((_, colIndex) => {
              const char = rowIndex === activeRow ? currentGuess[colIndex] : guesses[rowIndex]?.[colIndex];
              const evalState = evaluations[rowIndex]?.[colIndex];

              return (
                <div
                  key={colIndex}
                  className={cn(
                    'w-10 h-10 sm:w-12 sm:h-12 border-2 flex items-center justify-center text-xl sm:text-2xl font-bold transition-all duration-300',
                    char ? 'border-border' : 'border-border/50',
                    evalState === 'correct' && 'bg-green-600 border-green-600 text-white',
                    evalState === 'present' && 'bg-yellow-500 border-yellow-500 text-white',
                    evalState === 'absent' && 'bg-zinc-700 border-zinc-700 text-white',
                  )}
                >
                  {char}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {isWon && <p className="text-center text-sm mt-2 text-green-400">The password rule is now satisfied.</p>}
    </div>
  );
};
