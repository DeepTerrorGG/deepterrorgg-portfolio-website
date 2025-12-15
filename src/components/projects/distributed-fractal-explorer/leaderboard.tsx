
'use client';

import React, { useState, useEffect } from 'react';
import { useDatabase, useDatabaseObjectList } from '@/firebase';
import { ref, query, orderByChild, limitToLast, onValue } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface WorkerProfile {
    id: string;
    displayName: string;
    tilesCompleted: number;
}

export const Leaderboard = () => {
    const db = useDatabase();
    const [workers, setWorkers] = useState<WorkerProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!db) {
            setIsLoading(false);
            return;
        }
        
        const workersRef = ref(db, 'fractal-workers');
        const topWorkersQuery = query(workersRef, orderByChild('tilesCompleted'), limitToLast(10));
        
        const unsubscribe = onValue(topWorkersQuery, (snapshot) => {
            if (snapshot.exists()) {
                const data: WorkerProfile[] = [];
                snapshot.forEach((childSnapshot) => {
                    data.push({ id: childSnapshot.key!, ...childSnapshot.val() });
                });
                // Firebase returns ascending, so we reverse for descending order
                setWorkers(data.reverse());
            } else {
                setWorkers([]);
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Leaderboard fetch error:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [db]);


    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="text-xl text-center">Top Contributors</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                ) : workers.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p>No contributors yet. Start your worker!</p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        <AnimatePresence>
                            {workers?.map((worker, index) => (
                                <motion.li
                                    key={worker.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex items-center gap-4 p-2 rounded-md bg-muted/40"
                                >
                                    <div className="w-8 text-center text-lg font-bold flex items-center justify-center">
                                        {index === 0 ? <Crown className="text-yellow-400" /> : index + 1}
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold truncate">{worker.displayName}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {(worker.tilesCompleted || 0).toLocaleString()} tiles rendered
                                        </p>
                                    </div>
                                    {index < 3 && (
                                        <div className={`w-3 h-3 rounded-full ${
                                            index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-300' : 'bg-orange-400'
                                        }`} />
                                    )}
                                </motion.li>
                            ))}
                        </AnimatePresence>
                    </ul>
                )}
            </CardContent>
        </Card>
    );
};
