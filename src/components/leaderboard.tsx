
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDatabase, useDatabaseObjectList } from '@/firebase';
import { query, orderByChild, limitToLast, ref } from 'firebase/database';

export interface LeaderboardEntry {
  name: string;
  score?: number;
  wins?: number;
}

interface LeaderboardProps {
  gameId: string;
  scoreLabel?: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ gameId, scoreLabel = "Score" }) => {
    const db = useDatabase();
    
    const sortField = scoreLabel === "Wins" ? "wins" : "score";
    
    const leaderboardQuery = React.useMemo(() => {
        if (!db) return null;
        return query(ref(db, `leaderboards/${gameId}`), orderByChild(sortField), limitToLast(100));
    }, [db, gameId, sortField]);

    const { data: scoresData, isLoading } = useDatabaseObjectList<LeaderboardEntry>(leaderboardQuery);

    const scores = React.useMemo(() => {
        if (!scoresData) return [];
        return Object.values(scoresData).sort((a, b) => ((b as any)[sortField] || 0) - ((a as any)[sortField] || 0));
    }, [scoresData, sortField]);


    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="text-xl text-center flex items-center justify-center gap-2"><Trophy className="text-yellow-400"/>Leaderboard</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                ) : scores.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p>No scores submitted yet.</p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        <AnimatePresence>
                        {scores.slice(0, 10).map((entry, index) => (
                            <motion.li
                                key={entry.name + index}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.3 }}
                                className="flex items-center gap-4 p-2 rounded-md bg-muted/40"
                            >
                                <div className="w-8 text-center text-lg font-bold flex items-center justify-center">
                                    {index === 0 ? <Trophy className="text-yellow-400" /> : index + 1}
                                </div>
                                <div className="flex-grow">
                                    <p className="font-semibold truncate">{entry.name}</p>
                                </div>
                                <div className="font-mono font-bold text-lg text-primary">
                                    {((entry as any)[sortField] || 0).toLocaleString()}
                                </div>
                            </motion.li>
                        ))}
                        </AnimatePresence>
                    </ul>
                )}
            </CardContent>
        </Card>
    );
};
