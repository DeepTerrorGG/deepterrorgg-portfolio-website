export type RateLimitOptions = {
    uniqueTokenPerInterval?: number;
    interval?: number;
};

export function rateLimit(options?: RateLimitOptions) {
    const tokenCache = new Map<string, number[]>();
    let lastCleanup = Date.now();
    const cleanupInterval = options?.interval || 60000;
    const maxTokens = options?.uniqueTokenPerInterval || 500;

    return {
        check: (limit: number, token: string) =>
            new Promise<void>((resolve, reject) => {
                const now = Date.now();

                // Cleanup logic: If it's been longer than the interval since last cleanup, clear the cache.
                // This is a simplified "window" approach suitable for this scale.
                if (now - lastCleanup > cleanupInterval) {
                    tokenCache.clear();
                    lastCleanup = now;
                }

                // If cache is getting too big (DoS protection for the cache itself), clear it
                if (tokenCache.size > maxTokens) {
                    tokenCache.clear();
                    lastCleanup = now;
                }

                const tokenCount = tokenCache.get(token) || [0];
                if (tokenCount[0] === 0) {
                    tokenCache.set(token, tokenCount);
                }
                tokenCount[0] += 1;

                const currentUsage = tokenCount[0];

                if (currentUsage > limit) {
                    reject();
                } else {
                    resolve();
                }
            }),
    };
}
