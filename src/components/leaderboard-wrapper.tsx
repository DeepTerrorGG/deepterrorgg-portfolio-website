
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Leaderboard, LeaderboardEntry } from '@/components/leaderboard';
import { useDatabase } from '@/firebase';
import { ref, set, serverTimestamp, onValue, off } from 'firebase/database';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
import { User, Save } from 'lucide-react';
import { faker } from '@faker-js/faker';

interface LeaderboardWrapperProps {
  gameId: string;
  score: number | null;
  children: React.ReactNode;
  isGameOver: boolean;
  scoreLabel?: string;
}

// Generates and stores a unique ID for the user in localStorage
const getUserId = () => {
    if (typeof window === 'undefined') return null;
    let userId = localStorage.getItem('gameUserId');
    if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('gameUserId', userId);
    }
    return userId;
}

export const LeaderboardWrapper: React.FC<LeaderboardWrapperProps> = ({ gameId, score, children, isGameOver, scoreLabel }) => {
  const db = useDatabase();
  const { toast } = useToast();
  const [playerName, setPlayerName] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [userId] = useState(getUserId());

  // Effect to fetch and listen for player name changes in Firebase
  useEffect(() => {
    if (!db || !userId) return;

    const nameRef = ref(db, `players/${userId}/name`);
    const listener = onValue(nameRef, (snapshot) => {
        const name = snapshot.val();
        if (name) {
            setPlayerName(name);
        } else {
            // If no name in DB, create a default one and save it
            const defaultName = `Player_${faker.string.hexadecimal({ length: 4, casing: 'upper' })}`;
            set(nameRef, defaultName);
            setPlayerName(defaultName);
        }
    });

    return () => off(nameRef, 'value', listener);
  }, [db, userId]);
  
  const handleNameSave = () => {
    if (!db || !userId || !playerName.trim()) {
        toast({ title: "Name cannot be empty.", variant: "destructive" });
        return;
    };
    const nameRef = ref(db, `players/${userId}/name`);
    set(nameRef, playerName.trim());
    toast({ title: 'Name Saved!', description: `You are now playing as ${playerName}.` });
  }

  const submitScore = () => {
    if (!db || score === null || !playerName.trim() || !userId) return;
    
    let scoreData: LeaderboardEntry;
    if (scoreLabel === 'Wins') {
        scoreData = { name: playerName, wins: score };
    } else {
        scoreData = { name: playerName, score: score };
    }
    
    const scoreRef = ref(db, `leaderboards/${gameId}/${userId}`);
    set(scoreRef, scoreData);
    setHasSubmitted(true);
    toast({ title: "Score Submitted!", description: `Your score has been saved.` });
  };


  return (
    <div className="w-full h-full flex flex-col">
       <div className="flex justify-center items-center gap-2 p-2 px-4 border-b">
         <User className="h-4 w-4"/>
         <Input className="h-8 text-sm w-48 bg-transparent border-0 focus-visible:ring-0" placeholder="Enter your name" value={playerName} onChange={e => setPlayerName(e.target.value)} />
         <Button size="sm" onClick={handleNameSave}>Save Name</Button>
       </div>
      <Tabs defaultValue="game" className="flex-grow flex flex-col">
          <div className="flex justify-center p-2">
            <TabsList>
              <TabsTrigger value="game">Game</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="game" className="flex-grow">
            {children}
            {isGameOver && score !== null && !hasSubmitted && (
                <div className="absolute bottom-4 right-4 bg-card p-4 rounded-lg shadow-lg border border-primary z-10 w-80">
                    <h3 className="font-bold text-lg">Game Over! Submit Your Score?</h3>
                    <p className="text-muted-foreground text-sm">Your final {scoreLabel?.toLowerCase() || 'score'}: {score}</p>
                    <div className="mt-4 space-y-2">
                        <Button onClick={submitScore} className="w-full" disabled={!playerName.trim()}>
                            Submit Score
                        </Button>
                    </div>
                </div>
            )}
          </TabsContent>
          <TabsContent value="leaderboard" className="flex-grow">
            <Leaderboard gameId={gameId} scoreLabel={scoreLabel} />
          </TabsContent>
      </Tabs>
    </div>
  );
};
