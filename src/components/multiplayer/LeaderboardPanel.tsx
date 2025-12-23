'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Medal, TrendingUp, User, RefreshCw } from 'lucide-react';
import { ref, onValue, query, orderByChild, limitToLast } from 'firebase/database';
import { useDatabase } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LeaderboardMetric {
    key: string;
    label: string;
    format?: (value: number) => string;
}

interface LeaderboardPanelProps {
    gameId: string;
    metrics: LeaderboardMetric[];
    currentPlayerId?: string;
    limit?: number;
}

interface PlayerData {
    name: string;
    [key: string]: any;
}

export const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({
    gameId,
    metrics,
    currentPlayerId,
    limit = 100
}) => {
    const db = useDatabase();
    const [leaderboards, setLeaderboards] = useState<Record<string, [string, PlayerData][]>>({});
    const [loading, setLoading] = useState(true);
    const [selectedMetric, setSelectedMetric] = useState(metrics[0]?.key || '');

    useEffect(() => {
        if (!db) {
            console.log('[Leaderboard] No database connection');
            setLoading(false);
            return;
        }

        console.log(`[Leaderboard] Setting up listeners for game: ${gameId}`);
        const unsubscribes: (() => void)[] = [];

        metrics.forEach((metric) => {
            const leaderboardRef = query(
                ref(db, `leaderboards/${gameId}/players`),
                orderByChild(metric.key),
                limitToLast(limit)
            );

            const unsubscribe = onValue(
                leaderboardRef,
                (snapshot) => {
                    console.log(`[Leaderboard] Data received for ${metric.key}:`, snapshot.exists());
                    if (snapshot.exists()) {
                        const data = snapshot.val();
                        const sorted = Object.entries(data)
                            .map(([id, player]) => [id, player as PlayerData])
                            .sort((a, b) => (b[1][metric.key] || 0) - (a[1][metric.key] || 0));

                        setLeaderboards((prev) => ({
                            ...prev,
                            [metric.key]: sorted
                        }));
                    } else {
                        console.log(`[Leaderboard] No data for ${metric.key}`);
                        setLeaderboards((prev) => ({
                            ...prev,
                            [metric.key]: []
                        }));
                    }
                    setLoading(false);
                },
                (error) => {
                    console.error('[Leaderboard] Firebase error:', error);
                    setLoading(false);
                }
            );

            unsubscribes.push(unsubscribe);
        });

        return () => unsubscribes.forEach((unsub) => unsub());
    }, [db, gameId, metrics, limit]);

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
        if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
        if (rank === 3) return <Medal className="w-5 h-5 text-amber-700" />;
        return <span className="w-5 text-center text-sm font-bold text-muted-foreground">#{rank}</span>;
    };

    const formatValue = (value: number, metric: LeaderboardMetric) => {
        if (metric.format) return metric.format(value);
        return value.toLocaleString();
    };

    const currentMetric = metrics.find((m) => m.key === selectedMetric) || metrics[0];
    const currentData = leaderboards[selectedMetric] || [];

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Global Leaderboard
                </CardTitle>
            </CardHeader>
            <CardContent>
                {metrics.length > 1 ? (
                    <Tabs value={selectedMetric} onValueChange={setSelectedMetric} className="w-full">
                        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${metrics.length}, 1fr)` }}>
                            {metrics.map((metric) => (
                                <TabsTrigger key={metric.key} value={metric.key} className="text-xs sm:text-sm">
                                    {metric.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        {metrics.map((metric) => (
                            <TabsContent key={metric.key} value={metric.key}>
                                {renderLeaderboardContent()}
                            </TabsContent>
                        ))}
                    </Tabs>
                ) : (
                    renderLeaderboardContent()
                )}
            </CardContent>
        </Card>
    );

    function renderLeaderboardContent() {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
            );
        }

        if (currentData.length === 0) {
            return (
                <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No players yet. Be the first!</p>
                </div>
            );
        }

        return (
            <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                    {currentData.map(([playerId, player], index) => {
                        const rank = index + 1;
                        const isCurrentPlayer = playerId === currentPlayerId;

                        return (
                            <div
                                key={playerId}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-lg transition-colors",
                                    isCurrentPlayer
                                        ? "bg-primary/10 border-2 border-primary"
                                        : "bg-muted/50 hover:bg-muted"
                                )}
                            >
                                <div className="flex-shrink-0 w-8">
                                    {getRankIcon(rank)}
                                </div>
                                <div className="flex-grow min-w-0">
                                    <div className="flex items-center gap-2">
                                        {isCurrentPlayer && <User className="w-3 h-3 text-primary" />}
                                        <p className={cn(
                                            "font-medium truncate",
                                            isCurrentPlayer && "text-primary"
                                        )}>
                                            {player.name || 'Anonymous'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg">
                                        {formatValue(player[currentMetric.key] || 0, currentMetric)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>
        );
    }
};
