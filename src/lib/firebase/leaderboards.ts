import { ref, set, runTransaction, serverTimestamp, get } from 'firebase/database';
import { Database } from 'firebase/database';

/**
 * Submit a player's score to the leaderboard
 */
export async function submitScore(
    db: Database,
    gameId: string,
    playerId: string,
    playerName: string,
    metrics: Record<string, number>
): Promise<void> {
    const playerRef = ref(db, `leaderboards/${gameId}/players/${playerId}`);

    await set(playerRef, {
        name: playerName,
        ...metrics,
        updatedAt: serverTimestamp()
    });
}

/**
 * Update a player's score (merge with existing data)
 */
export async function updateScore(
    db: Database,
    gameId: string,
    playerId: string,
    playerName: string,
    metrics: Record<string, number>
): Promise<void> {
    const playerRef = ref(db, `leaderboards/${gameId}/players/${playerId}`);

    await runTransaction(playerRef, (current) => {
        if (current === null) {
            return {
                name: playerName,
                ...metrics,
                updatedAt: serverTimestamp()
            };
        }

        return {
            ...current,
            name: playerName,
            ...Object.entries(metrics).reduce((acc, [key, value]) => {
                // Update only if new value is higher (for most metrics)
                acc[key] = Math.max(current[key] || 0, value);
                return acc;
            }, {} as Record<string, number>),
            updatedAt: serverTimestamp()
        };
    });
}

/**
 * Get a player's rank for a specific metric
 */
export async function getPlayerRank(
    db: Database,
    gameId: string,
    playerId: string,
    sortBy: string
): Promise<number | null> {
    const leaderboardRef = ref(db, `leaderboards/${gameId}/players`);
    const snapshot = await get(leaderboardRef);

    if (!snapshot.exists()) return null;

    const players = snapshot.val();
    const playerScore = players[playerId]?.[sortBy] || 0;

    const rank = Object.values(players)
        .filter((player: any) => (player[sortBy] || 0) > playerScore)
        .length + 1;

    return rank;
}

/**
 * Format common metric types
 */
export const formatters = {
    number: (value: number) => value.toLocaleString(),
    percentage: (value: number) => `${value.toFixed(1)}%`,
    time: (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },
    abbreviated: (value: number) => {
        if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
        if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
        if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
        return value.toString();
    }
};
