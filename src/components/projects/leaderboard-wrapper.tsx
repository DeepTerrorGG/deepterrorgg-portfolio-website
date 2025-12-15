
'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Leaderboard, LeaderboardEntry } from '@/components/leaderboard';
import { useDatabase } from '@/firebase';
import { ref, set, serverTimestamp } from 'firebase/database';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import { User, Save } from 'lucide-react';
import { faker } from '@faker-js/faker';

interface LeaderboardWrapperProps {
  gameId: string;
  score: number | null;
  children: React.ReactNode;
  isGameOver: boolean;
}

export const LeaderboardWrapper: React.FC<LeaderboardWrapperProps> = ({ gameId, score, children, isGameOver }) => {
  const db = useDatabase();
  const { toast } = useToast();
  const [playerName, setPlayerName] = React.useState('');
  const [isEditingName, setIsEditingName] = React.useState(true);
  const [hasSubmitted, setHasSubmitted] = React.useState(false);

  React.useEffect(() => {
    const savedName = localStorage.getItem('playerName');
    if (savedName) {
      setPlayerName(savedName);
      setIsEditingName(false);
    } else {
      setPlayerName(`Player_${faker.string.hexadecimal({ length: 4, casing: 'upper' })}`);
    }
  }, []);
  
  const handleNameSave = () => {
    if (playerName.trim()) {
        localStorage.setItem('playerName', playerName.trim());
        setIsEditingName(false);
        toast({ title: 'Name Saved!', description: `You are now playing as ${playerName}.` });
    }
  }

  const submitScore = () => {
    if (!db || score === null || !playerName.trim()) return;
    const scoreData: LeaderboardEntry = { name: playerName, score };
    const scoreRef = ref(db, `leaderboards/${gameId}/${playerName}`);
    set(scoreRef, scoreData);
    setHasSubmitted(true);
    toast({ title: "Score Submitted!", description: `Your score of ${score} has been saved.` });
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
                    <p className="text-muted-foreground text-sm">Your final score: {score}</p>
                    <div className="mt-4 space-y-2">
                        <Button onClick={submitScore} className="w-full" disabled={!playerName.trim() || isEditingName}>
                            Submit Score
                        </Button>
                    </div>
                </div>
            )}
          </TabsContent>
          <TabsContent value="leaderboard" className="flex-grow">
            <Leaderboard gameId={gameId} />
          </TabsContent>
      </Tabs>
    </div>
  );
};
